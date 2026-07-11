const issue = (code, path, message) => ({ code, path, message, decision: "STOP" });

export const DISCIPLINE_OPERATIONS = Object.freeze(new Set([
  "CHECK", "TAG_SEARCH", "CARD", "CARD_TEST",
  "SINGLE_EPISODE_PROFILE_GATE", "EPISODE_PACK", "PACK_CUTOUT"
]));

const CREATION_OPERATIONS = Object.freeze(new Set(["CARD", "EPISODE_PACK", "PACK_CUTOUT"]));
const DISCIPLINE_FIELDS = Object.freeze([
  "originals_read",
  "no_inference_completion",
  "no_condition_compression",
  "no_source_condition_drop",
  "summary_not_source"
]);
const REGISTRATION_FIELDS = Object.freeze([
  "item_id", "item_type", "created_at", "added_reason", "source_or_origin",
  "dependency", "related_items", "canonical_state", "registration_target",
  "index_update_required", "navigation_references"
]);
const CANONICAL_STATES = Object.freeze(new Set([
  "CANONICAL", "COMPARISON", "NON_CONDITION", "SUPPORT", "DENIED"
]));

export function validateDesignerDiscipline(operation, request) {
  if (!DISCIPLINE_OPERATIONS.has(operation)) {
    return { decision: "PASS", moduleId: "COMMON_SUMMARY_DISCIPLINE_GATE", issues: [] };
  }
  const discipline = request.designerDiscipline;
  const issues = [];
  for (const field of DISCIPLINE_FIELDS) {
    if (discipline?.[field] !== true) {
      issues.push(issue("DESIGNER_DISCIPLINE_REQUIRED", `designerDiscipline.${field}`,
        "通常設計工程は原本実読・推測禁止・圧縮禁止・条件脱落禁止が必須です"));
    }
  }
  return {
    decision: issues.length === 0 ? "PASS" : "STOP",
    moduleId: "COMMON_SUMMARY_DISCIPLINE_GATE",
    issues
  };
}

function validNavigation(value) {
  return value != null && typeof value === "object" &&
    typeof value.START_HERE === "boolean" &&
    typeof value.READ_ME === "boolean" &&
    typeof value.CURRENT_STATUS === "boolean";
}

export function validateNewItemRegistration(operation, request) {
  if (!DISCIPLINE_OPERATIONS.has(operation)) {
    return { decision: "PASS", moduleId: "NEW_ITEM_REGISTRATION_GATE", issues: [] };
  }
  const changeSet = request.designerChangeSet;
  const issues = [];
  if (changeSet == null || typeof changeSet !== "object" || Array.isArray(changeSet)) {
    return {
      decision: "STOP", moduleId: "NEW_ITEM_REGISTRATION_GATE",
      issues: [issue("DESIGNER_CHANGE_SET_MISSING", "designerChangeSet", "新規項目の有無を明示する必要があります")]
    };
  }
  if (typeof changeSet.creates_new_items !== "boolean") {
    issues.push(issue("NEW_ITEM_STATE_UNDECIDED", "designerChangeSet.creates_new_items", "新規作成の有無が未判定です"));
  }
  const registrations = changeSet.registrations ?? [];
  if (!Array.isArray(registrations)) {
    issues.push(issue("NEW_ITEM_REGISTRATIONS_INVALID", "designerChangeSet.registrations", "registrationsは配列です"));
  } else {
    if ((changeSet.creates_new_items === true || CREATION_OPERATIONS.has(operation)) && registrations.length === 0) {
      issues.push(issue("NEW_ITEM_REGISTRATION_REQUIRED", "designerChangeSet.registrations", "作成工程には管理札が必要です"));
    }
    if (changeSet.creates_new_items === false && registrations.length > 0) {
      issues.push(issue("NEW_ITEM_STATE_MISMATCH", "designerChangeSet", "新規なし宣言と管理札が衝突しています"));
    }
    const ids = registrations.map((entry) => entry.item_id);
    if (new Set(ids).size !== ids.length) {
      issues.push(issue("NEW_ITEM_ID_DUPLICATE", "designerChangeSet.registrations", "item_idが重複しています"));
    }
    registrations.forEach((entry, index) => {
      const base = `designerChangeSet.registrations[${index}]`;
      for (const field of REGISTRATION_FIELDS) {
        if (entry?.[field] == null || (typeof entry[field] === "string" && entry[field].trim() === "")) {
          issues.push(issue("NEW_ITEM_FIELD_MISSING", `${base}.${field}`, "新規項目の管理札が不足しています"));
        }
      }
      if (!Array.isArray(entry?.dependency) || !Array.isArray(entry?.related_items)) {
        issues.push(issue("NEW_ITEM_RELATION_FIELDS_INVALID", base, "dependencyとrelated_itemsは記録済み配列が必要です"));
      }
      if (typeof entry?.index_update_required !== "boolean") {
        issues.push(issue("INDEX_UPDATE_UNDECIDED", `${base}.index_update_required`, "索引更新要否が未判定です"));
      }
      if (!validNavigation(entry?.navigation_references)) {
        issues.push(issue("NAVIGATION_UPDATE_UNDECIDED", `${base}.navigation_references`,
          "既存雛形の玄関・説明・現在地導線への追記要否が未判定です（READ_ME/CURRENT_STATUSは論理役割名であり同名ファイルを要求しません）"));
      }
      if (!CANONICAL_STATES.has(entry?.canonical_state)) {
        issues.push(issue("NEW_ITEM_CANONICAL_STATE_UNKNOWN", `${base}.canonical_state`, "正本状態が不明です"));
      }
    });
  }
  return {
    decision: issues.length === 0 ? "PASS" : "STOP",
    moduleId: "NEW_ITEM_REGISTRATION_GATE",
    issues
  };
}
