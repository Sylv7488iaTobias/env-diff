import { DiffResult } from './diff';

export type ReportFormat = 'text' | 'json';

export interface ReportOptions {
  format?: ReportFormat;
  showValues?: boolean;
}

export function generateReport(
  diffs: Record<string, DiffResult>,
  options: ReportOptions = {}
): string {
  const { format = 'text', showValues = false } = options;

  if (format === 'json') {
    return generateJsonReport(diffs, showValues);
  }

  return generateTextReport(diffs, showValues);
}

function generateTextReport(
  diffs: Record<string, DiffResult>,
  showValues: boolean
): string {
  const lines: string[] = [];

  for (const [key, diff] of Object.entries(diffs)) {
    if (diff.status === 'missing') {
      lines.push(`  ✗ MISSING   ${key}`);
    } else if (diff.status === 'extra') {
      lines.push(`  + EXTRA     ${key}${showValues ? ` = ${diff.value}` : ''}`);
    } else if (diff.status === 'mismatch') {
      if (showValues) {
        lines.push(`  ~ MISMATCH  ${key}: "${diff.baseValue}" → "${diff.compareValue}"`);
      } else {
        lines.push(`  ~ MISMATCH  ${key}`);
      }
    }
  }

  if (lines.length === 0) {
    return '✓ No differences found.';
  }

  return lines.join('\n');
}

function generateJsonReport(
  diffs: Record<string, DiffResult>,
  showValues: boolean
): string {
  const output: Record<string, unknown> = {};

  for (const [key, diff] of Object.entries(diffs)) {
    if (!showValues && (diff.status === 'mismatch' || diff.status === 'extra')) {
      const { value, baseValue, compareValue, ...rest } = diff as any;
      output[key] = rest;
    } else {
      output[key] = diff;
    }
  }

  return JSON.stringify(output, null, 2);
}
