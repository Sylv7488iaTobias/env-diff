/**
 * sorter.ts — sorts env map keys by various strategies
 */

export type SortStrategy = 'alpha' | 'alpha-desc' | 'length' | 'length-desc' | 'natural';

export interface SortOptions {
  strategy: SortStrategy;
  caseSensitive?: boolean;
}

export interface SortResult {
  original: string[];
  sorted: string[];
  strategy: SortStrategy;
  changed: boolean;
}

export function sortKeys(keys: string[], options: SortOptions): string[] {
  const { strategy, caseSensitive = false } = options;
  const normalize = (k: string) => (caseSensitive ? k : k.toLowerCase());

  const copy = [...keys];

  switch (strategy) {
    case 'alpha':
      return copy.sort((a, b) => normalize(a).localeCompare(normalize(b)));

    case 'alpha-desc':
      return copy.sort((a, b) => normalize(b).localeCompare(normalize(a)));

    case 'length':
      return copy.sort((a, b) => a.length - b.length || normalize(a).localeCompare(normalize(b)));

    case 'length-desc':
      return copy.sort((a, b) => b.length - a.length || normalize(a).localeCompare(normalize(b)));

    case 'natural':
      return copy.sort((a, b) =>
        normalize(a).localeCompare(normalize(b), undefined, { numeric: true, sensitivity: 'base' })
      );

    default:
      return copy;
  }
}

export function sortEnvMap(
  envMap: Record<string, string>,
  options: SortOptions
): Record<string, string> {
  const sortedKeys = sortKeys(Object.keys(envMap), options);
  return Object.fromEntries(sortedKeys.map((k) => [k, envMap[k]]));
}

export function buildSortResult(
  original: string[],
  options: SortOptions
): SortResult {
  const sorted = sortKeys(original, options);
  const changed = original.join(',') !== sorted.join(',');
  return { original, sorted, strategy: options.strategy, changed };
}
