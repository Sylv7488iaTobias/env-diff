import { validateAgainstSchema, parseSchemaFile, EnvSchema } from './schema';

describe('validateAgainstSchema', () => {
  const schema: EnvSchema = {
    DATABASE_URL: { required: true, description: 'Postgres connection string' },
    PORT: { required: false, pattern: /^\d+$/, description: 'Server port' },
    NODE_ENV: { required: true, pattern: /^(development|production|test)$/ },
  };

  it('returns ok for all valid keys', () => {
    const envMap = { DATABASE_URL: 'postgres://localhost/db', PORT: '3000', NODE_ENV: 'production' };
    const results = validateAgainstSchema(envMap, schema);
    expect(results.every(r => r.status === 'ok')).toBe(true);
  });

  it('flags missing required key', () => {
    const envMap = { PORT: '3000', NODE_ENV: 'test' };
    const results = validateAgainstSchema(envMap, schema);
    const missing = results.find(r => r.key === 'DATABASE_URL');
    expect(missing?.status).toBe('missing_required');
    expect(missing?.message).toContain('DATABASE_URL');
  });

  it('does not flag missing optional key', () => {
    const envMap = { DATABASE_URL: 'postgres://localhost/db', NODE_ENV: 'development' };
    const results = validateAgainstSchema(envMap, schema);
    const portResult = results.find(r => r.key === 'PORT');
    expect(portResult).toBeUndefined();
  });

  it('flags pattern mismatch', () => {
    const envMap = { DATABASE_URL: 'postgres://localhost/db', PORT: 'not-a-number', NODE_ENV: 'production' };
    const results = validateAgainstSchema(envMap, schema);
    const portResult = results.find(r => r.key === 'PORT');
    expect(portResult?.status).toBe('pattern_mismatch');
  });

  it('includes description in message when available', () => {
    const envMap = { PORT: '3000', NODE_ENV: 'test' };
    const results = validateAgainstSchema(envMap, schema);
    const missing = results.find(r => r.key === 'DATABASE_URL');
    expect(missing?.message).toContain('Postgres connection string');
  });
});

describe('parseSchemaFile', () => {
  it('parses required keys', () => {
    const content = 'DATABASE_URL=required desc:"DB connection"\nNODE_ENV=required';
    const schema = parseSchemaFile(content);
    expect(schema['DATABASE_URL'].required).toBe(true);
    expect(schema['DATABASE_URL'].description).toBe('DB connection');
    expect(schema['NODE_ENV'].required).toBe(true);
  });

  it('parses optional keys', () => {
    const content = 'PORT=optional pattern:\\d+';
    const schema = parseSchemaFile(content);
    expect(schema['PORT'].required).toBe(false);
    expect(schema['PORT'].pattern).toBeDefined();
  });

  it('skips comments and empty lines', () => {
    const content = '# This is a comment\n\nDATABASE_URL=required';
    const schema = parseSchemaFile(content);
    expect(Object.keys(schema)).toEqual(['DATABASE_URL']);
  });
});
