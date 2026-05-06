import { lintEnvMap, combineLintResults } from './linter';

describe('lintEnvMap', () => {
  it('returns no issues for a clean env map', () => {
    const result = lintEnvMap({ DATABASE_URL: 'postgres://localhost/db', PORT: '3000' });
    expect(result.issues).toHaveLength(0);
    expect(result.errorCount).toBe(0);
    expect(result.warnCount).toBe(0);
  });

  it('flags keys that are not UPPER_SNAKE_CASE', () => {
    const result = lintEnvMap({ myKey: 'value' });
    const issue = result.issues.find((i) => i.rule === 'key-casing');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('warn');
  });

  it('flags keys with leading underscores', () => {
    const result = lintEnvMap({ _SECRET: 'abc' });
    const issue = result.issues.find((i) => i.rule === 'key-underscore-boundary');
    expect(issue).toBeDefined();
  });

  it('flags keys with trailing underscores', () => {
    const result = lintEnvMap({ SECRET_: 'abc' });
    const issue = result.issues.find((i) => i.rule === 'key-underscore-boundary');
    expect(issue).toBeDefined();
  });

  it('flags empty values as info', () => {
    const result = lintEnvMap({ API_KEY: '' });
    const issue = result.issues.find((i) => i.rule === 'no-empty-value');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('info');
    expect(result.infoCount).toBe(1);
  });

  it('flags values with leading whitespace', () => {
    const result = lintEnvMap({ HOST: ' localhost' });
    const issue = result.issues.find((i) => i.rule === 'no-value-whitespace');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('warn');
  });

  it('flags values with trailing whitespace', () => {
    const result = lintEnvMap({ HOST: 'localhost ' });
    const issue = result.issues.find((i) => i.rule === 'no-value-whitespace');
    expect(issue).toBeDefined();
  });

  it('flags weak placeholder values', () => {
    const result = lintEnvMap({ DB_PASSWORD: 'changeme' });
    const issue = result.issues.find((i) => i.rule === 'no-weak-value');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('warn');
  });

  it('counts severities correctly', () => {
    const result = lintEnvMap({ myKey: '', DB_PASS: 'password' });
    expect(result.warnCount).toBeGreaterThanOrEqual(1);
    expect(result.infoCount).toBeGreaterThanOrEqual(1);
  });
});

describe('combineLintResults', () => {
  it('merges issues from multiple results', () => {
    const r1 = lintEnvMap({ myKey: 'value' });
    const r2 = lintEnvMap({ API_TOKEN: '' });
    const combined = combineLintResults(r1, r2);
    expect(combined.issues.length).toBe(r1.issues.length + r2.issues.length);
  });

  it('correctly totals severity counts', () => {
    const r1 = lintEnvMap({ myKey: 'changeme' });
    const r2 = lintEnvMap({ ANOTHER: '' });
    const combined = combineLintResults(r1, r2);
    expect(combined.warnCount).toBe(r1.warnCount + r2.warnCount);
    expect(combined.infoCount).toBe(r1.infoCount + r2.infoCount);
  });
});
