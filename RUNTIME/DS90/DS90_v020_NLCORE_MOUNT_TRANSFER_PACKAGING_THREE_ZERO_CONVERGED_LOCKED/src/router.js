import { OPERATIONS } from "./catalog.js";

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
  const matches = Object.entries(OPERATIONS).flatMap(([operation, spec]) =>
    spec.triggers
      .filter((trigger) => normalized.includes(trigger.toLowerCase()))
      .map((trigger) => ({ operation, spec, trigger, length: trigger.length }))
  );
  if (matches.length === 0) return { kind: "STOP", code: "UNKNOWN_OPERATION" };
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
