import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { validateFullPowerPreWriteGate } from "./full-power-write-lock.js";

export const WRITABLE_STORY_PACK_GATE_ID = "WRITABLE_ZIP_STORY_PACK_MINIMUM_GATE";
export const WRITABLE_STORY_PACK_INPUT_MODE = "WRITABLE_ZIP_STORY_PACK";
export const WRITABLE_STORY_PACK_CONTRACT_ID = "WRITER_ACCEPTS_WRITABLE_ZIP_PACK";

export const WRITER_CORE_INVARIANT = Object.freeze({
  id: "WRITER_COLLECTS_ALL_PACK_CONDITIONS_AND_WRITES_TEXT",
  acceptsChatInputAsStoryPack: false,
  acceptsZipPack: true,
  rejectsByDesignerVersion: false,
  rejectsByFormatLuxury: false,
  coreDuty: "collect_all_conditions_inside_the_story_pack_and_write_novel_text",
  handoffBasis: "artifact_based_not_code_or_version_based"
});

export const CANONICAL_FORMAT_STATUS = Object.freeze({
  latestCanonicalStoryPack: "best_for_reproducibility_and_audit",
  minimumStoryPack: "zip_pack_with_writable_story_material",
  missingReadyV2LayerFrozenManifest: "warn_not_reject_when_material_is_writable"
});

const TEXT_EXTENSIONS = Object.freeze([
  ".txt", ".md", ".markdown", ".json", ".jsonl", ".yaml", ".yml", ".csv", ".tsv"
]);

const fail = (code, path, detail = null) => detail == null ? { code, path } : { code, path, detail };
const warn = (code, path, detail = null) => detail == null ? { code, path } : { code, path, detail };

function pathIsSafe(rel) {
  return typeof rel === "string" && rel.trim() !== "" &&
    !rel.startsWith("/") && !rel.includes("\\") &&
    !rel.split("/").some((part) => part === "" || part === "." || part === "..");
}

function listFilesRecursive(root) {
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      const rel = relative(root, path).replaceAll("\\", "/");
      const st = statSync(path);
      if (st.isDirectory()) walk(path);
      else out.push(rel);
    }
  };
  walk(root);
  return out.sort();
}

function extOf(rel) {
  const lower = rel.toLowerCase();
  return TEXT_EXTENSIONS.find((ext) => lower.endsWith(ext)) ?? null;
}

function readUtf8(path) {
  const content = readFileSync(path, "utf8");
  if (content.includes("\uFFFD")) throw new Error("replacement character detected");
  return content;
}

function hasWritableSignal(content) {
  if (typeof content !== "string") return false;
  const stripped = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[{}\[\]",:]/g, " ")
    .trim();
  return stripped.length >= 1;
}

function materialIdFor(rel, index) {
  const safe = rel.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 64) || `TEXT_${index + 1}`;
  return `PACK_CONDITION_${String(index + 1).padStart(3, "0")}_${safe}`;
}

function buildShelves(textMaterials) {
  return Object.freeze({
    RESTORE_SOURCE: Object.freeze(textMaterials.map((entry, index) => Object.freeze({
      material_id: materialIdFor(entry.path, index),
      path: entry.path,
      writer_use: "RESTORE_SOURCE",
      canonical_state: "FROZEN",
      read_required: true,
      content: entry.content
    }))),
    RESTORE_CONSTRAINT: Object.freeze([]),
    PROCESS_ONLY: Object.freeze([]),
    OUTPUT_CONTRACT: Object.freeze([]),
    REFERENCE_ONLY: Object.freeze([]),
    DENY_AS_BODY_SOURCE: Object.freeze([])
  });
}

export function inspectWritableStoryPackDirectory(root, options = {}) {
  const failures = [];
  const warnings = [];
  if (options.chatInput === true || options.inputKind === "CHAT") {
    return Object.freeze({
      gate: WRITABLE_STORY_PACK_GATE_ID,
      inspectDecision: "WRITABLE_STORY_PACK_REJECTED",
      writeDecision: "STOP_BEFORE_TEXT",
      inputKind: "CHAT",
      failures: Object.freeze([fail("CHAT_INPUT_NOT_ACCEPTED_AS_RUNTIME_STORY_PACK", "input")]),
      warnings: Object.freeze([]),
      textMaterialCount: 0,
      conditionSourceFiles: Object.freeze([]),
      shelves: null
    });
  }
  if (typeof root !== "string" || root.trim() === "" || !existsSync(root) || !statSync(root).isDirectory()) {
    return Object.freeze({
      gate: WRITABLE_STORY_PACK_GATE_ID,
      inspectDecision: "WRITABLE_STORY_PACK_SHAPE_FAILED",
      writeDecision: "STOP_BEFORE_TEXT",
      inputKind: "ZIP_PACK_DIRECTORY",
      failures: Object.freeze([fail("PACK_ROOT_DIRECTORY_MISSING", "root")]),
      warnings: Object.freeze([]),
      textMaterialCount: 0,
      conditionSourceFiles: Object.freeze([]),
      shelves: null
    });
  }

  const files = listFilesRecursive(root);
  if (files.length === 0) failures.push(fail("PACK_EMPTY", "root"));
  for (const rel of files) {
    if (!pathIsSafe(rel)) failures.push(fail("PACK_PATH_UNSAFE", rel));
    if (rel.toLowerCase().endsWith(".zip")) warnings.push(warn("NESTED_ZIP_PRESENT_REFERENCE_ONLY", rel));
  }

  const textMaterials = [];
  for (const rel of files) {
    if (extOf(rel) == null) continue;
    try {
      const content = readUtf8(join(root, rel));
      if (content.startsWith("\uFEFF")) warnings.push(warn("BOM_PRESENT_WARN", rel));
      if (content.includes("\r")) warnings.push(warn("CRLF_PRESENT_WARN", rel));
      if (hasWritableSignal(content)) textMaterials.push({ path: rel, content });
      else warnings.push(warn("TEXT_FILE_EMPTY_OR_NO_WRITABLE_SIGNAL", rel));
    } catch (error) {
      failures.push(fail("TEXT_FILE_UNREADABLE", rel, error.message));
    }
  }

  if (textMaterials.length === 0) failures.push(fail("WRITABLE_TEXT_MATERIAL_MISSING", "root"));

  const hasCanonicalReady = files.some((rel) => /(^|\/)01_ready\.md$/.test(rel));
  const hasCanonicalV2 = files.some((rel) => /(^|\/)02_v2\.md$/.test(rel));
  const hasCanonicalLayer = files.some((rel) => /(^|\/)03_layer\.md$/.test(rel));
  const hasCanonicalFrozen = files.some((rel) => /(^|\/)05_frozen\.md$/.test(rel));
  const hasManifest = files.some((rel) => /(^|\/)(99_)?manifest\.json$/.test(rel) || /(^|\/)manifest\.json$/.test(rel));
  if (!hasCanonicalReady || !hasCanonicalV2 || !hasCanonicalLayer || !hasCanonicalFrozen || !hasManifest) {
    warnings.push(warn("NON_CANONICAL_BUT_WRITABLE_PACK_FORMAT", "root", {
      ready: hasCanonicalReady,
      v2: hasCanonicalV2,
      layer: hasCanonicalLayer,
      frozen: hasCanonicalFrozen,
      manifest: hasManifest
    }));
  }

  const shelves = failures.length === 0 ? buildShelves(textMaterials) : null;
  return Object.freeze({
    gate: WRITABLE_STORY_PACK_GATE_ID,
    contract: WRITABLE_STORY_PACK_CONTRACT_ID,
    inspectDecision: failures.length === 0 ? "WRITABLE_STORY_PACK_INSPECT_OK" : "WRITABLE_STORY_PACK_SHAPE_FAILED",
    writeDecision: failures.length === 0 ? "WRITABLE_STORY_PACK_WRITE_READY" : "STOP_BEFORE_TEXT",
    inputKind: "ZIP_PACK_DIRECTORY",
    minimumDefinitionSatisfied: failures.length === 0,
    canonicalFormatRequired: false,
    designerVersionRequired: false,
    chatInputAccepted: false,
    failures: Object.freeze(failures),
    warnings: Object.freeze(warnings),
    textMaterialCount: textMaterials.length,
    conditionSourceFiles: Object.freeze(textMaterials.map((entry) => entry.path)),
    shelves
  });
}

export function evaluateWritableStoryPackPreWrite(input = {}) {
  const failures = [];
  if (input.activation?.input_mode !== WRITABLE_STORY_PACK_INPUT_MODE) failures.push(fail("WRITABLE_STORY_PACK_INPUT_MODE_REQUIRED", "activation.input_mode"));
  if (input.activation?.input_kind === "CHAT" || input.chatInput === true) failures.push(fail("CHAT_INPUT_NOT_ACCEPTED_AS_RUNTIME_STORY_PACK", "input"));
  const result = input.writableStoryPackResult;
  if (result?.inspectDecision !== "WRITABLE_STORY_PACK_INSPECT_OK") failures.push(fail("WRITABLE_STORY_PACK_INSPECT_NOT_OK", "writableStoryPackResult.inspectDecision"));
  if (result?.writeDecision !== "WRITABLE_STORY_PACK_WRITE_READY") failures.push(fail("WRITABLE_STORY_PACK_NOT_WRITE_READY", "writableStoryPackResult.writeDecision"));
  const shelves = result?.shelves ?? null;
  if (shelves == null || (shelves.RESTORE_SOURCE ?? []).length === 0) failures.push(fail("WRITABLE_PACK_CONDITIONS_UNRESOLVED", "writableStoryPackResult.shelves.RESTORE_SOURCE"));
  const pickupConditionIds = shelves == null ? [] : (shelves.RESTORE_SOURCE ?? []).map((entry, index) => `REQ_PACK_${String(index + 1).padStart(3, "0")}`);
  failures.push(...validateFullPowerPreWriteGate({ gate: input.fullPowerWriteGate, pickupConditionIds }));
  return Object.freeze({
    decision: failures.length === 0 ? "WRITE_ALLOWED" : "STOP_BEFORE_TEXT",
    state: failures.length === 0 ? "WRITE_ALLOWED" : "WRITABLE_STORY_PACK_GATE",
    failures: Object.freeze(failures),
    shelves: failures.length === 0 ? shelves : null,
    pickupConditionIds: failures.length === 0 ? Object.freeze(pickupConditionIds) : Object.freeze([]),
    fullPowerWritePlan: failures.length === 0 ? Object.freeze([...(input.fullPowerWriteGate?.sceneConstructionPlan ?? [])]) : Object.freeze([]),
    deliveryIntent: failures.length === 0 ? Object.freeze({ requestedVision: "story pack conditions", nonDroppableCore: "all readable story-pack conditions", forbiddenLineFocus: "do not invent outside the pack", endpoint: "write novel text from pack" }) : null
  });
}
