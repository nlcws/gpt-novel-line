import { forbidden, required } from "../runtime/rule.js";
import { validateLookup } from "../dsgn/lookup.js";
import { validateNamespace } from "../dsgn/namespace.js";
import { resolveInvocation } from "../dsgn/invocation.js";
import { validateLegacyMode, validatePackWriterActivation } from "../v2/activation.js";
import { validateMaterialMap } from "../v2/material-map.js";

const issue = (code, path, message) => ({ code, path, message, severity: "STOP" });
const LINE_RANGE_PATTERN = /^L[1-9]\d*(?:-L[1-9]\d*)?$/;
const REQUIRED_LAYER_FIELDS = [
  "surfaceAxis", "pressureAxis", "narrationDestination", "leakAxis",
  "irregularFrame", "episodeSupplement", "backlogRouting",
  "closingVector", "expectedTextEffect"
];
const REQUIRED_LAYER_BINDING_FIELDS = [
  "item", "selected_value", "source_id", "source_role",
  "source_file_current", "source_lines_current", "project_source_refs",
  "allowed_use", "forbidden_expansion"
];
const REQUIRED_COMFORT_FLAGS = [
  "coreLocked",
  "requiredElementsLocked",
  "requiredOrderLocked",
  "forbiddenLinesLocked",
  "connectionLocked",
  "layerResolved",
  "frozenNotReadSubstitute",
  "sourceUnverifiedNotWritten",
  "textDensityGuarded",
  "bodySourceRolesSeparated",
  "selfContainedSourceAddressesLocked"
];
const REQUIRED_HANDOFF_RESPECT_FLAGS = [
  "wouldAcceptAsDownstream",
  "doesNotAskWriterToInferMissingInput",
  "doesNotPromoteUnverifiedSource",
  "preservesBodySourceRoleLabels",
  "actionableStopPrepared",
  "noBlameLanguagePolicy",
  "warnDoesNotBlockSpecPass"
];

const REQUIRED_USER_HEAT_FLAGS = [
  "capturesUserRequestedVision",
  "preservesUserHeatThroughPack",
  "doesNotFlattenToGenericSafeOutput",
  "doesNotReplaceVisionWithProcessConvenience",
  "warnDoesNotCoolSpecPass",
  "stopKeepsVisionAndNamesRepairPoint",
  "deliversWithinVerifiedMaterials"
];

const REQUIRED_FULL_CONVERGENCE_FLAGS = [
  "noUnresolvedPackResidue",
  "noDanglingSourceAddress",
  "noUnclassifiedWarn",
  "noOpenRepairWithoutStopTicket",
  "noWriterComfortResidue",
  "noHeatDeliveryResidue",
  "noPackagerAbsolutePackagingResidue",
  "noPackagerWriterHandoffResidue",
  "rerunUntilStable"
];

const REQUIRED_ARTIFACT_FULL_CONVERGENCE_FLAGS = [
  "artifactMeansFullyConvergedOutput",
  "candidateNotDeliveredAsArtifact",
  "fullConvergenceBeforeHandoff",
  "manifestAndRequiredReadsVerified",
  "internalAddressesResolved",
  "processProofAndInspectionPresent",
  "stopInsteadOfArtifactOnResidue"
];

const REQUIRED_WRITER_V0048_ALIGNMENT_FLAGS = [
  "coverageIdPolicyLocked",
  "coverageTablePolicyDeclared",
  "returnTicketPolicyDeclared",
  "warnClassificationLocked",
  "conflictResolutionOrderLocked",
  "pretextDeliveryIntentRequired",
  "fullConvergenceSweepPlanned",
  "fullConvergenceSweepComplete"
];

const REQUIRED_WARN_CLASSES = Object.freeze(["CRAFT_WARN", "SPEC_WARN", "STOP"]);
const REQUIRED_QUARANTINE_TICKET_FIELDS = Object.freeze([
  "reason", "impact", "requiredFix", "boundary", "resumeCondition"
]);

const LAYER_ACTIVATION_MODES = Object.freeze(["OFF", "PRESET", "SELECT", "FULL"]);
const LAYER_BINDING_WRITER_ROLES = Object.freeze([
  "CONSTRAINT_ONLY", "STYLE_GUIDE", "EMPHASIS_GUIDE", "DENY_AS_BODY_SOURCE"
]);
const REQUIRED_WORLD_AXIS_LAYER_BINDING_FIELDS = Object.freeze([
  "binding_id", "world_axis_target", "layer_key", "allowed_effect",
  "forbidden_effect", "scope", "source_refs", "writer_role"
]);
const WORLD_AXIS_LAYER_STOP_CODES = Object.freeze([
  "WORLD_FACT_MODIFICATION_BY_LAYER",
  "UNVERIFIED_SOURCE_PROMOTION",
  "MISSING_WORLD_AXIS_TARGET",
  "MISSING_BINDING_SOURCE"
]);
const EPISODE_LAYER_MODES = Object.freeze(["OFF", "PRESET", "SELECT", "FULL"]);
const TAG_MACHINE_SCHEMA_ID = "TAG_INDEX_MACHINE_SCHEMA_v1";

const BODY_SOURCE_POLICY = Object.freeze({
  restoreSource: ["01_ready.md", "02_v2.md"],
  restoreConstraint: ["03_layer.md", "05_frozen.md"],
  processOnly: ["04_crosscheck.md", "06_execution_queue.md"],
  referenceOnly: ["07_sources.md"],
  denyAsBodySource: [
    "00_episode_index.md", "03_layer_binding_manifest.json",
    "00_packGateIndex.json", "00_sourceMountIndex.json",
    "README", "manifest", "log"
  ]
});

const CANONICAL_ROOT_REQUIRED_FILES = Object.freeze([
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
]);

const CANONICAL_ROOT_REQUIRED_SHELVES = Object.freeze([
  "05_band_profiles", "06_continuity", "07_episodes", "12_pack_cutout_log"
]);

const CANONICAL_PACK_CUTOUT_LOG_FILES = Object.freeze([
  "00_packager_generation_proof.json",
  "01_packager_inspection_result.json",
  "02_writer_handoff_check.json",
  "03_writer_output_comfort_check.json",
  "04_full_convergence_sweep.json",
  "05_cutout_log.md"
]);

const CANONICAL_EPISODE_ID_TO_FILE = Object.freeze({
  index: "00_episode_index.md",
  ready: "01_ready.md",
  v2: "02_v2.md",
  layer: "03_layer.md",
  layer_binding_manifest: "03_layer_binding_manifest.json",
  layerBindingManifest: "03_layer_binding_manifest.json",
  crosscheck: "04_crosscheck.md",
  frozen: "05_frozen.md",
  execution_queue: "06_execution_queue.md",
  executionQueue: "06_execution_queue.md",
  sources: "07_sources.md"
});

const CANONICAL_EPISODE_REQUIRED_FILES = Object.freeze([
  "00_episode_index.md",
  "01_ready.md",
  "02_v2.md",
  "03_layer.md",
  "03_layer_binding_manifest.json",
  "04_crosscheck.md",
  "05_frozen.md",
  "06_execution_queue.md",
  "07_sources.md"
]);

const CANONICAL_BODY_SOURCE_ROLES = Object.freeze({
  RESTORE_SOURCE: Object.freeze(["01_ready.md", "02_v2.md"]),
  RESTORE_CONSTRAINT: Object.freeze(["03_layer.md", "05_frozen.md"]),
  PROCESS_ONLY: Object.freeze(["04_crosscheck.md", "06_execution_queue.md"]),
  REFERENCE_ONLY: Object.freeze(["07_sources.md"]),
  DENY_AS_BODY_SOURCE: Object.freeze([
    "00_episode_index.md", "03_layer_binding_manifest.json",
    "00_packGateIndex.json", "00_sourceMountIndex.json",
    "README", "manifest", "log"
  ])
});

const CANONICAL_HANDOFF = Object.freeze({
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
  tagIndexMachineSchema: TAG_MACHINE_SCHEMA_ID
});

function validateIdRefs(ids, knownIds, path, code, message) {
  const issues = [];
  if (!Array.isArray(ids) || ids.length === 0) {
    issues.push(issue(code, path, message));
    return issues;
  }
  for (const id of ids) {
    if (!knownIds.has(id)) issues.push(issue(code, path, `${message}: ${id}`));
  }
  return issues;
}

function lineRangeEnd(value) {
  if (!LINE_RANGE_PATTERN.test(String(value ?? ""))) return null;
  return Number([...String(value).matchAll(/\d+/g)].at(-1)[0]);
}

function validateSingleSourceAddress({ sourceFile, sourceLines, lineCounts, path }) {
  const issues = [];
  if (typeof sourceFile !== "string" || sourceFile.trim() === "") {
    issues.push(issue("SOURCE_FILE_CURRENT_MISSING", `${path}.source_file_current`,
      "source_file_currentが必要です"));
  }
  if (typeof sourceLines !== "string" || sourceLines.trim() === "") {
    issues.push(issue("SOURCE_LINES_CURRENT_MISSING", `${path}.source_lines_current`,
      "source_lines_currentが必要です"));
    return issues;
  }
  if (!LINE_RANGE_PATTERN.test(sourceLines)) {
    issues.push(issue("SOURCE_LINES_CURRENT_INVALID", `${path}.source_lines_current`,
      "source_lines_currentはL1-L10形式だけです。ファイル名・ラベル・複数住所を混ぜないでください"));
    return issues;
  }
  if (lineCounts != null) {
    if (typeof sourceFile === "string" && sourceFile.trim() !== "" && !(sourceFile in lineCounts)) {
      issues.push(issue("SOURCE_FILE_CURRENT_NOT_FOUND", `${path}.source_file_current`,
        "source_file_currentが現ZIP内の既知ファイル一覧に存在しません"));
    } else if (sourceFile in lineCounts) {
      const end = lineRangeEnd(sourceLines);
      if (end != null && end > lineCounts[sourceFile]) {
        issues.push(issue("SOURCE_LINES_CURRENT_OUT_OF_RANGE", `${path}.source_lines_current`,
          "source_lines_currentがsource_file_currentの行数を超えています"));
      }
    }
  }
  return issues;
}

function validateCurrentSources(currentSources, lineCounts, path) {
  const issues = [];
  if (currentSources == null) return issues;
  if (!Array.isArray(currentSources) || currentSources.length === 0) {
    issues.push(issue("CURRENT_SOURCES_INVALID", `${path}.current_sources`,
      "複数根拠はcurrent_sources配列でfile/lines/roleへ分ける必要があります"));
    return issues;
  }
  for (const [index, ref] of currentSources.entries()) {
    const base = `${path}.current_sources[${index}]`;
    if (!ref?.file || !ref?.lines || !ref?.role) {
      issues.push(issue("CURRENT_SOURCE_FIELD_MISSING", base,
        "current_sourcesにはfile/lines/roleが必要です"));
      continue;
    }
    issues.push(...validateSingleSourceAddress({
      sourceFile: ref.file,
      sourceLines: ref.lines,
      lineCounts,
      path: base
    }));
  }
  return issues;
}

function validateGateIndex(pack, episodes) {
  const issues = [];
  const gate = pack.gateIndex;
  if (gate == null || typeof gate !== "object" || Array.isArray(gate)) {
    return [issue("PACK_GATE_INDEX_MISSING", "packCutout.gateIndex",
      "話パックにはゲートインデックスが必要です")];
  }
  if (gate.usedAsReadSubstitute === true || gate.usedAsStorySource === true) {
    issues.push(issue("PACK_GATE_INDEX_MISUSED", "packCutout.gateIndex",
      "ゲートインデックスは読了代替・本文条件源にできません"));
  }
  const episodeIds = new Set(episodes.map((entry) => entry.id));
  issues.push(...validateIdRefs(gate.episodeIds, episodeIds, "packCutout.gateIndex.episodeIds",
    "PACK_GATE_EPISODE_UNRESOLVED", "ゲートインデックスの話IDが単話フォルダに解決できません"));
  issues.push(...validateIdRefs(gate.readOrder, episodeIds, "packCutout.gateIndex.readOrder",
    "PACK_GATE_READ_ORDER_UNRESOLVED", "ゲートインデックスの読み順が単話フォルダに解決できません"));
  if (Array.isArray(gate.episodeIds) && gate.episodeIds.length !== episodes.length) {
    issues.push(issue("PACK_GATE_COUNT_MISMATCH", "packCutout.gateIndex.episodeIds",
      "ゲートインデックスの話数と単話フォルダ数が一致しません"));
  }
  return issues;
}

function validateFileRole(file, basePath) {
  const issues = [];
  const role = file?.writer_use ?? file?.writerUse ?? file?.role;
  const id = file?.id;
  const name = file?.path ?? file?.filename ?? id;
  const knownName = typeof name === "string" ? name.split("/").at(-1) : "";
  const restoreSourceNames = new Set(BODY_SOURCE_POLICY.restoreSource);
  const constraintNames = new Set(BODY_SOURCE_POLICY.restoreConstraint);
  const processNames = new Set(BODY_SOURCE_POLICY.processOnly);
  const referenceNames = new Set(BODY_SOURCE_POLICY.referenceOnly);
  const deniedNames = new Set(BODY_SOURCE_POLICY.denyAsBodySource);

  if ((id === "crosscheck" || knownName === "04_crosscheck.md") &&
      ["story_condition", "RESTORE_SOURCE"].includes(role)) {
    issues.push(issue("CROSSCHECK_AS_BODY_SOURCE", basePath,
      "04_crosscheck.mdは検査札/PROCESS_ONLYであり本文復元源ではありません"));
  }
  if ((id === "frozen" || knownName === "05_frozen.md") && role === "RESTORE_SOURCE") {
    issues.push(issue("FROZEN_AS_BODY_SOURCE", basePath,
      "05_frozen.mdは固定条件/制約であり、前段読了代替や本文復元源ではありません"));
  }
  if (deniedNames.has(knownName) && ["story_condition", "RESTORE_SOURCE"].includes(role)) {
    issues.push(issue("DENIED_FILE_AS_BODY_SOURCE", basePath,
      "index/manifestは本文源にできません"));
  }
  if (processNames.has(knownName) && role === "RESTORE_SOURCE") {
    issues.push(issue("PROCESS_ONLY_AS_RESTORE_SOURCE", basePath,
      "PROCESS_ONLYファイルをRESTORE_SOURCEにできません"));
  }
  if (referenceNames.has(knownName) && ["story_condition", "RESTORE_SOURCE"].includes(role)) {
    issues.push(issue("REFERENCE_ONLY_AS_BODY_SOURCE", basePath,
      "REFERENCE_ONLYファイルを本文源にできません"));
  }
  if (restoreSourceNames.has(knownName) && role === "PROCESS_ONLY") {
    issues.push(issue("RESTORE_SOURCE_FILE_DEMOTED", basePath,
      "01_ready.md/02_v2.mdをPROCESS_ONLYへ落とすと本文が痩せます"));
  }
  if (constraintNames.has(knownName) && role === "RESTORE_SOURCE") {
    issues.push(issue("CONSTRAINT_AS_RESTORE_SOURCE", basePath,
      "03_layer.md/05_frozen.mdは本文制約でありRESTORE_SOURCEではありません"));
  }
  return issues;
}

function validateCrosscheckAuthority(crosscheck, basePath) {
  const issues = [];
  if (crosscheck == null) return issues;
  if (crosscheck.externalSourceVerification != null || crosscheck.external_source_verification != null) {
    issues.push(issue("EXTERNAL_RELOAD_TEXT_DENIED", `${basePath}.crosscheck`,
      "正規話パックは現ZIP内完結です。追加ZIP検証・追加ZIP再読込条件を書かないでください"));
  }
  const internal = crosscheck.internalPackCrosscheck ?? crosscheck.internal_pack_crosscheck;
  if ((crosscheck.finalPass === true || crosscheck.writeReady === true) && internal !== "PASS") {
    issues.push(issue("INTERNAL_PACK_CROSSCHECK_REQUIRED", `${basePath}.crosscheck.internalPackCrosscheck`,
      "WRITE前判定は現ZIP内の内部住所検査PASSに基づく必要があります"));
  }
  return issues;
}

function normalizeStopList(value) {
  return Array.isArray(value) ? value : [];
}

function sameList(a = [], b = []) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function validateSourceMountIndex(pack) {
  const issues = [];
  const index = pack.sourceMountIndex;
  if (index == null) return issues;
  const text = JSON.stringify(index);
  const t = (...codes) => String.fromCharCode(...codes);
  const bannedPatterns = [
    new RegExp(t(101,120,116,101,114,110,97,108,79,56,82,101,113,117,105,114,101,100), "i"),
    new RegExp(t(90,73,80,22806,111,56,46,122,105,112), "i"),
    new RegExp(t(90,73,80,22806,90,73,80,20877,12510,12454,12531,12488), "i"),
    new RegExp(t(90,73,80,22806,115,111,117,114,99,101,32,109,111,117,110,116,24517,38920), "i"),
    new RegExp(t(79,56,95,83,79,85,82,67,69,95,77,65,84,69,82,73,65,76,95,77,73,83,83,73,78,71), "i"),
    new RegExp(t(80,82,79,74,69,67,84,95,83,73,68,69,95,69,88,84,69,82,78,65,76,95,82,69,76,79,65,68,95,82,69,81,85,73,82,69,68), "i"),
    new RegExp(t(82,69,81,85,73,82,69,68,95,69,88,84,69,82,78,65,76,95,79,56,95,78,79,84,95,65,86,65,73,76,65,66,76,69), "i"),
    new RegExp("追加ZIP再読込", "i"),
    new RegExp("追加ZIP依存", "i"),
    new RegExp("追加ZIP名指定", "i"),
    new RegExp("追加ZIP", "i"),
    new RegExp("再マウント", "i")
  ];
  if (bannedPatterns.some((pattern) => pattern.test(text))) {
    issues.push(issue("EXTERNAL_RELOAD_TEXT_DENIED", "packCutout.sourceMountIndex",
      "正規話パックは現ZIP内完結です。追加ZIP再読込要求を書かないでください"));
  }
  const beforeWrite = normalizeStopList(index.stop_if_missing_before_write ?? index.stopIfMissingBeforeWrite);
  const legacy = normalizeStopList(index.stop_if_missing ?? index.stopIfMissing);
  if (beforeWrite.length > 0 && legacy.length > 0 && !sameList(beforeWrite, legacy)) {
    issues.push(issue("STOP_IF_MISSING_POLICY_CONFLICT", "packCutout.sourceMountIndex",
      "stop_if_missing_before_writeと旧互換stop_if_missingが矛盾しています"));
  }
  const required = beforeWrite.length > 0 ? beforeWrite : legacy;
  const internalRecords = new Map((index.internal_sources ?? index.internalSources ?? index.source_records ?? index.sourceRecords ?? [])
    .map((entry) => [entry.source_id ?? entry.sourceId ?? entry.mount_id ?? entry.mountId, entry]));
  for (const sourceId of required) {
    const entry = internalRecords.get(sourceId);
    if (entry == null || entry.present === false || entry.exists === false || entry.read === false) {
      issues.push(issue("INTERNAL_PACK_REFERENCE_MISSING", "packCutout.sourceMountIndex",
        `WRITE前必須の内部source recordが現ZIP内で解決できません: ${sourceId}`));
    }
  }
  return issues;
}

function validateWriterAuthority(pack) {
  const issues = [];
  const authority = pack.writeAuthority ?? pack.authority ?? pack.outputAuthority;
  if (["WRITE_CANON", "WRITER_CONSUMABLE_REAL_PACK", "WRITE_READY"].includes(authority) &&
      pack.writerRuntimeGateVerified !== true) {
    issues.push(issue("DESIGNER_SELF_DECLARED_WRITE_AUTHORITY", "packCutout.writeAuthority",
      "設計さん単独出力はWRITE正本/WRITER_CONSUMABLE_REAL_PACKを自称できません"));
  }
  if (pack.designOutputClaimsWriteAuthority === true) {
    issues.push(issue("DESIGN_OUTPUT_CLAIMS_WRITE_AUTHORITY", "packCutout.designOutputClaimsWriteAuthority",
      "設計さん単独出力はWRITE正本扱い禁止です"));
  }
  if (pack.writerRuntimeFile != null && pack.writerRuntimeContract == null) {
    issues.push(issue("WRITER_RUNTIME_FILE_FIXED_WITHOUT_CONTRACT", "packCutout.writerRuntimeFile",
      "writer runtimeは実体名固定ではなく契約名で扱ってください"));
  }
  return issues;
}

function includesAll(actual = [], expected = []) {
  return expected.every((item) => actual.includes(item));
}


function includesEvery(actual = [], expected = []) {
  return expected.every((item) => actual.includes(item));
}

function canonicalFileName(file) {
  const explicit = file?.path ?? file?.filename ?? file?.file ?? file?.name;
  if (typeof explicit === "string" && explicit.trim() !== "") {
    return explicit.split("/").at(-1);
  }
  const id = file?.id;
  return CANONICAL_EPISODE_ID_TO_FILE[id] ?? id;
}

function normalizeFileList(value = []) {
  if (Array.isArray(value)) {
    return value.map((entry) => typeof entry === "string" ? entry.split("/").at(-1) : canonicalFileName(entry));
  }
  if (value && typeof value === "object") {
    return Object.keys(value).map((entry) => entry.split("/").at(-1));
  }
  return [];
}

function validatePackRootShape(pack) {
  const issues = [];
  const rootFiles = normalizeFileList(pack.rootFiles ?? pack.root_files ?? pack.files?.root);
  const rootShelves = normalizeFileList(pack.rootShelves ?? pack.root_shelves ?? pack.shelves?.root);
  if (rootFiles.length === 0) {
    issues.push(issue("PACK_ROOT_FILES_MISSING", "packCutout.rootFiles",
      "梱包さん正規出力候補はroot必須ファイル一覧を持つ必要があります"));
  } else if (!includesEvery(rootFiles, CANONICAL_ROOT_REQUIRED_FILES)) {
    issues.push(issue("PACK_ROOT_REQUIRED_FILES_MISSING", "packCutout.rootFiles",
      "PW90へ渡すroot必須ファイルが不足しています"));
  }
  if (rootFiles.includes("12_pack_cutout_log/")) {
    issues.push(issue("PACK_CUTOUT_LOG_MUST_BE_SHELF", "packCutout.rootFiles",
      "12_pack_cutout_logは.md単体ではなく棚で固定です"));
  }
  if (rootShelves.length === 0) {
    issues.push(issue("PACK_ROOT_SHELVES_MISSING", "packCutout.rootShelves",
      "梱包さん正規出力候補はroot必須棚一覧を持つ必要があります"));
  } else if (!includesEvery(rootShelves, CANONICAL_ROOT_REQUIRED_SHELVES)) {
    issues.push(issue("PACK_ROOT_REQUIRED_SHELVES_MISSING", "packCutout.rootShelves",
      "PW90へ渡すroot必須棚が不足しています"));
  }
  const logShelf = pack.packCutoutLogShelf ?? pack.pack_cutout_log ?? pack.cutoutLogShelf;
  const logFiles = normalizeFileList(logShelf?.files ?? logShelf?.requiredFiles ?? logShelf);
  if (logFiles.length === 0) {
    issues.push(issue("PACK_CUTOUT_LOG_SHELF_MISSING", "packCutout.packCutoutLogShelf",
      "12_pack_cutout_log/には生成証明・検査結果・受け渡し確認・快適出力確認・完全収束スイープを残す必要があります"));
  } else if (!includesEvery(logFiles, CANONICAL_PACK_CUTOUT_LOG_FILES)) {
    issues.push(issue("PACK_CUTOUT_LOG_SHELF_FILES_MISSING", "packCutout.packCutoutLogShelf.files",
      "12_pack_cutout_log/の必須ログファイルが不足しています"));
  }
  return issues;
}


function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

function validateWorldAxisLayerBinding(pack) {
  const issues = [];
  const bindingRoot = pack.worldAxisLayerBinding ?? pack.world_axis_layer_binding ?? pack.worldAxisLayerBindings;
  if (bindingRoot == null || typeof bindingRoot !== "object" || Array.isArray(bindingRoot)) {
    return [issue("WORLD_AXIS_LAYER_BINDING_MISSING", "packCutout.worldAxisLayerBinding",
      "世界軸へのレイヤー設置条件はrootで必須です。レイヤーは設置されるまで未使用素材です")];
  }
  if (bindingRoot.layerDoesNotModifyWorldAxis !== true || bindingRoot.layerCreatesWorldFacts === true ||
      bindingRoot.unverifiedSourcePromotionAllowed === true) {
    issues.push(issue("WORLD_AXIS_LAYER_POLICY_INVALID", "packCutout.worldAxisLayerBinding",
      "レイヤーは世界軸を改変せず、未確認sourceを世界条件へ昇格できません"));
  }
  if (bindingRoot.writerReadsAs !== "CONSTRAINT_ONLY_DENY_BODY_SOURCE") {
    issues.push(issue("WORLD_AXIS_LAYER_WRITER_ROLE_INVALID", "packCutout.worldAxisLayerBinding.writerReadsAs",
      "world_axis_layer_bindingは本文源ではなくCONSTRAINT_ONLY/DENY_AS_BODY_SOURCE扱いで固定です"));
  }
  const bindings = bindingRoot.bindings;
  if (!Array.isArray(bindings) || bindings.length === 0) {
    issues.push(issue("WORLD_AXIS_LAYER_BINDING_EMPTY", "packCutout.worldAxisLayerBinding.bindings",
      "使用するレイヤーはWORLD_AXIS_LAYER_BINDINGとして1件以上設置してください"));
    return issues;
  }
  for (const [index, binding] of bindings.entries()) {
    const base = `packCutout.worldAxisLayerBinding.bindings[${index}]`;
    for (const field of REQUIRED_WORLD_AXIS_LAYER_BINDING_FIELDS) {
      const value = binding?.[field];
      if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) {
        issues.push(issue("WORLD_AXIS_LAYER_BINDING_FIELD_MISSING", `${base}.${field}`,
          "world_axis_target/layer_key/allowed_effect/forbidden_effect/source_refs/writer_roleが必要です"));
      }
    }
    if (binding?.creates_world_fact === true || binding?.modifies_world_axis === true ||
        binding?.promotes_unverified_source === true) {
      issues.push(issue("WORLD_AXIS_LAYER_BINDING_FORBIDDEN_EFFECT", base,
        "レイヤー設置は世界事実の作成・世界軸改変・未確認source昇格を行えません"));
    }
    if (!asArray(binding?.forbidden_effect).some((value) => String(value).includes("create_world_fact")) ||
        !asArray(binding?.forbidden_effect).some((value) => String(value).includes("promote_unverified_source"))) {
      issues.push(issue("WORLD_AXIS_LAYER_FORBIDDEN_EFFECT_INCOMPLETE", `${base}.forbidden_effect`,
        "forbidden_effectには世界事実作成禁止と未確認source昇格禁止を含めてください"));
    }
    const roles = asArray(binding?.writer_role);
    for (const requiredRole of ["CONSTRAINT_ONLY", "DENY_AS_BODY_SOURCE"]) {
      if (!roles.includes(requiredRole)) {
        issues.push(issue("WORLD_AXIS_LAYER_WRITER_ROLE_MISSING", `${base}.writer_role`,
          "執筆さん側の読み方にはCONSTRAINT_ONLYとDENY_AS_BODY_SOURCEが必要です"));
      }
    }
    for (const role of roles) {
      if (!LAYER_BINDING_WRITER_ROLES.includes(role)) {
        issues.push(issue("WORLD_AXIS_LAYER_WRITER_ROLE_UNKNOWN", `${base}.writer_role`,
          `未知のwriter_roleです: ${role}`));
      }
    }
    if (binding?.body_source === true) {
      issues.push(issue("WORLD_AXIS_LAYER_BODY_SOURCE_DENIED", `${base}.body_source`,
        "world_axis_layer_bindingを本文源にできません"));
    }
    const stopPolicy = asArray(binding?.stop_policy ?? bindingRoot.stop_policy);
    for (const code of WORLD_AXIS_LAYER_STOP_CODES) {
      if (!stopPolicy.includes(code)) {
        issues.push(issue("WORLD_AXIS_LAYER_STOP_POLICY_MISSING", `${base}.stop_policy`,
          `${code}をSTOP条件に含める必要があります`));
      }
    }
  }
  return issues;
}

function validateEpisodeLayerActivation(episode, basePath) {
  const issues = [];
  const activation = episode?.layerActivation ?? episode?.episode_layer_activation;
  if (activation == null || typeof activation !== "object" || Array.isArray(activation)) {
    return [issue("EPISODE_LAYER_ACTIVATION_MISSING", `${basePath}.layerActivation`,
      "話側レイヤーはOFF/PRESET/SELECT/FULLを毎話宣言してください")];
  }
  const mode = activation.activation_mode ?? activation.mode;
  if (!EPISODE_LAYER_MODES.includes(mode)) {
    issues.push(issue("EPISODE_LAYER_ACTIVATION_MODE_INVALID", `${basePath}.layerActivation.activation_mode`,
      "activation_modeはOFF/PRESET/SELECT/FULLのいずれかです"));
  }
  if (mode === "FULL" && !hasNonEmptyString(activation.full_activation_reason)) {
    issues.push(issue("EPISODE_LAYER_FULL_REASON_MISSING", `${basePath}.layerActivation.full_activation_reason`,
      "全レイヤーONは例外扱いです。FULLには理由が必要です"));
  }
  if (mode === "PRESET" && !hasNonEmptyString(activation.preset_id)) {
    issues.push(issue("EPISODE_LAYER_PRESET_ID_MISSING", `${basePath}.layerActivation.preset_id`,
      "PRESET使用時はpreset_idが必要です"));
  }
  if (mode === "SELECT" && asArray(activation.enabled_layers).length === 0) {
    issues.push(issue("EPISODE_LAYER_SELECT_EMPTY", `${basePath}.layerActivation.enabled_layers`,
      "SELECT使用時はenabled_layersを明示してください"));
  }
  if (mode === "OFF" && asArray(activation.enabled_layers).length > 0) {
    issues.push(issue("EPISODE_LAYER_OFF_HAS_ENABLED", `${basePath}.layerActivation.enabled_layers`,
      "OFF時は話側レイヤーを有効化しません"));
  }
  if (activation.writer_rule !== "enabled_layers_only") {
    issues.push(issue("EPISODE_LAYER_WRITER_RULE_INVALID", `${basePath}.layerActivation.writer_rule`,
      "執筆さんはenabled_layersだけを読みます"));
  }
  if (activation.allLayersDefaultOn === true || activation.defaultFullActivation === true) {
    issues.push(issue("EPISODE_LAYER_ALL_ON_DEFAULT_DENIED", `${basePath}.layerActivation`,
      "話側レイヤーを毎回全部ONにする運用は禁止です"));
  }
  if (!asArray(activation.layer_backlog_policy).includes("unused_layers_to_11_layer_backlog")) {
    issues.push(issue("EPISODE_LAYER_BACKLOG_POLICY_MISSING", `${basePath}.layerActivation.layer_backlog_policy`,
      "未使用レイヤーは11_layer_backlogへ送る方針を明示してください"));
  }
  return issues;
}

function validateProjectTagSearchBinding(pack) {
  const issues = [];
  const binding = pack.projectTagSearchBinding ?? pack.project_tag_search_binding;
  if (binding == null || typeof binding !== "object" || Array.isArray(binding)) {
    return [issue("PROJECT_TAG_SEARCH_BINDING_MISSING", "packCutout.projectTagSearchBinding",
      "作品側TAG_SEARCHと設計さんTAG_SEARCHの接続定義が必要です")];
  }
  if (binding.schema_id !== "PROJECT_TAG_SEARCH_BINDING_v1") {
    issues.push(issue("PROJECT_TAG_SEARCH_BINDING_SCHEMA_INVALID", "packCutout.projectTagSearchBinding.schema_id",
      "作品側TAG_SEARCH接続はPROJECT_TAG_SEARCH_BINDING_v1で固定です"));
  }
  const requiredDomains = ["WORLD_AXIS", "CHARACTER", "PLACE", "ITEM", "RELATION", "LAYER_BINDING"];
  if (!includesEvery(binding.domains ?? [], requiredDomains)) {
    issues.push(issue("PROJECT_TAG_SEARCH_DOMAIN_MISSING", "packCutout.projectTagSearchBinding.domains",
      "作品側で世界軸・キャラ・場所・小物・関係・レイヤー設置を引ける必要があります"));
  }
  if (binding.projectTagSearchDoesNotAuthorizeBody === false || binding.searchResultRequiresDesignerConditioning !== true ||
      binding.sourceRefsPreservedToPack !== true) {
    issues.push(issue("PROJECT_TAG_SEARCH_AUTHORITY_INVALID", "packCutout.projectTagSearchBinding",
      "作品側タグ検索結果はそのまま本文源にせず、設計さんが条件化しsource_refsを保持して梱包へ渡します"));
  }
  if (binding.tagIndexMachineSchema !== TAG_MACHINE_SCHEMA_ID) {
    issues.push(issue("TAG_INDEX_MACHINE_SCHEMA_MISSING", "packCutout.projectTagSearchBinding.tagIndexMachineSchema",
      "TAG_INDEX_MACHINE_SCHEMA_v1を機械正本にしてください"));
  }
  const sourcePolicy = binding.sourceAddressPolicy ?? {};
  if (sourcePolicy.tagSearchAddress !== "source_file/source_lines" ||
      sourcePolicy.packCutoutAddress !== "source_file_current/source_lines_current" ||
      sourcePolicy.mixPolicy !== "MIXING_FORBIDDEN") {
    issues.push(issue("TAG_SOURCE_ADDRESS_POLICY_INVALID", "packCutout.projectTagSearchBinding.sourceAddressPolicy",
      "TAG_SEARCH住所とPACK_CUTOUT現行住所を混ぜないでください"));
  }
  return issues;
}

function validateTagSearchConvergence(pack) {
  const issues = [];
  const convergence = pack.tagSearchConvergence ?? pack.tag_search_convergence;
  if (convergence == null || typeof convergence !== "object" || Array.isArray(convergence)) {
    return [issue("TAG_SEARCH_FULL_CONVERGENCE_MISSING", "packCutout.tagSearchConvergence",
      "TAG_SEARCH_FULL_CONVERGENCE_LOCKが必要です")];
  }
  const requiredFlags = [
    "tagIndexMachineSchemaLocked",
    "projectTagSearchBindingLocked",
    "worldAxisLayerBindingIndexed",
    "episodeLayerActivationIndexed",
    "sourceAddressBoundaryLocked",
    "repairProposalOnlyLocked",
    "fullConvergenceSweepCoversTags"
  ];
  for (const flag of requiredFlags) {
    if (convergence[flag] !== true) {
      issues.push(issue("TAG_SEARCH_CONVERGENCE_FLAG_NOT_PASS", `packCutout.tagSearchConvergence.${flag}`,
        `${flag}がPASSしていません`));
    }
  }
  if (convergence.autoRepairAllowed === true) {
    issues.push(issue("TAG_SEARCH_AUTO_REPAIR_DENIED", "packCutout.tagSearchConvergence.autoRepairAllowed",
      "TAG_SEARCH repairは最後までPROPOSAL_ONLYです"));
  }
  return issues;
}

function validateSelfContainedProcessPolicy(pack) {
  const issues = [];
  if (pack.storyPackSelfContained !== true) {
    issues.push(issue("STORY_PACK_SELF_CONTAINED_REQUIRED", "packCutout.storyPackSelfContained",
      "話パックは現ZIP内完結として生成してください"));
  }
  const policyText = JSON.stringify({
    rootDocuments: pack.rootDocuments ?? pack.root_documents ?? {},
    stopRules: pack.stopRules ?? pack.stop_rules ?? {},
    writerBoot: pack.writerBoot ?? pack.writer_boot ?? {},
    sourceMountIndex: pack.sourceMountIndex ?? {}
  });
  const t = (...codes) => String.fromCharCode(...codes);
  const bannedPatterns = [
    new RegExp(t(101,120,116,101,114,110,97,108,79,56,82,101,113,117,105,114,101,100), "i"),
    new RegExp(t(90,73,80,22806,111,56,46,122,105,112), "i"),
    new RegExp(t(90,73,80,22806,90,73,80,20877,12510,12454,12531,12488), "i"),
    new RegExp(t(90,73,80,22806,115,111,117,114,99,101,32,109,111,117,110,116,24517,38920), "i"),
    new RegExp(t(79,56,95,83,79,85,82,67,69,95,77,65,84,69,82,73,65,76,95,77,73,83,83,73,78,71), "i"),
    new RegExp(t(80,82,79,74,69,67,84,95,83,73,68,69,95,69,88,84,69,82,78,65,76,95,82,69,76,79,65,68,95,82,69,81,85,73,82,69,68), "i"),
    new RegExp(t(82,69,81,85,73,82,69,68,95,69,88,84,69,82,78,65,76,95,79,56,95,78,79,84,95,65,86,65,73,76,65,66,76,69), "i"),
    new RegExp("追加ZIP再読込", "i"),
    new RegExp("追加ZIP依存", "i"),
    new RegExp("追加ZIP名指定", "i"),
    new RegExp("追加ZIP", "i"),
    new RegExp("再マウント", "i")
  ];
  if (bannedPatterns.some((pattern) => pattern.test(policyText))) {
    issues.push(issue("EXTERNAL_RELOAD_TEXT_DENIED", "packCutout.rootDocuments",
      "話パック正規導線に追加ZIP再読込要求を書かないでください"));
  }
  const processLog = pack.processLog ?? pack.packagerProcessLog ?? pack.cutoutLogText ?? "";
  if (typeof processLog !== "string" ||
      !processLog.includes("PACKAGER_PROCESS_ACTIVE") ||
      !processLog.includes("PACKAGER_PROCESS_COMPLETE")) {
    issues.push(issue("PACKAGER_PROCESS_LOG_MISSING", "packCutout.processLog",
      "梱包工程中/完了を示すPACKAGER_PROCESSログが必要です"));
  }
  return issues;
}

function validatePackagerWriterHandoff(pack) {
  const issues = [];
  const handoff = pack.packagerWriterHandoff ?? pack.writerHandoffContract;
  if (handoff == null || typeof handoff !== "object" || Array.isArray(handoff)) {
    return [issue("PACKAGER_WRITER_CANONICAL_HANDOFF_MISSING", "packCutout.packagerWriterHandoff",
      "梱包さん絶対梱包とパック執筆さん入力を一つに固定するhandoffが必要です")];
  }
  for (const [field, expected] of Object.entries(CANONICAL_HANDOFF)) {
    if (handoff[field] !== expected) {
      issues.push(issue("PACKAGER_WRITER_HANDOFF_FIELD_INVALID", `packCutout.packagerWriterHandoff.${field}`,
        `${field}は${JSON.stringify(expected)}で固定です`));
    }
  }
  if (!includesEvery(handoff.rootRequiredFiles ?? [], CANONICAL_ROOT_REQUIRED_FILES)) {
    issues.push(issue("PACKAGER_WRITER_ROOT_REQUIRED_FILES_MISMATCH", "packCutout.packagerWriterHandoff.rootRequiredFiles",
      "PW90が読むroot必須ファイルが不足しています"));
  }
  if (!includesEvery(handoff.rootRequiredShelves ?? [], CANONICAL_ROOT_REQUIRED_SHELVES)) {
    issues.push(issue("PACKAGER_WRITER_ROOT_REQUIRED_SHELVES_MISMATCH", "packCutout.packagerWriterHandoff.rootRequiredShelves",
      "PW90が読むroot必須棚が不足しています"));
  }
  if (!includesEvery(handoff.episodeRequiredFiles ?? [], CANONICAL_EPISODE_REQUIRED_FILES)) {
    issues.push(issue("PACKAGER_WRITER_EPISODE_REQUIRED_FILES_MISMATCH", "packCutout.packagerWriterHandoff.episodeRequiredFiles",
      "PW90が読む各話9ファイルが不足しています"));
  }
  const roles = handoff.bodySourceRoles ?? {};
  for (const [role, expected] of Object.entries(CANONICAL_BODY_SOURCE_ROLES)) {
    if (!includesEvery(roles[role] ?? [], expected)) {
      issues.push(issue("PACKAGER_WRITER_BODY_SOURCE_ROLE_MISMATCH", `packCutout.packagerWriterHandoff.bodySourceRoles.${role}`,
        `本文源ロール${role}がPW90入力契約と一致していません`));
    }
  }
  if (handoff.generatedBy !== "PACKAGER_PROCESS" || handoff.packagerProcessActive !== true ||
      handoff.packagerOutputOnly !== true || handoff.absolutePackagerPackagingLocked !== true) {
    issues.push(issue("PACKAGER_GENERATION_PROOF_MISSING", "packCutout.packagerWriterHandoff",
      "梱包さん正規生成証明がないものはWRITE投入候補にできません"));
  }
  if (handoff.designerDirectPack === true || handoff.generatedByDesigner === true ||
      handoff.generatedBy === "DESIGNER_RUNTIME" || handoff.designerPackagingAllowed !== false) {
    issues.push(issue("DESIGNER_DIRECT_PACK_DENIED", "packCutout.packagerWriterHandoff",
      "設計さん単独生成ZIPはWRITE投入候補にできません"));
  }
  if (handoff.handoffSchema !== "PACKAGER_WRITER_HANDOFF_SCHEMA_v1") {
    issues.push(issue("PACKAGER_WRITER_SCHEMA_ID_INVALID", "packCutout.packagerWriterHandoff.handoffSchema",
      "梱包さん→パック執筆さん契約はPACKAGER_WRITER_HANDOFF_SCHEMA_v1を正本にする必要があります"));
  }
  if (typeof handoff.handoffSchemaSha256 !== "string" || handoff.handoffSchemaSha256.length < 32) {
    issues.push(issue("PACKAGER_WRITER_SCHEMA_HASH_MISSING", "packCutout.packagerWriterHandoff.handoffSchemaSha256",
      "handoff schemaのsha256を生成証明へ残す必要があります"));
  }
  if (typeof handoff.packagerRuntimeVersion !== "string" || handoff.packagerRuntimeVersion.trim() === "") {
    issues.push(issue("PACKAGER_PROCESS_VERSION_MISSING", "packCutout.packagerWriterHandoff.packagerRuntimeVersion",
      "どの梱包工程で生成したかを残す必要があります"));
  }
  if (typeof handoff.packagerRuntimeSha256 !== "string" || handoff.packagerRuntimeSha256.length < 32) {
    issues.push(issue("PACKAGER_PROCESS_HASH_MISSING", "packCutout.packagerWriterHandoff.packagerRuntimeSha256",
      "梱包工程のsha256を生成証明へ残す必要があります"));
  }
  if (handoff.packagerInspection?.decision !== "PASS") {
    issues.push(issue("PACKAGER_INSPECTION_PASS_REQUIRED", "packCutout.packagerWriterHandoff.packagerInspection.decision",
      "梱包さん検査PASSがないものはWRITE投入候補にできません"));
  }
  if (handoff.storyPackSelfContained !== true) {
    issues.push(issue("STORY_PACK_SELF_CONTAINED_REQUIRED", "packCutout.packagerWriterHandoff.storyPackSelfContained",
      "話パックは現ZIP内完結でなければなりません"));
  }
  if (handoff.manualPack === true) {
    issues.push(issue("MANUAL_PACK_DENIED", "packCutout.packagerWriterHandoff.manualPack",
      "手作業ZIPは正本候補にできません"));
  }
  if (handoff.preclearedStopHackUsed === true) {
    issues.push(issue("PRECLEARED_STOP_HACK_DENIED", "packCutout.packagerWriterHandoff.preclearedStopHackUsed",
      "precleared STOP hackを使った生成物は正本候補にできません"));
  }
  if (handoff.syntheticMaterialMapRoute === true || handoff.materialMapRequired === true) {
    issues.push(issue("MATERIAL_MAP_ROUTE_NOT_CURRENT_WRITER_PACK", "packCutout.packagerWriterHandoff.materialMapRequired",
      "現行の50話実話フォルダ話パックはsynthetic materialMapを要求しません"));
  }
  return issues;
}

function validateWriterComfortCheck(pack) {
  const issues = [];
  const check = pack.writerComfortCheck;
  if (check == null || typeof check !== "object" || Array.isArray(check)) {
    return [issue("WRITER_OUTPUT_COMFORT_CHECK_MISSING", "packCutout.writerComfortCheck",
      "執筆さんが落とさず薄めず迷わず書けるかのWRITER_OUTPUT_COMFORT_CHECKが必要です")];
  }
  for (const flag of REQUIRED_COMFORT_FLAGS) {
    if (check[flag] !== true) {
      issues.push(issue("WRITER_COMFORT_FLAG_NOT_PASS", `packCutout.writerComfortCheck.${flag}`,
        `WRITER_OUTPUT_COMFORT_CHECKの${flag}がPASSしていません`));
    }
  }
  const policy = check.bodySourcePolicy ?? {};
  for (const [key, expected] of Object.entries(BODY_SOURCE_POLICY)) {
    if (!includesAll(policy[key] ?? [], expected)) {
      issues.push(issue("WRITER_COMFORT_BODY_SOURCE_POLICY_MISMATCH", `packCutout.writerComfortCheck.bodySourcePolicy.${key}`,
        `本文源/制約/参照/禁止の棚分けが不足しています: ${key}`));
    }
  }
  if (check.designOutputAuthority !== "DESIGN_OUTPUT_CANDIDATE") {
    issues.push(issue("WRITER_COMFORT_AUTHORITY_INVALID", "packCutout.writerComfortCheck.designOutputAuthority",
      "設計さん側は素材候補までです。梱包さん正規出力はpackagerWriterHandoffで別管理し、WRITE正本は自称できません"));
  }
  if (check.reciprocalHandoffRespectLocked !== true) {
    issues.push(issue("RECIPROCAL_HANDOFF_RESPECT_LOCK_MISSING", "packCutout.writerComfortCheck.reciprocalHandoffRespectLocked",
      "自分が受け取りたくない状態で渡さないための相互受け渡し尊重ロックが必要です"));
  }
  const respect = check.handoffRespectPolicy ?? {};
  for (const flag of REQUIRED_HANDOFF_RESPECT_FLAGS) {
    if (respect[flag] !== true) {
      issues.push(issue("RECIPROCAL_HANDOFF_RESPECT_FLAG_NOT_PASS", `packCutout.writerComfortCheck.handoffRespectPolicy.${flag}`,
        `相互受け渡し尊重の${flag}がPASSしていません`));
    }
  }
  if (check.endUserHeatDeliveryLocked !== true) {
    issues.push(issue("END_USER_HEAT_DELIVERY_LOCK_MISSING", "packCutout.writerComfortCheck.endUserHeatDeliveryLocked",
      "エンドユーザーが持ち込んだ欲しい絵と熱量を冷まさず届けるロックが必要です"));
  }
  const heat = check.userHeatPolicy ?? {};
  for (const flag of REQUIRED_USER_HEAT_FLAGS) {
    if (heat[flag] !== true) {
      issues.push(issue("END_USER_HEAT_DELIVERY_FLAG_NOT_PASS", `packCutout.writerComfortCheck.userHeatPolicy.${flag}`,
        `エンドユーザー熱量保持の${flag}がPASSしていません`));
    }
  }
  if (check.fullConvergenceSweepLocked !== true) {
    issues.push(issue("FULL_CONVERGENCE_SWEEP_LOCK_MISSING", "packCutout.writerComfortCheck.fullConvergenceSweepLocked",
      "未分類の埃・残渣を残さないFULL_CONVERGENCE_SWEEP_LOCKが必要です"));
  }
  const convergence = check.convergenceSweepPolicy ?? {};
  for (const flag of REQUIRED_FULL_CONVERGENCE_FLAGS) {
    if (convergence[flag] !== true) {
      issues.push(issue("FULL_CONVERGENCE_SWEEP_FLAG_NOT_PASS", `packCutout.writerComfortCheck.convergenceSweepPolicy.${flag}`,
        `完全収束スイープの${flag}がPASSしていません`));
    }
  }
  if (check.artifactEqualsFullConvergenceLocked !== true) {
    issues.push(issue("ARTIFACT_FULL_CONVERGENCE_LOCK_MISSING", "packCutout.writerComfortCheck.artifactEqualsFullConvergenceLocked",
      "DS90では成果物=完全収束済み成果物であることを固定する必要があります"));
  }
  const artifactPolicy = check.artifactFullConvergencePolicy ?? {};
  for (const flag of REQUIRED_ARTIFACT_FULL_CONVERGENCE_FLAGS) {
    if (artifactPolicy[flag] !== true) {
      issues.push(issue("ARTIFACT_FULL_CONVERGENCE_FLAG_NOT_PASS", `packCutout.writerComfortCheck.artifactFullConvergencePolicy.${flag}`,
        `成果物完全収束の${flag}がPASSしていません`));
    }
  }
  for (const flag of REQUIRED_WRITER_V0048_ALIGNMENT_FLAGS) {
    if (check[flag] !== true) {
      issues.push(issue("WRITER_V0048_ALIGNMENT_FLAG_NOT_PASS", `packCutout.writerComfortCheck.${flag}`,
        `PW90受け取り契約の${flag}がPASSしていません`));
    }
  }
  if (!includesEvery(check.warnClasses ?? [], REQUIRED_WARN_CLASSES)) {
    issues.push(issue("WARN_CLASSIFICATION_INCOMPLETE", "packCutout.writerComfortCheck.warnClasses",
      "WARNはCRAFT_WARN/SPEC_WARN/STOPへ分類する必要があります"));
  }
  if (!includesEvery(check.quarantineReturnTicketFields ?? [], REQUIRED_QUARANTINE_TICKET_FIELDS)) {
    issues.push(issue("QUARANTINE_RETURN_TICKET_FIELDS_MISSING", "packCutout.writerComfortCheck.quarantineReturnTicketFields",
      "失敗時return ticketにはreason/impact/requiredFix/boundary/resumeConditionが必要です"));
  }
  if (!Array.isArray(check.residueItems) || check.residueItems.length !== 0) {
    issues.push(issue("FULL_CONVERGENCE_RESIDUE_REMAINING", "packCutout.writerComfortCheck.residueItems",
      "residueItemsは空でなければ話パック候補にできません"));
  }
  return issues;
}

function bindingHasField(binding, field) {
  if (binding?.[field] != null && binding[field] !== "" &&
      !(Array.isArray(binding[field]) && binding[field].length === 0)) return true;
  if (field === "item" && binding?.key != null && binding.key !== "") return true;
  if (field === "source_id" && binding?.condition_id != null && binding.condition_id !== "") return true;
  return false;
}

function validateEpisode(episode, index) {
  const issues = [];
  const basePath = `packCutout.episodes[${index}]`;
  const files = episode?.files ?? [];
  const fileIds = new Set(files.map((entry) => entry.id));
  const lineCounts = episode?.lineCounts ?? {};
  const episodeIndex = episode?.episodeIndex;
  if (episodeIndex == null || typeof episodeIndex !== "object" || Array.isArray(episodeIndex)) {
    issues.push(issue("PACK_EPISODE_INDEX_MISSING", `${basePath}.episodeIndex`,
      "1話1フォルダ内には個別インデックスが必要です"));
  } else {
    if (episodeIndex.usedAsReadSubstitute === true || episodeIndex.usedAsStorySource === true) {
      issues.push(issue("PACK_EPISODE_INDEX_MISUSED", `${basePath}.episodeIndex`,
        "個別インデックスは読了代替・本文条件源にできません"));
    }
    issues.push(...validateIdRefs(episodeIndex.requiredFileIds, fileIds, `${basePath}.episodeIndex.requiredFileIds`,
      "PACK_EPISODE_REQUIRED_FILE_UNRESOLVED", "個別インデックスの必須ファイルが単話フォルダ内に解決できません"));
    issues.push(...validateIdRefs(episodeIndex.readOrder, fileIds, `${basePath}.episodeIndex.readOrder`,
      "PACK_EPISODE_READ_ORDER_UNRESOLVED", "個別インデックスの読み順が単話フォルダ内に解決できません"));
  }
  if (!Array.isArray(files) || files.length === 0) {
    issues.push(issue("PACK_EPISODE_FILES_MISSING", `${basePath}.files`,
      "1話1フォルダには1枚以上のカード/資料ファイルが必要です"));
  } else {
    const actualNames = normalizeFileList(files);
    if (!includesEvery(actualNames, CANONICAL_EPISODE_REQUIRED_FILES)) {
      issues.push(issue("PACK_EPISODE_CANONICAL_FILES_MISSING", `${basePath}.files`,
        "執筆さんPW90へ渡す各話9ファイルをすべて常置してください"));
    }
  }
  for (const [fileIndex, file] of files.entries()) {
    if (!file?.id || file.exists !== true || file.read !== true) {
      issues.push(issue("PACK_EPISODE_FILE_UNREAD", `${basePath}.files`,
        "個別インデックスが参照するファイルは存在し実読済みである必要があります"));
    }
    issues.push(...validateFileRole(file, `${basePath}.files[${fileIndex}]`));
    if (file?.source_file_current != null || file?.source_lines_current != null) {
      issues.push(...validateSingleSourceAddress({
        sourceFile: file.source_file_current,
        sourceLines: file.source_lines_current,
        lineCounts,
        path: `${basePath}.files[${fileIndex}]`
      }));
    }
    issues.push(...validateCurrentSources(file?.current_sources, lineCounts, `${basePath}.files[${fileIndex}]`));
  }
  if (episode?.layer != null) {
    for (const field of REQUIRED_LAYER_FIELDS) {
      if (episode.layer[field] == null || episode.layer[field] === "") {
        issues.push(issue("PACK_LAYER_FIELD_MISSING", `${basePath}.layer.${field}`,
          "単話layer必須欄が欠けています"));
      }
    }
  }
  issues.push(...validateEpisodeLayerActivation(episode, basePath));
  const manifest = episode?.layerBindingManifest;
  if (manifest == null || typeof manifest !== "object" || Array.isArray(manifest)) {
    issues.push(issue("LAYER_BINDING_MANIFEST_MISSING", `${basePath}.layerBindingManifest`,
      "梱包さんは単話ごとにlayer_binding_manifestを作る必要があります"));
  } else {
    for (const [bindingIndex, binding] of (manifest.bindings ?? []).entries()) {
      for (const field of REQUIRED_LAYER_BINDING_FIELDS) {
        if (!bindingHasField(binding, field)) {
          issues.push(issue("LAYER_BINDING_FIELD_MISSING", `${basePath}.layerBindingManifest.bindings.${field}`,
            "現話明示結合の必須欄が欠けています"));
        }
      }
      if (binding?.source_role !== "story_condition") {
        issues.push(issue("LAYER_BINDING_SOURCE_ROLE_INVALID", `${basePath}.layerBindingManifest.bindings`,
          "本文に出る値はstory_condition根拠に固定する必要があります"));
      }
      issues.push(...validateSingleSourceAddress({
        sourceFile: binding?.source_file_current,
        sourceLines: binding?.source_lines_current,
        lineCounts,
        path: `${basePath}.layerBindingManifest.bindings[${bindingIndex}]`
      }));
      issues.push(...validateCurrentSources(binding?.current_sources, lineCounts,
        `${basePath}.layerBindingManifest.bindings[${bindingIndex}]`));
      if (binding?.source_lines_current != null &&
          !LINE_RANGE_PATTERN.test(String(binding.source_lines_current)) &&
          binding?.current_sources == null) {
        issues.push(issue("MULTI_SOURCE_NEEDS_CURRENT_SOURCES", `${basePath}.layerBindingManifest.bindings[${bindingIndex}]`,
          "source_lines_currentにファイル名や複数根拠を混ぜず、current_sources[]へ分けてください"));
      }
      if (binding?.adds_new_event === true || binding?.adds_new_setting === true ||
          binding?.infers_new_backstory === true) {
        issues.push(issue("LAYER_BINDING_EXPANDS_STORY", `${basePath}.layerBindingManifest.bindings`,
          "layer bindingは新イベント・新設定・新裏設定を追加できません"));
      }
    }
    if (manifest.dynamicOverlay === true || manifest.autoInsert === true ||
        manifest.profileActivates === true) {
      issues.push(issue("LAYER_BINDING_DYNAMIC_DENIED", `${basePath}.layerBindingManifest`,
        "動的結合・自動刺し込み・profile自動起動は禁止です"));
    }
  }
  const readyIds = episode?.ready?.conditionIds ?? [];
  const recovered = episode?.crosscheck?.readyConditionIdsRecoveredByV2 ?? [];
  if (episode?.ready != null && episode?.crosscheck != null && readyIds.some((id) => !recovered.includes(id))) {
    issues.push(issue("READY_V2_UNMAPPED", `${basePath}.crosscheck`,
      "ready条件をV2がすべて回収していません"));
  }
  if ((episode?.crosscheck?.conflicts ?? []).length > 0 ||
      (episode?.crosscheck?.unmapped ?? []).length > 0) {
    issues.push(issue("PACK_CROSSCHECK_FAILED", `${basePath}.crosscheck`,
      "crosscheckに未対応または衝突があります"));
  }
  issues.push(...validateCrosscheckAuthority(episode?.crosscheck, basePath));
  if (episode?.frozen?.summarizesInsteadOfReferences === true) {
    issues.push(issue("FROZEN_AS_READ_SUBSTITUTE", `${basePath}.frozen`,
      "frozenをready/V2/layer/crosscheckの読了代替にできません"));
  }
  if (episode?.requiresExecutionQueue === true && episode?.executionQueue == null) {
    issues.push(issue("EXECUTION_QUEUE_REQUIRED", `${basePath}.executionQueue`,
      "重い回にはexecution_queueが必要です"));
  }
  return issues;
}

export const packCutoutModule = Object.freeze({
  id: "PACK_CUTOUT",
  mode: "DSGN.MODE.pack_cutout",
  rules: [
    required("PC-001", "dsgn.mode", "DSGN.MODE.pack_cutoutの明示選択が必要"),
    required("PC-002", "packCutout.expectedCount", "話数が必要"),
    required("PC-003", "packCutout.episodes", "単話フォルダ一覧が必要"),
    required("PC-004", "packCutout.projectReadLedger", "作品資料の実読台帳が必要"),
    required("PC-011", "packCutout.writerComfortCheck", "WRITER_OUTPUT_COMFORT_CHECKが必要"),
    required("PC-012", "packCutout.writerComfortCheck.reciprocalHandoffRespectLocked", "RECIPROCAL_HANDOFF_RESPECT_LOCKが必要"),
    required("PC-013", "packCutout.writerComfortCheck.endUserHeatDeliveryLocked", "END_USER_HEAT_DELIVERY_LOCKが必要"),
    required("PC-014", "packCutout.packagerWriterHandoff", "PACKAGER_WRITER_CANONICAL_HANDOFF_CONTRACTが必要"),
    required("PC-015", "packCutout.writerComfortCheck.fullConvergenceSweepLocked", "FULL_CONVERGENCE_SWEEP_LOCKが必要"),
    required("PC-016", "packCutout.writerComfortCheck.artifactEqualsFullConvergenceLocked", "ARTIFACT_EQUALS_FULL_CONVERGENCE_LOCKが必要"),
    required("PC-017", "packCutout.packagingPreflightGate", "梱包前段階の準備ゲートが必要"),
    required("PC-018", "packCutout.zeroThinkWriterHandoff", "執筆さんが推測なしに開始できるhandoffが必要"),
    required("PC-019", "packCutout.deliverableConvergenceReport", "成果物提出前の収束レポートが必要"),
    forbidden("PC-005", "packCutout.createStoryFacts", "作品骨・世界軸・キャラ設定を新造しない"),
    forbidden("PC-006", "packCutout.reorderEpisodes", "話順を勝手に変えない"),
    forbidden("PC-007", "packCutout.rewriteLayerCanon", "レイヤー本体を上書きしない"),
    forbidden("PC-008", "packCutout.useNomAsStorySource", "NOMを本文条件源にしない"),
    forbidden("PC-009", "packCutout.writeManuscript", "本文を書かない"),
    forbidden("PC-010", "packCutout.sendDsgnReferencesToWriter", "DSGN正本・辞書・索引を執筆へ渡さない"),
    forbidden("PC-020", "packCutout.summaryOnlyPack", "要約だけのWriter入力を作らない"),
    forbidden("PC-021", "packCutout.unconvergedArtifact", "未収束成果物をWriterへ渡さない")
  ],
  validate(input) {
    const issues = [...validateNamespace(input), ...validateLookup(input)];
    const invocation = resolveInvocation(input.dsgn);
    const pack = input.packCutout ?? {};
    const episodes = pack.episodes ?? [];
    const activation = validateLegacyMode(pack.packWriterActivation);
    issues.push(...activation.issues);
    let materialState = "NOT_CURRENT_PACKAGER_WRITER_ROUTE";
    if (pack.inputMode === "V2_EPISODE_FOLDER") {
      issues.push(issue("LEGACY_MATERIAL_MAP_ROUTE_NOT_CURRENT", "packCutout.inputMode",
        "現行の話パック正本候補は梱包さん絶対梱包ルートだけです。旧V2 materialMap経路はPACK_CUTOUTのWRITE候補にできません"));
      materialState = "LEGACY_MATERIAL_MAP_ROUTE_STOP";
    }
    if (input.dsgn?.mode !== "DSGN.MODE.pack_cutout") {
      issues.push(issue("DSGN_MODE_MISMATCH", "dsgn.mode", "pack_cutout mode以外では起動できません"));
    }
    if (!invocation.valid) {
      issues.push(issue("PACK_INVOCATION_INVALID", "dsgn.invocationOrigin",
        "梱包さんの起動元、または設計さん自律起動理由が不正です"));
    }
    if (episodes.length !== pack.expectedCount) {
      issues.push(issue("PACK_CUTOUT_COUNT_MISMATCH", "packCutout.episodes", "話数が一致しません"));
    }
    if (new Set(episodes.map((entry) => entry.id)).size !== episodes.length) {
      issues.push(issue("PACK_CUTOUT_DUPLICATE_EPISODE", "packCutout.episodes", "話IDが重複しています"));
    }
    issues.push(...validateGateIndex(pack, episodes));
    issues.push(...validatePackRootShape(pack));
    issues.push(...validateSourceMountIndex(pack));
    issues.push(...validateWriterAuthority(pack));
    issues.push(...validatePackagerWriterHandoff(pack));
    issues.push(...validateWriterComfortCheck(pack));
    issues.push(...validateWorldAxisLayerBinding(pack));
    issues.push(...validateProjectTagSearchBinding(pack));
    issues.push(...validateTagSearchConvergence(pack));
    issues.push(...validateSelfContainedProcessPolicy(pack));
    for (const entry of pack.projectReadLedger ?? []) {
      if (!entry?.path || entry.exists !== true || entry.read !== true) {
        issues.push(issue("PROJECT_SOURCE_UNREAD", "packCutout.projectReadLedger",
          "作品側必読資料をすべて実読する必要があります"));
      }
    }
    episodes.forEach((episode, index) => issues.push(...validateEpisode(episode, index)));
    return {
      issues,
      invocation,
      completionState: invocation.completionState,
      activationState: activation.state,
      materialState
    };
  }
});
