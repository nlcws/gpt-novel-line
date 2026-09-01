export const THREE_ZERO_COUNTERS = Object.freeze([
  "error",
  "intent_mismatch",
  "route_mismatch",
  "shelf_mismatch",
  "reference_missing",
  "output_shape_mismatch",
  "user_instruction_violation",
  "unresolved_stop",
  "stale_active_path",
  "duplicate_active_read"
]);

const issue = (code, path, message) => ({ code, path, message, severity: "STOP" });

export function validateThreeZeroDryRuns(runs, path) {
  if (!Array.isArray(runs) || runs.length < 3) {
    return [issue(
      "THREE_ZERO_EVIDENCE_MISSING",
      path,
      "全カウンタ0の連続dry-run実体が3回分必要です"
    )];
  }

  const issues = [];
  const lastThree = runs.slice(-3);
  lastThree.forEach((run, index) => {
    const runPath = `${path}[${runs.length - 3 + index}]`;
    if (run == null || typeof run !== "object" || Array.isArray(run)) {
      issues.push(issue("THREE_ZERO_RUN_INVALID", runPath, "dry-run記録はobjectである必要があります"));
      return;
    }
    for (const counter of THREE_ZERO_COUNTERS) {
      if (typeof run[counter] !== "number") {
        issues.push(issue(
          "THREE_ZERO_COUNTER_MISSING",
          `${runPath}.${counter}`,
          `${counter}の数値実測値が必要です`
        ));
      } else if (run[counter] !== 0) {
        issues.push(issue(
          "THREE_ZERO_COUNTER_NONZERO",
          `${runPath}.${counter}`,
          `${counter}が0ではないため連続ゼロは未成立です`
        ));
      }
    }
  });
  return issues;
}
