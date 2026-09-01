import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { execute } from "../src/engine.js";
import { route } from "../src/router.js";
import { requiredReads } from "../src/loading/manifest.js";
import { execute as executeFromEntry, READ_ORDER as ENTRY_READ_ORDER } from "../START_HERE.js";
import { THREE_ZERO_COUNTERS } from "../src/validation/convergence.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..");

const ledger = requiredReads("PACK_CUTOUT").map((path) => ({ path, exists: true, read: true }));
const base = {
  boot: { readLedger: ledger },
  externalContext: {
    present: true,
    gate021: { path: "project/START.md", exists: true, read: true, readOrderRefs: [] }
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
  "00_README.md", "00_packGateIndex.json", "00_sourceMountIndex.json",
  "01_pack_profile.md", "02_world_axis_used.md", "03_character_used.md",
  "04_layer_common.md", "04_world_axis_layer_binding.json", "08_terms.md",
  "09_writer_boot.md", "10_stop_rules.md", "11_layer_backlog.md"
];

const validPackRootShelves = () => ["05_band_profiles", "06_continuity", "07_episodes", "12_pack_cutout_log"];

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
  packagerRuntimeVersion: "SP00_v002",
  packagerRuntimeSha256: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  rootRequiredFiles: validPackRootFiles(),
  rootRequiredShelves: validPackRootShelves(),
  episodeRequiredFiles: [
    "00_episode_index.md", "01_ready.md", "02_v2.md", "03_layer.md",
    "03_layer_binding_manifest.json", "04_crosscheck.md", "05_frozen.md",
    "06_execution_queue.md", "07_sources.md"
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
  stop_policy: ["WORLD_FACT_MODIFICATION_BY_LAYER", "UNVERIFIED_SOURCE_PROMOTION", "MISSING_WORLD_AXIS_TARGET", "MISSING_BINDING_SOURCE"],
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
    stop_policy: ["WORLD_FACT_MODIFICATION_BY_LAYER", "UNVERIFIED_SOURCE_PROMOTION", "MISSING_WORLD_AXIS_TARGET", "MISSING_BINDING_SOURCE"]
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
  lineCounts: { "07_episodes/episode_001/01_ready.md": 40 },
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
    reference_only: ["候補棚"]
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
  crosscheck: { readyConditionIdsRecoveredByV2: ["R1", "R2"], unmapped: [], conflicts: [] },
  frozen: { summarizesInsteadOfReferences: false },
  requiresExecutionQueue: false
});

const validGateIndex = () => ({
  episodeIds: ["E001"],
  readOrder: ["E001"],
  usedAsReadSubstitute: false,
  usedAsStorySource: false
});

const validRequest = () => ({
  operation: "PACK_CUTOUT",
  ...base,
  runtime: {
    mode: "SP00.MODE.pack_cutout",
    invocationOrigin: "USER_EXPLICIT",
    registrations: [{ value: "sp00.packager.crosscheck" }],
    lookup: { requests: [{ tag: "sp00.packager.crosscheck", sourceId: "SP00.SRC.pack.cutout.v1" }] }
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
    projectTagSearchBinding: validProjectTagSearchBinding(),
    tagSearchConvergence: validTagSearchConvergence(),
    storyPackSelfContained: true,
    processLog: "PACKAGER_PROCESS_ACTIVE\nPACKAGER_PROCESS_COMPLETE",
    episodes: [validCutoutEpisode()]
  }
});

test("story pack cutout commands route only to PACK_CUTOUT", () => {
  for (const command of ["話パック切り出し", "話パック生成", "梱包作業", "pack writer handoff"]) {
    const result = route(command);
    assert.equal(result.kind, "ROUTED");
    assert.equal(result.operation, "PACK_CUTOUT");
  }
});

test("consultation text does not execute", () => {
  for (const command of ["話パックとは何", "話パック切り出しについて相談", "『話パック切り出し』と言ったらどうなる？"]) {
    const result = route(command);
    assert.equal(result.kind, "STOP");
  }
});

test("SP00 valid story pack cutout passes", () => {
  const result = execute(validRequest());
  assert.equal(result.decision, "PASS");
  assert.equal(result.modeCompletion, "STAY_IN_STORY_PACK_CUTOUT_RUNTIME");
  assert.equal(result.operation, "PACK_CUTOUT");
});

test("SP00 stops on three-zero counter residue", () => {
  const request = validRequest();
  request.packCutout.dryRuns[2].route_mismatch = 1;
  const result = execute(request);
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "THREE_ZERO_COUNTER_NONZERO"));
});

test("SP00 stops on namespace mixing", () => {
  const request = validRequest();
  request.runtime.registrations = [{ value: "project.cat.episode.049" }];
  const result = execute(request);
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "NAMESPACE_MIXED"));
});

test("entry export and active required reads exist", () => {
  assert.equal(executeFromEntry(validRequest()).decision, "PASS");
  assert.ok(ENTRY_READ_ORDER.includes("src/modules/packCutout.js"));
  for (const rel of requiredReads("PACK_CUTOUT")) {
    assert.equal(existsSync(resolve(REPO_ROOT, rel)), true, `${rel} should exist`);
  }
});

test("independent identity has no mount/design routes", () => {
  const readme = readFileSync(resolve(REPO_ROOT, "README.md"), "utf8");
  assert.ok(readme.includes("independent Story Pack Cutout runtime"));
  assert.equal(route("マウント移管して").kind, "STOP");
  assert.equal(route("話カードv2").kind, "STOP");
});
