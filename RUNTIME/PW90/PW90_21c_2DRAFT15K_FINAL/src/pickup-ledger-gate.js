const fail = (code, path, detail = null) => detail == null ? { code, path } : { code, path, detail };

export const CONDITION_ID_PATTERN = /^(REQ|FORBID|LAYER|CONN|SRC|HEAT)_[A-Z0-9]+_[0-9]{3}$/;

export const CONDITION_ID_PREFIX_BY_LEDGER = Object.freeze({
  requiredElementLedger: Object.freeze(["REQ", "HEAT"]),
  forbiddenLineLedger: Object.freeze(["FORBID"]),
  layerBindingLedger: Object.freeze(["LAYER"]),
  connectionLedger: Object.freeze(["CONN"]),
  sourceVerificationLedger: Object.freeze(["SRC"])
});

export const CONFLICT_RESOLUTION_ORDER = Object.freeze([
  "explicit_stop_or_forbidden",
  "frozen",
  "layer",
  "v2",
  "ready",
  "sources_reference"
]);

export const WARN_POLICY = Object.freeze({
  CRAFT_WARN: "log_only_does_not_block_spec_pass",
  SPEC_WARN: "repair_recommended_does_not_block_unless_spec_defect",
  STOP: "block_for_spec_defect_only"
});

export const REQUIRED_DELIVERY_INTENT_FIELDS = Object.freeze([
  "requestedVision",
  "nonDroppableCore",
  "forbiddenLineFocus",
  "endpoint"
]);

export const REQUIRED_QUARANTINE_RETURN_TICKET_FIELDS = Object.freeze([
  "reason",
  "impact",
  "requiredFix",
  "boundary",
  "resumeCondition"
]);

export const COVERAGE_TABLE_STATUSES = Object.freeze([
  "reflected",
  "applied",
  "avoided",
  "maintained",
  "verified",
  "blocked",
  "logged"
]);

export const REQUIRED_FULL_CONVERGENCE_SWEEP_FLAGS = Object.freeze([
  "noUnresolvedConditionResidue",
  "noUnmappedCoverageId",
  "noDanglingWarnWithoutClass",
  "noOpenStopWithoutTicket",
  "noHandoffResidue",
  "noHeatDeliveryResidue",
  "writerArtifactDeclared",
  "textArtifactPrepared",
  "nextActionOrStopDeclared",
  "repeatUntilStableConfirmed"
]);

export const REQUIRED_PRETEXT_PICKUP_CHECKS = Object.freeze([
  "restoreSourceRereadLedgerComplete",
  "restoreConstraintRereadLedgerComplete",
  "processOnlySeparated",
  "referenceOnlySeparated",
  "denyBodySeparated",
  "requiredElementPickupLedgerComplete",
  "forbiddenLinePickupLedgerComplete",
  "layerBindingPickupLedgerComplete",
  "connectionPickupLedgerComplete",
  "sourceVerificationLedgerComplete",
  "unverifiedSourceWriteBlockConfirmed",
  "writePlanLocksRequiredOrder",
  "reciprocalHandoffRespectConfirmed",
  "noSelfRefusedStateAccepted",
  "noBlameShiftToPreviousProcess",
  "actionableStopFormatPrepared",
  "endUserHeatIntentCaptured",
  "userVisionNotReplaced",
  "noHeatDampingByCritique",
  "deliverableFormCommitted",
  "coverageIdsStable",
  "pretextDeliveryIntentLocked",
  "conflictResolutionOrderLocked",
  "warnPolicyClassified",
  "quarantineReturnTicketPrepared",
  "fullConvergenceSweepPlanned"
]);

export const REQUIRED_POSTTEXT_PICKUP_CHECKS = Object.freeze([
  "bodyCoverageComparedToPickupLedger",
  "requiredElementsNotDropped",
  "forbiddenLinesScannedInText",
  "constraintsAppliedNotConvertedToBody",
  "processOnlyNotConvertedToBody",
  "referenceOnlyNotConvertedToBody",
  "denyBodyNotConvertedToBody",
  "unverifiedSourcesNotAsserted",
  "本文後LOGContainsPickupDigest",
  "omissionLedgerEmptyOrDeclared",
  "quarantineOnMismatch",
  "handoffRespectLogConfirmed",
  "warningsDoNotBlockSpecPass",
  "stopReasonsActionableNotBlaming",
  "endUserHeatCarriedIntoText",
  "outputShapeDeliversRequestedVision",
  "warnDoesNotCoolUserHeat",
  "noGenericFlatteningDetected",
  "coverageTableComplete",
  "coverageIdsMatchPretext",
  "warnClassificationHonored",
  "conflictResolutionOrderObserved",
  "pretextDeliveryIntentDelivered",
  "quarantineReturnTicketUsable",
  "fullConvergenceSweepComplete"
]);

export const REQUIRED_LOG_FIELDS = Object.freeze([
  "核",
  "固定層",
  "熱量層",
  "一時停止点",
  "次話再生点",
  "確認済み接続状態",
  "火種",
  "設計側不足",
  "coverage_table"
]);

function ids(shelves, shelfName) {
  return (shelves?.[shelfName] ?? []).map((entry) => entry.material_id);
}

function sortUnique(list = []) {
  return [...new Set(list)].sort();
}

function sameIdSet(actual = [], expected = []) {
  return JSON.stringify(sortUnique(actual)) === JSON.stringify(sortUnique(expected));
}

function hasDuplicate(list = []) {
  return Array.isArray(list) && new Set(list).size !== list.length;
}

function requireArray(value, path, failures) {
  if (!Array.isArray(value)) {
    failures.push(fail("PICKUP_ARRAY_REQUIRED", path));
    return [];
  }
  if (hasDuplicate(value)) failures.push(fail("PICKUP_ID_DUPLICATE", path));
  return value;
}

function hasText(value) {
  return typeof value === "string" && value.trim() !== "";
}

function validateConditionId(id, path, allowedPrefixes, failures) {
  if (!hasText(id)) {
    failures.push(fail("CONDITION_ID_REQUIRED", path));
    return;
  }
  if (!CONDITION_ID_PATTERN.test(id)) failures.push(fail("CONDITION_ID_FORMAT_INVALID", path, id));
  const prefix = id.split("_")[0];
  if (!allowedPrefixes.includes(prefix)) failures.push(fail("CONDITION_ID_PREFIX_INVALID", path, { id, allowedPrefixes }));
}

function validateObjectTextFields(value, path, fields, failures, code = "OBJECT_TEXT_FIELD_REQUIRED") {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    failures.push(fail("OBJECT_REQUIRED", path));
    return;
  }
  for (const field of fields) {
    if (!hasText(value[field])) failures.push(fail(code, `${path}.${field}`));
  }
}

function validateConflictResolutionOrder(value, path, failures) {
  if (JSON.stringify(value) !== JSON.stringify(CONFLICT_RESOLUTION_ORDER)) {
    failures.push(fail("CONFLICT_RESOLUTION_ORDER_INVALID", path));
  }
}

function validateWarnPolicy(value, path, failures) {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    failures.push(fail("WARN_POLICY_OBJECT_REQUIRED", path));
    return;
  }
  for (const [key, expected] of Object.entries(WARN_POLICY)) {
    if (value[key] !== expected) failures.push(fail("WARN_POLICY_INVALID", `${path}.${key}`));
  }
}

export function validateQuarantineReturnTicket(ticket, path = "quarantineReturnTicket") {
  const failures = [];
  if (ticket == null || typeof ticket !== "object" || Array.isArray(ticket)) {
    return [fail("QUARANTINE_RETURN_TICKET_REQUIRED", path)];
  }
  validateObjectTextFields(ticket, path, REQUIRED_QUARANTINE_RETURN_TICKET_FIELDS, failures, "QUARANTINE_RETURN_TICKET_FIELD_REQUIRED");
  return failures;
}

export function validateFullConvergenceSweep(sweep, path = "fullConvergenceSweep") {
  const failures = [];
  if (sweep == null || typeof sweep !== "object" || Array.isArray(sweep)) {
    return [fail("FULL_CONVERGENCE_SWEEP_REQUIRED", path)];
  }
  for (const flag of REQUIRED_FULL_CONVERGENCE_SWEEP_FLAGS) {
    if (sweep[flag] !== true) failures.push(fail("FULL_CONVERGENCE_SWEEP_FLAG_NOT_PASS", `${path}.${flag}`));
  }
  if (Array.isArray(sweep.residueItems) && sweep.residueItems.length > 0) {
    failures.push(fail("FULL_CONVERGENCE_RESIDUE_REMAINING", `${path}.residueItems`, sweep.residueItems));
  }
  if (!hasText(sweep.finalDecision)) failures.push(fail("FULL_CONVERGENCE_FINAL_DECISION_REQUIRED", `${path}.finalDecision`));
  if (!["SUCCESS_DELIVERABLE", "STOP_WITH_RETURN_TICKET"].includes(sweep.finalDecision)) {
    failures.push(fail("FULL_CONVERGENCE_FINAL_DECISION_INVALID", `${path}.finalDecision`, sweep.finalDecision));
  }
  return failures;
}

function validateLedgerEntries(entries, path, allowedMaterialIds, failures, allowedPrefixes) {
  if (!Array.isArray(entries) || entries.length === 0) {
    failures.push(fail("PICKUP_LEDGER_ENTRIES_REQUIRED", path));
    return [];
  }
  const entryIds = new Set();
  const collected = [];
  for (const [index, entry] of entries.entries()) {
    const base = `${path}[${index}]`;
    if (entry == null || typeof entry !== "object" || Array.isArray(entry)) {
      failures.push(fail("PICKUP_LEDGER_ENTRY_OBJECT_REQUIRED", base));
      continue;
    }
    if (typeof entry.id !== "string" || entry.id.trim() === "") failures.push(fail("PICKUP_LEDGER_ENTRY_ID_REQUIRED", `${base}.id`));
    else {
      if (entryIds.has(entry.id)) failures.push(fail("PICKUP_LEDGER_ENTRY_ID_DUPLICATE", `${base}.id`, entry.id));
      else entryIds.add(entry.id);
      validateConditionId(entry.id, `${base}.id`, allowedPrefixes, failures);
      collected.push(entry.id);
    }
    if (typeof entry.sourceMaterialId !== "string" || !allowedMaterialIds.includes(entry.sourceMaterialId)) {
      failures.push(fail("PICKUP_LEDGER_SOURCE_MATERIAL_INVALID", `${base}.sourceMaterialId`, entry?.sourceMaterialId));
    }
    if (!["picked", "applied", "blocked", "scanned", "verified"].includes(entry.status)) failures.push(fail("PICKUP_LEDGER_STATUS_INVALID", `${base}.status`, entry?.status));
    if (entry.status === "missing" || entry.status === "unknown" || entry.status === "omitted") {
      failures.push(fail("PICKUP_LEDGER_UNRESOLVED_STATUS", `${base}.status`, entry.status));
    }
  }
  return collected;
}

export function collectPreTextConditionIds(pickupLedger = {}) {
  const ids = [];
  for (const field of ["requiredElementLedger", "forbiddenLineLedger", "layerBindingLedger", "connectionLedger", "sourceVerificationLedger"]) {
    for (const entry of pickupLedger?.[field] ?? []) if (hasText(entry?.id)) ids.push(entry.id);
  }
  return sortUnique(ids);
}

export function validatePreTextPickupLedger({ shelves, pickupLedger } = {}) {
  const failures = [];
  if (shelves == null) return [fail("PICKUP_SHELVES_REQUIRED", "shelves")];
  if (pickupLedger == null || typeof pickupLedger !== "object" || Array.isArray(pickupLedger)) {
    return [fail("PRETEXT_PICKUP_LEDGER_REQUIRED", "preTextPickup")];
  }
  for (const field of REQUIRED_PRETEXT_PICKUP_CHECKS) {
    if (pickupLedger.checks?.[field] !== true) failures.push(fail("PRETEXT_PICKUP_CHECK_FAILED", `preTextPickup.checks.${field}`));
  }

  const restoreIds = ids(shelves, "RESTORE_SOURCE");
  const constraintIds = ids(shelves, "RESTORE_CONSTRAINT");
  const processIds = ids(shelves, "PROCESS_ONLY");
  const referenceIds = ids(shelves, "REFERENCE_ONLY");
  const denyIds = ids(shelves, "DENY_AS_BODY_SOURCE");
  const forbiddenBodyIds = [...processIds, ...referenceIds, ...denyIds];
  const allowedLedgerMaterialIds = [...restoreIds, ...constraintIds, ...processIds, ...referenceIds, ...denyIds];

  const plannedRestore = requireArray(pickupLedger.plannedRestoreMaterialIds, "preTextPickup.plannedRestoreMaterialIds", failures);
  const plannedConstraint = requireArray(pickupLedger.plannedConstraintMaterialIds, "preTextPickup.plannedConstraintMaterialIds", failures);
  const plannedProcessOnly = requireArray(pickupLedger.readButNonBodyMaterialIds, "preTextPickup.readButNonBodyMaterialIds", failures);
  const bodyEligible = requireArray(pickupLedger.bodyEligibleMaterialIds, "preTextPickup.bodyEligibleMaterialIds", failures);
  const forbiddenBody = requireArray(pickupLedger.forbiddenBodyMaterialIds, "preTextPickup.forbiddenBodyMaterialIds", failures);

  if (!sameIdSet(plannedRestore, restoreIds)) failures.push(fail("PRETEXT_RESTORE_PICKUP_MISMATCH", "preTextPickup.plannedRestoreMaterialIds"));
  if (!sameIdSet(plannedConstraint, constraintIds)) failures.push(fail("PRETEXT_CONSTRAINT_PICKUP_MISMATCH", "preTextPickup.plannedConstraintMaterialIds"));
  if (!sameIdSet(plannedProcessOnly, [...processIds, ...referenceIds])) failures.push(fail("PRETEXT_NONBODY_READ_MISMATCH", "preTextPickup.readButNonBodyMaterialIds"));
  if (!sameIdSet(bodyEligible, restoreIds)) failures.push(fail("PRETEXT_BODY_ELIGIBLE_MISMATCH", "preTextPickup.bodyEligibleMaterialIds"));
  if (!sameIdSet(forbiddenBody, forbiddenBodyIds)) failures.push(fail("PRETEXT_FORBIDDEN_BODY_MISMATCH", "preTextPickup.forbiddenBodyMaterialIds"));

  if ((bodyEligible ?? []).some((id) => forbiddenBodyIds.includes(id))) failures.push(fail("PRETEXT_FORBIDDEN_BODY_MARKED_ELIGIBLE", "preTextPickup.bodyEligibleMaterialIds"));
  const conditionIds = [
    ...validateLedgerEntries(pickupLedger.requiredElementLedger, "preTextPickup.requiredElementLedger", allowedLedgerMaterialIds, failures, CONDITION_ID_PREFIX_BY_LEDGER.requiredElementLedger),
    ...validateLedgerEntries(pickupLedger.forbiddenLineLedger, "preTextPickup.forbiddenLineLedger", allowedLedgerMaterialIds, failures, CONDITION_ID_PREFIX_BY_LEDGER.forbiddenLineLedger),
    ...validateLedgerEntries(pickupLedger.layerBindingLedger, "preTextPickup.layerBindingLedger", allowedLedgerMaterialIds, failures, CONDITION_ID_PREFIX_BY_LEDGER.layerBindingLedger),
    ...validateLedgerEntries(pickupLedger.connectionLedger, "preTextPickup.connectionLedger", allowedLedgerMaterialIds, failures, CONDITION_ID_PREFIX_BY_LEDGER.connectionLedger)
  ];

  if (!Array.isArray(pickupLedger.sourceVerificationLedger) || pickupLedger.sourceVerificationLedger.length === 0) {
    failures.push(fail("SOURCE_VERIFICATION_LEDGER_REQUIRED", "preTextPickup.sourceVerificationLedger"));
  } else {
    const sourceIds = new Set();
    for (const [index, entry] of pickupLedger.sourceVerificationLedger.entries()) {
      const base = `preTextPickup.sourceVerificationLedger[${index}]`;
      if (entry == null || typeof entry !== "object" || Array.isArray(entry)) {
        failures.push(fail("SOURCE_VERIFICATION_ENTRY_OBJECT_REQUIRED", base));
        continue;
      }
      validateConditionId(entry.id, `${base}.id`, CONDITION_ID_PREFIX_BY_LEDGER.sourceVerificationLedger, failures);
      if (sourceIds.has(entry.id)) failures.push(fail("SOURCE_VERIFICATION_ID_DUPLICATE", `${base}.id`, entry.id));
      else sourceIds.add(entry.id);
      if (hasText(entry.id)) conditionIds.push(entry.id);
      if (typeof entry.mountId !== "string" || entry.mountId.trim() === "") failures.push(fail("SOURCE_VERIFICATION_MOUNT_ID_REQUIRED", `${base}.mountId`));
      if (!["verified", "not_required"].includes(entry.status)) failures.push(fail("SOURCE_VERIFICATION_STATUS_INVALID", `${base}.status`, entry.status));
      if (entry.status !== "verified" && entry.writeAuthority !== "blocked") failures.push(fail("UNVERIFIED_SOURCE_NOT_BLOCKED", `${base}.writeAuthority`));
    }
  }

  if (hasDuplicate(conditionIds)) failures.push(fail("CONDITION_ID_DUPLICATE_ACROSS_LEDGERS", "preTextPickup"));
  validateObjectTextFields(pickupLedger.deliveryIntent, "preTextPickup.deliveryIntent", REQUIRED_DELIVERY_INTENT_FIELDS, failures, "DELIVERY_INTENT_FIELD_REQUIRED");
  validateConflictResolutionOrder(pickupLedger.conflictResolutionOrder, "preTextPickup.conflictResolutionOrder", failures);
  validateWarnPolicy(pickupLedger.warnPolicy, "preTextPickup.warnPolicy", failures);
  failures.push(...validateQuarantineReturnTicket(pickupLedger.quarantineReturnTicketTemplate, "preTextPickup.quarantineReturnTicketTemplate"));

  return failures;
}

function validateCoverageTable({ expectedConditionIds, coverageTable, log }, failures) {
  if (!Array.isArray(coverageTable) || coverageTable.length === 0) {
    failures.push(fail("COVERAGE_TABLE_REQUIRED", "postTextCheck.coverageTable"));
    return;
  }
  const seen = new Set();
  for (const [index, entry] of coverageTable.entries()) {
    const base = `postTextCheck.coverageTable[${index}]`;
    if (entry == null || typeof entry !== "object" || Array.isArray(entry)) {
      failures.push(fail("COVERAGE_TABLE_ENTRY_OBJECT_REQUIRED", base));
      continue;
    }
    validateConditionId(entry.id, `${base}.id`, ["REQ", "FORBID", "LAYER", "CONN", "SRC", "HEAT"], failures);
    if (seen.has(entry.id)) failures.push(fail("COVERAGE_TABLE_ID_DUPLICATE", `${base}.id`, entry.id));
    else seen.add(entry.id);
    if (!COVERAGE_TABLE_STATUSES.includes(entry.status)) failures.push(fail("COVERAGE_TABLE_STATUS_INVALID", `${base}.status`, entry.status));
    if (!hasText(entry.evidence)) failures.push(fail("COVERAGE_TABLE_EVIDENCE_REQUIRED", `${base}.evidence`));
  }
  if (!sameIdSet([...seen], expectedConditionIds ?? [])) failures.push(fail("COVERAGE_TABLE_ID_MISMATCH", "postTextCheck.coverageTable"));
  if (typeof log === "string") {
    for (const id of expectedConditionIds ?? []) {
      if (!log.includes(id)) failures.push(fail("POSTTEXT_LOG_COVERAGE_ID_MISSING", `output.本文後LOG.${id}`));
    }
  }
}

export function validatePostTextPickupLedger({ preWriteResult, output, postTextCheck } = {}) {
  const failures = [];
  if (postTextCheck == null || typeof postTextCheck !== "object" || Array.isArray(postTextCheck)) {
    return [fail("POSTTEXT_PICKUP_LEDGER_REQUIRED", "postTextCheck")];
  }
  for (const field of REQUIRED_POSTTEXT_PICKUP_CHECKS) {
    if (postTextCheck.checks?.[field] !== true) failures.push(fail("POSTTEXT_PICKUP_CHECK_FAILED", `postTextCheck.checks.${field}`));
  }

  const restoreIds = ids(preWriteResult?.shelves, "RESTORE_SOURCE");
  const constraintIds = ids(preWriteResult?.shelves, "RESTORE_CONSTRAINT");
  const forbiddenBodyIds = [
    ...ids(preWriteResult?.shelves, "PROCESS_ONLY"),
    ...ids(preWriteResult?.shelves, "REFERENCE_ONLY"),
    ...ids(preWriteResult?.shelves, "DENY_AS_BODY_SOURCE")
  ];

  const recovered = requireArray(postTextCheck.recoveredRestoreMaterialIds, "postTextCheck.recoveredRestoreMaterialIds", failures);
  const applied = requireArray(postTextCheck.appliedConstraintMaterialIds, "postTextCheck.appliedConstraintMaterialIds", failures);
  const body = requireArray(postTextCheck.bodySourceMaterialIds, "postTextCheck.bodySourceMaterialIds", failures);
  if (!sameIdSet(recovered, restoreIds)) failures.push(fail("POSTTEXT_RESTORE_RECOVERY_MISMATCH", "postTextCheck.recoveredRestoreMaterialIds"));
  if (!sameIdSet(applied, constraintIds)) failures.push(fail("POSTTEXT_CONSTRAINT_APPLICATION_MISMATCH", "postTextCheck.appliedConstraintMaterialIds"));
  if (!sameIdSet(body, restoreIds)) failures.push(fail("POSTTEXT_BODY_SOURCE_MISMATCH", "postTextCheck.bodySourceMaterialIds"));
  if ((body ?? []).some((id) => forbiddenBodyIds.includes(id))) failures.push(fail("POSTTEXT_FORBIDDEN_BODY_SOURCE_USED", "postTextCheck.bodySourceMaterialIds"));

  for (const [field, code] of [
    ["omittedRequiredElementIds", "POSTTEXT_OMITTED_REQUIRED_ELEMENTS"],
    ["violatedForbiddenLineIds", "POSTTEXT_FORBIDDEN_LINE_VIOLATIONS"],
    ["unresolvedConditionIds", "POSTTEXT_UNRESOLVED_CONDITIONS"],
    ["unverifiedSourceClaims", "POSTTEXT_UNVERIFIED_SOURCE_CLAIMS"]
  ]) {
    if (!Array.isArray(postTextCheck[field])) failures.push(fail("POSTTEXT_ARRAY_REQUIRED", `postTextCheck.${field}`));
    else if (postTextCheck[field].length > 0) failures.push(fail(code, `postTextCheck.${field}`, postTextCheck[field]));
  }

  const log = output?.["本文後LOG"];
  if (typeof log !== "string" || log.trim() === "") failures.push(fail("POSTTEXT_LOG_REQUIRED", "output.本文後LOG"));
  else {
    for (const field of REQUIRED_LOG_FIELDS) if (!log.includes(field)) failures.push(fail("POSTTEXT_LOG_FIELD_MISSING", `output.本文後LOG.${field}`));
  }
  if (typeof postTextCheck.pickupDigest !== "string" || postTextCheck.pickupDigest.trim() === "") {
    failures.push(fail("POSTTEXT_PICKUP_DIGEST_REQUIRED", "postTextCheck.pickupDigest"));
  }

  const expectedConditionIds = preWriteResult?.pickupConditionIds ?? [];
  if (!Array.isArray(expectedConditionIds) || expectedConditionIds.length === 0) failures.push(fail("PRETEXT_CONDITION_IDS_REQUIRED", "preWriteResult.pickupConditionIds"));
  validateCoverageTable({ expectedConditionIds, coverageTable: postTextCheck.coverageTable, log }, failures);

  if (!Array.isArray(postTextCheck.warnLedger)) failures.push(fail("WARN_LEDGER_ARRAY_REQUIRED", "postTextCheck.warnLedger"));
  else {
    for (const [index, entry] of postTextCheck.warnLedger.entries()) {
      const base = `postTextCheck.warnLedger[${index}]`;
      if (entry == null || typeof entry !== "object" || Array.isArray(entry)) {
        failures.push(fail("WARN_LEDGER_ENTRY_OBJECT_REQUIRED", base));
        continue;
      }
      if (!Object.keys(WARN_POLICY).includes(entry.class)) failures.push(fail("WARN_CLASS_INVALID", `${base}.class`, entry.class));
      if (!hasText(entry.message)) failures.push(fail("WARN_MESSAGE_REQUIRED", `${base}.message`));
      if (entry.class !== "STOP" && entry.blocksSpecPass === true) failures.push(fail("WARN_MUST_NOT_BLOCK_SPEC_PASS", `${base}.blocksSpecPass`));
    }
  }
  validateConflictResolutionOrder(postTextCheck.conflictResolutionOrderObserved, "postTextCheck.conflictResolutionOrderObserved", failures);
  validateObjectTextFields(postTextCheck.deliveryIntentResult, "postTextCheck.deliveryIntentResult", REQUIRED_DELIVERY_INTENT_FIELDS, failures, "DELIVERY_INTENT_RESULT_FIELD_REQUIRED");

  return failures;
}
