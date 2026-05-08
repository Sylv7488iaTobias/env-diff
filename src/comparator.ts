import { EnvMap } from './parser';

export type CompareStatus = 'match' | 'mismatch' | 'missing_left' | 'missing_right';

export interface CompareEntry {
  key: string;
  status: CompareStatus;
  leftValue?: string;
  rightValue?: string;
}

export interface CompareResult {
  leftFile: string;
  rightFile: string;
  entries: CompareEntry[];
  totalKeys: number;
  matchCount: number;
  mismatchCount: number;
  missingLeftCount: number;
  missingRightCount: number;
}

export function compareEnvMaps(
  left: EnvMap,
  right: EnvMap,
  leftFile: string,
  rightFile: string
): CompareResult {
  const allKeys = new Set([...Object.keys(left), ...Object.keys(right)]);
  const entries: CompareEntry[] = [];

  for (const key of allKeys) {
    const inLeft = key in left;
    const inRight = key in right;

    if (inLeft && inRight) {
      entries.push({
        key,
        status: left[key] === right[key] ? 'match' : 'mismatch',
        leftValue: left[key],
        rightValue: right[key],
      });
    } else if (inLeft) {
      entries.push({ key, status: 'missing_right', leftValue: left[key] });
    } else {
      entries.push({ key, status: 'missing_left', rightValue: right[key] });
    }
  }

  entries.sort((a, b) => a.key.localeCompare(b.key));

  return {
    leftFile,
    rightFile,
    entries,
    totalKeys: allKeys.size,
    matchCount: entries.filter(e => e.status === 'match').length,
    mismatchCount: entries.filter(e => e.status === 'mismatch').length,
    missingLeftCount: entries.filter(e => e.status === 'missing_left').length,
    missingRightCount: entries.filter(e => e.status === 'missing_right').length,
  };
}

export function hasDiscrepancies(result: CompareResult): boolean {
  return result.mismatchCount > 0 || result.missingLeftCount > 0 || result.missingRightCount > 0;
}
