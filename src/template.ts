import * as fs from 'fs';
import * as path from 'path';
import { EnvMap } from './parser';

export interface TemplateEntry {
  key: string;
  defaultValue: string | null;
  comment: string | null;
  required: boolean;
}

export interface TemplateResult {
  entries: TemplateEntry[];
  totalKeys: number;
  requiredKeys: number;
  optionalKeys: number;
}

/**
 * Parse a .env.template file into structured entries.
 * Supports comments (# ...) and required markers (key= with no default).
 */
export function parseTemplateFile(filePath: string): TemplateEntry[] {
  const content = fs.readFileSync(path.resolve(filePath), 'utf-8');
  return parseTemplateContent(content);
}

export function parseTemplateContent(content: string): TemplateEntry[] {
  const lines = content.split(/\r?\n/);
  const entries: TemplateEntry[] = [];
  let pendingComment: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      pendingComment = null;
      continue;
    }
    if (trimmed.startsWith('#')) {
      pendingComment = trimmed.slice(1).trim();
      continue;
    }
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    const rawValue = trimmed.slice(eqIndex + 1).trim();
    const defaultValue = rawValue.length > 0 ? rawValue : null;
    const required = defaultValue === null;

    entries.push({ key, defaultValue, comment: pendingComment, required });
    pendingComment = null;
  }

  return entries;
}

export function buildTemplateResult(entries: TemplateEntry[]): TemplateResult {
  return {
    entries,
    totalKeys: entries.length,
    requiredKeys: entries.filter(e => e.required).length,
    optionalKeys: entries.filter(e => !e.required).length,
  };
}

/**
 * Validate an EnvMap against a template, returning missing required keys
 * and keys present in env but not defined in the template.
 */
export function validateAgainstTemplate(
  envMap: EnvMap,
  entries: TemplateEntry[]
): { missingRequired: string[]; undeclared: string[] } {
  const templateKeys = new Set(entries.map(e => e.key));
  const requiredKeys = new Set(entries.filter(e => e.required).map(e => e.key));

  const missingRequired = [...requiredKeys].filter(k => !(k in envMap));
  const undeclared = Object.keys(envMap).filter(k => !templateKeys.has(k));

  return { missingRequired, undeclared };
}
