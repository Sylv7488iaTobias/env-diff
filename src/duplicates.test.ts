import { describe, it, expect } from 'vitest';
import {
  findDuplicateKeys,
  findIntraFileDuplicates,
  buildDuplicatesResult,
} from './duplicates';

const mapA = { DB_HOST: 'localhost', DB_PORT: '5432', API_KEY: 'abc' };
const mapB = { DB_HOST: 'prod.db.host', DB_PORT: '5432', API_KEY: 'xyz' };
const mapC = { DB_HOST: 'staging.db.host', REDIS_URL: 'redis://localhost' };

describe('findDuplicateKeys', () => {
  it('detects keys with differing values across files', () => {
    const result = findDuplicateKeys({ '.env.dev': mapA, '.env.prod': mapB });
    const keys = result.map((d) => d.key);
    expect(keys).toContain('DB_HOST');
    expect(keys).toContain('API_KEY');
  });

  it('does not flag keys with identical values', () => {
    const result = findDuplicateKeys({ '.env.dev': mapA, '.env.prod': mapB });
    const keys = result.map((d) => d.key);
    expect(keys).not.toContain('DB_PORT');
  });

  it('returns correct files and values for each duplicate', () => {
    const result = findDuplicateKeys({ '.env.dev': mapA, '.env.prod': mapB });
    const dbHost = result.find((d) => d.key === 'DB_HOST')!;
    expect(dbHost.files).toEqual(['.env.dev', '.env.prod']);
    expect(dbHost.values).toContain('localhost');
    expect(dbHost.values).toContain('prod.db.host');
  });

  it('handles keys present in only one file', () => {
    const result = findDuplicateKeys({ '.env.dev': mapA, '.env.staging': mapC });
    const keys = result.map((d) => d.key);
    expect(keys).not.toContain('REDIS_URL');
  });

  it('returns empty array when no maps provided', () => {
    expect(findDuplicateKeys({})).toEqual([]);
  });

  it('returns results sorted by key', () => {
    const result = findDuplicateKeys({ a: mapA, b: mapB });
    const keys = result.map((d) => d.key);
    expect(keys).toEqual([...keys].sort());
  });
});

describe('findIntraFileDuplicates', () => {
  it('detects duplicate keys within a single file', () => {
    const content = 'DB_HOST=localhost\nDB_HOST=otherhost\nAPI_KEY=abc';
    const result = findIntraFileDuplicates(content);
    expect(result['DB_HOST']).toBe(2);
    expect(result['API_KEY']).toBeUndefined();
  });

  it('ignores comment lines', () => {
    const content = '# DB_HOST=localhost\nDB_HOST=real';
    const result = findIntraFileDuplicates(content);
    expect(result['DB_HOST']).toBeUndefined();
  });

  it('returns empty object when no duplicates', () => {
    const content = 'A=1\nB=2\nC=3';
    expect(findIntraFileDuplicates(content)).toEqual({});
  });
});

describe('buildDuplicatesResult', () => {
  it('builds a summary with correct totals', () => {
    const result = buildDuplicatesResult({ '.env.dev': mapA, '.env.prod': mapB });
    expect(result.totalFiles).toBe(2);
    expect(result.totalDuplicates).toBeGreaterThan(0);
    expect(Array.isArray(result.duplicates)).toBe(true);
  });

  it('reports zero duplicates when all values match', () => {
    const same = { DB_PORT: '5432' };
    const result = buildDuplicatesResult({ a: same, b: same });
    expect(result.totalDuplicates).toBe(0);
  });
});
