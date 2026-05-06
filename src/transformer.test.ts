import {
  normalizeKeys,
  trimValues,
  renameKeys,
  filterByPrefix,
  stripPrefix,
  transformEnvMap,
} from './transformer';

const sample = {
  APP_HOST: '  localhost  ',
  APP_PORT: ' 3000 ',
  DB_HOST: 'db.local',
  db_user: 'admin',
};

describe('normalizeKeys', () => {
  it('uppercases keys by default', () => {
    const result = normalizeKeys({ db_user: 'admin', App_Port: '80' });
    expect(result).toEqual({ DB_USER: 'admin', APP_PORT: '80' });
  });

  it('lowercases keys when mode is lower', () => {
    const result = normalizeKeys({ APP_HOST: 'localhost' }, 'lower');
    expect(result).toEqual({ app_host: 'localhost' });
  });
});

describe('trimValues', () => {
  it('trims whitespace from all values', () => {
    const result = trimValues({ A: '  hello  ', B: 'world' });
    expect(result).toEqual({ A: 'hello', B: 'world' });
  });
});

describe('renameKeys', () => {
  it('renames specified keys', () => {
    const result = renameKeys({ OLD_KEY: 'val', KEEP: 'ok' }, { OLD_KEY: 'NEW_KEY' });
    expect(result).toEqual({ NEW_KEY: 'val', KEEP: 'ok' });
  });

  it('leaves keys unchanged if not in rename map', () => {
    const result = renameKeys({ A: '1' }, {});
    expect(result).toEqual({ A: '1' });
  });
});

describe('filterByPrefix', () => {
  it('returns only keys matching prefix', () => {
    const result = filterByPrefix(sample, 'APP_');
    expect(Object.keys(result)).toEqual(['APP_HOST', 'APP_PORT']);
  });

  it('returns empty object when no keys match', () => {
    expect(filterByPrefix(sample, 'REDIS_')).toEqual({});
  });
});

describe('stripPrefix', () => {
  it('strips prefix from matching keys', () => {
    const result = stripPrefix({ APP_HOST: 'localhost', APP_PORT: '80' }, 'APP_');
    expect(result).toEqual({ HOST: 'localhost', PORT: '80' });
  });
});

describe('transformEnvMap', () => {
  it('applies trim and normalizeKeys together', () => {
    const result = transformEnvMap(
      { app_host: '  localhost  ' },
      { trimValues: true, normalizeKeys: 'upper' }
    );
    expect(result).toEqual({ APP_HOST: 'localhost' });
  });

  it('filters and strips prefix', () => {
    const result = transformEnvMap(sample, {
      filterPrefix: 'APP_',
      stripPrefix: true,
      trimValues: true,
    });
    expect(result).toEqual({ HOST: 'localhost', PORT: '3000' });
  });

  it('applies rename map', () => {
    const result = transformEnvMap(
      { DB_HOST: 'db.local' },
      { renameMap: { DB_HOST: 'DATABASE_HOST' } }
    );
    expect(result).toEqual({ DATABASE_HOST: 'db.local' });
  });
});
