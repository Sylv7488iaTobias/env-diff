import { exportToJson, exportToCsv, exportToMarkdown, exportResults } from './exporter';
import { DiffResult } from './diff';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const mockResults: DiffResult[] = [
  { key: 'API_URL', status: 'mismatch', expected: 'http://prod', actual: 'http://dev' },
  { key: 'DB_PASS', status: 'missing', expected: 'secret', actual: undefined },
  { key: 'PORT', status: 'ok', expected: '3000', actual: '3000' },
];

describe('exportToJson', () => {
  it('exports keys and statuses without values by default', () => {
    const result = JSON.parse(exportToJson(mockResults, {}));
    expect(result[0]).toEqual({ key: 'API_URL', status: 'mismatch' });
    expect(result[0].expected).toBeUndefined();
  });

  it('includes values when includeValues is true', () => {
    const result = JSON.parse(exportToJson(mockResults, { includeValues: true }));
    expect(result[0].expected).toBe('http://prod');
    expect(result[1].actual).toBeUndefined();
  });
});

describe('exportToCsv', () => {
  it('produces valid CSV with header row', () => {
    const csv = exportToCsv(mockResults, {});
    const lines = csv.split('\n');
    expect(lines[0]).toBe('key,status');
    expect(lines[1]).toContain('API_URL');
    expect(lines[1]).toContain('mismatch');
  });

  it('includes value columns when includeValues is true', () => {
    const csv = exportToCsv(mockResults, { includeValues: true });
    const lines = csv.split('\n');
    expect(lines[0]).toBe('key,status,expected,actual');
    expect(lines[1]).toContain('http://prod');
  });

  it('escapes double quotes in values', () => {
    const results: DiffResult[] = [{ key: 'SAY', status: 'ok', expected: 'say "hi"', actual: 'say "hi"' }];
    const csv = exportToCsv(results, { includeValues: true });
    expect(csv).toContain('say ""hi""');
  });
});

describe('exportToMarkdown', () => {
  it('produces a markdown table with header', () => {
    const md = exportToMarkdown(mockResults, {});
    expect(md).toContain('# Env Diff Report');
    expect(md).toContain('Key | Status');
    expect(md).toContain('API_URL');
  });

  it('shows missing placeholder when includeValues is true', () => {
    const md = exportToMarkdown(mockResults, { includeValues: true });
    expect(md).toContain('_(missing)_');
  });
});

describe('exportResults', () => {
  it('writes a JSON file to disk', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'env-diff-'));
    const outputPath = path.join(tmpDir, 'out.json');
    exportResults(mockResults, { format: 'json', outputPath });
    const content = fs.readFileSync(outputPath, 'utf-8');
    expect(JSON.parse(content)).toHaveLength(3);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('throws on unsupported format', () => {
    expect(() =>
      exportResults(mockResults, { format: 'xml' as any, outputPath: '/tmp/out.xml' })
    ).toThrow('Unsupported export format');
  });
});
