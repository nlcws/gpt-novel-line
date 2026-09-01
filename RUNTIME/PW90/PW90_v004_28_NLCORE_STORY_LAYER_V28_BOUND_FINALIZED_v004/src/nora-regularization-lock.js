const fail = (code, path, detail = null) => detail == null ? { code, path } : { code, path, detail };

export const NORA_CORE_REGULARIZATION_LOCK_ID = "PW90_NORA_CORE_REGULARIZED_GUARDRAIL_LOCK";
export const AUTO_MOUNT_BOOT_HARD_LOCK_ID = "PW90_AUTO_MOUNT_BOOT_HARD_LOCK";
export const FULL_DELIVERY_BODY_FIRST_LOCK_ID = "PW90_FULL_DELIVERY_AND_BODY_FIRST_LOCK";

export const NORA_ADDITION_CLASSES = Object.freeze([
  "BODY_LOCAL",
  "RETURN_CANDIDATE",
  "FIXED_CANDIDATE",
  "WARN",
  "DISCARD"
]);

export const REQUIRED_NORA_PREWRITE_FLAGS = Object.freeze([
  "noraCoreAsBodyEngine",
  "pw90GuardrailAsSuccessJudge",
  "bodyLocalAdditionAllowedWhenNonContradictory",
  "localConcreteNotPromotedToCanon",
  "chatVoiceNotLeakedIntoBody",
  "layerTermsNotLeakedIntoBody",
  "generalizationEscapeDenied",
  "bodyFirstLogSecond",
  "readableCompletionNotStopPoint"
]);

export const REQUIRED_NORA_POSTTEXT_FLAGS = Object.freeze([
  "noraHeatDeliveredWithoutCooling",
  "bodyLocalAdditionsClassified",
  "noUnclassifiedNoraResidue",
  "noCanonPromotionFromTrialAdditions",
  "noNewSettingReplacedRequiredCondition",
  "bodyFirstLogSecondObserved",
  "noGeneralizedMoralSubstitution",
  "localConcreteStrengthenedPackCore"
]);

function hasText(value) {
  return typeof value === "string" && value.trim() !== "";
}

function requireNonEmptyArray(value, path, failures, code) {
  if (!Array.isArray(value) || value.length === 0) {
    failures.push(fail(code, path));
    return [];
  }
  return value;
}

export function validateNoraCorePreWriteGate({ gate } = {}) {
  const failures = [];
  if (gate == null || typeof gate !== "object" || Array.isArray(gate)) {
    return [fail("NORA_CORE_PREWRITE_GATE_REQUIRED", "noraCoreGuardrailGate")];
  }
  for (const flag of REQUIRED_NORA_PREWRITE_FLAGS) {
    if (gate.flags?.[flag] !== true) failures.push(fail("NORA_CORE_PREWRITE_FLAG_NOT_PASS", `noraCoreGuardrailGate.flags.${flag}`));
  }
  if (gate.bodyEngine !== "NORA_CORE_WRITER") failures.push(fail("NORA_CORE_BODY_ENGINE_NOT_DECLARED", "noraCoreGuardrailGate.bodyEngine", gate.bodyEngine));
  if (gate.successJudge !== "PW90_GUARDRAIL") failures.push(fail("PW90_GUARDRAIL_NOT_DECLARED", "noraCoreGuardrailGate.successJudge", gate.successJudge));
  if (gate.bodyLocalPolicy !== "allow_noncontradictory_local_concrete") failures.push(fail("NORA_BODY_LOCAL_POLICY_INVALID", "noraCoreGuardrailGate.bodyLocalPolicy", gate.bodyLocalPolicy));
  if (gate.autoPromotionAllowed !== false) failures.push(fail("NORA_AUTO_PROMOTION_NOT_DENIED", "noraCoreGuardrailGate.autoPromotionAllowed"));
  if (gate.writeBeforeBootAllowed !== false) failures.push(fail("AUTO_BOOT_WRITE_BEFORE_BOOT_NOT_DENIED", "noraCoreGuardrailGate.writeBeforeBootAllowed"));
  if (gate.bootReadyEqualsWriteReady !== false) failures.push(fail("BOOT_READY_WRITE_READY_COLLAPSED", "noraCoreGuardrailGate.bootReadyEqualsWriteReady"));
  return failures;
}

export function validateNoraAdditionClassification({ classifications } = {}) {
  const failures = [];
  const rows = requireNonEmptyArray(classifications, "noraAdditionClassification", failures, "NORA_ADDITION_CLASSIFICATION_REQUIRED");
  for (const [index, row] of rows.entries()) {
    const base = `noraAdditionClassification[${index}]`;
    if (row == null || typeof row !== "object" || Array.isArray(row)) {
      failures.push(fail("NORA_ADDITION_CLASSIFICATION_OBJECT_REQUIRED", base));
      continue;
    }
    if (!hasText(row.item)) failures.push(fail("NORA_ADDITION_ITEM_REQUIRED", `${base}.item`));
    if (!NORA_ADDITION_CLASSES.includes(row.class)) failures.push(fail("NORA_ADDITION_CLASS_INVALID", `${base}.class`, row.class));
    if (!hasText(row.reason)) failures.push(fail("NORA_ADDITION_REASON_REQUIRED", `${base}.reason`));
    if (row.class === "BODY_LOCAL") {
      if (row.contradictsPack !== false) failures.push(fail("BODY_LOCAL_CONTRADICTION_NOT_DENIED", `${base}.contradictsPack`));
      if (row.promotedToCanon !== false) failures.push(fail("BODY_LOCAL_PROMOTED_TO_CANON", `${base}.promotedToCanon`));
      if (row.createsFutureObligation !== false) failures.push(fail("BODY_LOCAL_FUTURE_OBLIGATION_NOT_DENIED", `${base}.createsFutureObligation`));
    }
  }
  return failures;
}

export function validateNoraCorePostTextGate({ gate } = {}) {
  const failures = [];
  if (gate == null || typeof gate !== "object" || Array.isArray(gate)) {
    return [fail("NORA_CORE_POSTTEXT_GATE_REQUIRED", "checks.noraCoreGuardrail")];
  }
  for (const flag of REQUIRED_NORA_POSTTEXT_FLAGS) {
    if (gate.flags?.[flag] !== true) failures.push(fail("NORA_CORE_POSTTEXT_FLAG_NOT_PASS", `checks.noraCoreGuardrail.flags.${flag}`));
  }
  failures.push(...validateNoraAdditionClassification({ classifications: gate.additionClassification }));
  if (gate.cooledByWarnings === true) failures.push(fail("NORA_WARN_COOLING_DENIED", "checks.noraCoreGuardrail.cooledByWarnings"));
  if (gate.generalizedMoralSubstitution === true) failures.push(fail("NORA_GENERALIZATION_ESCAPE_DETECTED", "checks.noraCoreGuardrail.generalizedMoralSubstitution"));
  if (gate.chatVoiceLeakedIntoBody === true) failures.push(fail("NORA_CHAT_VOICE_LEAKED_INTO_BODY", "checks.noraCoreGuardrail.chatVoiceLeakedIntoBody"));
  if (gate.layerTermsLeakedIntoBody === true) failures.push(fail("NORA_LAYER_TERMS_LEAKED_INTO_BODY", "checks.noraCoreGuardrail.layerTermsLeakedIntoBody"));
  return failures;
}
