import { RenameResult, RenameRule } from './renamer';
import { colorize } from './formatter';

export interface RenamerReport {
  totalApplied: number;
  totalSkipped: number;
  totalConflicts: number;
  applied: RenameRule[];
  skipped: RenameRule[];
  conflicts: string[];
}

export function buildRenamerReport(result: RenameResult): RenamerReport {
  return {
    totalApplied: result.applied.length,
    totalSkipped: result.skipped.length,
    totalConflicts: result.conflicts.length,
    applied: result.applied,
    skipped: result.skipped,
    conflicts: result.conflicts,
  };
}

export function renderRenamerReport(report: RenamerReport): string {
  const lines: string[] = [];
  lines.push(colorize('bold', '=== Rename Report ==='));
  lines.push(`Applied : ${colorize('green', String(report.totalApplied))}`);
  lines.push(`Skipped : ${colorize('yellow', String(report.totalSkipped))}`);
  lines.push(`Conflicts: ${colorize('red', String(report.totalConflicts))}`);

  if (report.applied.length > 0) {
    lines.push(colorize('bold', '\nRenamed Keys:'));
    for (const r of report.applied) {
      lines.push(`  ${colorize('green', r.from)} → ${colorize('green', r.to)}`);
    }
  }

  if (report.skipped.length > 0) {
    lines.push(colorize('bold', '\nSkipped Rules:'));
    for (const r of report.skipped) {
      lines.push(`  ${colorize('yellow', r.from)} → ${r.to}`);
    }
  }

  if (report.conflicts.length > 0) {
    lines.push(colorize('bold', '\nConflicting Target Keys:'));
    for (const key of report.conflicts) {
      lines.push(`  ${colorize('red', key)}`);
    }
  }

  return lines.join('\n');
}

export function renderRenamerJson(report: RenamerReport): string {
  return JSON.stringify(report, null, 2);
}
