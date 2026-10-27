/**
 * JDA-ZIP Engine - Camada de Processamento Lógico
 */

function compactarJDAZIP(texto, dicionario = {}) {
  if (!texto) return "";

  // Exemplo de aplicação segura: se houver termos exatos mapeados no dicionário JSON, substitui.
  // Caso contrário, faz o tratamento estrutural sem corromper dados críticos (como valores e exames).
  let textoProcessado = texto;

  // Substituição baseada em dicionário externo (se fornecido)
  for (const [termo, codigo] of Object.entries(dicionario)) {
    const regex = new RegExp(`\\b${termo}\\b`, 'gi');
    textoProcessado = textoProcessado.replace(regex, codigo);
  }

  return textoProcessado;
}
