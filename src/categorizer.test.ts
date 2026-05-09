import { describe, it, expect } from 'vitest';
import {
  categorizeKey,
  categorizeEnvMap,
  getCategoryNames,
} from './categorizer.js';

describe('categorizeKey', () => {
  it('categorizes database keys', () => {
    expect(categorizeKey('DB_HOST')).toBe('database');
    expect(categorizeKey('DATABASE_URL')).toBe('database');
    expect(categorizeKey('POSTGRES_USER')).toBe('database');
    expect(categorizeKey('REDIS_PORT')).toBe('database');
  });

  it('categorizes auth keys', () => {
    expect(categorizeKey('JWT_SECRET')).toBe('auth');
    expect(categorizeKey('API_KEY')).toBe('auth');
    expect(categorizeKey('AUTH_TOKEN')).toBe('auth');
    expect(categorizeKey('PASSWORD')).toBe('auth');
  });

  it('categorizes network keys', () => {
    expect(categorizeKey('HOST')).toBe('network');
    expect(categorizeKey('PORT')).toBe('network');
    expect(categorizeKey('BASE_URL')).toBe('network');
  });

  it('categorizes feature flag keys', () => {
    expect(categorizeKey('FEATURE_DARK_MODE')).toBe('feature_flag');
    expect(categorizeKey('ENABLE_BETA')).toBe('feature_flag');
    expect(categorizeKey('FLAG_NEW_UI')).toBe('feature_flag');
  });

  it('categorizes logging keys', () => {
    expect(categorizeKey('LOG_LEVEL')).toBe('logging');
    expect(categorizeKey('DEBUG')).toBe('logging');
    expect(categorizeKey('SENTRY_DSN')).toBe('logging');
  });

  it('categorizes storage keys', () => {
    expect(categorizeKey('S3_BUCKET')).toBe('storage');
    expect(categorizeKey('CDN_URL')).toBe('storage');
  });

  it('categorizes email keys', () => {
    expect(categorizeKey('SMTP_HOST')).toBe('email');
    expect(categorizeKey('SENDGRID_API_KEY')).toBe('email');
  });

  it('falls back to other', () => {
    expect(categorizeKey('APP_NAME')).toBe('other');
    expect(categorizeKey('NODE_ENV')).toBe('other');
  });
});

describe('categorizeEnvMap', () => {
  it('categorizes all keys in a map', () => {
    const map = new Map([
      ['DB_HOST', 'localhost'],
      ['JWT_SECRET', 'abc'],
      ['PORT', '3000'],
      ['APP_NAME', 'myapp'],
    ]);
    const result = categorizeEnvMap(map);
    expect(result.total).toBe(4);
    expect(result.categories.database).toHaveLength(1);
    expect(result.categories.auth).toHaveLength(1);
    expect(result.categories.network).toHaveLength(1);
    expect(result.categories.other).toHaveLength(1);
  });

  it('returns empty categories for empty map', () => {
    const result = categorizeEnvMap(new Map());
    expect(result.total).toBe(0);
    expect(result.categories.other).toHaveLength(0);
  });
});

describe('getCategoryNames', () => {
  it('returns only non-empty categories', () => {
    const map = new Map([['DB_HOST', 'localhost'], ['APP_NAME', 'test']]);
    const result = categorizeEnvMap(map);
    const names = getCategoryNames(result);
    expect(names).toContain('database');
    expect(names).toContain('other');
    expect(names).not.toContain('email');
  });
});
