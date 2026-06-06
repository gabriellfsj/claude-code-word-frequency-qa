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
const chartCanvas     = document.getElementById('frequency-chart');
const historySection  = document.getElementById('history-section');
const historyList     = document.getElementById('history-list');

const HISTORY_KEY = 'wfa_history';
const MAX_HISTORY = 5;
const DEBOUNCE_MS = 800;

let frequencyChart = null;
let currentWordMap = null;
let debounceTimer  = null;

// --- Renderização ---

function renderSummary(wordMap, totalWords) {
  const top = sortByFrequency(wordMap);
  document.getElementById('summary-total').textContent  = totalWords;
  document.getElementById('summary-unique').textContent = wordMap.size;
  document.getElementById('summary-top').textContent    = top.length ? top[0][0] : '—';
  summarySection.hidden = false;
}

function renderTable(wordMap, totalWords) {
  tableBody.innerHTML = '';
  for (const [word, count] of sortByFrequency(wordMap)) {
    const pct  = ((count / totalWords) * 100).toFixed(1);
    const row  = document.createElement('tr');
    row.dataset.word = word;

    const tdWord  = document.createElement('td');
    const tdCount = document.createElement('td');
    const tdPct   = document.createElement('td');
    tdWord.textContent  = word;
    tdCount.textContent = count;
    tdPct.textContent   = `${pct}%`;

    row.appendChild(tdWord);
    row.appendChild(tdCount);
    row.appendChild(tdPct);
    row.addEventListener('click', () => highlightWordInText(word));
    tableBody.appendChild(row);
  }
}

function renderChart(wordMap) {
  const top10  = sortByFrequency(wordMap).slice(0, 10);
  const labels = top10.map(([word]) => word);
  const data   = top10.map(([, count]) => count);

  if (frequencyChart) frequencyChart.destroy();

  frequencyChart = new Chart(chartCanvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Frequência',
        data,
        backgroundColor: 'rgba(37, 99, 235, 0.75)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 1,
        borderRadius: 4,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
    },
  });
}

function renderHistory() {
  const history = loadHistory();
  historyList.innerHTML = '';
  if (!history.length) {
    historySection.hidden = true;
    return;
  }
  history.forEach(entry => {
    const li      = document.createElement('li');
    li.className  = 'history-item';
    const date    = document.createElement('span');
    const preview = document.createElement('span');
    const stats   = document.createElement('span');
    date.className    = 'history-date';
    preview.className = 'history-preview';
    stats.className   = 'history-stats';
    date.textContent    = entry.date;
    preview.textContent = entry.preview;
    stats.textContent   = `${entry.totalWords} palavras · ${entry.uniqueWords} únicas`;
    li.appendChild(date);
    li.appendChild(preview);
    li.appendChild(stats);
    historyList.appendChild(li);
  });
  historySection.hidden = false;
}

// --- Ações ---

function highlightWordInText(word) {
  const text  = textInput.value.toLowerCase();
  const index = text.indexOf(word);
  if (index !== -1) {
    textInput.focus();
    textInput.setSelectionRange(index, index + word.length);
  }
}

function filterTableRows(query) {
  const q = query.toLowerCase().trim();
  tableBody.querySelectorAll('tr').forEach(row => {
    const word = row.cells[0]?.textContent.toLowerCase() ?? '';
    row.hidden = q !== '' && !word.includes(q);
  });
}

function exportCSV() {
  if (!currentWordMap) return;
  const totalWords = [...currentWordMap.values()].reduce((a, b) => a + b, 0);
  const rows = [['Palavra', 'Frequência', 'Porcentagem']];
  for (const [word, count] of sortByFrequency(currentWordMap)) {
    rows.push([word, count, `${((count / totalWords) * 100).toFixed(1)}%`]);
  }
  const csv  = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'word-frequency.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function saveToHistory(text, wordMap) {
  const history = loadHistory();
  const preview = text.trim().slice(0, 60) + (text.trim().length > 60 ? '...' : '');
  history.unshift({
    date:        new Date().toLocaleString('pt-BR'),
    preview,
    totalWords:  [...wordMap.values()].reduce((a, b) => a + b, 0),
    uniqueWords: wordMap.size,
  });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  renderHistory();
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) ?? [];
  } catch {
    return [];
  }
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function hideError() {
  errorMessage.hidden = true;
}

function clearAll() {
  clearTimeout(debounceTimer);
  textInput.value       = '';
  charCount.textContent = '0';
  searchInput.value     = '';
  currentWordMap        = null;
  hideError();
  summarySection.hidden  = true;
  resultsSection.hidden  = true;
  if (frequencyChart) { frequencyChart.destroy(); frequencyChart = null; }
}

function analyze() {
  const text = textInput.value;

  if (!text.trim()) {
    showError('Por favor, insira algum texto antes de analisar.');
    summarySection.hidden = true;
    resultsSection.hidden = true;
    return;
  }

  let words = normalizeText(text).split(/\s+/).filter(Boolean);
  words = filterStopWords(words, stopWordsToggle.checked);

  if (!words.length) {
    showError('Nenhuma palavra encontrada. Verifique se o texto contém letras ou desative o filtro de stop words.');
    summarySection.hidden = true;
    resultsSection.hidden = true;
    return;
  }

  hideError();

  const wordMap    = countWords(words);
  const totalWords = words.length;
  currentWordMap   = wordMap;
  searchInput.value = '';

  renderSummary(wordMap, totalWords);
  renderTable(wordMap, totalWords);
  renderChart(wordMap);
  saveToHistory(text, wordMap);
  resultsSection.hidden = false;
}

// --- Dark mode ---

function applyTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  darkModeToggle.checked = dark;
}

// --- Init ---

(function init() {
  const saved      = localStorage.getItem('wfa_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved ? saved === 'dark' : prefersDark);
  renderHistory();
}());

// --- Event listeners ---

analyzeBtn.addEventListener('click', analyze);
clearBtn.addEventListener('click', clearAll);
exportBtn.addEventListener('click', exportCSV);
searchInput.addEventListener('input', () => filterTableRows(searchInput.value));

darkModeToggle.addEventListener('change', () => {
  applyTheme(darkModeToggle.checked);
  localStorage.setItem('wfa_theme', darkModeToggle.checked ? 'dark' : 'light');
});

textInput.addEventListener('input', function () {
  charCount.textContent = this.value.length;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(analyze, DEBOUNCE_MS);
});

document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();
    clearTimeout(debounceTimer);
    analyze();
  }
});
