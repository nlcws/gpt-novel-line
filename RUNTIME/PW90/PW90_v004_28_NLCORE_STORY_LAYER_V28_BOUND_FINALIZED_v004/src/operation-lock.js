export const OPERATION_MODES = Object.freeze(["BOOT", "WRITE"]);
export const UNSUPPORTED_LEGACY_OPERATION_MODES = Object.freeze(["INSPECT", "REPAIR"]);
export const DEFAULT_WRITER_LAYER_POLICY = "ON";
export const WRITER_LAYER_POLICIES = Object.freeze(["ON", "OFF"]);

const fail = (code, path, detail = null) => detail == null ? { code, path } : { code, path, detail };

export function resolveWriterLayerPolicy(state = {}) {
  const raw = state.layerPolicy;
  if (raw == null || raw === "") {
    return Object.freeze({ decision: "LAYER_POLICY_RESOLVED", layerPolicy: DEFAULT_WRITER_LAYER_POLICY, source: "DEFAULT_ON_WHEN_UNSPECIFIED", explicit: false, failures: Object.freeze([]) });
  }
  if (!WRITER_LAYER_POLICIES.includes(raw)) {
    return Object.freeze({ decision: "STOP_BEFORE_TEXT", layerPolicy: null, source: "INVALID_LAYER_POLICY", explicit: true, failures: Object.freeze([fail("LAYER_POLICY_INVALID", "layerPolicy", raw)]) });
  }
  if (raw === "OFF" && state.layerOffExplicit !== true) {
    return Object.freeze({ decision: "STOP_BEFORE_TEXT", layerPolicy: null, source: "UNGROUNDED_OFF", explicit: false, failures: Object.freeze([fail("LAYER_OFF_REQUIRES_EXPLICIT_DECLARATION", "layerOffExplicit")]) });
  }
  return Object.freeze({ decision: "LAYER_POLICY_RESOLVED", layerPolicy: raw, source: raw === "OFF" ? "EXPLICIT_OFF" : "EXPLICIT_ON", explicit: true, failures: Object.freeze([]) });
}

export function evaluateOperationLock(state = {}) {
  const failures = [];
  const mode = state.mode;
  if (UNSUPPORTED_LEGACY_OPERATION_MODES.includes(mode)) failures.push(fail("OPERATION_MODE_UNSUPPORTED_CURRENT_RUNTIME", "mode", mode));
  else if (!OPERATION_MODES.includes(mode)) failures.push(fail("OPERATION_MODE_INVALID", "mode", mode));

  const noManuscriptRequested = state.noManuscriptRequested === true;
  if (noManuscriptRequested && mode === "WRITE") failures.push(fail("NO_MANUSCRIPT_REQUEST_CONFLICTS_WITH_WRITE", "mode"));

  let layerResolution = null;
  if (mode === "WRITE") {
    for (const field of ["writerPackOrHandoffPresent", "targetStoryNumberPresent", "outputFormatPresent"]) {
      if (state[field] !== true) failures.push(fail("WRITE_INPUT_REQUIREMENT_MISSING", field));
    }
    layerResolution = resolveWriterLayerPolicy(state);
    failures.push(...layerResolution.failures);
  }
  if (mode === "BOOT" && state.text != null) failures.push(fail("TEXT_FORBIDDEN_OUTSIDE_WRITE", "text"));

  return Object.freeze({
    decision: failures.length === 0 ? "OPERATION_ALLOWED" : "STOP_BEFORE_TEXT",
    mode,
    writeTextAllowed: failures.length === 0 && mode === "WRITE",
    maintenanceAllowed: failures.length === 0 && mode === "BOOT",
    resolvedLayerPolicy: layerResolution?.layerPolicy ?? null,
    layerPolicySource: layerResolution?.source ?? null,
    failures: Object.freeze(failures)
  });
}

export function buildMissingWriteInputStop(state = {}) {
  const missing = [];
  if (state.writerPackOrHandoffPresent !== true) missing.push("writer_pack_or_handoff");
  if (state.targetStoryNumberPresent !== true) missing.push("target_story_number");
  if (state.outputFormatPresent !== true) missing.push("output_format");
  const layerResolution = resolveWriterLayerPolicy(state);
  return Object.freeze({
    target: "本文生成", stopAt: "INPUT / operation_lock", missing: Object.freeze(missing),
    conflict: state.noManuscriptRequested === true ? "no_manuscript_requested" : null,
    unreadable: null, resolvedLayerPolicy: layerResolution.layerPolicy, layerPolicySource: layerResolution.source,
    layerFailures: layerResolution.failures,
    resume: missing.length === 0 && layerResolution.failures.length === 0 ? "WRITE mode may continue" : "provide writer pack, target story number, output format, and any explicit OFF declaration required by the layer policy"
  });
}
