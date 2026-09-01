import { READ_ORDER } from "./program.js";

export const ACTIVE_RUNTIME_CONTRACT = Object.freeze({
  id: "REQUIRED_SET_HARD_BINDING_ADAPTER",
  sourceContract: Object.freeze([...READ_ORDER]),
  sourceFilesFormOneContract: true,
  successOutputSequence: Object.freeze([
    "filename_line",
    "target_length_or_self_bound",
    "frozen_condition_table_short",
    "text",
    "本文後LOG"
  ]),
  deniedSuccessOutputs: Object.freeze([
    "text_only",
    "text_plus_saved_line_only",
    "missing_frozen_condition_table_short",
    "missing_target_length_or_self_bound",
    "missing_本文後LOG",
    "extra_unactivated_success_fields",
    "degraded_text",
    "custom_pack_extension_output"
  ]),
  stopBeforeTextOnContractFailure: true
});

export const INITIAL_MOUNT_ASSERTIONS = Object.freeze([
  "mount_integrity_checked",
  "all_read_order_files_readable_and_read",
  "source_identity_verified",
  "active_runtime_contract_constructed",
  "pack_writer_success_output_contract_resolved",
  "nom_detail_pack_writer_require_output_adopted"
]);

export const WRITE_CYCLE_ASSERTIONS = Object.freeze([
  "flow_1_to_11_completed",
  "frozen_condition_table_short_generated_from_current_story_cycle",
  "current_cycle_reread_confirmed",
  "memory_filename_summary_not_used_as_read"
]);

export const BOOT_ASSERTIONS = Object.freeze([
  ...INITIAL_MOUNT_ASSERTIONS,
  ...WRITE_CYCLE_ASSERTIONS
]);

function checkReadLedger(readLedger, failures) {
  for (const path of READ_ORDER) {
    const entry = readLedger.find((item) => item.path === path);
    if (entry?.exists !== true || entry?.read !== true) {
      failures.push({ assertion: "all_read_order_files_readable_and_read", path });
    }
  }
}

export function evaluateInitialMountBinding(state = {}) {
  const readLedger = state.readLedger ?? [];
  const failures = [];
  checkReadLedger(readLedger, failures);

  const requiredFlags = Object.freeze({
    mountIntegrityChecked: "mount_integrity_checked",
    sourceIdentityVerified: "source_identity_verified",
    activeRuntimeContractConstructed: "active_runtime_contract_constructed",
    successOutputContractResolved: "pack_writer_success_output_contract_resolved",
    nomDetailPackWriterOutputAdopted: "nom_detail_pack_writer_require_output_adopted"
  });

  for (const [field, assertion] of Object.entries(requiredFlags)) {
    if (state[field] !== true) failures.push({ assertion, field });
  }

  return Object.freeze({
    decision: failures.length === 0 ? "ACTIVE_RUNTIME_BOOTED" : "STOP_AT_INITIAL_MOUNT",
    booted: failures.length === 0,
    writeTextAllowed: false,
    activeSuccessOutputSequence: ACTIVE_RUNTIME_CONTRACT.successOutputSequence,
    failures: Object.freeze(failures)
  });
}

export function evaluateWriteCycleHardBinding(state = {}) {
  const initial = evaluateInitialMountBinding(state);
  const failures = [...initial.failures];

  const requiredFlags = Object.freeze({
    flow1To11Completed: "flow_1_to_11_completed",
    frozenConditionTableShortGenerated: "frozen_condition_table_short_generated_from_current_story_cycle",
    currentCycleRereadConfirmed: "current_cycle_reread_confirmed",
    memoryFilenameSummaryNotUsedAsRead: "memory_filename_summary_not_used_as_read"
  });

  for (const [field, assertion] of Object.entries(requiredFlags)) {
    if (state[field] !== true) failures.push({ assertion, field });
  }

  return Object.freeze({
    decision: failures.length === 0 ? "ACTIVE_RUNTIME_READY" : "STOP_BEFORE_TEXT",
    booted: initial.booted,
    writeTextAllowed: failures.length === 0,
    activeSuccessOutputSequence: ACTIVE_RUNTIME_CONTRACT.successOutputSequence,
    failures: Object.freeze(failures)
  });
}

export const evaluateHardBinding = evaluateWriteCycleHardBinding;
