import { createHash } from "node:crypto";

const issue = (code, path, message) => ({ code, path, message, severity: "STOP" });
const hasText = (value) => typeof value === "string" && value.trim() !== "";
const normalize = (value) => String(value ?? "").trim().toLocaleLowerCase("ja-JP");
const sha256 = (value) => createHash("sha256").update(Buffer.from(value, "utf8")).digest("hex");
const CANON_STATUS = Object.freeze(["CANONICAL", "COMPARISON", "NON_CONDITION"]);
const TAG_TYPES = Object.freeze(["ITEM", "ENTITY", "RELATION"]);
const ENTITY_KINDS = Object.freeze(["PERSON", "PLACE", "ORGANIZATION", "CONCEPT", "OBJECT", "OTHER"]);
const DIRECTIONALITY = Object.freeze(["DIRECTED", "UNDIRECTED"]);
const REQUIRED_FIELDS = Object.freeze([
  "item_id", "item_name", "role", "adoption_state", "source_text",
  "source_file", "source_lines", "applies_to", "condition_type",
  "canon_status", "update_history", "shelf", "tags"
]);

export function calculateTagDefinitionDigest(definition) {
  return sha256(JSON.stringify({
    tag_name: definition.tag_name,
    tag_type: definition.tag_type,
    meaning: definition.meaning,
    role: definition.role
  }));
}

function definitionKey(tagName, tagType) {
  return `${tagType}::${tagName}`;
}

function hasApprovedChangeRequest(search, current) {
  return (search.changeRequests ?? []).some((request) =>
    request?.request_id && request.tag_name === current.tag_name &&
    request.tag_type === current.tag_type && request.approved === true &&
    request.user_decision_ref?.sourcePath && request.user_decision_ref?.section);
}

function normalizedEntityKind(kind) {
  return ({ CHARACTER: "PERSON" })[kind] ?? kind;
}

function validateRegistry(search, index) {
  const issues = [];
  const catalog = search.catalog ?? [];
  const definitions = search.tagDefinitions ?? [];
  const previousDefinitions = search.previousTagDefinitions ?? [];
  const documents = new Map((search.sourceDocuments ?? []).map((entry) => [entry.path, entry]));
  if (documents.size !== (search.sourceDocuments ?? []).length) {
    issues.push(issue("SEARCH_SOURCE_PATH_DUPLICATE", "search.sourceDocuments", "参照元pathが重複しています"));
  }
  for (const [i, document] of (search.sourceDocuments ?? []).entries()) {
    if (!hasText(document.path) || typeof document.content !== "string" ||
        document.sha256 !== sha256(document.content)) {
      issues.push(issue("SEARCH_SOURCE_INVALID", `search.sourceDocuments[${i}]`, "参照元実体またはdigestが不正です"));
    }
  }
  const itemIds = catalog.map((entry) => entry.item_id);
  if (new Set(itemIds).size !== itemIds.length) {
    issues.push(issue("SEARCH_ITEM_ID_DUPLICATE", "search.catalog", "item_idが重複しています"));
  }
  const definitionKeys = definitions.map((entry) => definitionKey(entry.tag_name, entry.tag_type));
  if (new Set(definitionKeys).size !== definitionKeys.length) {
    issues.push(issue("TAG_DEFINITION_DUPLICATE", "search.tagDefinitions", "tag_name+tag_type定義が重複しています"));
  }
  const definitionMap = new Map(definitions.map((entry) => [definitionKey(entry.tag_name, entry.tag_type), entry]));
  const previousMap = new Map(previousDefinitions.map((entry) => [definitionKey(entry.tag_name, entry.tag_type), entry]));
  for (const [i, definition] of definitions.entries()) {
    if (!hasText(definition.tag_name) || !hasText(definition.meaning) ||
        !hasText(definition.role) || !Array.isArray(definition.update_history) ||
        definition.update_history.length === 0 || !TAG_TYPES.includes(definition.tag_type) ||
        !hasText(definition.introduced_version) || !hasText(definition.definition_digest)) {
      issues.push(issue("TAG_DEFINITION_INCOMPLETE", `search.tagDefinitions[${i}]`, "タグ意味・役割・履歴が必要です"));
      continue;
    }
    if (definition.definition_digest !== calculateTagDefinitionDigest(definition)) {
      issues.push(issue("TAG_DEFINITION_DIGEST_INVALID", `search.tagDefinitions[${i}].definition_digest`,
        "タグ定義digestが内容と一致しません"));
    }
    const previous = previousMap.get(definitionKey(definition.tag_name, definition.tag_type));
    if (previous != null && previous.definition_digest !== definition.definition_digest &&
        !hasApprovedChangeRequest(search, definition)) {
      issues.push(issue("TAG_MEANING_DRIFT", `search.tagDefinitions[${i}]`,
        "同じタグ名と種別の意味変更には明示CHANGE_REQUESTが必要です"));
    }
  }
  const entityDefinitions = new Map((search.entityTagDefinitions ?? []).map((entry) => [entry.tag_name, entry]));
  const relationDefinitions = new Map((search.relationTagDefinitions ?? []).map((entry) => [entry.tag_name, entry]));
  for (const [i, definition] of (search.entityTagDefinitions ?? []).entries()) {
    if (!hasText(definition.tag_name) || !ENTITY_KINDS.includes(definition.entity_kind) ||
        !hasText(definition.meaning) || !Array.isArray(definition.allowed_aliases) ||
        !Array.isArray(definition.denied_aliases) || !hasText(definition.canonical_state)) {
      issues.push(issue("ENTITY_TAG_DEFINITION_INCOMPLETE", `search.entityTagDefinitions[${i}]`,
        "ENTITYタグ定義が不完全です"));
    }
  }
  for (const [i, definition] of (search.relationTagDefinitions ?? []).entries()) {
    if (!hasText(definition.tag_name) || !hasText(definition.relation_kind) ||
        !ENTITY_KINDS.includes(definition.from_entity_kind) ||
        !ENTITY_KINDS.includes(definition.to_entity_kind) ||
        !DIRECTIONALITY.includes(definition.directionality) ||
        !hasText(definition.meaning) || !Array.isArray(definition.allowed_usage) ||
        !Array.isArray(definition.denied_usage) || !hasText(definition.canonical_state)) {
      issues.push(issue("RELATION_TAG_DEFINITION_INCOMPLETE", `search.relationTagDefinitions[${i}]`,
        "RELATIONタグの向き・端点種別・用途定義が不完全です"));
    }
  }
  for (const [i, entry] of catalog.entries()) {
    const base = `search.catalog[${i}]`;
    for (const field of REQUIRED_FIELDS) {
      const value = entry[field];
      if (value == null || (typeof value === "string" && value.trim() === "")) {
        issues.push(issue("SEARCH_CATALOG_FIELD_MISSING", `${base}.${field}`, "検索管理札の必須欄です"));
      }
    }
    if (!CANON_STATUS.includes(entry.canon_status)) {
      issues.push(issue("SEARCH_CANON_STATUS_UNKNOWN", `${base}.canon_status`, "正本区分が不明です"));
    }
    if (!Array.isArray(entry.tags) || entry.tags.length === 0 ||
        !Array.isArray(entry.update_history) || entry.update_history.length === 0) {
      issues.push(issue("SEARCH_CATALOG_ARRAY_EMPTY", base, "タグと更新履歴は空にできません"));
    }
    for (const tag of entry.tags ?? []) {
      if (!definitionMap.has(definitionKey(tag, "ITEM"))) {
        issues.push(issue("TAG_MEANING_UNDEFINED", `${base}.tags`, `${tag}のITEM意味定義がありません`));
      }
    }
    if (!Array.isArray(entry.source_lines) || entry.source_lines.length !== 2 ||
        !entry.source_lines.every(Number.isInteger) || entry.source_lines[0] < 1 ||
        entry.source_lines[1] < entry.source_lines[0]) {
      issues.push(issue("SEARCH_SOURCE_LINES_INVALID", `${base}.source_lines`, "正確な行範囲が必要です"));
    } else {
      const document = documents.get(entry.source_file);
      const extracted = document?.content.split("\n")
        .slice(entry.source_lines[0] - 1, entry.source_lines[1]).join("\n");
      if (document == null || extracted !== entry.source_text) {
        issues.push(issue("SEARCH_SOURCE_TEXT_MISMATCH", base, "参照元テキストと行範囲が一致しません"));
      }
    }
    if (entry.canon_status === "CANONICAL" && entry.adoption_state !== "ADOPTED") {
      issues.push(issue("UNCONFIRMED_CANONICAL_FORBIDDEN", base, "未確認項目を正本条件にできません"));
    }
  }
  for (const [i, entity] of (index.entities ?? []).entries()) {
    for (const tag of entity.tags ?? []) {
      const generic = definitionMap.get(definitionKey(tag, "ENTITY"));
      const specialized = entityDefinitions.get(tag);
      if (generic == null || specialized == null) {
        issues.push(issue("ENTITY_TAG_MEANING_UNDEFINED", `index.entities[${i}].tags`, `${tag}のENTITY定義がありません`));
      } else if (specialized.entity_kind !== normalizedEntityKind(entity.kind)) {
        issues.push(issue("ENTITY_TAG_KIND_MISMATCH", `index.entities[${i}].tags`, "ENTITYタグ種別が実体と一致しません"));
      }
    }
  }
  const entityById = new Map((index.entities ?? []).map((entry) => [entry.id, entry]));
  for (const [i, relation] of (index.relations ?? []).entries()) {
    for (const tag of relation.tags ?? []) {
      const generic = definitionMap.get(definitionKey(tag, "RELATION"));
      const specialized = relationDefinitions.get(tag);
      if (generic == null || specialized == null) {
        issues.push(issue("RELATION_TAG_MEANING_UNDEFINED", `index.relations[${i}].tags`, `${tag}のRELATION定義がありません`));
        continue;
      }
      const fromKind = normalizedEntityKind(entityById.get(relation.subjectId)?.kind);
      const toKind = normalizedEntityKind(entityById.get(relation.objectId)?.kind);
      if (specialized.relation_kind !== relation.kind ||
          specialized.from_entity_kind !== fromKind || specialized.to_entity_kind !== toKind) {
        issues.push(issue("RELATION_TAG_ENDPOINT_MISMATCH", `index.relations[${i}].tags`,
          "RELATIONタグの種別または接続元・接続先が実体と一致しません"));
      }
    }
  }
  const previousCatalog = new Map((search.previousCatalog ?? []).map((entry) => [entry.item_id, entry]));
  const currentIds = catalog.map((entry) => entry.item_id).sort();
  const previousIds = [...previousCatalog.keys()].sort();
  if (JSON.stringify(currentIds) !== JSON.stringify(previousIds)) {
    issues.push(issue("LINE_STABLE_ID_SET_CHANGED", "search.catalog", "通常行参照更新でitem_id集合を変更できません"));
  }
  const updates = new Map((search.lineReferenceUpdates ?? []).map((entry) => [entry.item_id, entry]));
  for (const entry of catalog) {
    const previous = previousCatalog.get(entry.item_id);
    if (previous == null) continue;
    for (const field of ["role", "condition_type", "canon_status"]) {
      if (entry[field] !== previous[field]) {
        issues.push(issue("LINE_STABLE_FIELD_CHANGED", `search.catalog.${entry.item_id}.${field}`,
          "行参照更新でstable fieldを変更できません"));
      }
    }
    const changed = entry.source_file !== previous.source_file ||
      JSON.stringify(entry.source_lines) !== JSON.stringify(previous.source_lines);
    if (changed) {
      const update = updates.get(entry.item_id);
      const history = update?.update_history?.[0];
      if (update?.source_file !== entry.source_file ||
          JSON.stringify(update?.old_source_lines) !== JSON.stringify(previous.source_lines) ||
          JSON.stringify(update?.new_source_lines) !== JSON.stringify(entry.source_lines) ||
          update?.line_ref_status !== "UPDATED" || !hasText(update?.update_reason) ||
          !hasText(update?.updated_at) || history?.from == null || history?.to == null ||
          !hasText(history?.reason) || !hasText(history?.updated_at)) {
        issues.push(issue("LINE_REFERENCE_UPDATE_INCOMPLETE", `search.lineReferenceUpdates.${entry.item_id}`,
          "旧新行範囲・理由・履歴を記録する必要があります"));
      }
    }
  }
  const graphItemIds = (index.items ?? []).map((entry) => entry.id).sort();
  if (JSON.stringify([...itemIds].sort()) !== JSON.stringify(graphItemIds)) {
    issues.push(issue("SEARCH_CATALOG_INDEX_MISMATCH", "search.catalog", "検索管理札と既存ITEM索引が一致しません"));
  }
  return { issues, catalog, definitions };
}

function rankMatch(query, entry) {
  const q = normalize(query);
  const exact = [entry.item_id, entry.item_name, ...(entry.tags ?? [])].some((value) => normalize(value) === q);
  if (exact) return "EXACT";
  if ((entry.aliases ?? []).some((value) => normalize(value) === q)) return "ALIAS";
  if (normalize(entry.shelf) === q || (entry.tags ?? []).some((value) => normalize(value).includes(q))) return "SHELF_TAG";
  if (normalize(entry.source_file).includes(q) || normalize(entry.source_text).includes(q)) return "SOURCE";
  if (normalize(entry.item_name).includes(q) || (entry.aliases ?? []).some((value) => normalize(value).includes(q))) return "HINT";
  return null;
}

export function searchTagRegistry(search = {}, index = {}) {
  const query = search.query;
  const validated = validateRegistry(search, index);
  if (!hasText(query)) {
    validated.issues.push(issue("SEARCH_QUERY_INVALID", "search.query", "検索語が必要です"));
  }
  const matches = [];
  if (validated.issues.length === 0) {
    for (const entry of validated.catalog) {
      const matchType = rankMatch(query, entry);
      if (matchType != null) matches.push({
        matchType, item_id: entry.item_id, item_name: entry.item_name,
        role: entry.role, adoption_state: entry.adoption_state,
        source_file: entry.source_file, source_lines: entry.source_lines,
        applies_to: entry.applies_to, condition_type: entry.condition_type,
        canon_status: entry.canon_status, shelf: entry.shelf, tags: entry.tags
      });
    }
    for (const entity of index.entities ?? []) {
      if ([entity.id, entity.name, ...(entity.tags ?? [])].some((value) => normalize(value).includes(normalize(query)))) {
        matches.push({ matchType: "ENTITY", entity_id: entity.id, name: entity.name, location: entity.location, state: entity.state });
      }
    }
    for (const relation of index.relations ?? []) {
      if ([relation.id, relation.kind, ...(relation.tags ?? [])].some((value) => normalize(value).includes(normalize(query)))) {
        matches.push({ matchType: "RELATION", relation_id: relation.id, kind: relation.kind,
          subject_id: relation.subjectId, object_id: relation.objectId, location: relation.location, state: relation.state });
      }
    }
  }
  const order = new Map(["EXACT", "ALIAS", "SHELF_TAG", "ENTITY", "RELATION", "HINT", "SOURCE"].map((value, i) => [value, i]));
  matches.sort((a, b) => (order.get(a.matchType) ?? 99) - (order.get(b.matchType) ?? 99) ||
    String(a.item_id ?? a.entity_id ?? a.relation_id).localeCompare(String(b.item_id ?? b.entity_id ?? b.relation_id)));
  return Object.freeze({
    decision: validated.issues.length === 0 ? "PASS" : "STOP",
    issues: Object.freeze(validated.issues),
    output: Object.freeze({
      query,
      matches: Object.freeze(matches),
      unconfirmed: Object.freeze(matches.filter((entry) => !["ADOPTED", "USER_FIXED"].includes(entry.adoption_state ?? entry.state))),
      sourcePaths: Object.freeze([...new Set(matches.map((entry) => entry.source_file ?? entry.location).filter(Boolean))]),
      absenceReasons: Object.freeze(matches.length === 0 && validated.issues.length === 0 ? ["NO_REGISTERED_MATCH"] : [])
    })
  });
}
