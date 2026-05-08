import { EnvMap } from './parser';

export interface Annotation {
  key: string;
  comment: string;
  lineNumber?: number;
}

export interface AnnotationResult {
  annotations: Annotation[];
  unannotated: string[];
  total: number;
  annotatedCount: number;
}

/**
 * Parses inline comments from raw .env content and maps them to keys.
 */
export function extractAnnotations(content: string): Annotation[] {
  const annotations: Annotation[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;

    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    const rest = line.slice(eqIndex + 1);

    // Inline comment after value: KEY=value # comment
    const inlineMatch = rest.match(/#\s*(.+)$/);
    if (inlineMatch) {
      annotations.push({ key, comment: inlineMatch[1].trim(), lineNumber: i + 1 });
      continue;
    }

    // Preceding comment line
    if (i > 0) {
      const prev = lines[i - 1].trim();
      if (prev.startsWith('#')) {
        annotations.push({ key, comment: prev.slice(1).trim(), lineNumber: i + 1 });
      }
    }
  }

  return annotations;
}

/**
 * Builds an annotation result for the given env map and raw content.
 */
export function buildAnnotationResult(
  envMap: EnvMap,
  content: string
): AnnotationResult {
  const annotations = extractAnnotations(content);
  const annotatedKeys = new Set(annotations.map((a) => a.key));
  const allKeys = Object.keys(envMap);
  const unannotated = allKeys.filter((k) => !annotatedKeys.has(k));

  return {
    annotations,
    unannotated,
    total: allKeys.length,
    annotatedCount: annotatedKeys.size,
  };
}
