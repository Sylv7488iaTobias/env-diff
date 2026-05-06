/**
 * auditor-report.ts
 * Renders audit results as human-readable text or JSON.
 */

import type { AuditResult } from './auditor.js';
import { colorize } from './formatter.js';

const ISSUE_COLORS: Record<string, (s: string) => string> = {
  duplicate: (s) => colorize(s, 'yellow'),
  empty: (s) => colorize(s, 'red'),
  suspicious: (s) => colorize(s, 'magenta'),
  'too-long': (s) => colorize(s, 'cyan'),
};

export function buildAuditReport(
  results: AuditResult[]
): { totalIssues: number; allPassed: boolean; results: AuditResult[] } {
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
  return { totalIssues, allPassed: totalIssues === 0, results };
}

export function renderAuditReport(results: AuditResult[]): string {
  const report = buildAuditReport(results);
  const lines: string[] = [];

  lines.push(colorize('=== Env Audit Report ===', 'bold'));

  for (const result of report.results) {
    const status = result.passed
      ? colorize('✔ PASSED', 'green')
      : colorize(`✖ ${result.issues.length} issue(s)`, 'red');
    lines.push(`\n${colorize(result.file, 'bold')} — ${status}`);

    for (const issue of result.issues) {
      const colorFn = ISSUE_COLORS[issue.type] ?? ((s: string) => s);
      const tag = colorFn(`[${issue.type.toUpperCase()}]`);
      lines.push(`  ${tag} ${colorize(issue.key, 'cyan')}: ${issue.message}`);
    }
  }

  lines.push('');
  if (report.allPassed) {
    lines.push(colorize('All files passed audit.', 'green'));
  } else {
    lines.push(colorize(`Total issues found: ${report.totalIssues}`, 'red'));
  }

  return lines.join('\n');
}

export function renderAuditJson(results: AuditResult[]): string {
  const report = buildAuditReport(results);
  return JSON.stringify(report, null, 2);
}
