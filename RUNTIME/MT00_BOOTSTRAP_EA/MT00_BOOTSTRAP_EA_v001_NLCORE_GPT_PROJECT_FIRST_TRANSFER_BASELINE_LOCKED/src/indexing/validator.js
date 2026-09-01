const ITEM_REQUIRED = ["id", "location", "shelf", "state", "tagShelf", "tags"];
const ENTITY_REQUIRED = ["id", "kind", "name", "location", "state", "tagShelf", "tags"];
const RELATION_REQUIRED = [
  "id", "kind", "subjectId", "objectId", "state", "location", "tags"
];
const STOP_REQUIRED = ["tag", "meaning", "scope", "assignedTo"];
const VALID_STATES = new Set([
  "ADOPTED", "REFLECTED", "HOLD", "UNCONFIRMED",
  "PROVISIONAL", "INFERRED", "DEFERRED", "DISCARDED"
]);

function issue(code, path, message, severity = "STOP") {
  return { code, path, message, severity };
}

function requireFields(record, fields, path, issues) {
  for (const field of fields) {
    const value = record?.[field];
    if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) {
      issues.push(issue("INDEX_REQUIRED", `${path}.${field}`, `${field}が必要です`));
    }
  }
}

function validateUnique(records, path, key, issues) {
  const seen = new Set();
  records.forEach((record, index) => {
    const value = record?.[key];
    if (value == null) return;
    if (seen.has(value)) {
      issues.push(issue("INDEX_DUPLICATE_ID", `${path}[${index}].${key}`, `${value}が重複しています`));
    }
    seen.add(value);
  });
}

function validateState(record, path, issues) {
  if (record?.state != null && !VALID_STATES.has(record.state)) {
    issues.push(issue("INDEX_STATE", `${path}.state`, "未知の状態です"));
  }
}

function validateLocation(record, path, issues) {
  if (typeof record?.location === "string" && !record.location.includes("#")) {
    issues.push(issue("INDEX_LOCATION", `${path}.location`, "所在はfile#section形式が必要です"));
  }
}

function validateStopTags(record, path, stopMap, issues) {
  for (const tag of record?.stopTags ?? []) {
    if (!stopMap.has(tag)) {
      issues.push(issue("STOP_TAG_UNDEFINED", `${path}.stopTags`, `${tag}が辞書にありません`));
    }
  }
}

export function validateIndexGraph(index) {
  const issues = [];
  const repairs = [];
  const items = index?.items ?? [];
  const entities = index?.entities ?? [];
  const relations = index?.relations ?? [];
  const stopTags = index?.stopTags ?? [];

  if (!Array.isArray(items) || !Array.isArray(entities) ||
      !Array.isArray(relations) || !Array.isArray(stopTags)) {
    return {
      decision: "STOP",
      issues: [issue("INDEX_ROOT_TYPE", "index", "各索引群は配列である必要があります")],
      repairs: []
    };
  }

  validateUnique(items, "index.items", "id", issues);
  validateUnique(entities, "index.entities", "id", issues);
  validateUnique(relations, "index.relations", "id", issues);
  validateUnique(stopTags, "index.stopTags", "tag", issues);

  const entityMap = new Map(entities.map((entry) => [entry.id, entry]));
  const relationMap = new Map(relations.map((entry) => [entry.id, entry]));
  const stopMap = new Map(stopTags.map((entry) => [entry.tag, entry]));

  stopTags.forEach((entry, indexValue) => {
    const path = `index.stopTags[${indexValue}]`;
    requireFields(entry, STOP_REQUIRED, path, issues);
    if (!/^#stop:[a-z0-9_]+$/.test(entry?.tag ?? "")) {
      issues.push(issue("STOP_TAG_FORMAT", `${path}.tag`, "STOP_TAG形式が不正です"));
    }
    if (entry?.released === true && !entry?.releaseCondition) {
      issues.push(issue("STOP_TAG_RELEASE", path, "解除条件なしで解除済みにできません"));
    }
  });

  items.forEach((entry, indexValue) => {
    const path = `index.items[${indexValue}]`;
    requireFields(entry, ITEM_REQUIRED, path, issues);
    validateState(entry, path, issues);
    validateLocation(entry, path, issues);
    validateStopTags(entry, path, stopMap, issues);
    for (const entityId of entry?.entityIds ?? []) {
      if (!entityMap.has(entityId)) {
        issues.push(issue("ITEM_ENTITY_MISSING", `${path}.entityIds`, `${entityId}が未登録です`));
        repairs.push({ kind: "ENTITY", target: entityId, reason: "ITEM参照先なし" });
      }
    }
    for (const relationId of entry?.relationIds ?? []) {
      if (!relationMap.has(relationId)) {
        issues.push(issue("ITEM_RELATION_MISSING", `${path}.relationIds`, `${relationId}が未登録です`));
        repairs.push({ kind: "RELATION", target: relationId, reason: "ITEM参照先なし" });
      }
    }
  });

  entities.forEach((entry, indexValue) => {
    const path = `index.entities[${indexValue}]`;
    requireFields(entry, ENTITY_REQUIRED, path, issues);
    validateState(entry, path, issues);
    validateLocation(entry, path, issues);
    validateStopTags(entry, path, stopMap, issues);
    for (const relationId of entry?.relationIds ?? []) {
      if (!relationMap.has(relationId)) {
        issues.push(issue("ENTITY_RELATION_MISSING", `${path}.relationIds`, `${relationId}が未登録です`));
        repairs.push({ kind: "RELATION", target: relationId, reason: "ENTITY参照先なし" });
      }
    }
  });

  relations.forEach((entry, indexValue) => {
    const path = `index.relations[${indexValue}]`;
    requireFields(entry, RELATION_REQUIRED, path, issues);
    validateState(entry, path, issues);
    validateLocation(entry, path, issues);
    validateStopTags(entry, path, stopMap, issues);
    if (!entityMap.has(entry.subjectId)) {
      issues.push(issue("RELATION_SUBJECT_MISSING", `${path}.subjectId`, "主体ENTITYがありません"));
      repairs.push({ kind: "ENTITY", target: entry.subjectId, reason: "RELATION主体なし" });
    }
    if (!entityMap.has(entry.objectId)) {
      issues.push(issue("RELATION_OBJECT_MISSING", `${path}.objectId`, "対象ENTITYがありません"));
      repairs.push({ kind: "ENTITY", target: entry.objectId, reason: "RELATION対象なし" });
    }
    for (const endpoint of [entry.subjectId, entry.objectId]) {
      const entity = entityMap.get(endpoint);
      if (entity && !(entity.relationIds ?? []).includes(entry.id)) {
        issues.push(issue("RELATION_REVERSE_LINK_MISSING", path,
          `${endpoint}から${entry.id}への逆引きがありません`));
        repairs.push({ kind: "REVERSE_LINK", target: endpoint, relationId: entry.id });
      }
    }
  });

  const decision = issues.some((entry) => entry.severity === "STOP") ? "STOP" : "PASS";
  return { decision, issues, repairs };
}
