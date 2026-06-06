/**
 * @jest-environment jsdom
 */

// Mocks globais antes de qualquer require
global.Chart = jest.fn().mockImplementation(() => ({ destroy: jest.fn() }));
global.URL.createObjectURL = jest.fn(() => 'blob:mock');
global.URL.revokeObjectURL = jest.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({ matches: false, media: query })),
});

// HTML completo que app.js espera encontrar
document.body.innerHTML = `
  <div class="app-header">
    <h1>Word Frequency Analyzer</h1>
    <label class="toggle">
      <input type="checkbox" id="dark-mode-toggle" />
      <span>Modo escuro</span>
    </label>
  </div>
  <section class="input-section">
    <div class="input-options">
      <label for="text-input">Insira o texto:</label>
      <label class="toggle">
        <input type="checkbox" id="stop-words-toggle" />
        <span>Ignorar stop words</span>
      </label>
    </div>
    <textarea id="text-input" maxlength="2048"></textarea>
    <p class="char-count"><span id="char-count">0</span> / 2048</p>
    <div class="button-group">
      <button id="analyze-btn" type="button">Translate</button>
      <button id="clear-btn" type="button">Limpar</button>
    </div>
    <p id="error-message" class="error" hidden></p>
  </section>
  <section id="summary" hidden>
    <div class="summary-card"><span id="summary-total">0</span></div>
    <div class="summary-card"><span id="summary-unique">0</span></div>
    <div class="summary-card"><span id="summary-top">—</span></div>
  </section>
  <section class="results-section" hidden>
    <div class="results-header">
      <h2>Resultado</h2>
      <div class="results-actions">
        <input type="text" id="search-input" />
        <button id="export-btn" type="button">Exportar CSV</button>
      </div>
    </div>
    <table><thead><tr><th>Palavra</th><th>Frequência</th><th>%</th></tr></thead>
    <tbody id="table-body"></tbody></table>
    <canvas id="frequency-chart"></canvas>
  </section>
  <section id="history-section" hidden>
    <ul id="history-list"></ul>
  </section>
`;

// Disponibiliza funções puras como globais (simula wordFrequency.js via script tag)
const wf = require('../wordFrequency');
global.normalizeText    = wf.normalizeText;
global.countWords       = wf.countWords;
global.sortByFrequency  = wf.sortByFrequency;
global.filterStopWords  = wf.filterStopWords;

// Carrega o app
require('../app');

// Refs reutilizadas nos testes
const textInput       = document.getElementById('text-input');
const analyzeBtn      = document.getElementById('analyze-btn');
const clearBtn        = document.getElementById('clear-btn');
const exportBtn       = document.getElementById('export-btn');
const darkModeToggle  = document.getElementById('dark-mode-toggle');
const stopWordsToggle = document.getElementById('stop-words-toggle');
const searchInput     = document.getElementById('search-input');
const errorMessage    = document.getElementById('error-message');
const summarySection  = document.getElementById('summary');
const resultsSection  = document.querySelector('.results-section');
const tableBody       = document.getElementById('table-body');
const charCount       = document.getElementById('char-count');
const historySection  = document.getElementById('history-section');
const historyList     = document.getElementById('history-list');

beforeEach(() => {
  textInput.value        = '';
  searchInput.value      = '';
  stopWordsToggle.checked = false;
  charCount.textContent  = '0';
  errorMessage.hidden    = true;
  errorMessage.textContent = '';
  summarySection.hidden  = true;
  resultsSection.hidden  = true;
  historySection.hidden  = true;
  tableBody.innerHTML    = '';
  historyList.innerHTML  = '';
  localStorage.clear();
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Estado inicial
// ---------------------------------------------------------------------------
describe('estado inicial', () => {
  test('seção de resultados está oculta', () => {
    expect(resultsSection.hidden).toBe(true);
  });

  test('mensagem de erro está oculta', () => {
    expect(errorMessage.hidden).toBe(true);
  });

  test('resumo está oculto', () => {
    expect(summarySection.hidden).toBe(true);
  });

  test('histórico está oculto quando não há entradas', () => {
    expect(historySection.hidden).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Contador de caracteres
// ---------------------------------------------------------------------------
describe('contador de caracteres', () => {
  test('atualiza ao digitar', () => {
    textInput.value = 'hello';
    textInput.dispatchEvent(new Event('input'));
    expect(charCount.textContent).toBe('5');
  });

  test('exibe zero para textarea vazio', () => {
    textInput.value = '';
    textInput.dispatchEvent(new Event('input'));
    expect(charCount.textContent).toBe('0');
  });
});

// ---------------------------------------------------------------------------
// Validação
// ---------------------------------------------------------------------------
describe('validação', () => {
  test('campo vazio exibe mensagem de erro', () => {
    analyzeBtn.click();
    expect(errorMessage.hidden).toBe(false);
    expect(errorMessage.textContent).toMatch(/insira algum texto/i);
  });

  test('campo com apenas espaços exibe erro', () => {
    textInput.value = '   ';
    analyzeBtn.click();
    expect(errorMessage.hidden).toBe(false);
    expect(resultsSection.hidden).toBe(true);
  });

  test('campo com apenas números exibe erro específico', () => {
    textInput.value = '123 456 789';
    analyzeBtn.click();
    expect(errorMessage.hidden).toBe(false);
    expect(errorMessage.textContent).toMatch(/nenhuma palavra/i);
  });

  test('campo com apenas símbolos exibe erro específico', () => {
    textInput.value = '!@# $%^';
    analyzeBtn.click();
    expect(errorMessage.hidden).toBe(false);
    expect(resultsSection.hidden).toBe(true);
  });

  test('erro é ocultado após análise bem-sucedida', () => {
    analyzeBtn.click();
    expect(errorMessage.hidden).toBe(false);
    textInput.value = 'hello world';
    analyzeBtn.click();
    expect(errorMessage.hidden).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Análise com texto válido
// ---------------------------------------------------------------------------
describe('análise com texto válido', () => {
  test('exibe seção de resultados', () => {
    textInput.value = 'hello world';
    analyzeBtn.click();
    expect(resultsSection.hidden).toBe(false);
  });

  test('tabela tem número correto de linhas', () => {
    textInput.value = 'the cat sat on the mat the cat';
    analyzeBtn.click();
    expect(tableBody.querySelectorAll('tr')).toHaveLength(5);
  });

  test('primeira linha é a palavra mais frequente', () => {
    textInput.value = 'the cat sat on the mat the cat';
    analyzeBtn.click();
    const first = tableBody.querySelector('tr');
    expect(first.cells[0].textContent).toBe('the');
    expect(first.cells[1].textContent).toBe('3');
  });

  test('linhas estão em ordem decrescente de frequência', () => {
    textInput.value = 'a a a b b c';
    analyzeBtn.click();
    const counts = [...tableBody.querySelectorAll('tr')].map(r => Number(r.cells[1].textContent));
    for (let i = 0; i < counts.length - 1; i++) {
      expect(counts[i]).toBeGreaterThanOrEqual(counts[i + 1]);
    }
  });

  test('clicar Translate duas vezes não duplica linhas', () => {
    textInput.value = 'hello world';
    analyzeBtn.click();
    analyzeBtn.click();
    expect(tableBody.querySelectorAll('tr')).toHaveLength(2);
  });

  test('chama Chart ao analisar', () => {
    textInput.value = 'hello world hello';
    analyzeBtn.click();
    expect(global.Chart).toHaveBeenCalledTimes(1);
  });

  test('destrói gráfico anterior antes de criar novo', () => {
    textInput.value = 'hello world';
    analyzeBtn.click();
    const first = global.Chart.mock.results[0].value;
    textInput.value = 'foo bar';
    analyzeBtn.click();
    expect(first.destroy).toHaveBeenCalledTimes(1);
    expect(global.Chart).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// Porcentagem na tabela
// ---------------------------------------------------------------------------
describe('porcentagem na tabela', () => {
  test('cada linha tem coluna de porcentagem', () => {
    textInput.value = 'word word other';
    analyzeBtn.click();
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
      expect(row.cells).toHaveLength(3);
      expect(row.cells[2].textContent).toMatch(/%$/);
    });
  });

  test('porcentagem da palavra com 100% é correta', () => {
    textInput.value = 'word';
    analyzeBtn.click();
    const row = tableBody.querySelector('tr');
    expect(row.cells[2].textContent).toBe('100.0%');
  });

  test('soma das porcentagens é aproximadamente 100%', () => {
    textInput.value = 'a a b c';
    analyzeBtn.click();
    const rows = tableBody.querySelectorAll('tr');
    const total = [...rows].reduce((sum, r) => sum + parseFloat(r.cells[2].textContent), 0);
    expect(total).toBeCloseTo(100, 0);
  });
});

// ---------------------------------------------------------------------------
// Resumo da análise
// ---------------------------------------------------------------------------
describe('resumo da análise', () => {
  test('exibe resumo após análise bem-sucedida', () => {
    textInput.value = 'hello world hello';
    analyzeBtn.click();
    expect(summarySection.hidden).toBe(false);
  });

  test('total de palavras está correto', () => {
    textInput.value = 'a b c a';
    analyzeBtn.click();
    expect(document.getElementById('summary-total').textContent).toBe('4');
  });

  test('total de palavras únicas está correto', () => {
    textInput.value = 'a b c a';
    analyzeBtn.click();
    expect(document.getElementById('summary-unique').textContent).toBe('3');
  });

  test('palavra mais frequente está correta', () => {
    textInput.value = 'cat cat dog';
    analyzeBtn.click();
    expect(document.getElementById('summary-top').textContent).toBe('cat');
  });

  test('resumo é ocultado ao limpar', () => {
    textInput.value = 'hello world';
    analyzeBtn.click();
    clearBtn.click();
    expect(summarySection.hidden).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Botão Limpar
// ---------------------------------------------------------------------------
describe('botão Limpar', () => {
  test('limpa o texto da textarea', () => {
    textInput.value = 'hello';
    clearBtn.click();
    expect(textInput.value).toBe('');
  });

  test('oculta a seção de resultados', () => {
    textInput.value = 'hello';
    analyzeBtn.click();
    clearBtn.click();
    expect(resultsSection.hidden).toBe(true);
  });

  test('oculta a mensagem de erro', () => {
    analyzeBtn.click();
    clearBtn.click();
    expect(errorMessage.hidden).toBe(true);
  });

  test('zera o contador de caracteres', () => {
    textInput.value = 'hello';
    textInput.dispatchEvent(new Event('input'));
    clearBtn.click();
    expect(charCount.textContent).toBe('0');
  });

  test('limpa o campo de busca', () => {
    searchInput.value = 'foo';
    clearBtn.click();
    expect(searchInput.value).toBe('');
  });
});

// ---------------------------------------------------------------------------
// Filtro de stop words
// ---------------------------------------------------------------------------
describe('filtro de stop words', () => {
  test('com filtro ativado, remove palavras comuns em inglês', () => {
    stopWordsToggle.checked = true;
    textInput.value = 'the cat sat on the mat';
    analyzeBtn.click();
    const words = [...tableBody.querySelectorAll('tr')].map(r => r.cells[0].textContent);
    expect(words).not.toContain('the');
    expect(words).not.toContain('on');
    expect(words).toContain('cat');
    expect(words).toContain('sat');
    expect(words).toContain('mat');
  });

  test('com filtro ativado, remove stop words em português', () => {
    stopWordsToggle.checked = true;
    textInput.value = 'o gato e o rato';
    analyzeBtn.click();
    const words = [...tableBody.querySelectorAll('tr')].map(r => r.cells[0].textContent);
    expect(words).not.toContain('o');
    expect(words).not.toContain('e');
    expect(words).toContain('gato');
    expect(words).toContain('rato');
  });

  test('com filtro desativado, mantém todas as palavras', () => {
    stopWordsToggle.checked = false;
    textInput.value = 'the cat';
    analyzeBtn.click();
    const words = [...tableBody.querySelectorAll('tr')].map(r => r.cells[0].textContent);
    expect(words).toContain('the');
    expect(words).toContain('cat');
  });

  test('texto composto só de stop words com filtro ativo exibe erro', () => {
    stopWordsToggle.checked = true;
    textInput.value = 'the and or but';
    analyzeBtn.click();
    expect(errorMessage.hidden).toBe(false);
    expect(errorMessage.textContent).toMatch(/nenhuma palavra/i);
  });
});

// ---------------------------------------------------------------------------
// Busca na tabela
// ---------------------------------------------------------------------------
describe('busca na tabela', () => {
  beforeEach(() => {
    textInput.value = 'apple banana apricot cherry';
    analyzeBtn.click();
  });

  test('filtra linhas que não correspondem à busca', () => {
    searchInput.value = 'ap';
    searchInput.dispatchEvent(new Event('input'));
    const visible = [...tableBody.querySelectorAll('tr')].filter(r => !r.hidden);
    expect(visible.length).toBe(2); // apple, apricot
    visible.forEach(r => expect(r.cells[0].textContent).toMatch(/ap/));
  });

  test('busca vazia exibe todas as linhas', () => {
    searchInput.value = 'ap';
    searchInput.dispatchEvent(new Event('input'));
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('input'));
    const visible = [...tableBody.querySelectorAll('tr')].filter(r => !r.hidden);
    expect(visible.length).toBe(4);
  });

  test('busca sem correspondência oculta todas as linhas', () => {
    searchInput.value = 'xyz';
    searchInput.dispatchEvent(new Event('input'));
    const visible = [...tableBody.querySelectorAll('tr')].filter(r => !r.hidden);
    expect(visible.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Exportar CSV
// ---------------------------------------------------------------------------
describe('exportar CSV', () => {
  beforeEach(() => {
    clearBtn.click(); // garante currentWordMap = null entre testes
  });

  test('chama URL.createObjectURL ao clicar em exportar com resultados', () => {
    textInput.value = 'hello world';
    analyzeBtn.click();
    exportBtn.click();
    expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1);
  });

  test('não chama URL.createObjectURL sem resultados', () => {
    exportBtn.click();
    expect(global.URL.createObjectURL).not.toHaveBeenCalled();
  });

  test('revoga a URL criada após o clique', () => {
    textInput.value = 'hello world';
    analyzeBtn.click();
    exportBtn.click();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock');
  });
});

// ---------------------------------------------------------------------------
// Atalho de teclado Ctrl+Enter
// ---------------------------------------------------------------------------
describe('atalho Ctrl+Enter', () => {
  test('dispara análise com texto válido', () => {
    textInput.value = 'hello world';
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true }));
    expect(resultsSection.hidden).toBe(false);
  });

  test('exibe erro com campo vazio', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true }));
    expect(errorMessage.hidden).toBe(false);
  });

  test('não dispara análise sem Ctrl', () => {
    textInput.value = 'hello world';
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: false, bubbles: true }));
    expect(resultsSection.hidden).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Histórico
// ---------------------------------------------------------------------------
describe('histórico', () => {
  test('aparece após análise bem-sucedida', () => {
    textInput.value = 'hello world';
    analyzeBtn.click();
    expect(historySection.hidden).toBe(false);
  });

  test('adiciona entrada ao localStorage', () => {
    textInput.value = 'hello world';
    analyzeBtn.click();
    const saved = JSON.parse(localStorage.getItem('wfa_history'));
    expect(saved).toHaveLength(1);
    expect(saved[0].totalWords).toBe(2);
    expect(saved[0].uniqueWords).toBe(2);
  });

  test('mantém no máximo 5 entradas', () => {
    for (let i = 0; i < 6; i++) {
      textInput.value = `word${i} test`;
      analyzeBtn.click();
    }
    const saved = JSON.parse(localStorage.getItem('wfa_history'));
    expect(saved).toHaveLength(5);
  });

  test('entrada mais recente aparece primeiro', () => {
    textInput.value = 'first';
    analyzeBtn.click();
    textInput.value = 'second analysis';
    analyzeBtn.click();
    const saved = JSON.parse(localStorage.getItem('wfa_history'));
    expect(saved[0].preview).toContain('second');
  });
});

// ---------------------------------------------------------------------------
// Dark mode
// ---------------------------------------------------------------------------
describe('dark mode', () => {
  test('toggle ativa dark mode e atualiza data-theme', () => {
    darkModeToggle.checked = true;
    darkModeToggle.dispatchEvent(new Event('change'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  test('toggle desativa dark mode e atualiza data-theme', () => {
    darkModeToggle.checked = true;
    darkModeToggle.dispatchEvent(new Event('change'));
    darkModeToggle.checked = false;
    darkModeToggle.dispatchEvent(new Event('change'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  test('preferência é salva no localStorage', () => {
    darkModeToggle.checked = true;
    darkModeToggle.dispatchEvent(new Event('change'));
    expect(localStorage.getItem('wfa_theme')).toBe('dark');
  });
});

// ---------------------------------------------------------------------------
// Destaque ao clicar na linha da tabela
// ---------------------------------------------------------------------------
describe('destaque ao clicar na linha', () => {
  test('seleciona a palavra na textarea ao clicar na linha', () => {
    textInput.value = 'hello world hello';
    analyzeBtn.click();
    const helloRow = [...tableBody.querySelectorAll('tr')].find(r => r.cells[0].textContent === 'hello');
    const spy = jest.spyOn(textInput, 'setSelectionRange');
    helloRow.click();
    expect(spy).toHaveBeenCalledWith(0, 5); // 'hello' começa no índice 0
  });
});

// ---------------------------------------------------------------------------
// Análise em tempo real (debounce)
// ---------------------------------------------------------------------------
describe('análise em tempo real', () => {
  beforeEach(() => { jest.useFakeTimers(); });
  afterEach(() => { jest.useRealTimers(); });

  test('não dispara análise antes de 800ms', () => {
    textInput.value = 'hello world';
    textInput.dispatchEvent(new Event('input'));
    jest.advanceTimersByTime(799);
    expect(resultsSection.hidden).toBe(true);
  });

  test('dispara análise após 800ms de inatividade', () => {
    textInput.value = 'hello world';
    textInput.dispatchEvent(new Event('input'));
    jest.advanceTimersByTime(800);
    expect(resultsSection.hidden).toBe(false);
  });

  test('múltiplas digitações reiniciam o timer', () => {
    textInput.value = 'hello';
    textInput.dispatchEvent(new Event('input'));
    jest.advanceTimersByTime(400);
    textInput.value = 'hello world';
    textInput.dispatchEvent(new Event('input'));
    jest.advanceTimersByTime(400);
    expect(resultsSection.hidden).toBe(true); // timer reiniciou, ainda não disparou
    jest.advanceTimersByTime(400);
    expect(resultsSection.hidden).toBe(false); // agora disparou
  });
});
