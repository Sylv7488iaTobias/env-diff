/**
 * trimmer-report.ts — Render trimmer results as text or JSON
 */

import type { TrimmerResult } from './trimmer';

export interface TrimmerReport {
  label: string;
  result: TrimmerResult;
}

export function buildTrimmerReport(
  label: string,
  result: TrimmerResult
): TrimmerReport {
  return { label, result };
}

export function renderTrimmerReport(report: TrimmerReport): string {
  const { label, result } = report;
  const lines: string[] = [];

  lines.push(`=== Trimmer Report: ${label} ===`);
  lines.push(
    `  Original keys : ${result.stats.originalCount}`
  );
  lines.push(
    `  After trim    : ${result.stats.trimmedCount}`
  );
  lines.push(
    `  Removed       : ${result.stats.removedCount}`
  );

  if (result.removedKeys.length > 0) {
    lines.push(`  Removed keys  : ${result.removedKeys.join(', ')}`);
  }

  if (result.duplicateKeys.length > 0) {
    lines.push(`  Duplicates    : ${result.duplicateKeys.join(', ')}`);
  }

  return lines.join('\n');
}

export function renderTrimmerJson(report: TrimmerReport): string {
  return JSON.stringify(
    {
      label: report.label,
      stats: report.result.stats,
      removedKeys: report.result.removedKeys,
      duplicateKeys: report.result.duplicateKeys,
      trimmedKeys: Array.from(report.result.trimmed.keys()),
    },
    null,
    2
  );
}

export function renderMultipleTrimmerReports(
  reports: TrimmerReport[]
): string {
  return reports.map(renderTrimmerReport).join('\n\n');
}
