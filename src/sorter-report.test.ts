import { buildSorterReport, renderSorterReport, renderSorterJson } from './sorter-report';
import { SortResult } from './sorter';

const makeResult = (original: string[], sorted: string[], order = 'asc'): SortResult => ({
  originalOrder: original,
  sortedOrder: sorted,
  sortedMap: Object.fromEntries(sorted.map((k, i) => [k, `val${i}`])),
  order,
});

describe('buildSorterReport', () => {
  it('reports no changes when already sorted', () => {
    const result = makeResult(['ALPHA', 'BETA', 'GAMMA'], ['ALPHA', 'BETA', 'GAMMA']);
    const report = buildSorterReport(result);
    expect(report.alreadySorted).toBe(true);
    expect(report.changes).toHaveLength(0);
    expect(report.totalKeys).toBe(3);
    expect(report.order).toBe('asc');
  });

  it('detects reordered keys', () => {
    const result = makeResult(['GAMMA', 'ALPHA', 'BETA'], ['ALPHA', 'BETA', 'GAMMA']);
    const report = buildSorterReport(result);
    expect(report.alreadySorted).toBe(false);
    expect(report.changes.length).toBeGreaterThan(0);
  });

  it('includes original and sorted arrays', () => {
    const original = ['Z_KEY', 'A_KEY'];
    const sorted = ['A_KEY', 'Z_KEY'];
    const result = makeResult(original, sorted);
    const report = buildSorterReport(result);
    expect(report.original).toEqual(original);
    expect(report.sorted).toEqual(sorted);
  });

  it('records correct fromIndex and toIndex for each changed key', () => {
    const result = makeResult(['B', 'A'], ['A', 'B']);
    const report = buildSorterReport(result);
    const changeA = report.changes.find(c => c.key === 'A');
    const changeB = report.changes.find(c => c.key === 'B');
    expect(changeA).toBeDefined();
    expect(changeA?.fromIndex).toBe(1);
    expect(changeA?.toIndex).toBe(0);
    expect(changeB?.fromIndex).toBe(0);
    expect(changeB?.toIndex).toBe(1);
  });
});

describe('renderSorterReport', () => {
  it('includes sort order and key count', () => {
    const result = makeResult(['A', 'B'], ['A', 'B']);
    const report = buildSorterReport(result);
    const text = renderSorterReport(report);
    expect(text).toContain('asc');
    expect(text).toContain('2');
    expect(text).toContain('Already sorted');
  });

  it('lists reordered keys when not sorted', () => {
    const result = makeResult(['B', 'A'], ['A', 'B']);
    const report = buildSorterReport(result);
    const text = renderSorterReport(report);
    expect(text).toContain('Reordered Keys');
    expect(text).toContain('A');
  });
});

describe('renderSorterJson', () => {
  it('returns valid JSON', () => {
    const result = makeResult(['B', 'A'], ['A', 'B']);
    const report = buildSorterReport(result);
    const json = renderSorterJson(report);
    expect(() => JSON.parse(json)).not.toThrow();
    const parsed = JSON.parse(json);
    expect(parsed.totalKeys).toBe(2);
    expect(parsed.alreadySorted).toBe(false);
  });
});
