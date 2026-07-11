import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { execute } from "../src/engine.js";
import { route } from "../src/router.js";
import { MODULES } from "../src/runtime/program.js";
import { ALWAYS_READ } from "../src/boot/validator.js";
import { OPERATION_READS } from "../src/loading/manifest.js";
import { validateIndexGraph } from "../src/indexing/validator.js";
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
import { calculateTagDefinitionDigest } from "../src/indexing/searchEngine.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..");

const ledger = [...new Set([
  ...ALWAYS_READ,
  ...Object.values(OPERATION_READS).flat()
])].map((path) => ({ path, exists: true, read: true }));
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
    treatMissingProjectAsStop: false,
    useMetadataOverGate: false,
    useRestartMemoAsEntry: false,
    useEndLogAsCanonical: false,
    readAllToolsAtStartup: false
  }
};

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
    assert.equal(routed.spec.tool, "PACK_CUTOUT");
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
    assert.equal(routed.spec.tool, "MOUNT_TRANSFER");
  }
});

const validIndex = () => ({
  items: [{
    id: "DS-024-001", location: "024/VAR.md#item", shelf: "024",
    state: "ADOPTED", tagShelf: "CHARACTER", tags: ["#CHAR:kai"],
    entityIds: ["ENT-CHAR-001"], relationIds: ["REL-001"],
    stopTags: ["#stop:no_auto_mount"]
  }],
  entities: [
    { id: "ENT-CHAR-001", kind: "CHARACTER", name: "Kai",
      location: "022/CHAR.md#kai", state: "ADOPTED", tagShelf: "CHARACTER",
      tags: ["#CHAR:kai"], relationIds: ["REL-001"] },
    { id: "ENT-ORG-001", kind: "ORGANIZATION", name: "Org",
      location: "022/ORG.md#org", state: "ADOPTED", tagShelf: "ORGANIZATION",
      tags: ["#ORG:org"], relationIds: ["REL-001"] }
  ],
  relations: [{
    id: "REL-001", kind: "MEMBERSHIP", subjectId: "ENT-CHAR-001",
    objectId: "ENT-ORG-001", state: "ADOPTED",
    location: "022/ORG.md#membership", tags: ["#RELTYPE:membership"]
  }],
  stopTags: [{
    tag: "#stop:no_auto_mount", meaning: "No automatic mount",
    scope: "MOUNT_TRANSFER", assignedTo: ["DS-024-001"], released: false
  }]
});

const validSearchRequest = (query = "DS-024-001") => {
  const content = "header\nKai condition\nfooter";
  const sha256 = createHash("sha256").update(Buffer.from(content, "utf8")).digest("hex");
  const defineTag = (tag_name, tag_type, meaning, role) => {
    const definition = {
      tag_name, tag_type, meaning, role,
      introduced_version: "v1", update_history: ["created"]
    };
    return { ...definition, definition_digest: calculateTagDefinitionDigest(definition) };
  };
  const tagDefinitions = [
    defineTag("#CHAR:kai", "ITEM", "Kai item linkage", "item lookup"),
    defineTag("#CHAR:kai", "ENTITY", "Kai person entity", "entity lookup"),
    defineTag("#ORG:org", "ENTITY", "Org entity", "entity lookup"),
    defineTag("#RELTYPE:membership", "RELATION", "Membership relation", "relation lookup")
  ];
  const catalog = [{
    item_id: "DS-024-001", item_name: "Kai condition",
    role: "variable condition", adoption_state: "ADOPTED",
    source_text: "Kai condition", source_file: "024/VAR.md",
    source_lines: [2, 2], applies_to: ["CARD", "EPISODE_PACK"],
    condition_type: "VARIABLE", canon_status: "NON_CONDITION",
    update_history: ["created"], shelf: "024",
    tags: ["#CHAR:kai"], aliases: ["カイ"]
  }];
  return {
    operation: "TAG_SEARCH", ...base, project,
    designerDiscipline: structuredClone(base.designerDiscipline),
    designerChangeSet: structuredClone(base.designerChangeSet),
    index: validIndex(),
    search: {
      query,
      requireUserTagName: false,
      skipExistingIndex: false,
      useTagAsCanonical: false,
      useStopTagAsCanonical: false,
      markCompleteFromTagOnly: false,
      confirmUnconfirmedFromResult: false,
      sourceDocuments: [{ path: "024/VAR.md", content, sha256 }],
      tagDefinitions,
      previousTagDefinitions: structuredClone(tagDefinitions),
      changeRequests: [],
      entityTagDefinitions: [
        {
          tag_name: "#CHAR:kai", entity_kind: "PERSON", meaning: "Kai person",
          allowed_aliases: ["Kai"], denied_aliases: [], canonical_state: "ADOPTED"
        },
        {
          tag_name: "#ORG:org", entity_kind: "ORGANIZATION", meaning: "Org",
          allowed_aliases: ["Org"], denied_aliases: [], canonical_state: "ADOPTED"
        }
      ],
      relationTagDefinitions: [{
        tag_name: "#RELTYPE:membership", relation_kind: "MEMBERSHIP",
        from_entity_kind: "PERSON", to_entity_kind: "ORGANIZATION",
        directionality: "DIRECTED", meaning: "membership",
        allowed_usage: ["lookup"], denied_usage: [], canonical_state: "ADOPTED"
      }],
      catalog,
      previousCatalog: structuredClone(catalog),
      lineReferenceUpdates: []
    }
  };
};

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
  index: validIndex(),
  transfer: {
    currentMountPresent: true, gate021Read: true, inventoryBuilt: true,
    diffReportBuilt: true, phase: "PREPARE",
    dailyPrimarySource: "MOUNT_ZIP", canonicalArchive: "PROJECT_HISTORY_SHELF",
      mountTransferProcessActive: true,
      existingShelvesPreserved: true,
      nextIndividualRestartReady: true, mountTransferProcessActive: true, existingShelvesPreserved: true, nextIndividualRestartReady: true,
    inventory: [{ id: "I1" }], reflected: [{ id: "I1" }], held: [], discarded: [],
    shelves: { "022": [{ state: "USER_FIXED" }], "028": [{ state: "UNCONFIRMED" }] },
    resultGate021: {
      readOrder: ["022"], currentLocation: "024", canonicalRoute: "022",
      unresolvedStops: [], nextWork: "continue"
    },
    restartResolvedRefs: [{ path: "022/CORE.md", section: "canon", exists: true, read: true }],
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

test("常時必読欠損はSTOP", () => {
  const result = execute({
    operation: "BOOT",
    ...base,
    boot: { ...base.boot, readLedger: ledger.slice(1) }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "ALWAYS_READ_MISSING"));
});

test("作品投入時は021読む順を実読", () => {
  const badProject = structuredClone(project);
  badProject.gate021.readOrderRefs[0].read = false;
  const result = execute({ operation: "BOOT", ...base, project: badProject });
  assert.equal(result.decision, "STOP");
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

test("索引グラフは端点・逆引き・STOP_TAGを検査", () => {
  assert.equal(validateIndexGraph(validIndex()).decision, "PASS");
  const broken = validIndex();
  broken.entities[0].relationIds = [];
  assert.equal(validateIndexGraph(broken).decision, "STOP");
});

test("通常設計さんはID・タグ・別名・参照元を検索できる", () => {
  for (const query of ["DS-024-001", "#CHAR:kai", "カイ", "024/VAR.md"]) {
    const result = execute(validSearchRequest(query));
    assert.equal(result.decision, "PASS");
    assert.ok(result.moduleOutput.matches.some((entry) => entry.item_id === "DS-024-001"));
    assert.ok(result.moduleOutput.sourcePaths.includes("024/VAR.md"));
  }
});

test("通常設計さんはENTITYとRELATIONを検索できる", () => {
  const entity = execute(validSearchRequest("Kai"));
  assert.ok(entity.moduleOutput.matches.some((entry) => entry.matchType === "ENTITY"));
  const relation = execute(validSearchRequest("MEMBERSHIP"));
  assert.ok(relation.moduleOutput.matches.some((entry) => entry.matchType === "RELATION"));
});

test("検索結果なしは推測せず不在理由を返す", () => {
  const result = execute(validSearchRequest("登録されていない語"));
  assert.equal(result.decision, "PASS");
  assert.deepEqual(result.moduleOutput.matches, []);
  assert.deepEqual(result.moduleOutput.absenceReasons, ["NO_REGISTERED_MATCH"]);
});

test("住所不明・タグ意味不明・索引不一致は通常検索でSTOP", () => {
  const badLine = validSearchRequest();
  badLine.search.catalog[0].source_lines = [1, 1];
  let result = execute(badLine);
  assert.ok(result.issues.some((entry) => entry.ruleId === "SEARCH_SOURCE_TEXT_MISMATCH"));

  const badTag = validSearchRequest();
  badTag.search.tagDefinitions = [];
  result = execute(badTag);
  assert.ok(result.issues.some((entry) => entry.ruleId === "TAG_MEANING_UNDEFINED"));

  const mismatch = validSearchRequest();
  mismatch.search.catalog = [];
  result = execute(mismatch);
  assert.ok(result.issues.some((entry) => entry.ruleId === "SEARCH_CATALOG_INDEX_MISMATCH"));
});

test("通常設計工程はまとめ癖矯正5条件の欠落をSTOP", () => {
  for (const field of [
    "originals_read", "no_inference_completion", "no_condition_compression",
    "no_source_condition_drop", "summary_not_source"
  ]) {
    const request = validSearchRequest();
    request.designerDiscipline[field] = false;
    const result = execute(request);
    assert.equal(result.decision, "STOP");
    assert.ok(result.issues.some((entry) => entry.code === "DESIGNER_DISCIPLINE_REQUIRED"));
  }
});

test("通常工程の新規項目は完全な管理札を要求", () => {
  for (const field of ["created_at", "added_reason", "dependency", "related_items", "navigation_references"]) {
    const request = validSearchRequest();
    delete request.designerChangeSet.registrations[0][field];
    const result = execute(request);
    assert.equal(result.decision, "STOP");
    assert.ok(result.issues.some((entry) =>
      ["NEW_ITEM_FIELD_MISSING", "NEW_ITEM_RELATION_FIELDS_INVALID", "NAVIGATION_UPDATE_UNDECIDED"].includes(entry.code)));
  }
});

test("タグ意味変更はCHANGE_REQUESTなしでSTOP", () => {
  const request = validSearchRequest();
  const definition = request.search.tagDefinitions.find((entry) =>
    entry.tag_name === "#CHAR:kai" && entry.tag_type === "ITEM");
  definition.meaning = "changed meaning";
  definition.definition_digest = calculateTagDefinitionDigest(definition);
  const result = execute(request);
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "TAG_MEANING_DRIFT"));
});

test("タグ意味変更は明示CHANGE_REQUESTがある場合だけPASS", () => {
  const request = validSearchRequest();
  const definition = request.search.tagDefinitions.find((entry) =>
    entry.tag_name === "#CHAR:kai" && entry.tag_type === "ITEM");
  definition.meaning = "approved changed meaning";
  definition.definition_digest = calculateTagDefinitionDigest(definition);
  request.search.changeRequests = [{
    request_id: "CR-001", tag_name: "#CHAR:kai", tag_type: "ITEM",
    approved: true, user_decision_ref: { sourcePath: "chat", section: "decision-1" }
  }];
  assert.equal(execute(request).decision, "PASS");
});

test("新しいタグ定義は旧タグの意味を変えず追加できる", () => {
  const request = validSearchRequest();
  const definition = {
    tag_name: "#ITEM:new", tag_type: "ITEM", meaning: "new item",
    role: "item lookup", introduced_version: "v2", update_history: ["created"]
  };
  request.search.tagDefinitions.push({
    ...definition, definition_digest: calculateTagDefinitionDigest(definition)
  });
  assert.equal(execute(request).decision, "PASS");
});

test("ENTITYとRELATIONタグは専用意味定義なしで検索できない", () => {
  const noEntity = validSearchRequest("Kai");
  noEntity.search.entityTagDefinitions = [];
  let result = execute(noEntity);
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "ENTITY_TAG_MEANING_UNDEFINED"));

  const noRelation = validSearchRequest("MEMBERSHIP");
  noRelation.search.relationTagDefinitions = [];
  result = execute(noRelation);
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "RELATION_TAG_MEANING_UNDEFINED"));
});

test("RELATIONタグは向きと端点種別が必須", () => {
  const request = validSearchRequest("MEMBERSHIP");
  delete request.search.relationTagDefinitions[0].directionality;
  delete request.search.relationTagDefinitions[0].from_entity_kind;
  const result = execute(request);
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "RELATION_TAG_DEFINITION_INCOMPLETE"));
});

test("通常行参照変更は履歴なしでSTOPし、完全履歴ならPASS", () => {
  const request = validSearchRequest();
  const content = "new header\nheader\nKai condition\nfooter";
  request.search.sourceDocuments[0] = {
    path: "024/VAR.md", content,
    sha256: createHash("sha256").update(Buffer.from(content, "utf8")).digest("hex")
  };
  request.search.catalog[0].source_lines = [3, 3];
  let result = execute(request);
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "LINE_REFERENCE_UPDATE_INCOMPLETE"));

  request.search.lineReferenceUpdates = [{
    item_id: "DS-024-001", source_file: "024/VAR.md",
    old_source_lines: [2, 2], new_source_lines: [3, 3],
    line_ref_status: "UPDATED", update_reason: "header inserted",
    updated_at: "2026-06-23",
    update_history: [{
      from: [2, 2], to: [3, 3], reason: "header inserted", updated_at: "2026-06-23"
    }]
  }];
  result = execute(request);
  assert.equal(result.decision, "PASS");
});

test("通常行参照更新でstable item_id変更はSTOP", () => {
  const request = validSearchRequest();
  request.search.catalog[0].item_id = "DS-024-RENAMED";
  request.index.items[0].id = "DS-024-RENAMED";
  const result = execute(request);
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "LINE_STABLE_ID_SET_CHANGED"));
});

test("TAG_SEARCH repairsは提案専用で最終出力される", () => {
  const request = validSearchRequest();
  request.index.entities = request.index.entities.filter((entry) => entry.id !== "ENT-ORG-001");
  const result = execute(request);
  assert.equal(result.decision, "STOP");
  assert.ok(result.moduleOutput.repairs.length > 0);
  assert.ok(result.moduleOutput.repairs.every((entry) => entry.apply_status === "PROPOSAL_ONLY"));
  assert.ok(result.moduleOutput.repairs.some((entry) => entry.repair_type === "MISSING_INDEX"));
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

test("マウント移管は棚境界・021再起動・索引を同時検査", () => {
  const result = execute({
    operation: "MOUNT_TRANSFER", ...base, project, sources: [], currentMount: { present: true },
    mountTransferInvocation: {
      mode: "MOUNT_TRANSFER_BACKPACK", operation: "MOUNT_TRANSFER",
      origin: "USER_EXPLICIT", reason: "transfer"
    },
    index: validIndex(),
    transfer: {
      currentMountPresent: true, gate021Read: true, inventoryBuilt: true,
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
      shelves: {
        "022": [{ state: "USER_FIXED" }],
        "028": [{ state: "UNCONFIRMED" }]
      },
      resultGate021: {
        readOrder: ["022"], currentLocation: "024", canonicalRoute: "022",
        unresolvedStops: [], nextWork: "continue"
      },
      restartResolvedRefs: [{ path: "022/CORE.md", section: "canon", exists: true, read: true }]
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
    index: validIndex(),
    transfer: {
      currentMountPresent: true, gate021Read: true, inventoryBuilt: true,
      diffReportBuilt: true, phase: "PREPARE",
      dailyPrimarySource: "MOUNT_ZIP", canonicalArchive: "PROJECT_HISTORY_SHELF",
      mountTransferProcessActive: true,
      existingShelvesPreserved: true,
      nextIndividualRestartReady: true, mountTransferProcessActive: true, existingShelvesPreserved: true, nextIndividualRestartReady: true,
      commonOperationUsedAsStorySource: true,
      inventory: [{ id: "I1" }], reflected: [{ id: "I1" }], held: [], discarded: [],
      shelves: { "022": [{ state: "USER_FIXED" }], "028": [{ state: "UNCONFIRMED" }] },
      resultGate021: {
        readOrder: ["022"], currentLocation: "024", canonicalRoute: "022",
        unresolvedStops: [], nextWork: "continue"
      },
      restartResolvedRefs: [{ path: "022/CORE.md", section: "canon", exists: true, read: true }]
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
  assert.equal(Object.keys(ASSET_REGISTRY.specs).length, 12);
  assert.equal(Object.keys(ASSET_REGISTRY.samples).length, 20);
  assert.equal(Object.keys(ASSET_REGISTRY.templates).length, 9);
});

test("上位運用とCODEX検査治具の境界を保持する", () => {
  assert.equal(COMPARISON_ASSETS.fileCount, 23);
  assert.equal(COMPARISON_ASSETS.canonical, false);
  assert.equal(COMPARISON_ASSETS.role, "CODEX_FIXTURE_IGNORED_BY_GPT_RUNTIME");
  assert.equal(OPERATION_ASSETS.archivedVersionsIncluded, false);
  assert.equal(OPERATION_ASSETS.runtimeHistoryIncluded, false);
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
  const paths = [...new Set(Object.values(OPERATION_READS).flat())];
  for (const path of paths) {
    assert.equal(existsSync(resolve(root, path)), true, `${path} should exist`);
  }
  assert.ok(OPERATION_READS.PACK_CUTOUT.includes(
    "assets/dsgn_infra/04_MODULE/packager/PACKAGER_CURRENT_ROUTE_V2_v0194.md"
  ));
  assert.ok(OPERATION_READS.PACK_CUTOUT.includes(
    "assets/dsgn_infra/04_MODULE/packager/PACKAGER_ABSOLUTE_PACKAGING_LOCK_v0199.md"
  ));
  assert.ok(OPERATION_READS.PACK_CUTOUT.includes(
    "assets/dsgn_infra/03_REFERENCE/layer/layer_alias_to_current_keys_v0194.md"
  ));
  assert.ok(OPERATION_READS.PACK_CUTOUT.includes(
    "assets/samples/SAMPLE_REFERENCES/WRITING_FREEZE_CARD_TEMPLATE_V2.md"
  ));
});



test("v019.14 cleanupはPACK_CUTOUT必読・schema正本・残骸ゼロ導線を収束する", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const root = resolve(here, "..");
  const read = (path) => readFileSync(resolve(root, path), "utf8");

  assert.ok(OPERATION_READS.PACK_CUTOUT.includes(
    "assets/dsgn_infra/04_MODULE/common/ALL_LINE_FULL_CONVERGENCE_SWEEP_LOCK_v001.md"
  ));

  const handoffSchema = JSON.parse(read("assets/dsgn_infra/04_MODULE/packager/PACKAGER_WRITER_HANDOFF_SCHEMA_v1.json"));
  assert.equal(handoffSchema.applies_to_designer_runtime, "v019.15-NLCORE-HISTORY-MASTER-REAPPLY-LOCKED");
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
  assert.ok(noResidue.includes("DESIGNER_RUNTIME_ACTIVE_ROUTE_NO_RESIDUE_LOCK"));
  assert.ok(noResidue.includes("履歴が存在することはSTOPではない"));
  assert.ok(noResidue.includes("ACTIVE_ROUTE_HISTORY_LEAK"));

  const routeSchema = read("assets/dsgn_infra/04_MODULE/packager/PACKAGER_CURRENT_ROUTE_V2_v0194.md");
  assert.ok(routeSchema.includes("VERSION: v019.4 route schema"));
  assert.ok(routeSchema.includes("APPLIES_TO_RUNTIME: v019.15-NLCORE-HISTORY-MASTER-REAPPLY-LOCKED"));

  const sampleIndex = read("assets/samples/SAMPLE_REFRESH_INDEX_v019_4.md");
  assert.ok(sampleIndex.includes("VERSION: v019.4 route schema"));
  assert.ok(sampleIndex.includes("APPLIES_TO_RUNTIME: v019.4.3-DESIGNER-CONVERGED-LOCKED"));

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
  assert.ok(currentRoute.includes("APPLIES_TO_RUNTIME: v019.15-NLCORE-HISTORY-MASTER-REAPPLY-LOCKED"));
  assert.ok(currentRoute.includes("00_sourceMountIndex.json"));
  assert.ok(currentRoute.includes("03_layer_binding_manifest.json"));
  assert.equal(currentRoute.includes("material map に未分類section"), false);
});

test("全moduleを登録する", () => {
  assert.deepEqual(Object.keys(MODULES), [
    "CORE", "CHECK", "TAG_SEARCH", "CARD", "CARD_TEST", "LOG",
    "MOUNT_TRANSFER", "ARCHIVE", "END_LOG",
    "SINGLE_EPISODE_PROFILE_GATE", "EPISODE_PACK", "PACK_CUTOUT"
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
  projectTagSearchBindingRequired: true,
  tagIndexMachineSchema: "TAG_INDEX_MACHINE_SCHEMA_v1",
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

const validProjectTagSearchBinding = () => ({
  schema_id: "PROJECT_TAG_SEARCH_BINDING_v1",
  domains: ["WORLD_AXIS", "CHARACTER", "PLACE", "ITEM", "RELATION", "LAYER_BINDING"],
  projectTagSearchDoesNotAuthorizeBody: true,
  searchResultRequiresDesignerConditioning: true,
  sourceRefsPreservedToPack: true,
  tagIndexMachineSchema: "TAG_INDEX_MACHINE_SCHEMA_v1",
  sourceAddressPolicy: {
    tagSearchAddress: "source_file/source_lines",
    packCutoutAddress: "source_file_current/source_lines_current",
    mixPolicy: "MIXING_FORBIDDEN"
  }
});

const validTagSearchConvergence = () => ({
  tagIndexMachineSchemaLocked: true,
  projectTagSearchBindingLocked: true,
  worldAxisLayerBindingIndexed: true,
  episodeLayerActivationIndexed: true,
  sourceAddressBoundaryLocked: true,
  repairProposalOnlyLocked: true,
  fullConvergenceSweepCoversTags: true,
  autoRepairAllowed: false
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

test("PACK_CUTOUTは5枚を分離したまま通す", () => {
  const result = execute({
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
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: validWriterComfortCheck(),
      packagerWriterHandoff: validPackagerWriterHandoff(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [validCutoutEpisode()]
    }
  });
  assert.equal(result.decision, "PASS");
  assert.equal(result.modeCompletion, "STAY_IN_PACKAGER");
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
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
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
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
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
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
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
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
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
      expectedCount: 1,
      rootFiles: validPackRootFiles(),
      rootShelves: validPackRootShelves(),
      packCutoutLogShelf: validPackCutoutLogShelf(),
      gateIndex: validGateIndex(),
      projectReadLedger: [{ path: "project.zip", exists: true, read: true }],
      writerComfortCheck: validWriterComfortCheck(),
      packagerWriterHandoff: validPackagerWriterHandoff(),
      worldAxisLayerBinding: validWorldAxisLayerBinding(),
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
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
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
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
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
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
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
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
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
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
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
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
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
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
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
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
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
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
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
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
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
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
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
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
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
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
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
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
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [episode]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "EPISODE_LAYER_FULL_REASON_MISSING"));
});

test("PACK_CUTOUTは作品側TAG_SEARCH接続欠落をSTOP", () => {
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
      tagSearchConvergence: validTagSearchConvergence(),
      storyPackSelfContained: true,
      processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
      episodes: [validCutoutEpisode()]
    }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "PROJECT_TAG_SEARCH_BINDING_MISSING"));
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
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
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
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
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
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
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
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
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
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
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
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
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
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
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
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
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
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
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
      projectTagSearchBinding: validProjectTagSearchBinding(),
      tagSearchConvergence: validTagSearchConvergence(),
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

test("移管バックパックは明示起動なしでも設計さん自律起動する", () => {
  const request = validTransferRequest();
  delete request.mountTransferInvocation;
  const result = execute(request);
  assert.equal(result.decision, "PASS");
  assert.equal(result.invocation.origin, "DESIGNER_AUTO");
  assert.equal(result.invocation.reason, "AUTO_DETECTED_MOUNT_TRANSFER_OPERATION");
  assert.equal(result.modeCompletion, "RETURN_TO_DESIGNER");
});

test("移管バックパックは設計さん自律起動後に設計さんへ戻る", () => {
  const result = execute(validTransferRequest("DESIGNER_AUTO"));
  assert.equal(result.decision, "PASS");
  assert.equal(result.modeCompletion, "RETURN_TO_DESIGNER");
});

test("移管バックパックはユーザー明示起動後に移管担当で待機", () => {
  const result = execute(validTransferRequest("USER_EXPLICIT"));
  assert.equal(result.decision, "PASS");
  assert.equal(result.modeCompletion, "STAY_IN_TRANSFER_BACKPACK");
});

test("司書門は既存path移動を移管失敗としてSTOP", () => {
  const request = validTransferRequest();
  request.transfer.librarian.afterStructure[2].path = "PROJECT/NEW/CORE.md";
  const result = execute(request);
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "EXISTING_PATH_REMOVED_OR_MOVED"));
});


test("v019.15 current packager writer route has no obsolete dependency stop residues", () => {
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

test("v019.15 designer runtime ships no change-history residue files", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const root = resolve(here, "..");
  const forbiddenPaths = [
    "assets/operation_mount/00_GATE/070_CHANGELOG_V1.md",
    "assets/operation_mount/00_GATE/999_FILELIST_V1.tsv",
    "assets/operation_mount/30_REFERENCE_LOGS",
    "backpacks/MOUNT_TRANSFER_BACKPACK/source",
    "assets/dsgn_infra/07_AUDIT/current_package/root_reports_v019_4",
    "assets/dsgn_infra/07_AUDIT/current_package/root_reports_v019_5",
    "assets/dsgn_infra/07_AUDIT/current_package/root_reports_v019_7",
    "assets/dsgn_infra/07_AUDIT/current_package/root_reports_v019_8"
  ];
  for (const rel of forbiddenPaths) {
    assert.equal(existsSync(resolve(root, rel)), false, `${rel} should not ship`);
  }
  const activeTexts = [
    "README.md",
    "load_order.md",
    "START_HERE.js",
    "src/runtime/mental-runtime.js",
    "assets/operation_mount/00_GATE/010_REQUIRED_READING.md",
    "assets/operation_mount/00_GATE/060_REVISION_POLICY.md"
  ].map((rel) => readFileSync(resolve(root, rel), "utf8")).join("\n");
  assert.equal(/070_CHANGELOG|999_FILELIST|90_ARCHIVES|NOVEL_OPERATION_MOUNT_v0005|NOVEL_OPERATION_MOUNT_V1_20260424|旧版ZIPそのものを抱える|Dropbox/.test(activeTexts), false);
});


test("v019.15 load_order and machine PACK_CUTOUT reads stay aligned", () => {
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
      assert.ok(OPERATION_READS.PACK_CUTOUT.includes(rel), `${rel} should be in OPERATION_READS.PACK_CUTOUT`);
    }
  }
  assert.ok(OPERATION_READS.PACK_CUTOUT.includes("assets/dsgn_infra/04_MODULE/packager/FULL_CONVERGENCE_SWEEP_LOCK_v0198.md"));
});

test("v019.15 operation mount acceptance files are current and no-history", () => {
  const files = [
    "assets/operation_mount/00_GATE/080_WRITING_SIDE_ACCEPTANCE_V1.md",
    "assets/operation_mount/00_GATE/081_DESIGN_SIDE_ACCEPTANCE_V1.md",
    "assets/operation_mount/00_GATE/082_JOINT_FINAL_ACCEPTANCE_V1.md",
    "assets/operation_mount/99_README.md"
  ];
  const text = files.map((rel) => readFileSync(resolve(REPO_ROOT, rel), "utf8")).join("\n");
  assert.equal(/NOVEL_OPERATION_MOUNT_v0005|NOVEL_OPERATION_MOUNT_V1_20260424|30_REFERENCE_LOGS|90_ARCHIVES|完全体候補/.test(text), false);
  assert.ok(text.includes("現行工程骨"));
});


test("v019.15 current schema and runtime identity are self-contained process aligned", () => {
  const schema = JSON.parse(readFileSync(resolve(REPO_ROOT, "assets/dsgn_infra/04_MODULE/packager/PACKAGER_WRITER_HANDOFF_SCHEMA_v1.json"), "utf8"));
  assert.equal(schema.generatedBy, "PACKAGER_PROCESS");
  assert.equal(schema.inputMode, "V2_EPISODE_FOLDER_PROJECTLOCKED_REAL_PACK");
  assert.equal(schema.storyPackSelfContained, true);
  assert.equal(schema.sourceMountIndexRole, "internal_source_record_index");
  assert.ok(schema.requiredStopReasons.includes("INTERNAL_PACK_REFERENCE_MISSING"));
  assert.equal(schema.requiredStopReasons.includes("REQUIRED_SOURCE" + "_MOUNT_NOT_AVAILABLE"), false);

  const runtime = readFileSync(resolve(REPO_ROOT, "src/runtime/mental-runtime.js"), "utf8");
  assert.ok(runtime.includes("v019.15-NLCORE-HISTORY-MASTER-REAPPLY-LOCKED"));
  assert.ok(runtime.includes("Handoff is artifact-based"));
});


test("v019.15 novel line final core lock is present and four-runtime equal", () => {
  const core = readFileSync(resolve(REPO_ROOT, "assets/dsgn_infra/04_MODULE/common/NOVEL_LINE_FINAL_CORE_LOCK_v001.md"), "utf8");
  assert.ok(core.includes("条件内で一切の妥協をせずに、限界まで本文を出す"));
  for (const name of ["設計さん", "執筆さん", "修正刃さま", "野良ちゃん"]) assert.ok(core.includes(name));
  assert.ok(core.includes("equal") || core.includes("対等"));
  const loadOrder = readFileSync(resolve(REPO_ROOT, "load_order.md"), "utf8");
  assert.ok(loadOrder.includes("NOVEL_LINE_FINAL_CORE_LOCK_v001.md"));
});


test("v019.15 DS90-PW90 handoff is artifact-based and writer-version agnostic", () => {
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
  assert.ok(OPERATION_READS.PACK_CUTOUT.includes("assets/dsgn_infra/04_MODULE/common/DS90_PW90_ARTIFACT_HANDOFF_JOINT_LOCK_v001.md"));
});


test("v019.15 artifact means full convergence lock is present and enforced", () => {
  const artifactLock = readFileSync(resolve(REPO_ROOT, "assets/dsgn_infra/04_MODULE/common/ARTIFACT_EQUALS_FULL_CONVERGENCE_LOCK_v01915.md"), "utf8");
  const readPlan = OPERATION_READS.PACK_CUTOUT;
  assert.ok(artifactLock.includes("成果物"));
  assert.ok(artifactLock.includes("完全収束"));
  assert.ok(artifactLock.includes("候補、途中生成"));
  assert.ok(artifactLock.includes("完全収束していないものは成果物ではない"));
  assert.ok(readPlan.includes("assets/dsgn_infra/04_MODULE/common/ARTIFACT_EQUALS_FULL_CONVERGENCE_LOCK_v01915.md"));
  assert.ok(ALWAYS_READ.includes("assets/dsgn_infra/04_MODULE/common/ARTIFACT_EQUALS_FULL_CONVERGENCE_LOCK_v01915.md"));
});


test("v019.15 mount transfer auto dispatch and history shelf master are enforced", () => {
  const routeResult = route("重いからマウント移管しようか");
  assert.equal(routeResult.kind, "ROUTED");
  assert.equal(routeResult.operation, "MOUNT_TRANSFER");

  const historyPolicy = readFileSync(resolve(REPO_ROOT, "assets/dsgn_infra/04_MODULE/common/EXTERNAL_CONTEXT_HISTORY_RETAINED_ACTIVE_BOUNDARY_POLICY_v020.md"), "utf8");
  assert.ok(historyPolicy.includes("v019.13bを履歴保持マスター"));
  assert.ok(historyPolicy.includes("履歴棚を削って軽量化する方向"));

  const transferLocks = [
    "assets/dsgn_infra/04_MODULE/common/DS90_MOUNT_TRANSFER_AUTO_DISPATCH_LOCK_v01915.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_HANDOFF_NO_AMBIGUITY_LOCK_v01915.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_TRANSFER_CURRENT_COST_ACCEPTANCE_LOCK_v01915.md"
  ];
  for (const rel of transferLocks) {
    assert.ok(ALWAYS_READ.includes(rel));
    assert.ok(OPERATION_READS.MOUNT_TRANSFER.includes(rel));
  }
});

test("v019.15 CODEX fixture boundary removes NOM from PACK_CUTOUT active reads", () => {
  const noNomActive = OPERATION_READS.PACK_CUTOUT.every((rel) => rel !== "assets/dsgn_infra/05_INSERT/nom/nom_gate_insert_min_v3.md");
  assert.equal(noNomActive, true);
  const boundary = readFileSync(resolve(REPO_ROOT, "assets/dsgn_infra/04_MODULE/common/DS90_CODEX_FIXTURE_ACTIVE_ROUTE_BOUNDARY_LOCK_v01915.md"), "utf8");
  assert.ok(boundary.includes("CODEX側検査治具"));
  assert.ok(boundary.includes("PACK_CUTOUTのrequired readには"));
});
