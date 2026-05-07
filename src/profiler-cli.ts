import * as fs from 'fs';
import * as path from 'path';
import { parseEnvContent } from './parser';
import { profileEnvMap } from './profiler';
import { renderProfileReport, renderProfileJson } from './profiler-report';

export interface ProfilerArgs {
  files: string[];
  format: 'text' | 'json';
}

export function parseProfilerArgs(argv: string[]): ProfilerArgs {
  const args = argv.slice(2);
  const formatIdx = args.indexOf('--format');
  const format = formatIdx !== -1 && args[formatIdx + 1] === 'json' ? 'json' : 'text';
  const files = args.filter(a => !a.startsWith('--') && a !== 'json' && a !== 'text');
  return { files, format };
}

export async function runProfiler(argv: string[] = process.argv): Promise<void> {
  const { files, format } = parseProfilerArgs(argv);

  if (files.length === 0) {
    console.error('Usage: env-diff profile <file1> [file2] [--format json|text]');
    process.exit(1);
  }

  const profiles = files.map(filePath => {
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) {
      console.error(`File not found: ${resolved}`);
      process.exit(1);
    }
    const content = fs.readFileSync(resolved, 'utf-8');
    const map = parseEnvContent(content);
    return profileEnvMap(path.basename(filePath), map);
  });

  if (format === 'json') {
    console.log(renderProfileJson(profiles));
  } else {
    console.log(renderProfileReport(profiles));
  }
}
