/**
 * auditor.ts
 * Audits env files for common issues: duplicate keys, empty values,
 * suspicious patterns, and overly long values.
 */

export interface AuditIssue {
  key: string;
  type: 'duplicate' | 'empty' | 'suspicious' | 'too-long';
  message: string;
}

export interface AuditResult {
  file: string;
  issues: AuditIssue[];
  passed: boolean;
}

const MAX_VALUE_LENGTH = 1024;
const SUSPICIOUS_PATTERNS = [
  { pattern: /password\s*=\s*\S+/i, label: 'plaintext password assignment' },
  { pattern: /secret\s*=\s*\S+/i, label: 'plaintext secret assignment' },
  { pattern: /^(true|false|yes|no|1|0)$/i, label: 'boolean-like value (consider explicit flag)' },
];

export function auditEnvMap(
  envMap: Record<string, string>,
  file: string,
  rawLines?: string[]
): AuditResult {
  const issues: AuditIssue[] = [];

  // Detect duplicate keys from raw lines if provided
  if (rawLines) {
    const seen = new Map<string, number>();
    for (const line of rawLines) {
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=/);
      if (match) {
        const key = match[1];
        seen.set(key, (seen.get(key) ?? 0) + 1);
      }
    }
    for (const [key, count] of seen.entries()) {
      if (count > 1) {
        issues.push({ key, type: 'duplicate', message: `Key appears ${count} times` });
      }
    }
  }

  for (const [key, value] of Object.entries(envMap)) {
    // Empty value
    if (value.trim() === '') {
      issues.push({ key, type: 'empty', message: 'Value is empty' });
    }

    // Too long
    if (value.length > MAX_VALUE_LENGTH) {
      issues.push({
        key,
        type: 'too-long',
        message: `Value exceeds ${MAX_VALUE_LENGTH} characters (${value.length})`,
      });
    }

    // Suspicious patterns on value
    for (const { pattern, label } of SUSPICIOUS_PATTERNS) {
      if (pattern.test(value)) {
        issues.push({ key, type: 'suspicious', message: `Suspicious value: ${label}` });
        break;
      }
    }
  }

  return { file, issues, passed: issues.length === 0 };
}

export function combineAuditResults(results: AuditResult[]): {
  totalIssues: number;
  allPassed: boolean;
  results: AuditResult[];
} {
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
  return { totalIssues, allPassed: totalIssues === 0, results };
}
