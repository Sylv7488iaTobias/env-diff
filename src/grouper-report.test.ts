import { buildGrouperReport, renderGrouperReport, renderGrouperJson } from './grouper-report';
import { groupByPrefix } from './grouper';

const sampleEnv: Record<string, string> = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  APP_NAME: 'myapp',
  DEBUG: 'true',
};

describe('buildGrouperReport', () => {
  it('reports correct total groups and keys', () => {
    const grouped = groupByPrefix(sampleEnv);
    const report = buildGrouperReport(grouped);
    expect(report.totalKeys).toBe(4);
    expect(report.totalGroups).toBe(3); // APP, DB, __ungrouped__
  });

  it('lists keys sorted within each group', () => {
    const grouped = groupByPrefix(sampleEnv);
    const report = buildGrouperReport(grouped);
    const db = report.groups.find((g) => g.name === 'DB');
    expect(db).toBeDefined();
    expect(db!.keys).toEqual(['HOST', 'PORT']);
  });

  it('returns empty report for empty grouped map', () => {
    const report = buildGrouperReport({});
    expect(report.totalGroups).toBe(0);
    expect(report.totalKeys).toBe(0);
    expect(report.groups).toEqual([]);
  });

  it('counts keys correctly per group', () => {
    const grouped = groupByPrefix(sampleEnv);
    const report = buildGrouperReport(grouped);
    const db = report.groups.find((g) => g.name === 'DB');
    expect(db!.keyCount).toBe(2);
  });
});

describe('renderGrouperReport', () => {
  it('includes group names and keys in output', () => {
    const grouped = groupByPrefix(sampleEnv);
    const report = buildGrouperReport(grouped);
    const text = renderGrouperReport(report);
    expect(text).toContain('[DB]');
    expect(text).toContain('HOST');
    expect(text).toContain('PORT');
    expect(text).toContain('Total groups');
    expect(text).toContain('Total keys');
  });

  it('returns minimal output for empty report', () => {
    const text = renderGrouperReport({ totalGroups: 0, totalKeys: 0, groups: [] });
    expect(text).toContain('Total groups : 0');
  });
});

describe('renderGrouperJson', () => {
  it('returns valid JSON', () => {
    const grouped = groupByPrefix(sampleEnv);
    const report = buildGrouperReport(grouped);
    const json = renderGrouperJson(report);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('JSON contains expected fields', () => {
    const grouped = groupByPrefix(sampleEnv);
    const report = buildGrouperReport(grouped);
    const parsed = JSON.parse(renderGrouperJson(report));
    expect(parsed).toHaveProperty('totalGroups');
    expect(parsed).toHaveProperty('totalKeys');
    expect(parsed).toHaveProperty('groups');
  });
});
