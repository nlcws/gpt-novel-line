const issue = (code, path, message, severity = "STOP") => ({ code, path, message, severity });

function recordId(record) {
  return record?.record_id ?? record?.recordId ?? record?.id ?? null;
}

function payloadOf(record) {
  return record?.payload && typeof record.payload === "object" && !Array.isArray(record.payload)
    ? record.payload : {};
}

export function validateShelfPointer(pointer, path = "shelf_pointer") {
  const issues = [];
  if (typeof pointer !== "string" || pointer.trim() === "") {
    issues.push(issue("SHELF_POINTER_REQUIRED", path, "current project shelf pointer is required"));
    return issues;
  }
  const value = pointer.replaceAll("\\", "/");
  if (value.startsWith("/") || /^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(value) || value.split("/").includes("..")) {
    issues.push(issue("SHELF_POINTER_UNSAFE", path, "shelf pointer must be a current-mount relative path, not an URI/absolute/traversal path"));
  }
  if (/^(legacy|runtime)-archive:/i.test(value)) {
    issues.push(issue("SHELF_POINTER_ARCHIVE_LOCATOR_FORBIDDEN", path, "archive/provenance locator cannot act as current shelf pointer"));
  }
  return issues;
}

function currentMountSourceLocator(record) {
  if (record?.record_type !== "SOURCE" && record?.recordType !== "SOURCE") return null;
  const locator = payloadOf(record).locator;
  if (typeof locator !== "string" || locator.trim() === "") return null;
  const value = locator.replaceAll("\\", "/");
  // URI locators are provenance/materialize routes, not current project mount pointers.
  if (/^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(value)) return null;
  return value;
}

export function extractShelfPointers(semanticRecords) {
  const issues = [];
  const pointers = [];
  const seen = new Set();
  for (const [index, record] of (semanticRecords ?? []).entries()) {
    const payload = payloadOf(record);
    const explicitPointer = payload.shelf_pointer ?? payload.shelfPointer ?? payload.current_shelf_pointer ?? null;
    const sourceLocator = explicitPointer == null ? currentMountSourceLocator(record) : null;
    const pointer = explicitPointer ?? sourceLocator;
    if (pointer == null) continue;
    const pathLabel = explicitPointer != null
      ? `semanticRecords[${index}].payload.shelf_pointer`
      : `semanticRecords[${index}].payload.locator`;
    const pointerIssues = validateShelfPointer(pointer, pathLabel);
    issues.push(...pointerIssues);
    if (pointerIssues.length > 0) continue;
    const normalized = pointer.replaceAll("\\", "/");
    const sourcePointer = explicitPointer != null
      ? (payload.source_pointer ?? payload.sourcePointer ?? payload.section_pointer ?? null)
      : (payload.selection ?? null);
    const expectedSha256 = sourceLocator != null ? payload.sha256 : (payload.shelf_sha256 ?? payload.shelfSha256 ?? null);
    if (sourceLocator != null && !/^[a-f0-9]{64}$/.test(expectedSha256 ?? "")) {
      issues.push(issue(
        "CURRENT_SOURCE_LOCATOR_SHA256_REQUIRED",
        `semanticRecords[${index}].payload.sha256`,
        "schema-legal current SOURCE locator must bind the exact current shelf bytes with lowercase SHA-256"
      ));
      continue;
    }
    const firstSegment = normalized.split("/", 1)[0];
    const shelfId = payload.shelf_id ?? payload.shelfId ?? firstSegment.replace(/_v\d+$/i, "");
    const key = `${normalized}\u0000${JSON.stringify(sourcePointer ?? null)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    pointers.push({
      recordId: recordId(record),
      shelfId,
      shelfPointer: normalized,
      sourcePointer,
      expectedSha256,
      locatorMode: explicitPointer != null ? "SHELF_POINTER_FIELD" : "CURRENT_MOUNT_SOURCE_LOCATOR",
      status: record?.status ?? null,
      aliases: [...(record?.aliases ?? [])],
      searchTerms: [...(record?.search_terms ?? record?.searchTerms ?? [])]
    });
  }
  return { issues, pointers };
}

export function validateIndexGraph(index) {
  if (index == null) return { decision: "PASS", issues: [], repairs: [] };
  return {
    decision: "STOP",
    issues: [issue(
      "LOCAL_TAG_GRAPH_DEPRECATED_V0401",
      "index",
      "v0401 keeps INDEX/SEARCH in DS90 but uses PKDB as the tag locator backend; local reconstructed project graph is not the standard authority"
    )],
    repairs: []
  };
}
