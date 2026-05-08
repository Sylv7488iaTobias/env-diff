import * as fs from 'fs';
import * as path from 'path';
import { parseEnvFile } from './parser';
import { compareEnvMaps, hasDiscrepancies } from './comparator';
import { renderComparatorReport } from './comparator-report';

export interface ComparatorArgs {
  leftFile: string;
  rightFile: string;
  format: 'text' | 'json';
  noColor: boolean;
  onlyDiffs: boolean;
}

export function parseComparatorArgs(argv: string[]): ComparatorArgs {
  const args = argv.slice(2);
  const format = args.includes('--json') ? 'json' : 'text';
  const noColor = args.includes('--no-color');
  const onlyDiffs = args.includes('--only-diffs');
  const files = args.filter(a => !a.startsWith('--'));

  if (files.length < 2) {
    console.error('Usage: env-diff compare <left.env> <right.env> [--json] [--no-color] [--only-diffs]');
    process.exit(1);
  }

  return { leftFile: files[0], rightFile: files[1], format, noColor, onlyDiffs };
}

export async function runComparator(argv: string[]): Promise<void> {
  const args = parseComparatorArgs(argv);
  const leftPath = path.resolve(args.leftFile);
  const rightPath = path.resolve(args.rightFile);

  if (!fs.existsSync(leftPath)) {
    console.error(`File not found: ${leftPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(rightPath)) {
    console.error(`File not found: ${rightPath}`);
    process.exit(1);
  }

  const leftMap = parseEnvFile(leftPath);
  const rightMap = parseEnvFile(rightPath);

  let result = compareEnvMaps(leftMap, rightMap, args.leftFile, args.rightFile);

  if (args.onlyDiffs) {
    result = { ...result, entries: result.entries.filter(e => e.status !== 'match') };
  }

  const output = renderComparatorReport(result, args.format, !args.noColor);
  console.log(output);

  if (hasDiscrepancies(result)) {
    process.exit(1);
  }
}
