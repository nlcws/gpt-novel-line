import { isDeepStrictEqual } from "node:util";
import { route } from "./router.js";
import { validateSchema } from "./schema.js";
import { buildOperationPlan } from "./runtime/operation-plan.js";
import { runOperation } from "./runtime/runner.js";
import { decideTerminal } from "./runtime/terminal-authority.js";
import { buildRuntimeReport } from "./runtime/report-policy.js";
import { evaluateUserTurn, TURN_ROLE_POLICY } from "./runtime/turn-gate.js";
import {
  makeSession,
  validateSessionIntegrity,
  actionIdFor,
  sealSessionState,
  DS90_RUNTIME_VERSION
} from "./runtime/session.js";

function issue(code, path, message, decision = "STOP") {
  return { code, path, message, decision };
}

function normalizeExternalContext(request) {
  const externalContext = request.externalContext ?? request.project ?? null;
  const aliasConflict = request.externalContext != null && request.project != null &&
    !isDeepStrictEqual(request.externalContext, request.project);
  return {
    request: { ...request, externalContext, project: externalContext },
    issues: aliasConflict
      ? [issue("EXTERNAL_CONTEXT_ALIAS_CONFLICT", "externalContext", "externalContextとlegacy alias projectの内容が一致しません")]
      : []
  };
}

function validateCanonicalSessionRouteAndPlan(session) {
  const issues = [];
  const routed = route(session?.request?.command, session?.request?.operation);
  if (routed.kind !== "ROUTED") {
    issues.push(issue("SESSION_ROUTE_REPLAY_FAILED", "route", "serialized session request no longer resolves to a canonical runtime route"));
    return issues;
  }
  if (routed.operation !== session?.route?.operation || !isDeepStrictEqual(routed.spec, session?.route?.spec)) {
    issues.push(issue("SESSION_ROUTE_NOT_CANONICAL", "route", "serialized session route/spec does not match a fresh router/catalog resolution"));
    return issues;
  }
  const canonicalPlan = buildOperationPlan(routed.operation, session.request, routed.spec);
  if (!isDeepStrictEqual(canonicalPlan, session?.plan)) {
    issues.push(issue("SESSION_PLAN_NOT_CANONICAL", "plan", "serialized session plan does not match a fresh operation-plan build"));
  }
  return issues;
}

function terminalErrorResult({ request = null, operation = null, handler = null, issues, state = "FACTORY_STOP", moduleId = "RUNTIME" }) {
  const stages = [{ decision: "STOP", moduleId, issues }];
  const terminal = { terminal: true, decision: "STOP", state, coreState: state };
  return {
    runtimeVersion: DS90_RUNTIME_VERSION,
    terminal: true,
    state,
    decision: "STOP",
    boot: state === "BOOT_READY" || state === "BOOT_CONNECTED" ? state : null,
    operation,
    handler,
    plan: null,
    hostAction: null,
    stages,
    issues,
    appliedUserOverrides: [],
    endLog: buildRuntimeReport({
      ...terminal,
      operation,
      hostAction: null,
      operationClass: "RUNTIME_ERROR",
      persistenceAuthority: "NONE",
      roleContinuity: "RETAIN_ACTIVE_ROLE_ON_STOP"
    })
  };
}


function turnGateControlResult(request, gate) {
  const decision = gate?.kind === "DS90_STOP" ? "STOP" : "PASS";
  const state = gate?.kind === "DS90_STOP" ? "DS90_TURN_STOP" : gate?.kind ?? "DS90_ROLE_CONTINUATION";
  const terminal = true;
  return {
    runtimeVersion: DS90_RUNTIME_VERSION,
    terminal,
    state,
    decision,
    boot: null,
    operation: null,
    handler: "TURN_GATE",
    plan: null,
    hostAction: null,
    operationClass: "TURN_CONTROL",
    persistenceAuthority: "NO_IMPLICIT_WRITE_PERSISTENCE",
    roleContinuity: gate?.continuity ?? TURN_ROLE_POLICY.continuity,
    turnGate: structuredClone(gate ?? null),
    stages: [{
      decision,
      moduleId: "TURN_GATE",
      gate: structuredClone(gate ?? null),
      issues: decision === "STOP" ? [issue(gate?.code ?? "TURN_GATE_STOP", "command",
        gate?.code === "COMMAND_REQUIRED"
          ? "入力がありません。DS90で処理する対象を示してください"
          : "DS90の役割は維持しますが、この入力だけでは処理対象を特定できません。設計・検査・検索などの対象を示すか、役割変更を明示してください"
      )] : []
    }],
    issues: decision === "STOP" ? [issue(gate?.code ?? "TURN_GATE_STOP", "command",
      gate?.code === "COMMAND_REQUIRED"
        ? "入力がありません。DS90で処理する対象を示してください"
        : "DS90の役割は維持しますが、この入力だけでは処理対象を特定できません。設計・検査・検索などの対象を示すか、役割変更を明示してください"
    )] : [],
    appliedUserOverrides: [],
    endLog: decision === "PASS"
      ? {
          current: state,
          unreflected: "TURN_CONTROL_ONLY_NO_OPERATION_OUTPUT",
          next: gate?.mode === "CONTINUE_FROM_CURRENT"
            ? "continue under the active DS90 role from the current confirmed state"
            : "handle the user turn under the active DS90 role; do not claim operation completion",
          operation: null,
          operationClass: "TURN_CONTROL",
          persistenceAuthority: "NO_IMPLICIT_WRITE_PERSISTENCE",
          roleContinuity: gate?.continuity ?? TURN_ROLE_POLICY.continuity,
          persistenceMeaning: "WRITE_PERSISTENCE_ONLY",
          notice: "TURN_GATE classified role/continuity only; no design, specialist, file-read, or persistence completion is claimed"
        }
      : buildRuntimeReport({
          terminal, decision, state, operation: null, hostAction: null,
          operationClass: "TURN_CONTROL",
          persistenceAuthority: "NO_IMPLICIT_WRITE_PERSISTENCE",
          roleContinuity: gate?.continuity ?? TURN_ROLE_POLICY.continuity
        })
  };
}

function applyTurnGate(request) {
  // Explicit machine operations are already classified internal requests.
  // TURN_GATE is only for unresolved human-language turns; never reinterpret
  // a schema-level operation as fresh user prose.
  if (typeof request?.operation === "string" && request.operation.trim() !== "") {
    return { request, gate: { kind: "EXPLICIT_MACHINE_OPERATION_BYPASS" }, controlResult: null };
  }
  const activeRole = request?.meta?.activeRole ?? "DS90";
  const explicitRoleChange = request?.meta?.explicitRoleChange === true;
  const gate = evaluateUserTurn(request?.command, { activeRole, explicitRoleChange });
  if (gate.kind === "RUNTIME_OPERATION") return { request, gate, controlResult: null };
  if (gate.kind === "SPECIALIST_REQUIRED") {
    const patch = gate.requestPatch ?? {};
    const payloadPatch = patch.payload ?? {};
    return {
      request: {
        ...request,
        operation: patch.operation ?? request.operation,
        payload: { ...(request.payload ?? {}), ...payloadPatch }
      },
      gate,
      controlResult: null
    };
  }
  return { request, gate, controlResult: turnGateControlResult(request, gate) };
}

function prepareSession(request) {
  if (request == null || typeof request !== "object" || Array.isArray(request)) {
    return { error: terminalErrorResult({ issues: [issue("INVALID_REQUEST", "$", "入力はobject")] }) };
  }
  // Validate the user/machine request before TURN_GATE so a malformed request
  // cannot be hidden behind an UNKNOWN-turn STOP. Specialist patches are then
  // validated a second time before entering the canonical router.
  const initialSchemaIssues = validateSchema(request);
  if (initialSchemaIssues.length > 0) {
    return { error: terminalErrorResult({ issues: initialSchemaIssues.map((entry) => ({ ...entry, decision: "STOP" })), moduleId: "SCHEMA" }) };
  }
  const gated = applyTurnGate(request);
  if (gated.controlResult) return { error: gated.controlResult };
  request = gated.request;
  const schemaIssues = validateSchema(request);
  if (schemaIssues.length > 0) {
    return { error: terminalErrorResult({ issues: schemaIssues.map((entry) => ({ ...entry, decision: "STOP" })), moduleId: "SCHEMA" }) };
  }
  const routed = route(request.command, request.operation);
  if (routed.kind !== "ROUTED") {
    const issues = [issue(
      routed.code,
      "command",
      routed.code === "CONSULT_ONLY_CONTEXT" ? "相談・説明文脈のため専門工程を実行しません" : "操作を一意に決定できない"
    )];
    return { error: terminalErrorResult({ request, issues, state: "BOOT_READY", moduleId: "ROUTER" }) };
  }
  const normalized = normalizeExternalContext(request);
  if (normalized.issues.length > 0) {
    return { error: terminalErrorResult({ request, operation: routed.operation, handler: routed.spec.tool, issues: normalized.issues, moduleId: "INPUT_ALIAS" }) };
  }
  const plan = buildOperationPlan(routed.operation, normalized.request, routed.spec);
  return { session: makeSession(normalized.request, routed, plan) };
}

function renderSessionResult(session, run) {
  const terminal = decideTerminal({
    stages: run.stages,
    remainingIssues: run.remainingIssues,
    consumedOverrides: run.consumedOverrides,
    hostAction: run.hostAction,
    coreState: run.coreState
  });
  const report = buildRuntimeReport({
    ...terminal,
    operation: session.route.operation,
    hostAction: run.hostAction,
    operationClass: run.operationClass,
    persistenceAuthority: run.persistenceAuthority,
    roleContinuity: run.roleContinuity
  });
  const result = {
    runtimeVersion: session.runtimeVersion,
    terminal: terminal.terminal,
    state: terminal.state,
    decision: terminal.decision,
    boot: terminal.coreState,
    operation: session.route.operation,
    handler: session.plan.tool,
    plan: structuredClone(session.plan),
    hostAction: run.hostAction,
    operationClass: run.operationClass,
    persistenceAuthority: run.persistenceAuthority,
    roleContinuity: run.roleContinuity,
    moduleOutput: run.moduleOutput ?? null,
    modeCompletion: run.modeCompletion ?? null,
    activationState: run.activationState ?? null,
    materialState: run.materialState ?? null,
    invocation: run.invocation ?? null,
    knowledgeEvidence: run.knowledgeEvidence ?? null,
    pkdbInputProposal: run.pkdbInputProposal ?? null,
    stages: run.stages,
    issues: run.remainingIssues,
    appliedUserOverrides: run.consumedOverrides,
    endLog: report
  };
  session.pendingAction = run.hostAction == null ? null : structuredClone(run.hostAction);
  session.state = terminal.state;
  session.terminal = terminal.terminal;
  session.result = structuredClone(result);
  sealSessionState(session);
  return result;
}

export function advanceRuntimeSession(session) {
  const integrityIssues = [
    ...validateSessionIntegrity(session),
    ...validateCanonicalSessionRouteAndPlan(session)
  ];
  if (integrityIssues.length > 0) {
    const result = terminalErrorResult({
      request: session?.request,
      operation: session?.route?.operation ?? null,
      handler: session?.plan?.tool ?? null,
      issues: integrityIssues,
      moduleId: "SESSION_INTEGRITY"
    });
    session.state = "FACTORY_STOP";
    session.terminal = true;
    session.pendingAction = null;
    session.result = structuredClone(result);
    return { session, result };
  }
  const run = runOperation({
    request: session.request,
    routed: { operation: session.route.operation, spec: session.route.spec },
    plan: session.plan,
    hostResults: session.hostResults,
    makeActionId: (type) => actionIdFor(session, type)
  });
  const result = renderSessionResult(session, run);
  return { session, result };
}

export function createRuntimeSession(request) {
  const prepared = prepareSession(request);
  if (prepared.error) {
    return {
      session: null,
      result: prepared.error
    };
  }
  return advanceRuntimeSession(prepared.session);
}

export function resumeRuntimeSession(serializedSession, hostResult) {
  if (serializedSession == null || typeof serializedSession !== "object" || serializedSession.terminal === true) {
    return {
      session: serializedSession ?? null,
      result: terminalErrorResult({ issues: [issue("SESSION_NOT_RESUMABLE", "session", "session is absent or already terminal")], moduleId: "SESSION" })
    };
  }
  const session = structuredClone(serializedSession);
  const integrityIssues = [
    ...validateSessionIntegrity(session),
    ...validateCanonicalSessionRouteAndPlan(session)
  ];
  if (integrityIssues.length > 0) {
    return { session, result: terminalErrorResult({ issues: integrityIssues, moduleId: "SESSION_INTEGRITY" }) };
  }
  if (session.pendingAction == null) {
    return { session, result: terminalErrorResult({ issues: [issue("SESSION_PENDING_ACTION_MISSING", "pendingAction", "non-terminal session has no pending host action")], moduleId: "SESSION" }) };
  }
  if (hostResult?.actionId !== session.pendingAction.actionId) {
    return { session, result: terminalErrorResult({ issues: [issue("HOST_RESULT_ACTION_MISMATCH", "hostResult.actionId", "host result does not match the pending action")], moduleId: "SESSION" }) };
  }
  session.hostResults.push(structuredClone(hostResult));
  session.pendingAction = null;
  sealSessionState(session);
  return advanceRuntimeSession(session);
}

export function execute(request) {
  return createRuntimeSession(request).result;
}
