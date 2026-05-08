import {
  buildResolverReport,
  renderResolverReport,
  renderResolverJson,
} from './resolver-report';
import { ResolveResult } from './resolver';

const mockResult: ResolveResult = {
  files: [
    { filePath: '/app/.env', exists: true, isDefault: true },
    { filePath: '/app/.env.staging', exists: true, isDefault: false },
    { filePath: '/app/.env.staging.local', exists: false, isDefault: false },
  ],
  resolved: ['/app/.env', '/app/.env.staging'],
  missing: ['/app/.env.staging.local'],
};

describe('buildResolverReport', () => {
  it('sets resolvedCount and missingCount correctly', () => {
    const report = buildResolverReport('staging', mockResult);
    expect(report.env).toBe('staging');
    expect(report.resolvedCount).toBe(2);
    expect(report.missingCount).toBe(1);
    expect(report.files).toHaveLength(3);
  });
});

describe('renderResolverReport', () => {
  it('includes env name in output', () => {
    const report = buildResolverReport('staging', mockResult);
    const text = renderResolverReport(report);
    expect(text).toContain('staging');
  });

  it('shows found and missing counts', () => {
    const report = buildResolverReport('staging', mockResult);
    const text = renderResolverReport(report);
    expect(text).toContain('Found: 2');
    expect(text).toContain('Missing: 1');
  });

  it('marks existing files with a checkmark indicator', () => {
    const report = buildResolverReport('staging', mockResult);
    const text = renderResolverReport(report);
    expect(text).toContain('.env');
  });
});

describe('renderResolverJson', () => {
  it('produces valid JSON', () => {
    const report = buildResolverReport('staging', mockResult);
    const json = renderResolverJson(report);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('includes env and file data', () => {
    const report = buildResolverReport('staging', mockResult);
    const parsed = JSON.parse(renderResolverJson(report));
    expect(parsed.env).toBe('staging');
    expect(parsed.resolvedCount).toBe(2);
    expect(Array.isArray(parsed.files)).toBe(true);
  });
});
