import { describe, it, expect } from 'vitest';
import { categorizeEnvMap } from './categorizer.js';
import {
  buildCategorizerReport,
  renderCategorizerReport,
  renderCategorizerJson,
} from './categorizer-report.js';

function makeResult() {
  const map = new Map([
    ['DB_HOST', 'localhost'],
    ['JWT_SECRET', 'secret'],
    ['SMTP_HOST', 'mail.example.com'],
    ['APP_NAME', 'myapp'],
  ]);
  return categorizeEnvMap(map);
}

describe('buildCategorizerReport', () => {
  it('builds summary with correct counts', () => {
    const result = makeResult();
    const report = buildCategorizerReport(result);
    expect(report.summary.database).toBe(1);
    expect(report.summary.auth).toBe(1);
    expect(report.summary.email).toBe(1);
    expect(report.summary.other).toBe(1);
  });

  it('includes the original result', () => {
    const result = makeResult();
    const report = buildCategorizerReport(result);
    expect(report.result).toBe(result);
  });
});

describe('renderCategorizerReport', () => {
  it('renders header and categories', () => {
    const report = buildCategorizerReport(makeResult());
    const output = renderCategorizerReport(report);
    expect(output).toContain('=== Env Key Categorizer ===');
    expect(output).toContain('DATABASE');
    expect(output).toContain('DB_HOST');
    expect(output).toContain('AUTH');
    expect(output).toContain('JWT_SECRET');
    expect(output).toContain('Total keys: 4');
  });

  it('omits empty categories', () => {
    const report = buildCategorizerReport(makeResult());
    const output = renderCategorizerReport(report);
    expect(output).not.toContain('STORAGE');
    expect(output).not.toContain('FEATURE_FLAG');
  });
});

describe('renderCategorizerJson', () => {
  it('produces valid JSON', () => {
    const report = buildCategorizerReport(makeResult());
    const json = renderCategorizerJson(report);
    const parsed = JSON.parse(json);
    expect(parsed.total).toBe(4);
    expect(parsed.categories.database).toContain('DB_HOST');
    expect(parsed.categories.auth).toContain('JWT_SECRET');
  });

  it('excludes empty categories from JSON', () => {
    const report = buildCategorizerReport(makeResult());
    const json = renderCategorizerJson(report);
    const parsed = JSON.parse(json);
    expect(parsed.categories.storage).toBeUndefined();
  });
});
