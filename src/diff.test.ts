import { diffEnvMaps, hasDifferences, DiffResult } from './diff';

describe('diffEnvMaps', () => {
  it('returns empty arrays when both maps are identical', () => {
    const env = { KEY1: 'value1', KEY2: 'value2' };
    const result = diffEnvMaps(env, { ...env });

    expect(result.missingInTarget).toEqual([]);
    expect(result.missingInSource).toEqual([]);
    expect(result.mismatchedValues).toEqual([]);
    expect(result.matching).toEqual(['KEY1', 'KEY2']);
  });

  it('detects keys missing in target', () => {
    const source = { KEY1: 'value1', KEY2: 'value2' };
    const target = { KEY1: 'value1' };
    const result = diffEnvMaps(source, target);

    expect(result.missingInTarget).toEqual(['KEY2']);
    expect(result.missingInSource).toEqual([]);
    expect(result.matching).toEqual(['KEY1']);
  });

  it('detects keys missing in source', () => {
    const source = { KEY1: 'value1' };
    const target = { KEY1: 'value1', KEY2: 'value2' };
    const result = diffEnvMaps(source, target);

    expect(result.missingInSource).toEqual(['KEY2']);
    expect(result.missingInTarget).toEqual([]);
    expect(result.matching).toEqual(['KEY1']);
  });

  it('detects mismatched values', () => {
    const source = { KEY1: 'value1', KEY2: 'dev' };
    const target = { KEY1: 'value1', KEY2: 'prod' };
    const result = diffEnvMaps(source, target);

    expect(result.mismatchedValues).toEqual([
      { key: 'KEY2', sourceValue: 'dev', targetValue: 'prod' },
    ]);
    expect(result.matching).toEqual(['KEY1']);
  });

  it('returns results sorted alphabetically', () => {
    const source = { ZEBRA: '1', APPLE: '2', MANGO: '3' };
    const target = {};
    const result = diffEnvMaps(source, target);

    expect(result.missingInTarget).toEqual(['APPLE', 'MANGO', 'ZEBRA']);
  });

  it('handles empty maps', () => {
    const result = diffEnvMaps({}, {});
    expect(result.missingInTarget).toEqual([]);
    expect(result.missingInSource).toEqual([]);
    expect(result.mismatchedValues).toEqual([]);
    expect(result.matching).toEqual([]);
  });
});

describe('hasDifferences', () => {
  it('returns false when there are no differences', () => {
    const result: DiffResult = { missingInTarget: [], missingInSource: [], mismatchedValues: [], matching: ['KEY1'] };
    expect(hasDifferences(result)).toBe(false);
  });

  it('returns true when there are missing keys in target', () => {
    const result: DiffResult = { missingInTarget: ['KEY1'], missingInSource: [], mismatchedValues: [], matching: [] };
    expect(hasDifferences(result)).toBe(true);
  });

  it('returns true when there are mismatched values', () => {
    const result: DiffResult = { missingInTarget: [], missingInSource: [], mismatchedValues: [{ key: 'K', sourceValue: 'a', targetValue: 'b' }], matching: [] };
    expect(hasDifferences(result)).toBe(true);
  });
});
