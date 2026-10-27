/**
 * JDA-ZIP Engine v1.7 - Fatiamento Exato por Grupos de Palavras (N-gram)
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
  // Extrai todas as palavras do texto mantendo a ordem sequencial
  const palavras = texto.match(/[a-zA-ZáàâãéèêíïóôõöúçÑñÁÀÂÃÉÈÍÓÔÕÖÚ]+/g) || [];
  const frequencias = {};

  // Varre o texto agrupando exatamente de N em N palavras (n-grams)
  for (let i = 0; i <= palavras.length - tamanhoBloco; i++) {
    const blocoArr = [];
    for (let j = 0; j < tamanhoBloco; j++) {
      blocoArr.push(palavras[i + j]);
    }
    
    const termoCompleto = blocoArr.join(' ');
    const chaveTermo = termoCompleto.toLowerCase();
    
    frequencias[chaveTermo] = (frequencias[chaveTermo] || 0) + 1;
  }

  const dicionarioGerado = {};
  let indiceAtual = 0;

  // Ordena prioritariamente pelos blocos que mais se repetem (frequência)
  Object.keys(frequencias)
    .filter(termo => frequencias[termo] > 1) // Apenas termos repetidos
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

function compactarJDAZIP(texto, dicionario = {}, tamanhoBloco = 1) {
  if (!texto) return { textoCompactado: "", dicionarioUtilizado: {} };

  let resultado = texto;
  
  // Ordena do maior grupo de palavras para o menor para evitar conflitos de substituição
  const chavesOrdenadas = Object.keys(dicionario).sort((a, b) => b.split(' ').length - a.split(' ').length);

  for (const termoOriginal of chavesOrdenadas) {
    const codigo = dicionario[termoOriginal];
    
    // Constrói a regex exata para substituir o grupo de palavras preservando espaçamentos e maiúsculas/minúsculas
    const escapedTermo = termoOriginal.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    // Cria uma regex que respeita espaços entre as palavras do grupo
    const regexPattern = escapedTermo.replace(/\s+/g, '\\s+');
    const regex = new RegExp(regexPattern, 'gi');
    
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
