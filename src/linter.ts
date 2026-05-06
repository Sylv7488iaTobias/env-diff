import { EnvMap } from './parser';

export type LintSeverity = 'error' | 'warn' | 'info';

export interface LintIssue {
  key: string;
  message: string;
  severity: LintSeverity;
  rule: string;
}

export interface LintResult {
  issues: LintIssue[];
  errorCount: number;
  warnCount: number;
  infoCount: number;
}

const UPPER_SNAKE_CASE = /^[A-Z][A-Z0-9_]*$/;
const LEADING_TRAILING_SPACE = /^\s|\s$/;
const WEAK_VALUE_PATTERNS = ['changeme', 'password', '123456', 'secret', 'example', 'placeholder'];

export function lintEnvMap(envMap: EnvMap): LintResult {
  const issues: LintIssue[] = [];

  for (const [key, value] of Object.entries(envMap)) {
    if (!UPPER_SNAKE_CASE.test(key)) {
      issues.push({
        key,
        message: `Key "${key}" should be UPPER_SNAKE_CASE`,
        severity: 'warn',
        rule: 'key-casing',
      });
    }

    if (key.startsWith('_') || key.endsWith('_')) {
      issues.push({
        key,
        message: `Key "${key}" should not start or end with an underscore`,
        severity: 'warn',
        rule: 'key-underscore-boundary',
      });
    }

    if (value === '') {
      issues.push({
        key,
        message: `Key "${key}" has an empty value`,
        severity: 'info',
        rule: 'no-empty-value',
      });
    }

    if (LEADING_TRAILING_SPACE.test(value)) {
      issues.push({
        key,
        message: `Value for "${key}" has leading or trailing whitespace`,
        severity: 'warn',
        rule: 'no-value-whitespace',
      });
    }

    const lower = value.toLowerCase();
    if (WEAK_VALUE_PATTERNS.some((p) => lower.includes(p))) {
      issues.push({
        key,
        message: `Value for "${key}" looks like a placeholder or weak default`,
        severity: 'warn',
        rule: 'no-weak-value',
      });
    }
  }

  return {
    issues,
    errorCount: issues.filter((i) => i.severity === 'error').length,
    warnCount: issues.filter((i) => i.severity === 'warn').length,
    infoCount: issues.filter((i) => i.severity === 'info').length,
  };
}

export function combineLintResults(...results: LintResult[]): LintResult {
  const issues = results.flatMap((r) => r.issues);
  return {
    issues,
    errorCount: issues.filter((i) => i.severity === 'error').length,
    warnCount: issues.filter((i) => i.severity === 'warn').length,
    infoCount: issues.filter((i) => i.severity === 'info').length,
  };
}
