# 🚀 JDA-ZIP Protocol

### **A Simple Idea to Shorten Repeated Text Sent to AIs (Under Testing)**

### *Uma ideia simples para encurtar textos repetidos enviados a IAs (em fase de testes)*

&nbsp;

> [!NOTE]
> **EN:** This is an **experiment**. There is a small prototype and **no measured results yet**. I do not know if the idea really helps, so I am asking the community to test it and to criticize it.
>
> **PT:** *Este é um **experimento**. Existe um protótipo pequeno e **nenhum resultado medido ainda**. Eu não sei se a ideia ajuda de verdade, por isso peço à comunidade que teste e critique.*

* * *

## 🛠️ The Journey / A Trajetória

**EN:** I am not a professional programmer. It started when I tried to copy long conversations from one AI to another to compare answers, and the pasted text came out at less than half of what I copied. I wondered: why carry all that heavy text if repeated words and phrases could be swapped for short codes, using a "dictionary" that both sides already know?

**PT:** *Eu não sou programador profissional. Tudo começou quando tentei copiar conversas longas de uma IA para outra, para comparar respostas, e o texto colado vinha com menos da metade do que eu copiei. Pensei: por que carregar todo esse texto pesado se palavras e frases repetidas podem ser trocadas por códigos curtos, usando um "dicionário" que os dois lados já conhecem?*

* * *

## 🛑 The Problem / O Problema

**EN:** AIs do not count letters, they count **tokens** (small pieces of words). More tokens means more cost, more waiting time and more memory used. On slow networks, more bytes also means a slower connection.

**PT:** *As IAs não contam letras, elas contam **tokens** (pedacinhos de palavras). Mais tokens significam mais custo, mais espera e mais memória usada. Em redes lentas, mais bytes também significam uma conexão mais demorada.*

| Texto / Text | Tokens (estimativa em português) |
|:--|:--:|
| 10 palavras | 15 a 20 |
| 1.000 palavras (cerca de 2 páginas) | 1.500 a 2.000 |
| 10.000 palavras | 15.000 a 20.000 |

*Valores aproximados. O número exato depende do modelo e do texto. / Approximate values. The exact number depends on the model and the text.*

* * *

## 💡 The Idea / A Ideia

**EN:** JDA-ZIP Protocol has two parts that can be used together or separately.

**PT:** *O JDA-ZIP Protocol tem duas partes, que podem ser usadas juntas ou separadas.*

&nbsp;

### 📖 Part 1: Code Dictionary / Parte 1: Dicionário de Códigos

**EN:** Both sides agree on a dictionary. The sender writes a short code, and the receiver expands it back to the full text.

**PT:** *Os dois lados combinam um dicionário. Quem envia escreve um código curto, e quem recebe expande de volta para o texto completo.*

```
Dicionário / Dictionary
  $SYS_1   =  "You are an expert veterinary assistant and diagnostic specialist."
  $OUT_JSON =  "Return the response strictly in valid JSON format with keys status, data, and message."

Enviado / Sent:     $SYS_1 Por favor, analisa o seguinte exame de sangue. $OUT_JSON
```

&nbsp;

**⚖️ When is it worth it? / Quando vale a pena?**

**EN:** A code only saves something if the original text is **long or rare** and **repeats many times**. The dictionary itself also costs something to send once.

**PT:** *Um código só economiza se o texto original for **longo ou raro** e se **repetir várias vezes**. O próprio dicionário também custa algo para ser enviado uma vez.*

| Vezes que a palavra aparece | Por extenso | Com código + legenda |
|:--:|:--:|:--:|
| 1 | ~5 tokens | ~12 tokens (pior) |
| 20 | ~100 tokens | ~50 tokens |

*Exemplo ilustrativo com a palavra "inconstitucionalmente". Os números são aproximados e precisam ser medidos com o seu modelo.*

&nbsp;

**📍 Where does the dictionary live? / Onde o dicionário fica?**

Isto decide se a ideia economiza **tokens** ou apenas **rede**.

| Onde fica o dicionário | Economiza rede? | Economiza tokens? | Observação |
|:--|:--:|:--:|:--|
| Num **programa**, fora da IA | ✅ Sim | ❌ Não | O programa expande antes da IA ler, então a IA lê o texto completo. |
| No **início do prompt** (de preferência em cache) | ✅ Sim | ✅ Sim, depois da 1ª vez | A IA entende os códigos pela legenda. Pode errar. |
| **Dentro do modelo** (treinado, ou com vocabulário ampliado) | ✅ Sim | ✅ Sim | Só em modelos que você controla, como os de pesos abertos. Exige treino. |

&nbsp;

### ⚓ Part 2: Local Anchors / Parte 2: Âncoras Locais

**EN:** Instead of keeping a whole long text inside the AI's context, we keep the text stored (in a file) and leave only a tiny **anchor** in the context. The anchor says what the content is about and where it is.

**PT:** *Em vez de manter um texto longo inteiro dentro do contexto da IA, guardamos o texto salvo (em um arquivo) e deixamos no contexto só uma **âncora** bem pequena. A âncora diz sobre o que é o conteúdo e onde ele está.*

| Campo / Field | Exemplo / Example |
|:--|:--|
| 🔖 ID da âncora | `@A12` |
| 📁 Local do arquivo | `notas/reuniao-03.md` |
| 🏷️ Assunto | orçamento de 2026 |
| 📚 Base de referência | `planilha_custos.xlsx` |

O que a IA vê no contexto / What the AI sees in context:

```
@A12  orçamento de 2026 (reunião 03)
```

**EN:** The AI does not "jump" to the file by itself. A **program around the AI** does the search: when the AI needs the details of `@A12`, the program loads only that snippet into the conversation, and removes it afterwards.

**PT:** *A IA não "salta" sozinha até o arquivo. Quem faz a busca é um **programa em volta da IA**: quando a IA precisa dos detalhes de `@A12`, o programa carrega só aquele trecho na conversa e o retira depois.*

> [!TIP]
> **Ideia:** guardar também uma data ou um código de versão na âncora, para saber se o arquivo mudou desde que ela foi criada.

* * *

## 🔄 Flow / Fluxo

```
  Texto longo / Long text
          │
          ▼
  ┌───────────────────────────┐
  │ 1. Dicionário             │  frases repetidas  →  códigos curtos
  └───────────────────────────┘
          │
          ▼
  ┌───────────────────────────┐
  │ 2. Âncoras                │  conteúdo grande  →  salvo em arquivo
  │                           │  no contexto: só ID + assunto + local
  └───────────────────────────┘
          │
          ▼
  Mensagem curta / Short message  ──►  IA
          │
          ▼  (se precisar de detalhes / if details are needed)
  Programa busca o trecho exato  ──►  entra na conversa só quando necessário
```

* * *

## ✅ What Works Today / O Que Funciona Hoje

| Item | Estado |
|:--|:--|
| Troca de frases **exatamente iguais** às do dicionário e volta ao original (`jda_zip.py`) | ✅ Funciona no protótipo |
| Dicionário no início do prompt, com cache | 🔬 Ideia, **não testada** |
| Modelo treinado (ou vocabulário ampliado) para entender os códigos | 🔬 Ideia, **não testada** |
| Âncoras com local do arquivo e assunto | 🔬 Conceito, **sem código ainda** |
| Uma IA escolhendo os códigos sozinha ("parte semântica") | ❌ **Não existe**. É só uma possibilidade futura. |
| Proteção contra o usuário digitar um código no texto (ex.: `$OUT_JSON`) | ⚠️ **Falha conhecida**: o código seria trocado sem querer. |

&nbsp;

> [!WARNING]
> **Honestidade / Honesty**
> - Não medi quanto isso economiza. Não existe número confirmado neste projeto.
> - Se o texto é expandido **antes** de chegar na IA, os **tokens cobrados não diminuem**. Diminui só o que viaja pela internet.
> - Trocar **cada palavra** por 1 ou 2 caracteres **não reduz tokens**: o modelo já usa um vocabulário interno que faz isso, e códigos estranhos costumam ser quebrados em vários pedaços.
> - Âncoras podem trazer o trecho errado ou deixar passar algo importante. É preciso medir se a qualidade das respostas cai.

* * *

## 🎯 Where It Might Help / Onde Pode Ajudar

> Todas as linhas abaixo são **hipóteses a testar**, não resultados.

| # | Caso de uso | Por que pode ajudar | Onde provavelmente **não** ajuda |
|:-:|:--|:--|:--|
| 1 | **Agentes e apps de IA que repetem as mesmas instruções** | O dicionário encurta o que se repete toda hora. | Textos sem repetição. |
| 2 | **IAs locais em aparelhos com pouca memória** | Âncoras mantêm menos texto ativo na conversa. | Se o aparelho já tem memória de sobra. |
| 3 | **Conexões ruins (rural, satélite)** | Menos bytes a enviar para textos repetitivos. | Dados de sensores em números: formatos binários e compressores já fazem melhor. |
| 4 | **Levar contexto de uma IA para outra** | Âncoras e resumos organizados no lugar de colar tudo. | Quando o problema é só o limite da caixa de colar do site: salvar em arquivo `.txt` já resolve. |

* * *

## 🔎 Similar Things That Already Exist / Coisas Parecidas Que Já Existem

**EN:** This idea is not new, and I want that to be clear.

**PT:** *Esta ideia não é nova, e quero deixar isso claro.*

| O que já existe | O que faz |
|:--|:--|
| **Cache de prompt** (oferecido por alguns serviços de IA) | Cobra menos por textos que se repetem. |
| **zstd / Brotli** | Compressão de bytes com dicionário compartilhado. |
| **LLMLingua** | Corta partes do texto para encurtar, mas perde informação. |
| **SemanticZip** e outros estudos | Dicionários compartilhados entre IAs. |
| **RAG e memória externa** (como MemGPT) | Guardam o histórico fora e trazem só os trechos necessários. |

**EN:** JDA-ZIP Protocol does not try to replace any of these. The question is: **is there a case where a simple, versioned dictionary plus anchors helps?** The answer may be "no", and that is also a useful result.

**PT:** *O JDA-ZIP Protocol não tenta substituir nenhuma delas. A pergunta é: **existe algum caso em que um dicionário simples e versionado, junto com âncoras, ajuda?** A resposta pode ser "não", e isso também é um resultado útil.*

* * *

## 🧪 How You Can Help / Como Você Pode Ajudar

**EN:** I need tests and criticism. Open questions:

**PT:** *Preciso de testes e de críticas. As perguntas abertas são:*

1. Quantos **tokens** isso economiza de verdade?
2. Isso ganha do **cache de prompt**, ou não faz diferença?
3. A IA **entende bem os códigos** quando recebe o dicionário no início?
4. Num modelo local, melhora a **velocidade** e o uso de **memória**?
5. Com âncoras, a **qualidade das respostas** se mantém em comparação com o contexto completo?

&nbsp;

### 🧰 Simple test / Teste simples

1. Escolha um texto longo que você repete muito (por exemplo, instruções fixas).
2. Conte os tokens com o contador do serviço que você usa.
3. Troque as partes repetidas por códigos (com a legenda) e conte de novo.
4. Mande para a IA e veja se a resposta continua boa.
5. Se puder, repita com o cache do serviço ligado e compare.

&nbsp;

### 📝 How to report / Como relatar

Abra uma **Issue** com:

| Informação | Exemplo |
|:--|:--|
| Serviço e modelo | (nome do serviço e do modelo) |
| Tokens antes e depois | 1.800 → 1.100 |
| Cache ligado? | Sim / Não |
| Tempo e memória (se for modelo local) | (opcional) |
| A resposta ficou igual, pior ou melhor? | Igual |
| Observações | (livre) |

> [!WARNING]
> **Não publique dados pessoais ou confidenciais** nos seus testes.

* * *

## 🌍 Vision / Visão

**EN:** I would like JDA-ZIP Protocol to be **simple, open and complementary**: a small layer that works together with caches, memory systems and compressors, and not something that replaces them.

**PT:** *Eu gostaria que o JDA-ZIP Protocol fosse **simples, aberto e complementar**: uma camada pequena que trabalha junto com caches, sistemas de memória e compressores, e não algo que os substitui.*

* * *

## 💬 Let's Talk / Vamos Conversar

**EN:** Criticism is welcome. If you think this does not work, please open an **Issue** or a **Discussion** and explain why. Code, tests and corrections are welcome too.

**PT:** *Críticas são bem-vindas. Se você acha que isso não funciona, abra uma **Issue** ou uma **Discussão** explicando o motivo. Código, testes e correções também são bem-vindos.*

* * *

## 📄 License / Licença

GPL-3.0

&nbsp;

Created by **Jonathan D. Andrade** ([jdavid465](https://github.com/jdavid465)) as an open experiment.

*Criado por **Jonathan D. Andrade** ([jdavid465](https://github.com/jdavid465)) como um experimento aberto.*
