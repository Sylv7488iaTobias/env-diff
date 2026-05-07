import { profileEnvMap, compareProfiles, EnvProfile } from './profiler';

const sampleMap = {
  DATABASE_URL: 'https://db.example.com/prod',
  PORT: '3000',
  DEBUG: 'true',
  EMPTY_KEY: '',
  APP_NAME: 'my-app',
  SECRET_KEY: 'abc123',
};

describe('profileEnvMap', () => {
  let profile: EnvProfile;
  beforeEach(() => { profile = profileEnvMap('test', sampleMap); });

  it('counts keys correctly', () => {
    expect(profile.keyCount).toBe(6);
  });

  it('detects empty values', () => {
    expect(profile.emptyValues).toContain('EMPTY_KEY');
    expect(profile.emptyValues).toHaveLength(1);
  });

  it('detects numeric values', () => {
    expect(profile.numericValues).toContain('PORT');
  });

  it('detects boolean values', () => {
    expect(profile.booleanValues).toContain('DEBUG');
  });

  it('detects URL values', () => {
    expect(profile.urlValues).toContain('DATABASE_URL');
  });

  it('computes average value length', () => {
    expect(profile.averageValueLength).toBeGreaterThan(0);
  });

  it('identifies longest key', () => {
    expect(profile.longestKey).toBe('DATABASE_URL');
  });

  it('returns name', () => {
    expect(profile.name).toBe('test');
  });
});

describe('compareProfiles', () => {
  it('computes key count diff', () => {
    const a = profileEnvMap('a', { A: '1', B: '2' });
    const b = profileEnvMap('b', { A: '1', B: '2', C: '3' });
    const cmp = compareProfiles(a, b);
    expect(cmp.keyCountDiff).toBe(1);
  });

  it('identifies empty-value differences', () => {
    const a = profileEnvMap('a', { X: '' });
    const b = profileEnvMap('b', { X: 'val' });
    const cmp = compareProfiles(a, b) as any;
    expect(cmp.onlyEmptyInA).toContain('X');
    expect(cmp.onlyEmptyInB).toHaveLength(0);
  });

  it('handles identical profiles', () => {
    const a = profileEnvMap('a', { K: 'v' });
    const cmp = compareProfiles(a, a);
    expect(cmp.keyCountDiff).toBe(0);
  });
});
