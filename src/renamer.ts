import { EnvMap } from './merger';

export interface RenameRule {
  from: string;
  to: string;
}

export interface RenameResult {
  original: EnvMap;
  renamed: EnvMap;
  applied: RenameRule[];
  skipped: RenameRule[];
  conflicts: string[];
}

export function applyRenameRules(envMap: EnvMap, rules: RenameRule[]): RenameResult {
  const renamed: EnvMap = { ...envMap };
  const applied: RenameRule[] = [];
  const skipped: RenameRule[] = [];
  const conflicts: string[] = [];

  for (const rule of rules) {
    if (!(rule.from in envMap)) {
      skipped.push(rule);
      continue;
    }
    if (rule.to in renamed && rule.to !== rule.from) {
      conflicts.push(rule.to);
      skipped.push(rule);
      continue;
    }
    renamed[rule.to] = renamed[rule.from];
    if (rule.to !== rule.from) {
      delete renamed[rule.from];
    }
    applied.push(rule);
  }

  return { original: envMap, renamed, applied, skipped, conflicts };
}

export function parseRenameRules(input: string): RenameRule[] {
  return input
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(pair => {
      const [from, to] = pair.split(':').map(s => s.trim());
      if (!from || !to) throw new Error(`Invalid rename rule: "${pair}" (expected FROM:TO)`);
      return { from, to };
    });
}

export function buildRenameResult(envMap: EnvMap, rules: RenameRule[]): RenameResult {
  return applyRenameRules(envMap, rules);
}
