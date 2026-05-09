import { buildInheritatorReport, renderInheritatorReport, renderInheritatorJson } from './inheritator-report';
import { InheritanceResult } from './inheritator';

function makeResult(overrides = {}): InheritanceResult {
  return {
    resolved: new Map([['A', '1'], ['B', 'child-b'], ['C', 'c-only']]),
    overrides: { B: { childValue: 'child-b', parentValue: 'parent-b' } },
    inherited: { A: '1' },
    childOnly: { C: 'c-only' },
    ...overrides,
  };
}

describe('buildInheritatorReport', () => {
  it('returns label and result', () => {
    const result = makeResult();
    const report = buildInheritatorReport('.env.local → .env', result);
    expect(report.label).toBe('.env.local → .env');
    expect(report.result).toBe(result);
  });
});

describe('renderInheritatorReport', () => {
  it('includes inherited, overridden, and child-only sections', () => {
    const report = buildInheritatorReport('test', makeResult());
    const text = renderInheritatorReport(report);
    expect(text).toContain('Inheritance Report: test');
    expect(text).toContain('Inherited from parent');
    expect(text).toContain('Overridden by child');
    expect(text).toContain('Child-only keys');
    expect(text).toContain('Total resolved keys: 3');
  });

  it('shows key details', () => {
    const report = buildInheritatorReport('test', makeResult());
    const text = renderInheritatorReport(report);
    expect(text).toContain('A');
    expect(text).toContain('B');
    expect(text).toContain('parent-b');
    expect(text).toContain('child-b');
    expect(text).toContain('C');
  });
});

describe('renderInheritatorJson', () => {
  it('produces valid JSON with expected fields', () => {
    const report = buildInheritatorReport('json-test', makeResult());
    const json = JSON.parse(renderInheritatorJson(report));
    expect(json.label).toBe('json-test');
    expect(json.inherited).toEqual({ A: '1' });
    expect(json.overrides.B.childValue).toBe('child-b');
    expect(json.childOnly).toEqual({ C: 'c-only' });
    expect(json.resolvedCount).toBe(3);
  });
});
