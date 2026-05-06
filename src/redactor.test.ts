import {
  isSensitiveKey,
  redactValue,
  redactEnvMap,
  getSensitiveKeys,
} from './redactor';

describe('isSensitiveKey', () => {
  it('detects common sensitive key names', () => {
    expect(isSensitiveKey('DB_PASSWORD')).toBe(true);
    expect(isSensitiveKey('API_KEY')).toBe(true);
    expect(isSensitiveKey('AUTH_TOKEN')).toBe(true);
    expect(isSensitiveKey('SECRET')).toBe(true);
    expect(isSensitiveKey('PRIVATE_KEY')).toBe(true);
  });

  it('returns false for non-sensitive keys', () => {
    expect(isSensitiveKey('APP_NAME')).toBe(false);
    expect(isSensitiveKey('PORT')).toBe(false);
    expect(isSensitiveKey('NODE_ENV')).toBe(false);
  });

  it('respects extra keys list', () => {
    expect(isSensitiveKey('MY_CUSTOM_KEY', [], ['MY_CUSTOM_KEY'])).toBe(true);
    expect(isSensitiveKey('my_custom_key', [], ['MY_CUSTOM_KEY'])).toBe(true);
  });

  it('respects custom patterns', () => {
    expect(isSensitiveKey('DB_PASS', [/pass/i])).toBe(true);
    expect(isSensitiveKey('USERNAME', [/pass/i])).toBe(false);
  });
});

describe('redactValue', () => {
  it('masks value fully by default', () => {
    expect(redactValue('supersecret')).toBe('********');
  });

  it('partially masks longer values', () => {
    const result = redactValue('supersecret', 'partial');
    expect(result).toMatch(/^su\*{4}et$/);
  });

  it('returns **** for short values in partial mode', () => {
    expect(redactValue('ab', 'partial')).toBe('****');
  });

  it('returns a hash string in hash mode', () => {
    const result = redactValue('mysecret', 'hash');
    expect(result).toMatch(/^\[sha:[0-9a-f]{8}\]$/);
  });

  it('handles empty string', () => {
    expect(redactValue('')).toBe('');
  });
});

describe('redactEnvMap', () => {
  const env = {
    APP_NAME: 'myapp',
    DB_PASSWORD: 'hunter2',
    API_KEY: 'abc123',
    PORT: '3000',
  };

  it('masks sensitive keys and leaves others unchanged', () => {
    const result = redactEnvMap(env);
    expect(result.APP_NAME).toBe('myapp');
    expect(result.PORT).toBe('3000');
    expect(result.DB_PASSWORD).toBe('********');
    expect(result.API_KEY).toBe('********');
  });

  it('applies partial mode', () => {
    const result = redactEnvMap(env, { mode: 'partial' });
    expect(result.DB_PASSWORD).toMatch(/\*{4}/);
  });

  it('respects extra keys', () => {
    const result = redactEnvMap({ PORT: '3000' }, { keys: ['PORT'] });
    expect(result.PORT).toBe('********');
  });
});

describe('getSensitiveKeys', () => {
  it('returns list of sensitive key names', () => {
    const env = { APP: 'x', SECRET_KEY: 'y', TOKEN: 'z', HOST: 'h' };
    const keys = getSensitiveKeys(env);
    expect(keys).toContain('SECRET_KEY');
    expect(keys).toContain('TOKEN');
    expect(keys).not.toContain('APP');
    expect(keys).not.toContain('HOST');
  });
});
