/**
 * transformer.ts
 * Provides utilities to transform env maps:
 * - normalize keys (uppercase/lowercase)
 * - trim whitespace from values
 * - rename keys via a mapping
 * - filter keys by prefix
 */

export type EnvMap = Record<string, string>;
export type KeyRenameMap = Record<string, string>;

export function normalizeKeys(
  env: EnvMap,
  mode: 'upper' | 'lower' = 'upper'
): EnvMap {
  return Object.fromEntries(
    Object.entries(env).map(([k, v]) => [
      mode === 'upper' ? k.toUpperCase() : k.toLowerCase(),
      v,
    ])
  );
}

export function trimValues(env: EnvMap): EnvMap {
  return Object.fromEntries(
    Object.entries(env).map(([k, v]) => [k, v.trim()])
  );
}

export function renameKeys(env: EnvMap, renameMap: KeyRenameMap): EnvMap {
  const result: EnvMap = {};
  for (const [key, value] of Object.entries(env)) {
    const newKey = renameMap[key] ?? key;
    result[newKey] = value;
  }
  return result;
}

export function filterByPrefix(env: EnvMap, prefix: string): EnvMap {
  return Object.fromEntries(
    Object.entries(env).filter(([k]) => k.startsWith(prefix))
  );
}

export function stripPrefix(env: EnvMap, prefix: string): EnvMap {
  return Object.fromEntries(
    Object.entries(env)
      .filter(([k]) => k.startsWith(prefix))
      .map(([k, v]) => [k.slice(prefix.length), v])
  );
}

export interface TransformOptions {
  normalizeKeys?: 'upper' | 'lower' | false;
  trimValues?: boolean;
  renameMap?: KeyRenameMap;
  filterPrefix?: string;
  stripPrefix?: boolean;
}

export function transformEnvMap(env: EnvMap, opts: TransformOptions): EnvMap {
  let result = { ...env };
  if (opts.trimValues) result = trimValues(result);
  if (opts.filterPrefix) {
    result = opts.stripPrefix
      ? stripPrefix(result, opts.filterPrefix)
      : filterByPrefix(result, opts.filterPrefix);
  }
  if (opts.renameMap) result = renameKeys(result, opts.renameMap);
  if (opts.normalizeKeys) result = normalizeKeys(result, opts.normalizeKeys);
  return result;
}
