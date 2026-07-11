const fail = (code, path, detail = null) => detail == null ? { code, path } : { code, path, detail };

export const SECOND_DRAFT_BRANCH_LOCK_ID = "PW90_SECOND_DRAFT_BRANCH_15K_EXPANSION_LOCK";
export const SECOND_DRAFT_MIN_BODY_CHARS = 15000;
export const SECOND_DRAFT_BODY_HEAD_DIRECTIVE = `【二稿増補指示】
話パックを再実読し、添付本文を土台として本文のみ15K字以上まで増やす。
整文・言い換え・要約だけで閉じず、未燃焼の場面段、反応差、物の役割変化、手元、位置、動線、戻し先を本文内へ増補する。`;

export const SECOND_DRAFT_REQUIRED_POSTTEXT_FIELDS = Object.freeze([
  "secondDraftBranch",
  "inputBasis",
  "bodyTextRole",
  "packReread",
  "bodyHeadDirective",
  "actualBodyCharCount",
  "expandedScenes",
  "newlyRecoveredPackConditions",
  "stillThinRisk",
  "finalDecision"
]);

function hasBodyTextInput(input = {}) {
  return input.hasBodyTxt === true ||
    input.hasPastedBodyText === true ||
    input.hasExistingDraftText === true ||
    input.hasFirstDraftText === true;
}

export function resolveSecondDraftBranch(input = {}) {
  if (input.hasWritableStoryPack !== true) {
    return { decision: "STOP", reason: "WRITABLE_STORY_PACK_REQUIRED" };
  }

  if (!hasBodyTextInput(input)) {
    return {
      decision: "KEEP_21B_WRITE_PATH",
      secondDraftBranch: "INACTIVE",
      inputBasis: "PACK_ONLY",
      firstDraftOverride: false,
      targetLengthOverride: null,
      bodyHeadDirective: null
    };
  }

  return {
    decision: "WRITE_SECOND_DRAFT",
    secondDraftBranch: "ACTIVE",
    inputBasis: "PACK_PLUS_BODY_TEXT",
    bodyTextRole: "EXISTING_DRAFT_TO_EXPAND",
    packRereadRequired: true,
    targetLengthOrSelfBound: "二稿 / 話パック再実読 / 本文TXT増補 / 本文のみ15K字以上まで増やす / 整文だけで終わらない / 固定層・熱量層を落とさない",
    minBodyChars: SECOND_DRAFT_MIN_BODY_CHARS,
    bodyHeadDirective: SECOND_DRAFT_BODY_HEAD_DIRECTIVE,
    askUserForDraftMode: false,
    askUserForLength: false,
    splitIntoPartsByDefault: false
  };
}

export function validateSecondDraftBranch({ gate } = {}) {
  const failures = [];
  if (gate == null || typeof gate !== "object" || Array.isArray(gate)) {
    return [fail("SECOND_DRAFT_BRANCH_GATE_REQUIRED", "secondDraftBranchGate")];
  }

  if (gate.secondDraftBranch === "INACTIVE") {
    if (gate.decision !== "KEEP_21B_WRITE_PATH") failures.push(fail("PACK_ONLY_MUST_KEEP_21B_WRITE_PATH", "secondDraftBranchGate.decision"));
    if (gate.inputBasis !== "PACK_ONLY") failures.push(fail("PACK_ONLY_INPUT_BASIS_INVALID", "secondDraftBranchGate.inputBasis"));
    if (gate.firstDraftOverride !== false) failures.push(fail("PACK_ONLY_FIRST_DRAFT_OVERRIDE_DENIED", "secondDraftBranchGate.firstDraftOverride"));
    if (gate.targetLengthOverride !== null) failures.push(fail("PACK_ONLY_TARGET_LENGTH_OVERRIDE_DENIED", "secondDraftBranchGate.targetLengthOverride"));
    if (gate.bodyHeadDirective !== null) failures.push(fail("PACK_ONLY_BODY_HEAD_DIRECTIVE_DENIED", "secondDraftBranchGate.bodyHeadDirective"));
    return failures;
  }

  if (gate.secondDraftBranch !== "ACTIVE") failures.push(fail("SECOND_DRAFT_BRANCH_MUST_BE_ACTIVE", "secondDraftBranchGate.secondDraftBranch"));
  if (gate.decision !== "WRITE_SECOND_DRAFT") failures.push(fail("SECOND_DRAFT_DECISION_INVALID", "secondDraftBranchGate.decision"));
  if (gate.inputBasis !== "PACK_PLUS_BODY_TEXT") failures.push(fail("SECOND_DRAFT_INPUT_BASIS_INVALID", "secondDraftBranchGate.inputBasis"));
  if (gate.bodyTextRole !== "EXISTING_DRAFT_TO_EXPAND") failures.push(fail("SECOND_DRAFT_BODY_TEXT_ROLE_INVALID", "secondDraftBranchGate.bodyTextRole"));
  if (gate.packRereadRequired !== true) failures.push(fail("SECOND_DRAFT_PACK_REREAD_REQUIRED", "secondDraftBranchGate.packRereadRequired"));
  if (gate.minBodyChars !== SECOND_DRAFT_MIN_BODY_CHARS) failures.push(fail("SECOND_DRAFT_15K_MIN_REQUIRED", "secondDraftBranchGate.minBodyChars"));
  if (gate.bodyHeadDirective !== SECOND_DRAFT_BODY_HEAD_DIRECTIVE) failures.push(fail("SECOND_DRAFT_BODY_HEAD_DIRECTIVE_REQUIRED", "secondDraftBranchGate.bodyHeadDirective"));
  if (gate.askUserForDraftMode !== false) failures.push(fail("SECOND_DRAFT_MODE_CONFIRMATION_DENIED", "secondDraftBranchGate.askUserForDraftMode"));
  if (gate.askUserForLength !== false) failures.push(fail("SECOND_DRAFT_LENGTH_NEGOTIATION_DENIED", "secondDraftBranchGate.askUserForLength"));
  if (gate.splitIntoPartsByDefault !== false) failures.push(fail("SECOND_DRAFT_AUTO_SPLIT_DENIED", "secondDraftBranchGate.splitIntoPartsByDefault"));
  if (typeof gate.targetLengthOrSelfBound !== "string" || !gate.targetLengthOrSelfBound.includes("15K字以上まで増やす")) {
    failures.push(fail("SECOND_DRAFT_TARGET_BOUND_MUST_DECLARE_15K_EXPANSION", "secondDraftBranchGate.targetLengthOrSelfBound"));
  }
  return failures;
}

export function validateSecondDraftTextHead(text) {
  if (typeof text !== "string" || !text.startsWith(SECOND_DRAFT_BODY_HEAD_DIRECTIVE)) {
    return [fail("SECOND_DRAFT_BODY_HEAD_DIRECTIVE_MISSING", "text")];
  }
  return [];
}

export function validateSecondDraftPostText({ gate } = {}) {
  const failures = [];
  if (gate == null || typeof gate !== "object" || Array.isArray(gate)) {
    return [fail("SECOND_DRAFT_POSTTEXT_GATE_REQUIRED", "checks.secondDraftExpansion")];
  }
  for (const field of SECOND_DRAFT_REQUIRED_POSTTEXT_FIELDS) {
    if (!(field in gate)) failures.push(fail("SECOND_DRAFT_POSTTEXT_FIELD_REQUIRED", `checks.secondDraftExpansion.${field}`));
  }
  if (gate.secondDraftBranch !== "ACTIVE") failures.push(fail("SECOND_DRAFT_POSTTEXT_BRANCH_INVALID", "checks.secondDraftExpansion.secondDraftBranch"));
  if (gate.inputBasis !== "PACK_PLUS_BODY_TEXT") failures.push(fail("SECOND_DRAFT_POSTTEXT_INPUT_BASIS_INVALID", "checks.secondDraftExpansion.inputBasis"));
  if (gate.bodyTextRole !== "EXISTING_DRAFT_TO_EXPAND") failures.push(fail("SECOND_DRAFT_POSTTEXT_BODY_ROLE_INVALID", "checks.secondDraftExpansion.bodyTextRole"));
  if (gate.packReread !== "PASS") failures.push(fail("SECOND_DRAFT_POSTTEXT_PACK_REREAD_REQUIRED", "checks.secondDraftExpansion.packReread"));
  if (gate.bodyHeadDirective !== "PASS") failures.push(fail("SECOND_DRAFT_POSTTEXT_BODY_HEAD_REQUIRED", "checks.secondDraftExpansion.bodyHeadDirective"));
  if (!Number.isFinite(gate.actualBodyCharCount) || gate.actualBodyCharCount < SECOND_DRAFT_MIN_BODY_CHARS) {
    failures.push(fail("SECOND_DRAFT_BODY_UNDER_15K", "checks.secondDraftExpansion.actualBodyCharCount", gate.actualBodyCharCount));
  }
  if (!Array.isArray(gate.expandedScenes) || gate.expandedScenes.length === 0) failures.push(fail("SECOND_DRAFT_EXPANDED_SCENES_REQUIRED", "checks.secondDraftExpansion.expandedScenes"));
  if (!Array.isArray(gate.newlyRecoveredPackConditions)) failures.push(fail("SECOND_DRAFT_RECOVERED_CONDITIONS_ARRAY_REQUIRED", "checks.secondDraftExpansion.newlyRecoveredPackConditions"));
  if (gate.stillThinRisk !== false) failures.push(fail("SECOND_DRAFT_STILL_THIN_RISK_DENIED", "checks.secondDraftExpansion.stillThinRisk"));
  if (gate.finalDecision !== "SUCCESS_CANDIDATE_AFTER_SECOND_DRAFT_EXPANSION") failures.push(fail("SECOND_DRAFT_FINAL_DECISION_INVALID", "checks.secondDraftExpansion.finalDecision"));
  return failures;
}
