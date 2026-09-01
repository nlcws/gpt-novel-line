import { CONSULT_ONLY_PHRASES, EXECUTION_DIRECTIVE_PHRASES, OPERATIONS } from "./catalog.js";

function includesAny(normalized, terms) {
  return terms.some((term) => normalized.includes(term.toLowerCase()));
}

function operationMatches(normalized) {
  return Object.entries(OPERATIONS).flatMap(([operation, spec]) =>
    spec.triggers
      .filter((trigger) => normalized.includes(trigger.toLowerCase()))
      .map((trigger) => ({ operation, spec, trigger, length: trigger.length }))
  );
}

export function route(command, explicitOperation) {
  if (explicitOperation != null) {
    const normalizedOperation = String(explicitOperation).trim().toUpperCase();
    const spec = OPERATIONS[normalizedOperation];
    if (spec == null) {
      return { kind: "STOP", code: "UNKNOWN_EXPLICIT_OPERATION" };
    }
    return { kind: "ROUTED", operation: normalizedOperation, spec, match: "EXPLICIT" };
  }
  if (typeof command !== "string" || command.trim() === "") {
    return { kind: "STOP", code: "COMMAND_REQUIRED" };
  }
  const normalized = command.trim().toLowerCase();
  const matches = operationMatches(normalized);
  if (matches.length === 0) return { kind: "STOP", code: "UNKNOWN_OPERATION" };

  const consultOnly = includesAny(normalized, CONSULT_ONLY_PHRASES);
  const hasExecutionDirective = includesAny(normalized, EXECUTION_DIRECTIVE_PHRASES);
  if (consultOnly && !hasExecutionDirective) {
    const candidates = [...new Set(matches.map((match) => match.operation))];
    return {
      kind: "STOP",
      code: "CONSULT_ONLY_CONTEXT",
      candidates
    };
  }

  const longestLength = Math.max(...matches.map((match) => match.length));
  const longest = matches.filter((match) => match.length === longestLength);
  const operations = [...new Set(longest.map((match) => match.operation))];
  if (operations.length > 1) {
    return {
      kind: "STOP",
      code: "AMBIGUOUS_OPERATION",
      candidates: operations
    };
  }
  const selected = longest[0];
  return {
    kind: "ROUTED",
    operation: selected.operation,
    spec: selected.spec,
    match: "LONGEST_TRIGGER",
    trigger: selected.trigger
  };
}
