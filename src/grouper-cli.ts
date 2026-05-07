import * as fs from 'fs';
import * as path from 'path';
import { parseEnvContent } from './parser';
import { groupByPrefix } from './grouper';
import { buildGrouperReport, renderGrouperReport, renderGrouperJson } from './grouper-report';

export interface GrouperCliArgs {
  file: string;
  delimiter: string;
  format: 'text' | 'json';
  ungroupedLabel: string;
}

export function parseGrouperArgs(argv: string[]): GrouperCliArgs {
  const args: GrouperCliArgs = {
    file: '',
    delimiter: '_',
    format: 'text',
    ungroupedLabel: '__ungrouped__',
  };

  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--file':
      case '-f':
        args.file = argv[++i];
        break;
      case '--delimiter':
      case '-d':
        args.delimiter = argv[++i];
        break;
      case '--format':
        args.format = argv[++i] as 'text' | 'json';
        break;
      case '--ungrouped-label':
        args.ungroupedLabel = argv[++i];
        break;
    }
  }

  return args;
}

export function runGrouper(argv: string[]): void {
  const args = parseGrouperArgs(argv);

  if (!args.file) {
    console.error('Error: --file <path> is required');
    process.exit(1);
  }

  const resolved = path.resolve(args.file);
  if (!fs.existsSync(resolved)) {
    console.error(`Error: file not found: ${resolved}`);
    process.exit(1);
  }

  const content = fs.readFileSync(resolved, 'utf-8');
  const envMap = parseEnvContent(content);
  const grouped = groupByPrefix(envMap, {
    delimiter: args.delimiter,
    ungroupedLabel: args.ungroupedLabel,
  });
  const report = buildGrouperReport(grouped);

  const output =
    args.format === 'json'
      ? renderGrouperJson(report)
      : renderGrouperReport(report);

  console.log(output);
}
