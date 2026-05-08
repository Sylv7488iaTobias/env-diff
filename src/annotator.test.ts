import { extractAnnotations, buildAnnotationResult } from './annotator';
import { buildAnnotatorReport, renderAnnotatorReport, renderAnnotatorJson } from './annotator-report';

const sampleContent = `
# Database host
DB_HOST=localhost
DB_PORT=5432 # Port number
API_KEY=secret
# Redis URL
REDIS_URL=redis://localhost
`.trim();

const sampleMap = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  API_KEY: 'secret',
  REDIS_URL: 'redis://localhost',
};

describe('extractAnnotations', () => {
  it('extracts preceding comment annotations', () => {
    const anns = extractAnnotations(sampleContent);
    const dbHost = anns.find((a) => a.key === 'DB_HOST');
    expect(dbHost).toBeDefined();
    expect(dbHost?.comment).toBe('Database host');
  });

  it('extracts inline comment annotations', () => {
    const anns = extractAnnotations(sampleContent);
    const dbPort = anns.find((a) => a.key === 'DB_PORT');
    expect(dbPort).toBeDefined();
    expect(dbPort?.comment).toBe('Port number');
  });

  it('does not annotate keys without comments', () => {
    const anns = extractAnnotations(sampleContent);
    const apiKey = anns.find((a) => a.key === 'API_KEY');
    expect(apiKey).toBeUndefined();
  });

  it('returns empty array for empty content', () => {
    expect(extractAnnotations('')).toEqual([]);
  });
});

describe('buildAnnotationResult', () => {
  it('counts annotated and unannotated keys', () => {
    const result = buildAnnotationResult(sampleMap, sampleContent);
    expect(result.total).toBe(4);
    expect(result.annotatedCount).toBe(3);
    expect(result.unannotated).toContain('API_KEY');
  });
});

describe('buildAnnotatorReport', () => {
  it('builds a report with summary', () => {
    const result = buildAnnotationResult(sampleMap, sampleContent);
    const report = buildAnnotatorReport(result);
    expect(report.summary).toMatch(/3\/4/);
    expect(report.summary).toMatch(/75%/);
  });
});

describe('renderAnnotatorReport', () => {
  it('renders text output', () => {
    const result = buildAnnotationResult(sampleMap, sampleContent);
    const report = buildAnnotatorReport(result);
    const text = renderAnnotatorReport(report);
    expect(text).toContain('Annotation Coverage');
    expect(text).toContain('DB_HOST');
    expect(text).toContain('API_KEY');
  });
});

describe('renderAnnotatorJson', () => {
  it('renders valid JSON', () => {
    const result = buildAnnotationResult(sampleMap, sampleContent);
    const report = buildAnnotatorReport(result);
    const json = JSON.parse(renderAnnotatorJson(report));
    expect(json.total).toBe(4);
    expect(Array.isArray(json.annotations)).toBe(true);
  });
});
