/**
 * JDA-ZIP Engine v1.8
 * - Fatiamento por blocos consecutivos (o corte recomeça a cada frase)
 * - ID único por dicionário (data, hora e código aleatório)
 * - Verificação de dicionário ao abrir o pacote
 * - Opção de embaralhar as chaves
 * Roda 100% na memória RAM do navegador (Zero servidor)
 */

const VERSAO_JDAZIP = "1.8";
const REGEX_PARTES = /[A-Za-zÀ-ÖØ-öø-ÿ0-9]+|[^A-Za-zÀ-ÖØ-öø-ÿ0-9]+/g;
const EH_PALAVRA = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9]/;
const FIM_DE_FRASE = /[.!?;\n]/;
const REGEX_CHAVE = /~JZ[0-9a-z]+;/g;
const REGEX_CABECALHO = /^\[JDA-ZIP:v[^:\]]+:([^\]]+)\]\r?\n---\r?\n/;

function temChave(obj, chave) {
  return Object.prototype.hasOwnProperty.call(obj, chave);
}

function aleatorioInteiro(max) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

// ID no formato 20261027-194212-a3f9 (data, hora e sufixo aleatório)
function gerarIdDicionario() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  const data = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
  const hora = `${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  const sufixo = Array.from(crypto.getRandomValues(new Uint8Array(2)),
    b => b.toString(16).padStart(2, '0')).join('');
  return `${data}-${hora}-${sufixo}`;
}

// Chave em base 36: ~JZ1; ... ~JZz; ~JZ10; (sem limite de quantidade)
function gerarChaveDicionario(indice) {
  return `~JZ${(indice + 1).toString(36)};`;
}

// Corta o texto em blocos de N palavras seguidas, sem sobreposição.
// Separadores (espaços, pontuação, quebras) ficam como estão.
// Um bloco nunca atravessa o fim de uma frase (. ! ? ; ou quebra de linha),
// então o corte recomeça em cada frase.
function fatiarEmBlocos(texto, n) {
  const partes = texto.match(REGEX_PARTES) || [];
  const saida = [];
  let i = 0;

  while (i < partes.length) {
    if (!EH_PALAVRA.test(partes[i])) {
      saida.push({ bloco: false, texto: partes[i] });
      i++;
      continue;
    }

    let bloco = partes[i];
    let palavras = 1;
    i++;

    while (
      palavras < n &&
      i + 1 < partes.length &&
      EH_PALAVRA.test(partes[i + 1]) &&
      !FIM_DE_FRASE.test(partes[i])
    ) {
      bloco += partes[i] + partes[i + 1];
      palavras++;
      i += 2;
    }

    saida.push({ bloco: true, texto: bloco });
  }

  return saida;
}

// Todo bloco ganha uma chave. Blocos idênticos reaproveitam a mesma chave.
// embaralhar = true sorteia os números das chaves.
function gerarDicionarioDinamico(texto, tamanhoBloco = 1, embaralhar = false) {
  const unicos = [];
  const vistos = {};

  for (const parte of fatiarEmBlocos(texto, tamanhoBloco)) {
    if (parte.bloco && !temChave(vistos, parte.texto)) {
      vistos[parte.texto] = true;
      unicos.push(parte.texto);
    }
  }

  const indices = unicos.map((_, i) => i);
  if (embaralhar) {
    for (let i = indices.length - 1; i > 0; i--) {
      const j = aleatorioInteiro(i + 1);
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
  }

  const dicionario = {};
  unicos.forEach((termo, pos) => {
    dicionario[termo] = gerarChaveDicionario(indices[pos]);
  });
  return dicionario;
}

// porBlocos = true  -> dicionário gerado: troca cada bloco pela sua chave
// porBlocos = false -> dicionário global/importado: troca os termos onde aparecerem
function compactarJDAZIP(texto, dicionario = {}, tamanhoBloco = 1, porBlocos = false) {
  if (!texto) return { textoCompactado: "", dicionarioUtilizado: {} };

  let resultado;

  if (porBlocos) {
    resultado = fatiarEmBlocos(texto, tamanhoBloco)
      .map(p => (p.bloco && temChave(dicionario, p.texto)) ? dicionario[p.texto] : p.texto)
      .join('');
  } else {
    resultado = texto;
    const termos = Object.keys(dicionario).sort((a, b) => b.length - a.length);
    for (const termo of termos) {
      const escapado = termo.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      resultado = resultado.replace(new RegExp(escapado, 'g'), dicionario[termo]);
    }
  }

  return { textoCompactado: resultado, dicionarioUtilizado: dicionario };
}

// Volta as chaves para o texto original, de uma só vez
function descompactarJDAZIP(textoCompactado, dicionario = {}) {
  const inverso = {};
  for (const termo of Object.keys(dicionario)) {
    inverso[dicionario[termo]] = termo;
  }
  return textoCompactado.replace(REGEX_CHAVE, c => (temChave(inverso, c) ? inverso[c] : c));
}

// Cria os dois arquivos do pacote, já com o mesmo ID nos dois
function criarPacoteJDAZIP(texto, dicionario, tamanhoBloco = 1, porBlocos = false) {
  const id = gerarIdDicionario();
  const { textoCompactado } = compactarJDAZIP(texto, dicionario, tamanhoBloco, porBlocos);

  return {
    id,
    jda: `[JDA-ZIP:v${VERSAO_JDAZIP}:${id}]\n---\n${textoCompactado}`,
    json: JSON.stringify({
      versao: VERSAO_JDAZIP,
      id,
      fatiamento: tamanhoBloco,
      geradoEm: new Date().toISOString(),
      mapeamentos: dicionario
    }, null, 2)
  };
}

// Abre um .jda com o dicionário (objeto lido do .json) e confere se combinam
function abrirPacoteJDAZIP(conteudoJda, dadosDicionario = {}) {
  const mapa = dadosDicionario.mapeamentos || dadosDicionario;
  const idDicionario = dadosDicionario.mapeamentos ? (dadosDicionario.id || null) : null;
  const cab = conteudoJda.match(REGEX_CABECALHO);
  const idArquivo = cab ? cab[1] : null;

  if (idArquivo && idDicionario && idArquivo !== idDicionario) {
    return {
      ok: false,
      erro: `Dicionário incorreto: o arquivo pede o ID ${idArquivo}, mas este dicionário é ${idDicionario}.`
    };
  }

  const corpo = cab ? conteudoJda.slice(cab[0].length) : conteudoJda;
  return {
    ok: true,
    texto: descompactarJDAZIP(corpo, mapa),
    aviso: (idArquivo && !idDicionario)
      ? "Este dicionário não tem ID, então não foi possível confirmar se é o correto."
      : null
  };
}

function baixarArquivoLocal(conteudo, nomeArquivo, tipoMime) {
  const blob = new Blob([conteudo], { type: tipoMime });
  const urlTemp = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = urlTemp;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(urlTemp);
  }, 100);
}

// ==========================================================
// Proteção por senha (Web Crypto: PBKDF2 + AES-GCM)
// O dicionário cifrado vira um arquivo .jdakey
// ==========================================================
const ITERACOES_PBKDF2 = 250000;

function bytesParaBase64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return btoa(s);
}

function base64ParaBytes(b64) {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

async function derivarChaveDeSenha(senha, salt, iteracoes) {
  const base = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(senha), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: iteracoes, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
  );
}

async function cifrarDicionario(jsonTexto, senha) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const chave = await derivarChaveDeSenha(senha, salt, ITERACOES_PBKDF2);
  const cifrado = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, chave, new TextEncoder().encode(jsonTexto)
  );
  return JSON.stringify({
    jdakey: 1,
    kdf: 'PBKDF2-SHA256',
    iteracoes: ITERACOES_PBKDF2,
    salt: bytesParaBase64(salt),
    iv: bytesParaBase64(iv),
    dados: bytesParaBase64(new Uint8Array(cifrado))
  });
}

function ehDicionarioCifrado(texto) {
  try { return JSON.parse(texto).jdakey === 1; } catch (e) { return false; }
}

async function decifrarDicionario(conteudo, senha) {
  const pacote = JSON.parse(conteudo);
  try {
    const chave = await derivarChaveDeSenha(senha, base64ParaBytes(pacote.salt), pacote.iteracoes);
    const aberto = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ParaBytes(pacote.iv) }, chave, base64ParaBytes(pacote.dados)
    );
    return new TextDecoder().decode(aberto);
  } catch (e) {
    throw new Error('Senha incorreta ou arquivo corrompido.');
  }
}
