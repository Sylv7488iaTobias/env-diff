import * as fs from 'fs';
import * as path from 'path';
import { parseEnvFile } from './parser';
import { diffEnvMaps } from './diff';
import { generateReport } from './reporter';

export interface WatchOptions {
  files: string[];
  format?: 'text' | 'json';
  debounceMs?: number;
  onchange?: (report: string) => void;
}

export interface WatchHandle {
  stop: () => void;
  isWatching: () => boolean;
}

export function watchEnvFiles(options: WatchOptions): WatchHandle {
  const { files, format = 'text', debounceMs = 300, onchange } = options;
  let active = true;
  const watchers: fs.FSWatcher[] = [];
  const debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  const runDiff = async () => {
    try {
      const maps = await Promise.all(
        files.map(f => parseEnvFile(path.resolve(f)))
      );
      if (maps.length < 2) return;
      const [base, ...rest] = maps;
      const diffs = rest.map(target => diffEnvMaps(base, target));
      const report = generateReport(diffs, files, format);
      if (onchange) {
        onchange(report);
      } else {
        console.clear();
        console.log(`[env-diff watcher] Change detected at ${new Date().toISOString()}\n`);
        console.log(report);
      }
    } catch (err) {
      console.error('[env-diff watcher] Error reading files:', (err as Error).message);
    }
  };

  for (const file of files) {
    const resolved = path.resolve(file);
    try {
      const watcher = fs.watch(resolved, () => {
        const existing = debounceTimers.get(resolved);
        if (existing) clearTimeout(existing);
        const timer = setTimeout(() => {
          debounceTimers.delete(resolved);
          runDiff();
        }, debounceMs);
        debounceTimers.set(resolved, timer);
      });
      watchers.push(watcher);
    } catch (err) {
      console.error(`[env-diff watcher] Cannot watch ${file}:`, (err as Error).message);
    }
  }

  runDiff();

  return {
    stop: () => {
      active = false;
      debounceTimers.forEach(t => clearTimeout(t));
      debounceTimers.clear();
      watchers.forEach(w => w.close());
    },
    isWatching: () => active,
  };
}
