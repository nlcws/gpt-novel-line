import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export const PROJECTLOCKED_PACK_GATE_ID = "V2_FOLDER_PROJECTLOCKED_REAL_PACK_GATE";
export const PROJECTLOCKED_INPUT_MODE = "V2_EPISODE_FOLDER_PROJECTLOCKED_REAL_PACK";
export const PROJECTLOCKED_CONTRACT_ID = "PROJECTLOCKED_PACK_GATE";

export const PROJECTLOCKED_ROOT_REQUIRED_FILES = Object.freeze([
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

export const PROJECTLOCKED_ROOT_REQUIRED_SHELVES = Object.freeze([
  "05_band_profiles",
  "06_continuity",
  "07_episodes",
  "12_pack_cutout_log"
]);

export const PROJECTLOCKED_EPISODE_REQUIRED_FILES = Object.freeze([
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

export const PROJECTLOCKED_RESTORE_SOURCE_FILES = Object.freeze([
  "01_ready.md",
  "02_v2.md"
]);

export const PROJECTLOCKED_RESTORE_CONSTRAINT_FILES = Object.freeze([
  "03_layer.md",
  "05_frozen.md"
]);

export const PROJECTLOCKED_PROCESS_ONLY_FILES = Object.freeze([
  "04_crosscheck.md",
  "06_execution_queue.md"
]);

export const PROJECTLOCKED_REFERENCE_ONLY_FILES = Object.freeze([
  "07_sources.md"
]);

export const PROJECTLOCKED_DENY_BODY_FILES = Object.freeze([
  "00_episode_index.md",
  "03_layer_binding_manifest.json"
]);

const fail = (code, path, detail = null) => detail == null ? { code, path } : { code, path, detail };

function readText(path) {
  return readFileSync(path, "utf8");
}

function parseJsonFile(path, failures, code = "JSON_PARSE_FAILED") {
  try {
    return JSON.parse(readText(path));
  } catch (error) {
    failures.push(fail(code, path, error.message));
    return null;
  }
}

function pathExists(root, rel) {
  return existsSync(join(root, rel));
}

function listFilesRecursive(root) {
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      const rel = relative(root, path).replaceAll("\\", "/");
      const st = statSync(path);
      if (st.isDirectory()) walk(path);
      else out.push(rel);
    }
  };
  walk(root);
  return out.sort();
}

function pathIsAsciiSafe(rel) {
  return typeof rel === "string" && /^[\x20-\x7E]+$/.test(rel) && !rel.startsWith("/") &&
    !rel.includes("\\") && !rel.split("/").some((part) => part === "" || part === "." || part === "..");
}

function parseMachineIndex(indexText) {
  const match = indexText.match(/## machine_index\s*```json\s*([\s\S]*?)\s*```/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function lineCount(text) {
  return text.split("\n").length - (text.endsWith("\n") ? 1 : 0);
}

function collectCurrentLineRefFailures(root, files) {
  const failures = [];
  const counts = new Map();
  for (const rel of files) {
    if (/\.(md|json|txt|tsv)$/.test(rel)) counts.set(rel, lineCount(readText(join(root, rel))));
  }
  const check = (sourceRel, target, start, end) => {
    if (!pathIsAsciiSafe(target)) {
      failures.push(fail("CURRENT_SOURCE_PATH_UNSAFE", `${sourceRel} -> ${target}`));
      return;
    }
    const total = counts.get(target);
    if (total == null) failures.push(fail("CURRENT_SOURCE_FILE_MISSING", `${sourceRel} -> ${target}`));
    else if (start < 1 || end < start || end > total) failures.push(fail("CURRENT_SOURCE_LINES_OUT_OF_RANGE", `${sourceRel} -> ${target}`, { start, end, total }));
  };
  for (const rel of files) {
    if (!/\.(md|json)$/.test(rel)) continue;
    const text = readText(join(root, rel));
    for (const match of text.matchAll(/source_file_current:\s*([^\n]+)\nsource_lines_current:\s*L(\d+)-L(\d+)/g)) {
      check(rel, match[1].trim(), Number(match[2]), Number(match[3]));
    }
    for (const match of text.matchAll(/"source_file_current"\s*:\s*"([^"]+)"[\s\S]{0,160}?"source_lines_current"\s*:\s*"L(\d+)-L(\d+)"/g)) {
      check(rel, match[1].trim(), Number(match[2]), Number(match[3]));
    }
    for (const match of text.matchAll(/\|[^\n]*\|\s*(07_episodes\/[^|]+?)\s*\|\s*L(\d+)-L(\d+)\s*\|/g)) {
      check(rel, match[1].trim(), Number(match[2]), Number(match[3]));
    }
  }
  return failures;
}

function validateEpisode(root, episodeId, files) {
  const failures = [];
  const episodeRoot = join(root, "07_episodes", episodeId);
  for (const file of PROJECTLOCKED_EPISODE_REQUIRED_FILES) {
    if (!existsSync(join(episodeRoot, file))) failures.push(fail("EPISODE_REQUIRED_FILE_MISSING", `07_episodes/${episodeId}/${file}`));
  }
  if (failures.length > 0) {
    return { episodeId, decision: "EPISODE_SHAPE_FAILED", failures, shelves: null };
  }

  for (const file of PROJECTLOCKED_EPISODE_REQUIRED_FILES) {
    const rel = `07_episodes/${episodeId}/${file}`;
    const text = readText(join(root, rel));
    if (text.startsWith("\uFEFF")) failures.push(fail("BOM_FORBIDDEN", rel));
    if (text.includes("\r")) failures.push(fail("CRLF_FORBIDDEN", rel));
  }

  const indexRel = `07_episodes/${episodeId}/00_episode_index.md`;
  const indexText = readText(join(root, indexRel));
  const machine = parseMachineIndex(indexText);
  if (machine == null) failures.push(fail("EPISODE_MACHINE_INDEX_MISSING", indexRel));
  else {
    if (machine.episode_id !== episodeId) failures.push(fail("EPISODE_ID_MISMATCH", indexRel, machine.episode_id));
    if (machine.read_substitute !== false) failures.push(fail("EPISODE_INDEX_READ_SUBSTITUTE_NOT_FALSE", indexRel));
    if (machine.story_source !== false) failures.push(fail("EPISODE_INDEX_STORY_SOURCE_NOT_FALSE", indexRel));
    if (JSON.stringify(machine.required_files) !== JSON.stringify([...PROJECTLOCKED_EPISODE_REQUIRED_FILES])) {
      failures.push(fail("EPISODE_REQUIRED_FILES_MISMATCH", indexRel));
    }
  }

  const manifestRel = `07_episodes/${episodeId}/03_layer_binding_manifest.json`;
  const manifest = parseJsonFile(join(root, manifestRel), failures, "LAYER_BINDING_MANIFEST_PARSE_FAILED");
  if (manifest != null) {
    if (manifest.episode_id !== episodeId) failures.push(fail("LAYER_MANIFEST_EPISODE_ID_MISMATCH", manifestRel, manifest.episode_id));
    if (manifest.usedAsReadSubstitute !== false) failures.push(fail("LAYER_MANIFEST_READ_SUBSTITUTE_NOT_FALSE", manifestRel));
    if (manifest.usedAsStorySource !== false) failures.push(fail("LAYER_MANIFEST_STORY_SOURCE_NOT_FALSE", manifestRel));
    if (manifest.dynamicOverlay !== false) failures.push(fail("LAYER_DYNAMIC_OVERLAY_NOT_FALSE", manifestRel));
    if (manifest.autoInsert !== false) failures.push(fail("LAYER_AUTO_INSERT_NOT_FALSE", manifestRel));
    if (manifest.profileActivates !== false) failures.push(fail("LAYER_PROFILE_ACTIVATES_NOT_FALSE", manifestRel));
    if (!Array.isArray(manifest.bindings) || manifest.bindings.length === 0) failures.push(fail("LAYER_BINDINGS_EMPTY", manifestRel));
    for (const [index, binding] of (manifest.bindings ?? []).entries()) {
      if (binding.source_role !== "story_condition") failures.push(fail("LAYER_BINDING_SOURCE_ROLE_INVALID", `${manifestRel}#bindings[${index}]`, binding.source_role));
      if (binding.target_file !== `07_episodes/${episodeId}/03_layer.md`) failures.push(fail("LAYER_BINDING_TARGET_FILE_INVALID", `${manifestRel}#bindings[${index}]`, binding.target_file));
    }
  }

  const frozenRel = `07_episodes/${episodeId}/05_frozen.md`;
  const frozen = readText(join(root, frozenRel));
  if (!frozen.includes("前段読了代替ではない")) failures.push(fail("FROZEN_READ_SUBSTITUTE_DENIAL_MISSING", frozenRel));
  if (!frozen.includes("01_ready.md") || !frozen.includes("02_v2.md") || !frozen.includes("03_layer.md") || !frozen.includes("04_crosscheck.md")) {
    failures.push(fail("FROZEN_PREVIOUS_READ_ORDER_REFERENCE_MISSING", frozenRel));
  }

  const queueRel = `07_episodes/${episodeId}/06_execution_queue.md`;
  if (!readText(join(root, queueRel)).includes("本文ではない")) failures.push(fail("EXECUTION_QUEUE_NON_BODY_DENIAL_MISSING", queueRel));
  const sourcesRel = `07_episodes/${episodeId}/07_sources.md`;
  if (!readText(join(root, sourcesRel)).includes("読了代替ではない")) failures.push(fail("SOURCES_READ_SUBSTITUTE_DENIAL_MISSING", sourcesRel));

  const makeShelf = (file, writerUse, canonicalState) => Object.freeze({
    material_id: `${episodeId}:${file}`,
    path: `07_episodes/${episodeId}/${file}`,
    writer_use: writerUse,
    canonical_state: canonicalState,
    read_required: true
  });
  const shelves = Object.freeze({
    RESTORE_SOURCE: Object.freeze(PROJECTLOCKED_RESTORE_SOURCE_FILES.map((file) => makeShelf(file, "RESTORE_SOURCE", "FROZEN"))),
    RESTORE_CONSTRAINT: Object.freeze(PROJECTLOCKED_RESTORE_CONSTRAINT_FILES.map((file) => makeShelf(file, "RESTORE_CONSTRAINT", "FROZEN"))),
    PROCESS_ONLY: Object.freeze(PROJECTLOCKED_PROCESS_ONLY_FILES.map((file) => makeShelf(file, "PROCESS_ONLY", "SUPPORT"))),
    OUTPUT_CONTRACT: Object.freeze([]),
    REFERENCE_ONLY: Object.freeze(PROJECTLOCKED_REFERENCE_ONLY_FILES.map((file) => makeShelf(file, "REFERENCE_ONLY", "REFERENCE"))),
    DENY_AS_BODY_SOURCE: Object.freeze(PROJECTLOCKED_DENY_BODY_FILES.map((file) => makeShelf(file, "DENY_AS_BODY_SOURCE", "DENIED")))
  });
  return Object.freeze({
    episodeId,
    decision: failures.length === 0 ? "EPISODE_SHAPE_OK" : "EPISODE_SHAPE_FAILED",
    failures: Object.freeze(failures),
    shelves: failures.length === 0 ? shelves : null
  });
}

export function inspectProjectLockedPackDirectory(root, options = {}) {
  const failures = [];
  if (typeof root !== "string" || root.trim() === "" || !existsSync(root) || !statSync(root).isDirectory()) {
    return Object.freeze({
      gate: PROJECTLOCKED_PACK_GATE_ID,
      inspectDecision: "PROJECTLOCKED_PACK_SHAPE_FAILED",
      writeDecision: "STOP_BEFORE_TEXT",
      failures: Object.freeze([fail("PACK_ROOT_DIRECTORY_MISSING", "root")]),
      episodeResults: Object.freeze([]),
      missingRequiredMountIds: Object.freeze([])
    });
  }

  const files = listFilesRecursive(root);
  for (const rel of files) if (!pathIsAsciiSafe(rel)) failures.push(fail("PACK_PATH_UNSAFE_OR_NONASCII", rel));
  for (const file of PROJECTLOCKED_ROOT_REQUIRED_FILES) if (!pathExists(root, file)) failures.push(fail("ROOT_REQUIRED_FILE_MISSING", file));
  for (const shelf of PROJECTLOCKED_ROOT_REQUIRED_SHELVES) {
    const shelfPath = join(root, shelf);
    if (!existsSync(shelfPath) || !statSync(shelfPath).isDirectory()) {
      failures.push(fail("ROOT_REQUIRED_SHELF_MISSING", shelf));
    } else {
      const shelfFiles = listFilesRecursive(shelfPath).filter((rel) => rel.endsWith(".md"));
      if (shelfFiles.length === 0) failures.push(fail("ROOT_REQUIRED_SHELF_EMPTY", shelf));
    }
  }

  const packGate = pathExists(root, "00_packGateIndex.json") ? parseJsonFile(join(root, "00_packGateIndex.json"), failures, "PACK_GATE_PARSE_FAILED") : null;
  const sourceMount = pathExists(root, "00_sourceMountIndex.json") ? parseJsonFile(join(root, "00_sourceMountIndex.json"), failures, "SOURCE_MOUNT_INDEX_PARSE_FAILED") : null;

  let episodeIds = [];
  if (packGate != null) {
    if (packGate.usedAsReadSubstitute !== false) failures.push(fail("PACK_GATE_READ_SUBSTITUTE_NOT_FALSE", "00_packGateIndex.json"));
    if (packGate.usedAsStorySource !== false) failures.push(fail("PACK_GATE_STORY_SOURCE_NOT_FALSE", "00_packGateIndex.json"));
    if (!Array.isArray(packGate.episodeIds) || packGate.episodeIds.length === 0) failures.push(fail("PACK_GATE_EPISODE_IDS_EMPTY", "00_packGateIndex.json"));
    if (JSON.stringify(packGate.episodeIds ?? []) !== JSON.stringify(packGate.readOrder ?? [])) failures.push(fail("PACK_GATE_READ_ORDER_MISMATCH", "00_packGateIndex.json"));
    episodeIds = packGate.episodeIds ?? [];
  }

  const discoveredEpisodes = pathExists(root, "07_episodes")
    ? readdirSync(join(root, "07_episodes")).filter((name) => statSync(join(root, "07_episodes", name)).isDirectory()).sort()
    : [];
  if (JSON.stringify(discoveredEpisodes) !== JSON.stringify([...episodeIds].sort())) {
    failures.push(fail("EPISODE_DIRECTORY_SET_MISMATCH", "07_episodes", { expected: episodeIds.length, actual: discoveredEpisodes.length }));
  }

  const currentRefFailures = collectCurrentLineRefFailures(root, files);
  failures.push(...currentRefFailures);

  const episodeResults = episodeIds.map((episodeId) => validateEpisode(root, episodeId, files));
  for (const episode of episodeResults) failures.push(...episode.failures);

  const sourceMounts = sourceMount?.source_mounts ?? [];
  const stopIfMissing = sourceMount?.stop_if_missing ?? [];
  if (sourceMount != null) {
    if (sourceMount.usedAsReadSubstitute !== false) failures.push(fail("SOURCE_MOUNT_INDEX_READ_SUBSTITUTE_NOT_FALSE", "00_sourceMountIndex.json"));
    if (!Array.isArray(sourceMounts)) failures.push(fail("SOURCE_RECORD_LIST_INVALID", "00_sourceMountIndex.json"));
    if (!Array.isArray(stopIfMissing)) failures.push(fail("SOURCE_RECORD_STOP_IF_MISSING_INVALID", "00_sourceMountIndex.json"));
  }
  const missingRequiredMountIds = [];
  const inspectOk = failures.length === 0;
  const allFailures = [...failures];

  return Object.freeze({
    gate: PROJECTLOCKED_PACK_GATE_ID,
    inputMode: PROJECTLOCKED_INPUT_MODE,
    inspectDecision: inspectOk ? "PROJECTLOCKED_PACK_INSPECT_OK" : "PROJECTLOCKED_PACK_SHAPE_FAILED",
    writeDecision: !inspectOk ? "STOP_BEFORE_TEXT" : "PROJECTLOCKED_PACK_WRITE_READY",
    writeBlockedReason: null,
    episodeCount: episodeIds.length,
    episodeIds: Object.freeze([...episodeIds]),
    episodeResults: Object.freeze(episodeResults),
    missingRequiredMountIds: Object.freeze(missingRequiredMountIds),
    failures: Object.freeze(allFailures)
  });
}

export function projectLockedShelvesForEpisode(projectLockedResult, episodeId) {
  const episode = projectLockedResult?.episodeResults?.find((entry) => entry.episodeId === episodeId);
  return episode?.shelves ?? null;
}
