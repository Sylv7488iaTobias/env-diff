import {
  buildLinterReport,
  renderLinterReport,
  renderLinterJson,
} from './linter-report';
import { LintResult } from './linter';

const mockResults: LintResult[] = [
  { key: 'API_KEY', severity: 'error', message: 'Value is empty', rule: 'no-empty-value' },
  { key: 'debug', severity: 'warning', message: 'Key should be uppercase', rule: 'uppercase-keys' },
  { key: 'APP_NAME', severity: 'warning', message: 'Value contains whitespace', rule: 'no-whitespace' },
];

describe('buildLinterReport', () => {
  it('counts errors and warnings correctly', () => {
    const report = buildLinterReport(mockResults);
    expect(report.total).toBe(3);
    expect(report.errorCount).toBe(1);
    expect(report.warningCount).toBe(2);
  });

  it('returns zero counts for empty results', () => {
    const report = buildLinterReport([]);
    expect(report.total).toBe(0);
    expect(report.errorCount).toBe(0);
    expect(report.warningCount).toBe(0);
  });

  it('includes all results in the report', () => {
    const report = buildLinterReport(mockResults);
    expect(report.results).toHaveLength(3);
    expect(report.results[0].key).toBe('API_KEY');
  });
});

describe('renderLinterReport', () => {
  it('returns a clean message when no issues', () => {
    const report = buildLinterReport([]);
    expect(renderLinterReport(report)).toBe('✅ No lint issues found.');
  });

  it('includes error and warning icons', () => {
    const report = buildLinterReport(mockResults);
    const output = renderLinterReport(report);
    expect(output).toContain('❌');
    expect(output).toContain('⚠️');
  });

  it('includes key names in output', () => {
    const report = buildLinterReport(mockResults);
    const output = renderLinterReport(report);
    expect(output).toContain('API_KEY');
    expect(output).toContain('debug');
  });

  it('includes summary line', () => {
    const report = buildLinterReport(mockResults);
    const output = renderLinterReport(report);
    expect(output).toContain('3 issue(s)');
    expect(output).toContain('1 error(s)');
    expect(output).toContain('2 warning(s)');
  });
});

describe('renderLinterJson', () => {
  it('produces valid JSON', () => {
    const report = buildLinterReport(mockResults);
    expect(() => JSON.parse(renderLinterJson(report))).not.toThrow();
  });

  it('includes summary and issues fields', () => {
    const report = buildLinterReport(mockResults);
    const parsed = JSON.parse(renderLinterJson(report));
    expect(parsed).toHaveProperty('summary');
    expect(parsed).toHaveProperty('issues');
    expect(parsed.summary.errors).toBe(1);
    expect(parsed.summary.warnings).toBe(2);
    expect(parsed.issues).toHaveLength(3);
  });

  it('includes rule field in each issue', () => {
    const report = buildLinterReport(mockResults);
    const parsed = JSON.parse(renderLinterJson(report));
    expect(parsed.issues[0].rule).toBe('no-empty-value');
  });
});
