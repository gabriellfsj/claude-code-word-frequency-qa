# Word Frequency Analyzer

Analisador de frequência de palavras. O usuário insere um texto, clica em "Translate" e vê uma tabela com cada palavra única e sua contagem, ordenada da mais frequente para a menos frequente.

## Stack

- **HTML5** — estrutura semântica, com `charset="UTF-8"` obrigatório
- **CSS3** — estilo sem frameworks
- **JavaScript (ES6+)** — lógica pura, sem build tools
- **Chart.js (CDN)** — apenas se o bônus de gráfico (Fase 5) for implementado
- **Node.js + Express** — apenas se o bônus de URL (Fase 6) for implementado

Fases 1–5 rodam abrindo o `index.html` direto no navegador, sem nenhuma dependência externa. Node só entra na Fase 6.

---

## Fases de Desenvolvimento

### Fase 1 — Estrutura HTML
- Layout com: `<textarea maxlength="2048">`, botão "Translate", parágrafo de erro (oculto por padrão), `<table>` vazia
- Incluir `<meta charset="UTF-8">` no `<head>`

### Fase 2 — Lógica de Análise (JS)
- Validar se o campo está vazio ou só tem espaços — exibir mensagem de erro se sim
- Normalizar o texto: converter para lowercase, remover pontuação com regex
- Contar frequências usando `Map`
- Ordenar em ordem decrescente por contagem

### Fase 3 — Renderização da Tabela
- Limpar a tabela antes de cada nova análise (evitar acúmulo de resultados)
- Popular as linhas dinamicamente com palavra e contagem
- Ocultar a mensagem de erro quando a análise for bem-sucedida

### Fase 4 — Estilo (CSS)
- Variáveis CSS para cores e espaçamentos (`--color-primary`, `--color-error`, `--spacing-md`)
- Estilo da textarea: largura total, altura mínima confortável
- Estilo da tabela: bordas, cabeçalho destacado, linhas alternadas (zebra striping)
- Estilo do estado de erro: texto vermelho, visível
- Layout responsivo com `max-width` centralizado — mobile-first

### Fase 5 (Bônus) — Gráfico
- Integrar Chart.js via CDN
- Exibir gráfico de barras abaixo da tabela com as top 10 palavras mais frequentes

### Fase 6 (Bônus avançado) — Análise por URL
- Adicionar campo de URL na interface
- Backend Node/Express com rota `GET /fetch?url=...` que busca o HTML da página e extrai o texto
- Reutilizar o analisador existente com o texto retornado

---

## Estrutura de Pastas

**Fases 1–5 (sem backend):**
```
claude_code_teste_um/
├── index.html
├── style.css
├── app.js
├── app.md          # Especificação original do projeto
└── CLAUDE.md       # Este arquivo
```

**Fase 6 (com backend):**
```
claude_code_teste_um/
├── index.html
├── style.css
├── app.js
├── server.js       # Proxy Node/Express para buscar URL
├── package.json
├── app.md
└── CLAUDE.md
```

---

## Comandos para Rodar e Testar

### Abrir o projeto (Fases 1–5)
Recomendado: usar a extensão **Live Server** do VS Code (clique direito em `index.html` → "Open with Live Server").

Alternativa via terminal PowerShell:
```powershell
Start-Process "chrome.exe" index.html
# ou: Start-Process "msedge.exe" index.html
```

### Com backend (Fase 6)
```powershell
npm install
node server.js
# Acesse http://localhost:3000
```

### Testes manuais essenciais
- Inserir texto normal e verificar contagem correta
- Clicar em "Translate" com campo vazio — deve exibir mensagem de erro
- Inserir campo só com espaços — deve ser tratado como vazio e exibir erro
- Inserir texto com letras maiúsculas e minúsculas misturadas — deve contar como a mesma palavra
- Inserir texto com pontuação — vírgulas e pontos não devem fazer parte das palavras
- Inserir texto com números — definir se números são contados ou ignorados
- Verificar se a tabela está em ordem decrescente de frequência
- Clicar em "Translate" duas vezes seguidas — a tabela deve ser limpa e repopulada, sem duplicar linhas

---

## Convenções de Código

### JavaScript
- Usar `const` por padrão; `let` apenas quando reatribuição é necessária
- Funções nomeadas e declaradas separadamente — sem lógica inline no event listener
- `normalizeText(text)` — responsável por lowercase e remoção de pontuação
- `countWords(words)` — recebe array de palavras, retorna `Map<string, number>`
- `renderTable(wordMap)` — responsável por limpar e popular a tabela
- Usar `Map` (não objeto literal) para a contagem — mantém ordem de inserção e tem API mais clara

### HTML
- Elementos semânticos: `<main>`, `<section>`, `<table>`, `<caption>`
- IDs apenas para referência via JS; classes para estilo

### CSS
- Sem frameworks, sem reset externo — apenas `*, *::before, *::after { box-sizing: border-box }`
- Variáveis CSS no `:root` para todas as cores e espaçamentos reutilizados
- Mobile-first

### Geral
- Sem comentários óbvios — nomes de variáveis e funções devem ser autoexplicativos
- Máximo de 2048 caracteres aceitos na textarea (atributo `maxlength="2048"`)
