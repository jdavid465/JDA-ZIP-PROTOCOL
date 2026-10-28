-- JDA-ZIP-PROTOCOL | Initial UDE core
-- Migration: 20261028000000_initial_ude_core.sql
-- Apply this migration in the Supabase SQL Editor (or through Supabase CLI).
-- This creates the shared dictionary core; it does NOT configure billing/credits yet.

create extension if not exists pgcrypto with schema extensions;

-- 1) User profiles and trusted roles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'USER'
    check (role in ('USER', 'STAFF', 'ADMIN')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;

create policy "Users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) Canonical global dictionary entries
create sequence public.ude_global_code_seq start with 1;

create table public.ude_entries (
  id uuid primary key default gen_random_uuid(),
  global_code text not null unique
    default ('JDA-' || lpad(nextval('public.ude_global_code_seq')::text, 10, '0')),
  content text not null
    check (length(content) between 1 and 10000),
  content_hash text generated always as (
    encode(extensions.digest(convert_to(content, 'UTF8'), 'sha256'), 'hex')
  ) stored,
  content_type text not null default 'fragment'
    check (content_type in ('word', 'phrase', 'fragment', 'symbol', 'other')),
  language_code text,
  status text not null default 'active'
    check (status in ('active', 'retired')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (content_hash)
);

create index ude_entries_status_idx on public.ude_entries(status);
create index ude_entries_type_idx on public.ude_entries(content_type);

alter table public.ude_entries enable row level security;
revoke all on table public.ude_entries from anon, authenticated;
grant select on table public.ude_entries to anon, authenticated;

create policy "Anyone can read active UDE entries"
  on public.ude_entries
  for select
  to anon, authenticated
  using (status = 'active');

-- 3) User contributions enter a review queue; they do not write directly
--    into the canonical global dictionary.
create table public.ude_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null
    check (length(content) between 1 and 10000),
  content_hash text generated always as (
    encode(extensions.digest(convert_to(content, 'UTF8'), 'sha256'), 'hex')
  ) stored,
  content_type text not null default 'fragment'
    check (content_type in ('word', 'phrase', 'fragment', 'symbol', 'other')),
  language_code text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  linked_entry_id uuid references public.ude_entries(id) on delete set null,
  review_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  check (
    (status = 'pending' and reviewed_by is null and reviewed_at is null)
    or
    (status in ('approved', 'rejected') and reviewed_by is not null and reviewed_at is not null)
  )
);

create index ude_contributions_user_created_idx
  on public.ude_contributions(user_id, created_at desc);
create index ude_contributions_status_idx
  on public.ude_contributions(status);

alter table public.ude_contributions enable row level security;
revoke all on table public.ude_contributions from anon, authenticated;
grant select, insert on table public.ude_contributions to authenticated;

create policy "Users can read their own contributions"
  on public.ude_contributions
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Admins can read all contributions"
  on public.ude_contributions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'ADMIN'
    )
  );

create policy "Users can submit pending contributions"
  on public.ude_contributions
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'pending'
    and linked_entry_id is null
    and reviewed_by is null
    and reviewed_at is null
  );

-- 4) Admin-only review operations. The functions validate the caller's role
--    inside the database; browser-supplied role values are never trusted.
create or replace function public.admin_approve_ude_contribution(p_contribution_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_contribution public.ude_contributions%rowtype;
  v_entry public.ude_entries%rowtype;
begin
  if not exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'ADMIN'
  ) then
    raise exception 'Permission denied' using errcode = '42501';
  end if;

  select *
    into v_contribution
  from public.ude_contributions
  where id = p_contribution_id
  for update;

  if not found then
    raise exception 'Contribution not found';
  end if;

  if v_contribution.status <> 'pending' then
    raise exception 'Contribution has already been reviewed';
  end if;

  -- Unique content_hash makes concurrent identical submissions converge
  -- on the same canonical entry and therefore the same global code.
  insert into public.ude_entries (
    content, content_type, language_code, created_by
  )
  values (
    v_contribution.content,
    v_contribution.content_type,
    v_contribution.language_code,
    v_contribution.user_id
  )
  on conflict (content_hash) do nothing;

  select *
    into v_entry
  from public.ude_entries
  where content_hash = v_contribution.content_hash;

  -- Defensive collision check: a hash match must also be an exact content match.
  if v_entry.id is null or v_entry.content <> v_contribution.content then
    raise exception 'Content hash collision or dictionary integrity error';
  end if;

  update public.ude_contributions
  set status = 'approved',
      linked_entry_id = v_entry.id,
      reviewed_by = (select auth.uid()),
      reviewed_at = now()
  where id = p_contribution_id;

  return v_entry.global_code;
end;
$$;

create or replace function public.admin_reject_ude_contribution(
  p_contribution_id uuid,
  p_review_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'ADMIN'
  ) then
    raise exception 'Permission denied' using errcode = '42501';
  end if;

  update public.ude_contributions
  set status = 'rejected',
      review_note = p_review_note,
      reviewed_by = (select auth.uid()),
      reviewed_at = now()
  where id = p_contribution_id
    and status = 'pending';

  if not found then
    raise exception 'Pending contribution not found';
  end if;
end;
$$;

revoke all on function public.admin_approve_ude_contribution(uuid) from public, anon;
revoke all on function public.admin_reject_ude_contribution(uuid, text) from public, anon;
grant execute on function public.admin_approve_ude_contribution(uuid) to authenticated;
grant execute on function public.admin_reject_ude_contribution(uuid, text) to authenticated;

-- IMPORTANT:
-- 1) The first ADMIN role must be assigned manually by the project owner
--    in the Supabase SQL Editor after creating/signing up the owner account.
-- 2) Never put a Supabase secret/service_role key in docs/, browser JavaScript,
--    GitHub Pages, or this repository.
