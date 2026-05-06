import { describe, it, expect } from 'vitest';
import {
  interpolateValue,
  interpolateEnvMap,
  findUnresolvedReferences,
  EnvMap,
} from './interpolator';

describe('interpolateValue', () => {
  it('resolves ${VAR} syntax', () => {
    const env: EnvMap = { HOST: 'localhost', PORT: '5432' };
    expect(interpolateValue('postgres://${HOST}:${PORT}/db', env)).toBe(
      'postgres://localhost:5432/db'
    );
  });

  it('resolves $VAR syntax', () => {
    const env: EnvMap = { DOMAIN: 'example.com' };
    expect(interpolateValue('https://$DOMAIN/api', env)).toBe('https://example.com/api');
  });

  it('leaves unresolvable references intact', () => {
    const env: EnvMap = {};
    expect(interpolateValue('${MISSING}', env)).toBe('${MISSING}');
  });

  it('handles mixed resolved and unresolved', () => {
    const env: EnvMap = { USER: 'admin' };
    expect(interpolateValue('${USER}:${PASS}', env)).toBe('admin:${PASS}');
  });

  it('returns plain strings unchanged', () => {
    expect(interpolateValue('no-vars-here', {})).toBe('no-vars-here');
  });
});

describe('interpolateEnvMap', () => {
  it('interpolates all values in the map', () => {
    const env: EnvMap = {
      HOST: 'localhost',
      PORT: '5432',
      DB_URL: 'postgres://${HOST}:${PORT}/mydb',
    };
    const result = interpolateEnvMap(env);
    expect(result.DB_URL).toBe('postgres://localhost:5432/mydb');
    expect(result.HOST).toBe('localhost');
  });

  it('does not mutate the original map', () => {
    const env: EnvMap = { A: 'hello', B: '$A world' };
    interpolateEnvMap(env);
    expect(env.B).toBe('$A world');
  });

  it('handles empty map', () => {
    expect(interpolateEnvMap({})).toEqual({});
  });
});

describe('findUnresolvedReferences', () => {
  it('returns keys with unresolved references after interpolation', () => {
    const env: EnvMap = {
      RESOLVED: 'plain',
      PARTIAL: '${MISSING}/path',
      ALSO_MISSING: '$UNDEFINED',
    };
    const unresolved = findUnresolvedReferences(env);
    expect(unresolved).toContain('PARTIAL');
    expect(unresolved).toContain('ALSO_MISSING');
    expect(unresolved).not.toContain('RESOLVED');
  });

  it('returns empty array when all values are plain', () => {
    const env: EnvMap = { KEY: 'value', OTHER: '123' };
    expect(findUnresolvedReferences(env)).toEqual([]);
  });
});
