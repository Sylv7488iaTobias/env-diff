import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { watchEnvFiles } from './watcher';

function writeTmp(dir: string, name: string, content: string): string {
  const file = path.join(dir, name);
  fs.writeFileSync(file, content, 'utf8');
  return file;
}

describe('watchEnvFiles', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'env-diff-watch-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns a handle with stop and isWatching', () => {
    const f1 = writeTmp(tmpDir, '.env.a', 'KEY=a\n');
    const f2 = writeTmp(tmpDir, '.env.b', 'KEY=b\n');
    const handle = watchEnvFiles({ files: [f1, f2] });
    expect(typeof handle.stop).toBe('function');
    expect(handle.isWatching()).toBe(true);
    handle.stop();
    expect(handle.isWatching()).toBe(false);
  });

  it('calls onchange with a report on initial run', done => {
    const f1 = writeTmp(tmpDir, '.env.a', 'KEY=hello\nONLY_A=1\n');
    const f2 = writeTmp(tmpDir, '.env.b', 'KEY=world\n');
    const handle = watchEnvFiles({
      files: [f1, f2],
      onchange: report => {
        expect(typeof report).toBe('string');
        expect(report.length).toBeGreaterThan(0);
        handle.stop();
        done();
      },
    });
  });

  it('calls onchange again when a file changes', done => {
    const f1 = writeTmp(tmpDir, '.env.a', 'KEY=a\n');
    const f2 = writeTmp(tmpDir, '.env.b', 'KEY=b\n');
    let callCount = 0;
    const handle = watchEnvFiles({
      files: [f1, f2],
      debounceMs: 50,
      onchange: () => {
        callCount++;
        if (callCount === 1) {
          setTimeout(() => {
            fs.writeFileSync(f2, 'KEY=changed\nNEW=1\n', 'utf8');
          }, 20);
        }
        if (callCount >= 2) {
          handle.stop();
          expect(callCount).toBeGreaterThanOrEqual(2);
          done();
        }
      },
    });
  });

  it('handles missing file gracefully without throwing', () => {
    const f1 = writeTmp(tmpDir, '.env.a', 'KEY=a\n');
    expect(() => {
      const handle = watchEnvFiles({
        files: [f1, path.join(tmpDir, 'nonexistent.env')],
        onchange: () => {},
      });
      handle.stop();
    }).not.toThrow();
  });
});
