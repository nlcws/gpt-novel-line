export const OPERATION_MODES = Object.freeze(["BOOT", "INSPECT", "REPAIR", "WRITE"]);

const fail = (code, path) => ({ code, path });

export function evaluateOperationLock(state = {}) {
  const failures = [];
  const mode = state.mode;
  if (!OPERATION_MODES.includes(mode)) failures.push(fail("OPERATION_MODE_INVALID", "mode"));

  const noManuscriptRequested = state.noManuscriptRequested === true;
  if (noManuscriptRequested && mode === "WRITE") {
    failures.push(fail("NO_MANUSCRIPT_REQUEST_CONFLICTS_WITH_WRITE", "mode"));
  }

  if (mode === "WRITE") {
    const required = [
      "writerPackOrHandoffPresent",
      "targetStoryNumberPresent",
      "outputFormatPresent",
      "layerPolicyPresent"
    ];
    for (const field of required) {
      if (state[field] !== true) failures.push(fail("WRITE_INPUT_REQUIREMENT_MISSING", field));
    }
  }

  if ((mode === "BOOT" || mode === "INSPECT" || mode === "REPAIR") && state.text != null) {
    failures.push(fail("TEXT_FORBIDDEN_OUTSIDE_WRITE", "text"));
  }

  return Object.freeze({
    decision: failures.length === 0 ? "OPERATION_ALLOWED" : "STOP_BEFORE_TEXT",
    mode,
    writeTextAllowed: failures.length === 0 && mode === "WRITE",
    maintenanceAllowed: failures.length === 0 && ["BOOT", "INSPECT", "REPAIR"].includes(mode),
    failures: Object.freeze(failures)
  });
}

export function buildMissingWriteInputStop(state = {}) {
  const missing = [];
  if (state.writerPackOrHandoffPresent !== true) missing.push("writer_pack_or_handoff");
  if (state.targetStoryNumberPresent !== true) missing.push("target_story_number");
  if (state.outputFormatPresent !== true) missing.push("output_format");
  if (state.layerPolicyPresent !== true) missing.push("layer_ON_OFF");
  return Object.freeze({
    target: "本文生成",
    stopAt: "INPUT / operation_lock",
    missing: Object.freeze(missing),
    conflict: state.noManuscriptRequested === true ? "no_manuscript_requested" : null,
    unreadable: null,
    resume: missing.length === 0 ? "WRITE mode may continue" : "provide explicit writer pack, target story number, output format, and layer policy"
  });
}
