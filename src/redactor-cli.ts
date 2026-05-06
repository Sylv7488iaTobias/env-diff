/**
 * CLI integration helpers for the redactor feature.
 * Consumed by src/cli.ts when --redact flag is present.
 */

import * as fs from 'fs';
import * as path from 'path';
import { parseEnvFile } from './parser';
import { redactEnvMap, RedactOptions, RedactMode } from './redactor';
import { buildRedactorReport, renderRedactorReport, renderRedactorJson } from './redactor-report';

export interface RedactCliOptions {
  file: string;
  mode?: RedactMode;
  keys?: string[];
  output?: 'text' | 'json';
  write?: boolean;
}

export function runRedact(options: RedactCliOptions): string {
  const { file, mode = 'mask', keys = [], output = 'text', write = false } = options;
  const resolved = path.resolve(file);

  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }

  const envMap = parseEnvFile(resolved);
  const redactOpts: RedactOptions = { mode, keys };
  const redacted = redactEnvMap(envMap, redactOpts);
  const report = buildRedactorReport(envMap, redactOpts);

  if (write) {
    const lines = Object.entries(redacted)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');
    const outPath = resolved.replace(/(\.[^.]+)?$/, '.redacted$1');
    fs.writeFileSync(outPath, lines + '\n', 'utf-8');
  }

  return output === 'json' ? renderRedactorJson(report) : renderRedactorReport(report);
}

export function parseRedactArgs(argv: string[]): RedactCliOptions {
  const file = argv[0] ?? '';
  const mode = (argv.find(a => a.startsWith('--mode='))?.split('=')[1] ?? 'mask') as RedactMode;
  const keysArg = argv.find(a => a.startsWith('--keys='))?.split('=')[1];
  const keys = keysArg ? keysArg.split(',') : [];
  const output = argv.includes('--json') ? 'json' : 'text';
  const write = argv.includes('--write');
  return { file, mode, keys, output, write };
}
