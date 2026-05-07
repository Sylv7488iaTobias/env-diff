import { TemplateResult, TemplateEntry, validateAgainstTemplate } from './template';
import { EnvMap } from './parser';
import { colorize } from './formatter';

export interface TemplateReport {
  result: TemplateResult;
  missingRequired: string[];
  undeclared: string[];
  valid: boolean;
}

export function buildTemplateReport(
  result: TemplateResult,
  envMap: EnvMap
): TemplateReport {
  const { missingRequired, undeclared } = validateAgainstTemplate(envMap, result.entries);
  return {
    result,
    missingRequired,
    undeclared,
    valid: missingRequired.length === 0,
  };
}

export function renderTemplateReport(report: TemplateReport): string {
  const lines: string[] = [];

  lines.push(colorize('bold', '=== Template Validation Report ==='));
  lines.push(`Total keys in template : ${report.result.totalKeys}`);
  lines.push(`Required keys          : ${report.result.requiredKeys}`);
  lines.push(`Optional keys          : ${report.result.optionalKeys}`);
  lines.push('');

  if (report.missingRequired.length === 0) {
    lines.push(colorize('green', '✔ All required keys are present.'));
  } else {
    lines.push(colorize('red', `✘ Missing required keys (${report.missingRequired.length}):`) );
    for (const key of report.missingRequired) {
      lines.push(colorize('red', `  - ${key}`));
    }
  }

  if (report.undeclared.length > 0) {
    lines.push('');
    lines.push(colorize('yellow', `⚠ Undeclared keys not in template (${report.undeclared.length}):`) );
    for (const key of report.undeclared) {
      lines.push(colorize('yellow', `  ~ ${key}`));
    }
  }

  return lines.join('\n');
}

export function renderTemplateJson(report: TemplateReport): string {
  return JSON.stringify(
    {
      valid: report.valid,
      totalKeys: report.result.totalKeys,
      requiredKeys: report.result.requiredKeys,
      optionalKeys: report.result.optionalKeys,
      missingRequired: report.missingRequired,
      undeclared: report.undeclared,
      entries: report.result.entries,
    },
    null,
    2
  );
}
