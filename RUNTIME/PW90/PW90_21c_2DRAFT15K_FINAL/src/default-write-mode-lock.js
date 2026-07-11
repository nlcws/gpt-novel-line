const fail = (code, path, detail = null) => detail == null ? { code, path } : { code, path, detail };

export const DEFAULT_WRITE_MODE_FULLBURN_LOCK_ID = "PW90_DEFAULT_WRITE_MODE_FULLBURN_LOCK";
export const DEFAULT_WRITE_MODE = "FULLBURN";

export const FULLBURN_WRITE_TRIGGERS = Object.freeze([
  "story_number_request",
  "next_episode",
  "continue_write",
  "write",
  "start_writing"
]);

export const LIGHTWEIGHT_EXPLICIT_MODES = Object.freeze([
  "trial",
  "short",
  "skeleton",
  "check_only",
  "excerpt",
  "summary"
]);

export const REQUIRED_DEFAULT_FULLBURN_FLAGS = Object.freeze([
  "defaultWriteModeIsFullburn",
  "fullburnDoesNotRequireEmphasisWord",
  "normalWriteShortcutDenied",
  "lightweightRequiresExplicitUserRequest",
  "forceWordImprovementMeansPreviousQuarantine",
  "fullPowerPrewriteGateAlwaysRequired",
  "noraCoreWriterAlwaysUsedForWrite",
  "pw90GuardrailAlwaysUsedForWrite"
]);

function hasText(value) {
  return typeof value === "string" && value.trim() !== "";
}

export function resolveDefaultWriteMode({
  trigger,
  explicitLightweightMode = null,
  userRequestedFullPowerWord = false
} = {}) {
  const failures = [];
  if (!hasText(trigger)) failures.push(fail("WRITE_TRIGGER_REQUIRED", "defaultWriteMode.trigger"));
  if (explicitLightweightMode != null && !LIGHTWEIGHT_EXPLICIT_MODES.includes(explicitLightweightMode)) {
    failures.push(fail("LIGHTWEIGHT_MODE_INVALID", "defaultWriteMode.explicitLightweightMode", explicitLightweightMode));
  }
  if (explicitLightweightMode != null) {
    return {
      decision: failures.length === 0 ? "LIGHTWEIGHT_WRITE_ALLOWED_BY_EXPLICIT_USER_REQUEST" : "STOP_BEFORE_TEXT",
      writeMode: explicitLightweightMode,
      defaultWriteMode: DEFAULT_WRITE_MODE,
      userRequestedFullPowerWord,
      failures
    };
  }
  return {
    decision: failures.length === 0 ? "FULLBURN_WRITE_REQUIRED" : "STOP_BEFORE_TEXT",
    writeMode: DEFAULT_WRITE_MODE,
    defaultWriteMode: DEFAULT_WRITE_MODE,
    fullburnRequiresEmphasisWord: false,
    userRequestedFullPowerWord,
    priorNormalWriteShouldQuarantineIfImprovedByFullPowerWord: userRequestedFullPowerWord === true,
    failures
  };
}

export function validateDefaultFullburnWriteGate({ gate } = {}) {
  const failures = [];
  if (gate == null || typeof gate !== "object" || Array.isArray(gate)) {
    return [fail("DEFAULT_FULLBURN_GATE_REQUIRED", "defaultFullburnWriteGate")];
  }
  for (const flag of REQUIRED_DEFAULT_FULLBURN_FLAGS) {
    if (gate.flags?.[flag] !== true) failures.push(fail("DEFAULT_FULLBURN_FLAG_NOT_PASS", `defaultFullburnWriteGate.flags.${flag}`));
  }
  if (gate.defaultWriteMode !== DEFAULT_WRITE_MODE) failures.push(fail("DEFAULT_WRITE_MODE_NOT_FULLBURN", "defaultFullburnWriteGate.defaultWriteMode", gate.defaultWriteMode));
  if (gate.fullburnRequiresEmphasisWord !== false) failures.push(fail("FULLBURN_REQUIRES_EMPHASIS_WORD", "defaultFullburnWriteGate.fullburnRequiresEmphasisWord"));
  if (gate.normalWriteAllowed !== false) failures.push(fail("NORMAL_WRITE_SHORTCUT_ALLOWED", "defaultFullburnWriteGate.normalWriteAllowed"));
  if (gate.lightweightWithoutExplicitUserRequestAllowed !== false) failures.push(fail("LIGHTWEIGHT_WITHOUT_EXPLICIT_USER_REQUEST_ALLOWED", "defaultFullburnWriteGate.lightweightWithoutExplicitUserRequestAllowed"));
  if (gate.successAtReadableCompletionAllowed !== false) failures.push(fail("READABLE_COMPLETION_SUCCESS_ALLOWED", "defaultFullburnWriteGate.successAtReadableCompletionAllowed"));
  return failures;
}
