const issue = (code, path, message) => ({ code, path, message, decision: "STOP" });

export const DISCIPLINE_OPERATIONS = Object.freeze(new Set([
  "CHECK", "CARD", "CARD_TEST",
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

const PKDB_EVIDENCE_OPERATIONS = Object.freeze(new Set([
  "CHECK", "TAG_SEARCH", "CARD", "CARD_TEST", "LOG", "ARCHIVE",
  "SINGLE_EPISODE_PROFILE_GATE", "EPISODE_PACK"
]));

export function validatePkdbEvidenceBoundary(operation, request) {
  if (!PKDB_EVIDENCE_OPERATIONS.has(operation) || request?.externalContext?.present !== true) {
    return { decision: "PASS", moduleId: "PROJECT_SHELF_EVIDENCE_BOUNDARY", issues: [] };
  }
  const evidence = request?.runtimeEvidence?.pkdb;
  const issues = [];
  if (evidence?.accessDelivered !== true || evidence?.requiredClausesSatisfied !== true) {
    issues.push(issue("PKDB_ACCESS_EVIDENCE_REQUIRED", "runtimeEvidence.pkdb", "project lookup requires delivered PKDB tag/pointer evidence"));
  }
  if (evidence?.tagRecordsAreAuthority !== false) {
    issues.push(issue("PKDB_TAG_AUTHORITY_FORBIDDEN", "runtimeEvidence.pkdb.tagRecordsAreAuthority", "PKDB tag records are locator metadata and may not become project source/canon authority"));
  }
  if (evidence?.evidenceComplete !== true) {
    issues.push(issue("PROJECT_SOURCE_EVIDENCE_INCOMPLETE", "runtimeEvidence.pkdb.evidenceComplete", "current shelf evidence must be complete before design validation"));
  }
  if (evidence?.evidenceRoute === "CURRENT_SHELF_LOCATOR") {
    if (evidence?.currentShelfIsAuthority !== true || evidence?.shelfBytesActuallyRead !== true || (evidence?.shelfReads?.length ?? 0) === 0) {
      issues.push(issue("CURRENT_SHELF_BYTES_UNREAD", "runtimeEvidence.pkdb.shelfReads", "current project shelf bytes must be verified and actually read after PKDB pointer lookup"));
    }
  } else if (evidence?.evidenceRoute === "SOURCE_MATERIALIZE_FALLBACK") {
    if (request?.knowledgeRequest?.allowSourceMaterializeFallback !== true || evidence?.sourceBytesActuallyRead !== true) {
      issues.push(issue("PKDB_SOURCE_FALLBACK_NOT_AUTHORIZED", "runtimeEvidence.pkdb", "PKDB SOURCE materialize is an explicit fallback only in v0401"));
    }
  } else {
    issues.push(issue("PROJECT_SOURCE_ROUTE_INVALID", "runtimeEvidence.pkdb.evidenceRoute", "v0401 project evidence must come from current shelf read or explicit SOURCE fallback"));
  }
  return { decision: issues.length === 0 ? "PASS" : "STOP", moduleId: "PROJECT_SHELF_EVIDENCE_BOUNDARY", issues };
}

export function validateSemanticDefinitionStability(operation, request) {
  const issues = [];
  const candidates = request?.pkdbInputCandidates;
  if (Array.isArray(candidates)) {
    candidates.forEach((candidate, index) => {
      if (candidate?.mode === "SUPERSEDE" && (typeof candidate?.approved_change_basis !== "string" || candidate.approved_change_basis.trim() === "")) {
        issues.push(issue("SEMANTIC_CHANGE_BASIS_REQUIRED", `pkdbInputCandidates[${index}].approved_change_basis`, "existing semantic meaning requires an explicit approved change basis"));
      }
    });
  }
  return { decision: issues.length === 0 ? "PASS" : "STOP", moduleId: "SEMANTIC_DEFINITION_STABILITY", issues };
}

export function validateProvenanceUpdateBoundary(operation, request) {
  const issues = [];
  const candidates = request?.pkdbInputCandidates;
  if (Array.isArray(candidates)) {
    candidates.forEach((candidate, index) => {
      if (candidate?.source_address_changed === true) {
        if (candidate?.stable_semantic_identity !== true) {
          issues.push(issue("PROVENANCE_STABLE_IDENTITY_REQUIRED", `pkdbInputCandidates[${index}].stable_semantic_identity`, "source address movement must not rewrite semantic identity"));
        }
        if (!Array.isArray(candidate?.provenance_update?.old_refs) || !Array.isArray(candidate?.provenance_update?.new_refs)) {
          issues.push(issue("PROVENANCE_UPDATE_REFS_REQUIRED", `pkdbInputCandidates[${index}].provenance_update`, "source movement requires old_refs/new_refs provenance update"));
        }
      }
    });
  }
  return { decision: issues.length === 0 ? "PASS" : "STOP", moduleId: "PROVENANCE_UPDATE_BOUNDARY", issues };
}

export function validatePkdbInputRecognition(operation, request) {
  const issues = [];
  if (request?.pkdbCommitAttempted === true) {
    issues.push(issue("PKDB_COMMIT_AUTHORITY_VIOLATION", "pkdbCommitAttempted", "DS90 prepares PKDB input proposals; MT00/Nul remains DB commit authority"));
  }
  const candidates = request?.pkdbInputCandidates;
  if (candidates != null && !Array.isArray(candidates)) {
    issues.push(issue("PKDB_INPUT_RECOGNITION_INVALID", "pkdbInputCandidates", "recognized PKDB inputs must be an array"));
  }
  return { decision: issues.length === 0 ? "PASS" : "STOP", moduleId: "PKDB_INPUT_RECOGNITION_BOUNDARY", issues };
}
