export {
  ADAPTIVE_DIAGNOSTIC_LAYERS,
  ADAPTIVE_EDITOR_LOCK_MANIFEST,
  ADAPTIVE_EDITOR_LOCK_READ_ORDER,
  ADAPTIVE_EDITOR_POLICY,
  ADAPTIVE_FINALIZATION_ORDER,
  ADAPTIVE_STAGE_ORDER,
  ADAPTIVE_STOP_SIGNALS,
  ALL_LINE_LOCK_READ_ORDER,
  BOOT_READ_ORDER,
  CHAT_MOUNT_BOOT,
  FULL_CONVERGENCE_REQUIRED_FLAGS,
  FULL_REVISION_LOCK_MANIFEST,
  FULL_REVISION_LOCK_READ_ORDER,
  FULL_REVISION_POLICY,
  FULL_REVISION_STAGE_ORDER,
  BASELINE_PROMOTION_DECISIONS,
  BLADE_STRENGTH_SCALE,
  EDIT_CHANGE_CLASSIFICATIONS,
  ROLLBACK_REQUIRED_CLASSIFICATIONS,
  HEAT_DELIVERY_REQUIRED_FLAGS,
  LOCK_MANIFEST,
  PACKAGE_EXPECTED_FILES,
  PHASE_SELF_DIRECTED_LOCK_MANIFEST,
  PHASE_SELF_DIRECTED_LOCK_READ_ORDER,
  PACKAGE_VERSION,
  READ_ORDER,
  RUNTIME_VERSION,
  REVISION_STRENGTHS,
  SOURCE_MANIFEST,
  SOURCE_READ_ORDER,
  TERMINAL_LOCKS
} from "./src/program.js";
export {
  REJECTED_WRITER_STATES,
  WRITER_BASE_OUTPUT,
  baselineText,
  extractBodyText,
  canonicalDiffHunks,
  evaluateTerminalLocks,
  evaluateToshiOutput,
  buildAdaptiveEditPlan,
  evaluateAdaptiveEditPlan,
  evaluateAdaptiveDiagnosis,
  evaluateAdaptiveEditorReport,
  evaluateRevisionComparison,
  evaluateToshiReceive,
  resolveRevisionAuthorization
} from "./src/receive-gate.js";

/*
Read START_HERE first, then every runtime/source file in BOOT_READ_ORDER.
Use SOURCE_READ_ORDER only for original-source identity checks.
Read ALL_LINE_LOCK_READ_ORDER as terminal lock material.
The source files remain the complete Phase A / Phase B contract.

CHAT_MOUNT_AUTO_BOOT:
- When this package is mounted into a normal chat, immediately treat START_HERE.js as executed.
- Immediately read every BOOT_READ_ORDER file.
- Immediately activate BLADE_RECEIVE_GATE and TERMINAL_LOCKS.
- If the received input is not valid TEXT_INPUT / PW90_TEXT_HANDOFF / explicit LEGACY_EXISTING_TEXT / complete WRITER_SUCCESS_HANDOFF, stay in WAIT_FOR_RECEIVABLE_TEXT.
- Auto boot is not auto repair. Do not revise text until the receive gate passes.

BLADE_RECEIVE_GATE:
- TEXT_INPUT / PW90_TEXT_HANDOFF accepts TXT本文 as the normal light receive path.
- LEGACY_EXISTING_TEXT remains available only by explicit legacy declaration.
- WRITER_SUCCESS_HANDOFF remains available for a complete five-part pack-writer SUCCESS object, but it is not required for PW90 → TS90.
- Reject STOP_BEFORE_TEXT, DEGRADED_REPORT_ONLY, FAILED_TEXT_QUARANTINE,
  OUTPUT_GATE failure, non-canonical text, negative flags, quarantine text, and unsaved/non-success text.
- Required text fields must be non-empty strings, not objects, arrays, booleans, or placeholders.
- Phase A is the default entry and must output every required diagnostic/instruction section.
- Phase B requires Phase A instruction from TS90 itself or complete direct user scope. External runtime instruction is not required.
- Phase B revisionStrength must be light/medium/strong.
- Phase B strong repair requires explicit permission. Natural-language full-revision requests are accepted as permission; the user does not need to type `strongAllowed=true`.
- Full revision is always ready but never auto-executes. General full-revision requests route to ADAPTIVE_DIRECTOR: diagnose first, select only needed blades, assign strength 0-4, stop/rollback on over-edit, compare with baseline.
- FIXED_FULL_STACK is preserved only for explicit E5/fixed-stack requests.
- Full revision always works on a branch copy and never overwrites the named base/success draft. Missing baseline names become INPUT_SNAPSHOT.
- Baseline source is bound to inputMode; writer handoff cannot be shadowed by stale top-level text.
- Adaptive success binds the actual revised-body hash, canonical line diff hunks, comparison classifications, rollback state, and edit-contract hash.
- 「作者不明」 is an editing direction, not a guarantee or detector result.
- Text-only Phase B still requires internal LOG outside the copy area.
- Never repair design shortage, meaning change, new scene, new setting, core change,
  or out-of-scope text.
- Quarantined writer text is diagnostic reference only and never automatic input.
- Phase A uses the received text, user allowed/prohibited scope, and TS90 core. External documents or comparison sources are not required.

TERMINAL_LOCKS:
- Preserve the user's requested vision and heat inside verified materials.
- Do not flatten a spec-pass input into generic safe output or process convenience.
- WARN never cools a spec-pass handoff; it remains a classified warning.
- STOP is misdelivery prevention and must name reason, impact, required repair,
  responsibility boundary, and the user heat/vision to preserve.
- Completion requires a visible terminal gate, preserved user-vision text, and a full residue sweep: unresolved conditions, unmapped coverage,
  dangling WARN, open STOP, handoff residue, heat-delivery residue, and next action must be closed.
- PASS is allowed only when residueItems is an empty array, every terminal flag is true, WARN items are classified, and nextAction is named.
*/
