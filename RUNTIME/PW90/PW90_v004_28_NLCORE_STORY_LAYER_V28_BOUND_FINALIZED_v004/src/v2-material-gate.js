import { createHash } from "node:crypto";

export const WRITER_USE = Object.freeze([
  "RESTORE_SOURCE", "RESTORE_CONSTRAINT", "PROCESS_ONLY",
  "OUTPUT_CONTRACT", "REFERENCE_ONLY", "DENY_AS_BODY_SOURCE"
]);
export const CANONICAL_STATE = Object.freeze(["FROZEN", "SUPPORT", "REFERENCE", "DENIED"]);
export const DIGEST_POLICY = Object.freeze({
  algorithm: "SHA-256", encoding: "UTF-8", bom: "forbidden", newline: "LF",
  unicodeNormalization: "none", trailingNewline: "preserve", digestFormat: "lowercase_hex"
});

const fail = (code, path) => ({ code, path });
const sha256 = (value) => createHash("sha256").update(Buffer.from(value, "utf8")).digest("hex");

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value != null && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

export function calculateMapDigest(map) {
  const { map_digest: ignored, ...body } = map;
  return sha256(JSON.stringify(stable(body)));
}

function pathIsSafe(path) {
  if (typeof path !== "string" || path.trim() === "") return false;
  if (!/^[\x20-\x7E]+$/.test(path)) return false;
  if (path.startsWith("/") || path.includes("\\")) return false;
  return !path.split("/").some((part) => part === "" || part === "." || part === "..");
}

function parseSections(content, path) {
  const failures = [];
  if (typeof content !== "string") {
    return { sections: [], failures: [fail("SOURCE_CONTENT_INVALID", path)] };
  }
  if (content.startsWith("\uFEFF")) failures.push(fail("BOM_FORBIDDEN", path));
  if (content.includes("\r")) failures.push(fail("NEWLINE_NOT_LF", path));
  const beginPattern = /^<!-- BEGIN_SECTION: ([A-Za-z0-9._:-]+) -->$/;
  const endPattern = /^<!-- END_SECTION: ([A-Za-z0-9._:-]+) -->$/;
  const structuralPattern = /^<!-- STRUCTURAL: [A-Za-z0-9._:-]+ -->$/;
  const lines = content.split("\n");
  const sections = [];
  let active = null;
  let start = 0;
  let offset = 0;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const lineValue = line + (index < lines.length - 1 ? "\n" : "");
    const charLength = lineValue.length;
    const begin = line.match(beginPattern);
    const end = line.match(endPattern);
    if (begin) {
      if (active != null) failures.push(fail("SECTION_OVERLAP", path));
      else {
        active = begin[1];
        start = offset + charLength;
      }
    } else if (end) {
      if (active !== end[1]) failures.push(fail("SECTION_END_UNRESOLVED", path));
      else {
        const sectionContent = content.slice(start, offset);
        if (sectionContent.trim() === "") failures.push(fail("SECTION_EMPTY", `${path}#${active}`));
        sections.push({ section_id: active, section_digest: sha256(sectionContent), content: sectionContent });
        active = null;
      }
    } else if (active == null && line !== "" && !structuralPattern.test(line)) {
      failures.push(fail("UNCLASSIFIED_CONTENT", `${path}:${index + 1}`));
    }
    offset += charLength;
  }
  if (active != null) failures.push(fail("SECTION_NOT_CLOSED", path));
  if (new Set(sections.map((entry) => entry.section_id)).size !== sections.length) {
    failures.push(fail("SECTION_ID_DUPLICATE", path));
  }
  return { sections, failures };
}

export function validateWriterMaterialMap({ map, sourceFiles, episodeId } = {}) {
  const failures = [];
  if (map == null || typeof map !== "object" || Array.isArray(map)) {
    return { decision: "STOP_BEFORE_TEXT", failures: [fail("MATERIAL_MAP_MISSING", "materialMap")] };
  }
  if (map.input_mode !== "V2_EPISODE_FOLDER" || map.episode_id !== episodeId) {
    failures.push(fail("MATERIAL_MAP_SCOPE_MISMATCH", "materialMap"));
  }
  if (JSON.stringify(map.digest_policy) !== JSON.stringify(DIGEST_POLICY)) {
    failures.push(fail("DIGEST_POLICY_MISMATCH", "materialMap.digest_policy"));
  }
  if (map.map_digest !== calculateMapDigest(map)) failures.push(fail("MAP_DIGEST_MISMATCH", "materialMap.map_digest"));
  if (!Array.isArray(sourceFiles) || sourceFiles.length === 0) failures.push(fail("SOURCE_FILES_REQUIRED", "sourceFiles"));
  if (!Array.isArray(map.source_files) || map.source_files.length === 0) failures.push(fail("MAP_SOURCE_FILES_REQUIRED", "materialMap.source_files"));
  if (!Array.isArray(map.entries) || map.entries.length === 0) failures.push(fail("MATERIAL_ENTRIES_EMPTY", "materialMap.entries"));

  const files = new Map((sourceFiles ?? []).map((file) => [file.path, file]));
  if (files.size !== (sourceFiles ?? []).length) failures.push(fail("SOURCE_PATH_DUPLICATE", "sourceFiles"));
  const parsed = new Map();
  for (const [path, file] of files) {
    if (!pathIsSafe(path)) failures.push(fail("SOURCE_PATH_UNSAFE", path));
    if (file.read !== true) failures.push(fail("SOURCE_FILE_UNREAD", path));
    const result = parseSections(file.content, path);
    parsed.set(path, result);
    failures.push(...result.failures);
  }
  const declaredPaths = (map.source_files ?? []).map((entry) => entry.path);
  if (new Set(declaredPaths).size !== declaredPaths.length) failures.push(fail("MAP_SOURCE_PATH_DUPLICATE", "materialMap.source_files"));
  for (const path of declaredPaths) if (!pathIsSafe(path)) failures.push(fail("MAP_SOURCE_PATH_UNSAFE", path));
  for (const path of files.keys()) if (!declaredPaths.includes(path)) failures.push(fail("SOURCE_FILE_NOT_MAPPED", path));
  for (const source of map.source_files ?? []) {
    const file = files.get(source.path);
    if (file == null) failures.push(fail("SOURCE_FILE_UNRESOLVED", source.path));
    else if (sha256(file.content) !== source.file_digest) failures.push(fail("FILE_DIGEST_MISMATCH", source.path));
    if (!Array.isArray(source.coverage?.classified_material_ids)) failures.push(fail("COVERAGE_IDS_REQUIRED", source.path));
    if (!Array.isArray(source.coverage?.unclassified_sections)) failures.push(fail("COVERAGE_UNCLASSIFIED_REQUIRED", source.path));
    if ((source.coverage?.unclassified_sections ?? []).length > 0) failures.push(fail("COVERAGE_UNCLASSIFIED", source.path));
  }
  const materialIds = (map.entries ?? []).map((entry) => entry.material_id);
  if (new Set(materialIds).size !== materialIds.length) failures.push(fail("MATERIAL_ID_DUPLICATE", "materialMap.entries"));
  const refs = new Set();
  const shelves = Object.fromEntries(WRITER_USE.map((key) => [key, []]));
  for (const entry of map.entries ?? []) {
    if (!entry.material_id || !entry.path || !entry.section_id) {
      failures.push(fail("MATERIAL_REFERENCE_MISSING", "materialMap.entries"));
      continue;
    }
    if (!pathIsSafe(entry.path)) failures.push(fail("MATERIAL_PATH_UNSAFE", entry.path));
    const ref = `${entry.path}#${entry.section_id}`;
    if (refs.has(ref)) failures.push(fail("SECTION_REFERENCE_DUPLICATE", ref));
    refs.add(ref);
    if (!WRITER_USE.includes(entry.writer_use)) failures.push(fail("WRITER_USE_UNKNOWN", ref));
    if (!CANONICAL_STATE.includes(entry.canonical_state)) failures.push(fail("CANONICAL_STATE_UNKNOWN", ref));
    if (entry.writer_use === "RESTORE_SOURCE" && entry.canonical_state !== "FROZEN") {
      failures.push(fail("RESTORE_SOURCE_NOT_FROZEN", ref));
    }
    if (entry.writer_use === "DENY_AS_BODY_SOURCE" && entry.canonical_state !== "DENIED") {
      failures.push(fail("DENY_BODY_SOURCE_NOT_DENIED", ref));
    }
    if (entry.read_required !== true) failures.push(fail("MATERIAL_READ_NOT_REQUIRED", ref));
    const section = parsed.get(entry.path)?.sections.find((item) => item.section_id === entry.section_id);
    if (section == null) failures.push(fail("SECTION_UNRESOLVED", ref));
    else if (section.section_digest !== entry.section_digest) failures.push(fail("SECTION_DIGEST_MISMATCH", ref));
    else if (WRITER_USE.includes(entry.writer_use)) shelves[entry.writer_use].push({ ...entry, content: section.content });
  }
  for (const source of map.source_files ?? []) {
    const sections = parsed.get(source.path)?.sections ?? [];
    const mapped = new Set((map.entries ?? []).filter((entry) => entry.path === source.path).map((entry) => entry.section_id));
    if (sections.some((section) => !mapped.has(section.section_id))) failures.push(fail("COVERAGE_GATE_FAILED", source.path));
    const ids = (map.entries ?? []).filter((entry) => entry.path === source.path).map((entry) => entry.material_id);
    if (JSON.stringify(ids) !== JSON.stringify(source.coverage?.classified_material_ids ?? [])) {
      failures.push(fail("COVERAGE_ID_MISMATCH", source.path));
    }
  }
  if (!(map.entries ?? []).some((entry) =>
    entry.writer_use === "RESTORE_SOURCE" && entry.canonical_state === "FROZEN")) {
    failures.push(fail("FROZEN_RESTORE_SOURCE_MISSING", "materialMap.entries"));
  }
  return {
    decision: failures.length === 0 ? "MATERIAL_AUTHORIZED" : "STOP_BEFORE_TEXT",
    failures,
    shelves: failures.length === 0 ? Object.freeze(shelves) : null
  };
}
