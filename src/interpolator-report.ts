/**
 * Generates a human-readable report of interpolation issues
 * found across one or more env maps.
 */

import { EnvMap, interpolateEnvMap, findUnresolvedReferences } from './interpolator';

export interface InterpolationIssue {
  file: string;
  key: string;
  rawValue: string;
  resolvedValue: string;
}

export interface InterpolationReport {
  issues: InterpolationIssue[];
  hasIssues: boolean;
}

export function buildInterpolationReport(
  files: Record<string, EnvMap>
): InterpolationReport {
  const issues: InterpolationIssue[] = [];

  for (const [file, env] of Object.entries(files)) {
    const resolved = interpolateEnvMap(env);
    const unresolved = findUnresolvedReferences(resolved);

    for (const key of unresolved) {
      issues.push({
        file,
        key,
        rawValue: env[key],
        resolvedValue: resolved[key],
      });
    }
  }

  return { issues, hasIssues: issues.length > 0 };
}

export function renderInterpolationReport(report: InterpolationReport): string {
  if (!report.hasIssues) {
    return '✔ No unresolved variable references found.';
  }

  const lines: string[] = ['⚠ Unresolved variable references detected:\n'];

  for (const issue of report.issues) {
    lines.push(`  [${issue.file}] ${issue.key}`);
    lines.push(`    raw:      ${issue.rawValue}`);
    lines.push(`    resolved: ${issue.resolvedValue}`);
  }

  return lines.join('\n');
}

export function renderInterpolationJson(report: InterpolationReport): string {
  return JSON.stringify(report, null, 2);
}
