export type OutputFormat = 'text' | 'json' | 'table';

export interface FormatOptions {
  format: OutputFormat;
  color: boolean;
  verbose: boolean;
}

export const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
  format: 'text',
  color: true,
  verbose: false,
};

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';

export function colorize(text: string, color: string, useColor: boolean): string {
  if (!useColor) return text;
  return `${color}${text}${RESET}`;
}

export function formatMissing(key: string, file: string, options: FormatOptions): string {
  const label = colorize('MISSING', RED, options.color);
  const keyStr = colorize(key, BOLD, options.color);
  return `  [${label}] ${keyStr} not found in ${file}`;
}

export function formatMismatch(key: string, val1: string, val2: string, options: FormatOptions): string {
  const label = colorize('MISMATCH', YELLOW, options.color);
  const keyStr = colorize(key, BOLD, options.color);
  if (options.verbose) {
    return `  [${label}] ${keyStr}\n    left:  ${colorize(val1, CYAN, options.color)}\n    right: ${colorize(val2, CYAN, options.color)}`;
  }
  return `  [${label}] ${keyStr}`;
}

export function formatOk(key: string, options: FormatOptions): string {
  const label = colorize('OK', GREEN, options.color);
  const keyStr = colorize(key, BOLD, options.color);
  return `  [${label}] ${keyStr}`;
}

export function formatHeader(file1: string, file2: string, options: FormatOptions): string {
  const header = `Comparing: ${file1} <-> ${file2}`;
  return colorize(header, BOLD, options.color);
}
