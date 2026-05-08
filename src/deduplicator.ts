import { EnvMap } from './parser';

export interface DeduplicateResult {
  original: EnvMap;
  deduplicated: EnvMap;
  removedKeys: string[];
  keptKeys: string[];
}

export type DeduplicateStrategy = 'first' | 'last';

/**
 * Deduplicate an EnvMap by removing keys that appear in a reference map.
 * Optionally keep only keys present in the reference (intersection mode).
 */
export function deduplicateAgainstReference(
  source: EnvMap,
  reference: EnvMap,
  options: { intersect?: boolean } = {}
): DeduplicateResult {
  const removedKeys: string[] = [];
  const keptKeys: string[] = [];
  const deduplicated: EnvMap = {};

  for (const key of Object.keys(source)) {
    const inReference = key in reference;
    if (options.intersect) {
      if (inReference) {
        deduplicated[key] = source[key];
        keptKeys.push(key);
      } else {
        removedKeys.push(key);
      }
    } else {
      if (!inReference) {
        deduplicated[key] = source[key];
        keptKeys.push(key);
      } else {
        removedKeys.push(key);
      }
    }
  }

  return { original: source, deduplicated, removedKeys, keptKeys };
}

/**
 * Merge multiple EnvMaps, resolving duplicate keys via strategy.
 */
export function mergeWithStrategy(
  maps: EnvMap[],
  strategy: DeduplicateStrategy = 'last'
): EnvMap {
  const result: EnvMap = {};
  const ordered = strategy === 'last' ? maps : [...maps].reverse();
  for (const map of ordered) {
    for (const key of Object.keys(map)) {
      if (!(key in result)) {
        result[key] = map[key];
      }
    }
  }
  return result;
}

/**
 * Build a DeduplicateResult from two EnvMaps merged with strategy.
 */
export function buildDeduplicateResult(
  maps: EnvMap[],
  strategy: DeduplicateStrategy = 'last'
): { merged: EnvMap; conflicts: Record<string, string[]> } {
  const merged: EnvMap = {};
  const conflicts: Record<string, string[]> = {};

  for (const map of maps) {
    for (const key of Object.keys(map)) {
      if (key in merged) {
        if (!conflicts[key]) conflicts[key] = [merged[key]];
        conflicts[key].push(map[key]);
        if (strategy === 'last') merged[key] = map[key];
      } else {
        merged[key] = map[key];
      }
    }
  }

  return { merged, conflicts };
}
