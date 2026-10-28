# JDA-ZIP UDE — Estado da técnica e referências

### Estado da técnica, tecnologias relacionadas e referências

**Proposta:** JDA-ZIP UDE — Universal Dynamic Evolutionary Dictionary  
**Autor da proposta:** Jonathan D. Andrade  
**Projeto:** JDA-ZIP-PROTOCOL  
**Versão do documento:** 0.1  
**Data:** 28 de outubro de 2026  
**Status:** Pesquisa inicial de tecnologias relacionadas

---

## 1. Objetivo deste documento

Este documento identifica tecnologias, padrões e conceitos anteriores relacionados à proposta JDA-ZIP UDE.

Seu objetivo é:

- Reconhecer trabalhos e tecnologias que já existem.
- Identificar conceitos técnicos relacionados à proposta.
- Diferenciar mecanismos de compressão existentes da arquitetura proposta pelo UDE.
- Evitar atribuir ao projeto a invenção de conceitos que já possuem implementações anteriores.
- Registrar as referências utilizadas durante o desenvolvimento da proposta.

Este documento representa uma pesquisa inicial, não uma busca jurídica ou patentária exaustiva.

## 2. Tecnologias relacionadas

### 2.1. Zstandard (Zstd)

**Desenvolvedor original:** Yann Collet  
**Referência:** RFC 8878

O Zstandard é um algoritmo de compressão sem perdas que permite a utilização de dicionários externos para melhorar a compressão de determinados tipos de conteúdo.

Dicionários podem ser treinados com amostras representativas dos dados que serão comprimidos.

**Relação com o UDE:**

- Utilização de dicionários externos.
- Reutilização de informações conhecidas durante a compressão.
- Possibilidade de distribuir dicionários entre diferentes aplicações.

**Diferença conceitual:**

O UDE propõe uma base universal lógica, continuamente evolutiva e compartilhada, na qual novas palavras e expressões podem ser incorporadas e disponibilizadas para diferentes usuários.

O mecanismo de dicionários do Zstandard não equivale, por si só, a essa arquitetura de cadastro e evolução coletiva.

Referência:  
https://www.rfc-editor.org/rfc/rfc8878.html

### 2.2. Brotli e Shared Brotli

**Desenvolvedores:** Jyrki Alakuijala, Zoltán Szabadka e colaboradores.

O Brotli é um algoritmo de compressão sem perdas que utiliza técnicas como LZ77 e codificação Huffman.

Sua evolução inclui mecanismos de utilização de dicionários compartilhados.

O RFC 9841 especifica o formato Shared Brotli.

**Relação com o UDE:**

- Reutilização de conteúdo previamente conhecido.
- Utilização de dicionários externos.
- Possibilidade de melhorar a compressão de conteúdos relacionados.

**Diferença conceitual:**

O Shared Brotli define um mecanismo e formato de compressão que utiliza um dicionário compartilhado.

O UDE propõe uma arquitetura de gestão e evolução de uma base universal de referências, independente de um único algoritmo de compressão.

Referências:

https://www.rfc-editor.org/rfc/rfc7932.html

https://www.rfc-editor.org/rfc/rfc9841.html

### 2.3. Compression Dictionary Transport — RFC 9842

**Organização:** Internet Engineering Task Force (IETF).

O RFC 9842 define mecanismos para transportar e reutilizar dicionários de compressão em comunicações HTTP.

Entre seus recursos estão:

- Identificação de dicionários.
- Disponibilização de dicionários pelos servidores.
- Identificação de dicionários disponíveis nos clientes.
- Validação por hash.
- Reutilização de dicionários em solicitações posteriores.
- Integração com Brotli e Zstandard.

**Relação com o UDE:**

Este padrão é especialmente relevante porque demonstra que a distribuição e reutilização de dicionários entre clientes e servidores já possuem mecanismos padronizados.

**Diferença conceitual:**

O RFC 9842 concentra-se no transporte, identificação e utilização de dicionários de compressão no contexto HTTP.

O UDE propõe ir além do transporte de um dicionário existente: uma base universal que possa receber novas expressões, atribuir identificadores permanentes e disponibilizar essas referências para diferentes usuários e aplicações.

O RFC 9842 deve ser considerado uma referência técnica importante para o desenvolvimento do UDE, especialmente em relação à identificação, validação, distribuição e sincronização de dicionários.

Referência oficial:

https://www.rfc-editor.org/rfc/rfc9842.html

### 2.4. Dicionários compartilhados e compressão baseada em referências

A utilização de dicionários compartilhados, referências e substituição de sequências repetidas são conceitos conhecidos na área de compressão de dados.

Esses conceitos aparecem em diferentes algoritmos, formatos e sistemas.

O JDA-ZIP UDE não reivindica a invenção dessas técnicas isoladamente.

Sua proposta está relacionada à combinação de mecanismos de identificação permanente, gestão centralizada, evolução cumulativa e compartilhamento de referências entre diferentes participantes.

---

## 3. Comparação conceitual

| Característica | Tecnologias relacionadas | Proposta UDE |
|---|---|---|
| Utilização de dicionários | Sim | Sim |
| Referências compartilhadas | Sim | Sim |
| Identificação de dicionários | Sim, em diferentes padrões | Sim |
| Dicionário universal lógico | Não é requisito geral | Objetivo central |
| Incorporação contínua de novas expressões | Depende da implementação | Objetivo central |
| Identificadores permanentes por expressão | Não é requisito geral | Princípio proposto |
| Evolução coletiva entre usuários | Não é requisito geral | Objetivo central |
| Independência de um único algoritmo | Depende da solução | Objetivo arquitetural |

**Observação:** esta tabela apresenta diferenças conceituais entre os objetivos das tecnologias. Não significa que todas as implementações existentes sejam incapazes de oferecer funcionalidades semelhantes.

---

## 4. Contribuição arquitetural proposta pelo JDA-ZIP UDE

A contribuição pretendida pelo UDE está na organização de uma arquitetura que reúne os seguintes princípios:

### 4.1. Base universal compartilhada

Uma única base lógica de referências, utilizada por diferentes usuários, dispositivos e aplicações.

A universalidade não significa que todos os dispositivos precisem manter permanentemente uma cópia integral da base.

### 4.2. Evolução cumulativa

A possibilidade de incorporar novas palavras e expressões à base conforme elas são identificadas e aprovadas.

Uma nova referência passa a estar disponível para os demais participantes.

### 4.3. Identificadores permanentes

Cada expressão cadastrada recebe um identificador exclusivo.

Os identificadores existentes não devem ser reutilizados para representar outras expressões.

### 4.4. Gestão centralizada

Uma infraestrutura central controla o cadastro, a validação, a geração de identificadores e a integridade das referências.

### 4.5. Compartilhamento entre aplicações

Diferentes implementações poderão consultar a mesma base, independentemente da linguagem de programação ou plataforma utilizada.

### 4.6. Sincronização incremental

Os clientes poderão atualizar somente as referências que ainda não possuem, reduzindo a necessidade de transferir repetidamente toda a base.

### 4.7. Operação online e offline

A arquitetura deverá permitir consultas à base central quando houver conexão e utilização de referências previamente sincronizadas quando não houver conexão.

---

## 5. Limites e questões ainda em investigação

A proposta ainda precisa ser validada tecnicamente.

Entre os principais pontos de investigação estão:

- Estratégia eficiente de indexação de milhões de expressões.
- Critérios para inclusão automática de novas referências.
- Prevenção de duplicidades e conflitos simultâneos.
- Estratégia de sincronização entre versões.
- Tamanho e desempenho do dicionário universal.
- Eficiência real da substituição de expressões.
- Comparação com algoritmos tradicionais de compressão.
- Segurança e integridade da base.
- Compatibilidade entre diferentes implementações.
- Viabilidade de utilização em conexões de baixa largura de banda.

A existência de tecnologias anteriores relacionadas não invalida a investigação de uma nova arquitetura, mas exige que suas diferenças sejam demonstradas por documentação, implementação e testes.

---

## 6. Referências técnicas

As seguintes publicações e especificações são referências importantes para o estudo da arquitetura:

| Referência | Assunto | Endereço |
|---|---|---|
| RFC 8878 | Zstandard | https://www.rfc-editor.org/rfc/rfc8878.html |
| RFC 7932 | Brotli | https://www.rfc-editor.org/rfc/rfc7932.html |
| RFC 9841 | Shared Brotli | https://www.rfc-editor.org/rfc/rfc9841.html |
| RFC 9842 | Compression Dictionary Transport | https://www.rfc-editor.org/rfc/rfc9842.html |

### Organizações relacionadas

- IETF — Internet Engineering Task Force: https://www.ietf.org/
- RFC Editor: https://www.rfc-editor.org/
- Zstandard: https://github.com/facebook/zstd

---

## 7. Declaração sobre originalidade e referências

O JDA-ZIP UDE reconhece que a compressão baseada em dicionários, a reutilização de referências e o transporte de dicionários compartilhados possuem antecedentes técnicos e implementações anteriores.

A proposta documentada neste projeto busca desenvolver uma arquitetura própria de dicionário universal dinâmico e evolutivo, combinando gestão centralizada, incorporação cumulativa de expressões, identificadores permanentes e compartilhamento entre diferentes usuários e sistemas.

A documentação não reivindica exclusividade sobre os conceitos gerais de compressão, dicionários compartilhados ou substituição de sequências.

A autoria da proposta arquitetural aqui documentada é atribuída a:

**Jonathan D. Andrade**

Projeto de origem: JDA-ZIP-PROTOCOL.

---

**JDA-ZIP UDE — Universal Dynamic Evolutionary Dictionary**

*Uma proposta de arquitetura para um dicionário compartilhado que evolui com seus usuários.*

Original architectural proposal by Jonathan D. Andrade.
