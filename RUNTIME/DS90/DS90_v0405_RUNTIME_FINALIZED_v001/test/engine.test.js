import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { execute as rawExecute, createRuntimeSession, resumeRuntimeSession } from "../src/engine.js";
import { route } from "../src/router.js";
import { MODULES } from "../src/runtime/program.js";
import { ALWAYS_READ } from "../src/boot/validator.js";
import { OPERATION_READS, OPTIONAL_REFERENCE_ROUTES, INTERNAL_FALLBACK_READS } from "../src/loading/manifest.js";
import { ASSET_REGISTRY } from "../src/assets.js";
import { COMPARISON_ASSETS, OPERATION_ASSETS } from "../src/assets.js";
import {
  CONTRACT_PRIORITY,
  createPackWriterActivation,
  validateLegacyMode,
  validatePackWriterActivation
} from "../src/v2/activation.js";
import {
  buildMaterialMap,
  calculateMapDigest,
  validateMaterialMap
} from "../src/v2/material-map.js";
import { THREE_ZERO_COUNTERS } from "../src/validation/convergence.js";
import { execute as executeFromEntry, READ_ORDER as ENTRY_READ_ORDER } from "../START_HERE.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..");

const ledger = [...new Set([
  ...ALWAYS_READ,
  ...Object.values(OPERATION_READS).flat()
])].map((path) => ({ path, exists: true, read: true }));
const fallbackLedger = [...new Set([
  ...ledger.map((entry) => entry.path),
  ...Object.values(INTERNAL_FALLBACK_READS).flat()
])].map((path) => ({ path, exists: true, read: true }));

const PROJECT_KNOWLEDGE_OPS = new Set([
  "CHECK", "TAG_SEARCH", "CARD", "CARD_TEST", "LOG", "ARCHIVE",
  "SINGLE_EPISODE_PROFILE_GATE", "EPISODE_PACK"
]);

function normalizeLegacyRequest(request) {
  const copy = structuredClone(request);
  if (["PACK_CUTOUT", "MOUNT_TRANSFER"].includes(copy.operation)) {
    copy.payload = { ...(copy.payload ?? {}), forceDs90MinimumRoute: true };
    copy.boot = { ...(copy.boot ?? {}), readLedger: fallbackLedger };
  }
  const routedOp = copy.operation ?? route(copy)?.operation;
  if ((copy.externalContext?.present === true || copy.project?.present === true) && PROJECT_KNOWLEDGE_OPS.has(routedOp)) {
    if (routedOp === "TAG_SEARCH") {
      copy.search ??= { query: "fixture lookup", intents: [{ kind: "SEARCH_TERM", value: "#TEST:LOOKUP", required: true }] };
      copy.search.intents ??= [{ kind: "SEARCH_TERM", value: "#TEST:LOOKUP", required: true }];
    } else {
      copy.knowledgeRequest ??= {};
      copy.knowledgeRequest.intents ??= [{ kind: "SEARCH_TERM", value: `#TEST:${routedOp}`, required: true }];
    }
  }
  return copy;
}

function accessDelivered(action) {
  const record = {
    record_id: "SRC-TEST-CURRENT-SHELF",
    record_type: "SOURCE",
    logical_id: "LID-SRC-TEST-CURRENT-SHELF",
    status: "CONFIRMED",
    revision: 1,
    scope: { kind: "GLOBAL", dimensions: [] },
    aliases: ["fixture"],
    search_terms: ["#TEST:LOOKUP"],
    preservation: ["SOURCE_LINK"],
    supersedes_refs: [],
    payload: {
      source_role: "PRIMARY",
      locator: "021_G_v001/30_CURRENT/TEST_SOURCE.md",
      sha256: createHash("sha256").update(Buffer.from("verified current shelf bytes\n", "utf8")).digest("hex"),
      media_type: "text/markdown"
    },
    source_refs: [],
    provenance_refs: []
  };
  return {
    actionId: action.actionId,
    actionType: "PKDB_ACCESS",
    packet: {
      packet_schema_version: "PKDB_DELIVERY_PACKET_v001",
      execution_id: action.residentBinding.executionId,
      consumer_id: action.residentBinding.consumerId,
      decision: "DELIVERED",
      snapshot: { snapshot_sha256: "a".repeat(64), record_count: 1, source_object_count: 0 },
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
          candidate_record_ids: [record.record_id],
          resolved_record_ids: [record.record_id],
          scope_unresolved_record_ids: [],
          evidence_source_refs: [],
          provenance_refs: []
        },
        delivery_count: 1,
        delivered_records: [{ record_id: record.record_id, projection_mode: "FULL_RECORD", data: record }]
      }]
    },
    evidenceComplete: true
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

function dispatchVerified(action, path = `000_C/${action.target}/runtime.zip`) {
  const sha = "b".repeat(64);
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

function advanceTrustedDispatch(request, path = null) {
  let { session, result } = createRuntimeSession(normalizeLegacyRequest(request));
  if (result.hostAction?.actionType === "CURRENT_000C_DISPATCH_RESOLVE") {
    ({ session, result } = resumeRuntimeSession(session, dispatchVerified(result.hostAction, path ?? `000_C/${result.hostAction.target}/runtime.zip`)));
  }
  return { session, result };
}

function execute(request) {
  const normalized = normalizeLegacyRequest(request);
  let { session, result } = createRuntimeSession(normalized);
  for (let guard = 0; session && !result.terminal && result.hostAction && guard < 4; guard += 1) {
    const action = result.hostAction;
    if (action.actionType === "PKDB_ACCESS") {
      ({ session, result } = resumeRuntimeSession(session, accessDelivered(action)));
      continue;
    }
    if (action.actionType === "SHELF_READ") {
      ({ session, result } = resumeRuntimeSession(session, shelfReadDelivered(action)));
      continue;
    }
    if (action.actionType === "CURRENT_000C_DISPATCH_RESOLVE") {
      ({ session, result } = resumeRuntimeSession(session, dispatchVerified(action)));
      continue;
    }
    return result;
  }
  return result;
}
const base = {
  core: { loaded: true },
  designerDiscipline: {
    originals_read: true,
    no_inference_completion: true,
    no_condition_compression: true,
    no_source_condition_drop: true,
    summary_not_source: true
  },
  designerChangeSet: {
    creates_new_items: true,
    registrations: [{
      item_id: "TEST-NEW-001",
      item_type: "TEST_ARTIFACT",
      created_at: "2026-06-23",
      added_reason: "deterministic test fixture",
      source_or_origin: "test/engine.test.js",
      dependency: [],
      related_items: [],
      canonical_state: "NON_CONDITION",
      registration_target: "TEST",
      index_update_required: false,
      navigation_references: {
        START_HERE: false,
        READ_ME: false,
        CURRENT_STATUS: false
      }
    }]
  },
  boot: {
    readLedger: ledger,
    treatMissingExternalContextAsStop: false,
    useMetadataOverGate: false,
    useRestartMemoAsEntry: false,
    useEndLogAsCanonical: false,
    readAllToolsAtStartup: false
  },
  knowledgeContext: {
    startGate: {
      path: "000_C/00_READ_FIRST/DS90_START_GATE.json",
      exists: true,
      read: true,
      version: "DS90_START_GATE_v001"
    },
    dispatch: {
      path: "000_C/00_READ_FIRST/RUNTIME_DIRECT_DISPATCH.json",
      exists: true,
      read: true,
      verified: true,
      dependencies: {
        PKDB_ACCESS_SKILL: { resolved: true, sha256Verified: true },
        PKDB_SOURCE_MATERIALIZE_SKILL: { resolved: true, sha256Verified: true }
      },
      routes: {
        MOUNT_TRANSFER: { resolved: true, sha256Verified: true, path: "000_C/MT00/runtime.zip" },
        PACK_CUTOUT: { resolved: true, sha256Verified: true, path: "000_C/SP00/runtime.zip" },
        MOUNT_ZIP_BOOTSTRAP: { resolved: true, sha256Verified: true, path: "000_C/MT00_BOOTSTRAP_EA/runtime.zip" },
        STORY_PACK_RECEIVER_CHECK: { resolved: true, sha256Verified: true, path: "000_C/PW90_STORY_PACK_RECEIVER_CHECKER/runtime.zip" }
      }
    },
    pkdb: {
      mounted: true,
      validated: true,
      semanticRecordCount: 0,
      sourceRecordCount: 341,
      sourceOnlyBridge: true
    },
    portableOrigin: {
      logicalId: "LID-PORTABLE-5000-ORIGIN",
      lookupDelivered: true,
      materialized: true,
      read: true,
      sha256Verified: true
    }
  }
};

const zeroDryRuns = () => Array.from({ length: 3 }, () =>
  Object.fromEntries(THREE_ZERO_COUNTERS.map((counter) => [counter, 0]))
);

const validArtifactDelivery = () => ({
  packagingPreflightGate: { decision: "PASS" },
  zeroThinkWriterHandoff: { decision: "PASS", entryPoint: "00_README.md" },
  deliverableConvergenceReport: { decision: "PASS" },
  dryRuns: zeroDryRuns()
});

const project = {
  present: true,
  gate021: {
    path: "021/START.md",
    exists: true,
    read: true,
    readOrder: ["022/CORE.md"],
    canonicalRoute: "022/CORE.md",
    currentLocation: "024/FLOW.md",
    readOrderRefs: [{ path: "022/CORE.md", exists: true, read: true }]
  }
};

test("梱包作業語は梱包さんPACK_CUTOUTへ自律ルーティングする", () => {
  for (const command of [
    "話パック生成をして",
    "話パック検査をして",
    "梱包作業を進めて",
    "荷造りして",
    "WRITE投入候補にして",
    "pack writer handoffを作る"
  ]) {
    const routed = route(command);
    assert.equal(routed.kind, "ROUTED");
    assert.equal(routed.operation, "PACK_CUTOUT");
    assert.equal(routed.spec.tool, "SPECIALIST_DISPATCH");
  }
});

test("移管作業語はMOUNT_TRANSFER_BACKPACKへ自律ルーティングする", () => {
  for (const command of [
    "マウント移管をして",
    "現行マウント移管",
    "移管して",
    "反映引継ぎをして",
    "引継ぎをして",
    "棚掃除をして",
    "restart handoff",
    "current mount transfer",
    "runtime handoff packaging"
  ]) {
    const routed = route(command);
    assert.equal(routed.kind, "ROUTED");
    assert.equal(routed.operation, "MOUNT_TRANSFER");
    assert.equal(routed.spec.tool, "SPECIALIST_DISPATCH");
  }
});

test("マウントZIP構築語はMT00_BOOTSTRAP_EA直ランタイムへ自律ルーティングする", () => {
  for (const command of [
    "マウントZIP構築をして",
    "マウントzip作成",
    "初回Project棚立て",
    "エーア投入",
    "MT00_BOOTSTRAP_EA"
  ]) {
    const routed = route(command);
    assert.equal(routed.kind, "ROUTED", command);
    assert.equal(routed.operation, "MOUNT_ZIP_BOOTSTRAP", command);
    assert.equal(routed.spec.tool, "SPECIALIST_DISPATCH", command);
  }
});

const validLibrarian = () => {
  const content = "header\ncanonical condition\nfooter";
  const sha256 = createHash("sha256").update(Buffer.from(content, "utf8")).digest("hex");
  const structure = [
    { path: "PROJECT", type: "ROOT", shelf_id: null, shelf_definition: "project-root" },
    { path: "PROJECT/022", type: "SHELF", shelf_id: "022", shelf_definition: "canonical" },
    { path: "PROJECT/022/CORE.md", type: "FILE", shelf_id: "022",
      shelf_definition: "canonical", content_digest: sha256 }
  ];
  return {
    beforeStructure: structuredClone(structure),
    afterStructure: structuredClone(structure),
    outputArchive: { format: "ZIP", root_path: "PROJECT", entry_paths: structure.map((entry) => entry.path) },
    newShelves: [],
    sourceDocuments: [{ path: "022/CORE.md", content, sha256 }],
    previousCatalog: [{
      condition_id: "COND-I1", item_id: "I1", item_name: "condition",
      item_type: "CONDITION", tag_name: "#COND:I1",
      role: "canonical condition", adoption_state: "ADOPTED",
      shelf_definition: "canonical", source_type: "PROJECT_CANON",
      source_text: "canonical condition", source_file: "022/CORE.md",
      source_lines: [2, 2], structure_path: "PROJECT/022/CORE.md",
      target_process: "DESIGN", target_shelf: "022",
      condition_type: "FIXED", canon_status: "CANONICAL",
      update_history: ["created"], is_new: false,
      line_changed: false, line_ref_status: "EXACT"
    }],
    catalog: [{
      condition_id: "COND-I1", item_id: "I1", item_name: "condition",
      item_type: "CONDITION", tag_name: "#COND:I1",
      role: "canonical condition", adoption_state: "ADOPTED",
      shelf_definition: "canonical", source_type: "PROJECT_CANON",
      source_text: "canonical condition", source_file: "022/CORE.md",
      source_lines: [2, 2], structure_path: "PROJECT/022/CORE.md",
      target_process: "DESIGN", target_shelf: "022",
      condition_type: "FIXED", canon_status: "CANONICAL",
      update_history: ["created"], is_new: false,
      line_changed: false, line_ref_status: "EXACT"
    }],
    indexMaintenance: {
      existing_index_read: true, repair_attempted_first: true,
      parallel_index_created: false, unresolved_items: [],
      registered_item_ids: ["I1"],
      navigation_references: { START_HERE: true, READ_ME: true, CURRENT_STATUS: true }
    },
    summaryControl: { all_sources_read: true, no_inference: true, no_condition_compression: true }
  };
};

const validTransferRequest = (origin = "USER_EXPLICIT") => ({
  operation: "MOUNT_TRANSFER", ...base, project, sources: [],
  currentMount: { present: true },
  mountTransferInvocation: {
    mode: "MOUNT_TRANSFER_BACKPACK", operation: "MOUNT_TRANSFER",
    origin, reason: "versioned transfer"
  },
  transfer: {
    currentMountPresent: true, controlStartGateRead: true, inventoryBuilt: true,
    diffReportBuilt: true, phase: "PREPARE",
    dailyPrimarySource: "MOUNT_ZIP", canonicalArchive: "PROJECT_HISTORY_SHELF",
      mountTransferProcessActive: true,
      existingShelvesPreserved: true,
      nextIndividualRestartReady: true, mountTransferProcessActive: true, existingShelvesPreserved: true, nextIndividualRestartReady: true,
    inventory: [{ id: "I1" }], reflected: [{ id: "I1" }], held: [], discarded: [],
    resultControlHandoff: {
      entrypoint: "00_READ_FIRST/DS90_START_GATE.md",
      readOrder: ["00_READ_FIRST/DS90_START_GATE.md", "00_READ_FIRST/DS90_START_GATE.json", "00_READ_FIRST/RUNTIME_DIRECT_DISPATCH.json"],
      currentLocation: "PKDB", unresolvedStops: [], nextWork: "continue"
    },
    restartResolvedRefs: [{ path: "00_READ_FIRST/DS90_START_GATE.md", section: "boot", exists: true, read: true }],
    librarian: validLibrarian()
  }
});

const standardCard = () => ({
  episodeId: "E1", version: "v1", band: "B1",
  canonicalAnchor: "A", returnAnchor: "A", sourceRead: true,
  goalCondition: "G", nextAnchorCondition: "N", styleLayer: "S",
  concreteObject: "O", localStop: "L", completionBoundary: "not manuscript",
  foreground: "object", backgroundDirection: "present-low",
  returnDestination: "A", sourceTrace: "024#episode",
  narrationConnection: "objective", speechTagPolicy: "minimal",
  movementLayer: "sensory", metaphorLimit: "character-bound",
  explanationAmount: "low", fuelCheck: "expandable",
  projectSpecificDevice: "friction-place-body-relation",
  minimumNaturalExpansion: 10000,
  conditionsCompleteInMountedPack: true,
  inputSources: ["024"], strongReferences: ["022"], weakReferences: ["094"],
  stopElements: ["STOP-1"],
  fixedConditions: ["F"], heatConditions: ["H"],
  connectionConditions: ["C"], prohibitionLines: ["B"],
  fragilePoints: ["x"], freedomAreas: ["free"],
  requiredCharacters: ["Kai"], requiredPlaces: ["shop"],
  requiredEvents: ["arrival"], requiredObjects: ["cup"],
  requiredOrder: ["arrival", "cup"], requiredScenes: ["door"],
  doNotStrengthen: ["mystery"], allowedSeeds: ["future-line"],
  fixedProcessCoverage: Array.from({ length: 14 }, (_, index) => index + 1),
  pointLane: [
    { id: "P1", enterState: "S0", exitState: "S1" },
    { id: "P2", enterState: "S1", exitState: "S2" }
  ],
  writerRequestFields: {
    lane: "P1>P2", lengthPolicy: "9000", disclosureSpeed: "slow",
    pausePoint: "P1", fragilePoints: ["x"]
  }
});

test("起動は常時必読台帳を通ってBOOT_READY", () => {
  const result = execute({ operation: "BOOT", ...base });
  assert.equal(result.decision, "PASS");
  assert.equal(result.boot, "BOOT_READY");
});

test("START_HEREはREAD_ORDERとexecuteを同じ入口から公開する", () => {
  assert.ok(Array.isArray(ENTRY_READ_ORDER));
  assert.equal(executeFromEntry({ operation: "BOOT", ...base }).decision, "PASS");
});

test("配布examplesはSTART_HERE入口から正規の次状態へ進む", () => {
  const bootRequest = JSON.parse(readFileSync(resolve(REPO_ROOT, "examples/boot.json"), "utf8"));
  const bootResult = executeFromEntry(bootRequest);
  assert.equal(bootResult.decision, "PASS");
  assert.equal(bootResult.state, "BOOT_READY");

  const cardRequest = JSON.parse(readFileSync(resolve(REPO_ROOT, "examples/card.json"), "utf8"));
  const cardResult = executeFromEntry(cardRequest);
  assert.equal(cardResult.decision, null);
  assert.equal(cardResult.state, "WAITING_FOR_HOST");
  assert.equal(cardResult.hostAction.actionType, "PKDB_ACCESS");
});

test("externalContextを正規入力として受け、project alias衝突はSTOP", () => {
  assert.equal(execute({ operation: "BOOT", ...base, externalContext: project }).boot, "BOOT_CONNECTED");
  const conflict = structuredClone(project);
  conflict.gate021.currentLocation = "DIFFERENT";
  const result = execute({ operation: "BOOT", ...base, externalContext: project, project: conflict });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.code === "EXTERNAL_CONTEXT_ALIAS_CONFLICT"));
});

test("request schemaのconstは実行前に強制される", () => {
  const request = validTransferRequest();
  request.mountTransferInvocation.mode = "WRONG_MODE";
  const result = execute(request);
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.code === "SCHEMA_CONST"));
});

test("常時必読欠損はSTOP", () => {
  const result = execute({
    operation: "BOOT",
    ...base,
    boot: { ...base.boot, readLedger: ledger.slice(1) }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "ALWAYS_READ_MISSING"));
});

test("作品投入時は000_C DS90 START GATEを実読", () => {
  const badKnowledge = structuredClone(base.knowledgeContext);
  badKnowledge.startGate.read = false;
  const result = execute({
    operation: "BOOT",
    ...base,
    externalContext: project,
    knowledgeContext: badKnowledge
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "DS90_START_GATE_UNREAD"));
});

test("SOURCE-only PKDBでもSTART GATE bridgeはBOOT可能", () => {
  const result = execute({ operation: "BOOT", ...base, externalContext: project });
  assert.equal(result.decision, "PASS");
  assert.equal(result.boot, "BOOT_CONNECTED");
});

test("021_Gの旧gate状態をv0400 project boot authorityには昇格しない", () => {
  const legacyUnread = structuredClone(project);
  legacyUnread.gate021.read = false;
  legacyUnread.gate021.readOrderRefs = [];
  const result = execute({ operation: "BOOT", ...base, externalContext: legacyUnread });
  assert.equal(result.decision, "PASS");
  assert.equal(result.boot, "BOOT_CONNECTED");
});

test("SOURCE materializer依存未検証はSTOP", () => {
  const badKnowledge = structuredClone(base.knowledgeContext);
  badKnowledge.dispatch.dependencies.PKDB_SOURCE_MATERIALIZE_SKILL.sha256Verified = false;
  const result = execute({
    operation: "BOOT",
    ...base,
    externalContext: project,
    knowledgeContext: badKnowledge
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "DS90_PKDB_DEPENDENCY_UNVERIFIED"));
});

test("未知操作と曖昧操作は例外なくSTOP", () => {
  assert.equal(execute({ command: "何かして", ...base }).decision, "STOP");
  assert.equal(execute({ operation: "UNKNOWN", ...base }).decision, "STOP");
});

test("CHECKは正本一意・禁止集合・芯hashを実体比較", () => {
  const result = execute({
    operation: "CHECK", ...base, project,
    verification: {
      canonicalCandidates: [{ path: "022/CORE.md", section: "canon", exists: true, read: true }],
      requiredProhibitionIds: ["BAN-1"],
      observedProhibitionIds: ["BAN-1"],
      beforeCoreHash: "abc",
      afterCoreHash: "abc"
    },
    evidence: { promoteConfirmedToCanonical: false },
    work: { outsideDelegation: false, adoptAiCandidate: false, fillShortageByInference: false }
  });
  assert.equal(result.decision, "PASS");
});

test("CARDはPOINT接続・正本帰還・writer必須欄を検査", () => {
  const result = execute({
    operation: "CARD", ...base, project, sources: [],
    card: standardCard()
  });
  assert.equal(result.decision, "PASS");
});

test("CARDのPOINT不接続はSTOP", () => {
  const request = {
    operation: "CARD", ...base, project, sources: [],
    card: {
      ...standardCard(),
      pointLane: [
        { id: "P1", enterState: "S0", exitState: "S1" },
        { id: "P2", enterState: "BAD", exitState: "S2" }
      ]
    }
  };
  assert.equal(execute(request).decision, "STOP");
});

test("標準カードの本文条件不足と固定工程欠落はSTOP", () => {
  const card = standardCard();
  card.conditionsCompleteInMountedPack = false;
  card.fixedProcessCoverage = [1, 2, 3];
  const result = execute({
    operation: "CARD", ...base, project, sources: [], card
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "CARD_CONDITIONS_NOT_SELF_CONTAINED"));
  assert.ok(result.issues.some((entry) => entry.ruleId === "FIXED_PROCESS_INCOMPLETE"));
});

test("CARD_TESTは複数回同一結果でのみ収束", () => {
  const result = execute({
    operation: "CARD_TEST", ...base, project,
    test: {
      card: {}, goalCondition: "G",
      requiredTraceIds: ["LOG-1"], availableTraceIds: ["LOG-1"],
      simulationSnapshots: [{ split: [1] }, { split: [1] }]
    },
    card: {}
  });
  assert.equal(result.decision, "PASS");
});


test("PROJECT TAG_SEARCH operationはv0401 active routeでschema-legal current SOURCE locatorからcurrent shelfを実読する", () => {
  const result = execute({
    operation: "TAG_SEARCH", ...base, project,
    search: { query: "fixture lookup", intents: [{ kind: "SEARCH_TERM", value: "#TEST:LOOKUP", required: true }] }
  });
  assert.equal(result.decision, "PASS");
  assert.deepEqual(result.moduleOutput.sourcePaths, ["021_G_v001/30_CURRENT/TEST_SOURCE.md"]);
  assert.equal(result.knowledgeEvidence.currentShelfIsAuthority, true);
  assert.equal(result.knowledgeEvidence.shelfBytesActuallyRead, true);
});

test("通常設計工程のまとめ癖矯正5条件はCARDでも維持", () => {
  for (const field of [
    "originals_read", "no_inference_completion", "no_condition_compression",
    "no_source_condition_drop", "summary_not_source"
  ]) {
    const discipline = structuredClone(base.designerDiscipline);
    discipline[field] = false;
    const result = execute({ operation: "CARD", ...base, project, sources: [], card: standardCard(), designerDiscipline: discipline });
    assert.equal(result.decision, "STOP");
    assert.ok(result.issues.some((entry) => entry.code === "DESIGNER_DISCIPLINE_REQUIRED"));
  }
});

test("通常工程の新規項目管理札はCARDでも維持", () => {
  for (const field of ["created_at", "added_reason", "dependency", "related_items", "navigation_references"]) {
    const designerChangeSet = structuredClone(base.designerChangeSet);
    delete designerChangeSet.registrations[0][field];
    const result = execute({ operation: "CARD", ...base, project, sources: [], card: standardCard(), designerChangeSet });
    assert.equal(result.decision, "STOP");
    assert.ok(result.issues.some((entry) =>
      ["NEW_ITEM_FIELD_MISSING", "NEW_ITEM_RELATION_FIELDS_INVALID", "NAVIGATION_UPDATE_UNDECIDED"].includes(entry.code)));
  }
});

test("v0400 TAG_SEARCH/INDEX assetsはactive routeへ復帰し旧ローカルgraph lockは復帰しない", () => {
  const activePaths = Object.values(OPERATION_READS).flat();
  for (const token of ["089_DS_TAG_SEARCH", "098_DS_INDEX", "TAG_INDEX_MACHINE_SCHEMA"]) {
    assert.equal(activePaths.some((path) => path.includes(token)), true, token);
  }
  for (const token of ["PROJECT_TAG_SEARCH_BINDING", "TAG_SEARCH_FULL_CONVERGENCE"]) {
    assert.equal(activePaths.some((path) => path.includes(token)), false, token);
  }
  assert.equal(activePaths.some((path) => path.includes("src/skills/shelfRead.js")), true);
});

test("単話プロファイルは保護束不変・許可出力内だけ", () => {
  const protectedData = {
    episodeBundleCandidates: ["E1"], observationWindowMap: ["W1"],
    connectionOrderLedger: ["E1"], fixedConditionsTable: ["F1"],
    prohibitionTable: ["B1"], returnDestinationTable: ["R1"],
    freedomAreaTable: ["X1"], supportLogBundles: ["L1"],
    narrationConvergenceShelf: "C", zipIntegrity: "H"
  };
  const result = execute({
    operation: "SINGLE_EPISODE_PROFILE_GATE", ...base, project,
    episodeProfile: {
      bundleSize: 1, connectionRows: 1, fixedConditionRows: 1,
      prohibitionRows: 1, returnRows: 1, freedomRows: 1,
      before: protectedData, after: structuredClone(protectedData),
      output: {
        actualMainCharacterCandidate: "Kai",
        secondaryOptionality: true,
        foreground: "object"
      }
    }
  });
  assert.equal(result.decision, "PASS");
});

test("話パックは話数・重複・禁止線・writer整合・単調化を検査", () => {
  const episodes = [1, 2, 3].map((id) => ({
    id: `E${id}`, profileId: `P${id}`, cardId: `C${id}`,
    writerRequestCardId: `C${id}`, canonicalAnchor: "A",
    returnDestination: `R${id}`, requiredStopIds: ["B1"], observedStopIds: ["B1"],
    mainCharacter: `M${id}`, secondary: null, openingType: `O${id}`, receiver: `V${id}`
  }));
  const result = execute({
    operation: "EPISODE_PACK", ...base, project,
    episodePack: { expectedCount: 3,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(), episodes, maxSameRoleRun: 3 }
  });
  assert.equal(result.decision, "PASS");
});

test("LOGは根拠付き非正本ログを入口経由で受ける", () => {
  const result = execute({
    operation: "LOG", ...base, externalContext: project, sources: [],
    log: { kind: "HEAT", source: "user:message", usedAsCanonical: false }
  });
  assert.equal(result.decision, "PASS");
  assert.equal(result.handler, "LOG");
});

test("ARCHIVEは候補を保持し、削除済み自己申告をSTOPする", () => {
  const request = {
    operation: "ARCHIVE", ...base, externalContext: project, sources: [],
    archive: { candidates: [{ path: "reference/old.md", state: "RETAINED" }] }
  };
  assert.equal(execute(request).decision, "PASS");
  request.archive.markCandidateDeleted = true;
  assert.equal(execute(request).decision, "STOP");
});

test("マウント移管はC start gate再起動・境界・物流台帳を同時検査", () => {
  const result = execute({
    operation: "MOUNT_TRANSFER", ...base, project, sources: [], currentMount: { present: true },
    mountTransferInvocation: {
      mode: "MOUNT_TRANSFER_BACKPACK", operation: "MOUNT_TRANSFER",
      origin: "USER_EXPLICIT", reason: "transfer"
    },
      transfer: {
      currentMountPresent: true, controlStartGateRead: true, inventoryBuilt: true,
      diffReportBuilt: true,
      phase: "PREPARE",
      dailyPrimarySource: "MOUNT_ZIP",
      canonicalArchive: "PROJECT_HISTORY_SHELF",
      mountTransferProcessActive: true,
      existingShelvesPreserved: true,
      nextIndividualRestartReady: true,
      inventory: [{ id: "I1" }],
      reflected: [{ id: "I1" }],
      held: [],
      discarded: [],
      resultControlHandoff: {
        entrypoint: "00_READ_FIRST/DS90_START_GATE.md",
        readOrder: ["00_READ_FIRST/DS90_START_GATE.md", "00_READ_FIRST/DS90_START_GATE.json", "00_READ_FIRST/RUNTIME_DIRECT_DISPATCH.json"],
        currentLocation: "PKDB", unresolvedStops: [], nextWork: "continue"
      },
      restartResolvedRefs: [{ path: "00_READ_FIRST/DS90_START_GATE.md", section: "boot", exists: true, read: true }]
      ,librarian: validLibrarian()
    }
  });
  assert.equal(result.decision, "PASS");
});

test("共通運用を本文条件源にした移管はSTOP", () => {
  const result = execute({
    operation: "MOUNT_TRANSFER", ...base, project, sources: [], currentMount: { present: true },
    mountTransferInvocation: {
      mode: "MOUNT_TRANSFER_BACKPACK", operation: "MOUNT_TRANSFER",
      origin: "USER_EXPLICIT", reason: "transfer"
    },
      transfer: {
      currentMountPresent: true, controlStartGateRead: true, inventoryBuilt: true,
      diffReportBuilt: true, phase: "PREPARE",
      dailyPrimarySource: "MOUNT_ZIP", canonicalArchive: "PROJECT_HISTORY_SHELF",
      mountTransferProcessActive: true,
      existingShelvesPreserved: true,
      nextIndividualRestartReady: true, mountTransferProcessActive: true, existingShelvesPreserved: true, nextIndividualRestartReady: true,
      commonOperationUsedAsStorySource: true,
      inventory: [{ id: "I1" }], reflected: [{ id: "I1" }], held: [], discarded: [],
      resultControlHandoff: {
        entrypoint: "00_READ_FIRST/DS90_START_GATE.md",
        readOrder: ["00_READ_FIRST/DS90_START_GATE.md", "00_READ_FIRST/DS90_START_GATE.json", "00_READ_FIRST/RUNTIME_DIRECT_DISPATCH.json"],
        currentLocation: "PKDB", unresolvedStops: [], nextWork: "continue"
      },
      restartResolvedRefs: [{ path: "00_READ_FIRST/DS90_START_GATE.md", section: "boot", exists: true, read: true }]
      ,librarian: validLibrarian()
    }
  });
  assert.equal(result.decision, "STOP");
});

test("明示ユーザー裁定だけが一致規則を上書きする", () => {
  const result = execute({
    operation: "BOOT",
    ...base,
    boot: { ...base.boot, readLedger: ledger.slice(1) },
    userOverrides: [{
      ruleId: "ALWAYS_READ_MISSING",
      operation: "BOOT",
      scope: "boot.readLedger",
      decision: "ALLOW",
      persistence: "ONCE",
      userDecisionRef: { sourcePath: "chat", section: "user-decision-1" }
    }]
  });
  assert.equal(result.decision, "USER_OVERRIDDEN");
});

test("不一致ユーザー裁定は無効", () => {
  const result = execute({
    operation: "BOOT",
    ...base,
    boot: { ...base.boot, readLedger: [] },
    userOverrides: [{
      ruleId: "OTHER",
      operation: "BOOT",
      scope: "*",
      decision: "ALLOW",
      persistence: "ONCE",
      userDecisionRef: { sourcePath: "chat", section: "x" }
    }]
  });
  assert.equal(result.decision, "STOP");
});

test("自己申告合否実装が残っていない", () => {
  const files = [
    "../src/modules/check.js", "../src/modules/card.js", "../src/modules/cardTest.js",
    "../src/modules/transfer.js", "../src/profiles/singleEpisodeProfileGate.js",
    "../src/runtime/rule.js"
  ];
  for (const file of files) {
    assert.doesNotMatch(readFileSync(new URL(file, import.meta.url), "utf8"), /assertion\(|assertions\./);
  }
});

test("原090の25資産相当を保持する", () => {
  assert.equal(Object.keys(ASSET_REGISTRY.specs).length, 11);
  assert.equal(Object.keys(ASSET_REGISTRY.samples).length, 18);
  assert.equal(Object.keys(ASSET_REGISTRY.templates).length, 9);
});

test("上位運用とCODEX検査治具の境界を保持する", () => {
  assert.equal(COMPARISON_ASSETS.fileCount, 23);
  assert.equal(COMPARISON_ASSETS.canonical, false);
  assert.equal(COMPARISON_ASSETS.role, "CODEX_FIXTURE_IGNORED_BY_GPT_RUNTIME");
  assert.equal(OPERATION_ASSETS.archivedVersionsIncluded, true);
  assert.equal(OPERATION_ASSETS.runtimeHistoryIncluded, false);
  assert.equal(OPERATION_ASSETS.historyActiveByDefault, false);
  assert.equal(OPERATION_ASSETS.historyOptionalRoutesOnly, true);
  // V020 keeps history/reference shelves in the ZIP, but not in active story routes.
  assert.ok(ALWAYS_READ.includes(
    "assets/operation_mount/10_CANON/150_STANDARD_CARD_SPEC.md"
  ));
  assert.ok(ALWAYS_READ.includes(
    "assets/dsgn_infra/04_MODULE/common/DESIGNER_RUNTIME_ACTIVE_ROUTE_NO_RESIDUE_LOCK_v020.md"
  ));
  assert.ok(OPERATION_READS.CARD.includes(
    "assets/operation_mount/10_CANON/151_STANDARD_CARD_TEMPLATE.md"
  ));
  assert.equal(Object.values(OPERATION_READS).flat().some((path) => path.startsWith("assets/comparison/")), false);
});



test("全operation read pathは実在し、PACK_CUTOUTは現行V2導線を必読する", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const root = resolve(here, "..");
  const paths = [...new Set([...Object.values(OPERATION_READS).flat(), ...Object.values(INTERNAL_FALLBACK_READS).flat()])];
  for (const path of paths) {
    assert.equal(existsSync(resolve(root, path)), true, `${path} should exist`);
  }
  assert.ok(INTERNAL_FALLBACK_READS.PACK_CUTOUT.includes(
    "assets/dsgn_infra/04_MODULE/packager/PACKAGER_CURRENT_ROUTE_V2_v0194.md"
  ));
  assert.ok(INTERNAL_FALLBACK_READS.PACK_CUTOUT.includes(
    "assets/dsgn_infra/04_MODULE/packager/PACKAGER_ABSOLUTE_PACKAGING_LOCK_v0199.md"
  ));
  assert.ok(INTERNAL_FALLBACK_READS.PACK_CUTOUT.includes(
    "assets/dsgn_infra/03_REFERENCE/layer/layer_alias_to_current_keys_v0194.md"
  ));
  assert.ok(INTERNAL_FALLBACK_READS.PACK_CUTOUT.includes(
    "assets/samples/SAMPLE_REFERENCES/WRITING_FREEZE_CARD_TEMPLATE_V2.md"
  ));
});



test("V020 cleanupはPACK_CUTOUT必読・schema正本・残骸ゼロ導線を収束する", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const root = resolve(here, "..");
  const read = (path) => readFileSync(resolve(root, path), "utf8");

  assert.ok(INTERNAL_FALLBACK_READS.PACK_CUTOUT.includes(
    "assets/dsgn_infra/04_MODULE/common/ALL_LINE_FULL_CONVERGENCE_SWEEP_LOCK_v001.md"
  ));

  const handoffSchema = JSON.parse(read("assets/dsgn_infra/04_MODULE/packager/PACKAGER_WRITER_HANDOFF_SCHEMA_v1.json"));
  assert.equal(handoffSchema.applies_to_designer_runtime, "DS90-v020-NLCORE-MOUNT-TRANSFER-PACKAGING-THREE-ZERO-LOCKED");
  assert.equal(handoffSchema.schema_sha256_scope, "canonical_json_without_schema_sha256_field");
  const { schema_sha256, ...schemaWithoutDigest } = handoffSchema;
  const sortRecursively = (value) => {
    if (Array.isArray(value)) return value.map(sortRecursively);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortRecursively(value[key])]));
    }
    return value;
  };
  const canonical = JSON.stringify(sortRecursively(schemaWithoutDigest));
  assert.equal(createHash("sha256").update(canonical).digest("hex"), schema_sha256);

  const readme = read("README.md");
  assert.ok(readme.includes("WORLD_AXIS_LAYER_BINDING_SCHEMA_v1.json"));
  assert.ok(readme.includes("EPISODE_LAYER_ACTIVATION_SCHEMA_v1.json"));

  const loadOrder = read("load_order.md");
  assert.equal(loadOrder.includes("preceding four files"), false);
  assert.ok(loadOrder.includes("ready / V2 / world_axis_layer_binding / episode_layer_activation / layer / crosscheck"));
});

test("現行話パック導線はフルpath・1話1フォルダ・汎用テンプレへ収束する", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const root = resolve(here, "..");
  const read = (path) => readFileSync(resolve(root, path), "utf8");

  const transfer = read("assets/specs/095_DS_MOUNT_TRANSFER.md");
  assert.ok(transfer.includes("assets/templates/RESTART_MEMO_TEMPLATE.txt"));
  assert.equal(transfer.includes("090_EXTERNAL_TEMPLATES/RESTART_MEMO_TEMPLATE.txt"), false);

  const loadOrder = read("load_order.md");
  for (const path of [
    "assets/dsgn_infra/04_MODULE/packager/pack_cutout_module_v1.md",
    "assets/dsgn_infra/04_MODULE/packager/PACKAGER_CURRENT_ROUTE_V2_v0194.md",
    "assets/dsgn_infra/03_REFERENCE/layer/layer_alias_to_current_keys_v0194.md"
  ]) assert.ok(loadOrder.includes(path));
  assert.equal(loadOrder.includes("assets/dsgn_infra/05_INSERT/nom/nom_gate_insert_min_v3.md"), false);

  const zipStructure = read("assets/samples/SAMPLE_REFERENCES/ZIP_STRUCTURE_V2.md");
  for (const file of [
    "00_episode_index.md", "01_ready.md", "02_v2.md",
    "03_layer.md", "04_crosscheck.md", "05_frozen.md"
  ]) assert.ok(zipStructure.includes(file));
  assert.equal(zipStructure.includes("04_writer_ready/"), false);
  assert.equal(zipStructure.includes("05_writing_freeze/"), false);

  const cutout = read("assets/dsgn_infra/04_MODULE/packager/pack_cutout_module_v1.md");
  assert.ok(cutout.includes("### 00_episode_index.md"));
  assert.equal(/episode_001\/[\s\S]{0,80}00_README\.md/.test(cutout), false);

  const genericTemplates = [
    "assets/samples/SAMPLE_REFERENCES/WRITER_READY_CARD_TEMPLATE_V2.md",
    "assets/samples/SAMPLE_REFERENCES/WORK_PROFILE_TEMPLATE_V2.md",
    "assets/samples/SAMPLE_REFERENCES/WRITING_FREEZE_CARD_TEMPLATE_V2.md",
    "assets/samples/SAMPLE_REFERENCES/REVERSE_EXTRACTION_CHECKLIST_V2.md"
  ].map(read).join("\n");
  assert.equal(/猫又|実猫|猫|店内|客の一拍|皿|席/.test(genericTemplates), false);

  const noResidue = read("assets/dsgn_infra/04_MODULE/common/DESIGNER_RUNTIME_ACTIVE_ROUTE_NO_RESIDUE_LOCK_v020.md");
  assert.ok(noResidue.includes("ACTIVE ROUTE NO RESIDUE LOCK"));
  assert.ok(noResidue.includes("may be retained inside the ZIP"));
  assert.ok(noResidue.includes("must not ingest them as current sources"));

  const routeSchema = read("assets/dsgn_infra/04_MODULE/packager/PACKAGER_CURRENT_ROUTE_V2_v0194.md");
  assert.ok(routeSchema.includes("VERSION: v019.4 route schema"));
  assert.ok(routeSchema.includes("APPLIES_TO_RUNTIME: DS90-v020-NLCORE-MOUNT-TRANSFER-PACKAGING-THREE-ZERO-LOCKED"));

  const sampleIndex = read("assets/samples/SAMPLE_REFRESH_INDEX_v019_4.md");
  assert.ok(sampleIndex.includes("VERSION: v019.4 route schema"));
  assert.ok(sampleIndex.includes("APPLIES_TO_RUNTIME: DS90-v020-NLCORE-MOUNT-TRANSFER-PACKAGING-THREE-ZERO-LOCKED"));

  for (const path of [
    "assets/samples/SAMPLE_REFERENCES/CARD_TEMPLATE_SAMPLE_V2_README.md",
    "assets/samples/SAMPLE_REFERENCES/CARD_TEMPLATE_SAMPLE_V2_USAGE_RULES.md"
  ]) {
    const imported = read(path);
    assert.ok(imported.includes("NOT_CURRENT_TEMPLATE: true"));
    assert.ok(imported.includes("CURRENT_ROUTE: assets/samples/SAMPLE_REFRESH_INDEX_v019_4.md"));
  }
  const importedManifest = JSON.parse(read(
    "assets/samples/SAMPLE_REFERENCES/CARD_TEMPLATE_SAMPLE_V2_MANIFEST.json"
  ));
  assert.equal(importedManifest.not_current_template, true);
  assert.equal(importedManifest.current_route, "assets/samples/SAMPLE_REFRESH_INDEX_v019_4.md");

  const layerTemplate = read("assets/templates/LAYER_PROFILE_TEMPLATE.md");
  assert.ok(layerTemplate.includes("執筆凍結カードへ渡す確定抽出"));
  assert.equal(layerTemplate.includes("執筆凍結カードへ渡す最小抽出"), false);

  const absolute = read("assets/dsgn_infra/04_MODULE/packager/PACKAGER_ABSOLUTE_PACKAGING_LOCK_v0199.md");
  assert.ok(absolute.includes("話パック生成は、必ず梱包さんが行う"));
  assert.ok(absolute.includes("PACKAGER_GENERATION_PROOF_MISSING"));
  assert.equal(/方言|寄せました/.test(absolute), false);

  const canonical = read("assets/dsgn_infra/04_MODULE/packager/PACKAGER_WRITER_CANONICAL_HANDOFF_CONTRACT_v0198.md");
  assert.ok(canonical.includes("PACKAGER_TO_PACK_WRITER_CANONICAL_ROUTE"));
  assert.ok(canonical.includes("00_sourceMountIndex.json"));
  assert.ok(canonical.includes("03_layer_binding_manifest.json"));
  assert.ok(canonical.includes("materialMapRequired=false"));
  assert.ok(canonical.includes("absolutePackagerPackagingLocked"));
  assert.equal(/方言|寄せました/.test(canonical), false);
  assert.ok(canonical.includes("INTERNAL_PACK_REFERENCE_MISSING"));
  assert.ok(canonical.includes("PW90_WRITABLE_ZIP_PACK_CURRENT"));

  const fullConvergenceLock = read("assets/dsgn_infra/04_MODULE/packager/FULL_CONVERGENCE_SWEEP_LOCK_v0198.md");
  assert.ok(fullConvergenceLock.includes("FULL_CONVERGENCE_SWEEP_LOCK"));
  assert.ok(fullConvergenceLock.includes("residueItems"));

  const allLineConvergence = read("assets/dsgn_infra/04_MODULE/common/ALL_LINE_FULL_CONVERGENCE_SWEEP_LOCK_v001.md");
  assert.ok(allLineConvergence.includes("FULL_CONVERGENCE_SWEEP_LOCK"));

  const currentRoute = read("assets/dsgn_infra/04_MODULE/packager/PACKAGER_CURRENT_ROUTE_V2_v0194.md");
  assert.ok(currentRoute.includes("APPLIES_TO_RUNTIME: DS90-v020-NLCORE-MOUNT-TRANSFER-PACKAGING-THREE-ZERO-LOCKED"));
  assert.ok(currentRoute.includes("00_sourceMountIndex.json"));
  assert.ok(currentRoute.includes("03_layer_binding_manifest.json"));
  assert.equal(currentRoute.includes("material map に未分類section"), false);
});

test("全moduleを登録する", () => {
  assert.deepEqual(Object.keys(MODULES), [
    "CORE", "CHECK", "TAG_SEARCH", "CARD", "CARD_TEST", "LOG",
    "MOUNT_TRANSFER", "ARCHIVE", "END_LOG",
    "SINGLE_EPISODE_PROFILE_GATE", "EPISODE_PACK", "PACK_CUTOUT", "SPECIALIST_HANDOFF", "SPECIALIST_DISPATCH"
  ]);
});

const validWriterComfortCheck = () => ({
  coreLocked: true,
  requiredElementsLocked: true,
  requiredOrderLocked: true,
  forbiddenLinesLocked: true,
  connectionLocked: true,
  layerResolved: true,
  frozenNotReadSubstitute: true,
  sourceUnverifiedNotWritten: true,
  textDensityGuarded: true,
  bodySourceRolesSeparated: true,
  selfContainedSourceAddressesLocked: true,
  designOutputAuthority: "DESIGN_OUTPUT_CANDIDATE",
  reciprocalHandoffRespectLocked: true,
  handoffRespectPolicy: {
    wouldAcceptAsDownstream: true,
    doesNotAskWriterToInferMissingInput: true,
    doesNotPromoteUnverifiedSource: true,
    preservesBodySourceRoleLabels: true,
    actionableStopPrepared: true,
    noBlameLanguagePolicy: true,
    warnDoesNotBlockSpecPass: true
  },
  endUserHeatDeliveryLocked: true,
  userHeatPolicy: {
    capturesUserRequestedVision: true,
    preservesUserHeatThroughPack: true,
    doesNotFlattenToGenericSafeOutput: true,
    doesNotReplaceVisionWithProcessConvenience: true,
    warnDoesNotCoolSpecPass: true,
    stopKeepsVisionAndNamesRepairPoint: true,
    deliversWithinVerifiedMaterials: true
  },
  fullConvergenceSweepLocked: true,
  convergenceSweepPolicy: {
    noUnresolvedPackResidue: true,
    noDanglingSourceAddress: true,
    noUnclassifiedWarn: true,
    noOpenRepairWithoutStopTicket: true,
    noWriterComfortResidue: true,
    noHeatDeliveryResidue: true,
    noPackagerAbsolutePackagingResidue: true,
    noPackagerWriterHandoffResidue: true,
    rerunUntilStable: true
  },
  coverageIdPolicyLocked: true,
  coverageTablePolicyDeclared: true,
  returnTicketPolicyDeclared: true,
  warnClassificationLocked: true,
  conflictResolutionOrderLocked: true,
  pretextDeliveryIntentRequired: true,
  fullConvergenceSweepPlanned: true,
  fullConvergenceSweepComplete: true,
  artifactEqualsFullConvergenceLocked: true,
  artifactFullConvergencePolicy: {
    artifactMeansFullyConvergedOutput: true,
    candidateNotDeliveredAsArtifact: true,
    fullConvergenceBeforeHandoff: true,
    manifestAndRequiredReadsVerified: true,
    internalAddressesResolved: true,
    processProofAndInspectionPresent: true,
    stopInsteadOfArtifactOnResidue: true
  },
  warnClasses: ["CRAFT_WARN", "SPEC_WARN", "STOP"],
  quarantineReturnTicketFields: ["reason", "impact", "requiredFix", "boundary", "resumeCondition"],
  residueItems: [],
  bodySourcePolicy: {
    restoreSource: ["01_ready.md", "02_v2.md"],
    restoreConstraint: ["03_layer.md", "05_frozen.md"],
    processOnly: ["04_crosscheck.md", "06_execution_queue.md"],
    referenceOnly: ["07_sources.md"],
    denyAsBodySource: ["00_episode_index.md", "03_layer_binding_manifest.json", "00_packGateIndex.json", "00_sourceMountIndex.json", "README", "manifest", "log"]
  }
});

const validPackRootFiles = () => [
  "00_README.md",
  "00_packGateIndex.json",
  "00_sourceMountIndex.json",
  "01_pack_profile.md",
  "02_world_axis_used.md",
  "03_character_used.md",
  "04_layer_common.md",
  "04_world_axis_layer_binding.json",
  "08_terms.md",
  "09_writer_boot.md",
  "10_stop_rules.md",
  "11_layer_backlog.md"
];

const validPackRootShelves = () => [
  "05_band_profiles",
  "06_continuity",
  "07_episodes",
  "12_pack_cutout_log"
];

const validPackCutoutLogShelf = () => ({
  files: [
    "00_packager_generation_proof.json",
    "01_packager_inspection_result.json",
    "02_writer_handoff_check.json",
    "03_writer_output_comfort_check.json",
    "04_full_convergence_sweep.json",
    "05_cutout_log.md"
  ]
});

const validPackagerWriterHandoff = () => ({
  singleRouteLocked: true,
  absolutePackagerPackagingLocked: true,
  packagerOutputOnly: true,
  designerPackagingAllowed: false,
  writerConsumesOnlyPackagerOutput: true,
  packagerRouteStatus: "FIXED_CONFIRMED",
  canonicalRoute: "PACKAGER_TO_PACK_WRITER_CANONICAL_ROUTE",
  packagerProcessActive: true,
  generatedBy: "PACKAGER_PROCESS",
  generatedByDesigner: false,
  manualPack: false,
  designerDirectPack: false,
  writerRuntimeTarget: "PW90_WRITABLE_ZIP_PACK_CURRENT",
  writerGate: "V2_FOLDER_PROJECTLOCKED_REAL_PACK_GATE",
  inputMode: "V2_EPISODE_FOLDER_PROJECTLOCKED_REAL_PACK",
  materialMapRequired: false,
  storyPackSelfContained: true,
  preclearedStopHackUsed: false,
  worldAxisLayerBindingRequired: true,
  episodeLayerActivationRequired: true,
  handoffSchema: "PACKAGER_WRITER_HANDOFF_SCHEMA_v1",
  handoffSchemaSha256: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  packagerRuntimeVersion: "PACKAGER_PROCESS_TEST",
  packagerRuntimeSha256: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  rootRequiredFiles: [
    "00_README.md",
    "00_packGateIndex.json",
    "00_sourceMountIndex.json",
    "01_pack_profile.md",
    "02_world_axis_used.md",
    "03_character_used.md",
    "04_layer_common.md",
    "04_world_axis_layer_binding.json",
    "08_terms.md",
    "09_writer_boot.md",
    "10_stop_rules.md",
    "11_layer_backlog.md"
  ],
  rootRequiredShelves: ["05_band_profiles", "06_continuity", "07_episodes", "12_pack_cutout_log"],
  episodeRequiredFiles: [
    "00_episode_index.md",
    "01_ready.md",
    "02_v2.md",
    "03_layer.md",
    "03_layer_binding_manifest.json",
    "04_crosscheck.md",
    "05_frozen.md",
    "06_execution_queue.md",
    "07_sources.md"
  ],
  bodySourceRoles: {
    RESTORE_SOURCE: ["01_ready.md", "02_v2.md"],
    RESTORE_CONSTRAINT: ["03_layer.md", "05_frozen.md"],
    PROCESS_ONLY: ["04_crosscheck.md", "06_execution_queue.md"],
    REFERENCE_ONLY: ["07_sources.md"],
    DENY_AS_BODY_SOURCE: ["00_episode_index.md", "03_layer_binding_manifest.json", "00_packGateIndex.json", "00_sourceMountIndex.json", "README", "manifest", "log"]
  },
  sourceMountIndexRole: "internal_source_record_index",
  packagerInspection: {
    decision: "PASS",
    zipSafe: true,
    rootShapeOk: true,
    episodeShapeOk: true,
    jsonParseOk: true,
    sourceLineRefsOk: true,
    bodySourceRolesSeparated: true,
    layerManifestSafe: true,
    internalSourceRecordPolicyDeclared: true,
    writerGateTarget: "V2_FOLDER_PROJECTLOCKED_REAL_PACK_GATE"
  }
});


const validWorldAxisLayerBinding = () => ({
  layerDoesNotModifyWorldAxis: true,
  layerCreatesWorldFacts: false,
  unverifiedSourcePromotionAllowed: false,
  writerReadsAs: "CONSTRAINT_ONLY_DENY_BODY_SOURCE",
  stop_policy: [
    "WORLD_FACT_MODIFICATION_BY_LAYER",
    "UNVERIFIED_SOURCE_PROMOTION",
    "MISSING_WORLD_AXIS_TARGET",
    "MISSING_BINDING_SOURCE"
  ],
  bindings: [{
    binding_id: "WALB-E001-001",
    world_axis_target: { axis: "place_state", id: "kitchen.counter" },
    layer_key: "foreground",
    allowed_effect: ["increase_scene_weight", "adjust_observation_order"],
    forbidden_effect: ["create_world_fact", "modify_location_state", "promote_unverified_source"],
    scope: "episode",
    source_refs: ["PROJECT_SIDE_CURRENT_LOCKED#L1-L5", "episode_ready#R1"],
    writer_role: ["CONSTRAINT_ONLY", "EMPHASIS_GUIDE", "DENY_AS_BODY_SOURCE"],
    body_source: false,
    stop_policy: [
      "WORLD_FACT_MODIFICATION_BY_LAYER",
      "UNVERIFIED_SOURCE_PROMOTION",
      "MISSING_WORLD_AXIS_TARGET",
      "MISSING_BINDING_SOURCE"
    ]
  }]
});

const validCutoutEpisode = () => ({
  id: "E001",
  episodeIndex: {
    requiredFileIds: ["index", "ready", "v2", "layer", "layerBindingManifest", "crosscheck", "frozen", "executionQueue", "sources"],
    readOrder: ["index", "ready", "v2", "layer", "layerBindingManifest", "crosscheck", "frozen", "executionQueue", "sources"],
    usedAsReadSubstitute: false,
    usedAsStorySource: false
  },
  files: [
    { id: "index", filename: "00_episode_index.md", exists: true, read: true, role: "DENY_AS_BODY_SOURCE" },
    { id: "ready", filename: "01_ready.md", exists: true, read: true, role: "RESTORE_SOURCE" },
    { id: "v2", filename: "02_v2.md", exists: true, read: true, role: "RESTORE_SOURCE" },
    { id: "layer", filename: "03_layer.md", exists: true, read: true, role: "RESTORE_CONSTRAINT" },
    { id: "layerBindingManifest", filename: "03_layer_binding_manifest.json", exists: true, read: true, role: "DENY_AS_BODY_SOURCE" },
    { id: "crosscheck", filename: "04_crosscheck.md", exists: true, read: true, role: "PROCESS_ONLY" },
    { id: "frozen", filename: "05_frozen.md", exists: true, read: true, role: "RESTORE_CONSTRAINT" },
    { id: "executionQueue", filename: "06_execution_queue.md", exists: true, read: true, role: "PROCESS_ONLY" },
    { id: "sources", filename: "07_sources.md", exists: true, read: true, role: "REFERENCE_ONLY" }
  ],
  lineCounts: {
    "07_episodes/episode_001/01_ready.md": 40
  },
  layerBindingManifest: {
    target_story: "E001",
    layer_mode: "ON",
    bindings: [{
      item: "内圧変換",
      selected_value: "手元の道具をいじる",
      source_id: "ready:E001:heat_layer:02",
      source_role: "story_condition",
      source_file_current: "07_episodes/episode_001/01_ready.md",
      source_lines_current: "L10-L20",
      project_source_refs: ["project.zip#world-axis:L1-L5"],
      allowed_use: "emotion_to_observable_action",
      forbidden_expansion: ["do_not_add_new_event", "do_not_infer_new_backstory"]
    }],
    reference_only: ["男の子候補棚"]
  },
  layerActivation: {
    activation_mode: "SELECT",
    preset_id: null,
    enabled_layers: ["foreground", "observation_position"],
    disabled_layers: ["metaphor", "syntax_variation"],
    selection_reason: "今回は前景と観測位置だけを使う",
    full_activation_reason: null,
    writer_rule: "enabled_layers_only",
    allLayersDefaultOn: false,
    defaultFullActivation: false,
    layer_backlog_policy: ["unused_layers_to_11_layer_backlog"]
  },
  ready: { conditionIds: ["R1", "R2"] },
  v2: { sceneIds: ["S1", "S2"] },
  layer: {
    surfaceAxis: "objective",
    pressureAxis: "actual-main",
    narrationDestination: "character-sensory-range",
    leakAxis: "hands",
    irregularFrame: [],
    episodeSupplement: "local",
    backlogRouting: "none",
    closingVector: "residue",
    expectedTextEffect: "quiet pressure remains"
  },
  crosscheck: {
    readyConditionIdsRecoveredByV2: ["R1", "R2"],
    unmapped: [],
    conflicts: []
  },
  frozen: { summarizesInsteadOfReferences: false },
  requiresExecutionQueue: false
});

const validGateIndex = () => ({
  episodeIds: ["E001"],
  readOrder: ["E001"],
  usedAsReadSubstitute: false,
  usedAsStorySource: false
});

test("PACK_CUTOUTは9ファイルを分離し三回ゼロで通す", () => {
  const request = {
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: {
      mode: "DSGN.MODE.pack_cutout",
      invocationOrigin: "USER_EXPLICIT",
      registrations: [{ value: "dsgn.packager.crosscheck" }],
      lookup: {
        requests: [{
          tag: "dsgn.packager.crosscheck",
          sourceId: "DSGN.SRC.pack.cutout.v1"
        }]
      }
    },
    packCutout: {
      ...validArtifactDelivery(),
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: validWriterComfortCheck(),
      packagerWriterHandoff: validPackagerWriterHandoff(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [validCutoutEpisode()]
    }
  };
  const result = execute(request);
  assert.equal(result.decision, "PASS");
  assert.equal(result.modeCompletion, "STAY_IN_PACKAGER");
  request.packCutout.dryRuns[2].route_mismatch = 1;
  const failed = execute(request);
  assert.equal(failed.decision, "STOP");
  assert.ok(failed.issues.some((entry) => entry.ruleId === "THREE_ZERO_COUNTER_NONZERO"));
});

test("PACK_CUTOUTはlayer欠損とready未回収をSTOP", () => {
  const episode = validCutoutEpisode();
  delete episode.layer.pressureAxis;
  episode.crosscheck.readyConditionIdsRecoveredByV2 = ["R1"];
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: { mode: "DSGN.MODE.pack_cutout", invocationOrigin: "USER_EXPLICIT" },
    packCutout: {
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: validWriterComfortCheck(),
      packagerWriterHandoff: validPackagerWriterHandoff(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [episode]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "PACK_LAYER_FIELD_MISSING"));
  assert.ok(result.issues.some((entry) => entry.ruleId === "READY_V2_UNMAPPED"));
});

test("DSGNとproject名前空間の混線をSTOP", () => {
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: {
      mode: "DSGN.MODE.pack_cutout",
      invocationOrigin: "USER_EXPLICIT",
      registrations: [{ value: "project.cat.episode.049" }]
    },
    packCutout: {
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: validWriterComfortCheck(),
      packagerWriterHandoff: validPackagerWriterHandoff(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [validCutoutEpisode()]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "NAMESPACE_MIXED"));
});

test("旧語の変奏あり単一値をSTOP", () => {
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: {
      mode: "DSGN.MODE.pack_cutout",
      invocationOrigin: "USER_EXPLICIT",
      lookup: { oldAliases: ["変奏あり"] }
    },
    packCutout: {
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: validWriterComfortCheck(),
      packagerWriterHandoff: validPackagerWriterHandoff(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [validCutoutEpisode()]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "OLD_ALIAS_SINGLE_VALUE"));
});

test("DSGN辞書を執筆さんへ渡す指定はSTOP", () => {
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: { mode: "DSGN.MODE.pack_cutout", invocationOrigin: "USER_EXPLICIT" },
    packCutout: {
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: validWriterComfortCheck(),
      packagerWriterHandoff: validPackagerWriterHandoff(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [validCutoutEpisode()],
      sendDsgnReferencesToWriter: true
    }
  });
  assert.equal(result.decision, "STOP");
});

test("設計さん自律起動は完了後に設計さんへ戻る", () => {
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: {
      mode: "DSGN.MODE.pack_cutout",
      invocationOrigin: "DESIGNER_AUTO",
      autoTriggerReason: "BUILD_WRITER_PACKAGE"
    },
    packCutout: {
      ...validArtifactDelivery(),
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: validWriterComfortCheck(),
      packagerWriterHandoff: validPackagerWriterHandoff(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [validCutoutEpisode()]
    }
  });
  assert.equal(result.decision, "PASS");
  assert.equal(result.modeCompletion, "RETURN_TO_DESIGNER");
});

test("設計さん自律起動はSTOPでも設計さんへ戻る", () => {
  const episode = validCutoutEpisode();
  delete episode.layer.leakAxis;
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: {
      mode: "DSGN.MODE.pack_cutout",
      invocationOrigin: "DESIGNER_AUTO",
      autoTriggerReason: "REPAIR_READY_V2_LAYER_MISMATCH"
    },
    packCutout: {
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: validWriterComfortCheck(),
      packagerWriterHandoff: validPackagerWriterHandoff(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [episode]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.equal(result.modeCompletion, "RETURN_TO_DESIGNER");
});

test("自律起動理由が未定義ならSTOP", () => {
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: {
      mode: "DSGN.MODE.pack_cutout",
      invocationOrigin: "DESIGNER_AUTO",
      autoTriggerReason: "UNKNOWN"
    },
    packCutout: {
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: validWriterComfortCheck(),
      packagerWriterHandoff: validPackagerWriterHandoff(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [validCutoutEpisode()]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "PACK_INVOCATION_INVALID"));
});

test("PACK_CUTOUTはv004.8各話9ファイル常置でない1枚構成をSTOP", () => {
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: { mode: "DSGN.MODE.pack_cutout", invocationOrigin: "USER_EXPLICIT" },
    packCutout: {
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: validWriterComfortCheck(),
      packagerWriterHandoff: validPackagerWriterHandoff(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [{
        id: "E001",
        layerBindingManifest: {
          target_story: "E001",
          layer_mode: "ON",
          bindings: [{
            item: "内圧変換",
            selected_value: "手元の道具をいじる",
            source_id: "single:E001:heat_layer:02",
            source_role: "story_condition",
            source_file_current: "07_episodes/episode_001/01_ready.md",
            source_lines_current: "L10-L20",
            project_source_refs: ["project.zip#world-axis:L1-L5"],
            allowed_use: "emotion_to_observable_action",
            forbidden_expansion: ["do_not_add_new_event"]
          }]
        },
        episodeIndex: {
          requiredFileIds: ["single"],
          readOrder: ["single"],
          usedAsReadSubstitute: false,
          usedAsStorySource: false
        },
        files: [{ id: "single", exists: true, read: true, role: "story_condition" }]
      }]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "PACK_EPISODE_CANONICAL_FILES_MISSING"));
});

test("PACK_CUTOUTはゲート索引と個別索引の誤用をSTOP", () => {
  const episode = validCutoutEpisode();
  episode.episodeIndex.usedAsStorySource = true;
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: { mode: "DSGN.MODE.pack_cutout", invocationOrigin: "USER_EXPLICIT" },
    packCutout: {
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: { ...validGateIndex(), usedAsReadSubstitute: true },
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: validWriterComfortCheck(),
      packagerWriterHandoff: validPackagerWriterHandoff(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [episode]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "PACK_GATE_INDEX_MISUSED"));
  assert.ok(result.issues.some((entry) => entry.ruleId === "PACK_EPISODE_INDEX_MISUSED"));
});

test("PACK_CUTOUTは個別索引の未解決読み順をSTOP", () => {
  const episode = validCutoutEpisode();
  episode.episodeIndex.readOrder = ["ready", "missing"];
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: { mode: "DSGN.MODE.pack_cutout", invocationOrigin: "USER_EXPLICIT" },
    packCutout: {
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: validWriterComfortCheck(),
      packagerWriterHandoff: validPackagerWriterHandoff(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [episode]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "PACK_EPISODE_READ_ORDER_UNRESOLVED"));
});

test("PACK_CUTOUTはlayer binding manifest欠損と動的結合をSTOP", () => {
  const episode = validCutoutEpisode();
  delete episode.layerBindingManifest;
  const dynamicEpisode = validCutoutEpisode();
  dynamicEpisode.id = "E002";
  dynamicEpisode.episodeIndex.requiredFileIds = ["ready"];
  dynamicEpisode.episodeIndex.readOrder = ["ready"];
  dynamicEpisode.files = [{ id: "ready", exists: true, read: true, role: "story_condition" }];
  dynamicEpisode.layerBindingManifest.dynamicOverlay = true;
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: { mode: "DSGN.MODE.pack_cutout", invocationOrigin: "USER_EXPLICIT" },
    packCutout: {
      expectedCount: 2,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: {
        episodeIds: ["E001", "E002"],
        readOrder: ["E001", "E002"],
        usedAsReadSubstitute: false,
        usedAsStorySource: false
      },
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: validWriterComfortCheck(),
      packagerWriterHandoff: validPackagerWriterHandoff(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [episode, dynamicEpisode]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "LAYER_BINDING_MANIFEST_MISSING"));
  assert.ok(result.issues.some((entry) => entry.ruleId === "LAYER_BINDING_DYNAMIC_DENIED"));
});





test("PACK_CUTOUTは相互受け渡し尊重ロック欠落をSTOP", () => {
  const comfort = validWriterComfortCheck();
  comfort.reciprocalHandoffRespectLocked = false;
  comfort.handoffRespectPolicy.noBlameLanguagePolicy = false;
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: { mode: "DSGN.MODE.pack_cutout", invocationOrigin: "USER_EXPLICIT" },
    packCutout: {
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: comfort,
      packagerWriterHandoff: validPackagerWriterHandoff(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [validCutoutEpisode()]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "RECIPROCAL_HANDOFF_RESPECT_LOCK_MISSING"));
  assert.ok(result.issues.some((entry) => entry.ruleId === "RECIPROCAL_HANDOFF_RESPECT_FLAG_NOT_PASS"));
});


test("PACK_CUTOUTはエンドユーザー熱量保持ロック欠落をSTOP", () => {
  const comfort = validWriterComfortCheck();
  comfort.endUserHeatDeliveryLocked = false;
  comfort.userHeatPolicy.doesNotFlattenToGenericSafeOutput = false;
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: { mode: "DSGN.MODE.pack_cutout", invocationOrigin: "USER_EXPLICIT" },
    packCutout: {
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: comfort,
      packagerWriterHandoff: validPackagerWriterHandoff(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [validCutoutEpisode()]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "END_USER_HEAT_DELIVERY_LOCK_MISSING"));
  assert.ok(result.issues.some((entry) => entry.ruleId === "END_USER_HEAT_DELIVERY_FLAG_NOT_PASS"));
});

test("PACK_CUTOUTは完全収束スイープ残渣をSTOP", () => {
  const comfort = validWriterComfortCheck();
  comfort.fullConvergenceSweepLocked = false;
  comfort.convergenceSweepPolicy.noUnclassifiedWarn = false;
  comfort.residueItems = [{ kind: "WARN", id: "dust-001" }];
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: { mode: "DSGN.MODE.pack_cutout", invocationOrigin: "USER_EXPLICIT" },
    packCutout: {
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: comfort,
      packagerWriterHandoff: validPackagerWriterHandoff(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [validCutoutEpisode()]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "FULL_CONVERGENCE_SWEEP_LOCK_MISSING"));
  assert.ok(result.issues.some((entry) => entry.ruleId === "FULL_CONVERGENCE_SWEEP_FLAG_NOT_PASS"));
  assert.ok(result.issues.some((entry) => entry.ruleId === "FULL_CONVERGENCE_RESIDUE_REMAINING"));
});



test("PACK_CUTOUTは未収束候補を成果物として渡すことをSTOP", () => {
  const comfort = validWriterComfortCheck();
  comfort.artifactEqualsFullConvergenceLocked = false;
  comfort.artifactFullConvergencePolicy.candidateNotDeliveredAsArtifact = false;
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: { mode: "DSGN.MODE.pack_cutout", invocationOrigin: "USER_EXPLICIT" },
    packCutout: {
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: comfort,
      packagerWriterHandoff: validPackagerWriterHandoff(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [validCutoutEpisode()]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "ARTIFACT_FULL_CONVERGENCE_LOCK_MISSING"));
  assert.ok(result.issues.some((entry) => entry.ruleId === "ARTIFACT_FULL_CONVERGENCE_FLAG_NOT_PASS"));
});

test("PACK_CUTOUTは梱包さん-執筆さん単一路線契約欠落をSTOP", () => {
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: { mode: "DSGN.MODE.pack_cutout", invocationOrigin: "USER_EXPLICIT" },
    packCutout: {
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: validWriterComfortCheck(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [validCutoutEpisode()]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "PC-014" || entry.ruleId === "PACKAGER_WRITER_CANONICAL_HANDOFF_MISSING"));
});

test("PACK_CUTOUTはv004.8a以前の執筆さんターゲットをSTOP", () => {
  const handoff = validPackagerWriterHandoff();
  handoff.writerRuntimeTarget = "PW90a";
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: { mode: "DSGN.MODE.pack_cutout", invocationOrigin: "USER_EXPLICIT" },
    packCutout: {
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      packagerWriterHandoff: handoff,
      writerComfortCheck: validWriterComfortCheck(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [validCutoutEpisode()]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "PACKAGER_WRITER_HANDOFF_FIELD_INVALID" &&
    entry.field === "packCutout.packagerWriterHandoff.writerRuntimeTarget"));
});




test("PACK_CUTOUTは世界軸レイヤー設置なしをSTOP", () => {
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: { mode: "DSGN.MODE.pack_cutout", invocationOrigin: "USER_EXPLICIT" },
    packCutout: {
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: validWriterComfortCheck(),
      packagerWriterHandoff: validPackagerWriterHandoff(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [validCutoutEpisode()]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "WORLD_AXIS_LAYER_BINDING_MISSING"));
});

test("PACK_CUTOUTは話レイヤーactivation欠損とFULL理由なしをSTOP", () => {
  const episode = validCutoutEpisode();
  episode.layerActivation.activation_mode = "FULL";
  episode.layerActivation.full_activation_reason = "";
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: { mode: "DSGN.MODE.pack_cutout", invocationOrigin: "USER_EXPLICIT" },
    packCutout: {
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: validWriterComfortCheck(),
      packagerWriterHandoff: validPackagerWriterHandoff(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [episode]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "EPISODE_LAYER_FULL_REASON_MISSING"));
});

test("PACK_CUTOUTは追加TAG_SEARCH接続を梱包前提にせず既存source ledgerで通る", () => {
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: { mode: "DSGN.MODE.pack_cutout", invocationOrigin: "USER_EXPLICIT" },
    packCutout: {
      ...validArtifactDelivery(),
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: validWriterComfortCheck(),
      packagerWriterHandoff: validPackagerWriterHandoff(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [validCutoutEpisode()]
    }
  });
  assert.equal(result.decision, "PASS");
});

test("PACK_CUTOUTは梱包さん生成証明なしをWRITE候補としてSTOP", () => {
  const handoff = validPackagerWriterHandoff();
  handoff.absolutePackagerPackagingLocked = false;
  handoff.packagerOutputOnly = false;
  handoff.generatedBy = "DESIGNER_RUNTIME";
  handoff.designerPackagingAllowed = true;
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: { mode: "DSGN.MODE.pack_cutout", invocationOrigin: "USER_EXPLICIT" },
    packCutout: {
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: validWriterComfortCheck(),
      packagerWriterHandoff: handoff,
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [validCutoutEpisode()]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "PACKAGER_GENERATION_PROOF_MISSING"));
  assert.ok(result.issues.some((entry) => entry.ruleId === "DESIGNER_DIRECT_PACK_DENIED"));
});

test("PACK_CUTOUTはmaterialMap要求と設計さん直梱包を現行話パックとしてSTOP", () => {
  const handoff = validPackagerWriterHandoff();
  handoff.materialMapRequired = true;
  handoff.designerDirectPack = true;
  handoff.generatedBy = "DESIGNER_RUNTIME";
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: { mode: "DSGN.MODE.pack_cutout", invocationOrigin: "USER_EXPLICIT" },
    packCutout: {
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: validWriterComfortCheck(),
      packagerWriterHandoff: handoff,
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [validCutoutEpisode()]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "PACKAGER_WRITER_HANDOFF_FIELD_INVALID"));
  assert.ok(result.issues.some((entry) => entry.ruleId === "MATERIAL_MAP_ROUTE_NOT_CURRENT_WRITER_PACK"));
});

test("PACK_CUTOUTはWRITER_OUTPUT_COMFORT_CHECK欠損をSTOP", () => {
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: { mode: "DSGN.MODE.pack_cutout", invocationOrigin: "USER_EXPLICIT" },
    packCutout: {
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      packagerWriterHandoff: validPackagerWriterHandoff(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [validCutoutEpisode()]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "PC-011" || entry.ruleId === "WRITER_OUTPUT_COMFORT_CHECK_MISSING"));
});

test("PACK_CUTOUTは壊れたcurrent住所とcrosscheck本文源化をSTOP", () => {
  const episode = validCutoutEpisode();
  episode.layerBindingManifest.bindings[0].source_lines_current = "02_world_axis_used.md L1-L42";
  episode.files.push({
    id: "crosscheck",
    path: "07_episodes/episode_001/04_crosscheck.md",
    exists: true,
    read: true,
    role: "RESTORE_SOURCE"
  });
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: { mode: "DSGN.MODE.pack_cutout", invocationOrigin: "USER_EXPLICIT" },
    packCutout: {
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: validWriterComfortCheck(),
      packagerWriterHandoff: validPackagerWriterHandoff(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [episode]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "SOURCE_LINES_CURRENT_INVALID"));
  assert.ok(result.issues.some((entry) => entry.ruleId === "CROSSCHECK_AS_BODY_SOURCE"));
});

test("PACK_CUTOUTは設計さん単独WRITE正本宣言と内部住所検査未PASS final PASSをSTOP", () => {
  const episode = validCutoutEpisode();
  episode.crosscheck.finalPass = true;
  episode.crosscheck.internalPackCrosscheck = "STOP";
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: { mode: "DSGN.MODE.pack_cutout", invocationOrigin: "USER_EXPLICIT" },
    packCutout: {
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: validWriterComfortCheck(),
      writeAuthority: "WRITER_CONSUMABLE_REAL_PACK",
      episodes: [episode]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "DESIGNER_SELF_DECLARED_WRITE_AUTHORITY"));
  assert.ok(result.issues.some((entry) => entry.ruleId === "INTERNAL_PACK_CROSSCHECK_REQUIRED"));
});

test("PACK_CUTOUTは必須内部source record未解決をSTOP", () => {
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: { mode: "DSGN.MODE.pack_cutout", invocationOrigin: "USER_EXPLICIT" },
    packCutout: {
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      sourceMountIndex: {
        source_mounts: [{ mount_id: "PROJECT_SIDE_CURRENT_LOCKED", exists: true, read: true }],
        stop_if_missing: ["PROJECT_SIDE_CURRENT_LOCKED", "INTERNAL_SOURCE_RECORD_REQUIRED"]
      },
      writerComfortCheck: validWriterComfortCheck(),
      packagerWriterHandoff: validPackagerWriterHandoff(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [validCutoutEpisode()]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "INTERNAL_PACK_REFERENCE_MISSING"));
});


test("PACK_CUTOUTは工程明示ログなしをSTOP", () => {
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: { mode: "DSGN.MODE.pack_cutout", invocationOrigin: "USER_EXPLICIT" },
    packCutout: {
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: validWriterComfortCheck(),
      packagerWriterHandoff: validPackagerWriterHandoff(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE",
      episodes: [validCutoutEpisode()]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "PACKAGER_PROCESS_LOG_MISSING"));
});

test("PACK_CUTOUTは追加ZIP再読込文言混入をSTOP", () => {
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: { mode: "DSGN.MODE.pack_cutout", invocationOrigin: "USER_EXPLICIT" },
    packCutout: {
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: validWriterComfortCheck(),
      packagerWriterHandoff: validPackagerWriterHandoff(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      rootDocuments: { writerBoot: "追加ZIP" + "o8.zip を再マウントしてください" },
      episodes: [validCutoutEpisode()]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "EXTERNAL_RELOAD_TEXT_DENIED"));
});

test("PACK_CUTOUTはstop_if_missing_before_write矛盾をSTOP", () => {
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: { mode: "DSGN.MODE.pack_cutout", invocationOrigin: "USER_EXPLICIT" },
    packCutout: {
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: validWriterComfortCheck(),
      packagerWriterHandoff: validPackagerWriterHandoff(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      sourceMountIndex: {
        source_records: [{ source_id: "INTERNAL_A", present: true, exists: true, read: true }],
        stop_if_missing_before_write: ["INTERNAL_A"],
        stop_if_missing: ["INTERNAL_B"]
      },
      episodes: [validCutoutEpisode()]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "STOP_IF_MISSING_POLICY_CONFLICT"));
});

test("PACK_CUTOUTはsource_file_current不在をSTOP", () => {
  const episode = validCutoutEpisode();
  episode.layerBindingManifest.bindings[0].source_file_current = "missing/file.md";
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: { mode: "DSGN.MODE.pack_cutout", invocationOrigin: "USER_EXPLICIT" },
    packCutout: {
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: validWriterComfortCheck(),
      packagerWriterHandoff: validPackagerWriterHandoff(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [episode]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "SOURCE_FILE_CURRENT_NOT_FOUND"));
});

test("設計さんはV2起動宣言を一意形式で生成する", () => {
  const activation = createPackWriterActivation({
    activationId: "PW-ACT-0001",
    episodeId: "E001"
  });
  assert.equal(activation.input_mode, "V2_EPISODE_FOLDER");
  assert.deepEqual(activation.activate_contracts, ["V2_FOLDER_RESTORE_CONTRACT"]);
  assert.equal(activation.auto_detection, "forbidden");
  assert.equal(activation.degraded_mode, false);
  assert.equal(activation.activation_validity.filename_inference_allowed, false);
});

test("旧明示V2起動検査資産は単体ではmaterial map待ちへ進む", () => {
  const activation = createPackWriterActivation({
    activationId: "PW-ACT-0001",
    episodeId: "E001"
  });
  const result = validatePackWriterActivation(activation);
  assert.equal(result.decision, "PASS");
  assert.equal(result.state, "WAITING_FOR_MATERIAL_MAP");
  assert.deepEqual(result.contractPriority, CONTRACT_PRIORITY);
});

test("V2自動判定・推測起動・DEGRADED本文モードはSTOP", () => {
  const activation = createPackWriterActivation({
    activationId: "PW-ACT-0001",
    episodeId: "E001"
  });
  const bad = structuredClone(activation);
  bad.auto_detection = "allowed";
  bad.degraded_mode = true;
  bad.activation_validity.filename_inference_allowed = true;
  const result = validatePackWriterActivation(bad);
  assert.equal(result.decision, "STOP");
  assert.equal(result.state, "ACTIVATION_STOP");
  assert.ok(result.issues.some((entry) => entry.code === "AUTO_DETECTION_NOT_FORBIDDEN"));
  assert.ok(result.issues.some((entry) => entry.code === "DEGRADED_WRITE_MODE_FORBIDDEN"));
  assert.ok(result.issues.some((entry) => entry.code === "ACTIVATION_VALIDITY_INVALID"));
});

test("LEGACY_PACKはV2契約を起動せず従来経路を保つ", () => {
  assert.equal(validateLegacyMode(null).decision, "PASS");
  const result = validateLegacyMode({
    input_mode: "LEGACY_PACK",
    activate_contracts: ["V2_FOLDER_RESTORE_CONTRACT"]
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.code === "V2_CONTRACT_ON_IN_LEGACY"));
});

const v2SourceFiles = () => [{
  path: "fixed_layer.md",
  read: true,
  content: [
    "<!-- BEGIN_SECTION: SEC-E001-FIXED -->",
    "必須条件A",
    "<!-- END_SECTION: SEC-E001-FIXED -->",
    "",
    "<!-- BEGIN_SECTION: SEC-E001-BLADE -->",
    "後工程メモ",
    "<!-- END_SECTION: SEC-E001-BLADE -->",
    ""
  ].join("\n")
}];

const v2Entries = () => [{
  material_id: "E001-FIXED-001",
  path: "fixed_layer.md",
  section_id: "SEC-E001-FIXED",
  section_label: "必須要素",
  writer_use: "RESTORE_SOURCE",
  canonical_state: "FROZEN",
  read_required: true
}, {
  material_id: "E001-BLADE-001",
  path: "fixed_layer.md",
  section_id: "SEC-E001-BLADE",
  section_label: "修正刃メモ",
  writer_use: "PROCESS_ONLY",
  canonical_state: "SUPPORT",
  read_required: true
}];

const validV2Material = () => {
  const activation = createPackWriterActivation({ activationId: "PW-ACT-0001", episodeId: "E001" });
  const sourceFiles = v2SourceFiles();
  const map = buildMaterialMap({ episodeId: "E001", sourceFiles, entries: v2Entries() });
  return { activation, sourceFiles, map };
};

test("旧material map検査資産は全section分類・二重digest一致でRESTORE_READY", () => {
  const input = validV2Material();
  const result = validateMaterialMap(input);
  assert.equal(result.decision, "PASS");
  assert.equal(result.state, "RESTORE_READY");
});

test("material map欠損は本文前STOP", () => {
  const { activation, sourceFiles } = validV2Material();
  const result = validateMaterialMap({ map: null, sourceFiles, activation });
  assert.equal(result.state, "MATERIAL_GATE_STOP");
  assert.ok(result.issues.some((entry) => entry.code === "MATERIAL_MAP_MISSING"));
});

test("file/section/map digest不一致は本文前STOP", () => {
  const fileChanged = validV2Material();
  fileChanged.sourceFiles[0].content = fileChanged.sourceFiles[0].content.replace("必須条件A", "必須条件B");
  let result = validateMaterialMap(fileChanged);
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.code === "FILE_DIGEST_MISMATCH"));
  assert.ok(result.issues.some((entry) => entry.code === "SECTION_DIGEST_MISMATCH"));

  const mapChanged = validV2Material();
  mapChanged.map.entries[0].section_label = "変更";
  result = validateMaterialMap(mapChanged);
  assert.ok(result.issues.some((entry) => entry.code === "MAP_DIGEST_MISMATCH"));
});

test("未分類sectionとsection外自由文はSTOP", () => {
  const unclassified = validV2Material();
  unclassified.map.entries = unclassified.map.entries.slice(0, 1);
  unclassified.map.source_files[0].coverage.classified_material_ids = ["E001-FIXED-001"];
  unclassified.map.source_files[0].coverage.unclassified_sections = ["SEC-E001-BLADE"];
  unclassified.map.map_digest = calculateMapDigest(unclassified.map);
  let result = validateMaterialMap(unclassified);
  assert.ok(result.issues.some((entry) => entry.code === "COVERAGE_UNCLASSIFIED"));
  assert.ok(result.issues.some((entry) => entry.code === "COVERAGE_GATE_FAILED"));

  const outside = validV2Material();
  outside.sourceFiles[0].content = `自由文\n${outside.sourceFiles[0].content}`;
  result = validateMaterialMap(outside);
  assert.ok(result.issues.some((entry) => entry.code === "UNCLASSIFIED_CONTENT"));
});

test("未知writer_use/canonical_stateと非FROZEN復元素材はSTOP", () => {
  const unknown = validV2Material();
  unknown.map.entries[0].writer_use = "USEFUL_MAYBE";
  unknown.map.entries[0].canonical_state = "LIKELY";
  unknown.map.map_digest = calculateMapDigest(unknown.map);
  let result = validateMaterialMap(unknown);
  assert.ok(result.issues.some((entry) => entry.code === "WRITER_USE_UNKNOWN"));
  assert.ok(result.issues.some((entry) => entry.code === "CANONICAL_STATE_UNKNOWN"));

  const notFrozen = validV2Material();
  notFrozen.map.entries[0].canonical_state = "SUPPORT";
  notFrozen.map.map_digest = calculateMapDigest(notFrozen.map);
  result = validateMaterialMap(notFrozen);
  assert.ok(result.issues.some((entry) => entry.code === "RESTORE_SOURCE_NOT_FROZEN"));
});

test("material_id重複・同section重複・未読sourceはSTOP", () => {
  const input = validV2Material();
  input.map.entries[1].material_id = input.map.entries[0].material_id;
  input.map.entries[1].section_id = input.map.entries[0].section_id;
  input.map.source_files[0].coverage.classified_material_ids = input.map.entries.map((entry) => entry.material_id);
  input.map.map_digest = calculateMapDigest(input.map);
  input.sourceFiles[0].read = false;
  const result = validateMaterialMap(input);
  assert.ok(result.issues.some((entry) => entry.code === "MATERIAL_ID_DUPLICATE"));
  assert.ok(result.issues.some((entry) => entry.code === "SECTION_REFERENCE_DUPLICATE"));
  assert.ok(result.issues.some((entry) => entry.code === "SOURCE_FILE_UNREAD"));
});

test("PACK_CUTOUTは旧V2 materialMap経路を現行WRITE候補としてSTOP", () => {
  const material = validV2Material();
  const episode = validCutoutEpisode();
  episode.sourceFiles = material.sourceFiles;
  episode.materialMap = material.map;
  const result = execute({
    operation: "PACK_CUTOUT", ...base, project,
    dsgn: { mode: "DSGN.MODE.pack_cutout", invocationOrigin: "USER_EXPLICIT" },
    packCutout: {
      inputMode: "V2_EPISODE_FOLDER",
      packWriterActivation: material.activation,
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: validWriterComfortCheck(),
      packagerWriterHandoff: validPackagerWriterHandoff(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [episode]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "LEGACY_MATERIAL_MAP_ROUTE_NOT_CURRENT"));
  assert.equal(result.materialState, "LEGACY_MATERIAL_MAP_ROUTE_STOP");
});

test("DIGEST_POLICY偽装・空map・空sectionは再計算してもSTOP", () => {
  const policy = validV2Material();
  policy.map.digest_policy = { ...policy.map.digest_policy, newline: "CRLF" };
  policy.map.map_digest = calculateMapDigest(policy.map);
  assert.ok(validateMaterialMap(policy).issues.some((entry) => entry.code === "DIGEST_POLICY_MISMATCH"));

  const empty = validV2Material();
  empty.map.entries = [];
  empty.map.source_files[0].coverage.classified_material_ids = [];
  empty.map.source_files[0].coverage.unclassified_sections = ["SEC-E001-FIXED", "SEC-E001-BLADE"];
  empty.map.map_digest = calculateMapDigest(empty.map);
  const emptyResult = validateMaterialMap(empty);
  assert.ok(emptyResult.issues.some((entry) => entry.code === "MATERIAL_ENTRIES_EMPTY"));
  assert.ok(emptyResult.issues.some((entry) => entry.code === "FROZEN_RESTORE_SOURCE_MISSING"));

  const blank = validV2Material();
  blank.sourceFiles[0].content = blank.sourceFiles[0].content.replace("必須条件A", "   ");
  const blankResult = validateMaterialMap(blank);
  assert.ok(blankResult.issues.some((entry) => entry.code === "SECTION_EMPTY"));
});

test("移管バックパックは明示起動なしならSTOP", () => {
  const request = validTransferRequest();
  delete request.mountTransferInvocation;
  const result = execute(request);
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "TRANSFER_BACKPACK_NOT_ACTIVATED"));
});

test("移管要求schemaはDESIGNER_AUTOを入口で拒否する", () => {
  const result = execute(validTransferRequest("DESIGNER_AUTO"));
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.code === "SCHEMA_ENUM" && entry.path === "$.mountTransferInvocation.origin"));
});

test("移管要求schemaはRUNTIME_AUTOを入口で拒否する", () => {
  const result = execute(validTransferRequest("RUNTIME_AUTO"));
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.code === "SCHEMA_ENUM" && entry.path === "$.mountTransferInvocation.origin"));
});

test("移管バックパックはユーザー明示起動後に移管担当で待機", () => {
  const result = execute(validTransferRequest("USER_EXPLICIT"));
  assert.equal(result.decision, "PASS");
  assert.equal(result.modeCompletion, "STAY_IN_TRANSFER_BACKPACK");
});

test("移管COMMITは成果物項目と三回ゼロの実測証跡を要求する", () => {
  const request = validTransferRequest("USER_EXPLICIT");
  Object.assign(request.transfer, {
    phase: "COMMIT",
    shelfReplayPlan: { entry: "00_READ_FIRST/DS90_START_GATE.md", shelves: ["000_C", "PKDB_VOLUME_0001", "PKDB_VOLUME_0002", "PKDB_VOLUME_0003", "PKDB_VOLUME_0004"] },
    zeroThinkStartReady: true,
    transferAcceptanceGatePassed: true,
    currentMountedZipsEmbedded: true,
    chatTransferItemsEmbedded: true,
    outputMountZipBuilt: true,
    outputMountZipConverged: true,
    currentRuntimeArtifactEmbedded: true,
    sourceDigest: "source",
    preparedDigest: "output",
    outputDigest: "output",
    completedOutput: { format: "ZIP" },
    dryRuns: zeroDryRuns()
  });
  assert.equal(execute(request).decision, "PASS");
  request.transfer.dryRuns[1].reference_missing = 1;
  const failed = execute(request);
  assert.equal(failed.decision, "STOP");
  assert.ok(failed.issues.some((entry) => entry.ruleId === "THREE_ZERO_COUNTER_NONZERO"));
});

test("司書門は既存path移動を移管失敗としてSTOP", () => {
  const request = validTransferRequest();
  request.transfer.librarian.afterStructure[2].path = "PROJECT/NEW/CORE.md";
  const result = execute(request);
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "EXISTING_PATH_REMOVED_OR_MOVED"));
});


test("V020 current packager writer route has no obsolete dependency stop residues", () => {
  const files = [
    "assets/dsgn_infra/04_MODULE/packager/WRITER_OUTPUT_COMFORT_CHECK_v0195.md",
    "assets/dsgn_infra/04_MODULE/packager/PACKAGER_WRITER_HANDOFF_SCHEMA_v1.json",
    "assets/dsgn_infra/04_MODULE/packager/PACKAGER_ABSOLUTE_PACKAGING_LOCK_v0199.md",
    "assets/dsgn_infra/04_MODULE/packager/PACKAGER_CURRENT_ROUTE_V2_v0194.md",
    "assets/dsgn_infra/04_MODULE/packager/PACKAGER_WRITER_CANONICAL_HANDOFF_CONTRACT_v0198.md",
    "src/runtime/mental-runtime.js",
    "updated_manifest.json"
  ];
  const term = (...codes) => String.fromCharCode(...codes);
  const forbidden = [
    new RegExp(term(82,69,81,85,73,82,69,68,95,83,79,85,82,67,69,95,77,79,85,78,84,95,78,79,84,95,65,86,65,73,76,65,66,76,69)),
    new RegExp(term(83,84,79,80,95,85,78,84,73,76,95,82,69,81,85,73,82,69,68,95,83,79,85,82,67,69,95,77,79,85,78,84,83,95,82,69,65,68)),
    new RegExp(term(112,114,111,106,101,99,116,32,109,111,117,110,116,32,47,32,111,56)),
    new RegExp(term(22806,37096) + "source" + term(26410,35501)),
    new RegExp(term(80,65,67,75,65,71,69,82,95,82,85,78,84,73,77,69)),
    new RegExp("V2_EPISODE_FOLDER" + "_PROJECTLOCKED" + String.fromCharCode(34)),
    new RegExp("v019" + "\\.12e")
  ];
  for (const rel of files) {
    const text = readFileSync(resolve(REPO_ROOT, rel), "utf8");
    for (const pattern of forbidden) {
      assert.equal(pattern.test(text), false, `${rel} contains ${pattern}`);
    }
  }
});

test("V020 retains history only behind optional inactive routes", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const root = resolve(here, "..");
  const retainedPaths = [
    "assets/operation_mount/00_GATE/070_CHANGELOG_V1.md",
    "assets/operation_mount/00_GATE/999_FILELIST_V1.tsv",
    "assets/operation_mount/30_REFERENCE_LOGS",
    "backpacks/MOUNT_TRANSFER_BACKPACK/source",
    "assets/dsgn_infra/07_AUDIT/current_package/root_reports_v019_4",
    "assets/dsgn_infra/07_AUDIT/current_package/root_reports_v019_5",
    "assets/dsgn_infra/07_AUDIT/current_package/root_reports_v019_7",
    "assets/dsgn_infra/07_AUDIT/current_package/root_reports_v019_8"
  ];
  for (const rel of retainedPaths) {
    assert.equal(existsSync(resolve(root, rel)), true, `${rel} should be retained for audit`);
  }
  const activeReads = new Set([...ALWAYS_READ, ...Object.values(OPERATION_READS).flat()]);
  assert.equal(activeReads.has("assets/operation_mount/00_GATE/070_CHANGELOG_V1.md"), false);
  assert.equal(activeReads.has("assets/operation_mount/00_GATE/999_FILELIST_V1.tsv"), false);
  assert.ok(OPTIONAL_REFERENCE_ROUTES.OPERATION_REVISION.includes(
    "assets/operation_mount/00_GATE/070_CHANGELOG_V1.md"
  ));
  assert.ok(OPTIONAL_REFERENCE_ROUTES.EXTERNAL_CONTEXT_HISTORY_SHELF.includes(
    "assets/operation_mount/30_REFERENCE_LOGS/"
  ));
  assert.ok(OPTIONAL_REFERENCE_ROUTES.RUNTIME_SOURCE_FLOOR_ARCHIVE.includes(
    "backpacks/MOUNT_TRANSFER_BACKPACK/source/"
  ));
});


test("V020 load_order and machine PACK_CUTOUT reads stay aligned", () => {
  const loadOrder = readFileSync(resolve(REPO_ROOT, "load_order.md"), "utf8");
  const packCutoutSection = loadOrder.slice(loadOrder.indexOf("## Pack Cutout"), loadOrder.indexOf("## Mount Transfer"));
  const explicitPaths = [...packCutoutSection.matchAll(/`([^`]+\.(?:md|json|js|txt))`/g)].map((match) => match[1]);
  const ignored = new Set([
    "Required project sources"
  ]);
  for (const rel of explicitPaths) {
    if (ignored.has(rel)) continue;
    assert.equal(existsSync(resolve(REPO_ROOT, rel)), true, `${rel} should exist`);
    if (rel.startsWith("assets/dsgn_infra/") || rel.startsWith("src/")) {
      assert.ok(INTERNAL_FALLBACK_READS.PACK_CUTOUT.includes(rel), `${rel} should be in INTERNAL_FALLBACK_READS.PACK_CUTOUT`);
    }
  }
  assert.ok(INTERNAL_FALLBACK_READS.PACK_CUTOUT.includes("assets/dsgn_infra/04_MODULE/packager/FULL_CONVERGENCE_SWEEP_LOCK_v0198.md"));
});

test("V020 operation mount acceptance files remain stable external-context canon", () => {
  const files = [
    "assets/operation_mount/00_GATE/080_WRITING_SIDE_ACCEPTANCE_V1.md",
    "assets/operation_mount/00_GATE/081_DESIGN_SIDE_ACCEPTANCE_V1.md",
    "assets/operation_mount/00_GATE/082_JOINT_FINAL_ACCEPTANCE_V1.md",
    "assets/operation_mount/99_README.md"
  ];
  const text = files.map((rel) => readFileSync(resolve(REPO_ROOT, rel), "utf8")).join("\n");
  assert.ok(text.includes("NOVEL_OPERATION_MOUNT_V1_20260424"));
  assert.ok(text.includes("現行マウント運用骨"));
  for (const rel of files.slice(0, 3)) assert.ok(ALWAYS_READ.includes(rel));
});


test("V020 current schema and runtime identity are self-contained process aligned", () => {
  const schema = JSON.parse(readFileSync(resolve(REPO_ROOT, "assets/dsgn_infra/04_MODULE/packager/PACKAGER_WRITER_HANDOFF_SCHEMA_v1.json"), "utf8"));
  assert.equal(schema.generatedBy, "PACKAGER_PROCESS");
  assert.equal(schema.inputMode, "V2_EPISODE_FOLDER_PROJECTLOCKED_REAL_PACK");
  assert.equal(schema.storyPackSelfContained, true);
  assert.equal(schema.sourceMountIndexRole, "internal_source_record_index");
  assert.ok(schema.requiredStopReasons.includes("INTERNAL_PACK_REFERENCE_MISSING"));
  assert.equal(schema.requiredStopReasons.includes("REQUIRED_SOURCE" + "_MOUNT_NOT_AVAILABLE"), false);

  const runtime = readFileSync(resolve(REPO_ROOT, "src/runtime/mental-runtime.js"), "utf8");
  assert.ok(runtime.includes("DS90-v020-NLCORE-MOUNT-TRANSFER-PACKAGING-THREE-ZERO-LOCKED"));
  assert.ok(runtime.includes("MOUNT_TRANSFER and PACK_CUTOUT are root operations whose normal execution is current-000_C specialist dispatch"));
});


test("V020 novel line final core lock is present and four-runtime equal", () => {
  const core = readFileSync(resolve(REPO_ROOT, "assets/dsgn_infra/04_MODULE/common/NOVEL_LINE_FINAL_CORE_LOCK_v001.md"), "utf8");
  assert.ok(core.includes("条件内で一切の妥協をせずに、限界まで本文を出す"));
  for (const name of ["設計さん", "執筆さん", "修正刃さま", "野良ちゃん"]) assert.ok(core.includes(name));
  assert.ok(core.includes("equal") || core.includes("対等"));
  const loadOrder = readFileSync(resolve(REPO_ROOT, "load_order.md"), "utf8");
  assert.ok(loadOrder.includes("NOVEL_LINE_FINAL_CORE_LOCK_v001.md"));
});


test("V020 DS90-PW90 handoff is artifact-based and writer-version agnostic", () => {
  const core = readFileSync(resolve(REPO_ROOT, "assets/dsgn_infra/04_MODULE/common/DS90_PW90_ARTIFACT_HANDOFF_JOINT_LOCK_v001.md"), "utf8");
  assert.ok(core.includes("条件内で一切の妥協をせずに、限界まで本文を出す"));
  assert.ok(core.includes("最低話パック定義"));
  assert.ok(core.includes("ZIPで梱包され、小説を書ける材料が入っていること"));
  assert.ok(core.includes("DS90 の版番号で受領可否を決めない"));

  const schema = JSON.parse(readFileSync(resolve(REPO_ROOT, "assets/dsgn_infra/04_MODULE/packager/PACKAGER_WRITER_HANDOFF_SCHEMA_v1.json"), "utf8"));
  assert.equal(schema.target_writer_runtime_family, "PW90");
  assert.equal(schema.writerAcceptanceBasis, "WRITABLE_ZIP_STORY_PACK_ARTIFACT_NOT_VERSION");
  assert.equal(schema.minimumStoryPackDefinition, "zip_pack_with_writable_novel_material");
  assert.equal(schema.rejectByDesignerVersion, false);

  const loadOrder = readFileSync(resolve(REPO_ROOT, "load_order.md"), "utf8");
  assert.ok(loadOrder.includes("DS90_PW90_ARTIFACT_HANDOFF_JOINT_LOCK_v001.md"));
  assert.ok(INTERNAL_FALLBACK_READS.PACK_CUTOUT.includes("assets/dsgn_infra/04_MODULE/common/DS90_PW90_ARTIFACT_HANDOFF_JOINT_LOCK_v001.md"));
});


test("V020 artifact means full convergence lock is present and enforced", () => {
  const lockPath = "assets/dsgn_infra/04_MODULE/common/ARTIFACT_EQUALS_FULL_CONVERGENCE_LOCK_v020.md";
  const artifactLock = readFileSync(resolve(REPO_ROOT, lockPath), "utf8");
  const readPlan = INTERNAL_FALLBACK_READS.PACK_CUTOUT;
  assert.ok(artifactLock.includes("fully converged output"));
  assert.ok(artifactLock.includes("Submission is blocked"));
  assert.ok(readPlan.includes(lockPath));
  assert.ok(ALWAYS_READ.includes(lockPath));
});


test("v0402 mount transfer routing, user-explicit activation and retained-history boundary are enforced", () => {
  const routeResult = route("重いからマウント移管しようか");
  assert.equal(routeResult.kind, "ROUTED");
  assert.equal(routeResult.operation, "MOUNT_TRANSFER");

  const explicitLock = readFileSync(resolve(REPO_ROOT, "assets/dsgn_infra/04_MODULE/common/DS90_MOUNT_TRANSFER_USER_EXPLICIT_GATE_LOCK_v0402.md"), "utf8");
  assert.ok(explicitLock.includes("USER_EXPLICIT"));
  assert.ok(explicitLock.includes("DESIGNER_AUTO"));
  assert.ok(explicitLock.includes("RUNTIME_AUTO"));

  const historyPolicy = readFileSync(resolve(REPO_ROOT, "assets/dsgn_infra/04_MODULE/common/EXTERNAL_CONTEXT_HISTORY_RETAINED_ACTIVE_BOUNDARY_POLICY_v020.md"), "utf8");
  assert.ok(historyPolicy.includes("history can be retained"));
  assert.ok(historyPolicy.includes("not ordinary active input"));

  const transferLocks = [
    "assets/dsgn_infra/04_MODULE/common/DS90_MOUNT_TRANSFER_USER_EXPLICIT_GATE_LOCK_v0402.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_HANDOFF_NO_AMBIGUITY_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_TRANSFER_CURRENT_COST_ACCEPTANCE_LOCK_v020.md"
  ];
  for (const rel of transferLocks) {
    assert.ok(ALWAYS_READ.includes(rel));
    assert.ok(INTERNAL_FALLBACK_READS.MOUNT_TRANSFER.includes(rel));
  }
});

test("V020 CODEX fixture boundary removes NOM from PACK_CUTOUT active reads", () => {
  const noNomActive = OPERATION_READS.PACK_CUTOUT.every((rel) => rel !== "assets/dsgn_infra/05_INSERT/nom/nom_gate_insert_min_v3.md");
  assert.equal(noNomActive, true);
  const boundary = readFileSync(resolve(REPO_ROOT, "assets/dsgn_infra/04_MODULE/common/DS90_CODEX_FIXTURE_ACTIVE_ROUTE_BOUNDARY_LOCK_v020.md"), "utf8");
  assert.ok(boundary.includes("Codex/Node validation"));
  assert.ok(boundary.includes("PACK_CUTOUT"));
});

test("V020全構成ファイルはUTF-8で文字化け名を持たない", () => {
  const files = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const path = resolve(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else files.push(path);
    }
  };
  walk(REPO_ROOT);
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const mojibake = new RegExp([
    [960, 199], [934, 8976], [960, 226], [964, 238],
    [920, 231], [963, 402], [8745, 9565]
  ].map((codes) => String.fromCodePoint(...codes)).join("|"));
  for (const path of files) {
    if (path.endsWith(".zip")) {
      assert.equal(mojibake.test(path), false, `${path} contains a mojibake filename`);
      continue;
    }
    const content = readFileSync(path);
    assert.doesNotThrow(() => decoder.decode(content), `${path} is not UTF-8`);
    assert.equal(mojibake.test(path), false, `${path} contains a mojibake filename`);
    assert.equal(mojibake.test(content.toString("utf8")), false, `${path} contains mojibake text`);
  }
});

test("V020 current DSGN manifest・tag map・実ファイルは完全一致", () => {
  const infraRoot = resolve(REPO_ROOT, "assets/dsgn_infra");
  const manifestPath = resolve(infraRoot, "00_MANIFEST/current/DSGN_CURRENT_PACKAGE_MANIFEST_v1.json");
  const tagMapPath = resolve(infraRoot, "00_MANIFEST/current/DSGN_CURRENT_PACKAGE_TAG_MAP_v1.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const tagMap = JSON.parse(readFileSync(tagMapPath, "utf8"));
  assert.equal(manifest.files.length, 43);
  assert.equal(new Set(manifest.files.map((entry) => entry.source_id)).size, manifest.files.length);
  assert.equal(new Set(manifest.files.map((entry) => entry.package_path)).size, manifest.files.length);

  const sourceToPath = {};
  const loadModes = {};
  const tags = {};
  for (const entry of manifest.files) {
    const path = resolve(infraRoot, entry.package_path);
    assert.equal(existsSync(path), true, entry.package_path);
    const bytes = readFileSync(path);
    assert.equal(entry.bytes, bytes.length, `${entry.source_id} bytes`);
    assert.equal(entry.sha256, createHash("sha256").update(bytes).digest("hex"), `${entry.source_id} sha256`);
    sourceToPath[entry.source_id] = entry.package_path;
    (loadModes[entry.load_mode] ??= []).push(entry.source_id);
    for (const tag of entry.tags) (tags[tag] ??= []).push(entry.source_id);
  }
  const sortedObject = (value) => Object.fromEntries(Object.entries(value)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, list]) => [key, [...list].sort()]));
  assert.deepEqual(manifest.source_to_path, Object.fromEntries(
    Object.entries(sourceToPath).sort(([a], [b]) => a.localeCompare(b))
  ));
  assert.deepEqual(manifest.load_mode_to_sources, sortedObject(loadModes));
  assert.deepEqual(manifest.tag_to_sources, sortedObject(tags));
  assert.deepEqual(tagMap.source_to_path, manifest.source_to_path);
  assert.deepEqual(tagMap.load_mode_to_sources, manifest.load_mode_to_sources);
  assert.deepEqual(tagMap.tag_to_sources, manifest.tag_to_sources);

  assert.equal(manifest.load_mode_to_sources.always_light.length, 14);
  for (const id of manifest.load_mode_to_sources.always_light) {
    const path = `assets/dsgn_infra/${manifest.source_to_path[id]}`;
    assert.ok(path.includes("/01_ALWAYS_LIGHT/"), `${id} must be under 01_ALWAYS_LIGHT`);
    assert.ok(ALWAYS_READ.includes(path), `${id} must be in root ALWAYS_READ`);
  }
  assert.deepEqual(manifest.load_mode_to_sources.legacy_reference, [
    "DSGN.SRC.overlay.manifest.v015", "DSGN.SRC.overlay.patch.v015"
  ]);
  assert.deepEqual(manifest.load_mode_to_sources.optional_reference_gate, ["DSGN.SRC.nom.gate.min.v3"]);
  assert.equal(manifest.load_mode_to_sources.archive_manifest_reference.length, 4);
});

test("V020 active・optional・archive境界と日本語サンプル名は一意", () => {
  const activeReads = [...ALWAYS_READ, ...Object.values(OPERATION_READS).flat()];
  const inactivePrefixes = [
    "assets/operation_mount/30_REFERENCE_LOGS/",
    "backpacks/MOUNT_TRANSFER_BACKPACK/source/",
    "assets/dsgn_infra/00_MANIFEST/legacy/",
    "assets/dsgn_infra/00_MANIFEST/zip_tagging/",
    "assets/dsgn_infra/05_INSERT/nom/",
    "assets/dsgn_infra/06_PATCH/",
    "assets/comparison/"
  ];
  for (const prefix of inactivePrefixes) {
    assert.equal(activeReads.some((path) => path.startsWith(prefix)), false, `${prefix} leaked into active reads`);
  }
  assert.equal(OPTIONAL_REFERENCE_ROUTES.CARD_COMPARISON_FULL.length, COMPARISON_ASSETS.fileCount);
  for (const path of OPTIONAL_REFERENCE_ROUTES.CARD_COMPARISON_FULL) {
    assert.equal(existsSync(resolve(REPO_ROOT, path)), true, path);
    assert.match(path, /[ぁ-んァ-ヶ一-龠々〆〤]/, `${path} should retain its restored Japanese name`);
  }
  const boundary = JSON.parse(readFileSync(resolve(
    REPO_ROOT, "assets/operation_mount/30_REFERENCE_LOGS/ARCHIVE_BOUNDARY.json"
  ), "utf8"));
  assert.equal(boundary.active_route, false);
  assert.equal(boundary.status, "RETIRED_REFERENCE_ONLY");
});

test("V020 writer handoffはfrozen単独でなく固定9ファイル", () => {
  const docs = [
    "assets/dsgn_infra/00_MANIFEST/current/DSGN_CURRENT_PACKAGE_LOAD_ORDER_v1.md",
    "assets/dsgn_infra/01_ALWAYS_LIGHT/runtime/DSGN_RUNTIME_OPERATION_CONDITIONS_v1.md",
    "assets/dsgn_infra/01_ALWAYS_LIGHT/runtime/DSGN_RUNTIME_ACTIVATION_MATRIX_v1.md",
    "assets/dsgn_infra/01_ALWAYS_LIGHT/runtime/DSGN_OPERATION_CONVERGED_GUARD_v1.md",
    "assets/dsgn_infra/01_ALWAYS_LIGHT/index/DSGN_ROLE_INDEX_v1.md",
    "assets/dsgn_infra/01_ALWAYS_LIGHT/protocol/designer_lookup_protocol_v1.md"
  ].map((path) => readFileSync(resolve(REPO_ROOT, path), "utf8")).join("\n");
  assert.equal(/frozen(?:最小|\s+minimum|抽出値)だけ/.test(docs), false);
  for (const name of [
    "00_episode_index.md", "01_ready.md", "02_v2.md", "03_layer.md",
    "03_layer_binding_manifest.json", "04_crosscheck.md", "05_frozen.md",
    "06_execution_queue.md", "07_sources.md"
  ]) assert.ok(docs.includes(name), name);
});

test("V020 operation mount manifest・filelistは実在84ファイルと一致", () => {
  const mountRoot = resolve(REPO_ROOT, "assets/operation_mount");
  const files = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const path = resolve(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else files.push(path.slice(mountRoot.length + 1));
    }
  };
  walk(mountRoot);
  files.sort();
  assert.equal(files.length, 84);

  const manifest = readFileSync(resolve(mountRoot, "00_GATE/050_MANIFEST.md"), "utf8");
  const manifestFiles = [...manifest.matchAll(/^- `([^`]+)`$/gm)].map((match) => match[1]).sort();
  assert.match(manifest, /ファイル数：84/);
  assert.deepEqual(manifestFiles, files);

  const rows = readFileSync(resolve(mountRoot, "00_GATE/999_FILELIST_V1.tsv"), "utf8")
    .trimEnd().split("\n").slice(1).map((line) => line.split("\t"));
  assert.deepEqual(rows.map(([path]) => path).sort(), files);
  for (const [path, size, sha256] of rows) {
    if (path === "00_GATE/999_FILELIST_V1.tsv") {
      assert.deepEqual([size, sha256], ["SELF", "SELF"]);
      continue;
    }
    const bytes = readFileSync(resolve(mountRoot, path));
    assert.equal(Number(size), bytes.length, `${path} bytes`);
    assert.equal(sha256, createHash("sha256").update(bytes).digest("hex"), `${path} sha256`);
  }
});

test("V020 designer machine indexはsource・tag・roleを未解決参照しない", () => {
  const machine = JSON.parse(readFileSync(resolve(
    REPO_ROOT, "assets/dsgn_infra/01_ALWAYS_LIGHT/machine/designer_tag_index_machine_v1.json"
  ), "utf8"));
  const sources = new Set(Object.keys(machine.sources));
  const tags = new Set(machine.tags.map((entry) => entry.tag));
  for (const entry of machine.tags) {
    for (const sourceId of entry.source_ids) assert.ok(sources.has(sourceId), `${entry.tag} -> ${sourceId}`);
  }
  for (const entry of machine.symptom_to_tag) {
    for (const tag of entry.tags) assert.ok(tags.has(tag), `${entry.symptom} -> ${tag}`);
  }
  for (const entry of machine.role_to_tag) {
    for (const tag of entry.tags) assert.ok(tags.has(tag), `${entry.role} -> ${tag}`);
    assert.equal(entry.tags.some((tag) => tag.startsWith("nom.")), false, `${entry.role} NOM leak`);
  }
  for (const tag of machine.optional_legacy_audit_tags) assert.ok(tags.has(tag), tag);
});

test("V020.3 consult-only text does not activate specialist routes", () => {
  for (const command of [
    "話パックって何？説明して",
    "マウント移管について相談したいだけ",
    "ナルとは何か確認だけ",
    "ヌルの意味を教えて"
  ]) {
    const routed = route(command);
    assert.equal(routed.kind, "STOP", command);
    assert.equal(routed.code, "CONSULT_ONLY_CONTEXT", command);
  }
});

test("V020.3 clear execution still routes to specialist roots", () => {
  assert.equal(route("ナル投入お願いします").operation, "PACK_CUTOUT");
  assert.equal(route("SP00 / ナルで話パック生成して").operation, "PACK_CUTOUT");
  assert.equal(route("ヌル投入お願いします").operation, "MOUNT_TRANSFER");
  assert.equal(route("MT00 / ヌルでマウント移管して").operation, "MOUNT_TRANSFER");
});

test("V0300 clean baseline role alias and tooling contracts are active", () => {
  const lock = readFileSync(resolve(REPO_ROOT, "assets/dsgn_infra/04_MODULE/common/DS90_V0300_CLEAN_BASELINE_LOCK.md"), "utf8");
  const machine = JSON.parse(readFileSync(resolve(REPO_ROOT, "assets/dsgn_infra/04_MODULE/common/machine/DS90_V0300_CLEAN_BASELINE_MACHINE.json"), "utf8"));
  const reportSchema = JSON.parse(readFileSync(resolve(REPO_ROOT, "assets/dsgn_infra/04_MODULE/common/machine/DS90_CHECK_REPORT_SCHEMA_v0300.json"), "utf8"));
  const zipContract = JSON.parse(readFileSync(resolve(REPO_ROOT, "assets/dsgn_infra/04_MODULE/common/machine/DS90_ZIP_PACKAGING_CONTRACT_v0300.json"), "utf8"));
  assert.ok(lock.includes("梱包さん` is a legacy PACK_CUTOUT"));
  assert.equal(machine.canonical_roles.MT00.purpose, "mount_transfer_and_chat_crossing");
  assert.equal(machine.canonical_roles.SP00.purpose, "story_pack_cutout");
  assert.ok(machine.forbidden.includes("force_mt00_handoff_seed"));
  assert.ok(reportSchema.required_sections.includes("manifest_comparison"));
  assert.ok(zipContract.required_root_files.includes("README.md"));
  for (const rel of [
    "assets/dsgn_infra/04_MODULE/common/DS90_V0300_CLEAN_BASELINE_LOCK.md",
    "assets/dsgn_infra/04_MODULE/common/machine/DS90_V0300_CLEAN_BASELINE_MACHINE.json",
    "assets/dsgn_infra/04_MODULE/common/machine/DS90_CHECK_REPORT_SCHEMA_v0300.json",
    "assets/dsgn_infra/04_MODULE/common/machine/DS90_ZIP_PACKAGING_CONTRACT_v0300.json"
  ]) assert.ok(ALWAYS_READ.includes(rel), `${rel} must be ALWAYS_READ`);
});

test("V0403.5 package checker accepts canonical bytes field and rejects missing UTF-8 filename flags", () => {
  const checker = readFileSync(resolve(REPO_ROOT, "tools/ds90_check_runtime.py"), "utf8");
  const manifestMaker = readFileSync(resolve(REPO_ROOT, "tools/ds90_make_manifest.py"), "utf8");
  assert.ok(checker.includes('entry.get("bytes") if "bytes" in entry else entry.get("size")'));
  assert.ok(checker.includes("filename_utf8_flag_failures"));
  assert.ok(checker.includes("info.flag_bits & 0x800"));
  assert.ok(manifestMaker.includes('"bytes": file.stat().st_size'));
});

test("V0301 owner direct runtime 000_C flow is active and no-Git", () => {
  const lockPath = "assets/dsgn_infra/04_MODULE/common/DS90_V0300_CLEAN_BASELINE_LOCK.md";
  const flowPath = "assets/dsgn_infra/04_MODULE/common/machine/DS90_V0300_CLEAN_BASELINE_MACHINE.json";
  const directLockPath = "assets/dsgn_infra/04_MODULE/common/DS90_DIRECT_RUNTIME_DISPATCH_000C_LOCK_v0301.md";
  const directMachinePath = "assets/dsgn_infra/04_MODULE/common/machine/DS90_DIRECT_RUNTIME_DISPATCH_000C_MACHINE_v0301.json";
  const lock = readFileSync(resolve(REPO_ROOT, lockPath), "utf8");
  const flow = JSON.parse(readFileSync(resolve(REPO_ROOT, flowPath), "utf8"));
  const directMachine = JSON.parse(readFileSync(resolve(REPO_ROOT, directMachinePath), "utf8"));
  const manifest = JSON.parse(readFileSync(resolve(REPO_ROOT, "updated_manifest.json"), "utf8"));
  assert.ok(lock.includes("ChatGPT Project"));
  assert.ok(lock.includes("000_C/00_READ_FIRST/RUNTIME_DIRECT_DISPATCH.json"));
  assert.ok(lock.includes("routes.MOUNT_TRANSFER"));
  assert.ok(lock.includes("routes.PACK_CUTOUT"));
  assert.ok(lock.includes("routes.STORY_PACK_RECEIVER_CHECK"));
  assert.ok(lock.includes("routes.MOUNT_ZIP_BOOTSTRAP"));
  assert.ok(!lock.includes("MT00_v002_1_CLEAN_BASELINE_TRANSFER_000C_RESIDENT_LANES_FINALIZED"));
  assert.ok(!lock.includes("SP00_v002_CLEAN_BASELINE_STORY_PACK_FINALIZED"));
  assert.ok(lock.includes("MT00_HANDOFF_SEED"));
  assert.equal(flow.git_required, false);
  assert.equal(flow.codex_required, false);
  assert.equal(flow.canonical_roles.MT00.flow_mode, "OWNER_DIRECT_RUNTIME_000C");
  assert.equal(flow.canonical_roles.MT00.dispatch_route, "routes.MOUNT_TRANSFER");
  assert.equal(flow.canonical_roles.SP00.ownership_question, null);
  assert.equal(flow.canonical_roles.SP00.dispatch_route, "routes.PACK_CUTOUT");
  assert.equal(flow.canonical_roles.PW90_STORY_PACK_RECEIVER_CHECKER.flow_mode, "OWNER_DIRECT_RUNTIME_000C");
  assert.equal(flow.canonical_roles.PW90_STORY_PACK_RECEIVER_CHECKER.dispatch_route, "routes.STORY_PACK_RECEIVER_CHECK");
  assert.equal(flow.canonical_roles.MT00_BOOTSTRAP_EA.flow_mode, "OWNER_DIRECT_RUNTIME_000C");
  assert.equal(flow.canonical_roles.MT00_BOOTSTRAP_EA.dispatch_route, "routes.MOUNT_ZIP_BOOTSTRAP");
  assert.equal(directMachine.direct_runtime_routes.MOUNT_TRANSFER.target, "MT00");
  assert.equal(directMachine.direct_runtime_routes.STORY_PACK_RECEIVER_CHECK.target, "PW90_STORY_PACK_RECEIVER_CHECKER");
  assert.equal(directMachine.direct_runtime_routes.STORY_PACK_RECEIVER_CHECK.dispatch_route, "routes.STORY_PACK_RECEIVER_CHECK");
  assert.equal(directMachine.direct_runtime_routes.MOUNT_ZIP_BOOTSTRAP.target, "MT00_BOOTSTRAP_EA");
  assert.equal(directMachine.direct_runtime_routes.MOUNT_ZIP_BOOTSTRAP.resident_core, true);
  assert.equal(flow.canonical_roles.PW90.flow_mode, "LIGHT_PORTAL_AND_USAGE_GUIDANCE");
  assert.equal(flow.canonical_roles.TS90.flow_mode, "LIGHT_PORTAL_AND_USAGE_GUIDANCE");
  assert.ok(flow.forbidden.includes("force_mt00_handoff_seed"));
  assert.ok(flow.forbidden.includes("force_sp00_handoff_seed"));
  assert.ok(flow.forbidden.includes("ask_normal_mt00_sp00_decline_choice"));
  for (const rel of [lockPath, flowPath, directLockPath, directMachinePath]) {
    assert.ok(ALWAYS_READ.includes(rel), `${rel} must be ALWAYS_READ`);
    assert.ok(INTERNAL_FALLBACK_READS.MOUNT_TRANSFER.includes(rel) || ALWAYS_READ.includes(rel), `${rel} must remain in MOUNT_TRANSFER fallback or ALWAYS_READ`);
    assert.ok(INTERNAL_FALLBACK_READS.PACK_CUTOUT.includes(rel) || ALWAYS_READ.includes(rel), `${rel} must remain in PACK_CUTOUT fallback or ALWAYS_READ`);
    assert.ok(OPERATION_READS.SPECIALIST_HANDOFF.includes(rel) || ALWAYS_READ.includes(rel), `${rel} must remain in SPECIALIST_HANDOFF or ALWAYS_READ`);
  }
  for (const rel of [directLockPath, directMachinePath]) {
    assert.ok(OPERATION_READS.MOUNT_ZIP_BOOTSTRAP.includes(rel), `${rel} must be in MOUNT_ZIP_BOOTSTRAP reads`);
  }
  for (const rel of [
    "assets/dsgn_infra/04_MODULE/common/DS90_MT00_SOURCE_THREAD_HANDOFF_SEED_FLOW_LOCK_v0206.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_SPECIALIST_RUNTIME_USER_CHOICE_FLOW_LOCK_v0207.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_SPECIALIST_RUNTIME_DEFAULT_COMPLIANCE_FLOW_LOCK_v0208.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_PW90_TS90_LIGHT_PORTAL_GUIDANCE_LOCK_v0209.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_SPECIALIST_PORTAL_FLOW_FINAL_LOCK_v0210.md"
  ]) {
    assert.ok(!ALWAYS_READ.includes(rel), `${rel} must not be ALWAYS_READ`);
    assert.ok(!OPERATION_READS.MOUNT_TRANSFER.includes(rel), `${rel} must not be active MOUNT_TRANSFER read`);
    assert.ok(!OPERATION_READS.PACK_CUTOUT.includes(rel), `${rel} must not be active PACK_CUTOUT read`);
    assert.ok(!OPERATION_READS.SPECIALIST_HANDOFF.includes(rel), `${rel} must not be active SPECIALIST_HANDOFF read`);
    assert.ok(!manifest.files.some((record) => record.path === rel), `${rel} must be removed from clean baseline package`);
  }
});

test("V020.5 PW90 and TS90 prompts route to SPECIALIST_HANDOFF without replacing MT00/SP00", () => {
  const writerRoute = route("執筆さん投入お願いします");
  assert.equal(writerRoute.kind, "ROUTED");
  assert.equal(writerRoute.operation, "SPECIALIST_HANDOFF");

  const revisionRoute = route("修正刃さま投入お願いします");
  assert.equal(revisionRoute.kind, "ROUTED");
  assert.equal(revisionRoute.operation, "SPECIALIST_HANDOFF");

  const nulRoute = route("ヌル投入お願いします");
  assert.equal(nulRoute.kind, "ROUTED");
  assert.equal(nulRoute.operation, "MOUNT_TRANSFER");

  const nalRoute = route("ナル投入お願いします");
  assert.equal(nalRoute.kind, "ROUTED");
  assert.equal(nalRoute.operation, "PACK_CUTOUT");
});

test("V020.9 PW90 and TS90 guidance metadata is handoff-only and real specialist completion is host-bound", () => {
  const result = rawExecute({ command: "PW90投入", ...base });
  assert.equal(result.decision, null);
  assert.equal(result.state, "WAITING_FOR_HOST");
  assert.equal(result.operation, "SPECIALIST_HANDOFF");
  assert.equal(result.hostAction.actionType, "SPECIALIST_RUNTIME_INVOKE");
  assert.equal(result.hostAction.target, "PW90");
  assert.equal(result.hostAction.handoff.lightPortalGuidanceOnly, true);
  assert.equal(result.hostAction.handoff.ownershipCheckRequired, false);
  assert.equal(result.hostAction.handoff.nextAction, "EXPLAIN_PORTAL_AND_USAGE_PATH");
  assert.equal(result.hostAction.handoff.publicRuntimeSources.portal, "https://gpt-novel-line-portal.harmoniets.chatgpt.site/");
  assert.equal(result.hostAction.handoff.ds90MayExplainPw90Ts90UsageInOneThread, true);
  assert.equal(result.hostAction.handoff.ds90DoesNotSubstituteSpecialistRuntime, true);

  const owned = rawExecute({ command: "修正刃さま投入", payload: { runtimeOwned: true }, ...base });
  assert.equal(owned.decision, null);
  assert.equal(owned.hostAction.target, "TS90");
  assert.equal(owned.hostAction.handoff.lightPortalGuidanceOnly, true);
  assert.equal(owned.hostAction.handoff.nextAction, "EXPLAIN_SPECIALIST_USAGE_WITH_OWNED_RUNTIME");

  const missing = rawExecute({ command: "PW90投入", payload: { runtimeOwned: false }, ...base });
  assert.equal(missing.hostAction.handoff.nextAction, "EXPLAIN_PORTAL_AND_USAGE_PATH");
});


test("V0309 direct runtime path resolves current 000_C proof before Nul/Nal/Ea invocation", () => {
  const ownedMt00 = advanceTrustedDispatch({
    command: "専門ランタイム",
    payload: { specialistTarget: "MT00", runtimeOwned: true },
    ...base
  }, "000_C/MT00/runtime.zip").result;
  assert.equal(ownedMt00.decision, null);
  assert.equal(ownedMt00.state, "WAITING_FOR_HOST");
  assert.equal(ownedMt00.operation, "SPECIALIST_HANDOFF");
  assert.equal(ownedMt00.hostAction.actionType, "SPECIALIST_RUNTIME_INVOKE");
  assert.equal(ownedMt00.hostAction.target, "MT00");
  assert.equal(ownedMt00.hostAction.dispatchRoute, "MOUNT_TRANSFER");
  assert.equal(ownedMt00.hostAction.routeEvidence.path, "000_C/MT00/runtime.zip");
  assert.equal(ownedMt00.hostAction.routeEvidence.source, "CURRENT_000_C");
  assert.equal(ownedMt00.hostAction.handoff.nextAction, "INVOKE_CURRENT_MOUNT_000_C_RUNTIME_AND_STOP_DS90_HOLDING_WORK");
  assert.equal(ownedMt00.hostAction.handoff.directRuntime.dispatchManifest, "000_C/00_READ_FIRST/RUNTIME_DIRECT_DISPATCH.json");
  assert.equal(ownedMt00.hostAction.handoff.directRuntime.dispatchRoute, "routes.MOUNT_TRANSFER");
  assert.equal(ownedMt00.hostAction.handoff.mandatoryHandoffSeed, false);

  const ownedSp00 = advanceTrustedDispatch({
    command: "専門ランタイム",
    payload: { specialistTarget: "SP00", runtimeOwned: true },
    ...base
  }, "000_C/SP00/runtime.zip").result;
  assert.equal(ownedSp00.hostAction.actionType, "SPECIALIST_RUNTIME_INVOKE");
  assert.equal(ownedSp00.hostAction.target, "SP00");
  assert.equal(ownedSp00.hostAction.dispatchRoute, "PACK_CUTOUT");
  assert.equal(ownedSp00.hostAction.routeEvidence.path, "000_C/SP00/runtime.zip");

  const receiverCheck = advanceTrustedDispatch({
    command: "話パック受領チェック",
    payload: { runtimeOwned: true },
    ...base
  }, "000_C/PW90_STORY_PACK_RECEIVER_CHECKER/runtime.zip").result;
  assert.equal(receiverCheck.operation, "SPECIALIST_HANDOFF");
  assert.equal(receiverCheck.hostAction.actionType, "SPECIALIST_RUNTIME_INVOKE");
  assert.equal(receiverCheck.hostAction.target, "PW90_STORY_PACK_RECEIVER_CHECKER");
  assert.equal(receiverCheck.hostAction.dispatchRoute, "STORY_PACK_RECEIVER_CHECK");
  assert.equal(receiverCheck.hostAction.routeEvidence.path, "000_C/PW90_STORY_PACK_RECEIVER_CHECKER/runtime.zip");
  assert.deepEqual(receiverCheck.hostAction.handoff.directRuntime.requiredPredecessorLine, [
    "NAL_PACK_CUTOUT",
    "NAL_PACK_CHECK",
    "PW90_RECEIVER_CHECK"
  ]);

  const ea = advanceTrustedDispatch({ command: "マウントZIP構築して", ...base }, "000_C/MT00_BOOTSTRAP_EA/runtime.zip").result;
  assert.equal(ea.operation, "MOUNT_ZIP_BOOTSTRAP");
  assert.equal(ea.decision, null);
  assert.equal(ea.hostAction.actionType, "SPECIALIST_RUNTIME_INVOKE");
  assert.equal(ea.hostAction.target, "MT00_BOOTSTRAP_EA");
  assert.equal(ea.hostAction.dispatchRoute, "MOUNT_ZIP_BOOTSTRAP");
  assert.equal(ea.hostAction.routeEvidence.path, "000_C/MT00_BOOTSTRAP_EA/runtime.zip");

  const exceptionMetadata = rawExecute({
    command: "専門ランタイム",
    payload: { specialistTarget: "MT00", runtimeOwned: true, forceDs90MinimumRoute: true },
    ...base
  });
  assert.equal(exceptionMetadata.decision, "STOP");
  assert.ok(exceptionMetadata.issues.some((entry) => (entry.ruleId ?? entry.code) === "EXTENSION_UNDECLARED_KEY"));

  const missingMt00 = advanceTrustedDispatch({
    command: "専門ランタイム",
    payload: { specialistTarget: "MT00", runtimeOwned: false },
    ...base
  }, "000_C/MT00/runtime.zip").result;
  assert.equal(missingMt00.hostAction.handoff.nextAction, "STOP_DIRECT_RUNTIME_ZIP_MISSING");
  assert.ok(missingMt00.hostAction.handoff.handoff.missingRuntimeAction.includes("RUNTIME_DIRECT_DISPATCH.json"));
});


test("V0300 removes iterative specialist flow patch files from package", () => {
  const removed = [
    "assets/dsgn_infra/04_MODULE/common/DS90_PW90_TS90_LIGHT_PORTAL_GUIDANCE_LOCK_v0209.md",
    "assets/dsgn_infra/04_MODULE/common/machine/DS90_GPT_SITE_PW90_TS90_LIGHT_PORTAL_GUIDANCE_v0209.json",
    "assets/dsgn_infra/04_MODULE/common/DS90_SPECIALIST_PORTAL_FLOW_FINAL_LOCK_v0210.md",
    "assets/dsgn_infra/04_MODULE/common/machine/DS90_GPT_SITE_SPECIALIST_PORTAL_FLOW_v0210.json"
  ];
  for (const rel of removed) {
    assert.equal(existsSync(resolve(REPO_ROOT, rel)), false, `${rel} should be absent from clean package`);
    assert.ok(!ALWAYS_READ.includes(rel));
    assert.ok(!OPERATION_READS.SPECIALIST_HANDOFF.includes(rel));
  }
});


test("V020.5 chat crossing intent routes to MOUNT_TRANSFER", () => {
  for (const command of ["チャットを跨ぎたい", "スレッドを跨ぎたい", "次チャットへ渡したい"]) {
    const routed = route(command);
    assert.equal(routed.kind, "ROUTED", command);
    assert.equal(routed.operation, "MOUNT_TRANSFER", command);
  }
});


test("V0309 revision wording routes to TS90 and writing wording to PW90 without faking specialist completion", () => {
  const revision = route("本文修正お願いします");
  assert.equal(revision.kind, "ROUTED");
  assert.equal(revision.operation, "SPECIALIST_HANDOFF");
  const executed = rawExecute({ command: "本文修正お願いします", ...base });
  assert.equal(executed.decision, null);
  assert.equal(executed.state, "WAITING_FOR_HOST");
  assert.equal(executed.hostAction.target, "TS90");

  const writing = rawExecute({ command: "本文出力お願いします", ...base });
  assert.equal(writing.decision, null);
  assert.equal(writing.state, "WAITING_FOR_HOST");
  assert.equal(writing.hostAction.target, "PW90");
  assert.equal(writing.hostAction.handoff.flowVersion, "v0301-direct-runtime-000c");
});
