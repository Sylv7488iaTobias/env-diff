/**
 * trimmer.ts — Remove empty, comment-only, or duplicate lines from env maps
 */

export interface TrimmerOptions {
  removeEmpty?: boolean;
  removeComments?: boolean;
  removeDuplicates?: boolean;
}

export interface TrimmerResult {
  original: Map<string, string>;
  trimmed: Map<string, string>;
  removedKeys: string[];
  duplicateKeys: string[];
  stats: {
    originalCount: number;
    trimmedCount: number;
    removedCount: number;
  };
}

export function trimEnvMap(
  env: Map<string, string>,
  options: TrimmerOptions = {}
): TrimmerResult {
  const {
    removeEmpty = true,
    removeComments = true,
    removeDuplicates = true,
  } = options;

  const trimmed = new Map<string, string>();
  const removedKeys: string[] = [];
  const duplicateKeys: string[] = [];
  const seen = new Set<string>();

  for (const [key, value] of env.entries()) {
    if (removeComments && key.startsWith('#')) {
      removedKeys.push(key);
      continue;
    }

    if (removeEmpty && value.trim() === '') {
      removedKeys.push(key);
      continue;
    }

    if (removeDuplicates && seen.has(key)) {
      duplicateKeys.push(key);
      removedKeys.push(key);
      continue;
    }

    seen.add(key);
    trimmed.set(key, value);
  }

  return {
    original: env,
    trimmed,
    removedKeys,
    duplicateKeys,
    stats: {
      originalCount: env.size,
      trimmedCount: trimmed.size,
      removedCount: removedKeys.length,
    },
  };
}

export function trimMultipleEnvMaps(
  envMaps: Map<string, Map<string, string>>,
  options: TrimmerOptions = {}
): Map<string, TrimmerResult> {
  const results = new Map<string, TrimmerResult>();
  for (const [label, env] of envMaps.entries()) {
    results.set(label, trimEnvMap(env, options));
  }
  return results;
}
