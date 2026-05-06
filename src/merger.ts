/**
 * merger.ts
 * Merges multiple env maps into a unified reference map,
 * collecting all known keys and their values per source.
 */

export interface MergeEntry {
  key: string;
  values: Record<string, string | undefined>;
}

export type EnvMap = Record<string, string>;

export interface MergeResult {
  keys: string[];
  entries: MergeEntry[];
  sources: string[];
}

/**
 * Merges multiple named env maps into a unified structure.
 * Each key appearing in any source is included, with its value
 * per source (or undefined if absent).
 */
export function mergeEnvMaps(
  maps: Record<string, EnvMap>
): MergeResult {
  const sources = Object.keys(maps);
  const keySet = new Set<string>();

  for (const map of Object.values(maps)) {
    for (const key of Object.keys(map)) {
      keySet.add(key);
    }
  }

  const keys = Array.from(keySet).sort();

  const entries: MergeEntry[] = keys.map((key) => {
    const values: Record<string, string | undefined> = {};
    for (const source of sources) {
      values[source] = maps[source][key];
    }
    return { key, values };
  });

  return { keys, entries, sources };
}

/**
 * Returns keys that are present in all sources.
 */
export function getCommonKeys(result: MergeResult): string[] {
  return result.entries
    .filter((e) =>
      result.sources.every((s) => e.values[s] !== undefined)
    )
    .map((e) => e.key);
}

/**
 * Returns keys missing from at least one source.
 */
export function getIncompleteKeys(result: MergeResult): string[] {
  return result.entries
    .filter((e) =>
      result.sources.some((s) => e.values[s] === undefined)
    )
    .map((e) => e.key);
}

/**
 * Returns keys whose values differ across at least two sources.
 * Keys that are missing from one or more sources are excluded
 * since they are already captured by getIncompleteKeys.
 */
export function getConflictingKeys(result: MergeResult): string[] {
  return result.entries
    .filter((e) => {
      const presentValues = result.sources
        .map((s) => e.values[s])
        .filter((v): v is string => v !== undefined);
      if (presentValues.length < 2) return false;
      return new Set(presentValues).size > 1;
    })
    .map((e) => e.key);
}
