/**
 * normalizer.ts
 * Normalizes .env file content: strips BOM, normalizes line endings,
 * removes trailing whitespace, and enforces consistent quoting.
 */

export interface NormalizeOptions {
  stripBom?: boolean;
  normalizeLineEndings?: boolean;
  trimTrailingWhitespace?: boolean;
  quoteStyle?: 'single' | 'double' | 'none' | 'preserve';
}

export interface NormalizeResult {
  original: string;
  normalized: string;
  changes: NormalizeChange[];
}

export interface NormalizeChange {
  line: number;
  type: 'bom' | 'line-ending' | 'trailing-whitespace' | 'quote-style';
  before: string;
  after: string;
}

const DEFAULT_OPTIONS: Required<NormalizeOptions> = {
  stripBom: true,
  normalizeLineEndings: true,
  trimTrailingWhitespace: true,
  quoteStyle: 'preserve',
};

export function normalizeEnvContent(
  content: string,
  options: NormalizeOptions = {}
): NormalizeResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const changes: NormalizeChange[] = [];
  let result = content;

  if (opts.stripBom && result.startsWith('\uFEFF')) {
    changes.push({ line: 0, type: 'bom', before: '\uFEFF', after: '' });
    result = result.slice(1);
  }

  if (opts.normalizeLineEndings) {
    const crlf = result.match(/\r\n/g);
    if (crlf && crlf.length > 0) {
      changes.push({ line: -1, type: 'line-ending', before: '\r\n', after: '\n' });
      result = result.replace(/\r\n/g, '\n');
    }
  }

  const lines = result.split('\n');
  const processedLines = lines.map((line, idx) => {
    let current = line;

    if (opts.trimTrailingWhitespace) {
      const trimmed = current.trimEnd();
      if (trimmed !== current) {
        changes.push({ line: idx + 1, type: 'trailing-whitespace', before: current, after: trimmed });
        current = trimmed;
      }
    }

    if (opts.quoteStyle !== 'preserve' && current.includes('=') && !current.trimStart().startsWith('#')) {
      const eqIdx = current.indexOf('=');
      const key = current.slice(0, eqIdx);
      const rawVal = current.slice(eqIdx + 1);
      const normalized = normalizeQuotes(rawVal, opts.quoteStyle);
      if (normalized !== rawVal) {
        const before = current;
        current = `${key}=${normalized}`;
        changes.push({ line: idx + 1, type: 'quote-style', before, after: current });
      }
    }

    return current;
  });

  return { original: content, normalized: processedLines.join('\n'), changes };
}

function normalizeQuotes(value: string, style: 'single' | 'double' | 'none'): string {
  const singleQuoted = value.startsWith("'") && value.endsWith("'");
  const doubleQuoted = value.startsWith('"') && value.endsWith('"');
  const inner = singleQuoted || doubleQuoted ? value.slice(1, -1) : value;

  if (style === 'none') return inner;
  if (style === 'single') return `'${inner}'`;
  if (style === 'double') return `"${inner}"`;
  return value;
}
