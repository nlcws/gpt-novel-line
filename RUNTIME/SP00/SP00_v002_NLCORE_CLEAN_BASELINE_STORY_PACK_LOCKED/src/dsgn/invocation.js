export const InvocationOrigin = Object.freeze({
  RUNTIME_AUTO: "RUNTIME_AUTO",
  USER_EXPLICIT: "USER_EXPLICIT"
});

export const AUTO_TRIGGER_REASONS = Object.freeze([
  "CREATE_EPISODE_BUNDLE",
  "REBUILD_EPISODE_BUNDLE",
  "GENERATE_READY_V2_LAYER",
  "BUILD_WRITER_PACKAGE",
  "REPAIR_READY_V2_LAYER_MISMATCH",
  "REPACKAGE_EXISTING_BUNDLE",
  "WRITER_PICKUP_FAILURE"
]);

export function resolveInvocation(dsgn = {}) {
  const origin = dsgn.invocationOrigin;
  const reason = dsgn.autoTriggerReason ?? null;
  const validOrigin = Object.values(InvocationOrigin).includes(origin);
  const validAutoReason = origin !== InvocationOrigin.RUNTIME_AUTO ||
    AUTO_TRIGGER_REASONS.includes(reason);
  return {
    origin,
    reason,
    valid: validOrigin && validAutoReason,
    returnToDesigner: origin === InvocationOrigin.RUNTIME_AUTO,
    completionState: origin === InvocationOrigin.RUNTIME_AUTO
      ? "RETURN_TO_CALLER"
      : "STAY_IN_STORY_PACK_CUTOUT_RUNTIME"
  };
}
