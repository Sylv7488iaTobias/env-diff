import { buildRenamerReport, renderRenamerReport, renderRenamerJson } from './renamer-report';
import { RenameResult } from './renamer';

const makeResult = (overrides: Partial<RenameResult> = {}): RenameResult => ({
  original: { FOO: 'foo', BAR: 'bar' },
  renamed: { BAR: 'bar', FOO_NEW: 'foo' },
  applied: [{ from: 'FOO', to: 'FOO_NEW' }],
  skipped: [],
  conflicts: [],
  ...overrides,
});

describe('buildRenamerReport', () => {
  it('counts applied rules correctly', () => {
    const report = buildRenamerReport(makeResult());
    expect(report.totalApplied).toBe(1);
    expect(report.totalSkipped).toBe(0);
    expect(report.totalConflicts).toBe(0);
  });

  it('counts skipped rules', () => {
    const result = makeResult({ skipped: [{ from: 'MISSING', to: 'X' }] });
    const report = buildRenamerReport(result);
    expect(report.totalSkipped).toBe(1);
  });

  it('counts conflicts', () => {
    const result = makeResult({ conflicts: ['BAR'] });
    const report = buildRenamerReport(result);
    expect(report.totalConflicts).toBe(1);
    expect(report.conflicts).toContain('BAR');
  });

  it('preserves applied and skipped arrays', () => {
    const result = makeResult({
      applied: [{ from: 'A', to: 'B' }],
      skipped: [{ from: 'C', to: 'D' }],
    });
    const report = buildRenamerReport(result);
    expect(report.applied[0]).toEqual({ from: 'A', to: 'B' });
    expect(report.skipped[0]).toEqual({ from: 'C', to: 'D' });
  });
});

describe('renderRenamerReport', () => {
  it('includes section header', () => {
    const report = buildRenamerReport(makeResult());
    expect(renderRenamerReport(report)).toContain('Rename Report');
  });

  it('shows renamed keys', () => {
    const report = buildRenamerReport(makeResult());
    const output = renderRenamerReport(report);
    expect(output).toContain('FOO');
    expect(output).toContain('FOO_NEW');
  });

  it('shows conflicts when present', () => {
    const report = buildRenamerReport(makeResult({ conflicts: ['BAR'] }));
    expect(renderRenamerReport(report)).toContain('BAR');
  });

  it('omits sections when empty', () => {
    const report = buildRenamerReport(makeResult());
    const output = renderRenamerReport(report);
    expect(output).not.toContain('Skipped Rules');
    expect(output).not.toContain('Conflicting');
  });
});

describe('renderRenamerJson', () => {
  it('produces valid JSON', () => {
    const report = buildRenamerReport(makeResult());
    expect(() => JSON.parse(renderRenamerJson(report))).not.toThrow();
  });

  it('includes all fields', () => {
    const report = buildRenamerReport(makeResult());
    const parsed = JSON.parse(renderRenamerJson(report));
    expect(parsed).toHaveProperty('totalApplied');
    expect(parsed).toHaveProperty('applied');
    expect(parsed).toHaveProperty('skipped');
    expect(parsed).toHaveProperty('conflicts');
  });
});
