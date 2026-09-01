const stop = (code, path) => ({ code, path, severity: "STOP" });

export const INVOCATION_ORIGINS = Object.freeze(["USER_EXPLICIT", "RUNTIME_AUTO"]);

export function validateInvocation(invocation) {
  const issues = [];
  if (invocation?.mode !== "MOUNT_TRANSFER_RUNTIME") {
    issues.push(stop("TRANSFER_RUNTIME_NOT_ACTIVATED", "mountTransferInvocation.mode"));
  }
  if (invocation?.operation !== "MOUNT_TRANSFER") {
    issues.push(stop("TRANSFER_OPERATION_REQUIRED", "mountTransferInvocation.operation"));
  }
  if (!INVOCATION_ORIGINS.includes(invocation?.origin)) {
    issues.push(stop("INVOCATION_ORIGIN_INVALID", "mountTransferInvocation.origin"));
  }
  if (typeof invocation?.reason !== "string" || invocation.reason.trim() === "") {
    issues.push(stop("INVOCATION_REASON_MISSING", "mountTransferInvocation.reason"));
  }
  return Object.freeze({
    decision: issues.length === 0 ? "PASS" : "STOP",
    issues: Object.freeze(issues),
    completionState: invocation?.origin === "RUNTIME_AUTO"
      ? "RETURN_TO_CALLER_RUNTIME"
      : "STAY_IN_TRANSFER_RUNTIME"
  });
}
