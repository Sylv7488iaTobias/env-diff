import { describe, it, expect } from 'vitest';
import {
  trimEnvMap,
  trimMultipleEnvMaps,
} from './trimmer';
import {
  buildTrimmerReport,
  renderTrimmerReport,
  renderTrimmerJson,
  renderMultipleTrimmerReports,
} from './trimmer-report';

function makeMap(entries: [string, string][]): Map<string, string> {
  return new Map(entries);
}

describe('trimEnvMap', () => {
  it('removes empty-value keys by default', () => {
    const env = makeMap([['FOO', 'bar'], ['EMPTY', ''], ['BAZ', 'qux']]);
    const { trimmed, removedKeys } = trimEnvMap(env);
    expect(trimmed.has('EMPTY')).toBe(false);
    expect(removedKeys).toContain('EMPTY');
    expect(trimmed.size).toBe(2);
  });

  it('removes comment-style keys by default', () => {
    const env = makeMap([['# comment', ''], ['KEY', 'value']]);
    const { trimmed, removedKeys } = trimEnvMap(env);
    expect(trimmed.has('# comment')).toBe(false);
    expect(removedKeys).toContain('# comment');
  });

  it('removes duplicate keys and records them', () => {
    const env = makeMap([['KEY', 'first'], ['KEY', 'second']]);
    const { trimmed, duplicateKeys } = trimEnvMap(env);
    expect(trimmed.size).toBe(1);
    expect(duplicateKeys).toContain('KEY');
  });

  it('respects removeEmpty=false option', () => {
    const env = makeMap([['EMPTY', '']]);
    const { trimmed } = trimEnvMap(env, { removeEmpty: false });
    expect(trimmed.has('EMPTY')).toBe(true);
  });

  it('returns correct stats', () => {
    const env = makeMap([['A', '1'], ['B', ''], ['C', '3']]);
    const { stats } = trimEnvMap(env);
    expect(stats.originalCount).toBe(3);
    expect(stats.trimmedCount).toBe(2);
    expect(stats.removedCount).toBe(1);
  });
});

describe('trimMultipleEnvMaps', () => {
  it('processes multiple maps', () => {
    const maps = new Map([
      ['dev', makeMap([['A', '1'], ['B', '']])],
      ['prod', makeMap([['A', '1'], ['C', '3']])],
    ]);
    const results = trimMultipleEnvMaps(maps);
    expect(results.size).toBe(2);
    expect(results.get('dev')!.stats.removedCount).toBe(1);
    expect(results.get('prod')!.stats.removedCount).toBe(0);
  });
});

describe('trimmer-report', () => {
  const env = makeMap([['FOO', 'bar'], ['EMPTY', '']]);
  const result = trimEnvMap(env);
  const report = buildTrimmerReport('test', result);

  it('buildTrimmerReport sets label and result', () => {
    expect(report.label).toBe('test');
    expect(report.result).toBe(result);
  });

  it('renderTrimmerReport includes label and stats', () => {
    const text = renderTrimmerReport(report);
    expect(text).toContain('test');
    expect(text).toContain('Original keys');
    expect(text).toContain('EMPTY');
  });

  it('renderTrimmerJson returns valid JSON', () => {
    const json = JSON.parse(renderTrimmerJson(report));
    expect(json.label).toBe('test');
    expect(json.removedKeys).toContain('EMPTY');
    expect(Array.isArray(json.trimmedKeys)).toBe(true);
  });

  it('renderMultipleTrimmerReports joins reports', () => {
    const text = renderMultipleTrimmerReports([report, report]);
    expect(text.split('=== Trimmer Report').length - 1).toBe(2);
  });
});
