const fail = (code, path, detail = null) => detail == null ? { code, path } : { code, path, detail };

export const EPISODE_TAIL_NEXT_OPENING_BRIDGE_LOCK_ID = "PW90_EPISODE_TAIL_NEXT_OPENING_BRIDGE_LOCK";

export const EPISODE_WRITE_UNIT = "CURRENT_EPISODE_FULLBURN_PLUS_NEXT_OPENING_BRIDGE";

export const PREVIOUS_TAIL_ANCHOR_FIELDS = Object.freeze([
  "lastLifeState",
  "lastRemainingObject",
  "lastPositionState",
  "remainingQuestionOrCard",
  "unresolvedFireSeed",
  "lifeLineForNextEpisode"
]);

export const NEXT_OPENING_BRIDGE_FIELDS = Object.freeze([
  "status",
  "nextEpisodeId",
  "firstLifeObject",
  "openingPosition",
  "continuityHook",
  "carryoverAllowed",
  "carryoverDenied",
  "revalidateAgainstNextEpisodePack"
]);

export const REQUIRED_EPISODE_BRIDGE_FLAGS = Object.freeze([
  "previousTailReadAfterClear",
  "previousTailUsedOnlyAsContinuityAnchor",
  "previousFullTextInertiaNotCarried",
  "previousStyleCompressionHabitDenied",
  "currentEpisodePackRereadStillRequired",
  "currentEpisodeFullburnCompletedBeforeNextOpening",
  "nextEpisodeOpeningBridgeGenerated",
  "nextOpeningMarkedHandoffOnlyNotCanon",
  "nextOpeningExcludedFromCurrentTextAndCoverage",
  "nextOpeningCannotReplaceNextEpisodePackReread",
  "nextOpeningRevalidatedAgainstNextEpisodePack",
  "continuityContradictionStopsBeforeText"
]);

function hasText(value) {
  return typeof value === "string" && value.trim() !== "";
}

function hasAllKeys(object, keys) {
  return object != null && typeof object === "object" && !Array.isArray(object) && keys.every((key) => hasText(object[key]) || Array.isArray(object[key]));
}

export function resolveEpisodeBridgeWriteUnit({
  trigger,
  targetEpisode,
  previousEpisodeAvailable = true,
  nextEpisodeKnown = true
} = {}) {
  const failures = [];
  if (!hasText(trigger)) failures.push(fail("EPISODE_BRIDGE_TRIGGER_REQUIRED", "episodeBridge.trigger"));
  if (!hasText(targetEpisode)) failures.push(fail("TARGET_EPISODE_REQUIRED", "episodeBridge.targetEpisode"));

  return {
    decision: failures.length === 0 ? "CURRENT_EPISODE_PLUS_NEXT_OPENING_BRIDGE_REQUIRED" : "STOP_BEFORE_TEXT",
    writeUnit: EPISODE_WRITE_UNIT,
    previousTailAnchorRequired: previousEpisodeAvailable === true,
    nextOpeningBridgeRequired: nextEpisodeKnown === true,
    previousFullTextInertiaAllowed: false,
    nextOpeningCanonAllowed: false,
    failures
  };
}

export function validateEpisodeBridgeGate({ gate } = {}) {
  const failures = [];
  if (gate == null || typeof gate !== "object" || Array.isArray(gate)) {
    return [fail("EPISODE_BRIDGE_GATE_REQUIRED", "episodeBridgeGate")];
  }

  for (const flag of REQUIRED_EPISODE_BRIDGE_FLAGS) {
    if (gate.flags?.[flag] !== true) failures.push(fail("EPISODE_BRIDGE_FLAG_NOT_PASS", `episodeBridgeGate.flags.${flag}`));
  }

  if (gate.writeUnit !== EPISODE_WRITE_UNIT) failures.push(fail("WRITE_UNIT_NOT_EPISODE_BRIDGE", "episodeBridgeGate.writeUnit", gate.writeUnit));
  if (gate.previousFullTextInertiaAllowed !== false) failures.push(fail("PREVIOUS_FULL_TEXT_INERTIA_ALLOWED", "episodeBridgeGate.previousFullTextInertiaAllowed"));
  if (gate.nextOpeningCanonAllowed !== false) failures.push(fail("NEXT_OPENING_CANON_ALLOWED", "episodeBridgeGate.nextOpeningCanonAllowed"));
  if (gate.nextOpeningCountsAsCurrentEpisodeText !== false) failures.push(fail("NEXT_OPENING_COUNTS_AS_CURRENT_EPISODE_TEXT", "episodeBridgeGate.nextOpeningCountsAsCurrentEpisodeText"));
  if (gate.nextOpeningReplacesNextEpisodePackReread !== false) failures.push(fail("NEXT_OPENING_REPLACES_NEXT_EPISODE_PACK_REREAD", "episodeBridgeGate.nextOpeningReplacesNextEpisodePackReread"));
  if (gate.currentEpisodeFullburnRequired !== true) failures.push(fail("CURRENT_EPISODE_FULLBURN_NOT_REQUIRED", "episodeBridgeGate.currentEpisodeFullburnRequired"));
  if (gate.previousTailAnchorRequired === true && !hasAllKeys(gate.previousTailAnchor, PREVIOUS_TAIL_ANCHOR_FIELDS)) {
    failures.push(fail("PREVIOUS_TAIL_ANCHOR_INCOMPLETE", "episodeBridgeGate.previousTailAnchor"));
  }
  if (gate.nextOpeningBridgeRequired === true && !hasAllKeys(gate.nextOpeningBridge, NEXT_OPENING_BRIDGE_FIELDS)) {
    failures.push(fail("NEXT_OPENING_BRIDGE_INCOMPLETE", "episodeBridgeGate.nextOpeningBridge"));
  }
  if (gate.nextOpeningBridge?.status !== "HANDOFF_ONLY_NOT_CANON") {
    failures.push(fail("NEXT_OPENING_STATUS_NOT_HANDOFF_ONLY", "episodeBridgeGate.nextOpeningBridge.status", gate.nextOpeningBridge?.status));
  }
  if (gate.nextOpeningBridge?.revalidateAgainstNextEpisodePack !== "REQUIRED") {
    failures.push(fail("NEXT_OPENING_REVALIDATION_NOT_REQUIRED", "episodeBridgeGate.nextOpeningBridge.revalidateAgainstNextEpisodePack", gate.nextOpeningBridge?.revalidateAgainstNextEpisodePack));
  }

  return failures;
}
