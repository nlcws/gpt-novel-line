import { createHash } from "node:crypto";

const ADAPTER_SCHEMA = "DS90_PKDB_HOST_ADAPTER_v002";
const ACCESS_PACKET_SCHEMA = "PKDB_DELIVERY_PACKET_v001";
const MATERIALIZE_PACKET_SCHEMA = "PKDB_SOURCE_MATERIALIZE_PACKET_v001";
const ACCESS_REQUEST_SCHEMA = "PKDB_ACCESS_REQUEST_v001";
const MATERIALIZE_REQUEST_SCHEMA = "PKDB_SOURCE_MATERIALIZE_REQUEST_v001";
const DEFAULT_CONSUMER_ID = "DS90_RUNTIME";

const issue = (code, path, message) => ({ code, path, message, decision: "STOP", nonOverrideable: true });

function uniq(values) {
  return [...new Set((values ?? []).filter((value) => typeof value === "string" && value.trim() !== ""))];
}

function packetOf(result) {
  return result?.packet && typeof result.packet === "object" ? result.packet : result;
}

function recordIdOf(record) {
  return record?.record_id ?? record?.recordId ?? record?.id ?? null;
}

function recordTypeOf(record) {
  return record?.record_type ?? record?.recordType ?? null;
}

function projectedRecordOf(delivered) {
  const rid = delivered?.record_id ?? null;
  const mode = delivered?.projection_mode;
  const data = delivered?.data;
  if (mode === "FULL_RECORD" && data && typeof data === "object" && !Array.isArray(data)) {
    const out = { ...structuredClone(data) };
    if (rid && recordIdOf(out) == null) out.record_id = rid;
    return out;
  }
  if (mode === "PAYLOAD_ONLY" && data && typeof data === "object" && !Array.isArray(data)) {
    return {
      record_id: rid,
      record_type: "SOURCE",
      payload: structuredClone(data),
      source_refs: [],
      provenance_refs: [],
      aliases: [],
      search_terms: []
    };
  }
  if (mode === "JSON_POINTERS" && Array.isArray(data)) {
    const out = { record_id: rid, source_refs: [], provenance_refs: [], aliases: [], search_terms: [] };
    for (const item of data) {
      const pointer = item?.pointer;
      const value = structuredClone(item?.value);
      if (pointer === "/record_type") out.record_type = value;
      else if (pointer === "/status") out.status = value;
      else if (pointer === "/logical_id") out.logical_id = value;
      else if (pointer === "/aliases") out.aliases = value;
      else if (pointer === "/search_terms") out.search_terms = value;
      else if (pointer === "/source_refs") out.source_refs = value;
      else if (pointer === "/provenance_refs") out.provenance_refs = value;
      else if (typeof pointer === "string" && pointer.startsWith("/payload/")) {
        out.payload ??= {};
        const key = pointer.slice("/payload/".length);
        if (!key.includes("/")) out.payload[key] = value;
      }
    }
    return out;
  }
  return null;
}

function stableActionToken(actionId) {
  return createHash("sha256").update(String(actionId ?? "")).digest("hex").slice(0, 20).toUpperCase();
}

export function residentBindingFor(actionType, actionId, snapshotBinding = { mode: "CURRENT" }, consumerId = DEFAULT_CONSUMER_ID) {
  const prefix = actionType === "SOURCE_MATERIALIZE" ? "SM" : "AS";
  return {
    executionId: `${prefix}-DS90-${stableActionToken(actionId)}`,
    consumerId,
    snapshotBinding: structuredClone(snapshotBinding)
  };
}

function validateResidentBinding(action, packet, prefix) {
  const issues = [];
  const binding = action?.residentBinding;
  if (!binding || typeof binding !== "object") {
    issues.push(issue(`${prefix}_RESIDENT_BINDING_MISSING`, "hostAction.residentBinding", "pending DS90 action must bind resident execution/consumer identity"));
    return issues;
  }
  if (packet?.execution_id !== binding.executionId) {
    issues.push(issue(`${prefix}_EXECUTION_ID_MISMATCH`, "hostResult.packet.execution_id", "resident packet execution_id does not match the pending DS90 action"));
  }
  if (packet?.consumer_id !== binding.consumerId) {
    issues.push(issue(`${prefix}_CONSUMER_ID_MISMATCH`, "hostResult.packet.consumer_id", "resident packet consumer_id does not match the pending DS90 action"));
  }
  return issues;
}

function validateSnapshotObject(snapshot, prefix) {
  const issues = [];
  const sha = snapshot?.snapshot_sha256;
  if (typeof sha !== "string" || !/^[0-9a-f]{64}$/.test(sha)) {
    issues.push(issue(`${prefix}_SNAPSHOT_INVALID`, "hostResult.packet.snapshot.snapshot_sha256", "resident packet snapshot_sha256 must be lowercase 64-hex"));
  }
  return issues;
}

function validateFalseFlags(packet, fields, prefix) {
  const issues = [];
  for (const field of fields) {
    if (packet?.[field] !== false) {
      issues.push(issue(`${prefix}_${field.toUpperCase()}_MUST_BE_FALSE`, `hostResult.packet.${field}`, `${field} must be false under the resident PKDB non-authoring/non-mutation contract`));
    }
  }
  return issues;
}

function validateAccessClause(clause, index) {
  const issues = [];
  const path = `hostResult.packet.clause_results[${index}]`;
  if (!clause || typeof clause !== "object" || Array.isArray(clause)) {
    issues.push(issue("PKDB_ACCESS_CLAUSE_INVALID", path, "resident ACCESS clause result must be an object"));
    return issues;
  }
  if (!Array.isArray(clause.delivered_records)) {
    issues.push(issue("PKDB_ACCESS_DELIVERED_RECORDS_INVALID", `${path}.delivered_records`, "delivered_records must be an array"));
    return issues;
  }
  if (!Number.isInteger(clause.delivery_count) || clause.delivery_count !== clause.delivered_records.length) {
    issues.push(issue("PKDB_ACCESS_DELIVERY_COUNT_MISMATCH", `${path}.delivery_count`, "delivery_count must exactly equal delivered_records.length"));
  }
  if (clause.state === "DELIVERED") {
    const rr = clause.resolution_result;
    if (!rr || typeof rr !== "object" || !["RESOLVED", "RESOLVED_SET"].includes(rr.outcome)) {
      issues.push(issue("PKDB_ACCESS_DELIVERED_RESOLUTION_INVALID", `${path}.resolution_result`, "DELIVERED clause requires RESOLVED or RESOLVED_SET resolution_result"));
    } else {
      const resolved = uniq(rr.resolved_record_ids);
      const deliveredIds = new Set(clause.delivered_records.map((entry) => entry?.record_id).filter(Boolean));
      for (const rid of resolved) {
        if (!deliveredIds.has(rid)) {
          issues.push(issue("PKDB_ACCESS_RESOLVED_RECORD_NOT_DELIVERED", `${path}.delivered_records`, `${rid} was resolved but not delivered by the resident ACCESS packet`));
        }
      }
    }
  }
  return issues;
}

export function buildResidentAccessRequest(action, residentClauses, { snapshotBinding = null } = {}) {
  const clauses = structuredClone(residentClauses ?? []);
  if (!Array.isArray(clauses) || clauses.length === 0) {
    return { issues: [issue("PKDB_ACCESS_RESIDENT_QUERY_PLAN_REQUIRED", "residentClauses", "bidirectional adapter requires explicit resident query clauses; DS90 does not invent PKDB query meaning")], request: null };
  }
  const binding = action?.residentBinding ?? residentBindingFor("PKDB_ACCESS", action?.actionId, snapshotBinding ?? { mode: "CURRENT" });
  return {
    issues: [],
    request: {
      request_schema_version: ACCESS_REQUEST_SCHEMA,
      execution_id: binding.executionId,
      consumer_id: binding.consumerId,
      snapshot_binding: structuredClone(snapshotBinding ?? binding.snapshotBinding ?? { mode: "CURRENT" }),
      clauses
    }
  };
}

export function buildResidentMaterializeRequest(action) {
  const binding = action?.residentBinding;
  const sourceIds = uniq(action?.sourceIds);
  const issues = [];
  if (!binding || typeof binding !== "object") {
    issues.push(issue("SOURCE_MATERIALIZE_RESIDENT_BINDING_MISSING", "hostAction.residentBinding", "pending K02 action must bind resident identity"));
  }
  if (binding?.snapshotBinding?.mode !== "EXACT" || typeof binding?.snapshotBinding?.snapshotSha256 !== "string" || !/^[0-9a-f]{64}$/.test(binding.snapshotBinding.snapshotSha256)) {
    issues.push(issue("SOURCE_MATERIALIZE_EXACT_SNAPSHOT_REQUIRED", "hostAction.residentBinding.snapshotBinding", "K02 resident request must be bound to the exact K01 snapshot SHA"));
  }
  if (sourceIds.length === 0) {
    issues.push(issue("SOURCE_MATERIALIZE_SOURCE_IDS_REQUIRED", "hostAction.sourceIds", "K02 resident request requires at least one SOURCE ID"));
  }
  if (issues.length > 0) return { issues, request: null };
  return {
    issues: [],
    request: {
      request_schema_version: MATERIALIZE_REQUEST_SCHEMA,
      execution_id: binding.executionId,
      consumer_id: binding.consumerId,
      snapshot_binding: { mode: "EXACT", snapshot_sha256: binding.snapshotBinding.snapshotSha256 },
      items: sourceIds.map((sourceId, index) => ({ item_id: `S${String(index + 1).padStart(4, "0")}`, required: true, source_record_id: sourceId }))
    }
  };
}

export function adaptPkdbAccessHostResult(action, result) {
  const issues = [];
  if (result?.actionId !== action.actionId || result?.actionType !== "PKDB_ACCESS") {
    issues.push(issue("PKDB_ACCESS_RESULT_ACTION_MISMATCH", "hostResult", "PKDB ACCESS host result does not match the pending action"));
    return { issues, normalized: null };
  }
  const packet = packetOf(result);
  if (packet?.packet_schema_version !== ACCESS_PACKET_SCHEMA) {
    issues.push(issue("PKDB_ACCESS_PACKET_SCHEMA_INVALID", "hostResult.packet_schema_version", `resident PKDB ACCESS must return ${ACCESS_PACKET_SCHEMA}`));
    return { issues, normalized: null };
  }
  issues.push(...validateResidentBinding(action, packet, "PKDB_ACCESS"));
  issues.push(...validateSnapshotObject(packet?.snapshot, "PKDB_ACCESS"));
  issues.push(...validateFalseFlags(packet, [
    "project_meaning_authored_by_skill", "inference_permitted", "db_mutation_performed", "runtime_work_performed", "external_service_required"
  ], "PKDB_ACCESS"));
  if (!["DELIVERED", "BLOCKED", "STALE_SNAPSHOT", "REJECTED"].includes(packet?.decision)) {
    issues.push(issue("PKDB_ACCESS_PACKET_DECISION_INVALID", "hostResult.packet.decision", "resident PKDB ACCESS decision is invalid"));
  }
  if (!Array.isArray(packet?.reason_codes)) {
    issues.push(issue("PKDB_ACCESS_REASON_CODES_INVALID", "hostResult.packet.reason_codes", "resident ACCESS reason_codes must be an array"));
  }
  if (!Array.isArray(packet?.clause_results)) {
    issues.push(issue("PKDB_ACCESS_CLAUSE_RESULTS_INVALID", "hostResult.packet.clause_results", "resident PKDB ACCESS clause_results must be an array"));
    return { issues, normalized: null };
  }
  for (const [index, clause] of packet.clause_results.entries()) issues.push(...validateAccessClause(clause, index));
  const requiredClauses = packet.clause_results.filter((clause) => clause?.required === true);
  const requiredClausesSatisfied = requiredClauses.every((clause) => clause?.state === "DELIVERED");
  if (packet.decision === "DELIVERED" && !requiredClausesSatisfied) {
    issues.push(issue("PKDB_ACCESS_PACKET_REQUIRED_CLAUSE_INCONSISTENT", "hostResult.packet.decision", "packet DELIVERED requires every required clause to be DELIVERED"));
  }
  if (packet.decision !== "DELIVERED" && requiredClausesSatisfied && requiredClauses.length > 0 && packet.decision === "BLOCKED") {
    issues.push(issue("PKDB_ACCESS_PACKET_BLOCKED_WITH_ALL_REQUIRED_DELIVERED", "hostResult.packet.decision", "packet BLOCKED is inconsistent when all required clauses were delivered"));
  }
  if (issues.length > 0) return { issues, normalized: null };

  const clauseRows = [];
  const sourceIds = [];
  const provenanceIds = [];
  const conflicts = [];
  for (const [index, clause] of packet.clause_results.entries()) {
    const rr = clause?.resolution_result;
    const resolvedIds = rr && typeof rr === "object" ? uniq(rr.resolved_record_ids ?? []) : [];
    if (rr && typeof rr === "object" && ["AMBIGUOUS", "CONFLICT"].includes(rr.outcome)) {
      conflicts.push({ clauseIndex: index, outcome: rr.outcome });
    }
    const records = [];
    for (const delivered of clause?.delivered_records ?? []) {
      const projected = projectedRecordOf(delivered);
      if (projected != null) records.push(projected);
    }
    clauseRows.push({
      required: clause?.required === true,
      resolvedIds,
      records,
      evidenceSourceRefs: rr && typeof rr === "object" ? uniq(rr.evidence_source_refs ?? []) : [],
      provenanceRefs: rr && typeof rr === "object" ? uniq(rr.provenance_refs ?? []) : []
    });
  }

  const requiredSets = clauseRows.filter((row) => row.required).map((row) => new Set(row.resolvedIds));
  let selectedIds = new Set();
  if (requiredSets.length > 0) {
    selectedIds = new Set(requiredSets[0]);
    for (const set of requiredSets.slice(1)) {
      selectedIds = new Set([...selectedIds].filter((rid) => set.has(rid)));
    }
  } else {
    for (const row of clauseRows) for (const rid of row.resolvedIds) selectedIds.add(rid);
  }
  const requiredIntersectionEmpty = requiredSets.length > 0 && selectedIds.size === 0;

  // Resolution-level evidence/provenance refs are transport evidence for the
  // clause itself. Preserve them independently from semantic AND selection so
  // the explicit SOURCE_MATERIALIZE fallback remains available when delivered
  // semantic records do not carry current-mount shelf pointers.
  for (const row of clauseRows) {
    sourceIds.push(...row.evidenceSourceRefs);
    provenanceIds.push(...row.provenanceRefs);
  }

  const semanticRecords = [];
  const seenSemantic = new Set();
  for (const row of clauseRows) {
    for (const enriched of row.records) {
      const rid = recordIdOf(enriched);
      if (!rid || !selectedIds.has(rid) || seenSemantic.has(rid)) continue;
      seenSemantic.add(rid);
      const rtype = recordTypeOf(enriched);
      if (rtype === "SOURCE") {
        sourceIds.push(rid);
        const locator = enriched?.payload?.locator;
        const normalizedLocator = typeof locator === "string" ? locator.replaceAll("\\", "/") : null;
        const currentMountLocator = typeof normalizedLocator === "string" && normalizedLocator.trim() !== "" &&
          !normalizedLocator.startsWith("/") &&
          !/^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(normalizedLocator) &&
          !normalizedLocator.split("/").includes("..");
        if (currentMountLocator) semanticRecords.push(enriched);
      } else {
        semanticRecords.push(enriched);
      }
      sourceIds.push(...(enriched.source_refs ?? []));
      provenanceIds.push(...(enriched.provenance_refs ?? []));
    }
  }
  const resolvedRecordIds = [...selectedIds];
  const normalized = {
    actionId: action.actionId,
    actionType: "PKDB_ACCESS",
    adapterSchema: ADAPTER_SCHEMA,
    residentPacketSchema: packet.packet_schema_version,
    residentExecutionId: packet.execution_id,
    residentConsumerId: packet.consumer_id,
    decision: packet.decision === "DELIVERED" ? "DELIVERED" : "BLOCKED",
    requiredClausesSatisfied,
    ambiguous: conflicts.length > 0,
    conflicts,
    requiredIntersectionEmpty,
    requiredIntersectionCount: resolvedRecordIds.length,
    semanticRecords,
    resolvedRecordIds: uniq(resolvedRecordIds),
    sourceIds: uniq(sourceIds),
    provenanceIds: uniq(provenanceIds),
    evidenceComplete: packet.decision === "DELIVERED" && requiredClausesSatisfied,
    lineageMode: action?.requirements?.lineageMode ?? null,
    snapshot: structuredClone(packet.snapshot ?? null)
  };
  return { issues, normalized };
}

function validateMaterializeItem(item, index) {
  const issues = [];
  const path = `hostResult.packet.item_results[${index}]`;
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    issues.push(issue("SOURCE_MATERIALIZE_ITEM_INVALID", path, "resident MATERIALIZE item result must be an object"));
    return issues;
  }
  if (item.state === "DELIVERED") {
    if (typeof item.source_record_id !== "string" || item.source_record_id.trim() === "") {
      issues.push(issue("SOURCE_MATERIALIZE_DELIVERED_SOURCE_ID_INVALID", `${path}.source_record_id`, "DELIVERED item requires a non-empty SOURCE record ID"));
    }
    if (typeof item.sha256 !== "string" || !/^[0-9a-f]{64}$/.test(item.sha256)) {
      issues.push(issue("SOURCE_MATERIALIZE_DELIVERED_SHA_INVALID", `${path}.sha256`, "DELIVERED item requires SHA-256"));
    }
    if (!Number.isInteger(item.bytes) || item.bytes < 0) {
      issues.push(issue("SOURCE_MATERIALIZE_DELIVERED_BYTES_INVALID", `${path}.bytes`, "DELIVERED item requires non-negative byte count"));
    }
    if (typeof item.media_type !== "string" || item.media_type.trim() === "") {
      issues.push(issue("SOURCE_MATERIALIZE_DELIVERED_MEDIA_TYPE_INVALID", `${path}.media_type`, "DELIVERED item requires media_type"));
    }
    if (typeof item.bundle_object_path !== "string" || !/^objects\/[0-9a-f]{64}$/.test(item.bundle_object_path)) {
      issues.push(issue("SOURCE_MATERIALIZE_DELIVERED_OBJECT_PATH_INVALID", `${path}.bundle_object_path`, "DELIVERED item requires canonical bundle object path"));
    }
  }
  return issues;
}

export function adaptPkdbMaterializeHostResult(action, result) {
  const issues = [];
  if (result?.actionId !== action.actionId || result?.actionType !== "SOURCE_MATERIALIZE") {
    issues.push(issue("SOURCE_MATERIALIZE_RESULT_ACTION_MISMATCH", "hostResult", "SOURCE_MATERIALIZE host result does not match the pending action"));
    return { issues, normalized: null };
  }
  const packet = packetOf(result);
  if (packet?.packet_schema_version !== MATERIALIZE_PACKET_SCHEMA) {
    issues.push(issue("SOURCE_MATERIALIZE_PACKET_SCHEMA_INVALID", "hostResult.packet_schema_version", `resident materialize must return ${MATERIALIZE_PACKET_SCHEMA}`));
    return { issues, normalized: null };
  }
  issues.push(...validateResidentBinding(action, packet, "SOURCE_MATERIALIZE"));
  issues.push(...validateSnapshotObject(packet?.snapshot, "SOURCE_MATERIALIZE"));
  issues.push(...validateFalseFlags(packet, ["source_bytes_transformed", "db_mutation_performed", "runtime_work_performed", "external_service_required"], "SOURCE_MATERIALIZE"));
  if (!["DELIVERED", "BLOCKED", "STALE_SNAPSHOT", "REJECTED"].includes(packet?.decision)) {
    issues.push(issue("SOURCE_MATERIALIZE_PACKET_DECISION_INVALID", "hostResult.packet.decision", "resident materialize decision is invalid"));
  }
  const expectedSnapshot = action?.residentBinding?.snapshotBinding;
  if (expectedSnapshot?.mode === "EXACT" && packet?.snapshot?.snapshot_sha256 !== expectedSnapshot.snapshotSha256) {
    issues.push(issue("SOURCE_MATERIALIZE_SNAPSHOT_MISMATCH", "hostResult.packet.snapshot.snapshot_sha256", "MATERIALIZE packet snapshot must equal the exact K01 snapshot bound into K02"));
  }
  if (!Array.isArray(packet?.item_results)) {
    issues.push(issue("SOURCE_MATERIALIZE_ITEM_RESULTS_INVALID", "hostResult.packet.item_results", "resident materialize item_results must be an array"));
    return { issues, normalized: null };
  }
  for (const [index, item] of packet.item_results.entries()) issues.push(...validateMaterializeItem(item, index));
  const requiredItems = packet.item_results.filter((item) => item?.required === true);
  if (packet.decision === "DELIVERED" && !requiredItems.every((item) => item?.state === "DELIVERED")) {
    issues.push(issue("SOURCE_MATERIALIZE_PACKET_REQUIRED_ITEM_INCONSISTENT", "hostResult.packet.decision", "DELIVERED packet requires every required materialize item to be DELIVERED"));
  }
  if (issues.length > 0) return { issues, normalized: null };

  const bundleObjects = result?.bundleObjects;
  if (packet.decision === "DELIVERED" && (!bundleObjects || typeof bundleObjects !== "object" || Array.isArray(bundleObjects))) {
    issues.push(issue("SOURCE_MATERIALIZE_BUNDLE_OBJECTS_REQUIRED", "hostResult.bundleObjects", "DELIVERED materialize result requires exact bundle object bytes keyed by bundle_object_path"));
    return { issues, normalized: null };
  }
  const sources = [];
  for (const [index, item] of packet.item_results.entries()) {
    if (item?.state !== "DELIVERED") continue;
    const path = item?.bundle_object_path;
    const contentBase64 = path == null ? null : bundleObjects?.[path];
    if (typeof contentBase64 !== "string" || contentBase64 === "") {
      issues.push(issue("SOURCE_MATERIALIZE_BUNDLE_OBJECT_MISSING", `hostResult.packet.item_results[${index}].bundle_object_path`, "materialized bundle object bytes are missing"));
      continue;
    }
    sources.push({
      sourceId: item.source_record_id,
      contentBase64,
      sha256: item.sha256,
      declaredBytes: item.bytes,
      mediaType: item.media_type,
      bundleObjectPath: path
    });
  }
  return {
    issues,
    normalized: {
      actionId: action.actionId,
      actionType: "SOURCE_MATERIALIZE",
      adapterSchema: ADAPTER_SCHEMA,
      residentPacketSchema: packet.packet_schema_version,
      residentExecutionId: packet.execution_id,
      residentConsumerId: packet.consumer_id,
      decision: packet.decision === "DELIVERED" ? "DELIVERED" : "BLOCKED",
      sources,
      snapshot: structuredClone(packet.snapshot ?? null)
    }
  };
}

export function isTrustedTextualMediaType(mediaType) {
  if (typeof mediaType !== "string") return false;
  const value = mediaType.trim().toLowerCase().split(";", 1)[0];
  if (value.startsWith("text/")) return true;
  if (["application/json", "application/xml", "application/javascript", "application/yaml", "application/x-yaml"].includes(value)) return true;
  return value.endsWith("+json") || value.endsWith("+xml");
}

export { ADAPTER_SCHEMA as DS90_PKDB_HOST_ADAPTER_SCHEMA };
