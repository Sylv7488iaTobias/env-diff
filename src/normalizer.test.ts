import { normalizeEnvContent } from './normalizer';

describe('normalizeEnvContent', () => {
  it('returns original unchanged when no issues', () => {
    const content = 'KEY=value\nOTHER=123\n';
    const result = normalizeEnvContent(content);
    expect(result.normalized).toBe(content);
    expect(result.changes).toHaveLength(0);
  });

  it('strips BOM character', () => {
    const content = '\uFEFFKEY=value\n';
    const result = normalizeEnvContent(content, { stripBom: true });
    expect(result.normalized).toBe('KEY=value\n');
    expect(result.changes).toContainEqual(
      expect.objectContaining({ type: 'bom' })
    );
  });

  it('does not strip BOM when disabled', () => {
    const content = '\uFEFFKEY=value\n';
    const result = normalizeEnvContent(content, { stripBom: false });
    expect(result.normalized.startsWith('\uFEFF')).toBe(true);
    expect(result.changes.filter(c => c.type === 'bom')).toHaveLength(0);
  });

  it('normalizes CRLF to LF', () => {
    const content = 'KEY=value\r\nOTHER=123\r\n';
    const result = normalizeEnvContent(content, { normalizeLineEndings: true });
    expect(result.normalized).toBe('KEY=value\nOTHER=123\n');
    expect(result.changes).toContainEqual(
      expect.objectContaining({ type: 'line-ending' })
    );
  });

  it('trims trailing whitespace from lines', () => {
    const content = 'KEY=value   \nOTHER=123\n';
    const result = normalizeEnvContent(content, { trimTrailingWhitespace: true });
    expect(result.normalized).toBe('KEY=value\nOTHER=123\n');
    expect(result.changes).toContainEqual(
      expect.objectContaining({ type: 'trailing-whitespace', line: 1 })
    );
  });

  it('does not trim trailing whitespace when disabled', () => {
    const content = 'KEY=value   \n';
    const result = normalizeEnvContent(content, { trimTrailingWhitespace: false });
    expect(result.normalized).toBe('KEY=value   \n');
  });

  it('normalizes double quotes to single quotes', () => {
    const content = 'KEY="hello"\n';
    const result = normalizeEnvContent(content, { quoteStyle: 'single' });
    expect(result.normalized).toBe("KEY='hello'\n");
    expect(result.changes).toContainEqual(
      expect.objectContaining({ type: 'quote-style' })
    );
  });

  it('strips quotes when quoteStyle is none', () => {
    const content = 'KEY="hello"\n';
    const result = normalizeEnvContent(content, { quoteStyle: 'none' });
    expect(result.normalized).toBe('KEY=hello\n');
  });

  it('preserves quotes by default', () => {
    const content = 'KEY="hello"\nOTHER=\'world\'\n';
    const result = normalizeEnvContent(content, { quoteStyle: 'preserve' });
    expect(result.normalized).toBe(content);
    expect(result.changes.filter(c => c.type === 'quote-style')).toHaveLength(0);
  });

  it('skips comment lines when normalizing quotes', () => {
    const content = '# KEY="not a var"\n';
    const result = normalizeEnvContent(content, { quoteStyle: 'single' });
    expect(result.normalized).toBe(content);
  });

  it('handles multiple changes in one pass', () => {
    const content = '\uFEFFKEY="val"   \r\n';
    const result = normalizeEnvContent(content, {
      stripBom: true,
      normalizeLineEndings: true,
      trimTrailingWhitespace: true,
      quoteStyle: 'single',
    });
    expect(result.normalized).toBe("KEY='val'\n");
    expect(result.changes.length).toBeGreaterThanOrEqual(3);
    expect(result.original).toBe(content);
  });
});
