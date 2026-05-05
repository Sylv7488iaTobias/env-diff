/**
 * Validates parsed env maps for common issues:
 * - Empty keys
 * - Keys with whitespace
 * - Duplicate keys (tracked during parsing)
 * - Values that look like unresolved placeholders
 */

export interface ValidationIssue {
  key: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

const PLACEHOLDER_PATTERN = /^\$\{.+\}$|^%[A-Z_]+%$/;
const WHITESPACE_KEY_PATTERN = /\s/;

export function validateEnvMap(
  envMap: Map<string, string>,
  label: string = 'env'
): ValidationResult {
  const issues: ValidationIssue[] = [];

  for (const [key, value] of envMap.entries()) {
    if (!key || key.trim() === '') {
      issues.push({
        key: '(empty)',
        message: `[${label}] Empty key found`,
        severity: 'error',
      });
      continue;
    }

    if (WHITESPACE_KEY_PATTERN.test(key)) {
      issues.push({
        key,
        message: `[${label}] Key "${key}" contains whitespace`,
        severity: 'error',
      });
    }

    if (value === '') {
      issues.push({
        key,
        message: `[${label}] Key "${key}" has an empty value`,
        severity: 'warning',
      });
    }

    if (PLACEHOLDER_PATTERN.test(value)) {
      issues.push({
        key,
        message: `[${label}] Key "${key}" appears to have an unresolved placeholder: "${value}"`,
        severity: 'warning',
      });
    }
  }

  return {
    valid: issues.filter((i) => i.severity === 'error').length === 0,
    issues,
  };
}

export function combineValidationResults(
  ...results: ValidationResult[]
): ValidationResult {
  const allIssues = results.flatMap((r) => r.issues);
  return {
    valid: allIssues.filter((i) => i.severity === 'error').length === 0,
    issues: allIssues,
  };
}
