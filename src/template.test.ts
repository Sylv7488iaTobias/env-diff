import {
  parseTemplateContent,
  buildTemplateResult,
  validateAgainstTemplate,
} from './template';
import { buildTemplateReport, renderTemplateReport, renderTemplateJson } from './template-report';

const SAMPLE_TEMPLATE = `
# Database host
DB_HOST=localhost

# Database password (required)
DB_PASSWORD=

API_KEY=

# Optional port
PORT=3000
`;

describe('parseTemplateContent', () => {
  it('parses keys with defaults as optional', () => {
    const entries = parseTemplateContent(SAMPLE_TEMPLATE);
    const dbHost = entries.find(e => e.key === 'DB_HOST')!;
    expect(dbHost.defaultValue).toBe('localhost');
    expect(dbHost.required).toBe(false);
  });

  it('parses keys with no default as required', () => {
    const entries = parseTemplateContent(SAMPLE_TEMPLATE);
    const dbPass = entries.find(e => e.key === 'DB_PASSWORD')!;
    expect(dbPass.defaultValue).toBeNull();
    expect(dbPass.required).toBe(true);
  });

  it('captures inline comments', () => {
    const entries = parseTemplateContent(SAMPLE_TEMPLATE);
    const dbHost = entries.find(e => e.key === 'DB_HOST')!;
    expect(dbHost.comment).toBe('Database host');
  });

  it('returns null comment when no preceding comment', () => {
    const entries = parseTemplateContent('API_KEY=\n');
    expect(entries[0].comment).toBeNull();
  });
});

describe('buildTemplateResult', () => {
  it('computes counts correctly', () => {
    const entries = parseTemplateContent(SAMPLE_TEMPLATE);
    const result = buildTemplateResult(entries);
    expect(result.totalKeys).toBe(4);
    expect(result.requiredKeys).toBe(2);
    expect(result.optionalKeys).toBe(2);
  });
});

describe('validateAgainstTemplate', () => {
  const entries = parseTemplateContent(SAMPLE_TEMPLATE);

  it('detects missing required keys', () => {
    const { missingRequired } = validateAgainstTemplate({ DB_HOST: 'localhost' }, entries);
    expect(missingRequired).toContain('DB_PASSWORD');
    expect(missingRequired).toContain('API_KEY');
  });

  it('detects undeclared keys', () => {
    const env = { DB_HOST: 'h', DB_PASSWORD: 'p', API_KEY: 'k', UNKNOWN: 'x' };
    const { undeclared } = validateAgainstTemplate(env, entries);
    expect(undeclared).toContain('UNKNOWN');
  });

  it('passes when all required keys are present', () => {
    const env = { DB_HOST: 'h', DB_PASSWORD: 'p', API_KEY: 'k', PORT: '3000' };
    const { missingRequired } = validateAgainstTemplate(env, entries);
    expect(missingRequired).toHaveLength(0);
  });
});

describe('buildTemplateReport', () => {
  it('marks report invalid when required keys are missing', () => {
    const entries = parseTemplateContent(SAMPLE_TEMPLATE);
    const result = buildTemplateResult(entries);
    const report = buildTemplateReport(result, { DB_HOST: 'localhost' });
    expect(report.valid).toBe(false);
  });

  it('marks report valid when all required keys present', () => {
    const entries = parseTemplateContent(SAMPLE_TEMPLATE);
    const result = buildTemplateResult(entries);
    const env = { DB_HOST: 'h', DB_PASSWORD: 'p', API_KEY: 'k' };
    const report = buildTemplateReport(result, env);
    expect(report.valid).toBe(true);
  });

  it('renderTemplateReport includes missing key names', () => {
    const entries = parseTemplateContent(SAMPLE_TEMPLATE);
    const result = buildTemplateResult(entries);
    const report = buildTemplateReport(result, {});
    const text = renderTemplateReport(report);
    expect(text).toContain('DB_PASSWORD');
    expect(text).toContain('API_KEY');
  });

  it('renderTemplateJson produces valid JSON', () => {
    const entries = parseTemplateContent(SAMPLE_TEMPLATE);
    const result = buildTemplateResult(entries);
    const report = buildTemplateReport(result, {});
    const json = JSON.parse(renderTemplateJson(report));
    expect(json).toHaveProperty('valid');
    expect(json).toHaveProperty('missingRequired');
  });
});
