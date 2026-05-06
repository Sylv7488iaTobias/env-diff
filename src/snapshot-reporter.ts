import { EnvSnapshot, diffSnapshot } from './snapshot';
import { colorize } from './formatter';

export interface SnapshotDiffReport {
  before: string;
  after: string;
  added: string[];
  removed: string[];
  changed: Array<{ key: string; from: string; to: string }>;
  unchanged: number;
}

export function buildSnapshotReport(
  before: EnvSnapshot,
  after: EnvSnapshot
): SnapshotDiffReport {
  const diff = diffSnapshot(before, after);
  const changed = diff.changed.map((key) => ({
    key,
    from: before.keys[key],
    to: after.keys[key],
  }));
  return {
    before: before.timestamp,
    after: after.timestamp,
    added: diff.added,
    removed: diff.removed,
    changed,
    unchanged: diff.unchanged.length,
  };
}

export function renderSnapshotReport(report: SnapshotDiffReport, useColor = true): string {
  const lines: string[] = [];
  const c = (s: string, col: string) => (useColor ? colorize(s, col) : s);

  lines.push(`Snapshot diff: ${report.before} → ${report.after}`);
  lines.push('');

  if (report.added.length) {
    lines.push(c('Added keys:', 'green'));
    report.added.forEach((k) => lines.push(`  + ${k}`));
  }

  if (report.removed.length) {
    lines.push(c('Removed keys:', 'red'));
    report.removed.forEach((k) => lines.push(`  - ${k}`));
  }

  if (report.changed.length) {
    lines.push(c('Changed keys:', 'yellow'));
    report.changed.forEach(({ key, from, to }) =>
      lines.push(`  ~ ${key}: "${from}" → "${to}"`)
    );
  }

  lines.push(`Unchanged: ${report.unchanged} key(s)`);
  return lines.join('\n');
}

export function renderSnapshotJson(report: SnapshotDiffReport): string {
  return JSON.stringify(report, null, 2);
}
