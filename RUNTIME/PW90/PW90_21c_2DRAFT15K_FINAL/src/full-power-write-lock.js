const fail = (code, path, detail = null) => detail == null ? { code, path } : { code, path, detail };

export const FULL_POWER_WRITE_LOCK_ID = "PW90_FULL_POWER_NO_THIN_SUCCESS_LOCK";
export const EPISODE_15K_FULL_USE_LOCK_ID = "PW90_EPISODE_15K_FULL_USE_BETA_LOCK";
export const DEFAULT_EPISODE_SCALE_STANDARD = "15K";

export const REQUIRED_EPISODE_15K_PREWRITE_FLAGS = Object.freeze([
  "episodeRecognizedAs15k",
  "storyCardConditionsAllUsedForOneEpisode",
  "ds90PackTreatedAs15kFullBurnMaterial",
  "externalAverageQualityComparisonDenied",
  "recursiveConditionSelfPropagationPlanned",
  "under15kNotAcceptedWithoutFullBurnProof",
  "noReadableEpisodeCompletionShortcut"
]);

export const REQUIRED_FULL_POWER_PREWRITE_FLAGS = Object.freeze([
  "allTargetEpisodeFilesReread",
  "allConditionStatementsExtracted",
  "fixedLayerExpandedIntoBodyPlan",
  "heatLayerExpandedIntoBodyPlan",
  "thinRiskLedgerBuilt",
  "sceneConstructionPlanBuilt",
  "perSceneConcreteWorkLocked",
  "objectPositionHandTemperatureWidthReactionTracked",
  "noEndUserThinnessDetectionDependency",
  "noSafetyCaveatAsEffortLimit",
  "maxOutputNotTimeBoxed",
  "selfRewriteBeforeDeliveryOnThinness",
  ...REQUIRED_EPISODE_15K_PREWRITE_FLAGS
]);

export const REQUIRED_SCENE_CONSTRUCTION_FIELDS = Object.freeze([
  "sceneId",
  "purpose",
  "requiredConditionIds",
  "concreteWorkPoints",
  "conditionPropagationPoints",
  "thinRisk",
  "minimumDelivery"
]);

export const REQUIRED_EPISODE_15K_POSTTEXT_FLAGS = Object.freeze([
  "episodeWrittenFrom15kRecognition",
  "allStoryCardConditionsFullyUsed",
  "recursiveConditionPropagationUsed",
  "externalAverageNotUsedAsSuccessBasis",
  "under15kFullBurnProofProvidedOrNotUnder15k",
  "noFiveKCompletionShortcut",
  "packFuelBurnedUntilNoNaturalExpansion"
]);

export const REQUIRED_FULL_POWER_POSTTEXT_FLAGS = Object.freeze([
  "allPretextConditionsWrittenIntoBody",
  "everyScenePlanExecuted",
  "fixedLayerRecoveredWithoutCompression",
  "heatLayerRecoveredWithoutDiscount",
  "thinOutputAuditPassed",
  "noSummarySubstitution",
  "noSafeEstimateOutput",
  "noUserPointingDependency",
  "selfRewriteLoopCompletedUntilStable",
  "finalTextIsMaximumRecoverableForPack",
  ...REQUIRED_EPISODE_15K_POSTTEXT_FLAGS
]);

export const ALLOWED_UNDERLENGTH_REASONS = Object.freeze([
  "not_underlength",
  "under15k_full_burn_proven_no_remaining_material"
]);

function hasText(value) {
  return typeof value === "string" && value.trim() !== "";
}

function containsDisplayCompressionClaim(value) {
  if (!hasText(value)) return false;
  return /チャット表示|表示内|表示都合|UI都合|出力画面|メッセージ欄|自然圧縮|chat_display|display_limit|natural_compression_after_full_recovery/.test(value);
}

function requireNonEmptyArray(value, path, failures, code = "FULL_POWER_ARRAY_REQUIRED") {
  if (!Array.isArray(value) || value.length === 0) {
    failures.push(fail(code, path));
    return [];
  }
  return value;
}

function requireExact(value, expected, path, failures, code) {
  if (value !== expected) failures.push(fail(code, path, { expected, actual: value }));
}

export function validateFullPowerPreWriteGate({ gate, pickupConditionIds = [] } = {}) {
  const failures = [];
  if (gate == null || typeof gate !== "object" || Array.isArray(gate)) {
    return [fail("FULL_POWER_PREWRITE_GATE_REQUIRED", "fullPowerWriteGate")];
  }
  for (const flag of REQUIRED_FULL_POWER_PREWRITE_FLAGS) {
    if (gate.flags?.[flag] !== true) failures.push(fail("FULL_POWER_PREWRITE_FLAG_NOT_PASS", `fullPowerWriteGate.flags.${flag}`));
  }
  requireExact(gate.episodeScaleStandard, DEFAULT_EPISODE_SCALE_STANDARD, "fullPowerWriteGate.episodeScaleStandard", failures, "EPISODE_15K_STANDARD_NOT_DECLARED");
  requireExact(gate.storyCardConditionUse, "all_conditions_for_one_episode", "fullPowerWriteGate.storyCardConditionUse", failures, "EPISODE_15K_ALL_CONDITIONS_USE_NOT_DECLARED");
  requireExact(gate.ds90PackBurnExpectation, "15k_full_burn_material", "fullPowerWriteGate.ds90PackBurnExpectation", failures, "EPISODE_15K_DS90_BURN_EXPECTATION_MISSING");
  requireExact(gate.successBasis, "pack_full_burn_not_external_average", "fullPowerWriteGate.successBasis", failures, "EPISODE_15K_SUCCESS_BASIS_INVALID");
  requireExact(gate.under15kPolicy, "allowed_only_after_full_burn", "fullPowerWriteGate.under15kPolicy", failures, "EPISODE_15K_UNDER_POLICY_INVALID");

  const scenePlan = requireNonEmptyArray(gate.sceneConstructionPlan, "fullPowerWriteGate.sceneConstructionPlan", failures);
  const allConditionIds = new Set(Array.isArray(pickupConditionIds) ? pickupConditionIds : []);
  const sceneConditionIds = new Set();
  const sceneIds = new Set();
  for (const [index, scene] of scenePlan.entries()) {
    const base = `fullPowerWriteGate.sceneConstructionPlan[${index}]`;
    if (scene == null || typeof scene !== "object" || Array.isArray(scene)) {
      failures.push(fail("FULL_POWER_SCENE_OBJECT_REQUIRED", base));
      continue;
    }
    for (const field of REQUIRED_SCENE_CONSTRUCTION_FIELDS) {
      if (!hasText(scene[field]) && !Array.isArray(scene[field])) failures.push(fail("FULL_POWER_SCENE_FIELD_REQUIRED", `${base}.${field}`));
    }
    if (!hasText(scene.sceneId)) failures.push(fail("FULL_POWER_SCENE_ID_REQUIRED", `${base}.sceneId`));
    else if (sceneIds.has(scene.sceneId)) failures.push(fail("FULL_POWER_SCENE_ID_DUPLICATE", `${base}.sceneId`, scene.sceneId));
    else sceneIds.add(scene.sceneId);
    const ids = requireNonEmptyArray(scene.requiredConditionIds, `${base}.requiredConditionIds`, failures, "FULL_POWER_SCENE_CONDITION_IDS_REQUIRED");
    for (const id of ids) {
      if (!hasText(id)) failures.push(fail("FULL_POWER_SCENE_CONDITION_ID_REQUIRED", `${base}.requiredConditionIds`));
      else sceneConditionIds.add(id);
    }
    const points = requireNonEmptyArray(scene.concreteWorkPoints, `${base}.concreteWorkPoints`, failures, "FULL_POWER_SCENE_CONCRETE_POINTS_REQUIRED");
    if (points.length < 4) failures.push(fail("FULL_POWER_SCENE_CONCRETE_POINTS_TOO_FEW", `${base}.concreteWorkPoints`, { minimum: 4, actual: points.length }));
    for (const [pIndex, point] of points.entries()) {
      if (!hasText(point)) failures.push(fail("FULL_POWER_SCENE_CONCRETE_POINT_TEXT_REQUIRED", `${base}.concreteWorkPoints[${pIndex}]`));
    }
    const propagation = requireNonEmptyArray(scene.conditionPropagationPoints, `${base}.conditionPropagationPoints`, failures, "EPISODE_15K_SCENE_PROPAGATION_POINTS_REQUIRED");
    if (propagation.length < 3) failures.push(fail("EPISODE_15K_SCENE_PROPAGATION_POINTS_TOO_FEW", `${base}.conditionPropagationPoints`, { minimum: 3, actual: propagation.length }));
    for (const [pIndex, point] of propagation.entries()) {
      if (!hasText(point)) failures.push(fail("EPISODE_15K_SCENE_PROPAGATION_POINT_TEXT_REQUIRED", `${base}.conditionPropagationPoints[${pIndex}]`));
    }
    if (!hasText(scene.thinRisk)) failures.push(fail("FULL_POWER_SCENE_THIN_RISK_REQUIRED", `${base}.thinRisk`));
    if (!hasText(scene.minimumDelivery)) failures.push(fail("FULL_POWER_SCENE_MINIMUM_DELIVERY_REQUIRED", `${base}.minimumDelivery`));
  }
  for (const id of allConditionIds) {
    if (!sceneConditionIds.has(id)) failures.push(fail("FULL_POWER_CONDITION_NOT_MAPPED_TO_SCENE", "fullPowerWriteGate.sceneConstructionPlan", id));
  }
  if (gate.endUserDependencyAllowed !== false) failures.push(fail("FULL_POWER_END_USER_DEPENDENCY_NOT_DENIED", "fullPowerWriteGate.endUserDependencyAllowed"));
  if (gate.safetyCaveatAsEffortLimitAllowed !== false) failures.push(fail("FULL_POWER_SAFETY_CAVEAT_LIMIT_NOT_DENIED", "fullPowerWriteGate.safetyCaveatAsEffortLimitAllowed"));
  if (gate.successMayBeThin !== false) failures.push(fail("FULL_POWER_THIN_SUCCESS_NOT_DENIED", "fullPowerWriteGate.successMayBeThin"));
  return failures;
}

export function validateFullPowerPostTextGate({ preWriteResult, gate } = {}) {
  const failures = [];
  if (gate == null || typeof gate !== "object" || Array.isArray(gate)) {
    return [fail("FULL_POWER_POSTTEXT_GATE_REQUIRED", "checks.fullPowerWriteLock")];
  }
  for (const flag of REQUIRED_FULL_POWER_POSTTEXT_FLAGS) {
    if (gate.flags?.[flag] !== true) failures.push(fail("FULL_POWER_POSTTEXT_FLAG_NOT_PASS", `checks.fullPowerWriteLock.flags.${flag}`));
  }
  const plan = preWriteResult?.fullPowerWritePlan ?? [];
  const expectedSceneIds = plan.map((scene) => scene.sceneId).sort();
  const execution = requireNonEmptyArray(gate.sceneExecution, "checks.fullPowerWriteLock.sceneExecution", failures, "FULL_POWER_SCENE_EXECUTION_REQUIRED");
  const actualSceneIds = [];
  for (const [index, scene] of execution.entries()) {
    const base = `checks.fullPowerWriteLock.sceneExecution[${index}]`;
    if (scene == null || typeof scene !== "object" || Array.isArray(scene)) {
      failures.push(fail("FULL_POWER_SCENE_EXECUTION_OBJECT_REQUIRED", base));
      continue;
    }
    if (!hasText(scene.sceneId)) failures.push(fail("FULL_POWER_SCENE_EXECUTION_ID_REQUIRED", `${base}.sceneId`));
    else actualSceneIds.push(scene.sceneId);
    const recovered = requireNonEmptyArray(scene.recoveredConditionIds, `${base}.recoveredConditionIds`, failures, "FULL_POWER_SCENE_RECOVERED_CONDITION_IDS_REQUIRED");
    const points = requireNonEmptyArray(scene.concreteWorkRecovered, `${base}.concreteWorkRecovered`, failures, "FULL_POWER_SCENE_CONCRETE_RECOVERY_REQUIRED");
    if (points.length < 4) failures.push(fail("FULL_POWER_SCENE_CONCRETE_RECOVERY_TOO_FEW", `${base}.concreteWorkRecovered`, { minimum: 4, actual: points.length }));
    const propagation = requireNonEmptyArray(scene.conditionPropagationRecovered, `${base}.conditionPropagationRecovered`, failures, "EPISODE_15K_SCENE_PROPAGATION_RECOVERY_REQUIRED");
    if (propagation.length < 3) failures.push(fail("EPISODE_15K_SCENE_PROPAGATION_RECOVERY_TOO_FEW", `${base}.conditionPropagationRecovered`, { minimum: 3, actual: propagation.length }));
    if (!hasText(scene.bodyEvidence)) failures.push(fail("FULL_POWER_SCENE_BODY_EVIDENCE_REQUIRED", `${base}.bodyEvidence`));
    for (const id of recovered) if (!hasText(id)) failures.push(fail("FULL_POWER_SCENE_RECOVERED_CONDITION_ID_REQUIRED", `${base}.recoveredConditionIds`));
  }
  if (JSON.stringify([...new Set(actualSceneIds)].sort()) !== JSON.stringify(expectedSceneIds)) {
    failures.push(fail("FULL_POWER_SCENE_EXECUTION_MISMATCH", "checks.fullPowerWriteLock.sceneExecution", { expectedSceneIds, actualSceneIds: [...new Set(actualSceneIds)].sort() }));
  }
  const audit = gate.thinnessAudit;
  if (audit == null || typeof audit !== "object" || Array.isArray(audit)) {
    failures.push(fail("FULL_POWER_THINNESS_AUDIT_REQUIRED", "checks.fullPowerWriteLock.thinnessAudit"));
  } else {
    if (!ALLOWED_UNDERLENGTH_REASONS.includes(audit.underlengthReason)) failures.push(fail("FULL_POWER_UNDERLENGTH_REASON_INVALID", "checks.fullPowerWriteLock.thinnessAudit.underlengthReason", audit.underlengthReason));
    if (containsDisplayCompressionClaim(audit.underlengthReason) || containsDisplayCompressionClaim(audit.finalDensityDecision)) failures.push(fail("CHAT_DISPLAY_COMPRESSION_REASON_DENIED", "checks.fullPowerWriteLock.thinnessAudit"));
    for (const [field, expected] of Object.entries({
      omissionDetected: false,
      substitutionDetected: false,
      escapeDetected: false,
      genericFlatteningDetected: false,
      userWouldNeedToPointOutThinness: false,
      selfRewriteRequired: false
    })) {
      if (audit[field] !== expected) failures.push(fail("FULL_POWER_THINNESS_AUDIT_FAILED", `checks.fullPowerWriteLock.thinnessAudit.${field}`));
    }
    if (!hasText(audit.finalDensityDecision)) failures.push(fail("FULL_POWER_THINNESS_FINAL_DECISION_REQUIRED", "checks.fullPowerWriteLock.thinnessAudit.finalDensityDecision"));
  }
  const scaleAudit = gate.textScaleAudit;
  if (scaleAudit == null || typeof scaleAudit !== "object" || Array.isArray(scaleAudit)) {
    failures.push(fail("EPISODE_15K_TEXT_SCALE_AUDIT_REQUIRED", "checks.fullPowerWriteLock.textScaleAudit"));
  } else {
    requireExact(scaleAudit.episodeScaleStandard, DEFAULT_EPISODE_SCALE_STANDARD, "checks.fullPowerWriteLock.textScaleAudit.episodeScaleStandard", failures, "EPISODE_15K_STANDARD_NOT_OBSERVED");
    if (scaleAudit.ds90PackTreatedAs15kMaterial !== true) failures.push(fail("EPISODE_15K_DS90_MATERIAL_NOT_CONFIRMED", "checks.fullPowerWriteLock.textScaleAudit.ds90PackTreatedAs15kMaterial"));
    if (scaleAudit.externalAverageComparisonUsed !== false) failures.push(fail("EPISODE_15K_EXTERNAL_AVERAGE_USED", "checks.fullPowerWriteLock.textScaleAudit.externalAverageComparisonUsed"));
    if (scaleAudit.readableFiveKCompletionAccepted !== false) failures.push(fail("EPISODE_15K_FIVEK_COMPLETION_ACCEPTED", "checks.fullPowerWriteLock.textScaleAudit.readableFiveKCompletionAccepted"));
    if (scaleAudit.conditionsLeftAsChecklistOnly !== false) failures.push(fail("EPISODE_15K_CHECKLIST_ONLY_CONDITIONS_LEFT", "checks.fullPowerWriteLock.textScaleAudit.conditionsLeftAsChecklistOnly"));
    if (scaleAudit.unresolvedNaturalExpansionRemaining !== false) failures.push(fail("EPISODE_15K_NATURAL_EXPANSION_REMAINING", "checks.fullPowerWriteLock.textScaleAudit.unresolvedNaturalExpansionRemaining"));
    if (!Number.isFinite(scaleAudit.actualCharCount) || scaleAudit.actualCharCount < 0) failures.push(fail("EPISODE_15K_ACTUAL_CHAR_COUNT_REQUIRED", "checks.fullPowerWriteLock.textScaleAudit.actualCharCount"));
    if (!hasText(scaleAudit.fullBurnDecision)) failures.push(fail("EPISODE_15K_FULL_BURN_DECISION_REQUIRED", "checks.fullPowerWriteLock.textScaleAudit.fullBurnDecision"));
    if (containsDisplayCompressionClaim(scaleAudit.fullBurnDecision) || containsDisplayCompressionClaim(scaleAudit.under15kFullBurnProof)) failures.push(fail("CHAT_DISPLAY_COMPRESSION_REASON_DENIED", "checks.fullPowerWriteLock.textScaleAudit"));
    if (Number.isFinite(scaleAudit.actualCharCount) && scaleAudit.actualCharCount < 15000 && !hasText(scaleAudit.under15kFullBurnProof)) {
      failures.push(fail("EPISODE_15K_UNDER15K_FULL_BURN_PROOF_REQUIRED", "checks.fullPowerWriteLock.textScaleAudit.under15kFullBurnProof"));
    }
  }
  if (gate.quarantineIfThin !== true) failures.push(fail("FULL_POWER_QUARANTINE_IF_THIN_NOT_CONFIRMED", "checks.fullPowerWriteLock.quarantineIfThin"));
  return failures;
}
