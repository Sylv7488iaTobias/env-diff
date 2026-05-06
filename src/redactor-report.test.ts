import {
  buildRedactorReport,
  renderRedactorReport,
  renderRedactorJson,
} from './redactor-report';

const sampleEnv = {
  APP_NAME: 'myapp',
  DB_PASSWORD: 'secret',
  API_KEY: 'key123',
  PORT: '8080',
};

describe('buildRedactorReport', () => {
  it('counts total and redacted keys', () => {
    const report = buildRedactorReport(sampleEnv);
    expect(report.totalKeys).toBe(4);
    expect(report.redactedCount).toBe(2);
    expect(report.redactedKeys).toContain('DB_PASSWORD');
    expect(report.redactedKeys).toContain('API_KEY');
  });

  it('defaults mode to mask', () => {
    const report = buildRedactorReport(sampleEnv);
    expect(report.mode).toBe('mask');
  });

  it('reflects custom mode', () => {
    const report = buildRedactorReport(sampleEnv, { mode: 'hash' });
    expect(report.mode).toBe('hash');
  });

  it('returns empty redactedKeys for safe env', () => {
    const report = buildRedactorReport({ HOST: 'localhost', PORT: '5432' });
    expect(report.redactedKeys).toHaveLength(0);
    expect(report.redactedCount).toBe(0);
  });

  it('includes custom keys in redacted list', () => {
    const report = buildRedactorReport({ PORT: '3000' }, { keys: ['PORT'] });
    expect(report.redactedKeys).toContain('PORT');
  });
});

describe('renderRedactorReport', () => {
  it('includes header and mode', () => {
    const report = buildRedactorReport(sampleEnv);
    const text = renderRedactorReport(report);
    expect(text).toContain('Redactor Report');
    expect(text).toContain('mask');
  });

  it('lists sensitive keys', () => {
    const report = buildRedactorReport(sampleEnv);
    const text = renderRedactorReport(report);
    expect(text).toContain('DB_PASSWORD');
    expect(text).toContain('API_KEY');
  });

  it('shows no sensitive keys message when clean', () => {
    const report = buildRedactorReport({ HOST: 'localhost' });
    const text = renderRedactorReport(report);
    expect(text).toContain('No sensitive keys detected');
  });
});

describe('renderRedactorJson', () => {
  it('produces valid JSON', () => {
    const report = buildRedactorReport(sampleEnv);
    const json = renderRedactorJson(report);
    const parsed = JSON.parse(json);
    expect(parsed.redactedCount).toBe(2);
    expect(parsed.mode).toBe('mask');
    expect(Array.isArray(parsed.redactedKeys)).toBe(true);
  });
});
