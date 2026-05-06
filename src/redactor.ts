/**
 * Redactor: mask sensitive values in env maps before display or export.
 */

export type RedactMode = 'mask' | 'partial' | 'hash';

export interface RedactOptions {
  mode?: RedactMode;
  patterns?: RegExp[];
  keys?: string[];
}

const DEFAULT_SENSITIVE_PATTERNS: RegExp[] = [
  /secret/i,
  /password/i,
  /passwd/i,
  /token/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /auth/i,
  /credential/i,
  /cert/i,
  /passphrase/i,
];

export function isSensitiveKey(
  key: string,
  patterns: RegExp[] = DEFAULT_SENSITIVE_PATTERNS,
  extraKeys: string[] = []
): boolean {
  if (extraKeys.map(k => k.toLowerCase()).includes(key.toLowerCase())) return true;
  return patterns.some(p => p.test(key));
}

export function redactValue(value: string, mode: RedactMode = 'mask'): string {
  if (!value) return value;
  if (mode === 'mask') return '********';
  if (mode === 'partial') {
    if (value.length <= 4) return '****';
    return value.slice(0, 2) + '****' + value.slice(-2);
  }
  if (mode === 'hash') {
    // Simple deterministic hash for display
    let h = 0;
    for (let i = 0; i < value.length; i++) {
      h = (Math.imul(31, h) + value.charCodeAt(i)) | 0;
    }
    return `[sha:${Math.abs(h).toString(16).padStart(8, '0')}]`;
  }
  return '********';
}

export function redactEnvMap(
  envMap: Record<string, string>,
  options: RedactOptions = {}
): Record<string, string> {
  const { mode = 'mask', patterns = DEFAULT_SENSITIVE_PATTERNS, keys = [] } = options;
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(envMap)) {
    result[k] = isSensitiveKey(k, patterns, keys) ? redactValue(v, mode) : v;
  }
  return result;
}

export function getSensitiveKeys(
  envMap: Record<string, string>,
  options: RedactOptions = {}
): string[] {
  const { patterns = DEFAULT_SENSITIVE_PATTERNS, keys = [] } = options;
  return Object.keys(envMap).filter(k => isSensitiveKey(k, patterns, keys));
}
