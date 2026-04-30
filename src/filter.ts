/**
 * Filter and group diff results by status or key pattern.
 */

import { DiffResult } from './diff';

export type FilterStatus = 'missing' | 'mismatch' | 'ok' | 'all';

export interface FilterOptions {
  status?: FilterStatus;
  keyPattern?: string;
}

/**
 * Filter diff results by status and/or key pattern.
 */
export function filterResults(
  results: DiffResult[],
  options: FilterOptions = {}
): DiffResult[] {
  const { status = 'all', keyPattern } = options;

  let filtered = results;

  if (status !== 'all') {
    filtered = filtered.filter((r) => r.status === status);
  }

  if (keyPattern) {
    const regex = new RegExp(keyPattern, 'i');
    filtered = filtered.filter((r) => regex.test(r.key));
  }

  return filtered;
}

/**
 * Group diff results by their status.
 */
export function groupByStatus(
  results: DiffResult[]
): Record<FilterStatus, DiffResult[]> {
  const groups: Record<FilterStatus, DiffResult[]> = {
    missing: [],
    mismatch: [],
    ok: [],
    all: results,
  };

  for (const result of results) {
    groups[result.status as 'missing' | 'mismatch' | 'ok'].push(result);
  }

  return groups;
}

/**
 * Sort diff results: missing first, then mismatches, then ok.
 */
export function sortResults(results: DiffResult[]): DiffResult[] {
  const order: Record<string, number> = { missing: 0, mismatch: 1, ok: 2 };
  return [...results].sort(
    (a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3)
  );
}
