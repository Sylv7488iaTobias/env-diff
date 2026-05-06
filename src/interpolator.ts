/**
 * Resolves variable interpolation in .env values.
 * Supports ${VAR} and $VAR syntax.
 */

export type EnvMap = Record<string, string>;

/**
 * Interpolate a single value against a given env map.
 * References that cannot be resolved are left as-is.
 */
export function interpolateValue(value: string, env: EnvMap): string {
  // Handle ${VAR_NAME} syntax
  let result = value.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (_match, key) => {
    return Object.prototype.hasOwnProperty.call(env, key) ? env[key] : _match;
  });

  // Handle $VAR_NAME syntax (not followed by word characters or brace)
  result = result.replace(/\$([A-Za-z_][A-Za-z0-9_]*)(?![A-Za-z0-9_{])/g, (_match, key) => {
    return Object.prototype.hasOwnProperty.call(env, key) ? env[key] : _match;
  });

  return result;
}

/**
 * Interpolate all values in an env map.
 * Performs a single pass — forward references may not resolve.
 */
export function interpolateEnvMap(env: EnvMap): EnvMap {
  const result: EnvMap = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = interpolateValue(value, env);
  }
  return result;
}

/**
 * Detect keys whose values contain unresolved variable references.
 */
export function findUnresolvedReferences(env: EnvMap): string[] {
  const unresolved: string[] = [];
  const pattern = /\$\{?[A-Za-z_][A-Za-z0-9_]*\}?/;
  for (const [key, value] of Object.entries(env)) {
    if (pattern.test(value)) {
      unresolved.push(key);
    }
  }
  return unresolved;
}
