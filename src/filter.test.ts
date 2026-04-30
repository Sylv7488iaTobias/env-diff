import { filterResults, groupByStatus, sortResults } from './filter';
import { DiffResult } from './diff';

const sampleResults: DiffResult[] = [
  { key: 'DB_HOST', status: 'ok', baseValue: 'localhost', compareValue: 'localhost' },
  { key: 'API_KEY', status: 'missing', baseValue: 'abc123', compareValue: undefined },
  { key: 'PORT', status: 'mismatch', baseValue: '3000', compareValue: '4000' },
  { key: 'SECRET', status: 'missing', baseValue: 'secret', compareValue: undefined },
  { key: 'DB_PORT', status: 'ok', baseValue: '5432', compareValue: '5432' },
];

describe('filterResults', () => {
  it('returns all results when status is "all"', () => {
    const result = filterResults(sampleResults, { status: 'all' });
    expect(result).toHaveLength(5);
  });

  it('filters by status "missing"', () => {
    const result = filterResults(sampleResults, { status: 'missing' });
    expect(result).toHaveLength(2);
    expect(result.every((r) => r.status === 'missing')).toBe(true);
  });

  it('filters by status "mismatch"', () => {
    const result = filterResults(sampleResults, { status: 'mismatch' });
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('PORT');
  });

  it('filters by status "ok"', () => {
    const result = filterResults(sampleResults, { status: 'ok' });
    expect(result).toHaveLength(2);
  });

  it('filters by key pattern', () => {
    const result = filterResults(sampleResults, { keyPattern: 'DB_' });
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.key)).toEqual(expect.arrayContaining(['DB_HOST', 'DB_PORT']));
  });

  it('combines status and key pattern filters', () => {
    const result = filterResults(sampleResults, { status: 'ok', keyPattern: 'DB' });
    expect(result).toHaveLength(2);
  });

  it('returns empty array when no match', () => {
    const result = filterResults(sampleResults, { keyPattern: 'NONEXISTENT' });
    expect(result).toHaveLength(0);
  });
});

describe('groupByStatus', () => {
  it('groups results correctly', () => {
    const groups = groupByStatus(sampleResults);
    expect(groups.missing).toHaveLength(2);
    expect(groups.mismatch).toHaveLength(1);
    expect(groups.ok).toHaveLength(2);
    expect(groups.all).toHaveLength(5);
  });
});

describe('sortResults', () => {
  it('sorts missing first, mismatch second, ok last', () => {
    const sorted = sortResults(sampleResults);
    expect(sorted[0].status).toBe('missing');
    expect(sorted[1].status).toBe('missing');
    expect(sorted[2].status).toBe('mismatch');
    expect(sorted[3].status).toBe('ok');
    expect(sorted[4].status).toBe('ok');
  });

  it('does not mutate original array', () => {
    const original = [...sampleResults];
    sortResults(sampleResults);
    expect(sampleResults).toEqual(original);
  });
});
