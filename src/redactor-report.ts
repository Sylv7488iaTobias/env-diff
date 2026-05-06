/**
 * Redactor report: summarise which keys were redacted and why.
 */

import { getSensitiveKeys, RedactOptions } from './redactor';
import { colorize } from './formatter';

export interface RedactorReport {
  totalKeys: number;
  redactedKeys: string[];
  redactedCount: number;
  mode: string;
}

export function buildRedactorReport(
  envMap: Record<string, string>,
  options: RedactOptions = {}
): RedactorReport {
  const redactedKeys = getSensitiveKeys(envMap, options);
  return {
    totalKeys: Object.keys(envMap).length,
    redactedKeys,
    redactedCount: redactedKeys.length,
    mode: options.mode ?? 'mask',
  };
}

export function renderRedactorReport(report: RedactorReport): string {
  const lines: string[] = [];
  lines.push(colorize('bold', '=== Redactor Report ==='));
  lines.push(`Mode       : ${report.mode}`);
  lines.push(`Total keys : ${report.totalKeys}`);
  lines.push(`Redacted   : ${report.redactedCount}`);
  if (report.redactedKeys.length > 0) {
    lines.push(colorize('yellow', 'Sensitive keys:'));
    for (const key of report.redactedKeys) {
      lines.push(`  ${colorize('red', '•')} ${key}`);
    }
  } else {
    lines.push(colorize('green', 'No sensitive keys detected.'));
  }
  return lines.join('\n');
}

export function renderRedactorJson(report: RedactorReport): string {
  return JSON.stringify(report, null, 2);
}
