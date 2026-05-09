import { describe, it, expect } from 'vitest';
import {
  shouldMaskKey,
  maskValue,
  maskEnvMap,
} from './masker';

describe('shouldMaskKey', () => {
  it('masks keys matching default patterns', () => {
    expect(shouldMaskKey('DB_PASSWORD')).toBe(true);
    expect(shouldMaskKey('API_KEY')).toBe(true);
    expect(shouldMaskKey('AUTH_TOKEN')).toBe(true);
    expect(shouldMaskKey('SECRET_KEY')).toBe(true);
    expect(shouldMaskKey('PRIVATE_KEY')).toBe(true);
  });

  it('does not mask benign keys', () => {
    expect(shouldMaskKey('PORT')).toBe(false);
    expect(shouldMaskKey('NODE_ENV')).toBe(false);
    expect(shouldMaskKey('APP_NAME')).toBe(false);
  });

  it('masks explicitly listed keys', () => {
    expect(shouldMaskKey('MY_CUSTOM_KEY', { keys: ['MY_CUSTOM_KEY'] })).toBe(true);
    expect(shouldMaskKey('PORT', { keys: ['PORT'] })).toBe(true);
  });

  it('masks keys matching custom patterns', () => {
    expect(shouldMaskKey('DB_PASS', { patterns: [/pass/i] })).toBe(true);
    expect(shouldMaskKey('APP_NAME', { patterns: [/pass/i] })).toBe(false);
  });
});

describe('maskValue', () => {
  it('replaces all characters with mask char', () => {
    expect(maskValue('hello')).toBe('*****');
  });

  it('uses custom mask character', () => {
    expect(maskValue('abc', { maskChar: '#' })).toBe('###');
  });

  it('reveals trailing characters', () => {
    expect(maskValue('mysecret123', { revealCount: 3 })).toBe('********123');
  });

  it('handles empty string', () => {
    expect(maskValue('')).toBe('');
  });

  it('clamps revealCount to value length', () => {
    expect(maskValue('hi', { revealCount: 10 })).toBe('hi');
  });
});

describe('maskEnvMap', () => {
  const env = new Map([
    ['DB_PASSWORD', 'supersecret'],
    ['API_KEY', 'abc123'],
    ['PORT', '3000'],
    ['NODE_ENV', 'production'],
  ]);

  it('masks sensitive keys and leaves others intact', () => {
    const result = maskEnvMap(env);
    expect(result.masked.get('DB_PASSWORD')).toBe('***********');
    expect(result.masked.get('API_KEY')).toBe('******');
    expect(result.masked.get('PORT')).toBe('3000');
    expect(result.masked.get('NODE_ENV')).toBe('production');
  });

  it('reports which keys were masked', () => {
    const result = maskEnvMap(env);
    expect(result.maskedKeys).toContain('DB_PASSWORD');
    expect(result.maskedKeys).toContain('API_KEY');
    expect(result.maskedKeys).not.toContain('PORT');
  });

  it('preserves original map reference', () => {
    const result = maskEnvMap(env);
    expect(result.original).toBe(env);
  });

  it('applies revealCount option', () => {
    const result = maskEnvMap(env, { revealCount: 2 });
    expect(result.masked.get('API_KEY')).toBe('****23');
  });
});
