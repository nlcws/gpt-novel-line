import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ADAPTIVE_EDITOR_LOCK_MANIFEST,
  BOOT_READ_ORDER,
  FULL_REVISION_LOCK_MANIFEST,
  HISTORY_MASTER_REAPPLY_LOCK_MANIFEST,
  LOCK_MANIFEST,
  NOVEL_LINE_CORE_MANIFEST,
  PHASE_SELF_DIRECTED_LOCK_MANIFEST,
  PACKAGE_EXPECTED_FILES,
  PACKAGE_VERSION,
  RUNTIME_VERSION,
  SOURCE_MANIFEST,
  TEXT_RECEIVE_LOCK_MANIFEST
} from "./program.js";

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(here, "..");
const expected = new Set(PACKAGE_EXPECTED_FILES);

function walk(dir, root = packageRoot) {
  const entries = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const rel = relative(root, path).replaceAll("\\", "/");
    const stat = statSync(path);
    if (stat.isDirectory()) entries.push(...walk(path, root));
    else entries.push(rel);
  }
  return entries.sort();
}

function manifestEntriesEqual(actual, expectedEntries) {
  if (!Array.isArray(actual) || actual.length !== expectedEntries.length) return false;
  const normalize = (items) => items
    .map((entry) => ({ path: entry.path, bytes: entry.bytes, sha256: entry.sha256 }))
    .sort((a, b) => a.path.localeCompare(b.path));
  return JSON.stringify(normalize(actual)) === JSON.stringify(normalize(expectedEntries));
}

const files = walk(packageRoot);
const nestedZips = files.filter((path) => path.toLowerCase().endsWith(".zip"));
const missing = [...expected].filter((path) => !files.includes(path)).sort();
const extra = files.filter((path) => !expected.has(path)).sort();
let manifestValid = false;
let manifestRuntime = null;
let manifestPackageVersion = null;
let manifestLocks = [];
let manifestSources = [];
let packageJsonValid = false;
let manifestNovelLineCore = [];
let bootOrderValid = false;
let manifestTextReceiveLocks = [];
let manifestPhaseSelfDirectedLocks = [];
let manifestHistoryMasterReapplyLocks = [];
let manifestFullRevisionLocks = [];
let manifestAdaptiveEditorLocks = [];
try {
  const manifest = JSON.parse(readFileSync(join(packageRoot, "manifest.json"), "utf8"));
  const packageJson = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
  manifestRuntime = manifest.runtime;
  manifestPackageVersion = manifest.package_version;
  manifestLocks = manifest.all_line_locks ?? [];
  manifestNovelLineCore = manifest.novel_line_core_locks ?? [];
  manifestTextReceiveLocks = manifest.text_receive_locks ?? [];
  manifestPhaseSelfDirectedLocks = manifest.phase_self_directed_locks ?? [];
  manifestHistoryMasterReapplyLocks = manifest.history_master_reapply_locks ?? [];
  manifestFullRevisionLocks = manifest.full_revision_locks ?? [];
  manifestAdaptiveEditorLocks = manifest.adaptive_editor_locks ?? [];
  manifestSources = manifest.source_manifest ?? [];
  packageJsonValid = packageJson.version === "1.15.0" && packageJson.type === "module" &&
    packageJson.scripts?.test === "node test/runtime.test.js" &&
    packageJson.scripts?.verify === "node src/verify.js" &&
    packageJson.scripts?.["verify:package"] === "node src/verify-package.js";
  bootOrderValid = JSON.stringify(manifest.boot_read_order) === JSON.stringify(BOOT_READ_ORDER);
  manifestValid = manifest.runtime === RUNTIME_VERSION &&
    manifest.package_version === PACKAGE_VERSION &&
    manifest.nested_zips === 0 &&
    manifest.source_unchanged === true &&
    manifestEntriesEqual(manifestLocks, LOCK_MANIFEST) &&
    manifestEntriesEqual(manifestSources, SOURCE_MANIFEST) &&
    manifestEntriesEqual(manifestNovelLineCore, NOVEL_LINE_CORE_MANIFEST) &&
    manifestEntriesEqual(manifestTextReceiveLocks, TEXT_RECEIVE_LOCK_MANIFEST) &&
    manifestEntriesEqual(manifestPhaseSelfDirectedLocks, PHASE_SELF_DIRECTED_LOCK_MANIFEST) &&
    manifestEntriesEqual(manifestHistoryMasterReapplyLocks, HISTORY_MASTER_REAPPLY_LOCK_MANIFEST) &&
    manifestEntriesEqual(manifestFullRevisionLocks, FULL_REVISION_LOCK_MANIFEST) &&
    manifestEntriesEqual(manifestAdaptiveEditorLocks, ADAPTIVE_EDITOR_LOCK_MANIFEST) &&
    bootOrderValid &&
    packageJsonValid;
} catch {
  manifestValid = false;
}

const decision = missing.length === 0 && extra.length === 0 && nestedZips.length === 0 && manifestValid
  ? "PACKAGE_STRUCTURE_OK"
  : "PACKAGE_STRUCTURE_MISMATCH";

console.log(JSON.stringify({
  decision,
  root: packageRoot,
  runtime: RUNTIME_VERSION,
  packageVersion: PACKAGE_VERSION,
  manifestRuntime,
  manifestPackageVersion,
  manifestSources,
  manifestLocks,
  manifestNovelLineCore,
  manifestTextReceiveLocks,
  manifestPhaseSelfDirectedLocks,
  manifestHistoryMasterReapplyLocks,
  manifestFullRevisionLocks,
  manifestAdaptiveEditorLocks,
  files,
  missing,
  extra,
  nestedZips,
  manifestValid,
  bootOrderValid,
  packageJsonValid
}, null, 2));
if (decision !== "PACKAGE_STRUCTURE_OK") process.exit(1);
