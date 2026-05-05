import { validateEnvMap, combineValidationResults } from './validator';

describe('validateEnvMap', () => {
  it('returns valid with no issues for a clean map', () => {
    const map = new Map([['API_KEY', 'abc123'], ['PORT', '3000']]);
    const result = validateEnvMap(map, 'test');
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('flags keys with whitespace as errors', () => {
    const map = new Map([['BAD KEY', 'value']]);
    const result = validateEnvMap(map, 'test');
    expect(result.valid).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].severity).toBe('error');
    expect(result.issues[0].key).toBe('BAD KEY');
  });

  it('flags empty values as warnings', () => {
    const map = new Map([['EMPTY_VAL', '']]);
    const result = validateEnvMap(map, 'test');
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].severity).toBe('warning');
  });

  it('flags unresolved ${...} placeholders as warnings', () => {
    const map = new Map([['SECRET', '${SECRET_VALUE}']]);
    const result = validateEnvMap(map, 'test');
    expect(result.valid).toBe(true);
    expect(result.issues[0].severity).toBe('warning');
    expect(result.issues[0].message).toContain('unresolved placeholder');
  });

  it('flags unresolved %VAR% placeholders as warnings', () => {
    const map = new Map([['WIN_VAR', '%MY_VAR%']]);
    const result = validateEnvMap(map, 'test');
    expect(result.valid).toBe(true);
    expect(result.issues[0].severity).toBe('warning');
  });

  it('uses default label when none provided', () => {
    const map = new Map([['BAD KEY', 'x']]);
    const result = validateEnvMap(map);
    expect(result.issues[0].message).toContain('[env]');
  });

  it('returns multiple issues for multiple problems', () => {
    const map = new Map<string, string>([
      ['GOOD', 'value'],
      ['BAD KEY', 'val'],
      ['EMPTY', ''],
    ]);
    const result = validateEnvMap(map, 'multi');
    expect(result.issues.length).toBeGreaterThanOrEqual(2);
  });
});

describe('combineValidationResults', () => {
  it('merges issues from multiple results', () => {
    const r1 = validateEnvMap(new Map([['EMPTY', '']]), 'a');
    const r2 = validateEnvMap(new Map([['BAD KEY', 'x']]), 'b');
    const combined = combineValidationResults(r1, r2);
    expect(combined.issues).toHaveLength(2);
  });

  it('is invalid if any result has an error', () => {
    const r1 = validateEnvMap(new Map([['OK', 'val']]), 'a');
    const r2 = validateEnvMap(new Map([['BAD KEY', 'x']]), 'b');
    const combined = combineValidationResults(r1, r2);
    expect(combined.valid).toBe(false);
  });

  it('is valid if all results are warning-only or clean', () => {
    const r1 = validateEnvMap(new Map([['EMPTY', '']]), 'a');
    const r2 = validateEnvMap(new Map([['OK', 'val']]), 'b');
    const combined = combineValidationResults(r1, r2);
    expect(combined.valid).toBe(true);
  });
});
