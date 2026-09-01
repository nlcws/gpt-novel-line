import { packCutoutModule } from "./modules/packCutout.js";
import { evaluateRules } from "./runtime/rule.js";
import { validateOperationReads, requiredReads } from "./loading/manifest.js";
import { route } from "./router.js";

export const READ_ORDER = Object.freeze([
  "START_HERE.js",
  "README.md",
  "load_order.md",
  "src/engine.js",
  "src/router.js",
  "src/runtime/types.js",
  "src/runtime/rule.js",
  "src/modules/packCutout.js",
  "src/loading/manifest.js",
  "every file returned by requiredReads('PACK_CUTOUT')",
  "requested module only"
]);

function issue(code, path, message, severity = "STOP") {
  return { code, path, message, severity, decision: severity };
}

function normalizeRequest(request) {
  const runtime = request.runtime ?? request.packager ?? request.dsgn ?? {};
  const externalContext = request.externalContext ?? request.project ?? null;
  return {
    ...request,
    dsgn: runtime,
    runtime,
    externalContext,
    project: externalContext
  };
}

function inputIssues(request) {
  const issues = [];
  if (request.externalContext == null) issues.push(issue("EXTERNAL_CONTEXT_REQUIRED", "externalContext", "作品/現行マウント側のcontextが必要です"));
  if (request.packCutout == null) issues.push(issue("PACK_CUTOUT_INPUT_REQUIRED", "packCutout", "話パック切り出し対象が必要です"));
  if (request.runtime?.mode == null && request.dsgn?.mode == null && request.packager?.mode == null) {
    issues.push(issue("RUNTIME_MODE_REQUIRED", "runtime.mode", "SP00.MODE.pack_cutoutが必要です"));
  }
  return issues;
}

function runPackCutout(request) {
  const ruleIssues = evaluateRules(packCutoutModule.rules, request);
  const validated = packCutoutModule.validate(request);
  const issues = [
    ...ruleIssues.map((entry) => ({ ...entry, severity: entry.decision ?? "STOP" })),
    ...validated.issues.map((entry) => ({ ...entry, ruleId: entry.code, decision: entry.severity ?? "STOP" }))
  ];
  return {
    decision: issues.length ? "STOP" : "PASS",
    moduleId: "PACK_CUTOUT",
    issues,
    invocation: validated.invocation,
    completionState: validated.completionState,
    activationState: validated.activationState ?? null,
    materialState: validated.materialState ?? null
  };
}

export function execute(request) {
  if (request == null || typeof request !== "object" || Array.isArray(request)) {
    return { decision: "STOP", operation: null, issues: [issue("INVALID_REQUEST", "$", "入力はobject")], stages: [] };
  }
  const routed = route(request.command ?? "", request.operation);
  if (routed.kind !== "ROUTED") {
    return { decision: "STOP", operation: null, issues: [issue(routed.code, "command", "話パック切り出し実行指示ではありません")], stages: [] };
  }
  const active = normalizeRequest(request);
  const input = { decision: inputIssues(active).length ? "STOP" : "PASS", moduleId: "OPERATION_INPUT", issues: inputIssues(active) };
  const load = validateOperationReads("PACK_CUTOUT", active.boot?.readLedger ?? []);
  const module = runPackCutout(active);
  const stages = [input, load, module];
  const issues = stages.flatMap((stage) => stage.issues.map((entry) => ({ ...entry, moduleId: stage.moduleId })));
  return {
    decision: issues.length ? "STOP" : "PASS",
    operation: "PACK_CUTOUT",
    handler: "PACK_CUTOUT",
    modeCompletion: module.completionState ?? null,
    activationState: module.activationState ?? null,
    materialState: module.materialState ?? null,
    stages,
    issues,
    requiredReads: requiredReads("PACK_CUTOUT"),
    endLog: {
      current: issues.length ? "STORY_PACK_CUTOUT_STOP" : "STORY_PACK_CUTOUT_READY",
      unreflected: issues.length ? "STOP" : "なし",
      next: issues.length ? "不足を解消して再実行" : "writer-ready story pack artifact handoff"
    }
  };
}
