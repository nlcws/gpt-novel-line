import { RuleKind } from "./types.js";

export const required = (id, field, message) =>
  Object.freeze({ id, kind: RuleKind.REQUIRED, field, message });

export const forbidden = (id, field, message) =>
  Object.freeze({ id, kind: RuleKind.FORBIDDEN, field, message });

function get(input, path) {
  return path.split(".").reduce((value, key) => value?.[key], input);
}

export function evaluateRules(rules, input) {
  const issues = [];
  for (const rule of rules) {
    const value = get(input, rule.field);
    if (rule.kind === RuleKind.REQUIRED && (value == null || value === false || value === "")) {
      issues.push({ ruleId: rule.id, decision: "STOP", field: rule.field, message: rule.message });
    }
    if (rule.kind === RuleKind.FORBIDDEN && value === true) {
      issues.push({ ruleId: rule.id, decision: "STOP", field: rule.field, message: rule.message });
    }
  }
  return issues;
}
