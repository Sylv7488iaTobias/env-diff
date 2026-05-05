import { DiffResult } from './diff';
import { EnvMap } from './parser';
import * as fs from 'fs';
import * as path from 'path';

export type ExportFormat = 'json' | 'csv' | 'markdown';

export interface ExportOptions {
  format: ExportFormat;
  outputPath: string;
  includeValues?: boolean;
}

export function exportToJson(results: DiffResult[], options: { includeValues?: boolean }): string {
  const sanitized = results.map((r) => ({
    key: r.key,
    status: r.status,
    ...(options.includeValues ? { expected: r.expected, actual: r.actual } : {}),
  }));
  return JSON.stringify(sanitized, null, 2);
}

export function exportToCsv(results: DiffResult[], options: { includeValues?: boolean }): string {
  const headers = options.includeValues
    ? ['key', 'status', 'expected', 'actual']
    : ['key', 'status'];
  const rows = results.map((r) => {
    const base = [r.key, r.status];
    if (options.includeValues) {
      base.push(r.expected ?? '', r.actual ?? '');
    }
    return base.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}

export function exportToMarkdown(results: DiffResult[], options: { includeValues?: boolean }): string {
  const headers = options.includeValues
    ? ['Key', 'Status', 'Expected', 'Actual']
    : ['Key', 'Status'];
  const separator = headers.map(() => '---').join(' | ');
  const header = headers.join(' | ');
  const rows = results.map((r) => {
    const base = [r.key, r.status];
    if (options.includeValues) {
      base.push(r.expected ?? '_(missing)_', r.actual ?? '_(missing)_');
    }
    return base.join(' | ');
  });
  return [`# Env Diff Report`, '', header, separator, ...rows].join('\n');
}

export function exportResults(results: DiffResult[], options: ExportOptions): void {
  let content: string;
  switch (options.format) {
    case 'json':
      content = exportToJson(results, options);
      break;
    case 'csv':
      content = exportToCsv(results, options);
      break;
    case 'markdown':
      content = exportToMarkdown(results, options);
      break;
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
  const dir = path.dirname(options.outputPath);
  if (dir && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(options.outputPath, content, 'utf-8');
}
