import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import {
  execute,
  createRuntimeSession,
  resumeRuntimeSession,
  advanceRuntimeSession
} from "../src/engine.js";
import { validateSchema } from "../src/schema.js";
import { buildOperationPlan } from "../src/runtime/operation-plan.js";
import { SKILL_EXECUTION_MODEL, SKILL_REGISTRY } from "../src/skills/registry.js";
import { OPERATION_READS, INTERNAL_FALLBACK_READS, OPTIONAL_REFERENCE_ROUTES } from "../src/loading/manifest.js";
import { ALWAYS_READ } from "../src/boot/validator.js";
import { DS90_RUNTIME_VERSION } from "../src/runtime/session.js";

const cardFixture = () => JSON.parse(readFileSync(new URL("../examples/card.json", import.meta.url), "utf8"));
const bootFixture = () => JSON.parse(readFileSync(new URL("../examples/boot.json", import.meta.url), "utf8"));

const fullActiveLedger = [...new Set([
  ...ALWAYS_READ,
  ...Object.values(OPERATION_READS).flat()
])].map((path) => ({ path, exists: true, read: true }));

function withAllActiveReads(request) {
  const copy = structuredClone(request);
  copy.boot = { ...(copy.boot ?? {}), readLedger: fullActiveLedger };
  return copy;
}

function withDispatchRoutes(request) {
  const copy = withAllActiveReads(request);
  copy.knowledgeContext ??= {};
  copy.knowledgeContext.dispatch ??= {};
  copy.knowledgeContext.dispatch.routes = {
    ...(copy.knowledgeContext.dispatch.routes ?? {}),
    MOUNT_TRANSFER: { resolved: true, sha256Verified: true, path: "000_C/MT00/runtime.zip" },
    PACK_CUTOUT: { resolved: true, sha256Verified: true, path: "000_C/SP00/runtime.zip" },
    MOUNT_ZIP_BOOTSTRAP: { resolved: true, sha256Verified: true, path: "000_C/MT00_BOOTSTRAP_EA/runtime.zip" },
    STORY_PACK_RECEIVER_CHECK: { resolved: true, sha256Verified: true, path: "000_C/PW90_STORY_PACK_RECEIVER_CHECKER/runtime.zip" }
  };
  return copy;
}

function accessDelivered(action, {
  sourceIds = [],
  semanticRecords = null,
  resolvedRecordIds = null,
  provenanceIds = [],
  evidenceComplete = sourceIds.length === 0,
  injectShelfPointer = sourceIds.length === 0
} = {}) {
  const baseRecords = semanticRecords ?? ((sourceIds.length > 0 && injectShelfPointer === false) ? [{
    record_id: "R1", record_type: "ASSERTION", logical_id: "R1", status: "CONFIRMED",
    source_refs: [], provenance_refs: []
  }] : [{
    record_id: "SRC-TEST-CURRENT-SHELF", record_type: "SOURCE", logical_id: "LID-SRC-TEST-CURRENT-SHELF", status: "CONFIRMED",
    revision: 1, scope: { kind: "GLOBAL", dimensions: [] },
    source_refs: [], provenance_refs: [], aliases: ["fixture"], search_terms: ["#TEST:CARD"],
    preservation: ["SOURCE_LINK"], supersedes_refs: [],
    payload: { source_role: "PRIMARY", locator: "021_G_v001/30_CURRENT/TEST_SOURCE.md", sha256: createHash("sha256").update(Buffer.from("verified current shelf bytes\n", "utf8")).digest("hex"), media_type: "text/markdown" }
  }]);
  const records = baseRecords.map((record) => {
    const copy = structuredClone(record);
    if (injectShelfPointer && copy.record_type !== "SOURCE") {
      copy.payload = {
        ...(copy.payload ?? {}),
        shelf_id: copy.payload?.shelf_id ?? "021_G",
        shelf_pointer: copy.payload?.shelf_pointer ?? "021_G/30_CURRENT/TEST_SOURCE.md",
        source_pointer: copy.payload?.source_pointer ?? "#fixture"
      };
      copy.aliases ??= ["fixture"];
      copy.search_terms ??= ["#TEST:CARD"];
    }
    return copy;
  });
  const resolved = resolvedRecordIds ?? records.map((record) => record.record_id ?? record.recordId).filter(Boolean);
  const deliveredRecords = records.map((record) => ({
    record_id: record.record_id ?? record.recordId,
    projection_mode: "FULL_RECORD",
    data: record
  }));
  return {
    actionId: action.actionId,
    actionType: "PKDB_ACCESS",
    packet: {
      packet_schema_version: "PKDB_DELIVERY_PACKET_v001",
      execution_id: action.residentBinding.executionId,
      consumer_id: action.residentBinding.consumerId,
      decision: "DELIVERED",
      snapshot: { snapshot_sha256: "a".repeat(64), record_count: records.length, source_object_count: sourceIds.length },
      project_meaning_authored_by_skill: false,
      inference_permitted: false,
      db_mutation_performed: false,
      runtime_work_performed: false,
      external_service_required: false,
      reason_codes: [],
      clause_results: [{
        clause_id: "Q0001",
        required: true,
        state: "DELIVERED",
        reason_codes: [],
        resolution_result: {
          result_schema_version: "PKDB_RESOLUTION_RESULT_v001",
          outcome: "RESOLVED",
          reason_codes: ["EXACT_SINGLE"],
          candidate_record_ids: resolved,
          resolved_record_ids: resolved,
          scope_unresolved_record_ids: [],
          evidence_source_refs: sourceIds,
          provenance_refs: provenanceIds
        },
        delivery_count: deliveredRecords.length,
        delivered_records: deliveredRecords
      }]
    },
    evidenceComplete
  };
}

function shelfReadDelivered(action, text = "verified current shelf bytes\n") {
  const bytes = Buffer.from(text, "utf8");
  const sha = createHash("sha256").update(bytes).digest("hex");
  return {
    actionId: action.actionId,
    actionType: "SHELF_READ",
    decision: "DELIVERED",
    reads: action.items.map((item) => ({
      shelfId: item.shelfId,
      shelfPointer: item.shelfPointer,
      sourcePointer: item.sourcePointer,
      contentBase64: bytes.toString("base64"),
      sha256: sha,
      declaredBytes: bytes.length,
      mediaType: "text/plain",
      transformed: false
    }))
  };
}

function resumeShelfIfPending(session, result) {
  if (result?.hostAction?.actionType !== "SHELF_READ") return { session, result };
  return resumeRuntimeSession(session, shelfReadDelivered(result.hostAction));
}

function allowSourceFallback(request) {
  const copy = structuredClone(request);
  copy.knowledgeRequest ??= {};
  copy.knowledgeRequest.allowSourceMaterializeFallback = true;
  return copy;
}

function materialized(action, sourceId = "SRC1", text = "verified source bytes\n", shaOverride = null, mediaType = "text/plain") {
  const bytes = Buffer.from(text, "utf8");
  const sha = shaOverride ?? createHash("sha256").update(bytes).digest("hex");
  const objectPath = `objects/${sha}`;
  return {
    actionId: action.actionId,
    actionType: "SOURCE_MATERIALIZE",
    packet: {
      packet_schema_version: "PKDB_SOURCE_MATERIALIZE_PACKET_v001",
      execution_id: action.residentBinding.executionId,
      consumer_id: action.residentBinding.consumerId,
      decision: "DELIVERED",
      snapshot: { snapshot_sha256: "a".repeat(64) },
      source_bytes_transformed: false,
      db_mutation_performed: false,
      runtime_work_performed: false,
      external_service_required: false,
      reason_codes: [],
      item_results: [{
        item_id: "S0001", required: true, state: "DELIVERED", reason_codes: [],
        source_record_id: sourceId, sha256: sha, bytes: bytes.length, media_type: mediaType,
        bundle_object_path: objectPath
      }]
    },
    bundleObjects: { [objectPath]: bytes.toString("base64") }
  };
}

function dispatchVerified(action, { path = `000_C/${action.target}/runtime.zip`, sha = "b".repeat(64) } = {}) {
  return {
    actionId: action.actionId,
    actionType: "CURRENT_000C_DISPATCH_RESOLVE",
    decision: "VERIFIED",
    source: "CURRENT_000_C",
    manifestPath: action.manifestPath,
    routeKey: action.dispatchRoute,
    target: action.target,
    path,
    declaredSha256: sha,
    actualSha256: sha
  };
}

function specialistArtifactFor(action) {
  const zipSha256 = "c".repeat(64);
  switch (action.target) {
    case "MT00": return { kind: action.resultKind, zipSha256, validatorDecision: "PASS" };
    case "SP00": return { kind: action.resultKind, zipSha256, validationDecision: "PASS", selfContained: true };
    case "MT00_BOOTSTRAP_EA": return { kind: action.resultKind, zipSha256, validatorDecision: "PASS" };
    case "PW90_STORY_PACK_RECEIVER_CHECKER": return { kind: action.resultKind, acceptedByPw90: true, writableOnPw90Line: true, receiverDecision: "PW90_RECEIVER_ACCEPTS_WRITABLE_MINIMUM_PACK" };
    case "PW90": return { kind: action.resultKind, terminalState: "SUCCESS", artifactKind: "PW90_FULLY_CONVERGED_TEXT_ARTIFACT", artifactRef: "pw90://artifact/1" };
    case "TS90": return { kind: action.resultKind, terminalDecision: "TERMINAL_LOCKS_PASS", outputDecision: "PHASE_B_SUCCESS", artifactRef: "ts90://artifact/1" };
    default: return { kind: action.resultKind };
  }
}

function driveSpecialist(request) {
  let { session, result } = createRuntimeSession(withAllActiveReads(request));
  if (result.hostAction?.actionType === "CURRENT_000C_DISPATCH_RESOLVE") {
    ({ session, result } = resumeRuntimeSession(session, dispatchVerified(result.hostAction)));
  }
  return { session, result };
}

function driveSemanticOnly(request) {
  let { session, result } = createRuntimeSession(withAllActiveReads(request));
  assert.equal(result.hostAction?.actionType, "PKDB_ACCESS");
  ({ session, result } = resumeRuntimeSession(session, accessDelivered(result.hostAction)));
  ({ session, result } = resumeShelfIfPending(session, result));
  return { session, result };
}

test("K01 resident request uses mounted PKDB query schema v003", () => {
  const request = cardFixture();
  request.knowledgeRequest.intents = [{ kind: "ALIAS", value: "G棚", required: true }];
  const { result } = createRuntimeSession(request);
  assert.equal(result.hostAction?.actionType, "PKDB_ACCESS");
  assert.equal(result.hostAction.residentRequest.clauses[0].query.query_schema_version, "PKDB_QUERY_SCHEMA_v003");
});

test("schema accepts the promoted specialist operations", () => {
  for (const operation of ["MOUNT_ZIP_BOOTSTRAP", "SPECIALIST_HANDOFF"]) {
    const request = { ...bootFixture(), operation };
    delete request.command;
    if (operation === "SPECIALIST_HANDOFF") request.payload = { specialistTarget: "PW90" };
    assert.equal(validateSchema(request).some((entry) => entry.code === "SCHEMA_ENUM"), false, operation);
  }
});

test("normal MT00/SP00 routes resolve current 000_C proof before specialist invocation", () => {
  for (const [command, target, routeKey] of [
    ["ヌル投入お願いします", "MT00", "MOUNT_TRANSFER"],
    ["ナル投入お願いします", "SP00", "PACK_CUTOUT"]
  ]) {
    let { session, result } = createRuntimeSession(withAllActiveReads({ ...bootFixture(), command }));
    assert.equal(result.decision, null, command);
    assert.equal(result.hostAction.actionType, "CURRENT_000C_DISPATCH_RESOLVE", command);
    assert.equal(result.hostAction.target, target, command);
    assert.equal(result.hostAction.dispatchRoute, routeKey, command);
    ({ session, result } = resumeRuntimeSession(session, dispatchVerified(result.hostAction)));
    assert.equal(result.hostAction.actionType, "SPECIALIST_RUNTIME_INVOKE", command);
    assert.equal(result.hostAction.target, target, command);
    assert.equal(result.hostAction.routeEvidence.verified, true, command);
    assert.equal(result.hostAction.inputAuthority, "ORIGINAL_DS90_REQUEST_PRESERVED", command);
    assert.equal(result.hostAction.runtimeInput.command, command);
    assert.equal(result.moduleOutput, null, command);
  }
});

test("specialist metadata cannot masquerade as completion; target-specific proof resumes terminally", () => {
  let { session, result } = driveSpecialist({ ...bootFixture(), command: "PW90投入" });
  assert.equal(result.decision, null);
  assert.equal(result.hostAction.target, "PW90");
  const action = result.hostAction;
  ({ session, result } = resumeRuntimeSession(session, {
    actionId: action.actionId,
    actionType: "SPECIALIST_RUNTIME_INVOKE",
    target: "PW90",
    decision: "PASS",
    completed: true,
    resultKind: action.resultKind,
    artifact: specialistArtifactFor(action)
  }));
  assert.equal(result.decision, "PASS");
  assert.equal(result.moduleOutput.specialistCompleted, true);
  assert.equal(result.moduleOutput.artifact.artifactKind, "PW90_FULLY_CONVERGED_TEXT_ARTIFACT");
});

test("specialist STOP is non-overrideable", () => {
  let { session, result } = driveSpecialist({ ...bootFixture(), command: "PW90投入", userOverrides: [{ ruleId: "SPECIALIST_RUNTIME_STOP", operation: "SPECIALIST_HANDOFF", decision: "ALLOW", persistence: "ONCE", scope: "*", userDecisionRef: { sourcePath: "user", section: "decision" } }] });
  const action = result.hostAction;
  ({ result } = resumeRuntimeSession(session, {
    actionId: action.actionId,
    actionType: "SPECIALIST_RUNTIME_INVOKE",
    target: "PW90",
    decision: "STOP",
    completed: false
  }));
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => (entry.code ?? entry.ruleId) === "SPECIALIST_RUNTIME_STOP"));
});

test("project operation performs PKDB ACCESS -> current SHELF_READ -> design validation", () => {
  let { session, result } = createRuntimeSession(cardFixture());
  assert.equal(result.state, "WAITING_FOR_HOST");
  assert.equal(result.hostAction.actionType, "PKDB_ACCESS");
  const accessActionId = result.hostAction.actionId;
  ({ session, result } = resumeRuntimeSession(session, accessDelivered(result.hostAction)));
  assert.equal(result.state, "WAITING_FOR_HOST");
  assert.equal(result.hostAction.actionType, "SHELF_READ");
  assert.equal(accessActionId.startsWith("PKDB_ACCESS:"), true);
  ({ session, result } = resumeRuntimeSession(session, shelfReadDelivered(result.hostAction)));
  assert.equal(result.decision, "PASS");
  assert.equal(result.knowledgeEvidence.shelfBytesActuallyRead, true);
  assert.equal(result.knowledgeEvidence.shelfReads[0].utf8Read, true);
  assert.equal(result.knowledgeEvidence.currentShelfIsAuthority, true);
});

test("SOURCE_MATERIALIZE remains explicit fallback only", () => {
  let { session, result } = createRuntimeSession(allowSourceFallback(cardFixture()));
  ({ session, result } = resumeRuntimeSession(session, accessDelivered(result.hostAction, { sourceIds: ["SRC1"], evidenceComplete: false, injectShelfPointer: false })));
  assert.equal(result.hostAction.actionType, "SOURCE_MATERIALIZE");
  ({ result } = resumeRuntimeSession(session, materialized(result.hostAction)));
  assert.equal(result.decision, "PASS");
  assert.equal(result.knowledgeEvidence.evidenceRoute, "SOURCE_MATERIALIZE_FALLBACK");
  assert.equal(result.knowledgeEvidence.currentShelfIsAuthority, false);
});

test("materialized SOURCE SHA mismatch STOPs and cannot be user-overridden", () => {
  const request = cardFixture();
  request.userOverrides = [{ ruleId: "MATERIALIZED_SOURCE_SHA_MISMATCH", operation: "CARD", decision: "ALLOW", persistence: "ONCE", scope: "*", userDecisionRef: { sourcePath: "user", section: "decision" } }];
  request.knowledgeRequest.allowSourceMaterializeFallback = true;
  let { session, result } = createRuntimeSession(request);
  ({ session, result } = resumeRuntimeSession(session, accessDelivered(result.hostAction, { sourceIds: ["SRC1"], evidenceComplete: false, injectShelfPointer: false })));
  ({ result } = resumeRuntimeSession(session, materialized(result.hostAction, "SRC1", "bytes", "0".repeat(64))));
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => (entry.code ?? entry.ruleId) === "MATERIALIZED_SOURCE_SHA_MISMATCH"));
});

test("resident PKDB DELIVERED packet is the semantic-only completeness authority; wrapper self-claims cannot override it", () => {
  let { session, result } = createRuntimeSession(cardFixture());
  const hostResult = accessDelivered(result.hostAction, { sourceIds: [] });
  hostResult.evidenceComplete = false;
  ({ session, result } = resumeRuntimeSession(session, hostResult));
  ({ session, result } = resumeShelfIfPending(session, result));
  assert.equal(result.decision, "PASS");
  assert.equal(result.knowledgeEvidence.evidenceComplete, true);
  assert.equal(result.knowledgeEvidence.hostAdapter, "DS90_PKDB_HOST_ADAPTER_v002");
});

test("serialized session request/plan/mutable-state tampering is rejected", () => {
  const created = createRuntimeSession(cardFixture());
  for (const [label, mutate, code] of [
    ["request", (s) => { s.request.card.goalCondition = "tampered"; }, "SESSION_REQUEST_TAMPERED"],
    ["plan", (s) => { s.plan.kind = "BOOT_LOCAL"; }, "SESSION_PLAN_TAMPERED"],
    ["mutable", (s) => { s.pendingAction.actionType = "FAKE"; }, "SESSION_MUTABLE_STATE_TAMPERED"]
  ]) {
    const session = structuredClone(created.session);
    mutate(session);
    const advanced = advanceRuntimeSession(session).result;
    assert.equal(advanced.decision, "STOP", label);
    assert.ok(advanced.issues.some((entry) => (entry.code ?? entry.ruleId) === code), label);
  }
});

test("self-consistent route/plan hash tampering is rejected by canonical replay", () => {
  const created = createRuntimeSession(cardFixture());
  const session = structuredClone(created.session);
  session.plan.kind = "BOOT_LOCAL";
  const stable = (value) => {
    if (Array.isArray(value)) return value.map(stable);
    if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
    return value;
  };
  const hash = (value) => createHash("sha256").update(JSON.stringify(stable(value))).digest("hex");
  session.planHash = hash({ operation: session.route.operation, spec: session.route.spec, plan: session.plan });
  const result = advanceRuntimeSession(session).result;
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => (entry.code ?? entry.ruleId) === "SESSION_PLAN_NOT_CANONICAL"));
});

test("PKDB INPUT is proposal-only and keeps MT00/Nul as commit authority", () => {
  const request = cardFixture();
  request.pkdbInputCandidates = [{
    candidate_id: "C1",
    record_type: "ASSERTION",
    semantic_key: "test.assertion",
    mode: "CREATE",
    value: { established: true },
    evidence_refs: ["SRC-TEST-CURRENT-SHELF"],
    provenance_refs: []
  }];
  const { result } = driveSemanticOnly(request);
  assert.equal(result.decision, "PASS");
  assert.equal(result.pkdbInputProposal.kind, "PKDB_INPUT_PROPOSAL");
  assert.equal(result.pkdbInputProposal.status, "PROPOSAL_ONLY_NOT_COMMITTED");
  assert.equal(result.pkdbInputProposal.commitAuthority, "MT00_NUL_ONLY");
  assert.equal(result.pkdbInputProposal.standardInputPolicy.profile, "TAG_ALIAS_CURRENT_SOURCE_LOCATOR_REVERSE_INDEX_MINIMAL_RELATION");
  assert.equal(result.pkdbInputProposal.standardInputPolicy.projectFullTextReconstructionStandard, false);
});

test("v0401 K03 accepts proposal-only schema-legal current SOURCE locator candidate", () => {
  const request = cardFixture();
  request.pkdbInputCandidates = [{
    candidate_id: "LOC-1",
    record_type: "SOURCE",
    semantic_key: "shelf.021_g.start",
    mode: "CREATE",
    value: {
      source_role: "PRIMARY",
      locator: "021_G_v001/00_START/00_疑似GPTs設計さんへ_最初に読む.md",
      sha256: "a".repeat(64),
      media_type: "text/markdown",
      aliases: ["021_G", "G棚"],
      search_terms: ["#SHELF:021_G"]
    },
    evidence_refs: ["SRC-TEST-CURRENT-SHELF"],
    provenance_refs: []
  }];
  const { result } = driveSemanticOnly(request);
  assert.equal(result.decision, "PASS");
  assert.equal(result.pkdbInputProposal.status, "PROPOSAL_ONLY_NOT_COMMITTED");
  assert.equal(result.pkdbInputProposal.candidates[0].record_type, "SOURCE");
});

test("v0401 K03 rejects unsafe current SOURCE locator proposal", () => {
  const request = cardFixture();
  request.pkdbInputCandidates = [{
    candidate_id: "LOC-BAD", record_type: "SOURCE", semantic_key: "shelf.bad", mode: "CREATE",
    value: { source_role: "PRIMARY", locator: "../021_G_v001/secret.md", sha256: "b".repeat(64) },
    evidence_refs: ["SRC-TEST-CURRENT-SHELF"], provenance_refs: []
  }];
  const { result } = driveSemanticOnly(request);
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => (entry.code ?? entry.ruleId) === "PKDB_INPUT_SOURCE_LOCATOR_UNSAFE"));
});

test("DS90 direct PKDB commit attempt is STOP", () => {
  const request = cardFixture();
  request.pkdbCommitAttempted = true;
  const { result } = driveSemanticOnly(request);
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => ["PKDB_COMMIT_AUTHORITY_VIOLATION", "DS90_PKDB_COMMIT_FORBIDDEN"].includes(entry.code ?? entry.ruleId)));
});

test("semantic SUPERSEDE needs explicit change basis", () => {
  const request = cardFixture();
  request.pkdbInputCandidates = [{
    candidate_id: "C1", record_type: "RULE", semantic_key: "rule.x", mode: "SUPERSEDE",
    existing_record_id: "OLD", value: true, evidence_refs: ["R1"], provenance_refs: []
  }];
  const { result } = driveSemanticOnly(request);
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => ["SEMANTIC_CHANGE_BASIS_REQUIRED", "PKDB_INPUT_CHANGE_BASIS_REQUIRED"].includes(entry.code ?? entry.ruleId)));
});

test("source-address movement needs stable semantic identity and provenance update", () => {
  const request = cardFixture();
  request.pkdbInputCandidates = [{
    candidate_id: "C1", record_type: "PROVENANCE", semantic_key: "source.move", mode: "CREATE",
    value: { moved: true }, evidence_refs: ["R1"], provenance_refs: [], source_address_changed: true
  }];
  const { result } = driveSemanticOnly(request);
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => (entry.code ?? entry.ruleId) === "PROVENANCE_STABLE_IDENTITY_REQUIRED"));
  assert.ok(result.issues.some((entry) => (entry.code ?? entry.ruleId) === "PROVENANCE_UPDATE_REFS_REQUIRED"));
});

test("RUNNER / TERMINAL_AUTHORITY / REPORT_POLICY keep waiting and final decision separate", () => {
  const waiting = createRuntimeSession(cardFixture()).result;
  assert.equal(waiting.decision, null);
  assert.equal(waiting.endLog.unreflected, "HOST_ACTION_PENDING");
  assert.equal(waiting.endLog.next, "PKDB_ACCESS");
  const { result: terminal } = driveSemanticOnly(cardFixture());
  assert.equal(terminal.decision, "PASS");
  assert.equal(terminal.endLog.unreflected, "なし");
  assert.ok(terminal.endLog.notice.includes("not canon"));
});

test("BOOT state is supplied by the CORE transition authority", () => {
  const local = execute(bootFixture());
  assert.equal(local.boot, "BOOT_READY");
  const connectedRequest = cardFixture();
  connectedRequest.command = "起動";
  delete connectedRequest.operation;
  const connected = execute(connectedRequest);
  assert.equal(connected.boot, "BOOT_CONNECTED");
});

test("LOG and ARCHIVE are validation/recognition only, not persistence", () => {
  const base = cardFixture();
  const logRequest = { ...base, operation: "LOG", log: { kind: "AUDIT", source: "R1" } };
  delete logRequest.command;
  const logResult = driveSemanticOnly(logRequest).result;
  assert.equal(logResult.decision, "PASS");
  assert.equal(logResult.moduleOutput.persistencePerformed, false);
  assert.equal(logResult.persistenceAuthority, "NONE_VALIDATION_ONLY");

  const archiveRequest = { ...base, operation: "ARCHIVE", archive: { candidates: ["old"] } };
  delete archiveRequest.command;
  const archiveResult = driveSemanticOnly(archiveRequest).result;
  assert.equal(archiveResult.decision, "PASS");
  assert.equal(archiveResult.moduleOutput.persistencePerformed, false);
  assert.equal(archiveResult.moduleOutput.deletionPerformed, false);
});


test("K03 rejects BOOT proposal candidates without a completed PKDB evidence context", () => {
  const request = withAllActiveReads(bootFixture());
  request.pkdbInputCandidates = [{
    candidate_id: "BOOT_FAKE", record_type: "ASSERTION", semantic_key: "fake.boot", mode: "CREATE",
    value: true, evidence_refs: ["NONEXISTENT_SOURCE"], provenance_refs: []
  }];
  const result = execute(request);
  assert.equal(result.decision, "STOP");
  assert.equal(result.pkdbInputProposal, null);
  assert.ok(result.issues.some((entry) => (entry.code ?? entry.ruleId) === "PKDB_INPUT_EVIDENCE_CONTEXT_REQUIRED"));
});

test("K03 binds evidence_refs and provenance_refs to evidence actually delivered in this run", () => {
  for (const [field, code] of [
    ["evidence_refs", "PKDB_INPUT_EVIDENCE_REF_UNKNOWN"],
    ["provenance_refs", "PKDB_INPUT_PROVENANCE_REF_UNKNOWN"]
  ]) {
    const request = cardFixture();
    request.pkdbInputCandidates = [{
      candidate_id: `BAD_${field}`, record_type: "ASSERTION", semantic_key: `bad.${field}`, mode: "CREATE",
      value: true, evidence_refs: ["R1"], provenance_refs: []
    }];
    request.pkdbInputCandidates[0][field] = [field === "evidence_refs" ? "NO_SUCH_RECORD" : "NO_SUCH_SOURCE"];
    const { result } = driveSemanticOnly(request);
    assert.equal(result.decision, "STOP", field);
    assert.equal(result.pkdbInputProposal, null, field);
    assert.ok(result.issues.some((entry) => (entry.code ?? entry.ruleId) === code), field);
  }
});

test("SOURCE_MATERIALIZE rejects permissive or non-canonical base64 before SHA acceptance", () => {
  let { session, result } = createRuntimeSession(allowSourceFallback(cardFixture()));
  ({ session, result } = resumeRuntimeSession(session, accessDelivered(result.hostAction, { sourceIds: ["SRC1"], evidenceComplete: false, injectShelfPointer: false })));
  const emptySha = createHash("sha256").update(Buffer.alloc(0)).digest("hex");
  ({ result } = resumeRuntimeSession(session, {
    actionId: result.hostAction.actionId,
    actionType: "SOURCE_MATERIALIZE",
    packet: {
      packet_schema_version: "PKDB_SOURCE_MATERIALIZE_PACKET_v001",
      execution_id: result.hostAction.residentBinding.executionId, consumer_id: result.hostAction.residentBinding.consumerId, decision: "DELIVERED",
      snapshot: { snapshot_sha256: "a".repeat(64) }, source_bytes_transformed: false,
      db_mutation_performed: false, runtime_work_performed: false, external_service_required: false, reason_codes: [],
      item_results: [{ item_id: "S0001", required: true, state: "DELIVERED", reason_codes: [], source_record_id: "SRC1", sha256: emptySha, bytes: 0, media_type: "text/plain", bundle_object_path: `objects/${emptySha}` }]
    },
    bundleObjects: { [`objects/${emptySha}`]: "!!!" }
  }));
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => (entry.code ?? entry.ruleId) === "MATERIALIZED_SOURCE_BASE64_INVALID"));
});

test("specialist PASS requires target-specific structured proof, not a generic ref", () => {
  for (const [label, mutate, expectedCode] of [
    ["generic ref only", (action) => ({ resultKind: action.resultKind, resultRef: "x" }), "SPECIALIST_STRUCTURED_ARTIFACT_PROOF_REQUIRED"],
    ["empty artifact", (action) => ({ resultKind: action.resultKind, artifact: {} }), "SPECIALIST_ARTIFACT_KIND_MISMATCH"],
    ["wrong resultKind", (action) => ({ resultKind: "REVISION_RESULT", artifact: specialistArtifactFor(action) }), "SPECIALIST_RESULT_KIND_MISMATCH"]
  ]) {
    let { session, result } = driveSpecialist({ ...bootFixture(), command: "PW90投入" });
    const action = result.hostAction;
    ({ result } = resumeRuntimeSession(session, {
      actionId: action.actionId,
      actionType: "SPECIALIST_RUNTIME_INVOKE",
      target: "PW90",
      decision: "PASS",
      completed: true,
      ...mutate(action)
    }));
    assert.equal(result.decision, "STOP", label);
    assert.ok(result.issues.some((entry) => (entry.code ?? entry.ruleId) === expectedCode), label);
  }
});


test("Skill model is a dependency graph with only true sequential boundaries", () => {
  assert.equal(SKILL_EXECUTION_MODEL, "DEPENDENCY_GRAPH_NO_GLOBAL_SKILL_CHAIN");
  assert.deepEqual(Object.keys(SKILL_REGISTRY), [
    "K01_PKDB_ACCESS_REQUEST",
    "K02_SOURCE_MATERIALIZE_REQUEST",
    "K03_PKDB_INPUT_PROPOSAL",
    "K04_PROJECT_SHELF_READ_REQUEST",
    "R00_CURRENT_000C_DISPATCH_RESOLVE",
    "R01_SPECIALIST_DISPATCH"
  ]);
  assert.deepEqual(SKILL_REGISTRY.K02_SOURCE_MATERIALIZE_REQUEST.dependsOn, ["K01_PKDB_ACCESS_REQUEST"]);
  assert.deepEqual(SKILL_REGISTRY.K04_PROJECT_SHELF_READ_REQUEST.dependsOn, ["K01_PKDB_ACCESS_REQUEST"]);
  assert.deepEqual(SKILL_REGISTRY.R01_SPECIALIST_DISPATCH.dependsOn, ["R00_CURRENT_000C_DISPATCH_RESOLVE"]);
  assert.equal(Object.values(SKILL_REGISTRY).some((entry) => entry.ownsDecision === true), false);
});

test("normal specialist read plan excludes heavy DS90 internals; explicit fallback retains them", () => {
  assert.equal(OPERATION_READS.PACK_CUTOUT.includes("src/modules/packCutout.js"), false);
  assert.equal(OPERATION_READS.MOUNT_TRANSFER.includes("src/modules/transfer.js"), false);
  assert.equal(INTERNAL_FALLBACK_READS.PACK_CUTOUT.includes("src/modules/packCutout.js"), true);
  assert.equal(INTERNAL_FALLBACK_READS.MOUNT_TRANSFER.includes("backpacks/MOUNT_TRANSFER_BACKPACK/START_HERE.js"), true);

  const normal = buildOperationPlan("PACK_CUTOUT", {}, { tool: "SPECIALIST_DISPATCH", fallbackTool: "PACK_CUTOUT" });
  const fallback = buildOperationPlan("PACK_CUTOUT", { payload: { forceDs90MinimumRoute: true } }, { tool: "SPECIALIST_DISPATCH", fallbackTool: "PACK_CUTOUT" });
  assert.equal(normal.kind, "SPECIALIST_HOST");
  assert.equal(fallback.kind, "DS90_MINIMUM_FALLBACK");
});

test("K01 project evidence requests ACTIVE lineage as a runtime requirement", () => {
  const created = createRuntimeSession(cardFixture());
  assert.equal(created.result.hostAction.actionType, "PKDB_ACCESS");
  assert.equal(created.result.hostAction.requirements.lineageMode, "ACTIVE");
});

test("K03 SUPERSEDE target is bound to resolved current-run record, type, semantic identity and active evidence", () => {
  const record = { record_id: "R1", record_type: "RULE", logical_id: "LID-RULE-X", status: "CONFIRMED", source_refs: [], provenance_refs: ["PRV1"] };
  const request = cardFixture();
  request.pkdbInputCandidates = [{
    candidate_id: "S1", record_type: "RULE", semantic_key: "LID-RULE-X", mode: "SUPERSEDE",
    existing_record_id: "R1", approved_change_basis: "explicit approved basis", value: { changed: true },
    evidence_refs: ["R1"], provenance_refs: ["PRV1"]
  }];
  let { session, result } = createRuntimeSession(withAllActiveReads(request));
  ({ session, result } = resumeRuntimeSession(session, accessDelivered(result.hostAction, { semanticRecords: [record], resolvedRecordIds: ["R1"], provenanceIds: ["PRV1"] })));
  ({ session, result } = resumeShelfIfPending(session, result));
  assert.equal(result.decision, "PASS");
  assert.equal(result.pkdbInputProposal.candidates[0].existing_record_id, "R1");
  assert.equal(result.knowledgeEvidence.lineageMode, "ACTIVE");

  for (const [label, patch, code] of [
    ["unknown target", { existing_record_id: "NO_SUCH_RECORD" }, "PKDB_INPUT_SUPERSEDE_TARGET_NOT_EVIDENCED"],
    ["wrong type", { record_type: "ASSERTION" }, "PKDB_INPUT_SUPERSEDE_RECORD_TYPE_MISMATCH"],
    ["wrong semantic key", { semantic_key: "OTHER" }, "PKDB_INPUT_SUPERSEDE_SEMANTIC_KEY_MISMATCH"]
  ]) {
    const bad = cardFixture();
    bad.pkdbInputCandidates = [{ ...request.pkdbInputCandidates[0], ...patch }];
    let driven = createRuntimeSession(withAllActiveReads(bad));
    driven = resumeRuntimeSession(driven.session, accessDelivered(driven.result.hostAction, { semanticRecords: [record], resolvedRecordIds: ["R1"], provenanceIds: ["PRV1"] }));
    driven = resumeShelfIfPending(driven.session, driven.result);
    assert.equal(driven.result.decision, "STOP", label);
    assert.ok(driven.result.issues.some((entry) => (entry.code ?? entry.ruleId) === code), label);
  }
});

test("K03 provenance move binds old refs to evidenced provenance and new refs to delivered SOURCE evidence", () => {
  const record = { record_id: "R1", record_type: "PROVENANCE", logical_id: "LID-PRV-MOVE", status: "CONFIRMED", source_refs: ["SRC1"], provenance_refs: ["PRV1"] };
  const base = allowSourceFallback(cardFixture());
  base.pkdbInputCandidates = [{
    candidate_id: "P1", record_type: "PROVENANCE", semantic_key: "LID-PRV-MOVE", mode: "CREATE",
    value: { moved: true }, evidence_refs: ["R1"], provenance_refs: ["PRV1"], source_address_changed: true,
    stable_semantic_identity: true, provenance_update: { old_refs: ["PRV1"], new_refs: ["SRC1"] }
  }];
  let { session, result } = createRuntimeSession(withAllActiveReads(base));
  ({ session, result } = resumeRuntimeSession(session, accessDelivered(result.hostAction, { sourceIds: ["SRC1"], semanticRecords: [record], resolvedRecordIds: ["R1"], provenanceIds: ["PRV1"], injectShelfPointer: false })));
  ({ result } = resumeRuntimeSession(session, materialized(result.hostAction, "SRC1")));
  assert.equal(result.decision, "PASS");

  for (const [label, update, code] of [
    ["fake old", { old_refs: ["FAKE_OLD"], new_refs: ["SRC1"] }, "PKDB_PROVENANCE_OLD_REF_UNKNOWN"],
    ["fake new", { old_refs: ["PRV1"], new_refs: ["FAKE_NEW"] }, "PKDB_PROVENANCE_NEW_REF_UNKNOWN"],
    ["empty refs", { old_refs: [], new_refs: [] }, "PKDB_PROVENANCE_MOVE_REFS_NONEMPTY_REQUIRED"]
  ]) {
    const request = structuredClone(base);
    request.pkdbInputCandidates[0].provenance_update = update;
    let driven = createRuntimeSession(withAllActiveReads(request));
    driven = resumeRuntimeSession(driven.session, accessDelivered(driven.result.hostAction, { sourceIds: ["SRC1"], semanticRecords: [record], resolvedRecordIds: ["R1"], provenanceIds: ["PRV1"], injectShelfPointer: false }));
    driven = resumeRuntimeSession(driven.session, materialized(driven.result.hostAction, "SRC1"));
    assert.equal(driven.result.decision, "STOP", label);
    assert.ok(driven.result.issues.some((entry) => (entry.code ?? entry.ruleId) === code), label);
  }
});

test("specialist dispatch ignores request-side self-asserted route and requires trusted R00 current-000_C proof", () => {
  const request = withAllActiveReads({ ...bootFixture(), command: "ヌル投入お願いします" });
  request.knowledgeContext = { dispatch: { routes: { MOUNT_TRANSFER: { resolved: true, sha256Verified: true, path: "ATTACKER/FAKE_MT00.zip" } } } };
  let { session, result } = createRuntimeSession(request);
  assert.equal(result.hostAction.actionType, "CURRENT_000C_DISPATCH_RESOLVE");
  assert.notEqual(result.hostAction.actionType, "SPECIALIST_RUNTIME_INVOKE");
  const action = result.hostAction;
  ({ result } = resumeRuntimeSession(session, {
    ...dispatchVerified(action),
    path: "ATTACKER/FAKE_MT00.zip",
    declaredSha256: "b".repeat(64),
    actualSha256: "c".repeat(64)
  }));
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => (entry.code ?? entry.ruleId) === "SPECIALIST_DISPATCH_PROOF_SHA_MISMATCH"));
});

test("trusted media_type decides textual decoding; host cannot disable UTF-8 validation", () => {
  let { session, result } = createRuntimeSession(allowSourceFallback(cardFixture()));
  ({ session, result } = resumeRuntimeSession(session, accessDelivered(result.hostAction, { sourceIds: ["SRC1"], injectShelfPointer: false })));
  const bytes = Buffer.from([0xff, 0xfe, 0xfd]);
  const sha = createHash("sha256").update(bytes).digest("hex");
  const objectPath = `objects/${sha}`;
  ({ result } = resumeRuntimeSession(session, {
    actionId: result.hostAction.actionId,
    actionType: "SOURCE_MATERIALIZE",
    textual: false,
    packet: {
      packet_schema_version: "PKDB_SOURCE_MATERIALIZE_PACKET_v001", execution_id: result.hostAction.residentBinding.executionId, consumer_id: result.hostAction.residentBinding.consumerId,
      decision: "DELIVERED", snapshot: { snapshot_sha256: "a".repeat(64) }, source_bytes_transformed: false,
      db_mutation_performed: false, runtime_work_performed: false, external_service_required: false, reason_codes: [],
      item_results: [{ item_id: "S0001", required: true, state: "DELIVERED", reason_codes: [], source_record_id: "SRC1", sha256: sha, bytes: bytes.length, media_type: "text/markdown", bundle_object_path: objectPath }]
    },
    bundleObjects: { [objectPath]: bytes.toString("base64") }
  }));
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => (entry.code ?? entry.ruleId) === "MATERIALIZED_SOURCE_UTF8_INVALID"));
});

test("formal adapter promotes delivered SOURCE records to SOURCE_MATERIALIZE instead of treating them as semantic evidence", () => {
  const sourceRecord = {
    record_id: "SRC-TEST-001", record_type: "SOURCE", logical_id: "LID-SRC-TEST-001", status: "CONFIRMED",
    source_refs: [], provenance_refs: [], payload: { media_type: "text/plain", sha256: "d".repeat(64) }
  };
  let { session, result } = createRuntimeSession(allowSourceFallback(cardFixture()));
  ({ session, result } = resumeRuntimeSession(session, accessDelivered(result.hostAction, {
    semanticRecords: [sourceRecord], resolvedRecordIds: [sourceRecord.record_id], sourceIds: [], injectShelfPointer: false
  })));
  assert.equal(result.decision, null);
  assert.equal(result.state, "WAITING_FOR_HOST");
  assert.equal(result.hostAction.actionType, "SOURCE_MATERIALIZE");
  assert.deepEqual(result.hostAction.sourceIds, ["SRC-TEST-001"]);
});

test("resident PKDB packet adapter is the formal DS90 read boundary", () => {
  let { session, result } = createRuntimeSession(cardFixture());
  assert.equal(result.hostAction.actionType, "PKDB_ACCESS");
  ({ session, result } = resumeRuntimeSession(session, accessDelivered(result.hostAction)));
  ({ session, result } = resumeShelfIfPending(session, result));
  assert.equal(result.decision, "PASS");
  assert.equal(result.knowledgeEvidence.hostAdapter, "DS90_PKDB_HOST_ADAPTER_v002");
  assert.equal(result.knowledgeEvidence.lineageMode, "ACTIVE");
  assert.equal(result.hostAction ?? null, null);
  assert.ok(Array.isArray(result.knowledgeEvidence.resolvedRecordIds));
});

test("serialized session explicitly declares non-cryptographic host-internal integrity boundary", () => {
  const created = createRuntimeSession(cardFixture());
  assert.equal(created.session.integrityModel, "CANONICAL_REPLAY_NON_CRYPTOGRAPHIC");
  assert.equal(created.session.sessionTrustBoundary, "HOST_INTERNAL_ONLY_UNLESS_EXTERNALLY_SIGNED");
});

test("Round2: K01 snapshot A is bound into K02 resident EXACT request and snapshot B is rejected", () => {
  let { session, result } = createRuntimeSession(allowSourceFallback(cardFixture()));
  const access = accessDelivered(result.hostAction, { sourceIds: ["SRC1"], evidenceComplete: false, injectShelfPointer: false });
  access.packet.snapshot.snapshot_sha256 = "a".repeat(64);
  ({ session, result } = resumeRuntimeSession(session, access));
  assert.equal(result.hostAction.actionType, "SOURCE_MATERIALIZE");
  assert.deepEqual(result.hostAction.snapshotBinding, { mode: "EXACT", snapshotSha256: "a".repeat(64) });
  assert.deepEqual(result.hostAction.residentRequest.snapshot_binding, { mode: "EXACT", snapshot_sha256: "a".repeat(64) });
  const bad = materialized(result.hostAction, "SRC1");
  bad.packet.snapshot.snapshot_sha256 = "b".repeat(64);
  ({ result } = resumeRuntimeSession(session, bad));
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => (entry.code ?? entry.ruleId) === "SOURCE_MATERIALIZE_SNAPSHOT_MISMATCH"));
});

test("Round2: ACCESS resident authority flags are const-false enforced", () => {
  let { session, result } = createRuntimeSession(cardFixture());
  const packet = accessDelivered(result.hostAction);
  Object.assign(packet.packet, {
    project_meaning_authored_by_skill: true,
    inference_permitted: true,
    db_mutation_performed: true,
    runtime_work_performed: true,
    external_service_required: true
  });
  ({ result } = resumeRuntimeSession(session, packet));
  assert.equal(result.decision, "STOP");
  for (const code of [
    "PKDB_ACCESS_PROJECT_MEANING_AUTHORED_BY_SKILL_MUST_BE_FALSE",
    "PKDB_ACCESS_INFERENCE_PERMITTED_MUST_BE_FALSE",
    "PKDB_ACCESS_DB_MUTATION_PERFORMED_MUST_BE_FALSE",
    "PKDB_ACCESS_RUNTIME_WORK_PERFORMED_MUST_BE_FALSE",
    "PKDB_ACCESS_EXTERNAL_SERVICE_REQUIRED_MUST_BE_FALSE"
  ]) assert.ok(result.issues.some((entry) => (entry.code ?? entry.ruleId) === code), code);
});

test("Round2: MATERIALIZE resident authority and transform flags are const-false enforced", () => {
  let { session, result } = createRuntimeSession(allowSourceFallback(cardFixture()));
  ({ session, result } = resumeRuntimeSession(session, accessDelivered(result.hostAction, { sourceIds: ["SRC1"], evidenceComplete: false, injectShelfPointer: false })));
  const packet = materialized(result.hostAction, "SRC1");
  Object.assign(packet.packet, {
    source_bytes_transformed: true,
    db_mutation_performed: true,
    runtime_work_performed: true,
    external_service_required: true
  });
  ({ result } = resumeRuntimeSession(session, packet));
  assert.equal(result.decision, "STOP");
  for (const code of [
    "SOURCE_MATERIALIZE_SOURCE_BYTES_TRANSFORMED_MUST_BE_FALSE",
    "SOURCE_MATERIALIZE_DB_MUTATION_PERFORMED_MUST_BE_FALSE",
    "SOURCE_MATERIALIZE_RUNTIME_WORK_PERFORMED_MUST_BE_FALSE",
    "SOURCE_MATERIALIZE_EXTERNAL_SERVICE_REQUIRED_MUST_BE_FALSE"
  ]) assert.ok(result.issues.some((entry) => (entry.code ?? entry.ruleId) === code), code);
});

test("Round2: RESOLVED but undelivered ACCESS evidence is rejected", () => {
  let { session, result } = createRuntimeSession(cardFixture());
  const packet = accessDelivered(result.hostAction);
  packet.packet.clause_results[0].delivered_records = [];
  packet.packet.clause_results[0].delivery_count = 0;
  ({ result } = resumeRuntimeSession(session, packet));
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => (entry.code ?? entry.ruleId) === "PKDB_ACCESS_RESOLVED_RECORD_NOT_DELIVERED"));
});

test("Round2: resident execution_id and consumer_id are bound to the pending action", () => {
  let { session, result } = createRuntimeSession(cardFixture());
  const packet = accessDelivered(result.hostAction);
  packet.packet.execution_id = "AS-OTHER-RUN";
  packet.packet.consumer_id = "OTHER_CONSUMER";
  ({ result } = resumeRuntimeSession(session, packet));
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => (entry.code ?? entry.ruleId) === "PKDB_ACCESS_EXECUTION_ID_MISMATCH"));
  assert.ok(result.issues.some((entry) => (entry.code ?? entry.ruleId) === "PKDB_ACCESS_CONSUMER_ID_MISMATCH"));
});

test("Round2: ACCESS delivery_count must equal delivered_records length", () => {
  let { session, result } = createRuntimeSession(cardFixture());
  const packet = accessDelivered(result.hostAction);
  packet.packet.clause_results[0].delivery_count = 999;
  ({ result } = resumeRuntimeSession(session, packet));
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => (entry.code ?? entry.ruleId) === "PKDB_ACCESS_DELIVERY_COUNT_MISMATCH"));
});

test("v0401 standard: schema-legal current-mount SOURCE locator drives K04 shelf read", () => {
  let { session, result } = createRuntimeSession(cardFixture());
  ({ session, result } = resumeRuntimeSession(session, accessDelivered(result.hostAction)));
  assert.equal(result.hostAction.actionType, "SHELF_READ");
  assert.equal(result.hostAction.items[0].shelfPointer, "021_G_v001/30_CURRENT/TEST_SOURCE.md");
  ({ result } = resumeRuntimeSession(session, shelfReadDelivered(result.hostAction)));
  assert.equal(result.decision, "PASS");
  assert.equal(result.knowledgeEvidence.evidenceRoute, "CURRENT_SHELF_LOCATOR");
  assert.equal(result.knowledgeEvidence.currentShelfIsAuthority, true);
});

test("v0401 negative: legacy archive SOURCE locator is not elevated to current shelf authority", () => {
  let { session, result } = createRuntimeSession(cardFixture());
  const record = {
    record_id: "SRC-LEGACY-FIXTURE", record_type: "SOURCE", logical_id: "LID-SRC-LEGACY-FIXTURE", status: "CONFIRMED",
    revision: 1, scope: { kind: "GLOBAL", dimensions: [] }, source_refs: [], provenance_refs: [],
    aliases: ["legacy"], search_terms: ["#TEST:CARD"], preservation: ["SOURCE_LINK"], supersedes_refs: [],
    payload: { source_role: "SECONDARY", locator: "legacy-archive://021_G_v000.zip!/item.md", sha256: "c".repeat(64), media_type: "text/markdown" }
  };
  ({ result } = resumeRuntimeSession(session, accessDelivered(result.hostAction, {
    semanticRecords: [record], resolvedRecordIds: [record.record_id], injectShelfPointer: false
  })));
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => (entry.code ?? entry.ruleId) === "PKDB_LOOKUP_NO_CURRENT_SHELF_POINTER"));
});

test("v0401 negative: PKDB locator without current shelf pointer cannot complete project design", () => {
  let { session, result } = createRuntimeSession(cardFixture());
  const record = { record_id: "R-NO-PTR", record_type: "ASSERTION", logical_id: "R-NO-PTR", status: "CONFIRMED", source_refs: [], provenance_refs: [] };
  ({ result } = resumeRuntimeSession(session, accessDelivered(result.hostAction, {
    semanticRecords: [record], resolvedRecordIds: [record.record_id], injectShelfPointer: false
  })));
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => (entry.code ?? entry.ruleId) === "PKDB_LOOKUP_NO_CURRENT_SHELF_POINTER"));
});

test("v0401 negative: archive/traversal shelf locator cannot masquerade as current project source", () => {
  for (const pointer of ["legacy-archive://021_G/item", "../021_G/30_CURRENT/item.md"]) {
    let { session, result } = createRuntimeSession(cardFixture());
    const record = {
      record_id: "R-BAD-PTR", record_type: "ASSERTION", logical_id: "R-BAD-PTR", status: "CONFIRMED",
      payload: { shelf_id: "021_G", shelf_pointer: pointer }, source_refs: [], provenance_refs: []
    };
    ({ result } = resumeRuntimeSession(session, accessDelivered(result.hostAction, {
      semanticRecords: [record], resolvedRecordIds: [record.record_id], injectShelfPointer: false
    })));
    assert.equal(result.decision, "STOP", pointer);
    assert.ok(result.issues.some((entry) => ["SHELF_POINTER_UNSAFE", "SHELF_POINTER_ARCHIVE_LOCATOR_FORBIDDEN"].includes(entry.code ?? entry.ruleId)), pointer);
  }
});

test("v0401 negative: SHELF_READ cannot return an unrequested path", () => {
  let { session, result } = createRuntimeSession(cardFixture());
  ({ session, result } = resumeRuntimeSession(session, accessDelivered(result.hostAction)));
  assert.equal(result.hostAction.actionType, "SHELF_READ");
  const packet = shelfReadDelivered(result.hostAction);
  packet.reads[0].shelfPointer = "021_G/30_CURRENT/ATTACKER.md";
  ({ result } = resumeRuntimeSession(session, packet));
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => (entry.code ?? entry.ruleId) === "SHELF_READ_UNREQUESTED_PATH"));
});

test("v0401 negative: SHELF_READ locator-record SHA binding rejects self-consistent wrong bytes", () => {
  let { session, result } = createRuntimeSession(cardFixture());
  ({ session, result } = resumeRuntimeSession(session, accessDelivered(result.hostAction)));
  assert.equal(result.hostAction.actionType, "SHELF_READ");
  const packet = shelfReadDelivered(result.hostAction, "different but self-consistent current shelf bytes\n");
  ({ result } = resumeRuntimeSession(session, packet));
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => (entry.code ?? entry.ruleId) === "SHELF_READ_LOCATOR_SHA_MISMATCH"));
});

test("v0401 negative: SHELF_READ bytes are SHA-bound and transformed bytes are rejected", () => {
  for (const mutation of ["sha", "transform"]) {
    let { session, result } = createRuntimeSession(cardFixture());
    ({ session, result } = resumeRuntimeSession(session, accessDelivered(result.hostAction)));
    const packet = shelfReadDelivered(result.hostAction);
    if (mutation === "sha") packet.reads[0].sha256 = "0".repeat(64);
    else packet.reads[0].transformed = true;
    ({ result } = resumeRuntimeSession(session, packet));
    assert.equal(result.decision, "STOP", mutation);
    const expected = mutation === "sha" ? "SHELF_READ_SHA_MISMATCH" : "SHELF_READ_TRANSFORM_FORBIDDEN";
    assert.ok(result.issues.some((entry) => (entry.code ?? entry.ruleId) === expected), mutation);
  }
});

test("v0401 negative: SOURCE materialize is not silently used when fallback was not explicitly enabled", () => {
  let { session, result } = createRuntimeSession(cardFixture());
  ({ result } = resumeRuntimeSession(session, accessDelivered(result.hostAction, {
    sourceIds: ["SRC1"], evidenceComplete: false, injectShelfPointer: false
  })));
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => (entry.code ?? entry.ruleId) === "PKDB_LOOKUP_NO_CURRENT_SHELF_POINTER"));
  assert.equal(result.hostAction ?? null, null);
});


test("v0405 runtime session identity matches package and active manifest", () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  const manifest = JSON.parse(readFileSync(new URL("../updated_manifest.json", import.meta.url), "utf8"));
  assert.equal(DS90_RUNTIME_VERSION, pkg.name);
  assert.equal(manifest.version, "v0405");
  assert.match(manifest.runtime, /DS90_v0405_/);
  const { session } = createRuntimeSession(bootFixture());
  assert.equal(session.runtimeVersion, pkg.name);
});

test("v0403 common operation template V2 replaces the old active V1 route", () => {
  const template = new URL("../assets/templates/COMMON_OPERATION_TEMPLATE_V2.md", import.meta.url);
  assert.equal(existsSync(template), true);
  const legacyPointer = new URL("../assets/operation_mount/COMMON_OPERATION_TEMPLATE_V1.md", import.meta.url);
  assert.equal(existsSync(legacyPointer), true);
  assert.match(readFileSync(legacyPointer, "utf8"), /RETIRED_COMPATIBILITY_POINTER/);
  assert.deepEqual(OPTIONAL_REFERENCE_ROUTES.EXTERNAL_CONTEXT_SETUP, ["assets/templates/COMMON_OPERATION_TEMPLATE_V2.md"]);
  assert.equal(INTERNAL_FALLBACK_READS.MOUNT_TRANSFER.includes("assets/templates/COMMON_OPERATION_TEMPLATE_V2.md"), true);
});

test("v0403 904 quality bundle is lookup-only and legacy packs are not auto-read", () => {
  const base = new URL("../assets/dsgn_infra/03_REFERENCE/quality/904_小説制作絶対指針/", import.meta.url);
  assert.equal(existsSync(new URL("CURRENT_READ_FIRST.md", base)), true);
  assert.equal(existsSync(new URL("【絶対指針】.txt", base)), true);
  assert.equal(existsSync(new URL("029_w_001_050_v0033_20260402_redeliver.zip", base)), true);
  const allReads = new Set([...ALWAYS_READ, ...Object.values(INTERNAL_FALLBACK_READS).flat()]);
  for (const p of allReads) assert.equal(p.includes("904_小説制作絶対指針"), false);
});

test("v0403 current card-pack reference matches artifact-based PW90 handoff semantics", () => {
  const template = readFileSync(new URL("../assets/templates/COMMON_OPERATION_TEMPLATE_V2.md", import.meta.url), "utf8");
  assert.match(template, /話カードは論理成果物/);
  assert.match(template, /話パックはPW90へ渡すZIP artifact/);
  assert.match(template, /PW90最低受領条件ではない/);
  const base = new URL("../assets/dsgn_infra/03_REFERENCE/quality/904_小説制作絶対指針/", import.meta.url);
  const current = readFileSync(new URL("CURRENT_CARD_PACK_MODEL_20260818.md", base), "utf8");
  assert.match(current, /話カード = 論理成果物/);
  assert.match(current, /話パック = PW90へ渡すZIP artifact/);
  assert.match(current, /未分類残渣/);
});


test("v0403 v28 sync: designer active layer canon is v28 and v21 stays lineage-only", () => {
  const canon = readFileSync(new URL("../assets/dsgn_infra/02_CANON/layer/layer_runtime_v28_ai_native_complete_candidate.md", import.meta.url), "utf8");
  assert.match(canon, /STATUS: ACTIVE_CANONICAL_WITH_ALL_ITEM_MEANING_AND_PRESET_REFERENCE/);
  assert.match(canon, /embedding_rules_for_character_design/);
  assert.match(canon, /embedding_rules_for_world_axis/);
  const template = readFileSync(new URL("../assets/templates/COMMON_OPERATION_TEMPLATE_V2.md", import.meta.url), "utf8");
  assert.match(template, /現行話レイヤー実行基準はv28/);
  assert.match(template, /v21は基準系譜参照/);
  assert.match(template, /CHARACTER\/WORLD embed/);
  const quality = readFileSync(new URL("../assets/dsgn_infra/03_REFERENCE/quality/904_小説制作絶対指針/CURRENT_CARD_PACK_MODEL_20260818.md", import.meta.url), "utf8");
  assert.match(quality, /ACTIVE実行基準は `layer_runtime_v28_ai_native_complete_candidate\.md`/);
  assert.match(quality, /CHARACTER_LAYER_EMBED/);
  assert.match(quality, /WORLD_LAYER_EMBED/);
});
