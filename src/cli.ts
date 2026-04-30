#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { parseEnvFile } from './parser';
import { diffEnvMaps, hasDifferences } from './diff';
import { generateReport, ReportFormat } from './reporter';

function parseArgs(argv: string[]): {
  base: string;
  compare: string;
  format: ReportFormat;
  showValues: boolean;
} {
  const args = argv.slice(2);
  const formatFlag = args.find(a => a.startsWith('--format='));
  const format = (formatFlag?.split('=')[1] ?? 'text') as ReportFormat;
  const showValues = args.includes('--show-values');
  const positional = args.filter(a => !a.startsWith('--'));

  if (positional.length < 2) {
    console.error('Usage: env-diff <base-file> <compare-file> [--format=text|json] [--show-values]');
    process.exit(1);
  }

  return { base: positional[0], compare: positional[1], format, showValues };
}

function resolveFile(filePath: string): string {
  const resolved = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`File not found: ${resolved}`);
    process.exit(1);
  }
  return resolved;
}

function main(): void {
  const { base, compare, format, showValues } = parseArgs(process.argv);

  const basePath = resolveFile(base);
  const comparePath = resolveFile(compare);

  const baseMap = parseEnvFile(basePath);
  const compareMap = parseEnvFile(comparePath);

  const diffs = diffEnvMaps(baseMap, compareMap);
  const report = generateReport(diffs, { format, showValues });

  console.log(`Comparing: ${base} → ${compare}`);
  console.log();
  console.log(report);

  if (hasDifferences(diffs)) {
    process.exit(1);
  }
}

main();
