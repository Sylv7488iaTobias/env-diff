/**
 * inheritator.ts
 * Handles env file inheritance chains (e.g., .env.local extends .env)
 */

import { EnvMap } from './parser';

export interface InheritanceRule {
  child: string;
  parent: string;
}

export interface InheritanceResult {
  resolved: EnvMap;
  overrides: Record<string, { childValue: string; parentValue: string }>;
  inherited: Record<string, string>;
  childOnly: Record<string, string>;
}

/**
 * Merges a parent EnvMap into a child EnvMap.
 * Child values take precedence over parent values.
 */
export function inheritEnvMap(child: EnvMap, parent: EnvMap): InheritanceResult {
  const resolved: EnvMap = new Map();
  const overrides: InheritanceResult['overrides'] = {};
  const inherited: Record<string, string> = {};
  const childOnly: Record<string, string> = {};

  // Add all parent keys first
  for (const [key, parentValue] of parent) {
    if (child.has(key)) {
      const childValue = child.get(key)!;
      resolved.set(key, childValue);
      if (childValue !== parentValue) {
        overrides[key] = { childValue, parentValue };
      }
    } else {
      resolved.set(key, parentValue);
      inherited[key] = parentValue;
    }
  }

  // Add child-only keys
  for (const [key, value] of child) {
    if (!parent.has(key)) {
      resolved.set(key, value);
      childOnly[key] = value;
    }
  }

  return { resolved, overrides, inherited, childOnly };
}

/**
 * Applies a chain of inheritance rules, resolving each layer in order.
 * Earlier entries in the chain are treated as more "base" (lower priority).
 */
export function applyInheritanceChain(
  maps: Map<string, EnvMap>,
  chain: InheritanceRule[]
): Map<string, InheritanceResult> {
  const results = new Map<string, InheritanceResult>();

  for (const rule of chain) {
    const child = maps.get(rule.child);
    const parent = maps.get(rule.parent);

    if (!child || !parent) {
      throw new Error(
        `Inheritance rule references unknown file: child=${rule.child}, parent=${rule.parent}`
      );
    }

    results.set(rule.child, inheritEnvMap(child, parent));
  }

  return results;
}
