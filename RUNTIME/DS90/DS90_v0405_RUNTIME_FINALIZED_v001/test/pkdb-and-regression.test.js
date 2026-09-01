import test from "node:test";
import assert from "node:assert/strict";
import { buildPkdbTagClauses } from "../src/indexing/searchEngine.js";
import { adaptPkdbAccessHostResult, residentBindingFor } from "../src/adapters/pkdbHostAdapter.js";

function sourceRecord(id, term) {
  return {
    record_id: id,
    record_type: "SOURCE",
    logical_id: `LID-${id}`,
    status: "CONFIRMED",
    revision: 1,
    scope: { kind: "GLOBAL", dimensions: [] },
    aliases: [],
    search_terms: [term],
    preservation: ["SOURCE_LINK"],
    supersedes_refs: [],
    payload: {
      source_role: "PRIMARY",
      locator: `021_G_v308/${id}.txt`,
      sha256: "a".repeat(64),
      media_type: "text/plain"
    },
    source_refs: [],
    provenance_refs: []
  };
}

function clause(clauseId, required, records, evidence = []) {
  return {
    clause_id: clauseId,
    required,
    state: "DELIVERED",
    reason_codes: [],
    resolution_result: {
      result_schema_version: "PKDB_RESOLUTION_RESULT_v001",
      outcome: records.length === 1 ? "RESOLVED" : "RESOLVED_SET",
      reason_codes: [],
      candidate_record_ids: records.map((r) => r.record_id),
      resolved_record_ids: records.map((r) => r.record_id),
      scope_unresolved_record_ids: [],
      evidence_source_refs: evidence,
      provenance_refs: []
    },
    delivery_count: records.length,
    delivered_records: records.map((r) => ({ record_id: r.record_id, projection_mode: "FULL_RECORD", data: r }))
  };
}

function packet(action, clauses) {
  return {
    actionId: action.actionId,
    actionType: "PKDB_ACCESS",
    packet: {
      packet_schema_version: "PKDB_DELIVERY_PACKET_v001",
      execution_id: action.residentBinding.executionId,
      consumer_id: action.residentBinding.consumerId,
      decision: "DELIVERED",
      snapshot: { snapshot_sha256: "b".repeat(64), record_count: 3, source_object_count: 0 },
      project_meaning_authored_by_skill: false,
      inference_permitted: false,
      db_mutation_performed: false,
      runtime_work_performed: false,
      external_service_required: false,
      reason_codes: [],
      clause_results: clauses
    }
  };
}

test("K01 machine intent builder emits query schema v003 and a wide default delivery limit", () => {
  const built = buildPkdbTagClauses({ intents: [
    { kind: "SEARCH_TERM", value: "街A", required: true },
    { kind: "SEARCH_TERM", value: "港", required: true }
  ]});
  assert.equal(built.issues.length, 0);
  assert.equal(built.clauses.length, 2);
  for (const c of built.clauses) {
    assert.equal(c.query.query_schema_version, "PKDB_QUERY_SCHEMA_v003");
    assert.equal(c.delivery_limit, 5000);
    assert.equal(c.projection.mode, "PAYLOAD_ONLY");
    assert.deepEqual(c.query.filters.record_types, ["SOURCE"]);
  }
});

test("required PKDB clauses are intersected, not unioned", () => {
  const action = {
    actionId: "PKDB_ACCESS:AND-TEST",
    actionType: "PKDB_ACCESS",
    requirements: { lineageMode: "ACTIVE" },
    residentBinding: residentBindingFor("PKDB_ACCESS", "PKDB_ACCESS:AND-TEST", { mode: "CURRENT" })
  };
  const a = sourceRecord("SRC-A", "街A");
  const b = sourceRecord("SRC-B", "街A");
  const c = sourceRecord("SRC-C", "港");
  const host = packet(action, [
    clause("Q0001", true, [a, b]),
    clause("Q0002", true, [b, c])
  ]);
  const out = adaptPkdbAccessHostResult(action, host);
  assert.equal(out.issues.length, 0);
  assert.deepEqual(out.normalized.resolvedRecordIds, ["SRC-B"]);
  assert.deepEqual(out.normalized.semanticRecords.map((r) => r.record_id), ["SRC-B"]);
  assert.equal(out.normalized.requiredIntersectionCount, 1);
  assert.equal(out.normalized.requiredIntersectionEmpty, false);
});

test("empty required AND intersection is explicitly exposed", () => {
  const action = {
    actionId: "PKDB_ACCESS:AND-EMPTY",
    actionType: "PKDB_ACCESS",
    requirements: { lineageMode: "ACTIVE" },
    residentBinding: residentBindingFor("PKDB_ACCESS", "PKDB_ACCESS:AND-EMPTY", { mode: "CURRENT" })
  };
  const a = sourceRecord("SRC-A", "街A");
  const c = sourceRecord("SRC-C", "港");
  const out = adaptPkdbAccessHostResult(action, packet(action, [
    clause("Q0001", true, [a]),
    clause("Q0002", true, [c])
  ]));
  assert.equal(out.issues.length, 0);
  assert.equal(out.normalized.requiredIntersectionEmpty, true);
  assert.equal(out.normalized.requiredIntersectionCount, 0);
  assert.deepEqual(out.normalized.semanticRecords, []);
});

test("resolution evidence refs survive AND adaptation for explicit materialize fallback", () => {
  const action = {
    actionId: "PKDB_ACCESS:EVIDENCE",
    actionType: "PKDB_ACCESS",
    requirements: { lineageMode: "ACTIVE" },
    residentBinding: residentBindingFor("PKDB_ACCESS", "PKDB_ACCESS:EVIDENCE", { mode: "CURRENT" })
  };
  const assertion = {
    record_id: "ASSERT-B", record_type: "ASSERTION", logical_id: "LID-ASSERT-B", status: "CONFIRMED",
    revision: 1, scope: { kind: "GLOBAL", dimensions: [] }, aliases: [], search_terms: [],
    preservation: [], supersedes_refs: [], payload: {}, source_refs: [], provenance_refs: []
  };
  const out = adaptPkdbAccessHostResult(action, packet(action, [
    clause("Q0001", true, [assertion], ["SRC-EVIDENCE-1"]),
    clause("Q0002", true, [assertion], ["SRC-EVIDENCE-2"])
  ]));
  assert.equal(out.issues.length, 0);
  assert.deepEqual(new Set(out.normalized.sourceIds), new Set(["SRC-EVIDENCE-1", "SRC-EVIDENCE-2"]));
});


test("PAYLOAD_ONLY locator projection reconstructs schema-legal SOURCE pointers", () => {
  const action = {
    actionId: "PKDB_ACCESS:PAYLOAD",
    actionType: "PKDB_ACCESS",
    requirements: { lineageMode: "ACTIVE" },
    residentBinding: residentBindingFor("PKDB_ACCESS", "PKDB_ACCESS:PAYLOAD", { mode: "CURRENT" })
  };
  const full = sourceRecord("SRC-P", "港");
  const host = packet(action, [clause("Q0001", true, [full])]);
  host.packet.clause_results[0].delivered_records = [{
    record_id: full.record_id, projection_mode: "PAYLOAD_ONLY", data: structuredClone(full.payload)
  }];
  const out = adaptPkdbAccessHostResult(action, host);
  assert.equal(out.issues.length, 0);
  assert.equal(out.normalized.semanticRecords.length, 1);
  assert.equal(out.normalized.semanticRecords[0].record_type, "SOURCE");
  assert.equal(out.normalized.semanticRecords[0].payload.locator, full.payload.locator);
  assert.equal(out.normalized.sourceIds.includes(full.record_id), true);
});
