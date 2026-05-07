import { EnvMap } from './parser';

export interface DuplicateEntry {
  key: string;
  values: string[];
  files: string[];
}

export interface DuplicatesResult {
  duplicates: DuplicateEntry[];
  totalFiles: number;
  totalDuplicates: number;
}

/**
 * Finds keys that appear in multiple env maps with different values.
 */
export function findDuplicateKeys(
  maps: Record<string, EnvMap>
): DuplicateEntry[] {
  const fileNames = Object.keys(maps);
  const allKeys = new Set<string>();

  for (const map of Object.values(maps)) {
    for (const key of Object.keys(map)) {
      allKeys.add(key);
    }
  }

  const duplicates: DuplicateEntry[] = [];

  for (const key of allKeys) {
    const presentIn = fileNames.filter((f) => key in maps[f]);
    if (presentIn.length < 2) continue;

    const values = presentIn.map((f) => maps[f][key]);
    const uniqueValues = new Set(values);
    if (uniqueValues.size > 1) {
      duplicates.push({
        key,
        values,
        files: presentIn,
      });
    }
  }

  return duplicates.sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Finds keys that appear more than once within a single raw env string (true duplicates).
 */
export function findIntraFileDuplicates(content: string): Record<string, number> {
  const counts: Record<string, number> = {};
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    if (key) {
      counts[key] = (counts[key] ?? 0) + 1;
    }
  }

  return Object.fromEntries(
    Object.entries(counts).filter(([, count]) => count > 1)
  );
}

/**
 * Builds a summary result object for duplicate detection.
 */
export function buildDuplicatesResult(
  maps: Record<string, EnvMap>
): DuplicatesResult {
  const duplicates = findDuplicateKeys(maps);
  return {
    duplicates,
    totalFiles: Object.keys(maps).length,
    totalDuplicates: duplicates.length,
  };
}
