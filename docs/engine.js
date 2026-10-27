/**
 * JDA-ZIP Engine v1.5 - Compactação Total e Rigorosa
 * Roda 100% na memória RAM do navegador (Zero servidor)
 */

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
  return null;
}

function gerarDicionarioDinamico(texto, tamanhoBloco = 1) {
  // Captura palavras suportando acentuação e cedilha
  const palavras = texto.match(/[a-zA-ZáàâãéèêíïóôõöúçÑñÁÀÂÃÉÈÍÓÔÕÖÚ]+/g) || [];
  const frequencias = {};

  for (let i = 0; i <= palavras.length - tamanhoBloco; i++) {
    const blocoArr = [];
    for (let j = 0; j < tamanhoBloco; j++) {
      blocoArr.push(palavras[i + j]);
    }
    
    const termoCompleto = blocoArr.join(' ');
    
    // Filtro inteligente: ignora apenas palavras unitárias menores que 4 letras para fatiamento 1
    if (tamanhoBloco === 1 && termoCompleto.length < 4) continue;

    const chaveTermo = termoCompleto.toLowerCase();
    frequencias[chaveTermo] = (frequencias[chaveTermo] || 0) + 1;
  }

  const dicionarioGerado = {};
  let indiceAtual = 0;

  // Ordena por prioridade (tamanho do termo multiplicado pela frequência)
  Object.keys(frequencias)
    .filter(termo => frequencias[termo] > 1)
    .sort((a, b) => (b.length * frequencias[b]) - (a.length * frequencias[a]))
    .forEach(termo => {
      const token = gerarChaveDicionario(indiceAtual);
      if (token) {
        dicionarioGerado[termo] = token;
        indiceAtual++;
      }
    });

  return dicionarioGerado;
}

function compactarJDAZIP(texto, dicionario = {}, tamanhoBloco = 1) {
  if (!texto) return { textoCompactado: "", dicionarioUtilizado: {} };

  let resultado = texto;
  
  // Ordena do maior termo para o menor para garantir que blocos compostos substituam antes dos unitários
  const chavesOrdenadas = Object.keys(dicionario).sort((a, b) => b.length - a.length);

  for (const termoOriginal of chavesOrdenadas) {
    const codigo = dicionario[termoOriginal];
    
    // Regex blindada para encontrar todas as ocorrências exatas independentemente de maiúsculas/minúsculas
    const escapedTermo = termoOriginal.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedTermo}\\b`, 'gi');
    
    resultado = resultado.replace(regex, codigo);
  }

  return {
    textoCompactado: resultado,
    dicionarioUtilizado: dicionario
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
