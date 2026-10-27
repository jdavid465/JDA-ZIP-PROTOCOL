/**
 * JDA-ZIP Engine v1.1 - Motor de Processamento Local
 * Roda 100% na memória RAM do navegador (Zero servidor)
 */

// Algoritmo de geração dinâmica de dicionário a partir do texto
function gerarDicionarioDinamico(texto) {
  const palavras = texto.match(/\b[a-zA-ZáàâãéèêíïóôõöúçÑñÁÀÂÃÉÈÍÓÔÕÖÚ]{4,}\b/g) || [];
  const frequencias = {};

  // Contar frequência de termos longos
  palavras.forEach(p => {
    const termo = p.toLowerCase();
    frequencias[termo] = (frequencias[termo] || 0) + 1;
  });

  // Filtrar apenas termos repetidos
  const dicionarioGerado = {};
  let contador = 1001;

  Object.keys(frequencias)
    .filter(termo => frequencias[termo] > 1)
    .sort((a, b) => frequencias[b] - frequencias[a])
    .forEach(termo => {
      dicionarioGerado[termo] = `~JZ${contador};`;
      contador++;
    });

  return dicionarioGerado;
}

// Função principal de compactação
function compactarJDAZIP(texto, dicionario = {}) {
  if (!texto) return { textoCompactado: "", dicionarioUtilizado: {} };

  let resultado = texto;

  // Aplicação segura de substituições por limite de palavra (\b)
  for (const [termo, codigo] of Object.entries(dicionario)) {
    const regex = new RegExp(`\\b${termo}\\b`, 'gi');
    resultado = resultado.replace(regex, codigo);
  }

  return {
    textoCompactado: resultado,
    dicionarioUtilizado: dicionario
  };
}

// Função auxiliar para forçar o download direto da RAM para o disco
function baixarArquivoLocal(conteudo, nomeArquivo, tipoMime) {
  // Cria um arquivo temporário na memória RAM (Blob)
  const blob = new Blob([conteudo], { type: tipoMime });
  const urlTemp = URL.createObjectURL(blob);

  // Simula o clique de download
  const a = document.createElement('a');
  a.href = urlTemp;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();

  // Limpa a memória RAM imediatamente após o download
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(urlTemp);
  }, 100);
}
