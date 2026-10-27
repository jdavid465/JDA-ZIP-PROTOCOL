import streamlit as st

# Configuração da página
st.set_page_config(page_title="JDA-ZIP Live Compressor", layout="wide")

st.title("⚡ JDA-ZIP Protocol - Live Compressor")
st.write("Digita o teu prompt à esquerda e vê o motor a comprimi-lo em tempo real à direita.")

# O nosso Dicionário de Âncoras (Anchor Store)
dictionary = {
    "You are an expert veterinary assistant and diagnostic specialist.": "$SYS_1",
    "Return the response strictly in valid JSON format with keys status, data, and message.": "$OUT_JSON",
    "Context: Operating in a high-demand veterinary hospital setting.": "$CTX_CLINIC"
}

def compress(prompt: str) -> str:
    compressed = prompt
    for full_text, anchor in dictionary.items():
        compressed = compressed.replace(full_text, anchor)
    return f"[JDA-ZIP:v1.0]\n---\n{compressed}"

# Layout de duas colunas (estilo tradutor)
col1, col2 = st.columns(2)

with col1:
    st.subheader("📝 Prompt Original")
    # Texto de exemplo pré-preenchido para testares logo
    default_text = (
        "You are an expert veterinary assistant and diagnostic specialist. "
        "Context: Operating in a high-demand veterinary hospital setting. "
        "Por favor, analisa este caso. "
        "Return the response strictly in valid JSON format with keys status, data, and message."
    )
    user_input = st.text_area("Escreve ou cola o teu texto aqui:", value=default_text, height=250)
    
    # Mostrar estatísticas do original
    st.caption(chars_orig := f"Caracteres: {len(user_input)}")

with col2:
    st.subheader("📦 Payload Comprimido (JDA-ZIP)")
    
    # Processa a compressão em tempo real
    compressed_output = compress(user_input)
    
    # Caixa de texto de resultado
    st.text_area("Resultado comprimido:", value=compressed_output, height=250)
    
    # Mostrar estatísticas de poupança
    savings = len(user_input) - len(compressed_output)
    st.success(f"🎉 Redução de tamanho: {savings} caracteres poupados!")
