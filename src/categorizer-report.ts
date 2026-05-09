import type { CategorizerResult, KeyCategory } from './categorizer.js';

export interface CategorizerReport {
  result: CategorizerResult;
  summary: Record<KeyCategory, number>;
}

export function buildCategorizerReport(result: CategorizerResult): CategorizerReport {
  const summary = {} as Record<KeyCategory, number>;
  for (const [cat, entries] of Object.entries(result.categories)) {
    summary[cat as KeyCategory] = entries.length;
  }
  return { result, summary };
}

export function renderCategorizerReport(report: CategorizerReport): string {
  const lines: string[] = ['=== Env Key Categorizer ===', ''];
  const { categories } = report.result;

  for (const [cat, entries] of Object.entries(categories)) {
    if (entries.length === 0) continue;
    lines.push(`[${cat.toUpperCase()}] (${entries.length})`);
    for (const entry of entries) {
      lines.push(`  ${entry.key}`);
    }
    lines.push('');
  }

  lines.push(`Total keys: ${report.result.total}`);
  return lines.join('\n');
}

export function renderCategorizerJson(report: CategorizerReport): string {
  const output: Record<string, string[]> = {};
  for (const [cat, entries] of Object.entries(report.result.categories)) {
    if (entries.length > 0) {
      output[cat] = entries.map((e) => e.key);
    }
  }
  return JSON.stringify({ total: report.result.total, categories: output }, null, 2);
}
