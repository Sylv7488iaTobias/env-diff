import { GroupedEnvMap, getGroupNames } from './grouper';

export interface GrouperReport {
  totalGroups: number;
  totalKeys: number;
  groups: Array<{
    name: string;
    keyCount: number;
    keys: string[];
  }>;
}

/**
 * Builds a structured report from a GroupedEnvMap.
 */
export function buildGrouperReport(grouped: GroupedEnvMap): GrouperReport {
  const names = getGroupNames(grouped);
  let totalKeys = 0;

  const groups = names.map((name) => {
    const keys = Object.keys(grouped[name]).sort();
    totalKeys += keys.length;
    return { name, keyCount: keys.length, keys };
  });

  return {
    totalGroups: names.length,
    totalKeys,
    groups,
  };
}

/**
 * Renders a human-readable text report for grouped env keys.
 */
export function renderGrouperReport(report: GrouperReport): string {
  const lines: string[] = [
    `Grouped Env Report`,
    `==================`,
    `Total groups : ${report.totalGroups}`,
    `Total keys   : ${report.totalKeys}`,
    '',
  ];

  for (const group of report.groups) {
    lines.push(`[${group.name}] (${group.keyCount} keys)`);
    for (const key of group.keys) {
      lines.push(`  - ${key}`);
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

/**
 * Renders the report as a JSON string.
 */
export function renderGrouperJson(report: GrouperReport): string {
  return JSON.stringify(report, null, 2);
}
