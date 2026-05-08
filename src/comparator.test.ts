import { compareEnvMaps, hasDiscrepancies } from './comparator';

const left = { A: '1', B: '2', C: '3' };
const right = { A: '1', B: '99', D: '4' };

describe('compareEnvMaps', () => {
  it('identifies matching keys', () => {
    const result = compareEnvMaps(left, right, 'left.env', 'right.env');
    const match = result.entries.find(e => e.key === 'A');
    expect(match?.status).toBe('match');
  });

  it('identifies mismatched keys', () => {
    const result = compareEnvMaps(left, right, 'left.env', 'right.env');
    const mismatch = result.entries.find(e => e.key === 'B');
    expect(mismatch?.status).toBe('mismatch');
    expect(mismatch?.leftValue).toBe('2');
    expect(mismatch?.rightValue).toBe('99');
  });

  it('identifies keys missing from right', () => {
    const result = compareEnvMaps(left, right, 'left.env', 'right.env');
    const entry = result.entries.find(e => e.key === 'C');
    expect(entry?.status).toBe('missing_right');
    expect(entry?.leftValue).toBe('3');
    expect(entry?.rightValue).toBeUndefined();
  });

  it('identifies keys missing from left', () => {
    const result = compareEnvMaps(left, right, 'left.env', 'right.env');
    const entry = result.entries.find(e => e.key === 'D');
    expect(entry?.status).toBe('missing_left');
    expect(entry?.rightValue).toBe('4');
    expect(entry?.leftValue).toBeUndefined();
  });

  it('computes correct counts', () => {
    const result = compareEnvMaps(left, right, 'left.env', 'right.env');
    expect(result.matchCount).toBe(1);
    expect(result.mismatchCount).toBe(1);
    expect(result.missingLeftCount).toBe(1);
    expect(result.missingRightCount).toBe(1);
    expect(result.totalKeys).toBe(4);
  });

  it('returns sorted entries by key', () => {
    const result = compareEnvMaps(left, right, 'left.env', 'right.env');
    const keys = result.entries.map(e => e.key);
    expect(keys).toEqual([...keys].sort());
  });

  it('handles identical maps', () => {
    const result = compareEnvMaps(left, left, 'a.env', 'b.env');
    expect(result.matchCount).toBe(3);
    expect(result.mismatchCount).toBe(0);
  });
});

describe('hasDiscrepancies', () => {
  it('returns true when there are mismatches', () => {
    const result = compareEnvMaps(left, right, 'a.env', 'b.env');
    expect(hasDiscrepancies(result)).toBe(true);
  });

  it('returns false for identical maps', () => {
    const result = compareEnvMaps(left, left, 'a.env', 'b.env');
    expect(hasDiscrepancies(result)).toBe(false);
  });
});
