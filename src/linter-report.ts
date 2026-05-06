import { LintResult } from './linter';

export interface LinterReport {
  total: number;
  errorCount: number;
  warningCount: number;
  results: LintResult[];
}

export function buildLinterReport(results: LintResult[]): LinterReport {
  const errorCount = results.filter((r) => r.severity === 'error').length;
  const warningCount = results.filter((r) => r.severity === 'warning').length;
  return {
    total: results.length,
    errorCount,
    warningCount,
    results,
  };
}

export function renderLinterReport(report: LinterReport): string {
  if (report.total === 0) {
    return '✅ No lint issues found.';
  }

  const lines: string[] = [
    `Lint Results: ${report.errorCount} error(s), ${report.warningCount} warning(s)`,
    '',
  ];

  for (const result of report.results) {
    const icon = result.severity === 'error' ? '❌' : '⚠️';
    lines.push(`  ${icon} [${result.severity.toUpperCase()}] ${result.key}: ${result.message}`);
  }

  lines.push('');
  lines.push(
    `Summary: ${report.total} issue(s) found — ${report.errorCount} error(s), ${report.warningCount} warning(s).`
  );

  return lines.join('\n');
}

export function renderLinterJson(report: LinterReport): string {
  return JSON.stringify(
    {
      summary: {
        total: report.total,
        errors: report.errorCount,
        warnings: report.warningCount,
      },
      issues: report.results.map((r) => ({
        key: r.key,
        severity: r.severity,
        message: r.message,
        rule: r.rule,
      })),
    },
    null,
    2
  );
}
