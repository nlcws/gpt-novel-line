const fail = (code, path, detail = null) => detail == null ? { code, path } : { code, path, detail };

export const CHAT_DISPLAY_COMPRESSION_DENIAL_LOCK_ID = "PW90_CHAT_DISPLAY_COMPRESSION_DENIAL_LOCK";

export const BANNED_CHAT_DISPLAY_COMPRESSION_REASONS = Object.freeze([
  "chat_display_natural_compression",
  "chat_display_limit",
  "chat_window_limit",
  "message_surface_limit",
  "ui_display_limit",
  "platform_display_limit",
  "natural_compression_after_full_recovery"
]);

export const REQUIRED_NO_CHAT_COMPRESSION_FLAGS = Object.freeze([
  "chatDisplayCompressionDenied",
  "uiSurfaceNotAcceptedAsLengthReason",
  "naturalCompressionSuccessReasonDenied",
  "underlengthRequiresMaterialFullBurnProof",
  "hardOutputLimitRequiresTruncationOrSplitStatus",
  "successCandidateDeniedWhenDisplayCompressionClaimed"
]);

export const ALLOWED_UNDER15K_REASON = "under15k_full_burn_proven_no_remaining_material";
export const HARD_LIMIT_CONTINUATION_STATUSES = Object.freeze([
  "OUTPUT_TRUNCATED_CONTINUE_REQUIRED",
  "SPLIT_DELIVERY_REQUIRED",
  "CONTINUE_FROM_CUTOFF_REQUIRED"
]);

function hasText(value) {
  return typeof value === "string" && value.trim() !== "";
}

function normalized(value) {
  return hasText(value) ? value.trim() : "";
}

function containsBannedDisplayClaim(value) {
  const text = normalized(value);
  if (!text) return false;
  if (BANNED_CHAT_DISPLAY_COMPRESSION_REASONS.includes(text)) return true;
  return /チャット表示|表示内|表示都合|UI都合|出力画面|メッセージ欄|自然圧縮/.test(text);
}

export function evaluateNoChatDisplayCompressionStatus({
  actualCharCount = null,
  targetCharCount = 15000,
  underlengthReason = null,
  finalStatus = null,
  materialFullBurnProof = false,
  platformHardLimitHit = false,
  warnText = null,
  fullBurnDecision = null
} = {}) {
  const failures = [];
  for (const [path, value] of Object.entries({ underlengthReason, warnText, fullBurnDecision })) {
    if (containsBannedDisplayClaim(value)) failures.push(fail("CHAT_DISPLAY_COMPRESSION_REASON_DENIED", path, value));
  }
  const underTarget = Number.isFinite(actualCharCount) && actualCharCount < targetCharCount;
  if (platformHardLimitHit === true && !HARD_LIMIT_CONTINUATION_STATUSES.includes(finalStatus)) {
    failures.push(fail("HARD_OUTPUT_LIMIT_REQUIRES_CONTINUATION_STATUS", "finalStatus", finalStatus));
  }
  if (underTarget && underlengthReason === ALLOWED_UNDER15K_REASON && materialFullBurnProof !== true) {
    failures.push(fail("UNDER15K_MATERIAL_FULL_BURN_PROOF_REQUIRED", "materialFullBurnProof"));
  }
  if (underTarget && underlengthReason !== "not_underlength" && underlengthReason !== ALLOWED_UNDER15K_REASON) {
    failures.push(fail("UNDER15K_REASON_MUST_BE_MATERIAL_PROOF", "underlengthReason", underlengthReason));
  }
  if (finalStatus === "SUCCESS" && failures.length > 0) {
    failures.push(fail("SUCCESS_DENIED_WITH_CHAT_DISPLAY_COMPRESSION_FAILURE", "finalStatus"));
  }
  return {
    decision: failures.length === 0 ? "NO_CHAT_DISPLAY_COMPRESSION_PASS" : "FAILED_TEXT_QUARANTINE",
    failures
  };
}

export function validateNoChatDisplayCompressionGate({ gate } = {}) {
  const failures = [];
  if (gate == null || typeof gate !== "object" || Array.isArray(gate)) {
    return [fail("NO_CHAT_DISPLAY_COMPRESSION_GATE_REQUIRED", "noChatDisplayCompressionGate")];
  }
  for (const flag of REQUIRED_NO_CHAT_COMPRESSION_FLAGS) {
    if (gate.flags?.[flag] !== true) failures.push(fail("NO_CHAT_DISPLAY_COMPRESSION_FLAG_NOT_PASS", `noChatDisplayCompressionGate.flags.${flag}`));
  }
  if (gate.chatDisplayCompressionClaimAllowed !== false) {
    failures.push(fail("CHAT_DISPLAY_COMPRESSION_CLAIM_NOT_DENIED", "noChatDisplayCompressionGate.chatDisplayCompressionClaimAllowed"));
  }
  if (gate.naturalCompressionAsSuccessReasonAllowed !== false) {
    failures.push(fail("NATURAL_COMPRESSION_SUCCESS_REASON_NOT_DENIED", "noChatDisplayCompressionGate.naturalCompressionAsSuccessReasonAllowed"));
  }
  if (gate.platformHardLimitHandling !== "TRUNCATE_OR_SPLIT_NOT_SUCCESS") {
    failures.push(fail("PLATFORM_HARD_LIMIT_HANDLING_INVALID", "noChatDisplayCompressionGate.platformHardLimitHandling", gate.platformHardLimitHandling));
  }
  return failures;
}
