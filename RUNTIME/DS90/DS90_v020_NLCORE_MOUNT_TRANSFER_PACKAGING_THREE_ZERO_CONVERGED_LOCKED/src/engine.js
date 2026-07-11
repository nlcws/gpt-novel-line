import { SOURCE_POLICY } from "./catalog.js";
import { validateExtensions } from "./extensions.js";
import { validateOperationReads } from "./loading/manifest.js";
import { applyUserOverrides } from "./override.js";
import { route } from "./router.js";
import { runModule } from "./runtime/program.js";
import { validateSchema } from "./schema.js";
import {
  validateDesignerDiscipline,
  validateNewItemRegistration
} from "./validation/designerGates.js";

const PRIORITY = Object.freeze({
  PASS: 0,
  USER_OVERRIDDEN: 1,
  STOP: 2
});

function issue(code, path, message, decision = "STOP") {
  return { code, path, message, decision };
}

function strongest(results) {
  return results.reduce(
    (current, result) => PRIORITY[result.decision] > PRIORITY[current] ? result.decision : current,
    "PASS"
  );
}

function validateSources(sources = []) {
  const issues = [];
  for (let index = 0; index < sources.length; index += 1) {
    const source = sources[index];
    const policy = SOURCE_POLICY[source.type];
    if (policy == null) {
      issues.push(issue("UNKNOWN_SOURCE_TYPE", `sources[${index}].type`, "未知の資料種別"));
    }
    if (source.canonical === true && policy !== "CANONICAL") {
      issues.push(issue("ILLEGAL_CANONICAL_PROMOTION", `sources[${index}]`,
        `${source.type}は正本にできない`));
    }
    if (source.read === false && source.required === true) {
      issues.push(issue("REQUIRED_SOURCE_UNREAD", `sources[${index}]`, "必須資料が未読"));
    }
  }
  return issues;
}

function makeEndLog(state, operation, decision) {
  const next = decision === "PASS"
    ? "requested moduleの出力契約へ進む"
    : "不足または規則違反を解消";
  return {
    current: state,
    unreflected: decision === "PASS" ? "なし" : decision,
    next,
    notice: "END_LOGは正本ではない"
  };
}

function invalidRequestResult() {
  return {
    decision: "STOP",
    boot: null,
    operation: null,
    handler: null,
    stages: [],
    issues: [issue("INVALID_REQUEST", "$", "入力はobject")],
    endLog: makeEndLog("FACTORY_STOP", null, "STOP")
  };
}

export function execute(request) {
  if (request == null || typeof request !== "object" || Array.isArray(request)) {
    return invalidRequestResult();
  }

  const schemaIssues = validateSchema(request);
  if (schemaIssues.length > 0) {
    return {
      decision: "STOP",
      boot: null,
      operation: null,
      handler: null,
      stages: [{ decision: "STOP", moduleId: "SCHEMA", issues: schemaIssues }],
      issues: schemaIssues.map((item) => ({ ...item, decision: "STOP", moduleId: "SCHEMA" })),
      endLog: makeEndLog("FACTORY_STOP", request.operation ?? null, "STOP")
    };
  }

  const routed = route(request.command, request.operation);
  if (routed.kind !== "ROUTED") {
    const decision = routed.kind;
    return {
      decision,
      boot: "BOOT_READY",
      operation: null,
      handler: null,
      candidates: routed.candidates ?? [],
      stages: [],
      issues: [issue(routed.code, "command", "操作を一意に決定できない", decision)],
      endLog: makeEndLog("BOOT_READY", null, decision)
    };
  }

  const commonIssues = validateSources(request.sources);
  const commonResult = {
    decision: commonIssues.length === 0 ? "PASS" : "STOP",
    moduleId: "SOURCE_POLICY",
    issues: commonIssues
  };
  const extensionIssues = validateExtensions(routed.operation, request.meta, request.payload);
  const extensionResult = {
    decision: extensionIssues.length === 0 ? "PASS" : "STOP",
    moduleId: "EXTENSIONS",
    issues: extensionIssues
  };
  const loadResult = validateOperationReads(routed.operation, request.boot?.readLedger);
  const disciplineResult = validateDesignerDiscipline(routed.operation, request);
  const registrationResult = validateNewItemRegistration(routed.operation, request);
  const coreResult = runModule("CORE", request);
  const requestedResult = routed.spec.tool === "CORE"
    ? null
    : runModule(routed.spec.tool, request);
  const endLogResult = runModule("END_LOG", request);
  const stages = [
    loadResult,
    disciplineResult,
    registrationResult,
    coreResult,
    requestedResult,
    commonResult,
    extensionResult,
    endLogResult
  ].filter(Boolean);
  const rawIssues = stages.flatMap((stage) =>
    stage.issues.map((item) => ({ ...item, moduleId: stage.moduleId }))
  );
  const overridden = applyUserOverrides(rawIssues, request.userOverrides, routed.operation);
  const rawDecision = strongest(stages);
  const decision = overridden.remaining.length > 0
    ? "STOP"
    : rawDecision === "STOP" && overridden.consumed.length > 0
      ? "USER_OVERRIDDEN"
      : rawDecision;
  const boot = request.project?.present === true || request.project?.gate021 != null
    ? "BOOT_CONNECTED"
    : "BOOT_READY";
  const state = decision === "STOP" && boot === "BOOT_CONNECTED" ? "PROJECT_STOP" : boot;

  return {
    decision,
    boot,
    operation: routed.operation,
    handler: routed.spec.tool,
    modeCompletion: requestedResult?.completionState ?? null,
    activationState: requestedResult?.activationState ?? null,
    materialState: requestedResult?.materialState ?? null,
    invocation: requestedResult?.invocation ?? null,
    ...(requestedResult?.moduleOutput != null
      ? { moduleOutput: requestedResult.moduleOutput }
      : {}),
    stages,
    issues: overridden.remaining,
    appliedUserOverrides: overridden.consumed,
    endLog: makeEndLog(state, routed.operation, decision)
  };
}
