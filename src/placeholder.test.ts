import { describe, it, expect } from 'vitest';
import {
  isPlaceholderValue,
  detectPlaceholders,
  hasPlaceholders,
} from './placeholder';

describe('isPlaceholderValue', () => {
  it('detects empty string', () => {
    expect(isPlaceholderValue('').matched).toBe(true);
  });

  it('detects TODO marker', () => {
    const result = isPlaceholderValue('TODO');
    expect(result.matched).toBe(true);
    expect(result.reason).toBe('placeholder marker');
  });

  it('detects CHANGEME marker (case-insensitive)', () => {
    expect(isPlaceholderValue('changeme').matched).toBe(true);
  });

  it('detects YOUR_SECRET style placeholders', () => {
    expect(isPlaceholderValue('YOUR_API_KEY').matched).toBe(true);
  });

  it('detects angle-bracket placeholder', () => {
    const result = isPlaceholderValue('<your-token>');
    expect(result.matched).toBe(true);
    expect(result.reason).toBe('angle-bracket placeholder');
  });

  it('detects bracket placeholder', () => {
    expect(isPlaceholderValue('[INSERT_VALUE]').matched).toBe(true);
  });

  it('detects xxx placeholder', () => {
    expect(isPlaceholderValue('xxxxx').matched).toBe(true);
  });

  it('detects null-like values', () => {
    expect(isPlaceholderValue('null').matched).toBe(true);
    expect(isPlaceholderValue('undefined').matched).toBe(true);
    expect(isPlaceholderValue('none').matched).toBe(true);
  });

  it('detects example.com URLs', () => {
    const result = isPlaceholderValue('https://example.com/api');
    expect(result.matched).toBe(true);
    expect(result.reason).toBe('example/localhost URL');
  });

  it('detects localhost URLs', () => {
    expect(isPlaceholderValue('http://localhost:3000').matched).toBe(true);
  });

  it('does not flag real values', () => {
    expect(isPlaceholderValue('my-real-secret-key').matched).toBe(false);
    expect(isPlaceholderValue('production').matched).toBe(false);
    expect(isPlaceholderValue('https://api.myapp.com').matched).toBe(false);
  });
});

describe('detectPlaceholders', () => {
  it('returns empty placeholders when none found', () => {
    const map = new Map([['APP_ENV', 'production'], ['PORT', '3000']]);
    const result = detectPlaceholders(map, '.env');
    expect(result.total).toBe(0);
    expect(result.placeholders).toHaveLength(0);
  });

  it('detects multiple placeholder entries', () => {
    const map = new Map([
      ['API_KEY', 'CHANGEME'],
      ['DB_URL', ''],
      ['APP_ENV', 'production'],
      ['SECRET', '<your-secret>'],
    ]);
    const result = detectPlaceholders(map, '.env.example');
    expect(result.total).toBe(3);
    expect(result.file).toBe('.env.example');
    const keys = result.placeholders.map(p => p.key);
    expect(keys).toContain('API_KEY');
    expect(keys).toContain('DB_URL');
    expect(keys).toContain('SECRET');
  });

  it('includes reason in each entry', () => {
    const map = new Map([['TOKEN', 'TODO']]);
    const result = detectPlaceholders(map, '.env');
    expect(result.placeholders[0].reason).toBe('placeholder marker');
  });
});

describe('hasPlaceholders', () => {
  it('returns true when placeholders exist', () => {
    const result = { file: '.env', placeholders: [{ key: 'K', value: '', reason: 'empty value' }], total: 1 };
    expect(hasPlaceholders(result)).toBe(true);
  });

  it('returns false when no placeholders', () => {
    const result = { file: '.env', placeholders: [], total: 0 };
    expect(hasPlaceholders(result)).toBe(false);
  });
});
