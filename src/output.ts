import { DiffResult } from './diff';
import { FormatOptions, formatHeader, formatMissing, formatMismatch, formatOk } from './formatter';
import { generateJsonReport } from './reporter';

export function renderTextOutput(
  result: DiffResult,
  file1: string,
  file2: string,
  options: FormatOptions
): string {
  const lines: string[] = [];

  lines.push(formatHeader(file1, file2, options));
  lines.push('');

  const allKeys = new Set([
    ...result.missingInRight.map((e) => e.key),
    ...result.missingInLeft.map((e) => e.key),
    ...result.mismatched.map((e) => e.key),
    ...result.matching.map((e) => e.key),
  ]);

  const sorted = Array.from(allKeys).sort();

  for (const key of sorted) {
    if (result.missingInRight.find((e) => e.key === key)) {
      lines.push(formatMissing(key, file2, options));
    } else if (result.missingInLeft.find((e) => e.key === key)) {
      lines.push(formatMissing(key, file1, options));
    } else if (result.mismatched.find((e) => e.key === key)) {
      const entry = result.mismatched.find((e) => e.key === key)!;
      lines.push(formatMismatch(key, entry.leftValue ?? '', entry.rightValue ?? '', options));
    } else if (options.verbose) {
      lines.push(formatOk(key, options));
    }
  }

  lines.push('');
  const total = allKeys.size;
  const issues = result.missingInLeft.length + result.missingInRight.length + result.mismatched.length;
  lines.push(`Summary: ${issues} issue(s) found across ${total} key(s).`);

  return lines.join('\n');
}

export function renderOutput(
  result: DiffResult,
  file1: string,
  file2: string,
  options: FormatOptions
): string {
  if (options.format === 'json') {
    return generateJsonReport(result);
  }
  return renderTextOutput(result, file1, file2, options);
}
