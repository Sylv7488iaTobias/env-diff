import { inheritEnvMap, applyInheritanceChain } from './inheritator';
import { EnvMap } from './parser';

function makeMap(obj: Record<string, string>): EnvMap {
  return new Map(Object.entries(obj));
}

describe('inheritEnvMap', () => {
  it('inherits all parent keys when child is empty', () => {
    const parent = makeMap({ A: '1', B: '2' });
    const child: EnvMap = new Map();
    const result = inheritEnvMap(child, parent);
    expect(result.resolved.get('A')).toBe('1');
    expect(result.resolved.get('B')).toBe('2');
    expect(result.inherited).toEqual({ A: '1', B: '2' });
    expect(result.overrides).toEqual({});
    expect(result.childOnly).toEqual({});
  });

  it('child values override parent values', () => {
    const parent = makeMap({ A: 'parent-a', B: 'parent-b' });
    const child = makeMap({ A: 'child-a' });
    const result = inheritEnvMap(child, parent);
    expect(result.resolved.get('A')).toBe('child-a');
    expect(result.overrides['A']).toEqual({ childValue: 'child-a', parentValue: 'parent-a' });
    expect(result.inherited['B']).toBe('parent-b');
  });

  it('child-only keys are included in resolved', () => {
    const parent = makeMap({ A: '1' });
    const child = makeMap({ B: '2' });
    const result = inheritEnvMap(child, parent);
    expect(result.resolved.get('B')).toBe('2');
    expect(result.childOnly).toEqual({ B: '2' });
  });

  it('no override recorded when child and parent values are equal', () => {
    const parent = makeMap({ A: 'same' });
    const child = makeMap({ A: 'same' });
    const result = inheritEnvMap(child, parent);
    expect(result.overrides).toEqual({});
    expect(result.inherited).toEqual({});
  });
});

describe('applyInheritanceChain', () => {
  it('applies multiple rules', () => {
    const maps = new Map<string, Map<string, string>>([
      ['base', makeMap({ A: 'a', B: 'b' })],
      ['local', makeMap({ B: 'b-local', C: 'c' })],
    ]);
    const chain = [{ child: 'local', parent: 'base' }];
    const results = applyInheritanceChain(maps, chain);
    const localResult = results.get('local')!;
    expect(localResult.resolved.get('A')).toBe('a');
    expect(localResult.resolved.get('B')).toBe('b-local');
    expect(localResult.resolved.get('C')).toBe('c');
  });

  it('throws if a referenced file is missing', () => {
    const maps = new Map<string, Map<string, string>>([
      ['local', makeMap({ A: '1' })],
    ]);
    expect(() =>
      applyInheritanceChain(maps, [{ child: 'local', parent: 'missing' }])
    ).toThrow(/unknown file/);
  });
});
