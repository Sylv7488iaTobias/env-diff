/**
 * Core diffing logic for comparing two env maps.
 */

export type DiffStatus = 'missing' | 'mismatch' | 'ok';

export interface DiffResult {
  key: string;
  status: DiffStatus;
  baseValue: string | undefined;
  compareValue: string | undefined;
}

export type EnvMap = Map<string, string>;

/**
 * Compare two env maps and return a list of diff results.
 * Keys from both maps are considered.
 */
export function diffEnvMaps(base: EnvMap, compare: EnvMap): DiffResult[] {
  const allKeys = new Set([...base.keys(), ...compare.keys()]);
  const results: DiffResult[] = [];

  for (const key of allKeys) {
    const baseValue = base.get(key);
    const compareValue = compare.get(key);

    if (baseValue !== undefined && compareValue === undefined) {
      results.push({ key, status: 'missing', baseValue, compareValue: undefined });
    } else if (baseValue === undefined && compareValue !== undefined) {
      results.push({ key, status: 'missing', baseValue: undefined, compareValue });
    } else if (baseValue !== compareValue) {
      results.push({ key, status: 'mismatch', baseValue, compareValue });
    } else {
      results.push({ key, status: 'ok', baseValue, compareValue });
    }
  }

  return results.sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Returns true if there are any missing or mismatched keys.
 */
export function hasDifferences(results: DiffResult[]): boolean {
  return results.some((r) => r.status === 'missing' || r.status === 'mismatch');
}

/**
 * Returns a summary count of each status type.
 */
export function summarizeDiff(results: DiffResult[]): Record<DiffStatus, number> {
  const summary: Record<DiffStatus, number> = { missing: 0, mismatch: 0, ok: 0 };
  for (const result of results) {
    summary[result.status]++;
  }
  return summary;
}
