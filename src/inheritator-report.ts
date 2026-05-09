/**
 * inheritator-report.ts
 * Builds human-readable and JSON reports for env inheritance results.
 */

import { InheritanceResult } from './inheritator';
import { colorize } from './formatter';

export interface InheritatorReport {
  label: string;
  result: InheritanceResult;
}

export function buildInheritatorReport(
  label: string,
  result: InheritanceResult
): InheritatorReport {
  return { label, result };
}

export function renderInheritatorReport(report: InheritatorReport): string {
  const { label, result } = report;
  const lines: string[] = [];

  lines.push(colorize(`=== Inheritance Report: ${label} ===`, 'cyan'));

  const inheritedKeys = Object.keys(result.inherited);
  lines.push(colorize(`Inherited from parent (${inheritedKeys.length}):`, 'blue'));
  for (const key of inheritedKeys) {
    lines.push(`  ${colorize(key, 'green')} = ${result.inherited[key]}`);
  }

  const overrideKeys = Object.keys(result.overrides);
  lines.push(colorize(`Overridden by child (${overrideKeys.length}):`, 'yellow'));
  for (const key of overrideKeys) {
    const { childValue, parentValue } = result.overrides[key];
    lines.push(`  ${colorize(key, 'yellow')}: parent=${parentValue} → child=${childValue}`);
  }

  const childOnlyKeys = Object.keys(result.childOnly);
  lines.push(colorize(`Child-only keys (${childOnlyKeys.length}):`, 'magenta'));
  for (const key of childOnlyKeys) {
    lines.push(`  ${colorize(key, 'magenta')} = ${result.childOnly[key]}`);
  }

  lines.push(colorize(`Total resolved keys: ${result.resolved.size}`, 'cyan'));

  return lines.join('\n');
}

export function renderInheritatorJson(report: InheritatorReport): string {
  const { label, result } = report;
  return JSON.stringify(
    {
      label,
      inherited: result.inherited,
      overrides: result.overrides,
      childOnly: result.childOnly,
      resolvedCount: result.resolved.size,
    },
    null,
    2
  );
}
