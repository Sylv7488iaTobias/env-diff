import * as fs from 'fs';
import * as path from 'path';
import { parseEnvContent } from './parser';

export interface EnvSnapshot {
  timestamp: string;
  filePath: string;
  keys: Record<string, string>;
  checksum: string;
}

export function computeChecksum(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export function createSnapshot(filePath: string): EnvSnapshot {
  const content = fs.readFileSync(filePath, 'utf-8');
  const keys = parseEnvContent(content);
  return {
    timestamp: new Date().toISOString(),
    filePath: path.resolve(filePath),
    keys,
    checksum: computeChecksum(content),
  };
}

export function saveSnapshot(snapshot: EnvSnapshot, outputPath: string): void {
  fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2), 'utf-8');
}

export function loadSnapshot(snapshotPath: string): EnvSnapshot {
  const raw = fs.readFileSync(snapshotPath, 'utf-8');
  return JSON.parse(raw) as EnvSnapshot;
}

export function diffSnapshot(
  before: EnvSnapshot,
  after: EnvSnapshot
): { added: string[]; removed: string[]; changed: string[]; unchanged: string[] } {
  const beforeKeys = new Set(Object.keys(before.keys));
  const afterKeys = new Set(Object.keys(after.keys));

  const added = [...afterKeys].filter((k) => !beforeKeys.has(k));
  const removed = [...beforeKeys].filter((k) => !afterKeys.has(k));
  const common = [...beforeKeys].filter((k) => afterKeys.has(k));
  const changed = common.filter((k) => before.keys[k] !== after.keys[k]);
  const unchanged = common.filter((k) => before.keys[k] === after.keys[k]);

  return { added, removed, changed, unchanged };
}
