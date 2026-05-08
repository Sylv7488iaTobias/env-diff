import { ResolveResult, ResolvedFile } from './resolver';
import { colorize } from './formatter';

export interface ResolverReport {
  env: string;
  files: ResolvedFile[];
  resolvedCount: number;
  missingCount: number;
}

export function buildResolverReport(
  env: string,
  result: ResolveResult
): ResolverReport {
  return {
    env,
    files: result.files,
    resolvedCount: result.resolved.length,
    missingCount: result.missing.length,
  };
}

export function renderResolverReport(report: ResolverReport): string {
  const lines: string[] = [];
  lines.push(colorize(`Resolved env files for: ${report.env}`, 'cyan'));
  lines.push('');

  for (const file of report.files) {
    const tag = file.isDefault ? ' (default)' : '';
    if (file.exists) {
      lines.push(colorize(`  ✔ ${file.filePath}${tag}`, 'green'));
    } else {
      lines.push(colorize(`  ✘ ${file.filePath}${tag}`, 'red'));
    }
  }

  lines.push('');
  lines.push(
    `Found: ${report.resolvedCount}, Missing: ${report.missingCount}`
  );
  return lines.join('\n');
}

export function renderResolverJson(report: ResolverReport): string {
  return JSON.stringify(report, null, 2);
}
