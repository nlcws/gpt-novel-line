import { createHash } from "node:crypto";

const stop = (code, path, message) => ({ code, path, message, severity: "STOP" });
const hasText = (value) => typeof value === "string" && value.trim() !== "";
const sha256 = (value) => createHash("sha256").update(Buffer.from(value, "utf8")).digest("hex");

const CATALOG_FIELDS = Object.freeze([
  "condition_id", "item_id", "item_name", "item_type", "tag_name",
  "role", "adoption_state", "shelf_definition", "source_type",
  "source_text", "source_file", "source_lines", "structure_path", "target_process",
  "target_shelf", "condition_type", "canon_status", "update_history"
]);
const NEW_ITEM_FIELDS = Object.freeze([
  "created_at", "updated_at", "added_reason", "dependency", "related_items"
]);
const CANON_STATUS = Object.freeze(["CANONICAL", "COMPARISON", "NON_CONDITION"]);
const STABLE_FIELDS = Object.freeze([
  "condition_id", "item_id", "tag_name", "role", "shelf_definition",
  "source_file", "source_type", "canon_status", "condition_type"
]);

function pathMap(entries = []) {
  return new Map(entries.map((entry) => [entry.path, entry]));
}

function validateStructure(librarian, issues) {
  const before = librarian.beforeStructure ?? [];
  const after = librarian.afterStructure ?? [];
  const beforeMap = pathMap(before);
  const afterMap = pathMap(after);
  if (before.length === 0 || after.length === 0) {
    issues.push(stop("STRUCTURE_SNAPSHOT_MISSING", "transfer.librarian", "移管前後の構成実体が必要です"));
    return;
  }
  if (beforeMap.size !== before.length || afterMap.size !== after.length) {
    issues.push(stop("STRUCTURE_PATH_DUPLICATE", "transfer.librarian", "構成pathが重複しています"));
  }
  const beforeRoots = before.filter((entry) => entry.type === "ROOT").map((entry) => entry.path);
  const afterRoots = after.filter((entry) => entry.type === "ROOT").map((entry) => entry.path);
  if (beforeRoots.length !== 1 || JSON.stringify(beforeRoots) !== JSON.stringify(afterRoots)) {
    issues.push(stop("ROOT_STRUCTURE_CHANGED", "transfer.librarian.afterStructure", "root folderを維持する必要があります"));
  }
  for (const [path, entry] of beforeMap) {
    const current = afterMap.get(path);
    if (current == null) {
      issues.push(stop("EXISTING_PATH_REMOVED_OR_MOVED", path, "既存pathの削除・移動・改名は禁止です"));
      continue;
    }
    if (current.type !== entry.type || current.shelf_definition !== entry.shelf_definition) {
      issues.push(stop("EXISTING_PATH_MEANING_CHANGED", path, "既存棚・様式の意味変更は禁止です"));
    }
    if (entry.type === "FILE") {
      if (!hasText(entry.content_digest) || !hasText(current.content_digest)) {
        issues.push(stop("STRUCTURE_FILE_DIGEST_MISSING", path, "移管前後のfile digestが必要です"));
      } else if (entry.content_digest !== current.content_digest) {
        const registered = (librarian.catalog ?? []).some((item) =>
          item.structure_path === path && item.file_change_registered === true &&
          hasText(item.update_reason) && hasText(item.version) && hasText(item.updated_at));
        if (!registered) {
          issues.push(stop("CHANGED_FILE_NOT_REGISTERED", path, "変更fileの管理札と更新理由が必要です"));
        }
      }
    }
  }
  const additions = after.filter((entry) => !beforeMap.has(entry.path));
  const registered = new Set((librarian.catalog ?? []).filter((entry) => entry.is_new === true).map((entry) => entry.target_path));
  for (const entry of additions) {
    if (!registered.has(entry.path)) {
      issues.push(stop("NEW_PATH_UNREGISTERED", entry.path, "新規追加物には管理札が必要です"));
    }
  }
  const beforeShelves = new Set(before.map((entry) => entry.shelf_id).filter(Boolean));
  const newShelfIds = new Set(after.map((entry) => entry.shelf_id).filter((id) => id && !beforeShelves.has(id)));
  const declarations = new Map((librarian.newShelves ?? []).map((entry) => [entry.shelf_id, entry]));
  for (const shelfId of newShelfIds) {
    const declaration = declarations.get(shelfId);
    const refs = declaration?.navigation_references ?? {};
    const allowed = declaration != null &&
      declaration.role_mixing_if_existing === true &&
      declaration.future_growth_clear === true &&
      declaration.template_compatible === true &&
      declaration.old_shelf_meanings_preserved === true &&
      hasText(declaration.reason) && hasText(declaration.purpose) &&
      refs.START_HERE === true && refs.READ_ME === true && refs.CURRENT_STATUS === true;
    if (!allowed) issues.push(stop("NEW_SHELF_CONDITIONS_INCOMPLETE", shelfId, "新棚の許可条件が揃っていません"));
  }
  for (const shelfId of declarations.keys()) {
    if (!newShelfIds.has(shelfId)) {
      issues.push(stop("NEW_SHELF_DECLARATION_ORPHAN", shelfId, "実体のない新棚宣言です"));
    }
  }
  const archive = librarian.outputArchive;
  if (archive?.format !== "ZIP") issues.push(stop("OUTPUT_NOT_ZIP", "transfer.librarian.outputArchive.format", "返却物はZIP必須です"));
  if (archive?.root_path !== afterRoots[0]) issues.push(stop("OUTPUT_ROOT_MISMATCH", "transfer.librarian.outputArchive.root_path", "元と同じrootが必要です"));
  const archivedPaths = [...new Set(archive?.entry_paths ?? [])].sort();
  if ((archive?.entry_paths ?? []).length !== archivedPaths.length) {
    issues.push(stop("OUTPUT_ARCHIVE_PATH_DUPLICATE", "transfer.librarian.outputArchive.entry_paths", "ZIP内pathが重複しています"));
  }
  const afterPaths = [...afterMap.keys()].sort();
  if (JSON.stringify(archivedPaths) !== JSON.stringify(afterPaths)) {
    issues.push(stop("OUTPUT_ARCHIVE_STRUCTURE_MISMATCH", "transfer.librarian.outputArchive.entry_paths", "ZIP内容が移管後構成と一致しません"));
  }
}

function validateCatalog(librarian, inventory, issues) {
  const catalog = librarian.catalog ?? [];
  const previousCatalog = librarian.previousCatalog ?? [];
  const ids = catalog.map((entry) => entry.item_id);
  if (new Set(ids).size !== ids.length) issues.push(stop("CATALOG_ID_DUPLICATE", "transfer.librarian.catalog", "item_id重複です"));
  const documents = new Map((librarian.sourceDocuments ?? []).map((entry) => [entry.path, entry]));
  if (documents.size !== (librarian.sourceDocuments ?? []).length) {
    issues.push(stop("SOURCE_DOCUMENT_PATH_DUPLICATE", "transfer.librarian.sourceDocuments", "source document pathが重複しています"));
  }
  const previousById = new Map(previousCatalog.map((entry) => [entry.item_id, entry]));
  if (previousById.size !== previousCatalog.length) {
    issues.push(stop("PREVIOUS_CATALOG_ID_DUPLICATE", "transfer.librarian.previousCatalog", "旧item_idが重複しています"));
  }
  for (const [index, document] of (librarian.sourceDocuments ?? []).entries()) {
    if (!hasText(document.path) || typeof document.content !== "string") {
      issues.push(stop("SOURCE_DOCUMENT_INVALID", `transfer.librarian.sourceDocuments[${index}]`, "source documentが不正です"));
    } else if (document.sha256 !== sha256(document.content)) {
      issues.push(stop("SOURCE_DOCUMENT_DIGEST_MISMATCH", document.path, "source digestが一致しません"));
    }
  }
  for (const [index, entry] of catalog.entries()) {
    const path = `transfer.librarian.catalog[${index}]`;
    for (const field of CATALOG_FIELDS) {
      const value = entry[field];
      if (value == null || (typeof value === "string" && value.trim() === "")) {
        issues.push(stop("MANAGEMENT_TAG_FIELD_MISSING", `${path}.${field}`, "管理札の必須欄です"));
      }
    }
    if (!Array.isArray(entry.update_history) || entry.update_history.length === 0) {
      issues.push(stop("UPDATE_HISTORY_EMPTY", `${path}.update_history`, "更新履歴が必要です"));
    }
    if (!CANON_STATUS.includes(entry.canon_status)) {
      issues.push(stop("CANON_STATUS_UNKNOWN", `${path}.canon_status`, "正本区分が不明です"));
    }
    if (!Array.isArray(entry.source_lines) || entry.source_lines.length !== 2 ||
        !entry.source_lines.every(Number.isInteger) || entry.source_lines[0] < 1 ||
        entry.source_lines[1] < entry.source_lines[0]) {
      issues.push(stop("SOURCE_LINE_RANGE_INVALID", `${path}.source_lines`, "正確な行範囲が必要です"));
    } else {
      const document = documents.get(entry.source_file);
      const lines = document?.content.split("\n") ?? [];
      const extracted = lines.slice(entry.source_lines[0] - 1, entry.source_lines[1]).join("\n");
      if (document == null || extracted !== entry.source_text) {
        issues.push(stop("SOURCE_TEXT_NOT_AT_LINE_RANGE", path, "参照元テキストと行範囲が一致しません"));
      }
    }
    const previous = previousById.get(entry.item_id);
    const mechanicallyNew = previous == null;
    if (entry.is_new !== mechanicallyNew) {
      issues.push(stop("NEW_ITEM_STATE_MISMATCH", path, "新規状態は旧カタログとの差分で決まります"));
    }
    if (previous != null) {
      for (const field of STABLE_FIELDS) {
        if (entry[field] !== previous[field]) {
          issues.push(stop("STABLE_FIELD_CHANGED", `${path}.${field}`, "移管でstable fieldを変更できません"));
        }
      }
    }
    if (mechanicallyNew) {
      for (const field of NEW_ITEM_FIELDS) {
        if (entry[field] == null || (typeof entry[field] === "string" && entry[field].trim() === "")) {
          issues.push(stop("NEW_ITEM_FIELD_MISSING", `${path}.${field}`, "新規項目の管理札が不足しています"));
        }
      }
      if (!hasText(entry.target_path)) issues.push(stop("NEW_ITEM_TARGET_PATH_MISSING", path, "新規追加先pathが必要です"));
    }
    const lineChanged = previous != null &&
      JSON.stringify(entry.source_lines) !== JSON.stringify(previous.source_lines);
    if (lineChanged &&
        (entry.line_ref_status !== "UPDATED" || !hasText(entry.update_reason) ||
         !hasText(entry.version) || !hasText(entry.updated_at))) {
      issues.push(stop("LINE_REFERENCE_UPDATE_INCOMPLETE", path, "行参照更新履歴が不足しています"));
    }
    if (!lineChanged && entry.line_ref_status !== "EXACT") {
      issues.push(stop("LINE_REFERENCE_STATUS_INVALID", path, "未変更行参照はEXACT必須です"));
    }
  }
  for (const item of inventory) {
    if (!ids.includes(item.id)) issues.push(stop("INVENTORY_ITEM_NOT_CATALOGED", item.id, "回収素材に管理札がありません"));
  }
  const registeredIds = librarian.indexMaintenance?.registered_item_ids ?? [];
  if (JSON.stringify([...new Set(registeredIds)].sort()) !== JSON.stringify([...new Set(ids)].sort()) ||
      registeredIds.length !== new Set(registeredIds).size) {
    issues.push(stop("INDEX_CATALOG_REGISTRATION_MISMATCH", "transfer.librarian.indexMaintenance.registered_item_ids",
      "既存索引の登録IDと管理札が一致しません"));
  }
}

function validateIndexMaintenance(librarian, issues) {
  const index = librarian.indexMaintenance ?? {};
  if (index.existing_index_read !== true) issues.push(stop("EXISTING_INDEX_UNREAD", "transfer.librarian.indexMaintenance", "既存索引の実読が必要です"));
  if (index.repair_attempted_first !== true) issues.push(stop("INDEX_REPAIR_NOT_FIRST", "transfer.librarian.indexMaintenance", "新設前に既存索引を修復します"));
  if (index.parallel_index_created === true) issues.push(stop("PARALLEL_INDEX_FORBIDDEN", "transfer.librarian.indexMaintenance", "同役割の別索引は禁止です"));
  if ((index.unresolved_items ?? []).length > 0) issues.push(stop("INDEX_UNRESOLVED", "transfer.librarian.indexMaintenance.unresolved_items", "索引未解決があります"));
  const refs = index.navigation_references ?? {};
  if (refs.START_HERE !== true || refs.READ_ME !== true || refs.CURRENT_STATUS !== true) {
    issues.push(stop("NAVIGATION_REFERENCE_INCOMPLETE", "transfer.librarian.indexMaintenance.navigation_references", "玄関・説明・現在地から索引へ到達できません"));
  }
}

export function validateLibrarianTransfer(input) {
  const librarian = input.transfer?.librarian;
  const issues = [];
  if (librarian == null || typeof librarian !== "object" || Array.isArray(librarian)) {
    return { decision: "STOP", issues: [stop("LIBRARIAN_TRANSFER_MISSING", "transfer.librarian", "司書型移管台帳が必要です")] };
  }
  validateStructure(librarian, issues);
  validateCatalog(librarian, input.transfer?.inventory ?? [], issues);
  validateIndexMaintenance(librarian, issues);
  if (librarian.summaryControl?.all_sources_read !== true ||
      librarian.summaryControl?.no_inference !== true ||
      librarian.summaryControl?.no_condition_compression !== true) {
    issues.push(stop("SUMMARY_CONTROL_FAILED", "transfer.librarian.summaryControl", "原本未読・推測補完・条件要約は禁止です"));
  }
  return Object.freeze({ decision: issues.length === 0 ? "PASS" : "STOP", issues: Object.freeze(issues) });
}
