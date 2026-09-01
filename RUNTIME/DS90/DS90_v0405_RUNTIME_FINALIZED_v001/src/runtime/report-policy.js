export function buildRuntimeReport({ terminal, decision, state, operation, hostAction, operationClass, persistenceAuthority, roleContinuity }) {
  if (!terminal) {
    return {
      current: state,
      unreflected: "HOST_ACTION_PENDING",
      next: hostAction?.actionType ?? "HOST_ACTION_REQUIRED",
      operation,
      operationClass,
      persistenceAuthority,
      roleContinuity,
      persistenceMeaning: "WRITE_PERSISTENCE_ONLY",
      notice: "REPORT_POLICY does not alter runtime decision or specialist/PKDB authority"
    };
  }
  const next = decision === "PASS" || decision === "USER_OVERRIDDEN"
    ? "requested operation output is available under its declared completion boundary"
    : "resolve the reported STOP conditions";
  return {
    current: state,
    unreflected: decision === "PASS" || decision === "USER_OVERRIDDEN" ? "なし" : decision,
    next,
    operation,
    operationClass,
    persistenceAuthority,
    roleContinuity,
    persistenceMeaning: "WRITE_PERSISTENCE_ONLY",
    notice: "END_LOG is a report only; it is not canon, read proof, commit proof, or terminal authority"
  };
}
