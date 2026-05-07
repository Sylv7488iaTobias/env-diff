import { applyRenameRules, parseRenameRules, buildRenameResult } from './renamer';

describe('parseRenameRules', () => {
  it('parses a single rule', () => {
    expect(parseRenameRules('OLD_KEY:NEW_KEY')).toEqual([{ from: 'OLD_KEY', to: 'NEW_KEY' }]);
  });

  it('parses multiple rules', () => {
    const rules = parseRenameRules('A:B, C:D');
    expect(rules).toHaveLength(2);
    expect(rules[0]).toEqual({ from: 'A', to: 'B' });
    expect(rules[1]).toEqual({ from: 'C', to: 'D' });
  });

  it('throws on invalid rule', () => {
    expect(() => parseRenameRules('BADFORMAT')).toThrow('Invalid rename rule');
  });

  it('ignores empty segments', () => {
    expect(parseRenameRules('A:B,,C:D')).toHaveLength(2);
  });
});

describe('applyRenameRules', () => {
  const env = { FOO: 'foo', BAR: 'bar', BAZ: 'baz' };

  it('renames an existing key', () => {
    const result = applyRenameRules(env, [{ from: 'FOO', to: 'FOO_RENAMED' }]);
    expect(result.renamed).toHaveProperty('FOO_RENAMED', 'foo');
    expect(result.renamed).not.toHaveProperty('FOO');
    expect(result.applied).toHaveLength(1);
  });

  it('skips missing source key', () => {
    const result = applyRenameRules(env, [{ from: 'MISSING', to: 'NEW' }]);
    expect(result.skipped).toHaveLength(1);
    expect(result.applied).toHaveLength(0);
  });

  it('detects conflict when target key already exists', () => {
    const result = applyRenameRules(env, [{ from: 'FOO', to: 'BAR' }]);
    expect(result.conflicts).toContain('BAR');
    expect(result.skipped).toHaveLength(1);
  });

  it('allows renaming a key to itself (no-op)', () => {
    const result = applyRenameRules(env, [{ from: 'FOO', to: 'FOO' }]);
    expect(result.applied).toHaveLength(1);
    expect(result.renamed).toHaveProperty('FOO', 'foo');
  });

  it('does not mutate original', () => {
    applyRenameRules(env, [{ from: 'FOO', to: 'FOO_NEW' }]);
    expect(env).toHaveProperty('FOO');
  });
});

describe('buildRenameResult', () => {
  it('returns full result structure', () => {
    const result = buildRenameResult({ KEY: 'val' }, [{ from: 'KEY', to: 'NEW_KEY' }]);
    expect(result.original).toEqual({ KEY: 'val' });
    expect(result.renamed).toEqual({ NEW_KEY: 'val' });
    expect(result.applied).toHaveLength(1);
    expect(result.skipped).toHaveLength(0);
    expect(result.conflicts).toHaveLength(0);
  });
});
