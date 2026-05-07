import { EnvProfile, compareProfiles } from './profiler';
import { colorize } from './formatter';

export function buildProfileReport(profiles: EnvProfile[]): string[] {
  const lines: string[] = [];
  for (const p of profiles) {
    lines.push(colorize(`\n=== Profile: ${p.name} ===`, 'cyan'));
    lines.push(`  Keys          : ${p.keyCount}`);
    lines.push(`  Empty values  : ${p.emptyValues.length} (${p.emptyValues.join(', ') || 'none'})`);
    lines.push(`  Numeric values: ${p.numericValues.length}`);
    lines.push(`  Boolean values: ${p.booleanValues.length}`);
    lines.push(`  URL values    : ${p.urlValues.length}`);
    lines.push(`  Avg val length: ${p.averageValueLength}`);
    lines.push(`  Longest key   : ${p.longestKey || '(none)'}`);
    lines.push(`  Longest value : ${p.longestValue || '(none)'}`);
  }
  return lines;
}

export function renderProfileReport(profiles: EnvProfile[]): string {
  const lines = buildProfileReport(profiles);
  if (profiles.length === 2) {
    const cmp = compareProfiles(profiles[0], profiles[1]);
    lines.push(colorize('\n--- Comparison ---', 'yellow'));
    lines.push(`  Key count diff        : ${cmp.keyCountDiff}`);
    lines.push(`  Empty values diff     : ${cmp.emptyValuesDiff}`);
    lines.push(`  Avg value length diff : ${cmp.avgValueLengthDiff}`);
    const onlyA = cmp.onlyEmptyInA as string[];
    const onlyB = cmp.onlyEmptyInB as string[];
    if (onlyA.length) lines.push(`  Empty only in ${profiles[0].name}: ${onlyA.join(', ')}`);
    if (onlyB.length) lines.push(`  Empty only in ${profiles[1].name}: ${onlyB.join(', ')}`);
  }
  return lines.join('\n');
}

export function renderProfileJson(profiles: EnvProfile[]): string {
  const result: Record<string, unknown> = { profiles };
  if (profiles.length === 2) {
    result.comparison = compareProfiles(profiles[0], profiles[1]);
  }
  return JSON.stringify(result, null, 2);
}
