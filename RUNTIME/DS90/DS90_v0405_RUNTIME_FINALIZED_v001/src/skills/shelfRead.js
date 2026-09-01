import { createHash } from "node:crypto";
import { isTrustedTextualMediaType } from "../adapters/pkdbHostAdapter.js";
import { validateShelfPointer } from "../indexing/validator.js";

const issue = (code, path, message) => ({ code, path, message, decision: "STOP", nonOverrideable: true });

function canonicalBase64(value) {
  return typeof value === "string" && value.length % 4 === 0 &&
    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value);
}

export function buildShelfReadAction(pointers, makeActionId) {
  const issues = [];
  const items = [];
  const seen = new Set();
  for (const [index, pointer] of (pointers ?? []).entries()) {
    const pathIssues = validateShelfPointer(pointer?.shelfPointer, `shelfPointers[${index}].shelfPointer`);
    issues.push(...pathIssues.map((entry) => issue(entry.code, entry.path, entry.message)));
    if (pathIssues.length > 0) continue;
    if (seen.has(pointer.shelfPointer)) continue;
    seen.add(pointer.shelfPointer);
    items.push({
      itemId: `F${String(items.length + 1).padStart(4, "0")}`,
      shelfId: pointer.shelfId ?? null,
      shelfPointer: pointer.shelfPointer,
      sourcePointer: pointer.sourcePointer ?? null,
      locatorRecordId: pointer.recordId ?? null,
      expectedSha256: pointer.expectedSha256 ?? null,
      required: true
    });
  }
  if (items.length === 0) {
    issues.push(issue("SHELF_READ_POINTERS_REQUIRED", "shelfPointers", "at least one current project shelf pointer is required"));
    return { issues, action: null };
  }
  const actionId = makeActionId("SHELF_READ");
  return {
    issues,
    action: {
      actionId,
      actionType: "SHELF_READ",
      skillId: "K04_PROJECT_SHELF_READ_REQUEST",
      sourceAuthority: "CURRENT_PROJECT_MOUNT",
      items,
      transformAllowed: false,
      expectedResult: {
        decision: "DELIVERED_OR_BLOCKED",
        bytes: "BASE64_WITH_SHA256",
        pathBinding: "EXACT_REQUESTED_CURRENT_SHELF_POINTERS"
      }
    }
  };
}

function decodeRead(item, index) {
  const issues = [];
  const base = `hostResult.reads[${index}]`;
  const pointerIssues = validateShelfPointer(item?.shelfPointer, `${base}.shelfPointer`);
  issues.push(...pointerIssues.map((entry) => issue(entry.code, entry.path, entry.message)));
  if (!canonicalBase64(item?.contentBase64)) {
    issues.push(issue("SHELF_READ_BASE64_INVALID", `${base}.contentBase64`, "shelf bytes must be canonical RFC4648 base64"));
    return { issues, evidence: null };
  }
  const bytes = Buffer.from(item.contentBase64, "base64");
  if (bytes.toString("base64") !== item.contentBase64) {
    issues.push(issue("SHELF_READ_BASE64_NONCANONICAL", `${base}.contentBase64`, "shelf bytes must round-trip canonically"));
  }
  const sha = createHash("sha256").update(bytes).digest("hex");
  if (typeof item?.sha256 !== "string" || item.sha256 !== sha) {
    issues.push(issue("SHELF_READ_SHA_MISMATCH", `${base}.sha256`, "shelf read SHA-256 mismatch"));
  }
  if (!Number.isInteger(item?.declaredBytes) || item.declaredBytes !== bytes.length) {
    issues.push(issue("SHELF_READ_BYTE_LENGTH_MISMATCH", `${base}.declaredBytes`, "shelf read byte length mismatch"));
  }
  if (item?.transformed !== false) {
    issues.push(issue("SHELF_READ_TRANSFORM_FORBIDDEN", `${base}.transformed`, "current shelf source bytes must be returned without transformation"));
  }
  const mediaType = typeof item?.mediaType === "string" ? item.mediaType : "application/octet-stream";
  const textual = isTrustedTextualMediaType(mediaType);
  let text = null;
  if (textual) {
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      issues.push(issue("SHELF_READ_UTF8_INVALID", base, "textual current shelf content must be valid UTF-8"));
    }
  }
  return {
    issues,
    evidence: {
      shelfId: item?.shelfId ?? null,
      shelfPointer: item?.shelfPointer ?? null,
      sourcePointer: item?.sourcePointer ?? null,
      sha256: sha,
      byteLength: bytes.length,
      mediaType,
      textual,
      utf8Read: textual ? text != null : null,
      text
    }
  };
}

export function validateShelfReadResult(action, result) {
  const issues = [];
  if (result?.actionId !== action?.actionId || result?.actionType !== "SHELF_READ") {
    issues.push(issue("SHELF_READ_RESULT_ACTION_MISMATCH", "hostResult", "shelf read result does not match the pending action"));
    return { issues, evidence: [] };
  }
  if (result?.decision === "BLOCKED") {
    issues.push(issue("SHELF_READ_BLOCKED", "hostResult.decision", "required current project shelf bytes could not be read"));
    return { issues, evidence: [] };
  }
  if (result?.decision !== "DELIVERED" || !Array.isArray(result?.reads)) {
    issues.push(issue("SHELF_READ_RESULT_INVALID", "hostResult", "shelf read result must be DELIVERED with reads[]"));
    return { issues, evidence: [] };
  }
  const expected = new Map(action.items.map((entry) => [entry.shelfPointer, entry]));
  const delivered = new Map();
  for (const [index, item] of result.reads.entries()) {
    if (!expected.has(item?.shelfPointer)) {
      issues.push(issue("SHELF_READ_UNREQUESTED_PATH", `hostResult.reads[${index}].shelfPointer`, "host returned an unrequested shelf path"));
      continue;
    }
    if (delivered.has(item.shelfPointer)) {
      issues.push(issue("SHELF_READ_DUPLICATE_PATH", `hostResult.reads[${index}].shelfPointer`, "host returned the same shelf path more than once"));
      continue;
    }
    const checked = decodeRead(item, index);
    issues.push(...checked.issues);
    if (checked.evidence && typeof expected.get(item.shelfPointer)?.expectedSha256 === "string" &&
        checked.evidence.sha256 !== expected.get(item.shelfPointer).expectedSha256) {
      issues.push(issue(
        "SHELF_READ_LOCATOR_SHA_MISMATCH",
        `hostResult.reads[${index}].sha256`,
        "current shelf bytes do not match the SHA-256 bound by the PKDB locator record"
      ));
    }
    if (checked.evidence) delivered.set(item.shelfPointer, checked.evidence);
  }
  for (const item of action.items) {
    if (!delivered.has(item.shelfPointer)) {
      issues.push(issue("SHELF_READ_REQUIRED_PATH_MISSING", "hostResult.reads", `${item.shelfPointer} was not delivered`));
    }
  }
  return { issues, evidence: [...delivered.values()] };
}
