const issue = (code, path, message) => ({ code, path, message, severity: "STOP" });

export const TAG_QUERY_KINDS = Object.freeze(new Set([
  "SEARCH_TERM", "ALIAS", "CANONICAL_NAME", "RECORD_ID", "LOGICAL_ID"
]));

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toQuery(kind, value) {
  return {
    query_schema_version: "PKDB_QUERY_SCHEMA_v003",
    lookup: { channel: kind, value },
    filters: { record_types: ["SOURCE"], statuses: ["CONFIRMED", "HOLD", "UNKNOWN"], reference_all: [] },
    scope_context: [],
    cardinality: "MANY",
    lineage_mode: "ACTIVE"
  };
}

export function normalizeTagSearchIntent(search) {
  const issues = [];
  const intents = Array.isArray(search?.intents) ? search.intents : [];
  if (intents.length === 0) {
    issues.push(issue(
      "TAG_SEARCH_MACHINE_INTENT_REQUIRED",
      "search.intents",
      "TAG_SEARCH requires DS90-side machine intents; runtime must not guess PKDB query meaning from natural language"
    ));
    return { issues, intents: [] };
  }
  const out = [];
  const seen = new Set();
  for (const [index, intent] of intents.entries()) {
    const kind = text(intent?.kind).toUpperCase();
    const value = text(intent?.value);
    if (!TAG_QUERY_KINDS.has(kind)) {
      issues.push(issue("TAG_SEARCH_INTENT_KIND_INVALID", `search.intents[${index}].kind`, "unsupported machine lookup kind"));
      continue;
    }
    if (!value) {
      issues.push(issue("TAG_SEARCH_INTENT_VALUE_REQUIRED", `search.intents[${index}].value`, "machine lookup value is required"));
      continue;
    }
    const key = `${kind}\u0000${value}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ kind, value, required: intent?.required !== false });
  }
  return { issues, intents: out };
}

export function buildPkdbTagClauses(search, { clauseStart = 1, deliveryLimit = 5000, projectionMode = "PAYLOAD_ONLY" } = {}) {
  const normalized = normalizeTagSearchIntent(search);
  if (normalized.issues.length > 0) return { issues: normalized.issues, clauses: [] };
  const limit = Number.isInteger(search?.deliveryLimit) && search.deliveryLimit >= 1 && search.deliveryLimit <= 100000
    ? search.deliveryLimit : deliveryLimit;
  const requestedProjection = ["PAYLOAD_ONLY", "FULL_RECORD"].includes(search?.projectionMode)
    ? search.projectionMode : projectionMode;
  return {
    issues: [],
    clauses: normalized.intents.map((intent, index) => ({
      clause_id: `Q${String(clauseStart + index).padStart(4, "0")}`,
      required: intent.required,
      query: toQuery(intent.kind, intent.value),
      delivery_limit: limit,
      projection: { mode: requestedProjection }
    }))
  };
}

export function searchTagRegistry(search, semanticRecords = []) {
  const normalized = normalizeTagSearchIntent(search);
  const records = Array.isArray(semanticRecords) ? semanticRecords : [];
  const matches = records.map((record) => ({
    record_id: record?.record_id ?? record?.recordId ?? null,
    record_type: record?.record_type ?? record?.recordType ?? null,
    status: record?.status ?? null,
    canonical_name: record?.canonical_name ?? record?.canonicalName ?? null,
    aliases: [...(record?.aliases ?? [])],
    search_terms: [...(record?.search_terms ?? record?.searchTerms ?? [])],
    payload: structuredClone(record?.payload ?? {})
  }));
  return {
    decision: normalized.issues.length === 0 ? "PASS" : "STOP",
    issues: normalized.issues,
    output: {
      query: search?.query ?? null,
      intents: normalized.intents,
      matches,
      rule: "PKDB records are lookup metadata only; shelf contents remain source/canon authority"
    }
  };
}
