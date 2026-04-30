import {
  colorize,
  formatMissing,
  formatMismatch,
  formatOk,
  formatHeader,
  DEFAULT_FORMAT_OPTIONS,
  FormatOptions,
} from './formatter';

const noColor: FormatOptions = { ...DEFAULT_FORMAT_OPTIONS, color: false };
const withColor: FormatOptions = { ...DEFAULT_FORMAT_OPTIONS, color: true };
const verbose: FormatOptions = { ...noColor, verbose: true };

describe('colorize', () => {
  it('returns plain text when color is disabled', () => {
    expect(colorize('hello', '\x1b[31m', false)).toBe('hello');
  });

  it('wraps text with color codes when enabled', () => {
    const result = colorize('hello', '\x1b[31m', true);
    expect(result).toContain('hello');
    expect(result).toContain('\x1b[31m');
    expect(result).toContain('\x1b[0m');
  });
});

describe('formatMissing', () => {
  it('includes MISSING label and key', () => {
    const result = formatMissing('API_KEY', '.env.prod', noColor);
    expect(result).toContain('MISSING');
    expect(result).toContain('API_KEY');
    expect(result).toContain('.env.prod');
  });
});

describe('formatMismatch', () => {
  it('includes MISMATCH label and key', () => {
    const result = formatMismatch('DB_HOST', 'localhost', 'prod-db', noColor);
    expect(result).toContain('MISMATCH');
    expect(result).toContain('DB_HOST');
  });

  it('shows values in verbose mode', () => {
    const result = formatMismatch('DB_HOST', 'localhost', 'prod-db', verbose);
    expect(result).toContain('localhost');
    expect(result).toContain('prod-db');
  });

  it('hides values in non-verbose mode', () => {
    const result = formatMismatch('DB_HOST', 'localhost', 'prod-db', noColor);
    expect(result).not.toContain('localhost');
    expect(result).not.toContain('prod-db');
  });
});

describe('formatOk', () => {
  it('includes OK label and key', () => {
    const result = formatOk('PORT', noColor);
    expect(result).toContain('OK');
    expect(result).toContain('PORT');
  });
});

describe('formatHeader', () => {
  it('includes both file names', () => {
    const result = formatHeader('.env', '.env.prod', noColor);
    expect(result).toContain('.env');
    expect(result).toContain('.env.prod');
  });
});
