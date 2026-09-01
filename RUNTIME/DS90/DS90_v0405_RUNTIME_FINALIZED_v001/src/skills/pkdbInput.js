const issue = (code, path, message) => ({ code, path, message, decision: "STOP", nonOverrideable: true });

export const PKDB_RECORD_TYPES = Object.freeze(new Set([
  "ENTITY", "RULE", "STATE", "RELATION", "ASSERTION", "ATTRIBUTE", "PROVENANCE", "SOURCE"
]));

export const V0401_PKDB_STANDARD_INPUT_POLICY = Object.freeze({
  profile: "TAG_ALIAS_CURRENT_SOURCE_LOCATOR_REVERSE_INDEX_MINIMAL_RELATION",
  projectFullTextReconstructionStandard: false,
  preferredFields: Object.freeze([
    "aliases", "search_terms", "SOURCE.payload.locator", "SOURCE.payload.sha256", "SOURCE.payload.media_type"
  ]),
  genericHardenedCandidateCompatibilityRetained: true,
  commitAuthority: "MT00_NUL_ONLY"
});


function recordIdOf(record) {
  return record?.record_id ?? record?.recordId ?? record?.id ?? null;
}

function recordTypeOf(record) {
  return record?.record_type ?? record?.recordType ?? null;
}

function semanticKeyCandidates(record) {
  return new Set([
    record?.semantic_key,
    record?.semanticKey,
    record?.logical_id,
    record?.logicalId,
    recordIdOf(record)
  ].filter((value) => typeof value === "string" && value.trim() !== ""));
}

function evidenceInventory(knowledgeEvidence) {
  const records = new Map();
  for (const record of knowledgeEvidence?.semanticRecords ?? []) {
    const id = recordIdOf(record);
    if (typeof id === "string" && id.trim() !== "") records.set(id, record);
  }
  const resolvedRecordIds = new Set(knowledgeEvidence?.resolvedRecordIds ?? []);
  const sourceIds = new Set([
    ...(knowledgeEvidence?.sourceIds ?? []),
    ...(knowledgeEvidence?.materializedSources ?? []).map((entry) => entry?.sourceId)
  ].filter((value) => typeof value === "string" && value.trim() !== ""));
  const provenanceIds = new Set([
    ...(knowledgeEvidence?.provenanceIds ?? []),
    ...(knowledgeEvidence?.semanticRecords ?? []).flatMap((record) => record?.provenance_refs ?? record?.provenanceRefs ?? [])
  ].filter((value) => typeof value === "string" && value.trim() !== ""));
  return { records, resolvedRecordIds, sourceIds, provenanceIds };
}

function validateSupersedeAndProvenanceBinding(candidates, knowledgeEvidence) {
  const issues = [];
  if (candidates.length === 0) return issues;
  const inv = evidenceInventory(knowledgeEvidence);
  candidates.forEach((candidate, index) => {
    const base = `pkdbInputCandidates[${index}]`;
    if (candidate?.mode === "SUPERSEDE" && typeof candidate?.existing_record_id === "string" && candidate.existing_record_id.trim() !== "") {
      if (knowledgeEvidence?.lineageMode !== "ACTIVE") {
        issues.push(issue("PKDB_INPUT_SUPERSEDE_ACTIVE_LINEAGE_REQUIRED", `${base}.existing_record_id`, "SUPERSEDE target must come from a current-run PKDB ACCESS context using ACTIVE lineage mode"));
      }
      const existing = inv.records.get(candidate.existing_record_id);
      if (!existing || !inv.resolvedRecordIds.has(candidate.existing_record_id)) {
        issues.push(issue("PKDB_INPUT_SUPERSEDE_TARGET_NOT_EVIDENCED", `${base}.existing_record_id`, "SUPERSEDE target must be a record resolved and fully delivered in the current PKDB evidence context"));
      } else {
        if (recordTypeOf(existing) !== candidate.record_type) {
          issues.push(issue("PKDB_INPUT_SUPERSEDE_RECORD_TYPE_MISMATCH", `${base}.record_type`, "SUPERSEDE record_type must match the evidenced existing record"));
        }
        if (!semanticKeyCandidates(existing).has(candidate.semantic_key)) {
          issues.push(issue("PKDB_INPUT_SUPERSEDE_SEMANTIC_KEY_MISMATCH", `${base}.semantic_key`, "SUPERSEDE semantic_key must match the evidenced record_id/logical_id/semantic_key"));
        }
        if (existing?.status != null && existing.status !== "CONFIRMED") {
          issues.push(issue("PKDB_INPUT_SUPERSEDE_TARGET_NOT_CONFIRMED", `${base}.existing_record_id`, "SUPERSEDE target must be an evidenced CONFIRMED active record"));
        }
      }
    }
    if (candidate?.source_address_changed === true) {
      const oldRefs = candidate?.provenance_update?.old_refs;
      const newRefs = candidate?.provenance_update?.new_refs;
      if (!Array.isArray(oldRefs) || oldRefs.length === 0 || !Array.isArray(newRefs) || newRefs.length === 0) {
        issues.push(issue("PKDB_PROVENANCE_MOVE_REFS_NONEMPTY_REQUIRED", `${base}.provenance_update`, "source-address movement requires non-empty old_refs and new_refs"));
      } else {
        oldRefs.forEach((ref, refIndex) => {
          if (typeof ref !== "string" || !inv.provenanceIds.has(ref)) {
            issues.push(issue("PKDB_PROVENANCE_OLD_REF_UNKNOWN", `${base}.provenance_update.old_refs[${refIndex}]`, "old_refs must resolve to provenance evidenced in the current run"));
          }
        });
        newRefs.forEach((ref, refIndex) => {
          if (typeof ref !== "string" || !inv.sourceIds.has(ref)) {
            issues.push(issue("PKDB_PROVENANCE_NEW_REF_UNKNOWN", `${base}.provenance_update.new_refs[${refIndex}]`, "new_refs must resolve to SOURCE evidence delivered/materialized in the current run"));
          }
        });
      }
    }
  });
  return issues;
}

function exactRefSet(knowledgeEvidence) {
  const refs = new Set();
  for (const record of knowledgeEvidence?.semanticRecords ?? []) {
    for (const key of ["recordId", "record_id", "id", "logicalId", "logical_id"]) {
      const value = record?.[key];
      if (typeof value === "string" && value.trim() !== "") refs.add(value);
    }
  }
  for (const provenanceId of knowledgeEvidence?.provenanceIds ?? []) {
    if (typeof provenanceId === "string" && provenanceId.trim() !== "") refs.add(provenanceId);
  }
  for (const sourceId of knowledgeEvidence?.sourceIds ?? []) {
    if (typeof sourceId === "string" && sourceId.trim() !== "") refs.add(sourceId);
  }
  for (const source of knowledgeEvidence?.materializedSources ?? []) {
    if (typeof source?.sourceId === "string" && source.sourceId.trim() !== "") refs.add(source.sourceId);
  }
  return refs;
}

function validateCandidateEvidenceBinding(candidates, knowledgeEvidence) {
  const issues = [];
  if (candidates.length === 0) return issues;
  if (knowledgeEvidence?.accessDelivered !== true || knowledgeEvidence?.evidenceComplete !== true) {
    issues.push(issue(
      "PKDB_INPUT_EVIDENCE_CONTEXT_REQUIRED",
      "runtimeEvidence.pkdb",
      "PKDB input proposals require a completed PKDB ACCESS/materialize evidence context from this runtime execution"
    ));
    return issues;
  }
  const refs = exactRefSet(knowledgeEvidence);
  candidates.forEach((candidate, index) => {
    const base = `pkdbInputCandidates[${index}]`;
    for (const [field, code] of [
      ["evidence_refs", "PKDB_INPUT_EVIDENCE_REF_UNKNOWN"],
      ["provenance_refs", "PKDB_INPUT_PROVENANCE_REF_UNKNOWN"]
    ]) {
      const values = candidate?.[field];
      if (!Array.isArray(values)) continue;
      for (const [refIndex, ref] of values.entries()) {
        if (typeof ref !== "string" || ref.trim() === "" || !refs.has(ref)) {
          issues.push(issue(code, `${base}.${field}[${refIndex}]`, `${field} must resolve to evidence actually delivered/read in the current PKDB evidence context`));
        }
      }
    }
  });
  return issues;
}

export function validatePkdbInputCandidates(request) {
  const candidates = request?.pkdbInputCandidates;
  const issues = [];
  if (request?.pkdbCommitAttempted === true) {
    issues.push(issue("DS90_PKDB_COMMIT_FORBIDDEN", "pkdbCommitAttempted", "DS90 may prepare PKDB input but must not commit PKDB"));
  }
  if (candidates == null) return { issues, candidates: [] };
  if (!Array.isArray(candidates)) {
    issues.push(issue("PKDB_INPUT_CANDIDATES_INVALID", "pkdbInputCandidates", "pkdbInputCandidates must be an array"));
    return { issues, candidates: [] };
  }
  const ids = new Set();
  candidates.forEach((candidate, index) => {
    const base = `pkdbInputCandidates[${index}]`;
    for (const field of ["candidate_id", "record_type", "semantic_key", "mode"]) {
      if (typeof candidate?.[field] !== "string" || candidate[field].trim() === "") {
        issues.push(issue("PKDB_INPUT_FIELD_MISSING", `${base}.${field}`, `${field} is required`));
      }
    }
    if (candidate?.candidate_id) {
      if (ids.has(candidate.candidate_id)) issues.push(issue("PKDB_INPUT_CANDIDATE_ID_DUPLICATE", `${base}.candidate_id`, "candidate_id must be unique"));
      ids.add(candidate.candidate_id);
    }
    if (!PKDB_RECORD_TYPES.has(candidate?.record_type)) {
      issues.push(issue("PKDB_INPUT_RECORD_TYPE_INVALID", `${base}.record_type`, "unsupported PKDB record type"));
    }
    if (!Object.hasOwn(candidate ?? {}, "value")) {
      issues.push(issue("PKDB_INPUT_VALUE_MISSING", `${base}.value`, "semantic/source locator value is required"));
    }
    if (candidate?.record_type === "SOURCE" && Object.hasOwn(candidate ?? {}, "value")) {
      const value = candidate?.value;
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        issues.push(issue("PKDB_INPUT_SOURCE_VALUE_INVALID", `${base}.value`, "SOURCE locator proposal value must be an object"));
      } else {
        const locator = value.locator;
        const sha256 = value.sha256;
        const sourceRole = value.source_role;
        if (typeof locator !== "string" || locator.trim() === "") {
          issues.push(issue("PKDB_INPUT_SOURCE_LOCATOR_REQUIRED", `${base}.value.locator`, "SOURCE locator proposal requires current-mount relative locator"));
        } else {
          const normalized = locator.replaceAll("\\", "/");
          if (normalized.startsWith("/") || /^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(normalized) || normalized.split("/").includes("..")) {
            issues.push(issue("PKDB_INPUT_SOURCE_LOCATOR_UNSAFE", `${base}.value.locator`, "v0401 standard SOURCE locator must be a safe current-project-mount relative path"));
          }
        }
        if (typeof sha256 !== "string" || !/^[0-9a-f]{64}$/.test(sha256)) {
          issues.push(issue("PKDB_INPUT_SOURCE_SHA256_REQUIRED", `${base}.value.sha256`, "SOURCE locator proposal requires exact lowercase SHA-256"));
        }
        if (typeof sourceRole !== "string" || sourceRole.trim() === "") {
          issues.push(issue("PKDB_INPUT_SOURCE_ROLE_REQUIRED", `${base}.value.source_role`, "SOURCE locator proposal requires source_role"));
        }
        if (value.aliases != null && !Array.isArray(value.aliases)) {
          issues.push(issue("PKDB_INPUT_SOURCE_ALIASES_INVALID", `${base}.value.aliases`, "SOURCE locator aliases must be an array when provided"));
        }
        if (value.search_terms != null && !Array.isArray(value.search_terms)) {
          issues.push(issue("PKDB_INPUT_SOURCE_SEARCH_TERMS_INVALID", `${base}.value.search_terms`, "SOURCE locator search_terms must be an array when provided"));
        }
      }
    }
    if (!Array.isArray(candidate?.evidence_refs) || candidate.evidence_refs.length === 0) {
      issues.push(issue("PKDB_INPUT_EVIDENCE_REQUIRED", `${base}.evidence_refs`, "at least one exact evidence ref is required"));
    }
    if (!Array.isArray(candidate?.provenance_refs)) {
      issues.push(issue("PKDB_INPUT_PROVENANCE_INVALID", `${base}.provenance_refs`, "provenance_refs must be an array"));
    }
    if (!["CREATE", "SUPERSEDE"].includes(candidate?.mode)) {
      issues.push(issue("PKDB_INPUT_MODE_INVALID", `${base}.mode`, "mode must be CREATE or SUPERSEDE"));
    }
    if (candidate?.mode === "SUPERSEDE") {
      if (typeof candidate?.existing_record_id !== "string" || candidate.existing_record_id.trim() === "") {
        issues.push(issue("PKDB_INPUT_EXISTING_RECORD_REQUIRED", `${base}.existing_record_id`, "SUPERSEDE requires existing_record_id"));
      }
      if (typeof candidate?.approved_change_basis !== "string" || candidate.approved_change_basis.trim() === "") {
        issues.push(issue("PKDB_INPUT_CHANGE_BASIS_REQUIRED", `${base}.approved_change_basis`, "semantic change requires an explicit approved change basis"));
      }
    }
    if (candidate?.source_address_changed === true) {
      if (candidate?.stable_semantic_identity !== true) {
        issues.push(issue("PKDB_PROVENANCE_IDENTITY_UNSTABLE", `${base}.stable_semantic_identity`, "source-address movement must preserve stable semantic identity"));
      }
      if (!Array.isArray(candidate?.provenance_update?.old_refs) || !Array.isArray(candidate?.provenance_update?.new_refs)) {
        issues.push(issue("PKDB_PROVENANCE_UPDATE_REQUIRED", `${base}.provenance_update`, "source-address movement requires old_refs and new_refs"));
      }
    }
  });
  return { issues, candidates };
}

export function buildPkdbInputProposal(operation, request, knowledgeEvidence) {
  const checked = validatePkdbInputCandidates(request);
  if (checked.issues.length > 0) return { issues: checked.issues, proposal: null };
  if (checked.candidates.length === 0) return { issues: [], proposal: null };
  const evidenceIssues = validateCandidateEvidenceBinding(checked.candidates, knowledgeEvidence);
  evidenceIssues.push(...validateSupersedeAndProvenanceBinding(checked.candidates, knowledgeEvidence));
  if (evidenceIssues.length > 0) return { issues: evidenceIssues, proposal: null };
  const proposal = {
    kind: "PKDB_INPUT_PROPOSAL",
    skillId: "K03_PKDB_INPUT_PROPOSAL",
    status: "PROPOSAL_ONLY_NOT_COMMITTED",
    operation,
    commitAuthority: "MT00_NUL_ONLY",
    standardInputPolicy: structuredClone(V0401_PKDB_STANDARD_INPUT_POLICY),
    candidates: structuredClone(checked.candidates),
    evidenceSummary: {
      accessDelivered: knowledgeEvidence?.accessDelivered === true,
      evidenceComplete: knowledgeEvidence?.evidenceComplete === true,
      semanticRecordCount: knowledgeEvidence?.semanticRecords?.length ?? 0,
      materializedSourceCount: knowledgeEvidence?.materializedSources?.length ?? 0
    }
  };
  return { issues: [], proposal };
}
