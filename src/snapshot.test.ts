import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  computeChecksum,
  createSnapshot,
  saveSnapshot,
  loadSnapshot,
  diffSnapshot,
  EnvSnapshot,
} from './snapshot';

function writeTmp(name: string, content: string): string {
  const p = path.join(os.tmpdir(), name);
  fs.writeFileSync(p, content, 'utf-8');
  return p;
}

describe('computeChecksum', () => {
  it('returns consistent hex string for same input', () => {
    const a = computeChecksum('FOO=bar');
    const b = computeChecksum('FOO=bar');
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{8}$/);
  });

  it('returns different checksums for different input', () => {
    expect(computeChecksum('FOO=bar')).not.toBe(computeChecksum('FOO=baz'));
  });
});

describe('createSnapshot', () => {
  it('creates a snapshot with expected fields', () => {
    const p = writeTmp('snap_test.env', 'KEY=value\nOTHER=123\n');
    const snap = createSnapshot(p);
    expect(snap.keys['KEY']).toBe('value');
    expect(snap.keys['OTHER']).toBe('123');
    expect(snap.checksum).toMatch(/^[0-9a-f]+$/);
    expect(snap.timestamp).toBeTruthy();
  });
});

describe('saveSnapshot / loadSnapshot', () => {
  it('round-trips a snapshot through disk', () => {
    const envPath = writeTmp('snap_rtrip.env', 'A=1\nB=2\n');
    const outPath = writeTmp('snap_rtrip.json', '');
    const snap = createSnapshot(envPath);
    saveSnapshot(snap, outPath);
    const loaded = loadSnapshot(outPath);
    expect(loaded.keys).toEqual(snap.keys);
    expect(loaded.checksum).toBe(snap.checksum);
  });
});

describe('diffSnapshot', () => {
  const base: EnvSnapshot = {
    timestamp: '2024-01-01T00:00:00.000Z',
    filePath: '/tmp/a.env',
    checksum: 'abc',
    keys: { FOO: 'foo', BAR: 'bar', SHARED: 'same' },
  };

  const next: EnvSnapshot = {
    timestamp: '2024-01-02T00:00:00.000Z',
    filePath: '/tmp/a.env',
    checksum: 'def',
    keys: { FOO: 'changed', NEW: 'new', SHARED: 'same' },
  };

  it('detects added keys', () => {
    expect(diffSnapshot(base, next).added).toEqual(['NEW']);
  });

  it('detects removed keys', () => {
    expect(diffSnapshot(base, next).removed).toEqual(['BAR']);
  });

  it('detects changed keys', () => {
    expect(diffSnapshot(base, next).changed).toEqual(['FOO']);
  });

  it('detects unchanged keys', () => {
    expect(diffSnapshot(base, next).unchanged).toEqual(['SHARED']);
  });
});
