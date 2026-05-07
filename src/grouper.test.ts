import { groupByPrefix, getGroupNames, flattenGrouped } from './grouper';

const sampleEnv: Record<string, string> = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  REDIS_URL: 'redis://localhost',
  REDIS_TTL: '3600',
  APP_NAME: 'myapp',
  DEBUG: 'true',
};

describe('groupByPrefix', () => {
  it('groups keys by underscore prefix', () => {
    const grouped = groupByPrefix(sampleEnv);
    expect(grouped['DB']).toEqual({ HOST: 'localhost', PORT: '5432' });
    expect(grouped['REDIS']).toEqual({ URL: 'redis://localhost', TTL: '3600' });
    expect(grouped['APP']).toEqual({ NAME: 'myapp' });
  });

  it('places keys without delimiter in ungrouped label', () => {
    const grouped = groupByPrefix(sampleEnv);
    expect(grouped['__ungrouped__']).toEqual({ DEBUG: 'true' });
  });

  it('uses custom delimiter', () => {
    const env = { 'DB.HOST': 'localhost', 'DB.PORT': '5432', STANDALONE: '1' };
    const grouped = groupByPrefix(env, { delimiter: '.' });
    expect(grouped['DB']).toEqual({ HOST: 'localhost', PORT: '5432' });
    expect(grouped['__ungrouped__']).toEqual({ STANDALONE: '1' });
  });

  it('uses custom ungroupedLabel', () => {
    const env = { SOLO: 'yes' };
    const grouped = groupByPrefix(env, { ungroupedLabel: 'misc' });
    expect(grouped['misc']).toEqual({ SOLO: 'yes' });
  });

  it('returns empty object for empty input', () => {
    expect(groupByPrefix({})).toEqual({});
  });
});

describe('getGroupNames', () => {
  it('returns sorted group names', () => {
    const grouped = groupByPrefix(sampleEnv);
    const names = getGroupNames(grouped);
    expect(names).toEqual(['APP', 'DB', 'REDIS', '__ungrouped__'].sort());
  });

  it('returns empty array for empty grouped map', () => {
    expect(getGroupNames({})).toEqual([]);
  });
});

describe('flattenGrouped', () => {
  it('round-trips groupByPrefix correctly', () => {
    const grouped = groupByPrefix(sampleEnv);
    const flat = flattenGrouped(grouped);
    expect(flat).toEqual(sampleEnv);
  });

  it('handles custom delimiter in round-trip', () => {
    const env = { 'DB.HOST': 'localhost', SOLO: '1' };
    const grouped = groupByPrefix(env, { delimiter: '.' });
    const flat = flattenGrouped(grouped, { delimiter: '.' });
    expect(flat).toEqual(env);
  });

  it('returns empty object for empty grouped map', () => {
    expect(flattenGrouped({})).toEqual({});
  });
});
