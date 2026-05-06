/**
 * transformer-report.ts
 * Builds and renders a human-readable or JSON report
 * describing the transformations applied to an env map.
 */

import type { EnvMap, TransformOptions } from './transformer';

export interface TransformChange {
  key: string;
  originalKey?: string;
  originalValue?: string;
  newValue?: string;
  operations: string[];
}

export interface TransformReport {
  totalKeys: number;
  changedKeys: number;
  removedKeys: number;
  changes: TransformChange[];
}

export function buildTransformReport(
  original: EnvMap,
  transformed: EnvMap,
  opts: TransformOptions
): TransformReport {
  const changes: TransformChange[] = [];
  const originalKeys = Object.keys(original);
  const transformedKeys = Object.keys(transformed);
  const removedKeys = originalKeys.filter((k) => {
    const wouldRename = opts.renameMap?.[k];
    const prefix = opts.filterPrefix;
    if (prefix && !k.startsWith(prefix)) return true;
    return false;
  });

  for (const newKey of transformedKeys) {
    const ops: string[] = [];
    let origKey = newKey;

    if (opts.renameMap) {
      const renamed = Object.entries(opts.renameMap).find(([, v]) => v === newKey);
      if (renamed) {
        origKey = renamed[0];
        ops.push(`renamed from "${origKey}"`);
      }
    }

    if (opts.normalizeKeys && origKey !== newKey && !ops.length) {
      ops.push(`key normalized to ${opts.normalizeKeys}case`);
    }

    const origValue = original[origKey] ?? original[newKey];
    const newValue = transformed[newKey];

    if (opts.trimValues && origValue !== undefined && origValue.trim() !== origValue) {
      ops.push('value trimmed');
    }

    if (opts.stripPrefix && opts.filterPrefix) {
      ops.push(`prefix "${opts.filterPrefix}" stripped`);
    }

    if (ops.length > 0) {
      changes.push({ key: newKey, originalKey: origKey, originalValue: origValue, newValue, operations: ops });
    }
  }

  return {
    totalKeys: transformedKeys.length,
    changedKeys: changes.length,
    removedKeys: removedKeys.length,
    changes,
  };
}

export function renderTransformReport(report: TransformReport): string {
  const lines: string[] = [
    `Transform Report`,
    `  Total keys : ${report.totalKeys}`,
    `  Changed    : ${report.changedKeys}`,
    `  Removed    : ${report.removedKeys}`,
  ];
  if (report.changes.length > 0) {
    lines.push('\nChanges:');
    for (const c of report.changes) {
      lines.push(`  [${c.key}] ${c.operations.join(', ')}`);
    }
  }
  return lines.join('\n');
}

export function renderTransformJson(report: TransformReport): string {
  return JSON.stringify(report, null, 2);
}
