# Plano de Testes — Word Frequency Analyzer

## Informações Gerais

| Campo | Valor |
|---|---|
| Aplicação | Word Frequency Analyzer |
| URL base | `index.html` (arquivo local) ou `http://localhost` (Live Server) |
| Ambiente | Browser (Chrome/Edge) |
| Objetivo | Validar o comportamento da aplicação para automação web |

---

## Seletores de Referência

| Elemento | Seletor |
|---|---|
| Textarea de texto | `#text-input` |
| Contador de caracteres | `#char-count` |
| Botão Translate | `#analyze-btn` |
| Mensagem de erro | `#error-message` |
| Seção de resultados | `.results-section` |
| Corpo da tabela | `#table-body` |
| Linhas da tabela | `#table-body tr` |
| Primeira linha da tabela | `#table-body tr:first-child` |
| Canvas do gráfico | `#frequency-chart` |

---

## Módulo 1 — Estado Inicial da Página

### TC001 — Página carrega com todos os elementos obrigatórios
- **Tipo:** Positivo
- **Pré-condição:** Abrir a aplicação em um browser
- **Passos:**
  1. Acessar a URL da aplicação
- **Resultado esperado:**
  - Título "Word Frequency Analyzer" visível
  - Textarea presente e vazia
  - Botão "Translate" visível
  - Contador exibindo "0 / 2048 caracteres"
- **Notas de automação:** Verificar presença e visibilidade de `#text-input`, `#analyze-btn`, `#char-count`

---

### TC002 — Seção de resultados está oculta no carregamento
- **Tipo:** Positivo
- **Pré-condição:** Abrir a aplicação em um browser
- **Passos:**
  1. Acessar a URL da aplicação sem interagir com nada
- **Resultado esperado:** A seção `.results-section` não está visível
- **Notas de automação:** Verificar atributo `hidden` em `.results-section`

---

### TC003 — Mensagem de erro está oculta no carregamento
- **Tipo:** Positivo
- **Pré-condição:** Abrir a aplicação em um browser
- **Passos:**
  1. Acessar a URL da aplicação sem interagir com nada
- **Resultado esperado:** O elemento `#error-message` não está visível
- **Notas de automação:** Verificar atributo `hidden` em `#error-message`

---

## Módulo 2 — Textarea e Contador de Caracteres

### TC004 — Contador atualiza ao digitar
- **Tipo:** Positivo
- **Pré-condição:** Aplicação carregada, textarea vazia
- **Passos:**
  1. Clicar na textarea
  2. Digitar "hello"
- **Resultado esperado:** `#char-count` exibe "5"
- **Notas de automação:** Verificar `textContent` de `#char-count` após `type`

---

### TC005 — Contador volta a zero ao limpar o campo
- **Tipo:** Positivo
- **Pré-condição:** Textarea com texto
- **Passos:**
  1. Digitar qualquer texto na textarea
  2. Apagar todo o texto
- **Resultado esperado:** `#char-count` exibe "0"

---

### TC006 — Textarea limita entrada a 2048 caracteres
- **Tipo:** Negativo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Colar um texto com 2100 caracteres na textarea
- **Resultado esperado:**
  - Apenas 2048 caracteres são aceitos
  - Contador exibe "2048"
- **Notas de automação:** Gerar string de 2100 chars, verificar `value.length === 2048`

---

### TC007 — Contador exibe valor correto para texto com espaços
- **Tipo:** Positivo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Digitar "hello world" (11 caracteres incluindo o espaço)
- **Resultado esperado:** Contador exibe "11"

---

## Módulo 3 — Validação do Botão Translate

### TC008 — Campo vazio exibe mensagem de erro
- **Tipo:** Negativo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Clicar no botão "Translate"
- **Resultado esperado:**
  - `#error-message` fica visível
  - Texto do erro contém "insira algum texto"
  - Seção de resultados permanece oculta

---

### TC009 — Campo com apenas espaços exibe mensagem de erro
- **Tipo:** Negativo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Digitar três espaços na textarea
  2. Clicar no botão "Translate"
- **Resultado esperado:**
  - `#error-message` fica visível
  - Seção de resultados permanece oculta

---

### TC010 — Campo com apenas números exibe erro específico
- **Tipo:** Negativo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Digitar "123 456 789" na textarea
  2. Clicar no botão "Translate"
- **Resultado esperado:**
  - `#error-message` fica visível
  - Texto do erro contém "nenhuma palavra"
  - Seção de resultados permanece oculta

---

### TC011 — Campo com apenas símbolos exibe erro específico
- **Tipo:** Negativo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Digitar "!@# $%^ &*()" na textarea
  2. Clicar no botão "Translate"
- **Resultado esperado:**
  - `#error-message` fica visível
  - Texto do erro contém "nenhuma palavra"
  - Seção de resultados permanece oculta

---

### TC012 — Seção de resultados não aparece em caso de erro
- **Tipo:** Negativo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Clicar no botão "Translate" sem texto
- **Resultado esperado:** `.results-section` permanece com `hidden`

---

## Módulo 4 — Análise de Texto Válido

### TC013 — Análise bem-sucedida exibe seção de resultados
- **Tipo:** Positivo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Digitar "hello world" na textarea
  2. Clicar no botão "Translate"
- **Resultado esperado:** `.results-section` torna-se visível

---

### TC014 — Análise bem-sucedida oculta mensagem de erro anterior
- **Tipo:** Positivo
- **Pré-condição:** Aplicação com erro exibido (clicar Translate com campo vazio)
- **Passos:**
  1. Digitar texto válido na textarea
  2. Clicar no botão "Translate"
- **Resultado esperado:** `#error-message` volta a ter `hidden`

---

### TC015 — Letras maiúsculas e minúsculas são tratadas como a mesma palavra
- **Tipo:** Positivo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Digitar "Hello hello HELLO" na textarea
  2. Clicar no botão "Translate"
- **Resultado esperado:**
  - Tabela contém apenas 1 linha
  - A palavra "hello" aparece com contagem 3

---

### TC016 — Pontuação não é incluída nas palavras
- **Tipo:** Positivo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Digitar "hello, world!" na textarea
  2. Clicar no botão "Translate"
- **Resultado esperado:**
  - Tabela contém 2 linhas: "hello" e "world"
  - Nenhuma linha contém vírgula ou ponto de exclamação

---

### TC017 — Texto com acentuação é analisado corretamente
- **Tipo:** Positivo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Digitar "ação ação coração" na textarea
  2. Clicar no botão "Translate"
- **Resultado esperado:**
  - "ação" aparece com contagem 2
  - "coração" aparece com contagem 1

---

### TC018 — Números misturados com letras são removidos da palavra
- **Tipo:** Positivo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Digitar "word1 word2 word1" na textarea
  2. Clicar no botão "Translate"
- **Resultado esperado:**
  - "word" aparece com contagem 3 (números removidos)
  - Sem linhas contendo dígitos

---

## Módulo 5 — Tabela de Resultados

### TC019 — Tabela possui cabeçalhos corretos
- **Tipo:** Positivo
- **Pré-condição:** Realizar análise com texto válido
- **Passos:**
  1. Digitar qualquer texto e clicar "Translate"
- **Resultado esperado:** Cabeçalhos da tabela: "Palavra", "Frequência" e "%"

---

### TC020 — Número de linhas corresponde ao total de palavras únicas
- **Tipo:** Positivo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Digitar "the cat sat on the mat the cat" na textarea
  2. Clicar no botão "Translate"
- **Resultado esperado:** Tabela contém exatamente 5 linhas (the, cat, sat, on, mat)

---

### TC021 — Primeira linha contém a palavra mais frequente
- **Tipo:** Positivo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Digitar "the cat sat on the mat the cat" na textarea
  2. Clicar no botão "Translate"
- **Resultado esperado:**
  - Primeira linha: palavra "the", frequência "3"

---

### TC022 — Tabela está ordenada em ordem decrescente de frequência
- **Tipo:** Positivo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Digitar "a a a b b c" na textarea
  2. Clicar no botão "Translate"
- **Resultado esperado:**
  - Linha 1: "a" — 3
  - Linha 2: "b" — 2
  - Linha 3: "c" — 1

---

### TC023 — Contagem de palavras está correta
- **Tipo:** Positivo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Digitar "word word word" na textarea
  2. Clicar no botão "Translate"
- **Resultado esperado:**
  - Tabela tem 1 linha com palavra "word" e frequência "3"

---

## Módulo 6 — Comportamento ao Reanalisar

### TC024 — Analisar duas vezes não duplica linhas na tabela
- **Tipo:** Positivo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Digitar "hello world" na textarea
  2. Clicar no botão "Translate"
  3. Clicar no botão "Translate" novamente sem alterar o texto
- **Resultado esperado:** Tabela contém exatamente 2 linhas

---

### TC025 — Novo texto substitui completamente os resultados anteriores
- **Tipo:** Positivo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Digitar "hello world foo" na textarea e clicar "Translate" (3 linhas)
  2. Limpar a textarea
  3. Digitar "one two" na textarea
  4. Clicar no botão "Translate"
- **Resultado esperado:** Tabela contém exatamente 2 linhas ("one" e "two")

---

### TC026 — Erro é exibido ao reanalisar com campo vazio
- **Tipo:** Negativo
- **Pré-condição:** Análise anterior bem-sucedida com resultados visíveis
- **Passos:**
  1. Realizar análise com texto válido
  2. Limpar a textarea
  3. Clicar no botão "Translate"
- **Resultado esperado:**
  - `#error-message` fica visível
  - `.results-section` volta a ser oculta

---

## Módulo 7 — Gráfico

### TC027 — Gráfico é exibido após análise bem-sucedida
- **Tipo:** Positivo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Digitar texto com pelo menos uma palavra
  2. Clicar no botão "Translate"
- **Resultado esperado:** O `canvas#frequency-chart` está visível dentro de `.chart-container`

---

### TC028 — Gráfico exibe no máximo 10 barras
- **Tipo:** Positivo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Digitar texto com 15 palavras únicas diferentes
  2. Clicar no botão "Translate"
- **Resultado esperado:** O gráfico exibe no máximo 10 barras (top 10 palavras)
- **Notas de automação:** Verificar via API do Chart.js ou contar elementos SVG no canvas

---

### TC029 — Gráfico é atualizado ao reanalisar
- **Tipo:** Positivo
- **Pré-condição:** Análise anterior realizada
- **Passos:**
  1. Realizar análise com texto "hello world"
  2. Limpar textarea e digitar "foo bar baz"
  3. Clicar "Translate"
- **Resultado esperado:** Gráfico atualiza com os novos dados sem erros visuais

---

## Módulo 8 — Responsividade

### TC030 — Layout em viewport mobile (375px)
- **Tipo:** Positivo
- **Pré-condição:** Browser com viewport configurado em 375px de largura
- **Passos:**
  1. Acessar a aplicação com viewport de 375px
- **Resultado esperado:**
  - Todos os elementos estão visíveis sem overflow horizontal
  - Botão "Translate" ocupa a largura total da tela

---

### TC031 — Textarea ocupa largura total em qualquer viewport
- **Tipo:** Positivo
- **Pré-condição:** Browser com viewport configurado em 375px
- **Passos:**
  1. Acessar a aplicação com viewport de 375px
- **Resultado esperado:** Textarea ocupa 100% da largura disponível

---

---

## Módulo 9 — Botão Limpar

### TC032 — Botão Limpar apaga o texto da textarea
- **Tipo:** Positivo
- **Pré-condição:** Textarea com texto digitado
- **Passos:**
  1. Digitar qualquer texto na textarea
  2. Clicar no botão "Limpar"
- **Resultado esperado:** Textarea vazia, contador exibe "0"
- **Notas de automação:** Verificar `value` de `#text-input` e `textContent` de `#char-count`

---

### TC033 — Botão Limpar oculta resultados e resumo
- **Tipo:** Positivo
- **Pré-condição:** Análise bem-sucedida com resultados visíveis
- **Passos:**
  1. Realizar análise com texto válido
  2. Clicar no botão "Limpar"
- **Resultado esperado:** `.results-section` e `#summary` ficam ocultos

---

### TC034 — Botão Limpar oculta mensagem de erro
- **Tipo:** Positivo
- **Pré-condição:** Mensagem de erro visível (campo vazio + Translate)
- **Passos:**
  1. Clicar "Translate" com campo vazio (erro aparece)
  2. Clicar "Limpar"
- **Resultado esperado:** `#error-message` fica oculto

---

## Módulo 10 — Resumo da Análise

### TC035 — Resumo exibe total de palavras correto
- **Tipo:** Positivo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Digitar "a b c a" (4 tokens) na textarea
  2. Clicar "Translate"
- **Resultado esperado:** `#summary-total` exibe "4"

---

### TC036 — Resumo exibe total de palavras únicas correto
- **Tipo:** Positivo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Digitar "a b c a" na textarea
  2. Clicar "Translate"
- **Resultado esperado:** `#summary-unique` exibe "3"

---

### TC037 — Resumo exibe a palavra mais frequente
- **Tipo:** Positivo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Digitar "cat cat dog" na textarea
  2. Clicar "Translate"
- **Resultado esperado:** `#summary-top` exibe "cat"

---

## Módulo 11 — Porcentagem na Tabela

### TC038 — Cada linha da tabela contém coluna de porcentagem
- **Tipo:** Positivo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Digitar qualquer texto válido e clicar "Translate"
- **Resultado esperado:** Cada `<tr>` em `#table-body` tem 3 células, a terceira termina com "%"

---

### TC039 — Porcentagem de uma única palavra é 100%
- **Tipo:** Positivo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Digitar "word" na textarea
  2. Clicar "Translate"
- **Resultado esperado:** Terceira célula da única linha exibe "100.0%"

---

## Módulo 12 — Filtro de Stop Words

### TC040 — Stop words em inglês são removidas com filtro ativado
- **Tipo:** Positivo
- **Pré-condição:** Toggle "Ignorar stop words" desativado
- **Passos:**
  1. Ativar o toggle "Ignorar stop words"
  2. Digitar "the cat sat on the mat"
  3. Clicar "Translate"
- **Resultado esperado:** Tabela não contém "the" nem "on"; contém "cat", "sat", "mat"
- **Notas de automação:** Seletor `#stop-words-toggle`

---

### TC041 — Stop words em português são removidas com filtro ativado
- **Tipo:** Positivo
- **Pré-condição:** Toggle "Ignorar stop words" desativado
- **Passos:**
  1. Ativar o toggle "Ignorar stop words"
  2. Digitar "o gato e o rato"
  3. Clicar "Translate"
- **Resultado esperado:** Tabela não contém "o" nem "e"; contém "gato" e "rato"

---

### TC042 — Texto composto só de stop words exibe erro com filtro ativado
- **Tipo:** Negativo
- **Pré-condição:** Toggle "Ignorar stop words" desativado
- **Passos:**
  1. Ativar o toggle "Ignorar stop words"
  2. Digitar "the and or but"
  3. Clicar "Translate"
- **Resultado esperado:** `#error-message` visível com texto sobre "nenhuma palavra"

---

### TC043 — Com filtro desativado, stop words são contadas normalmente
- **Tipo:** Positivo
- **Pré-condição:** Toggle "Ignorar stop words" desativado (padrão)
- **Passos:**
  1. Digitar "the cat the" na textarea
  2. Clicar "Translate"
- **Resultado esperado:** "the" aparece na tabela com contagem 2

---

## Módulo 13 — Busca na Tabela

### TC044 — Busca filtra linhas que não correspondem
- **Tipo:** Positivo
- **Pré-condição:** Análise realizada com "apple banana apricot cherry"
- **Passos:**
  1. Digitar "ap" no campo `#search-input`
- **Resultado esperado:** Apenas "apple" e "apricot" ficam visíveis
- **Notas de automação:** Verificar `hidden` em linhas de `#table-body`

---

### TC045 — Busca vazia exibe todas as linhas
- **Tipo:** Positivo
- **Pré-condição:** Busca ativa com texto filtrado
- **Passos:**
  1. Limpar o campo `#search-input`
- **Resultado esperado:** Todas as linhas da tabela ficam visíveis

---

### TC046 — Busca sem correspondência oculta todas as linhas
- **Tipo:** Negativo
- **Pré-condição:** Análise realizada com qualquer texto
- **Passos:**
  1. Digitar "xyz" no campo `#search-input`
- **Resultado esperado:** Nenhuma linha visível em `#table-body`

---

## Módulo 14 — Exportar CSV

### TC047 — Botão Exportar CSV inicia download com resultados disponíveis
- **Tipo:** Positivo
- **Pré-condição:** Análise bem-sucedida realizada
- **Passos:**
  1. Clicar no botão "Exportar CSV"
- **Resultado esperado:** Download do arquivo `word-frequency.csv` é iniciado
- **Notas de automação:** Monitorar criação de elemento `<a>` com `download` attribute

---

### TC048 — CSV exportado contém cabeçalhos e dados corretos
- **Tipo:** Positivo
- **Pré-condição:** Análise realizada com "word word other"
- **Passos:**
  1. Clicar "Exportar CSV" e abrir o arquivo
- **Resultado esperado:** Primeira linha contém "Palavra,Frequência,Porcentagem"; dados em ordem decrescente

---

## Módulo 15 — Atalho de Teclado

### TC049 — Ctrl+Enter dispara análise com texto válido
- **Tipo:** Positivo
- **Pré-condição:** Textarea com texto válido
- **Passos:**
  1. Digitar texto na textarea
  2. Pressionar Ctrl+Enter
- **Resultado esperado:** Análise executada, resultados exibidos

---

### TC050 — Ctrl+Enter exibe erro com campo vazio
- **Tipo:** Negativo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Pressionar Ctrl+Enter sem digitar nada
- **Resultado esperado:** `#error-message` fica visível

---

### TC051 — Enter sem Ctrl não dispara análise
- **Tipo:** Negativo
- **Pré-condição:** Textarea com texto
- **Passos:**
  1. Pressionar Enter (sem Ctrl) na textarea
- **Resultado esperado:** Nenhuma análise disparada; resultados permanecem ocultos

---

## Módulo 16 — Histórico de Análises

### TC052 — Histórico aparece após primeira análise
- **Tipo:** Positivo
- **Pré-condição:** Histórico vazio
- **Passos:**
  1. Realizar análise com qualquer texto válido
- **Resultado esperado:** `#history-section` torna-se visível com 1 item

---

### TC053 — Histórico mantém no máximo 5 entradas
- **Tipo:** Positivo
- **Pré-condição:** Histórico vazio
- **Passos:**
  1. Realizar 6 análises com textos diferentes
- **Resultado esperado:** `#history-list` contém exatamente 5 itens

---

### TC054 — Entrada mais recente aparece no topo do histórico
- **Tipo:** Positivo
- **Pré-condição:** Uma análise já realizada
- **Passos:**
  1. Realizar segunda análise com texto diferente
- **Resultado esperado:** Primeira entrada do histórico contém o texto da segunda análise

---

## Módulo 17 — Dark Mode

### TC055 — Toggle ativa o modo escuro
- **Tipo:** Positivo
- **Pré-condição:** Aplicação em modo claro
- **Passos:**
  1. Clicar no toggle "Modo escuro"
- **Resultado esperado:** `<html>` recebe `data-theme="dark"`
- **Notas de automação:** `document.documentElement.getAttribute('data-theme')`

---

### TC056 — Toggle desativa o modo escuro
- **Tipo:** Positivo
- **Pré-condição:** Aplicação em modo escuro
- **Passos:**
  1. Clicar no toggle "Modo escuro" novamente
- **Resultado esperado:** `<html>` recebe `data-theme="light"`

---

### TC057 — Preferência de tema é salva no localStorage
- **Tipo:** Positivo
- **Pré-condição:** Aplicação em modo claro
- **Passos:**
  1. Ativar o toggle "Modo escuro"
- **Resultado esperado:** `localStorage.getItem('wfa_theme')` retorna `"dark"`

---

## Módulo 18 — Análise em Tempo Real

### TC058 — Análise não dispara antes de 800ms após última digitação
- **Tipo:** Positivo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Digitar "hello world"
  2. Verificar imediatamente após digitar (< 800ms)
- **Resultado esperado:** `.results-section` ainda está oculta

---

### TC059 — Análise dispara automaticamente após 800ms de inatividade
- **Tipo:** Positivo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Digitar "hello world"
  2. Aguardar 800ms sem digitar
- **Resultado esperado:** `.results-section` torna-se visível

---

### TC060 — Digitar novamente reinicia o timer de 800ms
- **Tipo:** Positivo
- **Pré-condição:** Textarea vazia
- **Passos:**
  1. Digitar "hello"
  2. Após 400ms, digitar " world"
  3. Verificar após outros 400ms (total 800ms desde início, mas só 400ms desde última digitação)
- **Resultado esperado:** `.results-section` ainda oculta; análise dispara somente após 800ms da última digitação

---

## Módulo 19 — Destaque ao Clicar na Palavra

### TC061 — Clicar em uma linha seleciona a palavra na textarea
- **Tipo:** Positivo
- **Pré-condição:** Análise realizada com "hello world hello"
- **Passos:**
  1. Clicar na linha "hello" da tabela
- **Resultado esperado:** A palavra "hello" fica selecionada (destacada) na textarea
- **Notas de automação:** Verificar `selectionStart` e `selectionEnd` de `#text-input`

---

## Resumo dos Casos de Teste

| Módulo | Total | Positivos | Negativos |
|---|---|---|---|
| 1 — Estado Inicial | 3 | 3 | 0 |
| 2 — Textarea e Contador | 4 | 3 | 1 |
| 3 — Validação | 5 | 0 | 5 |
| 4 — Análise Válida | 6 | 6 | 0 |
| 5 — Tabela | 5 | 5 | 0 |
| 6 — Reanálise | 3 | 2 | 1 |
| 7 — Gráfico | 3 | 3 | 0 |
| 8 — Responsividade | 2 | 2 | 0 |
| 9 — Botão Limpar | 3 | 3 | 0 |
| 10 — Resumo da Análise | 3 | 3 | 0 |
| 11 — Porcentagem | 2 | 2 | 0 |
| 12 — Stop Words | 4 | 3 | 1 |
| 13 — Busca na Tabela | 3 | 2 | 1 |
| 14 — Exportar CSV | 2 | 2 | 0 |
| 15 — Atalho de Teclado | 3 | 2 | 1 |
| 16 — Histórico | 3 | 3 | 0 |
| 17 — Dark Mode | 3 | 3 | 0 |
| 18 — Análise em Tempo Real | 3 | 3 | 0 |
| 19 — Destaque na Palavra | 1 | 1 | 0 |
| **Total** | **61** | **51** | **10** |
