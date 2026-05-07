import { profileEnvMap } from './profiler';
import { buildProfileReport, renderProfileReport, renderProfileJson } from './profiler-report';

const mapA = { PORT: '3000', DEBUG: 'false', URL: 'https://a.com', EMPTY: '' };
const mapB = { PORT: '4000', DEBUG: 'true', URL: 'https://b.com' };

describe('buildProfileReport', () => {
  it('includes profile name', () => {
    const profile = profileEnvMap('staging', mapA);
    const lines = buildProfileReport([profile]);
    expect(lines.some(l => l.includes('staging'))).toBe(true);
  });

  it('shows key count', () => {
    const profile = profileEnvMap('prod', mapA);
    const lines = buildProfileReport([profile]);
    expect(lines.some(l => l.includes('4'))).toBe(true);
  });

  it('reports empty keys', () => {
    const profile = profileEnvMap('dev', mapA);
    const lines = buildProfileReport([profile]);
    expect(lines.some(l => l.includes('EMPTY'))).toBe(true);
  });
});

describe('renderProfileReport', () => {
  it('includes comparison section for two profiles', () => {
    const profiles = [profileEnvMap('a', mapA), profileEnvMap('b', mapB)];
    const report = renderProfileReport(profiles);
    expect(report).toContain('Comparison');
  });

  it('does not include comparison for single profile', () => {
    const profiles = [profileEnvMap('a', mapA)];
    const report = renderProfileReport(profiles);
    expect(report).not.toContain('Comparison');
  });

  it('returns a non-empty string', () => {
    const profiles = [profileEnvMap('x', mapA)];
    expect(renderProfileReport(profiles).length).toBeGreaterThan(0);
  });
});

describe('renderProfileJson', () => {
  it('produces valid JSON', () => {
    const profiles = [profileEnvMap('a', mapA), profileEnvMap('b', mapB)];
    const json = renderProfileJson(profiles);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('includes comparison key for two profiles', () => {
    const profiles = [profileEnvMap('a', mapA), profileEnvMap('b', mapB)];
    const parsed = JSON.parse(renderProfileJson(profiles));
    expect(parsed).toHaveProperty('comparison');
  });

  it('omits comparison key for single profile', () => {
    const profiles = [profileEnvMap('a', mapA)];
    const parsed = JSON.parse(renderProfileJson(profiles));
    expect(parsed).not.toHaveProperty('comparison');
  });
});
