import { observeSecondDraftBody } from "./body-char-observer.js";
const fail = (code, path, detail = null) => detail == null ? { code, path } : { code, path, detail };

export const SECOND_DRAFT_BRANCH_LOCK_ID = "PW90_SECOND_DRAFT_FULL_BURN_EXPANSION_LOCK";
export const SECOND_DRAFT_TARGET_BODY_CHARS = 15000;
export const SECOND_DRAFT_BODY_HEAD_DIRECTIVE = `【二稿増補指示】
話パックを再実読し、添付本文を土台として、使用可能な条件を使い切るまで小説本文を増補する。15K級を強い目安とするが、字数のための水増しはしない。
整文・言い換え・要約だけで閉じず、未燃焼の場面段、反応差、物の役割変化、手元、位置、動線、戻し先を本文内へ増補する。明示HOLD・未成立維持・禁止線は先食いしない。`;

export const SECOND_DRAFT_REQUIRED_POSTTEXT_FIELDS = Object.freeze([
  "secondDraftBranch",
  "inputBasis",
  "bodyTextRole",
  "packReread",
  "bodyHeadDirective",
  "expandedScenes",
  "newlyRecoveredPackConditions",
  "stillThinRisk",
  "lengthPaddingDetected",
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
    targetLengthOrSelfBound: "二稿 / 話パック再実読 / 本文TXT増補 / 使用可能な種を使い切る / 15K級を目安 / 水増し禁止 / 整文だけで終わらない / 明示HOLDを守る",
    targetBodyChars: SECOND_DRAFT_TARGET_BODY_CHARS,
    hardMinBodyChars: null,
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
  if (gate.targetBodyChars !== SECOND_DRAFT_TARGET_BODY_CHARS) failures.push(fail("SECOND_DRAFT_15K_TARGET_REQUIRED", "secondDraftBranchGate.targetBodyChars"));
  if (gate.hardMinBodyChars !== null) failures.push(fail("SECOND_DRAFT_HARD_MIN_BODY_CHARS_DENIED", "secondDraftBranchGate.hardMinBodyChars"));
  if (gate.bodyHeadDirective !== SECOND_DRAFT_BODY_HEAD_DIRECTIVE) failures.push(fail("SECOND_DRAFT_BODY_HEAD_DIRECTIVE_REQUIRED", "secondDraftBranchGate.bodyHeadDirective"));
  if (gate.askUserForDraftMode !== false) failures.push(fail("SECOND_DRAFT_MODE_CONFIRMATION_DENIED", "secondDraftBranchGate.askUserForDraftMode"));
  if (gate.askUserForLength !== false) failures.push(fail("SECOND_DRAFT_LENGTH_NEGOTIATION_DENIED", "secondDraftBranchGate.askUserForLength"));
  if (gate.splitIntoPartsByDefault !== false) failures.push(fail("SECOND_DRAFT_AUTO_SPLIT_DENIED", "secondDraftBranchGate.splitIntoPartsByDefault"));
  if (typeof gate.targetLengthOrSelfBound !== "string" || !gate.targetLengthOrSelfBound.includes("15K級を目安") || !gate.targetLengthOrSelfBound.includes("水増し禁止")) {
    failures.push(fail("SECOND_DRAFT_TARGET_BOUND_MUST_DECLARE_FULL_BURN_NOT_HARD_FLOOR", "secondDraftBranchGate.targetLengthOrSelfBound"));
  }
  return failures;
}

export function validateSecondDraftTextHead(text) {
  if (typeof text !== "string" || !text.startsWith(SECOND_DRAFT_BODY_HEAD_DIRECTIVE)) {
    return [fail("SECOND_DRAFT_BODY_HEAD_DIRECTIVE_MISSING", "text")];
  }
  return [];
}

export function validateSecondDraftPostText({ gate, text } = {}) {
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
  const observation = observeSecondDraftBody(text, SECOND_DRAFT_BODY_HEAD_DIRECTIVE);
  for (const entry of observation.failures ?? []) failures.push(fail(entry.code, entry.path, entry.detail ?? null));
  if (Number.isFinite(observation.observedBodyCharCount) && observation.observedBodyCharCount < SECOND_DRAFT_TARGET_BODY_CHARS) {
    if (typeof gate.under15kFullBurnProof !== "string" || gate.under15kFullBurnProof.trim() === "") {
      failures.push(fail("SECOND_DRAFT_UNDER15K_FULL_BURN_PROOF_REQUIRED", "checks.secondDraftExpansion.under15kFullBurnProof", { observedBodyCharCount: observation.observedBodyCharCount, target: SECOND_DRAFT_TARGET_BODY_CHARS }));
    }
  }
  if (!Array.isArray(gate.expandedScenes) || gate.expandedScenes.length === 0) failures.push(fail("SECOND_DRAFT_EXPANDED_SCENES_REQUIRED", "checks.secondDraftExpansion.expandedScenes"));
  if (!Array.isArray(gate.newlyRecoveredPackConditions)) failures.push(fail("SECOND_DRAFT_RECOVERED_CONDITIONS_ARRAY_REQUIRED", "checks.secondDraftExpansion.newlyRecoveredPackConditions"));
  if (gate.stillThinRisk !== false) failures.push(fail("SECOND_DRAFT_STILL_THIN_RISK_DENIED", "checks.secondDraftExpansion.stillThinRisk"));
  if (gate.lengthPaddingDetected !== false) failures.push(fail("SECOND_DRAFT_LENGTH_PADDING_DENIED", "checks.secondDraftExpansion.lengthPaddingDetected"));
  if (gate.finalDecision !== "SUCCESS_CANDIDATE_AFTER_SECOND_DRAFT_EXPANSION") failures.push(fail("SECOND_DRAFT_FINAL_DECISION_INVALID", "checks.secondDraftExpansion.finalDecision"));
  return failures;
}
