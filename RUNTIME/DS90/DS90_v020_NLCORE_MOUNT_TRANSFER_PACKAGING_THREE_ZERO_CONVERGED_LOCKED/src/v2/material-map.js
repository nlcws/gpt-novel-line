import { createHash } from "node:crypto";

export const WRITER_USE = Object.freeze([
  "RESTORE_SOURCE",
  "RESTORE_CONSTRAINT",
  "PROCESS_ONLY",
  "OUTPUT_CONTRACT",
  "REFERENCE_ONLY",
  "DENY_AS_BODY_SOURCE"
]);

export const CANONICAL_STATE = Object.freeze([
  "FROZEN",
  "SUPPORT",
  "REFERENCE",
  "DENIED"
]);

export const DIGEST_POLICY = Object.freeze({
  algorithm: "SHA-256",
  encoding: "UTF-8",
  bom: "forbidden",
  newline: "LF",
  unicodeNormalization: "none",
  trailingNewline: "preserve",
  digestFormat: "lowercase_hex"
});

const issue = (code, path, message) => ({ code, path, message, severity: "STOP" });
const sha256 = (value) => createHash("sha256").update(Buffer.from(value, "utf8")).digest("hex");

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value != null && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

export function canonicalMapJson(map) {
  const { map_digest: ignored, ...body } = map;
  return JSON.stringify(stableValue(body));
}

export function calculateMapDigest(map) {
  return sha256(canonicalMapJson(map));
}

export function calculateFileDigest(content) {
  return sha256(content);
}

function parseSections(content, path) {
  const issues = [];
  if (typeof content !== "string") {
    return { sections: [], structural: [], issues: [issue("SOURCE_CONTENT_INVALID", path, "source contentは文字列必須です")] };
  }
  if (content.startsWith("\uFEFF")) {
    issues.push(issue("BOM_FORBIDDEN", path, "UTF-8 BOMは禁止です"));
  }
  if (content.includes("\r")) {
    issues.push(issue("NEWLINE_NOT_LF", path, "改行はLF固定です"));
  }
  const lines = content.split("\n");
  const sections = [];
  const structural = [];
  let active = null;
  let contentStartOffset = 0;
  let offset = 0;
  const beginPattern = /^<!-- BEGIN_SECTION: ([A-Za-z0-9._:-]+) -->$/;
  const endPattern = /^<!-- END_SECTION: ([A-Za-z0-9._:-]+) -->$/;
  const structuralPattern = /^<!-- STRUCTURAL: [A-Za-z0-9._:-]+ -->$/;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const hasNewline = index < lines.length - 1;
    const lineLength = (line + (hasNewline ? "\n" : "")).length;
    const begin = line.match(beginPattern);
    const end = line.match(endPattern);
    if (begin) {
      if (active != null) {
        issues.push(issue("SECTION_OVERLAP", path, `section ${begin[1]}が入れ子です`));
      } else {
        active = { id: begin[1], beginLine: index + 1 };
        contentStartOffset = offset + lineLength;
      }
    } else if (end) {
      if (active == null || active.id !== end[1]) {
        issues.push(issue("SECTION_END_UNRESOLVED", path, `section ${end[1]}の開始札がありません`));
      } else {
        const sectionContent = content.slice(contentStartOffset, offset);
        if (sectionContent.trim() === "") {
          issues.push(issue("SECTION_EMPTY", `${path}#${active.id}`, "空sectionは禁止です"));
        }
        sections.push({
          section_id: active.id,
          content: sectionContent,
          section_digest: sha256(sectionContent),
          beginLine: active.beginLine,
          endLine: index + 1
        });
        active = null;
      }
    } else if (active == null) {
      if (line === "" || structuralPattern.test(line)) {
        structural.push({ line: index + 1, value: line });
      } else {
        issues.push(issue("UNCLASSIFIED_CONTENT", `${path}:${index + 1}`,
          "section外の未知文字列です"));
      }
    }
    offset += lineLength;
  }
  if (active != null) {
    issues.push(issue("SECTION_NOT_CLOSED", path, `section ${active.id}が閉じていません`));
  }
  const ids = sections.map((section) => section.section_id);
  if (new Set(ids).size !== ids.length) {
    issues.push(issue("SECTION_ID_DUPLICATE", path, "section_idが重複しています"));
  }
  return { sections, structural, issues };
}

export function buildMaterialMap({ episodeId, sourceFiles, entries }) {
  const parsedByPath = new Map();
  for (const file of sourceFiles) parsedByPath.set(file.path, parseSections(file.content, file.path));
  const source_files = sourceFiles.map((file) => {
    const parsed = parsedByPath.get(file.path);
    const materialIds = entries.filter((entry) => entry.path === file.path).map((entry) => entry.material_id);
    const sectionIds = new Set(entries.filter((entry) => entry.path === file.path).map((entry) => entry.section_id));
    return {
      path: file.path,
      file_digest: calculateFileDigest(file.content),
      coverage: {
        unclassified_sections: parsed.sections
          .filter((section) => !sectionIds.has(section.section_id))
          .map((section) => section.section_id),
        classified_material_ids: materialIds
      }
    };
  });
  const mappedEntries = entries.map((entry) => {
    const section = parsedByPath.get(entry.path)?.sections.find((item) => item.section_id === entry.section_id);
    return {
      ...entry,
      section_digest: section?.section_digest ?? null
    };
  });
  const map = {
    episode_id: episodeId,
    input_mode: "V2_EPISODE_FOLDER",
    digest_policy: DIGEST_POLICY,
    source_files,
    entries: mappedEntries
  };
  return { ...map, map_digest: calculateMapDigest(map) };
}

export function validateMaterialMap({ map, sourceFiles, activation }) {
  const issues = [];
  if (map == null || typeof map !== "object" || Array.isArray(map)) {
    return { decision: "STOP", state: "MATERIAL_GATE_STOP", issues: [
      issue("MATERIAL_MAP_MISSING", "materialMap", "V2_FOLDER_MATERIAL_MAPが必要です")
    ] };
  }
  if (map.input_mode !== "V2_EPISODE_FOLDER" || map.episode_id !== activation?.episode_id) {
    issues.push(issue("MATERIAL_MAP_SCOPE_MISMATCH", "materialMap", "起動対象話とmaterial mapが一致しません"));
  }
  if (JSON.stringify(map.digest_policy) !== JSON.stringify(DIGEST_POLICY)) {
    issues.push(issue("DIGEST_POLICY_MISMATCH", "materialMap.digest_policy", "DIGEST_POLICYが一致しません"));
  }
  if (map.map_digest !== calculateMapDigest(map)) {
    issues.push(issue("MAP_DIGEST_MISMATCH", "materialMap.map_digest", "material map digestが一致しません"));
  }
  const fileByPath = new Map((sourceFiles ?? []).map((file) => [file.path, file]));
  if (fileByPath.size !== (sourceFiles ?? []).length) {
    issues.push(issue("SOURCE_PATH_DUPLICATE", "sourceFiles", "source file pathが重複しています"));
  }
  for (const file of sourceFiles ?? []) {
    if (file.read !== true) issues.push(issue("SOURCE_FILE_UNREAD", file.path, "source fileは実読必須です"));
  }
  const declaredPaths = (map.source_files ?? []).map((file) => file.path);
  if (new Set(declaredPaths).size !== declaredPaths.length) {
    issues.push(issue("MAP_SOURCE_PATH_DUPLICATE", "materialMap.source_files", "map内pathが重複しています"));
  }
  for (const path of fileByPath.keys()) {
    if (!declaredPaths.includes(path)) issues.push(issue("SOURCE_FILE_NOT_MAPPED", path, "source fileがmapにありません"));
  }
  const parsedByPath = new Map();
  for (const [path, file] of fileByPath) {
    const parsed = parseSections(file.content, path);
    parsedByPath.set(path, parsed);
    issues.push(...parsed.issues);
  }
  const materialIds = (map.entries ?? []).map((entry) => entry.material_id);
  if (materialIds.length === 0) {
    issues.push(issue("MATERIAL_ENTRIES_EMPTY", "materialMap.entries", "materialが空です"));
  }
  if (new Set(materialIds).size !== materialIds.length) {
    issues.push(issue("MATERIAL_ID_DUPLICATE", "materialMap.entries", "material_idが重複しています"));
  }
  const sectionRefs = new Set();
  for (const [index, entry] of (map.entries ?? []).entries()) {
    const base = `materialMap.entries[${index}]`;
    if (!entry.material_id || !entry.path || !entry.section_id) {
      issues.push(issue("MATERIAL_REFERENCE_MISSING", base, "material_id/path/section_idが必要です"));
      continue;
    }
    const ref = `${entry.path}#${entry.section_id}`;
    if (sectionRefs.has(ref)) issues.push(issue("SECTION_REFERENCE_DUPLICATE", base, "同一区間が重複登録されています"));
    sectionRefs.add(ref);
    if (!WRITER_USE.includes(entry.writer_use)) {
      issues.push(issue("WRITER_USE_UNKNOWN", `${base}.writer_use`, "未知のwriter_useです"));
    }
    if (!CANONICAL_STATE.includes(entry.canonical_state)) {
      issues.push(issue("CANONICAL_STATE_UNKNOWN", `${base}.canonical_state`, "未知のcanonical_stateです"));
    }
    if (entry.writer_use === "RESTORE_SOURCE" && entry.canonical_state !== "FROZEN") {
      issues.push(issue("RESTORE_SOURCE_NOT_FROZEN", base, "RESTORE_SOURCEはFROZENだけです"));
    }
    if (entry.read_required !== true) {
      issues.push(issue("MATERIAL_READ_NOT_REQUIRED", `${base}.read_required`, "materialは実読必須です"));
    }
    const parsed = parsedByPath.get(entry.path);
    const section = parsed?.sections.find((item) => item.section_id === entry.section_id);
    if (section == null) {
      issues.push(issue("SECTION_UNRESOLVED", base, "path/section_idを解決できません"));
    } else if (section.section_digest !== entry.section_digest) {
      issues.push(issue("SECTION_DIGEST_MISMATCH", `${base}.section_digest`, "section digestが一致しません"));
    }
  }
  for (const [index, source] of (map.source_files ?? []).entries()) {
    const file = fileByPath.get(source.path);
    if (file == null) {
      issues.push(issue("SOURCE_FILE_UNRESOLVED", `materialMap.source_files[${index}]`, "source fileがありません"));
      continue;
    }
    if (calculateFileDigest(file.content) !== source.file_digest) {
      issues.push(issue("FILE_DIGEST_MISMATCH", `materialMap.source_files[${index}].file_digest`,
        "file digestが一致しません"));
    }
    if ((source.coverage?.unclassified_sections ?? []).length > 0) {
      issues.push(issue("COVERAGE_UNCLASSIFIED", `materialMap.source_files[${index}].coverage`,
        "未分類sectionがあります"));
    }
    const actualIds = (map.entries ?? []).filter((entry) => entry.path === source.path).map((entry) => entry.material_id);
    const declaredIds = source.coverage?.classified_material_ids ?? [];
    if (JSON.stringify(actualIds) !== JSON.stringify(declaredIds)) {
      issues.push(issue("COVERAGE_ID_MISMATCH", `materialMap.source_files[${index}].coverage`,
        "coverageのmaterial_id一覧が一致しません"));
    }
    const parsed = parsedByPath.get(source.path);
    const mappedSections = new Set((map.entries ?? []).filter((entry) => entry.path === source.path).map((entry) => entry.section_id));
    const unmapped = (parsed?.sections ?? []).filter((section) => !mappedSections.has(section.section_id));
    if (unmapped.length > 0) {
      issues.push(issue("COVERAGE_GATE_FAILED", `materialMap.source_files[${index}].coverage`,
        "実ファイルに未分類sectionがあります"));
    }
  }
  if (!(map.entries ?? []).some((entry) =>
    entry.writer_use === "RESTORE_SOURCE" && entry.canonical_state === "FROZEN")) {
    issues.push(issue("FROZEN_RESTORE_SOURCE_MISSING", "materialMap.entries",
      "FROZENのRESTORE_SOURCEが1件以上必要です"));
  }
  return {
    decision: issues.length === 0 ? "PASS" : "STOP",
    state: issues.length === 0 ? "RESTORE_READY" : "MATERIAL_GATE_STOP",
    issues
  };
}
