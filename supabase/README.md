# Supabase — JDA-ZIP UDE

This directory contains the database foundation for the Universal Dynamic Evolutionary Dictionary (UDE).

## Architecture

- GitHub Pages continues to host the static website in `docs/`.
- Supabase provides Auth and the central PostgreSQL database.
- The browser may use the Supabase project URL and publishable key. Never put a secret/service-role key, database password, or private token in `docs/`.
- The global dictionary is shared. Users submit candidate entries; approved contributions become canonical UDE entries.
- Exact duplicate content reuses the existing global code. The first migration preserves the exact text (case, whitespace, punctuation) and uses SHA-256 as a lookup key, with an additional exact-content comparison during approval.

## Initial migration

File: `migrations/20261028000000_initial_ude_core.sql`

It creates:

- `profiles`: one profile per Supabase Auth user; roles are `USER`, `STAFF`, or `ADMIN`.
- `ude_entries`: canonical global dictionary entries with stable codes such as `JDA-0000000001`.
- `ude_contributions`: user submissions awaiting review.
- Admin-only database functions to approve or reject pending contributions.

Row Level Security is enabled and client grants are deliberately restricted. This follows Supabase's guidance that grants and RLS policies must be configured together: https://supabase.com/docs/guides/database/postgres/row-level-security

## Apply it in Supabase

1. Open the Supabase project dashboard.
2. Go to **SQL Editor** and create a new query.
3. Copy the full contents of the migration SQL file and run it.
4. Check the result for errors before proceeding.

The migration has been committed to GitHub, but it has **not** been executed against the live Supabase project from this repository integration.

## Bootstrap the project owner as ADMIN

After creating the owner's account through Supabase Auth, run this once in the Supabase SQL Editor, replacing the placeholder with that account's Auth user UUID:

```sql
update public.profiles
set role = 'ADMIN'
where id = 'PASTE-AUTH-USER-UUID-HERE';
```

Do not expose the owner's UUID unnecessarily. Do not grant users permission to update their own role.

## Current scope and next steps

This is the first database foundation only. It does not yet implement the website connection, compression/decompression API, quotas, credits, payment processing, or automated moderation. Those should be added in separate migrations and application changes after this schema is applied and tested.

Before public launch, add automated RLS tests and review the migration in a non-production project.
