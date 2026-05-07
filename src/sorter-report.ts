import { SortResult } from './sorter';

export interface SorterReport {
  totalKeys: number;
  alreadySorted: boolean;
  order: string;
  original: string[];
  sorted: string[];
  changes: Array<{ key: string; fromIndex: number; toIndex: number }>;
}

export function buildSorterReport(result: SortResult): SorterReport {
  const changes: Array<{ key: string; fromIndex: number; toIndex: number }> = [];

  result.originalOrder.forEach((key, fromIndex) => {
    const toIndex = result.sortedOrder.indexOf(key);
    if (fromIndex !== toIndex) {
      changes.push({ key, fromIndex, toIndex });
    }
  });

  return {
    totalKeys: result.originalOrder.length,
    alreadySorted: changes.length === 0,
    order: result.order,
    original: result.originalOrder,
    sorted: result.sortedOrder,
    changes,
  };
}

export function renderSorterReport(report: SorterReport): string {
  const lines: string[] = [];

  lines.push(`Sort Order : ${report.order}`);
  lines.push(`Total Keys : ${report.totalKeys}`);
  lines.push(`Status     : ${report.alreadySorted ? 'Already sorted' : `${report.changes.length} key(s) reordered`}`);

  if (!report.alreadySorted) {
    lines.push('');
    lines.push('Reordered Keys:');
    for (const change of report.changes) {
      lines.push(`  ${change.key.padEnd(30)} index ${change.fromIndex} → ${change.toIndex}`);
    }
  }

  return lines.join('\n');
}

export function renderSorterJson(report: SorterReport): string {
  return JSON.stringify(report, null, 2);
}
