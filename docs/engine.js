/**
 * JDA-ZIP Engine v1.2 - Motor com Agrupamento (Fatiamento 1 a 5)
 * Roda 100% na memória RAM do navegador (Zero servidor)
 */

// Função para gerar chaves sequenciais (1 a 99, depois a01 até z99)
function gerarChaveDicionario(indice) {
  if (indice < 99) {
    return `~JZ${indice + 1};`;
  } else {
    const indiceAjustado = indice - 99;
    const letraIndex = Math.floor(indiceAjustado / 99);
    const num = (indiceAjustado % 99) + 1;
    
    if (letraIndex < 26) {
      const letra = String.fromCharCode(97 + letraIndex);
      const numFormatado = num < 10 ? `0${num}` : `${num}`;
      return `~JZ${letra}${numFormatado};`;
    }
  }
  return null; // Limite máximo
}

// Gerador dinâmico baseado no tamanho do fatiamento (n)
function gerarDicionarioDinamico(texto, tamanhoBloco = 1) {
  // Limpa e divide o texto em palavras, mantendo pontuação separada ou focando em tokens limpos
  const palavras = texto.match(/\b[a-zA-ZáàâãéèêíïóôõöúçÑñÁÀÂÃÉÈÍÓÔÕÖÚ]+\b/g) || [];
  const frequencias = {};

  // Constrói os blocos (n-grams) conforme o tamanho do fatiamento
  for (let i = 0; i <= palavras.length - tamanhoBloco; i++) {
    const blocoArr = [];
    for (let j = 0; j < tamanhoBloco; j++) {
      blocoArr.push(palavras[i + j]);
    }
    
    // Ignora blocos compostos apenas por palavras muito curtas (ex: "de a", "e o")
    const termoCompleto = blocoArr.join(' ');
    if (tamanhoBloco === 1 && termoCompleto.length <= 2) continue;

    const chaveTermo = termoCompleto.toLowerCase();
    frequencias[chaveTermo] = (frequencias[chaveTermo] || 0) + 1;
  }

  // Filtra apenas termos que se repetem e cria o dicionário ordenado por frequência
  const dicionarioGerado = {};
  let indiceAtual = 0;

  Object.keys(frequencias)
    .filter(termo => frequencias[termo] > 1)
    .sort((a, b) => frequencias[b] - frequencias[a])
    .forEach(termo => {
      const token = gerarChaveDicionario(indiceAtual);
      if (token) {
        dicionarioGerado[termo] = token;
        indiceAtual++;
      }
    });

  return dicionarioGerado;
}

// Função principal de compactação com suporte a blocos
function compactarJDAZIP(texto, dicionario = {}, tamanhoBloco = 1) {
  if (!texto) return { textoCompactado: "", dicionarioUtilizado: {} };

  let resultado = texto;

  // Ordena as chaves do dicionário da maior para a menor string para evitar conflitos de substituição parcial
  const chavesOrdenadas = Object.keys(dicionario).sort((a, b) => b.length - a.length);

  for (const termoOriginal of chavesOrdenadas) {
    const codigo = dicionario[termoOriginal];
    // Cria regex global case-insensitive para substituir o bloco exato de palavras
    const regex = new RegExp(termoOriginal.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
    resultado = resultado.replace(regex, codigo);
  }

  return {
    textoCompactado: resultado,
    dicionarioUtilizado: dicionario
  };
}

// Função auxiliar para forçar o download local via Blob (Memória RAM)
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
