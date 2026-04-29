import { parseEnvContent, parseEnvFile } from './parser';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('parseEnvContent', () => {
  it('parses simple key=value pairs', () => {
    const result = parseEnvContent('FOO=bar\nBAZ=qux');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('ignores comment lines', () => {
    const result = parseEnvContent('# This is a comment\nFOO=bar');
    expect(result).toEqual({ FOO: 'bar' });
  });

  it('ignores blank lines', () => {
    const result = parseEnvContent('\nFOO=bar\n\nBAZ=qux\n');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('strips double-quoted values', () => {
    const result = parseEnvContent('FOO="hello world"');
    expect(result).toEqual({ FOO: 'hello world' });
  });

  it('strips single-quoted values', () => {
    const result = parseEnvContent("FOO='hello world'");
    expect(result).toEqual({ FOO: 'hello world' });
  });

  it('strips inline comments from unquoted values', () => {
    const result = parseEnvContent('FOO=bar # inline comment');
    expect(result).toEqual({ FOO: 'bar' });
  });

  it('handles empty values', () => {
    const result = parseEnvContent('FOO=');
    expect(result).toEqual({ FOO: '' });
  });

  it('handles values with equals signs', () => {
    const result = parseEnvContent('FOO=bar=baz');
    expect(result).toEqual({ FOO: 'bar=baz' });
  });

  it('skips lines without equals sign', () => {
    const result = parseEnvContent('INVALID_LINE\nFOO=bar');
    expect(result).toEqual({ FOO: 'bar' });
  });
});

describe('parseEnvFile', () => {
  it('reads and parses an actual file', () => {
    const tmpFile = path.join(os.tmpdir(), '.env.test');
    fs.writeFileSync(tmpFile, 'KEY=value\nOTHER=123');
    const result = parseEnvFile(tmpFile);
    expect(result).toEqual({ KEY: 'value', OTHER: '123' });
    fs.unlinkSync(tmpFile);
  });

  it('throws if file does not exist', () => {
    expect(() => parseEnvFile('/nonexistent/.env')).toThrow('File not found');
  });
});
