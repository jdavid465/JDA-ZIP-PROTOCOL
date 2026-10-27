/**
 * JDA-ZIP Engine v1.3 - Motor Blindado com Delimitadores e Filtro de Tamanho
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
  const palavras = texto.match(/\b[a-zA-ZáàâãéèêíïóôõöúçÑñÁÀÂÃÉÈÍÓÔÕÖÚ]+\b/g) || [];
  const frequencias = {};

  for (let i = 0; i <= palavras.length - tamanhoBloco; i++) {
    const blocoArr = [];
    for (let j = 0; j < tamanhoBloco; j++) {
      blocoArr.push(palavras[i + j]);
    }
    
    const termoCompleto = blocoArr.join(' ');
    
    // FILTRO DE SEGURANÇA: Ignora blocos muito curtos (menos de 4 caracteres no total)
    // Isso evita trocar palavras inúteis como "de", "em", "um" que incham o arquivo.
    if (termoCompleto.length < 4) continue;

    const chaveTermo = termoCompleto.toLowerCase();
    frequencias[chaveTermo] = (frequencias[chaveTermo] || 0) + 1;
  }

  const dicionarioGerado = {};
  let indiceAtual = 0;

  Object.keys(frequencias)
    .filter(termo => frequencias[termo] > 1)
    .sort((a, b) => frequencias[b].length * frequencias[b] - frequencias[a].length * frequencias[a]) // Prioriza termos maiores e mais frequentes
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
  const chavesOrdenadas = Object.keys(dicionario).sort((a, b) => b.length - a.length);

  for (const termoOriginal of chavesOrdenadas) {
    const codigo = dicionario[termoOriginal];
    
    // ESCUDO DE SEGURANÇA: \b garante que só substitui a palavra/bloco inteiro exato
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
