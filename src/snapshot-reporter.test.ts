import { buildSnapshotReport, renderSnapshotReport, renderSnapshotJson } from './snapshot-reporter';
import { EnvSnapshot } from './snapshot';

const before: EnvSnapshot = {
  timestamp: '2024-01-01T00:00:00.000Z',
  filePath: '/tmp/before.env',
  checksum: 'aaa',
  keys: { FOO: 'foo', BAR: 'bar', KEEP: 'same' },
};

const after: EnvSnapshot = {
  timestamp: '2024-01-02T00:00:00.000Z',
  filePath: '/tmp/after.env',
  checksum: 'bbb',
  keys: { FOO: 'newfoo', NEW: 'added', KEEP: 'same' },
};

describe('buildSnapshotReport', () => {
  it('includes timestamps from both snapshots', () => {
    const report = buildSnapshotReport(before, after);
    expect(report.before).toBe(before.timestamp);
    expect(report.after).toBe(after.timestamp);
  });

  it('lists added keys', () => {
    const report = buildSnapshotReport(before, after);
    expect(report.added).toContain('NEW');
  });

  it('lists removed keys', () => {
    const report = buildSnapshotReport(before, after);
    expect(report.removed).toContain('BAR');
  });

  it('lists changed keys with from/to values', () => {
    const report = buildSnapshotReport(before, after);
    expect(report.changed).toEqual([{ key: 'FOO', from: 'foo', to: 'newfoo' }]);
  });

  it('counts unchanged keys', () => {
    const report = buildSnapshotReport(before, after);
    expect(report.unchanged).toBe(1);
  });
});

describe('renderSnapshotReport', () => {
  it('contains added/removed/changed sections', () => {
    const report = buildSnapshotReport(before, after);
    const text = renderSnapshotReport(report, false);
    expect(text).toContain('Added keys:');
    expect(text).toContain('+ NEW');
    expect(text).toContain('Removed keys:');
    expect(text).toContain('- BAR');
    expect(text).toContain('Changed keys:');
    expect(text).toContain('~ FOO');
    expect(text).toContain('Unchanged: 1');
  });

  it('includes timestamps in header', () => {
    const report = buildSnapshotReport(before, after);
    const text = renderSnapshotReport(report, false);
    expect(text).toContain('2024-01-01');
    expect(text).toContain('2024-01-02');
  });
});

describe('renderSnapshotJson', () => {
  it('returns valid JSON with expected fields', () => {
    const report = buildSnapshotReport(before, after);
    const json = JSON.parse(renderSnapshotJson(report));
    expect(json.added).toContain('NEW');
    expect(json.removed).toContain('BAR');
    expect(json.changed[0].key).toBe('FOO');
  });
});
