import { parseEnvFile } from './parser';

export interface DiffResult {
  missingInTarget: string[];
  missingInSource: string[];
  mismatchedValues: Array<{ key: string; sourceValue: string; targetValue: string }>;
  matching: string[];
}

export interface EnvMap {
  [key: string]: string;
}

export function diffEnvMaps(source: EnvMap, target: EnvMap): DiffResult {
  const sourceKeys = new Set(Object.keys(source));
  const targetKeys = new Set(Object.keys(target));

  const missingInTarget: string[] = [];
  const missingInSource: string[] = [];
  const mismatchedValues: DiffResult['mismatchedValues'] = [];
  const matching: string[] = [];

  for (const key of sourceKeys) {
    if (!targetKeys.has(key)) {
      missingInTarget.push(key);
    } else if (source[key] !== target[key]) {
      mismatchedValues.push({
        key,
        sourceValue: source[key],
        targetValue: target[key],
      });
    } else {
      matching.push(key);
    }
  }

  for (const key of targetKeys) {
    if (!sourceKeys.has(key)) {
      missingInSource.push(key);
    }
  }

  return {
    missingInTarget: missingInTarget.sort(),
    missingInSource: missingInSource.sort(),
    mismatchedValues: mismatchedValues.sort((a, b) => a.key.localeCompare(b.key)),
    matching: matching.sort(),
  };
}

export async function diffEnvFiles(sourcePath: string, targetPath: string): Promise<DiffResult> {
  const [source, target] = await Promise.all([
    parseEnvFile(sourcePath),
    parseEnvFile(targetPath),
  ]);
  return diffEnvMaps(source, target);
}

export function hasDifferences(result: DiffResult): boolean {
  return (
    result.missingInTarget.length > 0 ||
    result.missingInSource.length > 0 ||
    result.mismatchedValues.length > 0
  );
}
