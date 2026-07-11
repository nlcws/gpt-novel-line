import { evaluateHardBinding } from "./hard-binding-adapter.js";
import { validateWriterMaterialMap } from "./v2-material-gate.js";
import {
  REQUIRED_PRETEXT_PICKUP_CHECKS,
  REQUIRED_POSTTEXT_PICKUP_CHECKS,
  collectPreTextConditionIds,
  validatePreTextPickupLedger,
  validatePostTextPickupLedger,
  validateQuarantineReturnTicket,
  validateFullConvergenceSweep
} from "./pickup-ledger-gate.js";
import {
  PROJECTLOCKED_INPUT_MODE,
  PROJECTLOCKED_CONTRACT_ID,
  projectLockedShelvesForEpisode
} from "./projectlocked-pack-gate.js";
import {
  WRITABLE_STORY_PACK_INPUT_MODE,
  evaluateWritableStoryPackPreWrite
} from "./writable-story-pack-gate.js";
import {
  validateFullPowerPreWriteGate,
  validateFullPowerPostTextGate
} from "./full-power-write-lock.js";

export const WRITE_EXECUTION_ORDER = Object.freeze([
  "CORE",
  "FIXED_LAYER",
  "HEAT_LAYER",
  "SCENE_ORDER",
  "CONNECTION",
  "FORBIDDEN_LINES",
  "FREE_AREA"
]);

export const BASE_REQUIRED_OUTPUT = Object.freeze([
  "filename_line",
  "target_length_or_self_bound",
  "frozen_condition_table_short",
  "text",
  "本文後LOG"
]);

export const REQUIRED_PREWRITE_FLAGS = Object.freeze([
  "episodeFolderMapRead",
  "sourceReadStatusConfirmed",
  "targetStoryCardReread",
  "connectionMaterialReread",
  "fixedConditionTableFrozen",
  "heatConditionTableFrozen",
  "connectionTableFrozen",
  "forbiddenLinesFrozen",
  "freeAreaRead",
  "outputContractResolved",
  "selfBoundOrTargetPolicySet",
  "bodyAndNonBodySeparated",
  "folderTotalNotUsedAsLengthLimit",
  "writerDidNotClassifyMaterials",
  "currentCycleOnlyConfirmed",
  "noMemoryAsRead",
  "noFilenameAsRead",
  "noFilelistAsRead",
  "noSummaryAsRead",
  "noChatAsStorySource",
  "noDesignGapFilledByWriter",
  "frozenTableCurrentCycleOnly"
]);

export { REQUIRED_PRETEXT_PICKUP_CHECKS, REQUIRED_POSTTEXT_PICKUP_CHECKS };

export const REQUIRED_OUTPUT_CHECKS = Object.freeze([
  "requiredElementsRecovered",
  "fixedLayerRecovered",
  "heatLayerRecovered",
  "sceneOrderPreserved",
  "connectionProcessed",
  "forbiddenLineNotViolated",
  "noSummarySubstitution",
  "noCrossShelfContamination",
  "noUnprovidedConditionAdded",
  "noRevisionBladePrecompression",
  "noCommonFlowSubstitution",
  "noOmission",
  "noValueDiscount",
  "noMemoryCondition",
  "noPostFreezeMutation",
  "noMultipleStoryOutput"
]);

const fail = (code, path) => ({ code, path });
const hasValue = (value) => typeof value === "string" ? value.trim() !== "" : value != null;

function validateActivation(activation) {
  const failures = [];
  if (activation?.input_mode !== "V2_EPISODE_FOLDER") failures.push(fail("V2_INPUT_MODE_REQUIRED", "activation.input_mode"));
  if (!(activation?.activate_contracts ?? []).includes("V2_FOLDER_RESTORE_CONTRACT")) {
    failures.push(fail("V2_CONTRACT_NOT_ACTIVATED", "activation.activate_contracts"));
  }
  if (activation?.auto_detection !== "forbidden") failures.push(fail("AUTO_DETECTION_FORBIDDEN", "activation.auto_detection"));
  if (activation?.activation_source !== "DESIGN") failures.push(fail("ACTIVATION_SOURCE_INVALID", "activation.activation_source"));
  if (activation?.episode_unit !== "folder") failures.push(fail("EPISODE_UNIT_INVALID", "activation.episode_unit"));
  if (!activation?.episode_id || !activation?.activation_id) failures.push(fail("ACTIVATION_IDENTITY_MISSING", "activation"));
  if (activation?.degraded_mode !== false) failures.push(fail("DEGRADED_WRITE_FORBIDDEN", "activation.degraded_mode"));
  if (activation?.custom_pack_extension != null) failures.push(fail("CUSTOM_PACK_EXTENSION_REMOVED", "activation.custom_pack_extension"));
  const validity = activation?.activation_validity;
  if (validity?.user_or_design_declared !== true ||
      validity?.filename_inference_allowed !== false ||
      validity?.folder_size_inference_allowed !== false ||
      validity?.style_inference_allowed !== false) {
    failures.push(fail("ACTIVATION_VALIDITY_INVALID", "activation.activation_validity"));
  }
  return failures;
}


function validateProjectLockedActivation(activation) {
  const failures = [];
  if (activation?.input_mode !== PROJECTLOCKED_INPUT_MODE) failures.push(fail("PROJECTLOCKED_INPUT_MODE_REQUIRED", "activation.input_mode"));
  if (!(activation?.activate_contracts ?? []).includes("V2_FOLDER_RESTORE_CONTRACT")) failures.push(fail("V2_CONTRACT_NOT_ACTIVATED", "activation.activate_contracts"));
  if (!(activation?.activate_contracts ?? []).includes(PROJECTLOCKED_CONTRACT_ID)) failures.push(fail("PROJECTLOCKED_GATE_NOT_ACTIVATED", "activation.activate_contracts"));
  if (activation?.auto_detection !== "forbidden") failures.push(fail("AUTO_DETECTION_FORBIDDEN", "activation.auto_detection"));
  if (activation?.activation_source !== "DESIGN") failures.push(fail("ACTIVATION_SOURCE_INVALID", "activation.activation_source"));
  if (activation?.episode_unit !== "folder") failures.push(fail("EPISODE_UNIT_INVALID", "activation.episode_unit"));
  if (!activation?.episode_id || !activation?.activation_id) failures.push(fail("ACTIVATION_IDENTITY_MISSING", "activation"));
  if (activation?.degraded_mode !== false) failures.push(fail("DEGRADED_WRITE_FORBIDDEN", "activation.degraded_mode"));
  if (activation?.custom_pack_extension != null) failures.push(fail("CUSTOM_PACK_EXTENSION_REMOVED", "activation.custom_pack_extension"));
  const validity = activation?.activation_validity;
  if (validity?.user_or_design_declared !== true ||
      validity?.filename_inference_allowed !== false ||
      validity?.folder_size_inference_allowed !== false ||
      validity?.style_inference_allowed !== false) {
    failures.push(fail("ACTIVATION_VALIDITY_INVALID", "activation.activation_validity"));
  }
  return failures;
}

export function evaluateProjectLockedPreWrite(input = {}) {
  const failures = validateProjectLockedActivation(input.activation);
  const hardBinding = evaluateHardBinding(input.hardBindingState);
  if (hardBinding.decision !== "ACTIVE_RUNTIME_READY") failures.push(...hardBinding.failures);
  const projectLocked = input.projectLockedResult;
  if (projectLocked?.inspectDecision !== "PROJECTLOCKED_PACK_INSPECT_OK") failures.push(fail("PROJECTLOCKED_PACK_INSPECT_NOT_OK", "projectLockedResult.inspectDecision"));
  if (projectLocked?.writeDecision !== "PROJECTLOCKED_PACK_WRITE_READY") failures.push(fail("PROJECTLOCKED_PACK_NOT_WRITE_READY", "projectLockedResult.writeDecision"));
  const shelves = projectLockedShelvesForEpisode(projectLocked, input.activation?.episode_id);
  if (shelves == null) failures.push(fail("PROJECTLOCKED_EPISODE_SHELVES_UNRESOLVED", "activation.episode_id"));
  else failures.push(...validatePreTextPickupLedger({ shelves, pickupLedger: input.preTextPickup }));
  const pickupConditionIds = shelves == null ? [] : collectPreTextConditionIds(input.preTextPickup);
  failures.push(...validateFullPowerPreWriteGate({ gate: input.fullPowerWriteGate, pickupConditionIds }));
  for (const field of REQUIRED_PREWRITE_FLAGS) {
    if (input.preWrite?.[field] !== true) failures.push(fail("PRE_WRITE_REQUIREMENT_MISSING", field));
  }
  if (JSON.stringify(input.preWrite?.executionOrder) !== JSON.stringify(WRITE_EXECUTION_ORDER)) {
    failures.push(fail("WRITE_EXECUTION_ORDER_INVALID", "preWrite.executionOrder"));
  }
  return Object.freeze({
    decision: failures.length === 0 ? "WRITE_ALLOWED" : "STOP_BEFORE_TEXT",
    state: failures.length === 0 ? "WRITE_ALLOWED" : "PROJECTLOCKED_PACK_GATE",
    failures: Object.freeze(failures),
    shelves: failures.length === 0 ? shelves : null,
    pickupConditionIds: failures.length === 0 ? Object.freeze(pickupConditionIds) : Object.freeze([]),
    fullPowerWritePlan: failures.length === 0 ? Object.freeze([...(input.fullPowerWriteGate?.sceneConstructionPlan ?? [])]) : Object.freeze([]),
    deliveryIntent: failures.length === 0 ? Object.freeze({ ...(input.preTextPickup?.deliveryIntent ?? {}) }) : null
  });
}

export function evaluateV2PreWrite(input = {}) {
  if (input.activation?.input_mode === WRITABLE_STORY_PACK_INPUT_MODE) {
    return evaluateWritableStoryPackPreWrite(input);
  }
  if (input.activation?.input_mode === PROJECTLOCKED_INPUT_MODE || (input.activation?.activate_contracts ?? []).includes(PROJECTLOCKED_CONTRACT_ID)) {
    return evaluateProjectLockedPreWrite(input);
  }
  const failures = validateActivation(input.activation);
  const hardBinding = evaluateHardBinding(input.hardBindingState);
  if (hardBinding.decision !== "ACTIVE_RUNTIME_READY") failures.push(...hardBinding.failures);
  const material = validateWriterMaterialMap({
    map: input.materialMap,
    sourceFiles: input.sourceFiles,
    episodeId: input.activation?.episode_id
  });
  if (material.decision !== "MATERIAL_AUTHORIZED") failures.push(...material.failures);
  else failures.push(...validatePreTextPickupLedger({ shelves: material.shelves, pickupLedger: input.preTextPickup }));
  const pickupConditionIds = material.decision === "MATERIAL_AUTHORIZED" ? collectPreTextConditionIds(input.preTextPickup) : [];
  failures.push(...validateFullPowerPreWriteGate({ gate: input.fullPowerWriteGate, pickupConditionIds }));
  for (const field of REQUIRED_PREWRITE_FLAGS) {
    if (input.preWrite?.[field] !== true) failures.push(fail("PRE_WRITE_REQUIREMENT_MISSING", field));
  }
  if (JSON.stringify(input.preWrite?.executionOrder) !== JSON.stringify(WRITE_EXECUTION_ORDER)) {
    failures.push(fail("WRITE_EXECUTION_ORDER_INVALID", "preWrite.executionOrder"));
  }
  return Object.freeze({
    decision: failures.length === 0 ? "WRITE_ALLOWED" : "STOP_BEFORE_TEXT",
    state: failures.length === 0 ? "WRITE_ALLOWED" : "MATERIAL_GATE",
    failures: Object.freeze(failures),
    shelves: failures.length === 0 ? material.shelves : null,
    pickupConditionIds: failures.length === 0 ? Object.freeze(pickupConditionIds) : Object.freeze([]),
    fullPowerWritePlan: failures.length === 0 ? Object.freeze([...(input.fullPowerWriteGate?.sceneConstructionPlan ?? [])]) : Object.freeze([]),
    deliveryIntent: failures.length === 0 ? Object.freeze({ ...(input.preTextPickup?.deliveryIntent ?? {}) }) : null
  });
}

function sameIdSet(actual = [], expected = []) {
  return JSON.stringify([...new Set(actual)].sort()) === JSON.stringify([...new Set(expected)].sort());
}

function hasDuplicate(list = []) {
  return Array.isArray(list) && new Set(list).size !== list.length;
}

function validateExactSuccessOutputShape(output) {
  const failures = [];
  if (output == null || typeof output !== "object" || Array.isArray(output)) {
    return [fail("OUTPUT_OBJECT_REQUIRED", "output")];
  }
  for (const field of BASE_REQUIRED_OUTPUT) {
    if (!hasValue(output[field])) failures.push(fail("BASE_OUTPUT_MISSING", field));
  }
  for (const field of Object.keys(output)) {
    if (!BASE_REQUIRED_OUTPUT.includes(field)) failures.push(fail("OUTPUT_FIELD_NOT_ALLOWED", field));
  }
  return failures;
}

export function evaluateOutputGate({ preWriteResult, activation, output, checks, consumption } = {}) {
  if (preWriteResult?.decision !== "WRITE_ALLOWED") {
    return Object.freeze({ decision: "STOP_BEFORE_TEXT", success: false, failures: [fail("WRITE_NOT_ALLOWED", "preWriteResult")] });
  }
  const failures = validateExactSuccessOutputShape(output);
  for (const field of REQUIRED_OUTPUT_CHECKS) if (checks?.[field] !== true) failures.push(fail("OUTPUT_CHECK_FAILED", field));
  const restoreIds = (preWriteResult.shelves?.RESTORE_SOURCE ?? []).map((entry) => entry.material_id);
  const constraintIds = (preWriteResult.shelves?.RESTORE_CONSTRAINT ?? []).map((entry) => entry.material_id);
  const forbiddenBodyIds = [
    ...(preWriteResult.shelves?.PROCESS_ONLY ?? []),
    ...(preWriteResult.shelves?.OUTPUT_CONTRACT ?? []),
    ...(preWriteResult.shelves?.REFERENCE_ONLY ?? []),
    ...(preWriteResult.shelves?.DENY_AS_BODY_SOURCE ?? [])
  ].map((entry) => entry.material_id);
  const consumedRestore = consumption?.consumedRestoreMaterialIds;
  const bodySource = consumption?.bodySourceMaterialIds;
  const appliedConstraint = consumption?.appliedConstraintMaterialIds;
  if (!Array.isArray(consumedRestore)) failures.push(fail("CONSUMPTION_LIST_REQUIRED", "consumption.consumedRestoreMaterialIds"));
  if (!Array.isArray(bodySource)) failures.push(fail("CONSUMPTION_LIST_REQUIRED", "consumption.bodySourceMaterialIds"));
  if (!Array.isArray(appliedConstraint)) failures.push(fail("CONSUMPTION_LIST_REQUIRED", "consumption.appliedConstraintMaterialIds"));
  if (hasDuplicate(consumedRestore)) failures.push(fail("CONSUMPTION_ID_DUPLICATE", "consumption.consumedRestoreMaterialIds"));
  if (hasDuplicate(bodySource)) failures.push(fail("CONSUMPTION_ID_DUPLICATE", "consumption.bodySourceMaterialIds"));
  if (hasDuplicate(appliedConstraint)) failures.push(fail("CONSUMPTION_ID_DUPLICATE", "consumption.appliedConstraintMaterialIds"));
  if (!sameIdSet(consumedRestore, restoreIds)) {
    failures.push(fail("RESTORE_CONSUMPTION_MISMATCH", "consumption.consumedRestoreMaterialIds"));
  }
  if (!sameIdSet(bodySource, restoreIds)) {
    failures.push(fail("BODY_SOURCE_SET_MISMATCH", "consumption.bodySourceMaterialIds"));
  }
  if (!sameIdSet(appliedConstraint, constraintIds)) {
    failures.push(fail("CONSTRAINT_CONSUMPTION_MISMATCH", "consumption.appliedConstraintMaterialIds"));
  }
  if ((bodySource ?? []).some((id) => forbiddenBodyIds.includes(id))) {
    failures.push(fail("CROSS_SHELF_MATERIAL_ID_USED", "consumption.bodySourceMaterialIds"));
  }
  failures.push(...validatePostTextPickupLedger({ preWriteResult, output, postTextCheck: checks?.postTextCheck }));
  failures.push(...validateFullPowerPostTextGate({ preWriteResult, gate: checks?.fullPowerWriteLock }));
  failures.push(...validateFullConvergenceSweep(checks?.fullConvergenceSweep, "checks.fullConvergenceSweep"));
  if (activation?.custom_pack_extension != null) failures.push(fail("CUSTOM_PACK_EXTENSION_REMOVED", "activation.custom_pack_extension"));
  if (activation?.degraded_mode !== false) failures.push(fail("DEGRADED_WRITE_FORBIDDEN", "activation.degraded_mode"));
  if (failures.length > 0) {
    failures.push(...validateQuarantineReturnTicket(checks?.quarantineReturnTicket, "checks.quarantineReturnTicket"));
    return Object.freeze({
      decision: "FAILED_TEXT_QUARANTINE",
      success: false,
      failures: Object.freeze(failures),
      quarantine: Object.freeze({
        canon: false,
        saved: false,
        deliverable: false,
        nextProcessInput: false,
        packagerInput: false,
        textArtifactReady: false,
        diagnosticReferenceOnly: true
      })
    });
  }
  return Object.freeze({
    decision: "SUCCESS",
    success: true,
    failures: Object.freeze([]),
    output,
    artifact: Object.freeze({
      kind: "PW90_FULLY_CONVERGED_TEXT_ARTIFACT",
      fullConvergence: true,
      textArtifactReady: true,
      definition: "writer_output_is_artifact_only_after_full_convergence"
    })
  });
}
