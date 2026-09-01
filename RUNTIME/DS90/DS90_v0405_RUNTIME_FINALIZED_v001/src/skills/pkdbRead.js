import {
  adaptPkdbAccessHostResult, adaptPkdbMaterializeHostResult, isTrustedTextualMediaType,
  residentBindingFor, buildResidentAccessRequest, buildResidentMaterializeRequest, DS90_PKDB_HOST_ADAPTER_SCHEMA
} from "../adapters/pkdbHostAdapter.js";
import { buildPkdbTagClauses } from "../indexing/searchEngine.js";
import { createHash } from "node:crypto";

const PROJECT_KNOWLEDGE_OPERATIONS = Object.freeze(new Set([
  "CHECK", "TAG_SEARCH", "CARD", "CARD_TEST", "LOG", "ARCHIVE",
  "SINGLE_EPISODE_PROFILE_GATE", "EPISODE_PACK"
]));

const issue = (code, path, message) => ({ code, path, message, decision: "STOP", nonOverrideable: true });

function uniq(values) {
  return [...new Set((values ?? []).filter((value) => typeof value === "string" && value.trim() !== ""))];
}

function collectExplicitRefs(value, out = []) {
  if (value == null) return out;
  if (Array.isArray(value)) {
    value.forEach((entry) => collectExplicitRefs(entry, out));
    return out;
  }
  if (typeof value !== "object") return out;
  for (const [key, child] of Object.entries(value)) {
    if (["pkdbRecordId", "pkdb_record_id", "sourceId", "source_id"].includes(key) && typeof child === "string") {
      out.push(child);
    } else if (["pkdbRecordIds", "pkdb_record_ids", "sourceIds", "source_ids", "sourceRefs", "source_refs"].includes(key) && Array.isArray(child)) {
      child.forEach((entry) => { if (typeof entry === "string") out.push(entry); });
    } else {
      collectExplicitRefs(child, out);
    }
  }
  return out;
}

export function operationNeedsProjectKnowledge(operation, request) {
  return request?.externalContext?.present === true && PROJECT_KNOWLEDGE_OPERATIONS.has(operation);
}

export function buildKnowledgeRequirements(operation, request) {
  const supplied = request?.knowledgeRequest ?? {};
  if (Array.isArray(supplied.residentClauses) && supplied.residentClauses.length > 0) {
    return {
      issues: [], operation, residentClauses: structuredClone(supplied.residentClauses),
      explicitRefs: uniq(supplied.explicitRefs ?? collectExplicitRefs(request)),
      source: "REQUEST_EXPLICIT_RESIDENT_QUERY_PLAN", noImplicitLocatorMeaning: true, lineageMode: "ACTIVE"
    };
  }
  const fullRecordRequired = Array.isArray(request?.pkdbInputCandidates) && request.pkdbInputCandidates.length > 0;
  const intentSource = operation === "TAG_SEARCH"
    ? { ...(request?.search ?? {}), ...(fullRecordRequired ? { projectionMode: "FULL_RECORD" } : {}) }
    : { intents: supplied.intents, deliveryLimit: supplied.deliveryLimit, projectionMode: fullRecordRequired ? "FULL_RECORD" : supplied.projectionMode };
  const planned = buildPkdbTagClauses(intentSource ?? {});
  return {
    issues: planned.issues.map((entry) => issue(entry.code, entry.path, entry.message)),
    operation,
    residentClauses: planned.clauses,
    explicitRefs: uniq(supplied.explicitRefs ?? collectExplicitRefs(request)),
    source: "DS90_INDEX_SEARCH_MACHINE_INTENT_BUILDER",
    noImplicitLocatorMeaning: true,
    lineageMode: "ACTIVE"
  };
}

export function buildPkdbAccessAction(operation, request, makeActionId) {
  const requirements = buildKnowledgeRequirements(operation, request);
  if (requirements.issues.length > 0) return { issues: requirements.issues, action: null };
  const actionId = makeActionId("PKDB_ACCESS");
  const residentBinding = residentBindingFor("PKDB_ACCESS", actionId, { mode: "CURRENT" });
  const action = {
    actionId,
    actionType: "PKDB_ACCESS",
    skillId: "K01_PKDB_ACCESS_REQUEST",
    dependency: "PKDB_ACCESS_SKILL",
    lookupAuthority: "DS90_INDEX_SEARCH",
    contentAuthority: "CURRENT_PROJECT_SHELF_NOT_PKDB_RECORD",
    requirements,
    residentBinding,
    residentRequestContract: {
      adapter: DS90_PKDB_HOST_ADAPTER_SCHEMA,
      requestSchema: "PKDB_ACCESS_REQUEST_v001",
      executionId: residentBinding.executionId,
      consumerId: residentBinding.consumerId,
      snapshotBinding: structuredClone(residentBinding.snapshotBinding),
      queryMeaningAuthority: "EXPLICIT_QUERY_PLAN_ONLY_NO_ACCESS_SKILL_INFERENCE"
    },
    expectedResult: {
      adapter: DS90_PKDB_HOST_ADAPTER_SCHEMA,
      packetSchema: "PKDB_DELIVERY_PACKET_v001",
      transport: "resident PKDB ACCESS packet bound to this action's execution/consumer identity",
      decision: "DELIVERED_OR_BLOCKED"
    }
  };
  const resident = buildResidentAccessRequest(action, requirements.residentClauses);
  action.residentRequest = resident.request;
  action.residentRequestIssues = resident.issues;
  return { issues: resident.issues, action: resident.issues.length === 0 ? action : null };
}

export function validatePkdbAccessResult(action, result) {
  const adapted = adaptPkdbAccessHostResult(action, result);
  const issues = [...adapted.issues];
  const normalized = adapted.normalized;
  if (normalized == null) return { issues, blocked: false, normalized: null };
  if (normalized.decision === "BLOCKED") {
    issues.push(issue("PKDB_ACCESS_BLOCKED", "hostResult.decision", "required PKDB tag/pointer lookup could not be resolved"));
    return { issues, blocked: true, normalized };
  }
  if (normalized.requiredClausesSatisfied !== true) {
    issues.push(issue("PKDB_REQUIRED_CLAUSE_UNSATISFIED", "hostResult.requiredClausesSatisfied", "required PKDB lookup clauses are not fully satisfied"));
  }
  if (normalized.ambiguous === true || (Array.isArray(normalized.conflicts) && normalized.conflicts.length > 0)) {
    issues.push(issue("PKDB_LOOKUP_AMBIGUOUS", "hostResult", "ambiguous/conflicting PKDB locator records cannot select project source"));
  }
  if (normalized.requiredIntersectionEmpty === true) {
    issues.push(issue("PKDB_REQUIRED_AND_EMPTY", "hostResult", "required PKDB lookup clauses were individually resolved but their AND intersection is empty"));
  }
  if (!Array.isArray(normalized.semanticRecords)) {
    issues.push(issue("PKDB_LOCATOR_RECORDS_INVALID", "hostResult.semanticRecords", "locator records must be an array"));
  }
  return { issues, blocked: false, normalized };
}

export function buildSourceMaterializeAction(accessResult, makeActionId) {
  const sourceIds = uniq(accessResult?.sourceIds ?? []);
  const snapshotSha256 = accessResult?.snapshot?.snapshot_sha256;
  const actionId = makeActionId("SOURCE_MATERIALIZE");
  const residentBinding = residentBindingFor("SOURCE_MATERIALIZE", actionId, { mode: "EXACT", snapshotSha256 });
  const action = {
    actionId,
    actionType: "SOURCE_MATERIALIZE",
    skillId: "K02_SOURCE_MATERIALIZE_REQUEST",
    dependency: "PKDB_SOURCE_MATERIALIZE_SKILL",
    sourceIds,
    routeRole: "EXPLICIT_FALLBACK_ONLY_NOT_STANDARD_V0400_PROJECT_SOURCE_ROUTE",
    snapshotPolicy: "EXACT_SOURCE_IDS_ONLY",
    snapshotBinding: { mode: "EXACT", snapshotSha256 },
    residentBinding,
    expectedResult: {
      adapter: DS90_PKDB_HOST_ADAPTER_SCHEMA,
      packetSchema: "PKDB_SOURCE_MATERIALIZE_PACKET_v001",
      transport: "resident materialize packet plus bundleObjects keyed by bundle_object_path",
      decision: "DELIVERED_OR_BLOCKED"
    }
  };
  const residentRequestBuilt = buildResidentMaterializeRequest(action);
  action.residentRequest = residentRequestBuilt.request;
  action.residentRequestIssues = residentRequestBuilt.issues;
  return action;
}

function decodeAndVerifySource(record) {
  const issues = [];
  if (typeof record?.sourceId !== "string" || record.sourceId.trim() === "") {
    issues.push(issue("MATERIALIZED_SOURCE_ID_MISSING", "hostResult.sources[].sourceId", "materialized sourceId is required"));
    return { issues };
  }
  if (typeof record?.contentBase64 !== "string" || record.contentBase64 === "") {
    issues.push(issue("MATERIALIZED_SOURCE_BYTES_MISSING", `hostResult.sources.${record.sourceId}`, "materialized source bytes must be returned as base64"));
    return { issues };
  }
  const base64 = record.contentBase64;
  const canonicalBase64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  if (base64.length % 4 !== 0 || !canonicalBase64.test(base64)) {
    issues.push(issue("MATERIALIZED_SOURCE_BASE64_INVALID", `hostResult.sources.${record.sourceId}`, "materialized source base64 must be canonical RFC 4648 base64 without ignored characters or whitespace"));
    return { issues };
  }
  let bytes;
  try { bytes = Buffer.from(base64, "base64"); }
  catch {
    issues.push(issue("MATERIALIZED_SOURCE_BASE64_INVALID", `hostResult.sources.${record.sourceId}`, "materialized source base64 is invalid"));
    return { issues };
  }
  if (bytes.toString("base64") !== base64) {
    issues.push(issue("MATERIALIZED_SOURCE_BASE64_NONCANONICAL", `hostResult.sources.${record.sourceId}`, "materialized source base64 must round-trip canonically"));
    return { issues };
  }
  const actualSha = createHash("sha256").update(bytes).digest("hex");
  if (Number.isInteger(record?.declaredBytes) && record.declaredBytes !== bytes.length) {
    issues.push(issue("MATERIALIZED_SOURCE_BYTE_LENGTH_MISMATCH", `hostResult.sources.${record.sourceId}.declaredBytes`, "materialized source byte length mismatch"));
  }
  if (typeof record?.sha256 !== "string" || record.sha256 !== actualSha) {
    issues.push(issue("MATERIALIZED_SOURCE_SHA_MISMATCH", `hostResult.sources.${record.sourceId}.sha256`, "materialized source SHA-256 mismatch"));
  }
  let utf8Text = null;
  const textual = isTrustedTextualMediaType(record?.mediaType);
  if (textual) {
    try { utf8Text = new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
    catch { issues.push(issue("MATERIALIZED_SOURCE_UTF8_INVALID", `hostResult.sources.${record.sourceId}`, "textual materialized source is not valid UTF-8")); }
  }
  return { issues, evidence: { sourceId: record.sourceId, sha256: actualSha, byteLength: bytes.length, textual, utf8Read: textual ? utf8Text != null : null, text: utf8Text } };
}

export function validateMaterializeResult(action, result) {
  const adapted = adaptPkdbMaterializeHostResult(action, result);
  const issues = [...adapted.issues];
  const normalized = adapted.normalized;
  if (normalized == null) return { issues, evidence: [] };
  if (normalized.decision === "BLOCKED") {
    issues.push(issue("SOURCE_MATERIALIZE_BLOCKED", "hostResult.decision", "required SOURCE bytes could not be materialized"));
    return { issues, evidence: [] };
  }
  if (normalized.decision !== "DELIVERED" || !Array.isArray(normalized.sources)) {
    issues.push(issue("SOURCE_MATERIALIZE_RESULT_INVALID", "hostResult", "materialize result must be DELIVERED with exact bundle objects"));
    return { issues, evidence: [] };
  }
  const expectedSnapshotSha = action?.snapshotBinding?.snapshotSha256;
  if (typeof expectedSnapshotSha !== "string" || normalized?.snapshot?.snapshot_sha256 !== expectedSnapshotSha) {
    issues.push(issue("SOURCE_MATERIALIZE_SNAPSHOT_MISMATCH", "hostResult.snapshot", "materialize result must use the exact K01 snapshot bound into K02"));
  }
  const requested = new Set(action.sourceIds);
  const delivered = new Set();
  const evidence = [];
  for (const record of normalized.sources) {
    const checked = decodeAndVerifySource(record);
    issues.push(...checked.issues);
    if (checked.evidence) { delivered.add(checked.evidence.sourceId); evidence.push(checked.evidence); }
  }
  for (const sourceId of requested) if (!delivered.has(sourceId)) issues.push(issue("SOURCE_MATERIALIZE_REQUIRED_SOURCE_MISSING", "hostResult.sources", `${sourceId} was not materialized`));
  for (const sourceId of delivered) if (!requested.has(sourceId)) issues.push(issue("SOURCE_MATERIALIZE_UNREQUESTED_SOURCE", "hostResult.sources", `${sourceId} was not requested`));
  return { issues, evidence };
}

export function buildKnowledgeEvidence(accessResult, { shelfPointers = [], shelfReads = [], materializedEvidence = [], route = "CURRENT_SHELF_LOCATOR" } = {}) {
  const shelfComplete = route === "CURRENT_SHELF_LOCATOR" && shelfPointers.length > 0 && shelfReads.length === shelfPointers.length;
  const sourceComplete = route === "SOURCE_MATERIALIZE_FALLBACK" && (accessResult.sourceIds?.length ?? 0) > 0 && materializedEvidence.length === accessResult.sourceIds.length;
  return {
    accessDelivered: true,
    requiredClausesSatisfied: accessResult.requiredClausesSatisfied === true,
    semanticRecords: structuredClone(accessResult.semanticRecords ?? []),
    resolvedRecordIds: [...(accessResult.resolvedRecordIds ?? [])],
    sourceIds: [...(accessResult.sourceIds ?? [])],
    provenanceIds: [...(accessResult.provenanceIds ?? [])],
    shelfPointers: structuredClone(shelfPointers),
    shelfReads: structuredClone(shelfReads),
    materializedSources: structuredClone(materializedEvidence),
    snapshot: structuredClone(accessResult.snapshot ?? null),
    lineageMode: accessResult.lineageMode ?? "ACTIVE",
    hostAdapter: accessResult.adapterSchema ?? DS90_PKDB_HOST_ADAPTER_SCHEMA,
    evidenceRoute: route,
    tagRecordsAreAuthority: false,
    currentShelfIsAuthority: route === "CURRENT_SHELF_LOCATOR",
    shelfBytesActuallyRead: shelfComplete && shelfReads.every((entry) => entry.textual === false || entry.utf8Read === true),
    sourceBytesActuallyRead: sourceComplete && materializedEvidence.every((entry) => entry.textual === false || entry.utf8Read === true),
    evidenceComplete: shelfComplete || sourceComplete
  };
}
