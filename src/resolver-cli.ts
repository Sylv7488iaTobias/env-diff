import { resolveEnvFiles } from './resolver';
import {
  buildResolverReport,
  renderResolverReport,
  renderResolverJson,
} from './resolver-report';

export interface ResolverArgs {
  env: string;
  basePath?: string;
  cascade: boolean;
  format: 'text' | 'json';
}

export function parseResolverArgs(argv: string[]): ResolverArgs {
  const args: ResolverArgs = {
    env: 'development',
    cascade: true,
    format: 'text',
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--env' || arg === '-e') {
      args.env = argv[++i];
    } else if (arg === '--base' || arg === '-b') {
      args.basePath = argv[++i];
    } else if (arg === '--no-cascade') {
      args.cascade = false;
    } else if (arg === '--format' || arg === '-f') {
      const fmt = argv[++i];
      if (fmt === 'json' || fmt === 'text') args.format = fmt;
    }
  }

  return args;
}

export function runResolver(argv: string[]): void {
  const args = parseResolverArgs(argv);
  const result = resolveEnvFiles(args.env, {
    basePath: args.basePath,
    cascade: args.cascade,
  });
  const report = buildResolverReport(args.env, result);

  if (args.format === 'json') {
    console.log(renderResolverJson(report));
  } else {
    console.log(renderResolverReport(report));
  }

  if (report.missingCount > 0) {
    process.exitCode = 1;
  }
}
