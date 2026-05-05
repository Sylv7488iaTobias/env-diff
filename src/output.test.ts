import { renderTextOutput, renderOutput } from './output';
import { DiffResult } from './diff';
import { DEFAULT_FORMAT_OPTIONS, FormatOptions } from './formatter';

const noColor: FormatOptions = { ...DEFAULT_FORMAT_OPTIONS, color: false };
const verboseNoColor: FormatOptions = { ...noColor, verbose: true };
const jsonFormat: FormatOptions = { ...noColor, format: 'json' };

const sampleResult: DiffResult = {
  missingInRight: [{ key: 'SECRET', leftValue: 'abc', rightValue: undefined }],
  missingInLeft: [{ key: 'NEW_KEY', leftValue: undefined, rightValue: 'xyz' }],
  mismatched: [{ key: 'DB_HOST', leftValue: 'localhost', rightValue: 'prod-db' }],
  matching: [{ key: 'PORT', leftValue: '3000', rightValue: '3000' }],
};

const emptyResult: DiffResult = {
  missingInRight: [],
  missingInLeft: [],
  mismatched: [],
  matching: [],
};

describe('renderTextOutput', () => {
  it('includes file names in header', () => {
    const out = renderTextOutput(sampleResult, '.env', '.env.prod', noColor);
    expect(out).toContain('.env');
    expect(out).toContain('.env.prod');
  });

  it('shows MISSING for keys absent in right file', () => {
    const out = renderTextOutput(sampleResult, '.env', '.env.prod', noColor);
    expect(out).toContain('MISSING');
    expect(out).toContain('SECRET');
  });

  it('shows MISMATCH for mismatched keys', () => {
    const out = renderTextOutput(sampleResult, '.env', '.env.prod', noColor);
    expect(out).toContain('MISMATCH');
    expect(out).toContain('DB_HOST');
  });

  it('does not show OK keys in non-verbose mode', () => {
    const out = renderTextOutput(sampleResult, '.env', '.env.prod', noColor);
    expect(out).not.toContain('[OK]');
  });

  it('shows OK keys in verbose mode', () => {
    const out = renderTextOutput(sampleResult, '.env', '.env.prod', verboseNoColor);
    expect(out).toContain('OK');
    expect(out).toContain('PORT');
  });

  it('includes summary line', () => {
    const out = renderTextOutput(sampleResult, '.env', '.env.prod', noColor);
    expect(out).toContain('Summary:');
    expect(out).toContain('3 issue(s)');
  });

  it('shows 0 issues in summary when result is empty', () => {
    const out = renderTextOutput(emptyResult, '.env', '.env.prod', noColor);
    expect(out).toContain('Summary:');
    expect(out).toContain('0 issue(s)');
  });
});

describe('renderOutput', () => {
  it('returns JSON when format is json', () => {
    const out = renderOutput(sampleResult, '.env', '.env.prod', jsonFormat);
    const parsed = JSON.parse(out);
    expect(parsed).toHaveProperty('missingInRight');
    expect(parsed).toHaveProperty('mismatched');
  });

  it('returns text output for default format', () => {
    const out = renderOutput(sampleResult, '.env', '.env.prod', noColor);
    expect(out).toContain('Comparing:');
  });
});
