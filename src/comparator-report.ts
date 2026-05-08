import { CompareResult, CompareEntry, CompareStatus } from './comparator';
import { colorize } from './formatter';

const STATUS_LABELS: Record<CompareStatus, string> = {
  match: 'MATCH',
  mismatch: 'MISMATCH',
  missing_left: 'MISSING LEFT',
  missing_right: 'MISSING RIGHT',
};

function formatEntry(entry: CompareEntry, useColor: boolean): string {
  const label = STATUS_LABELS[entry.status];
  const key = entry.key;

  switch (entry.status) {
    case 'match':
      return colorize(`  [${label}] ${key}`, 'green', useColor);
    case 'mismatch':
      return colorize(`  [${label}] ${key}: "${entry.leftValue}" vs "${entry.rightValue}"`, 'yellow', useColor);
    case 'missing_left':
      return colorize(`  [${label}] ${key}: (missing) vs "${entry.rightValue}"`, 'red', useColor);
    case 'missing_right':
      return colorize(`  [${label}] ${key}: "${entry.leftValue}" vs (missing)`, 'red', useColor);
  }
}

export function buildComparatorReport(result: CompareResult, useColor = true): string {
  const lines: string[] = [];
  lines.push(colorize(`Comparing: ${result.leftFile} <-> ${result.rightFile}`, 'cyan', useColor));
  lines.push(colorize(`Total keys: ${result.totalKeys}`, 'white', useColor));
  lines.push('');

  for (const entry of result.entries) {
    lines.push(formatEntry(entry, useColor));
  }

  lines.push('');
  lines.push(colorize(`Summary: ${result.matchCount} match, ${result.mismatchCount} mismatch, ${result.missingLeftCount} missing left, ${result.missingRightCount} missing right`, 'white', useColor));

  return lines.join('\n');
}

export function renderComparatorJson(result: CompareResult): string {
  return JSON.stringify(result, null, 2);
}

export function renderComparatorReport(result: CompareResult, format: 'text' | 'json', useColor = true): string {
  return format === 'json' ? renderComparatorJson(result) : buildComparatorReport(result, useColor);
}
