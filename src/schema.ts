/**
 * Schema validation for .env files
 * Allows defining required keys, optional keys, and value patterns
 */

export interface SchemaRule {
  required: boolean;
  pattern?: RegExp;
  description?: string;
}

export type EnvSchema = Record<string, SchemaRule>;

export interface SchemaValidationResult {
  key: string;
  status: 'missing_required' | 'pattern_mismatch' | 'ok';
  message: string;
}

export function validateAgainstSchema(
  envMap: Record<string, string>,
  schema: EnvSchema
): SchemaValidationResult[] {
  const results: SchemaValidationResult[] = [];

  for (const [key, rule] of Object.entries(schema)) {
    const value = envMap[key];

    if (value === undefined || value === '') {
      if (rule.required) {
        results.push({
          key,
          status: 'missing_required',
          message: `Required key "${key}" is missing${rule.description ? ` (${rule.description})` : ''}`,
        });
      }
      continue;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      results.push({
        key,
        status: 'pattern_mismatch',
        message: `Key "${key}" value does not match expected pattern${rule.description ? ` (${rule.description})` : ''}`,
      });
      continue;
    }

    results.push({ key, status: 'ok', message: `Key "${key}" is valid` });
  }

  return results;
}

export function parseSchemaFile(content: string): EnvSchema {
  const schema: EnvSchema = {};
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const [key, ...rest] = trimmed.split('=');
    const meta = rest.join('=').trim();
    const required = !meta.startsWith('optional');
    const patternMatch = meta.match(/pattern:([^\s]+)/);
    const descMatch = meta.match(/desc:"([^"]+)"/);

    schema[key.trim()] = {
      required,
      pattern: patternMatch ? new RegExp(patternMatch[1]) : undefined,
      description: descMatch ? descMatch[1] : undefined,
    };
  }

  return schema;
}
