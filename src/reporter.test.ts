import { generateReport } from './reporter';
import { DiffResult } from './diff';

const sampleDiffs: Record<string, DiffResult> = {
  DB_HOST: { status: 'missing' },
  API_KEY: { status: 'extra', value: 'abc123' },
  PORT: { status: 'mismatch', baseValue: '3000', compareValue: '4000' },
};

describe('generateReport', () => {
  describe('text format', () => {
    it('returns no-diff message when diffs is empty', () => {
      const result = generateReport({});
      expect(result).toBe('✓ No differences found.');
    });

    it('reports missing keys', () => {
      const result = generateReport({ DB_HOST: { status: 'missing' } });
      expect(result).toContain('MISSING');
      expect(result).toContain('DB_HOST');
    });

    it('reports extra keys', () => {
      const result = generateReport({ API_KEY: { status: 'extra', value: 'abc123' } });
      expect(result).toContain('EXTRA');
      expect(result).toContain('API_KEY');
    });

    it('reports mismatched keys', () => {
      const result = generateReport({ PORT: { status: 'mismatch', baseValue: '3000', compareValue: '4000' } });
      expect(result).toContain('MISMATCH');
      expect(result).toContain('PORT');
    });

    it('hides values by default', () => {
      const result = generateReport(sampleDiffs);
      expect(result).not.toContain('abc123');
      expect(result).not.toContain('3000');
    });

    it('shows values when showValues is true', () => {
      const result = generateReport(sampleDiffs, { showValues: true });
      expect(result).toContain('abc123');
      expect(result).toContain('3000');
      expect(result).toContain('4000');
    });
  });

  describe('json format', () => {
    it('returns valid JSON', () => {
      const result = generateReport(sampleDiffs, { format: 'json' });
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('includes all keys in JSON output', () => {
      const result = generateReport(sampleDiffs, { format: 'json' });
      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('DB_HOST');
      expect(parsed).toHaveProperty('API_KEY');
      expect(parsed).toHaveProperty('PORT');
    });

    it('includes status in each entry', () => {
      const result = generateReport(sampleDiffs, { format: 'json' });
      const parsed = JSON.parse(result);
      expect(parsed.DB_HOST.status).toBe('missing');
      expect(parsed.API_KEY.status).toBe('extra');
      expect(parsed.PORT.status).toBe('mismatch');
    });
  });
});
