import { sortKeys, sortEnvMap, buildSortResult } from './sorter';

describe('sortKeys', () => {
  const keys = ['ZEBRA', 'apple', 'MANGO', 'banana', 'KEY_10', 'KEY_2'];

  it('sorts alphabetically (case-insensitive by default)', () => {
    const result = sortKeys(keys, { strategy: 'alpha' });
    expect(result).toEqual(['apple', 'banana', 'KEY_10', 'KEY_2', 'MANGO', 'ZEBRA']);
  });

  it('sorts alphabetically descending', () => {
    const result = sortKeys(keys, { strategy: 'alpha-desc' });
    expect(result[0].toLowerCase()).toBe('zebra');
  });

  it('sorts by key length ascending', () => {
    const result = sortKeys(['LONG_KEY', 'A', 'MED'], { strategy: 'length' });
    expect(result).toEqual(['A', 'MED', 'LONG_KEY']);
  });

  it('sorts by key length descending', () => {
    const result = sortKeys(['LONG_KEY', 'A', 'MED'], { strategy: 'length-desc' });
    expect(result).toEqual(['LONG_KEY', 'MED', 'A']);
  });

  it('sorts naturally (numeric-aware)', () => {
    const result = sortKeys(['KEY_10', 'KEY_2', 'KEY_1'], { strategy: 'natural' });
    expect(result).toEqual(['KEY_1', 'KEY_2', 'KEY_10']);
  });

  it('respects caseSensitive option', () => {
    const result = sortKeys(['b', 'A', 'c'], { strategy: 'alpha', caseSensitive: true });
    expect(result).toEqual(['A', 'b', 'c']);
  });

  it('returns a new array and does not mutate input', () => {
    const input = ['B', 'A'];
    const result = sortKeys(input, { strategy: 'alpha' });
    expect(input).toEqual(['B', 'A']);
    expect(result).toEqual(['A', 'B']);
  });
});

describe('sortEnvMap', () => {
  const map = { ZEBRA: 'z', APPLE: 'a', MANGO: 'm' };

  it('returns a new map with keys sorted alphabetically', () => {
    const result = sortEnvMap(map, { strategy: 'alpha' });
    expect(Object.keys(result)).toEqual(['APPLE', 'MANGO', 'ZEBRA']);
  });

  it('preserves values', () => {
    const result = sortEnvMap(map, { strategy: 'alpha' });
    expect(result['APPLE']).toBe('a');
    expect(result['ZEBRA']).toBe('z');
  });
});

describe('buildSortResult', () => {
  it('detects when order changed', () => {
    const result = buildSortResult(['B', 'A'], { strategy: 'alpha' });
    expect(result.changed).toBe(true);
    expect(result.sorted).toEqual(['A', 'B']);
    expect(result.strategy).toBe('alpha');
  });

  it('detects when order did not change', () => {
    const result = buildSortResult(['A', 'B'], { strategy: 'alpha' });
    expect(result.changed).toBe(false);
  });

  it('preserves original array reference unchanged', () => {
    const original = ['C', 'A', 'B'];
    const result = buildSortResult(original, { strategy: 'alpha' });
    expect(result.original).toEqual(['C', 'A', 'B']);
  });
});
