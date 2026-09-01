const fail = (code, path, detail = null) => detail == null ? { code, path } : { code, path, detail };

export const NEW_EPISODE_FULL_BOOT_ROLLBACK_LOCK_ID = "PW90_NEW_EPISODE_FULL_BOOT_ROLLBACK_LOCK";

export const LEGACY_WRITER_INSTANCE_LOAD_LIMIT_POLICY = Object.freeze({
  legacyOnly: true,
  currentBasis: false,
  deprecatedPhrases: Object.freeze([
    "8-15 episode recommended instance span",
    "avoid over 20 episodes in one writer instance",
    "20 episode load degradation as primary cause"
  ]),
  currentDiagnosis: "NEW_EPISODE_BOOT_GATE_MISFIRE"
});

export const NEW_EPISODE_BOOT_TRIGGERS = Object.freeze([
  "story_number_request",
  "next_episode",
  "continue_write",
  "write",
  "start_writing"
]);

export const REQUIRED_TARGET_EPISODE_READ_FUEL = Object.freeze([
  "01_ready",
  "02_v2",
  "03_layer",
  "05_frozen",
  "06_execution_queue"
]);

export const REQUIRED_NEW_EPISODE_FULL_BOOT_FLAGS = Object.freeze([
  "previousTextDiscarded",
  "previousSuccessFaceDiscarded",
  "previousStyleInertiaDiscarded",
  "previousCompressionHabitDiscarded",
  "targetEpisodeFolderReread",
  "fixedConditionTableRegenerated",
  "pickupLedgerRegenerated",
  "sceneConstructionPlanRegenerated",
  "defaultWriteModeFullburnApplied",
  "noraCoreWriterUsed",
  "pw90GuardrailUsed",
  "thinCompletionDenied",
  "coverageAuditRequired",
  "thinnessAuditRequired",
  "forbiddenAuditRequired",
  "fullConvergenceSweepRequired",
  "minimalContinuityOnlyReinjected"
]);

function hasText(value) {
  return typeof value === "string" && value.trim() !== "";
}

export function resolveNewEpisodeBootMode({
  trigger,
  targetEpisodeChanged = true,
  explicitSameEpisodeContinuation = false
} = {}) {
  const failures = [];
  if (!hasText(trigger)) failures.push(fail("NEW_EPISODE_TRIGGER_REQUIRED", "newEpisodeFullBoot.trigger"));
  if (hasText(trigger) && !NEW_EPISODE_BOOT_TRIGGERS.includes(trigger)) {
    failures.push(fail("NEW_EPISODE_TRIGGER_UNKNOWN", "newEpisodeFullBoot.trigger", trigger));
  }

  if (explicitSameEpisodeContinuation === true && targetEpisodeChanged === false) {
    return {
      decision: failures.length === 0 ? "SAME_EPISODE_CONTINUATION_WITH_RESTITCH_GATE" : "STOP_BEFORE_TEXT",
      bootMode: "SAME_EPISODE_RESTITCH_FULLBURN",
      continueIsNotSuccessCarryover: true,
      failures
    };
  }

  return {
    decision: failures.length === 0 ? "NEW_EPISODE_FULL_BOOT_REQUIRED" : "STOP_BEFORE_TEXT",
    bootMode: "NEW_EPISODE_FULL_BOOT",
    continueTreatedAsNewEpisodeBoot: trigger === "continue_write",
    priorEpisodeInertiaAllowed: false,
    failures
  };
}

export function validateNewEpisodeFullBootGate({ gate } = {}) {
  const failures = [];
  if (gate == null || typeof gate !== "object" || Array.isArray(gate)) {
    return [fail("NEW_EPISODE_FULL_BOOT_GATE_REQUIRED", "newEpisodeFullBootGate")];
  }

  for (const flag of REQUIRED_NEW_EPISODE_FULL_BOOT_FLAGS) {
    if (gate.flags?.[flag] !== true) failures.push(fail("NEW_EPISODE_FULL_BOOT_FLAG_NOT_PASS", `newEpisodeFullBootGate.flags.${flag}`));
  }

  if (gate.bootMode !== "NEW_EPISODE_FULL_BOOT") failures.push(fail("BOOT_MODE_NOT_NEW_EPISODE_FULL_BOOT", "newEpisodeFullBootGate.bootMode", gate.bootMode));
  if (gate.previousEpisodeInertiaAllowed !== false) failures.push(fail("PREVIOUS_EPISODE_INERTIA_ALLOWED", "newEpisodeFullBootGate.previousEpisodeInertiaAllowed"));
  if (gate.writerInstanceLoadLimitUsedAsCurrentBasis !== false) failures.push(fail("LEGACY_WRITER_INSTANCE_LOAD_LIMIT_USED_AS_CURRENT_BASIS", "newEpisodeFullBootGate.writerInstanceLoadLimitUsedAsCurrentBasis"));
  if (gate.continueAsCarryoverAllowed !== false) failures.push(fail("CONTINUE_AS_CARRYOVER_ALLOWED", "newEpisodeFullBootGate.continueAsCarryoverAllowed"));
  if (gate.fullburnWriteRequired !== true) failures.push(fail("FULLBURN_WRITE_NOT_REQUIRED", "newEpisodeFullBootGate.fullburnWriteRequired"));
  if (gate.newEpisodeBootGateMisfireQuarantinesText !== true) failures.push(fail("NEW_EPISODE_BOOT_GATE_MISFIRE_NOT_QUARANTINED", "newEpisodeFullBootGate.newEpisodeBootGateMisfireQuarantinesText"));

  return failures;
}
