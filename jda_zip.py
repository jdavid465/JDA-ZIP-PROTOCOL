class JDAZipEngine:
    def __init__(self):
        # O nosso Dicionário Local de Âncoras (Anchor Store)
        self.dictionary = {
            "$SYS_1": "You are an expert veterinary assistant and diagnostic specialist.",
            "$OUT_JSON": "Return the response strictly in valid JSON format with keys status, data, and message.",
            "$CTX_CLINIC": "Context: Operating in a high-demand veterinary hospital setting."
        }

    def compress(self, prompt: str) -> str:
        """Etapa de Compressão: Varre o prompt e substitui frases longas por âncoras."""
        compressed_prompt = prompt
        for anchor, full_text in self.dictionary.items():
            compressed_prompt = compressed_prompt.replace(full_text, anchor)

        return f"[JDA-ZIP:v1.0]\n---\n{compressed_prompt}"

    def decompress(self, compressed_payload: str) -> str:
        """Etapa de Reconstrução: Expande as âncoras de volta para o texto completo."""
        body = compressed_payload.split("---\n")[-1]
        expanded_prompt = body
        for anchor, full_text in self.dictionary.items():
            expanded_prompt = expanded_prompt.replace(anchor, full_text)
        return expanded_prompt

# ==========================================
# TESTANDO O PROTOCOLO NA PRÁTICA
# ==========================================
engine = JDAZipEngine()

raw_prompt = (
    "You are an expert veterinary assistant and diagnostic specialist. "
    "Context: Operating in a high-demand veterinary hospital setting. "
    "Por favor, analisa o seguinte exame de sangue. "
    "Return the response strictly in valid JSON format with keys status, data, and message."
)

print("=== 1. PROMPT ORIGINAL (Sem compressão) ===")
print(raw_prompt)
print(f"Tamanho total: {len(raw_prompt)} caracteres\n")

compressed_payload = engine.compress(raw_prompt)
print("=== 2. PAYLOAD COMPRIMIDO (Pronto para enviar) ===")
print(compressed_payload)
print(f"Tamanho total: {len(compressed_payload)} caracteres (Redução brutal!)\n")

restored_prompt = engine.decompress(compressed_payload)
print("=== 3. PROMPT RECONSTRUÍDO (Para o modelo ler) ===")
print(restored_prompt)
