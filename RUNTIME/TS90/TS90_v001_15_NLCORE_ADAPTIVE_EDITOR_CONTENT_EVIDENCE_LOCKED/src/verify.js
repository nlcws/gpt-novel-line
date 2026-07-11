import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import {
  ADAPTIVE_EDITOR_LOCK_MANIFEST,
  FULL_REVISION_LOCK_MANIFEST,
  HISTORY_MASTER_REAPPLY_LOCK_MANIFEST,
  LOCK_MANIFEST,
  PHASE_SELF_DIRECTED_LOCK_MANIFEST,
  SOURCE_MANIFEST,
  TEXT_RECEIVE_LOCK_MANIFEST
} from "./program.js";

function check(entry) {
  const url = new URL(`../${entry.path}`, import.meta.url);
  const content = readFileSync(url);
  const bytes = statSync(url).size;
  const sha256 = createHash("sha256").update(content).digest("hex").toUpperCase();
  return Object.freeze({
    path: entry.path,
    expectedBytes: entry.bytes,
    actualBytes: bytes,
    expectedSha256: entry.sha256,
    actualSha256: sha256,
    identical: bytes === entry.bytes && sha256 === entry.sha256
  });
}

const sourceChecks = SOURCE_MANIFEST.map(check);
const lockChecks = LOCK_MANIFEST.map(check);
const textReceiveChecks = TEXT_RECEIVE_LOCK_MANIFEST.map(check);
const phaseSelfDirectedChecks = PHASE_SELF_DIRECTED_LOCK_MANIFEST.map(check);
const historyMasterReapplyChecks = HISTORY_MASTER_REAPPLY_LOCK_MANIFEST.map(check);
const fullRevisionChecks = FULL_REVISION_LOCK_MANIFEST.map(check);
const adaptiveEditorChecks = ADAPTIVE_EDITOR_LOCK_MANIFEST.map(check);
const sourceIdentical = sourceChecks.every((item) => item.identical);
const locksIdentical = lockChecks.every((item) => item.identical);
const textReceiveIdentical = textReceiveChecks.every((item) => item.identical);
const phaseSelfDirectedIdentical = phaseSelfDirectedChecks.every((item) => item.identical);
const historyMasterReapplyIdentical = historyMasterReapplyChecks.every((item) => item.identical);
const fullRevisionIdentical = fullRevisionChecks.every((item) => item.identical);
const adaptiveEditorIdentical = adaptiveEditorChecks.every((item) => item.identical);
const decision = sourceIdentical && locksIdentical && textReceiveIdentical && phaseSelfDirectedIdentical && historyMasterReapplyIdentical && fullRevisionIdentical && adaptiveEditorIdentical
  ? "SOURCE_AND_LOCKS_IDENTICAL"
  : "SOURCE_OR_LOCK_MISMATCH";
console.log(JSON.stringify({
  decision,
  sourceIdentical,
  locksIdentical,
  textReceiveIdentical,
  phaseSelfDirectedIdentical,
  historyMasterReapplyIdentical,
  fullRevisionIdentical,
  adaptiveEditorIdentical,
  sourceChecks,
  lockChecks,
  textReceiveChecks,
  phaseSelfDirectedChecks,
  historyMasterReapplyChecks,
  fullRevisionChecks,
  adaptiveEditorChecks
}, null, 2));
if (decision !== "SOURCE_AND_LOCKS_IDENTICAL") process.exit(1);
