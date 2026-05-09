/**
 * placeholder.ts
 * Detects keys with placeholder or stub values in .env files.
 * Placeholder patterns include empty strings, TODO markers, CHANGEME, etc.
 */

export interface PlaceholderEntry {
  key: string;
  value: string;
  reason: string;
}

export interface PlaceholderResult {
  file: string;
  placeholders: PlaceholderEntry[];
  total: number;
}

const PLACEHOLDER_PATTERNS: Array<{ pattern: RegExp | string; reason: string }> = [
  { pattern: /^$/,                          reason: 'empty value' },
  { pattern: /^(TODO|FIXME|CHANGEME|REPLACE_ME|PLACEHOLDER|FILL_ME_IN|YOUR_.+)$/i, reason: 'placeholder marker' },
  { pattern: /^<.+>$/,                      reason: 'angle-bracket placeholder' },
  { pattern: /^\[.+\]$/,                    reason: 'bracket placeholder' },
  { pattern: /^xxx+$/i,                     reason: 'xxx placeholder' },
  { pattern: /^0{3,}$/,                     reason: 'zero-padded placeholder' },
  { pattern: /^(null|nil|none|undefined)$/i, reason: 'null-like placeholder' },
  { pattern: /^https?:\/\/(example\.com|localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/, reason: 'example/localhost URL' },
];

export function isPlaceholderValue(value: string): { matched: boolean; reason: string } {
  for (const { pattern, reason } of PLACEHOLDER_PATTERNS) {
    if (typeof pattern === 'string') {
      if (value === pattern) return { matched: true, reason };
    } else {
      if (pattern.test(value)) return { matched: true, reason };
    }
  }
  return { matched: false, reason: '' };
}

export function detectPlaceholders(
  envMap: Map<string, string>,
  file: string
): PlaceholderResult {
  const placeholders: PlaceholderEntry[] = [];

  for (const [key, value] of envMap.entries()) {
    const { matched, reason } = isPlaceholderValue(value);
    if (matched) {
      placeholders.push({ key, value, reason });
    }
  }

  return {
    file,
    placeholders,
    total: placeholders.length,
  };
}

export function hasPlaceholders(result: PlaceholderResult): boolean {
  return result.total > 0;
}
