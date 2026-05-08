import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { resolveEnvFiles, resolveExplicitFile } from './resolver';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'env-diff-resolver-'));
}

function writeFile(dir: string, name: string, content = 'KEY=val'): string {
  const p = path.join(dir, name);
  fs.writeFileSync(p, content);
  return p;
}

describe('resolveEnvFiles', () => {
  it('returns all three candidates in cascade mode', () => {
    const dir = makeTmpDir();
    writeFile(dir, '.env');
    writeFile(dir, '.env.staging');
    const result = resolveEnvFiles('staging', { basePath: dir });
    expect(result.files).toHaveLength(3);
    expect(result.resolved).toHaveLength(2);
    expect(result.missing).toHaveLength(1);
  });

  it('returns only one candidate when cascade is false', () => {
    const dir = makeTmpDir();
    writeFile(dir, '.env.production');
    const result = resolveEnvFiles('production', {
      basePath: dir,
      cascade: false,
    });
    expect(result.files).toHaveLength(1);
    expect(result.resolved).toHaveLength(1);
    expect(result.missing).toHaveLength(0);
  });

  it('reports all missing when no files exist', () => {
    const dir = makeTmpDir();
    const result = resolveEnvFiles('test', { basePath: dir });
    expect(result.resolved).toHaveLength(0);
    expect(result.missing).toHaveLength(3);
  });

  it('marks the first candidate as default', () => {
    const dir = makeTmpDir();
    const result = resolveEnvFiles('dev', { basePath: dir });
    expect(result.files[0].isDefault).toBe(true);
    expect(result.files[1].isDefault).toBe(false);
  });
});

describe('resolveExplicitFile', () => {
  it('returns exists=true for a real file', () => {
    const dir = makeTmpDir();
    const p = writeFile(dir, 'custom.env');
    const result = resolveExplicitFile(p);
    expect(result.exists).toBe(true);
    expect(result.isDefault).toBe(false);
  });

  it('returns exists=false for a missing file', () => {
    const result = resolveExplicitFile('/nonexistent/.env.ghost');
    expect(result.exists).toBe(false);
  });
});
