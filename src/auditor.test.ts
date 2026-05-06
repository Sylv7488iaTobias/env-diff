import { describe, it, expect } from 'vitest';
import { auditEnvMap, combineAuditResults } from './auditor.js';

describe('auditEnvMap', () => {
  it('returns passed=true for a clean env map', () => {
    const map = { API_URL: 'https://example.com', PORT: '3000' };
    const result = auditEnvMap(map, '.env');
    expect(result.passed).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('flags empty values', () => {
    const map = { API_KEY: '', PORT: '3000' };
    const result = auditEnvMap(map, '.env');
    const issue = result.issues.find((i) => i.key === 'API_KEY');
    expect(issue).toBeDefined();
    expect(issue?.type).toBe('empty');
  });

  it('flags values that are too long', () => {
    const longValue = 'x'.repeat(1025);
    const map = { BIG_KEY: longValue };
    const result = auditEnvMap(map, '.env');
    const issue = result.issues.find((i) => i.type === 'too-long');
    expect(issue).toBeDefined();
    expect(issue?.key).toBe('BIG_KEY');
  });

  it('flags suspicious boolean-like values', () => {
    const map = { FEATURE_FLAG: 'true' };
    const result = auditEnvMap(map, '.env');
    const issue = result.issues.find((i) => i.type === 'suspicious');
    expect(issue).toBeDefined();
  });

  it('detects duplicate keys from raw lines', () => {
    const map = { DB_HOST: 'localhost' };
    const rawLines = ['DB_HOST=localhost', 'DB_HOST=remotehost'];
    const result = auditEnvMap(map, '.env', rawLines);
    const dup = result.issues.find((i) => i.type === 'duplicate');
    expect(dup).toBeDefined();
    expect(dup?.key).toBe('DB_HOST');
  });

  it('does not flag duplicate when key appears once', () => {
    const map = { DB_HOST: 'localhost' };
    const rawLines = ['DB_HOST=localhost'];
    const result = auditEnvMap(map, '.env', rawLines);
    const dup = result.issues.find((i) => i.type === 'duplicate');
    expect(dup).toBeUndefined();
  });

  it('sets passed=false when there are issues', () => {
    const map = { EMPTY_KEY: '' };
    const result = auditEnvMap(map, '.env');
    expect(result.passed).toBe(false);
  });
});

describe('combineAuditResults', () => {
  it('returns allPassed=true when no issues', () => {
    const r1 = auditEnvMap({ KEY: 'val' }, '.env.production');
    const r2 = auditEnvMap({ KEY: 'val2' }, '.env.staging');
    const combined = combineAuditResults([r1, r2]);
    expect(combined.allPassed).toBe(true);
    expect(combined.totalIssues).toBe(0);
  });

  it('sums issues across multiple results', () => {
    const r1 = auditEnvMap({ A: '' }, '.env.production');
    const r2 = auditEnvMap({ B: '', C: '' }, '.env.staging');
    const combined = combineAuditResults([r1, r2]);
    expect(combined.totalIssues).toBe(3);
    expect(combined.allPassed).toBe(false);
  });
});
