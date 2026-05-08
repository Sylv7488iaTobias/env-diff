import {
  deduplicateAgainstReference,
  mergeWithStrategy,
  buildDeduplicateResult,
} from './deduplicator';
import { EnvMap } from './parser';

describe('deduplicateAgainstReference', () => {
  const source: EnvMap = { A: '1', B: '2', C: '3' };
  const reference: EnvMap = { A: 'ref_a', C: 'ref_c' };

  it('removes keys that exist in the reference by default', () => {
    const result = deduplicateAgainstReference(source, reference);
    expect(result.deduplicated).toEqual({ B: '2' });
    expect(result.removedKeys).toEqual(['A', 'C']);
    expect(result.keptKeys).toEqual(['B']);
  });

  it('keeps only keys that exist in reference when intersect=true', () => {
    const result = deduplicateAgainstReference(source, reference, { intersect: true });
    expect(result.deduplicated).toEqual({ A: '1', C: '3' });
    expect(result.removedKeys).toEqual(['B']);
    expect(result.keptKeys).toEqual(['A', 'C']);
  });

  it('returns full source when reference is empty', () => {
    const result = deduplicateAgainstReference(source, {});
    expect(result.deduplicated).toEqual(source);
    expect(result.removedKeys).toHaveLength(0);
  });

  it('returns empty deduplicated when source is empty', () => {
    const result = deduplicateAgainstReference({}, reference);
    expect(result.deduplicated).toEqual({});
  });
});

describe('mergeWithStrategy', () => {
  const map1: EnvMap = { A: 'first', B: 'b1' };
  const map2: EnvMap = { A: 'second', C: 'c2' };

  it('uses last value by default when keys conflict', () => {
    const result = mergeWithStrategy([map1, map2]);
    expect(result.A).toBe('second');
    expect(result.B).toBe('b1');
    expect(result.C).toBe('c2');
  });

  it('uses first value when strategy is first', () => {
    const result = mergeWithStrategy([map1, map2], 'first');
    expect(result.A).toBe('first');
  });

  it('handles a single map', () => {
    const result = mergeWithStrategy([map1]);
    expect(result).toEqual(map1);
  });

  it('handles empty array', () => {
    const result = mergeWithStrategy([]);
    expect(result).toEqual({});
  });
});

describe('buildDeduplicateResult', () => {
  const map1: EnvMap = { A: 'v1', B: 'b1' };
  const map2: EnvMap = { A: 'v2', C: 'c2' };
  const map3: EnvMap = { A: 'v3' };

  it('records conflicts for duplicate keys', () => {
    const { conflicts } = buildDeduplicateResult([map1, map2, map3]);
    expect(conflicts.A).toEqual(['v1', 'v2', 'v3']);
    expect(conflicts.B).toBeUndefined();
  });

  it('merged uses last value by default', () => {
    const { merged } = buildDeduplicateResult([map1, map2, map3]);
    expect(merged.A).toBe('v3');
  });

  it('merged uses first value with first strategy', () => {
    const { merged } = buildDeduplicateResult([map1, map2, map3], 'first');
    expect(merged.A).toBe('v1');
  });

  it('no conflicts when all keys are unique', () => {
    const { conflicts } = buildDeduplicateResult([{ X: '1' }, { Y: '2' }]);
    expect(Object.keys(conflicts)).toHaveLength(0);
  });
});
