import * as fs from 'fs';
import * as path from 'path';

export interface ResolveOptions {
  basePath?: string;
  cascade?: boolean;
}

export interface ResolvedFile {
  filePath: string;
  exists: boolean;
  isDefault: boolean;
}

export interface ResolveResult {
  files: ResolvedFile[];
  resolved: string[];
  missing: string[];
}

/**
 * Resolves .env file variants for a given environment name.
 * E.g. for env="production" looks for: .env, .env.production, .env.production.local
 */
export function resolveEnvFiles(
  env: string,
  options: ResolveOptions = {}
): ResolveResult {
  const base = options.basePath ?? process.cwd();
  const cascade = options.cascade ?? true;

  const candidates = cascade
    ? ['.env', `.env.${env}`, `.env.${env}.local`]
    : [`.env.${env}`];

  const files: ResolvedFile[] = candidates.map((name, idx) => {
    const filePath = path.resolve(base, name);
    return {
      filePath,
      exists: fs.existsSync(filePath),
      isDefault: idx === 0,
    };
  });

  return {
    files,
    resolved: files.filter((f) => f.exists).map((f) => f.filePath),
    missing: files.filter((f) => !f.exists).map((f) => f.filePath),
  };
}

/**
 * Resolves a single explicit file path, checking existence.
 */
export function resolveExplicitFile(
  filePath: string,
  basePath?: string
): ResolvedFile {
  const resolved = path.resolve(basePath ?? process.cwd(), filePath);
  return {
    filePath: resolved,
    exists: fs.existsSync(resolved),
    isDefault: false,
  };
}
