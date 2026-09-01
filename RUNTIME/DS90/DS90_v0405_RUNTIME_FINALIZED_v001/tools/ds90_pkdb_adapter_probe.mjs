#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  validatePkdbAccessResult,
  buildSourceMaterializeAction,
  validateMaterializeResult,
  buildKnowledgeEvidence
} from "../src/skills/pkdbRead.js";

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === "--input") out.input = value, i += 1;
    else if (key === "--report") out.report = value, i += 1;
  }
  if (!out.input) throw new Error("--input is required");
  return out;
}

function fail(code, detail, reportPath = null) {
  const report = { decision: "STOP", code, detail };
  const text = JSON.stringify(report, null, 2) + "\n";
  if (reportPath) writeFileSync(resolve(reportPath), text, "utf8");
  process.stdout.write(text);
  process.exitCode = 1;
}

try {
  const args = parseArgs(process.argv);
  const payload = JSON.parse(readFileSync(resolve(args.input), "utf8"));
  const accessAction = {
    actionId: "PKDB_ADAPTER_E2E_ACCESS",
    actionType: "PKDB_ACCESS",
    requirements: { lineageMode: "ACTIVE" },
    residentBinding: { executionId: payload.accessPacket.execution_id, consumerId: payload.accessPacket.consumer_id, snapshotBinding: { mode: "CURRENT" } }
  };
  const accessHostResult = {
    actionId: accessAction.actionId,
    actionType: accessAction.actionType,
    packet: payload.accessPacket
  };
  const accessChecked = validatePkdbAccessResult(accessAction, accessHostResult);
  if (accessChecked.issues.length) throw new Error(`ACCESS adapter issues: ${JSON.stringify(accessChecked.issues)}`);
  const normalized = accessChecked.normalized;
  const expectedSourceId = payload.expectedSourceId;
  if (!normalized.sourceIds.includes(expectedSourceId)) throw new Error(`SOURCE record was not promoted to sourceIds: ${expectedSourceId}`);
  if (normalized.lineageMode !== "ACTIVE") throw new Error("ACTIVE lineage requirement was not preserved through adapter");

  const materialAction = buildSourceMaterializeAction(normalized, () => "PKDB_ADAPTER_E2E_MATERIALIZE");
  materialAction.residentBinding.executionId = payload.materializePacket.execution_id;
  materialAction.residentBinding.consumerId = payload.materializePacket.consumer_id;
  materialAction.residentRequest.execution_id = payload.materializePacket.execution_id;
  materialAction.residentRequest.consumer_id = payload.materializePacket.consumer_id;
  if (!materialAction.sourceIds.includes(expectedSourceId)) throw new Error("materialize action did not preserve expected SOURCE ID");
  const materialHostResult = {
    actionId: materialAction.actionId,
    actionType: materialAction.actionType,
    packet: payload.materializePacket,
    bundleObjects: payload.bundleObjects
  };
  const materialChecked = validateMaterializeResult(materialAction, materialHostResult);
  if (materialChecked.issues.length) throw new Error(`MATERIALIZE adapter issues: ${JSON.stringify(materialChecked.issues)}`);
  const evidence = buildKnowledgeEvidence(normalized, {
    materializedEvidence: materialChecked.evidence,
    route: "SOURCE_MATERIALIZE_FALLBACK"
  });
  const expected = evidence.materializedSources.find((entry) => entry.sourceId === expectedSourceId);
  if (!expected) throw new Error("materialized SOURCE evidence missing after adapter");
  if (expected.textual === true && expected.utf8Read !== true) throw new Error("textual SOURCE was not actually UTF-8 read");
  if (evidence.hostAdapter !== "DS90_PKDB_HOST_ADAPTER_v002") throw new Error("formal host adapter marker missing");
  if (evidence.evidenceRoute !== "SOURCE_MATERIALIZE_FALLBACK") throw new Error("K02 fallback evidence route marker missing");
  if (evidence.currentShelfIsAuthority !== false) throw new Error("K02 fallback incorrectly elevated current shelf authority");
  if (evidence.sourceBytesActuallyRead !== true) throw new Error("K02 fallback did not prove source bytes were actually read");

  const report = {
    decision: "PASS",
    test: "DS90_V0400_PKDB_HOST_ADAPTER_K02_FALLBACK_REAL_PACKET_E2E_v001",
    adapter: evidence.hostAdapter,
    lineage_mode: evidence.lineageMode,
    source_id: expectedSourceId,
    evidence_route: evidence.evidenceRoute,
    current_shelf_is_authority: evidence.currentShelfIsAuthority,
    source_bytes_actually_read: evidence.sourceBytesActuallyRead,
    source_materialized: true,
    textual: expected.textual,
    utf8_read: expected.utf8Read,
    resident_access_packet_schema: payload.accessPacket?.packet_schema_version,
    resident_materialize_packet_schema: payload.materializePacket?.packet_schema_version
  };
  const text = JSON.stringify(report, null, 2) + "\n";
  if (args.report) writeFileSync(resolve(args.report), text, "utf8");
  process.stdout.write(text);
} catch (error) {
  fail("ADAPTER_E2E_FAILED", error?.stack ?? String(error));
}
