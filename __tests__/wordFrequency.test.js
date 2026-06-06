const { normalizeText, countWords, sortByFrequency, filterStopWords, STOP_WORDS } = require('../wordFrequency');

describe('normalizeText', () => {
  test('converte texto para minúsculas', () => {
    expect(normalizeText('Hello World')).toBe('hello world');
  });

  test('remove pontuação', () => {
    expect(normalizeText('hello, world!')).toBe('hello world');
    expect(normalizeText('one. two; three: four?')).toBe('one two three four');
  });

  test('remove números', () => {
    expect(normalizeText('abc 123 def')).toBe('abc  def');
  });

  test('mantém caracteres acentuados do português', () => {
    expect(normalizeText('Café')).toBe('café');
    expect(normalizeText('Ação')).toBe('ação');
    expect(normalizeText('Você')).toBe('você');
    expect(normalizeText('Coração')).toBe('coração');
  });

  test('preserva espaços', () => {
    expect(normalizeText('palavra um dois')).toBe('palavra um dois');
  });

  test('retorna string vazia para entrada vazia', () => {
    expect(normalizeText('')).toBe('');
  });

  test('remove caracteres especiais mantendo letras', () => {
    expect(normalizeText('@hello #world')).toBe('hello world');
  });
});

describe('countWords', () => {
  test('conta uma única palavra', () => {
    const map = countWords(['hello']);
    expect(map.get('hello')).toBe(1);
    expect(map.size).toBe(1);
  });

  test('conta múltiplas palavras únicas', () => {
    const map = countWords(['hello', 'world']);
    expect(map.get('hello')).toBe(1);
    expect(map.get('world')).toBe(1);
    expect(map.size).toBe(2);
  });

  test('acumula contagem de palavras repetidas', () => {
    const map = countWords(['hello', 'world', 'hello', 'hello']);
    expect(map.get('hello')).toBe(3);
    expect(map.get('world')).toBe(1);
  });

  test('retorna uma instância de Map', () => {
    expect(countWords(['word'])).toBeInstanceOf(Map);
  });

  test('retorna Map vazio para array vazio', () => {
    expect(countWords([]).size).toBe(0);
  });

  test('trata cada palavra independentemente', () => {
    const map = countWords(['a', 'b', 'c', 'a', 'b', 'a']);
    expect(map.get('a')).toBe(3);
    expect(map.get('b')).toBe(2);
    expect(map.get('c')).toBe(1);
    expect(map.size).toBe(3);
  });
});

describe('sortByFrequency', () => {
  test('ordena entradas em ordem decrescente de frequência', () => {
    const map = new Map([['a', 3], ['b', 1], ['c', 2]]);
    const sorted = sortByFrequency(map);
    expect(sorted[0]).toEqual(['a', 3]);
    expect(sorted[1]).toEqual(['c', 2]);
    expect(sorted[2]).toEqual(['b', 1]);
  });

  test('retorna array vazio para Map vazio', () => {
    expect(sortByFrequency(new Map())).toEqual([]);
  });

  test('retorna array com uma entrada para Map de um elemento', () => {
    const map = new Map([['word', 5]]);
    expect(sortByFrequency(map)).toEqual([['word', 5]]);
  });

  test('retorna array (não Map)', () => {
    expect(Array.isArray(sortByFrequency(new Map([['a', 1]])))).toBe(true);
  });

  test('não muta o Map original', () => {
    const map = new Map([['a', 1], ['b', 3]]);
    sortByFrequency(map);
    expect(map.get('a')).toBe(1);
    expect(map.get('b')).toBe(3);
    expect(map.size).toBe(2);
  });

  test('mantém todas as entradas após a ordenação', () => {
    const map = new Map([['x', 5], ['y', 2], ['z', 8], ['w', 1]]);
    const sorted = sortByFrequency(map);
    expect(sorted).toHaveLength(4);
    expect(sorted[0][1]).toBe(8);
    expect(sorted[sorted.length - 1][1]).toBe(1);
  });
});

describe('filterStopWords', () => {
  test('retorna array original quando filtro está desativado', () => {
    const words = ['the', 'cat', 'sat'];
    expect(filterStopWords(words, false)).toEqual(words);
  });

  test('remove stop words quando filtro está ativado', () => {
    const words = ['the', 'cat', 'sat', 'on', 'a', 'mat'];
    const result = filterStopWords(words, true);
    expect(result).toEqual(['cat', 'sat', 'mat']);
    expect(result).not.toContain('the');
    expect(result).not.toContain('on');
    expect(result).not.toContain('a');
  });

  test('retorna array vazio quando todas as palavras são stop words', () => {
    const words = ['the', 'and', 'or', 'but'];
    expect(filterStopWords(words, true)).toHaveLength(0);
  });

  test('retorna array vazio inalterado quando filtro está desativado', () => {
    expect(filterStopWords([], false)).toEqual([]);
  });

  test('retorna array vazio quando filtro está ativado e input é vazio', () => {
    expect(filterStopWords([], true)).toEqual([]);
  });

  test('preserva palavras que não são stop words', () => {
    const words = ['javascript', 'the', 'python', 'and', 'ruby'];
    const result = filterStopWords(words, true);
    expect(result).toEqual(['javascript', 'python', 'ruby']);
  });

  test('remove stop words em português', () => {
    const words = ['o', 'gato', 'e', 'o', 'rato'];
    const result = filterStopWords(words, true);
    expect(result).toEqual(['gato', 'rato']);
  });
});

describe('STOP_WORDS', () => {
  test('é um Set', () => {
    expect(STOP_WORDS).toBeInstanceOf(Set);
  });

  test('contém stop words comuns em inglês', () => {
    expect(STOP_WORDS.has('the')).toBe(true);
    expect(STOP_WORDS.has('and')).toBe(true);
    expect(STOP_WORDS.has('is')).toBe(true);
  });

  test('contém stop words comuns em português', () => {
    expect(STOP_WORDS.has('de')).toBe(true);
    expect(STOP_WORDS.has('que')).toBe(true);
    expect(STOP_WORDS.has('não')).toBe(true);
  });

  test('não contém palavras com conteúdo semântico', () => {
    expect(STOP_WORDS.has('javascript')).toBe(false);
    expect(STOP_WORDS.has('gato')).toBe(false);
    expect(STOP_WORDS.has('frequência')).toBe(false);
  });
});
