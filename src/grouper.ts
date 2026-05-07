/**
 * Groups env keys by a given prefix delimiter and returns a structured map.
 */

export interface GroupedEnvMap {
  [group: string]: Record<string, string>;
}

export interface GrouperOptions {
  delimiter?: string;
  ungroupedLabel?: string;
}

const DEFAULT_DELIMITER = '_';
const DEFAULT_UNGROUPED = '__ungrouped__';

/**
 * Groups a flat env map by key prefix.
 * e.g. DB_HOST, DB_PORT -> { DB: { HOST: '...', PORT: '...' } }
 */
export function groupByPrefix(
  envMap: Record<string, string>,
  options: GrouperOptions = {}
): GroupedEnvMap {
  const delimiter = options.delimiter ?? DEFAULT_DELIMITER;
  const ungroupedLabel = options.ungroupedLabel ?? DEFAULT_UNGROUPED;
  const result: GroupedEnvMap = {};

  for (const [key, value] of Object.entries(envMap)) {
    const delimIdx = key.indexOf(delimiter);
    if (delimIdx === -1) {
      result[ungroupedLabel] = result[ungroupedLabel] ?? {};
      result[ungroupedLabel][key] = value;
    } else {
      const prefix = key.slice(0, delimIdx);
      const rest = key.slice(delimIdx + 1);
      result[prefix] = result[prefix] ?? {};
      result[prefix][rest] = value;
    }
  }

  return result;
}

/**
 * Returns a sorted list of group names from a GroupedEnvMap.
 */
export function getGroupNames(grouped: GroupedEnvMap): string[] {
  return Object.keys(grouped).sort();
}

/**
 * Flattens a GroupedEnvMap back to a flat env map.
 */
export function flattenGrouped(
  grouped: GroupedEnvMap,
  options: GrouperOptions = {}
): Record<string, string> {
  const delimiter = options.delimiter ?? DEFAULT_DELIMITER;
  const ungroupedLabel = options.ungroupedLabel ?? DEFAULT_UNGROUPED;
  const result: Record<string, string> = {};

  for (const [group, entries] of Object.entries(grouped)) {
    for (const [subKey, value] of Object.entries(entries)) {
      const fullKey =
        group === ungroupedLabel ? subKey : `${group}${delimiter}${subKey}`;
      result[fullKey] = value;
    }
  }

  return result;
}
