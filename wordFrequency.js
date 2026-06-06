const STOP_WORDS = new Set([
  // Português
  'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas',
  'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas',
  'por', 'para', 'com', 'sem', 'sob', 'sobre', 'até', 'após', 'ante',
  'ao', 'aos', 'à', 'às',
  'e', 'ou', 'mas', 'se', 'que', 'como', 'quando', 'porque', 'pois', 'porém',
  'é', 'são', 'foi', 'eram', 'ser', 'ter', 'há', 'não', 'mais', 'já', 'também',
  'eu', 'tu', 'ele', 'ela', 'nós', 'vós', 'eles', 'elas',
  'me', 'te', 'se', 'lhe', 'lhes', 'meu', 'minha', 'seu', 'sua',
  'este', 'esta', 'esse', 'essa', 'aquele', 'aquela', 'isso', 'isto', 'aquilo',
  // English
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to',
  'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'as', 'if',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can',
  'not', 'also', 'just', 'so', 'it', 'its',
  'i', 'you', 'he', 'she', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'our', 'their',
  'this', 'that', 'these', 'those', 'what', 'which', 'who', 'when', 'where',
]);

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-záàãâäéèêëíìîïóòõôöúùûüç\s]/g, '');
}

function countWords(words) {
  const map = new Map();
  for (const word of words) {
    map.set(word, (map.get(word) || 0) + 1);
  }
  return map;
}

function sortByFrequency(wordMap) {
  return [...wordMap.entries()].sort((a, b) => b[1] - a[1]);
}

function filterStopWords(words, enabled) {
  if (!enabled) return words;
  return words.filter(word => !STOP_WORDS.has(word));
}

if (typeof module !== 'undefined') {
  module.exports = { normalizeText, countWords, sortByFrequency, filterStopWords, STOP_WORDS };
}
