/**
 * masker.ts — Mask env values by pattern or key list, replacing characters
 * with a configurable mask character (default '*').
 */

export interface MaskOptions {
  maskChar?: string;
  revealCount?: number; // how many trailing chars to reveal
  keys?: string[];      // explicit keys to mask
  patterns?: RegExp[];  // regex patterns to match keys
}

export interface MaskResult {
  original: Map<string, string>;
  masked: Map<string, string>;
  maskedKeys: string[];
}

const DEFAULT_PATTERNS: RegExp[] = [
  /secret/i,
  /password/i,
  /passwd/i,
  /token/i,
  /api[_-]?key/i,
  /private/i,
  /credential/i,
];

export function shouldMaskKey(
  key: string,
  options: MaskOptions = {}
): boolean {
  const { keys = [], patterns = DEFAULT_PATTERNS } = options;
  if (keys.includes(key)) return true;
  return patterns.some((re) => re.test(key));
}

export function maskValue(
  value: string,
  options: MaskOptions = {}
): string {
  const { maskChar = '*', revealCount = 0 } = options;
  if (value.length === 0) return value;
  const reveal = Math.min(revealCount, value.length);
  const masked = maskChar.repeat(value.length - reveal);
  const revealed = reveal > 0 ? value.slice(-reveal) : '';
  return masked + revealed;
}

export function maskEnvMap(
  env: Map<string, string>,
  options: MaskOptions = {}
): MaskResult {
  const masked = new Map<string, string>();
  const maskedKeys: string[] = [];

  for (const [key, value] of env.entries()) {
    if (shouldMaskKey(key, options)) {
      masked.set(key, maskValue(value, options));
      maskedKeys.push(key);
    } else {
      masked.set(key, value);
    }
  }

  return { original: env, masked, maskedKeys };
}
