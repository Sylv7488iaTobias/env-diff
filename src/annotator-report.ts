import { AnnotationResult } from './annotator';

export interface AnnotatorReport {
  result: AnnotationResult;
  summary: string;
}

export function buildAnnotatorReport(result: AnnotationResult): AnnotatorReport {
  const pct =
    result.total > 0
      ? Math.round((result.annotatedCount / result.total) * 100)
      : 0;
  const summary = `${result.annotatedCount}/${result.total} keys annotated (${pct}%)`;
  return { result, summary };
}

export function renderAnnotatorReport(report: AnnotatorReport): string {
  const lines: string[] = [];
  lines.push(`Annotation Coverage: ${report.summary}`);
  lines.push('');

  if (report.result.annotations.length > 0) {
    lines.push('Annotated Keys:');
    for (const ann of report.result.annotations) {
      const loc = ann.lineNumber != null ? ` (line ${ann.lineNumber})` : '';
      lines.push(`  ${ann.key}${loc}: ${ann.comment}`);
    }
  }

  if (report.result.unannotated.length > 0) {
    lines.push('');
    lines.push('Unannotated Keys:');
    for (const key of report.result.unannotated) {
      lines.push(`  - ${key}`);
    }
  }

  return lines.join('\n');
}

export function renderAnnotatorJson(report: AnnotatorReport): string {
  return JSON.stringify(
    {
      summary: report.summary,
      annotatedCount: report.result.annotatedCount,
      total: report.result.total,
      annotations: report.result.annotations,
      unannotated: report.result.unannotated,
    },
    null,
    2
  );
}
