import { EnvMap } from './parser';

export interface EnvProfile {
  name: string;
  keyCount: number;
  emptyValues: string[];
  numericValues: string[];
  booleanValues: string[];
  urlValues: string[];
  longestKey: string;
  longestValue: string;
  averageValueLength: number;
}

const URL_PATTERN = /^https?:\/\//i;
const BOOL_PATTERN = /^(true|false|yes|no|1|0)$/i;
const NUM_PATTERN = /^-?\d+(\.\d+)?$/;

export function profileEnvMap(name: string, map: EnvMap): EnvProfile {
  const keys = Object.keys(map);
  const emptyValues: string[] = [];
  const numericValues: string[] = [];
  const booleanValues: string[] = [];
  const urlValues: string[] = [];
  let totalValueLength = 0;
  let longestKey = '';
  let longestValue = '';

  for (const key of keys) {
    const value = map[key];
    if (value === '') emptyValues.push(key);
    if (NUM_PATTERN.test(value)) numericValues.push(key);
    if (BOOL_PATTERN.test(value)) booleanValues.push(key);
    if (URL_PATTERN.test(value)) urlValues.push(key);
    totalValueLength += value.length;
    if (key.length > longestKey.length) longestKey = key;
    if (value.length > longestValue.length) longestValue = key;
  }

  return {
    name,
    keyCount: keys.length,
    emptyValues,
    numericValues,
    booleanValues,
    urlValues,
    longestKey,
    longestValue,
    averageValueLength: keys.length > 0 ? Math.round(totalValueLength / keys.length) : 0,
  };
}

export function compareProfiles(a: EnvProfile, b: EnvProfile): Record<string, unknown> {
  return {
    keyCountDiff: b.keyCount - a.keyCount,
    emptyValuesDiff: b.emptyValues.length - a.emptyValues.length,
    onlyEmptyInA: a.emptyValues.filter(k => !b.emptyValues.includes(k)),
    onlyEmptyInB: b.emptyValues.filter(k => !a.emptyValues.includes(k)),
    avgValueLengthDiff: b.averageValueLength - a.averageValueLength,
  };
}
