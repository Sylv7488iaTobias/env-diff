import { compareEnvMaps } from './comparator';
import { buildComparatorReport, renderComparatorJson, renderComparatorReport } from './comparator-report';

const left = { API_KEY: 'abc', DB_HOST: 'localhost', TIMEOUT: '30' };
const right = { API_KEY: 'xyz', DB_HOST: 'localhost', PORT: '8080' };

describe('buildComparatorReport', () => {
  it('includes file names in header', () => {
    const result = compareEnvMaps(left, right, 'dev.env', 'prod.env');
    const report = buildComparatorReport(result, false);
    expect(report).toContain('dev.env');
    expect(report).toContain('prod.env');
  });

  it('includes MATCH label for matching keys', () => {
    const result = compareEnvMaps(left, right, 'a.env', 'b.env');
    const report = buildComparatorReport(result, false);
    expect(report).toContain('[MATCH]');
    expect(report).toContain('DB_HOST');
  });

  it('includes MISMATCH label and values', () => {
    const result = compareEnvMaps(left, right, 'a.env', 'b.env');
    const report = buildComparatorReport(result, false);
    expect(report).toContain('[MISMATCH]');
    expect(report).toContain('API_KEY');
    expect(report).toContain('abc');
    expect(report).toContain('xyz');
  });

  it('includes MISSING RIGHT label', () => {
    const result = compareEnvMaps(left, right, 'a.env', 'b.env');
    const report = buildComparatorReport(result, false);
    expect(report).toContain('[MISSING RIGHT]');
    expect(report).toContain('TIMEOUT');
  });

  it('includes MISSING LEFT label', () => {
    const result = compareEnvMaps(left, right, 'a.env', 'b.env');
    const report = buildComparatorReport(result, false);
    expect(report).toContain('[MISSING LEFT]');
    expect(report).toContain('PORT');
  });

  it('includes summary line', () => {
    const result = compareEnvMaps(left, right, 'a.env', 'b.env');
    const report = buildComparatorReport(result, false);
    expect(report).toContain('Summary:');
  });
});

describe('renderComparatorJson', () => {
  it('returns valid JSON', () => {
    const result = compareEnvMaps(left, right, 'a.env', 'b.env');
    const json = renderComparatorJson(result);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('includes entries in JSON output', () => {
    const result = compareEnvMaps(left, right, 'a.env', 'b.env');
    const parsed = JSON.parse(renderComparatorJson(result));
    expect(Array.isArray(parsed.entries)).toBe(true);
    expect(parsed.totalKeys).toBe(4);
  });
});

describe('renderComparatorReport', () => {
  it('delegates to text report', () => {
    const result = compareEnvMaps(left, right, 'a.env', 'b.env');
    const output = renderComparatorReport(result, 'text', false);
    expect(output).toContain('[MATCH]');
  });

  it('delegates to json report', () => {
    const result = compareEnvMaps(left, right, 'a.env', 'b.env');
    const output = renderComparatorReport(result, 'json', false);
    expect(() => JSON.parse(output)).not.toThrow();
  });
});
