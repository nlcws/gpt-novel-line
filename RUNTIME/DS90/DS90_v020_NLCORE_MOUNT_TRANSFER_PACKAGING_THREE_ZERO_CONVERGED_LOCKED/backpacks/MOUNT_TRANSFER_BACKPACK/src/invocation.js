const stop = (code, path) => ({ code, path, severity: "STOP" });

export const INVOCATION_ORIGINS = Object.freeze(["DESIGNER_AUTO", "USER_EXPLICIT"]);

export function validateInvocation(invocation) {
  const issues = [];
  if (invocation?.mode !== "MOUNT_TRANSFER_BACKPACK") {
    issues.push(stop("TRANSFER_BACKPACK_NOT_ACTIVATED", "mountTransferInvocation.mode"));
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
    completionState: invocation?.origin === "DESIGNER_AUTO"
      ? "RETURN_TO_DESIGNER"
      : "STAY_IN_TRANSFER_BACKPACK"
  });
}
