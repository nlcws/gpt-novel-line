import { buildRuntimeExecutionPlan } from "./runtime-execution-plan.js";
import { executeRuntimeSkill, SKILL_EXECUTOR_STATUS } from "./runtime-skill-executors.js";
import { RUNTIME_VERSION } from "./program.js";
import { RUNTIME_SKILL_IDS, RUNTIME_STATE_IDS } from "./runtime-vocabulary.js";

export const RUNTIME_ENGINE_ID = "PW90_SKILL_SESSION_RUNTIME_v002";
export const RUNTIME_SESSION_SCHEMA = "PW90_RUNTIME_SESSION_v002";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const sameJson = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const failure = (code, path, detail = null) => detail == null ? { code, path } : { code, path, detail };
const freezeSession = (session) => Object.freeze({
  ...session,
  skillChain: Object.freeze([...(session.skillChain ?? [])]),
  skillResults: Object.freeze({ ...(session.skillResults ?? {}) }),
  trace: Object.freeze([...(session.trace ?? [])]),
  integrityFailures: Object.freeze([...(session.integrityFailures ?? [])])
});

export function createRuntimeSession(input = {}) {
  const plan = buildRuntimeExecutionPlan(input);
  const skillChain = [...(plan.skillChain ?? [])];
  const stopped = plan.decision === RUNTIME_STATE_IDS.STOP_BEFORE_TEXT;
  return freezeSession({
    schema: RUNTIME_SESSION_SCHEMA,
    engineId: RUNTIME_ENGINE_ID,
    runtimeVersion: RUNTIME_VERSION,
    status: stopped ? "STOPPED" : "READY",
    terminalState: stopped ? RUNTIME_STATE_IDS.STOP_BEFORE_TEXT : null,
    plan: clone(plan),
    input: clone(input),
    skillChain,
    cursor: 0,
    currentSkill: skillChain[0] ?? null,
    pendingHostAction: null,
    skillResults: {},
    integrityFailures: [],
    trace: [{ event: "SESSION_CREATED", planDecision: plan.decision, bodyRoute: plan.bodyRoute, skillChain }]
  });
}

export function runtimeSessionComplete(session) {
  return ["COMPLETED", "STOPPED", "QUARANTINED"].includes(session?.status);
}

function expectedResultKeys(session) {
  const chain = session.skillChain ?? [];
  const cursor = session.cursor;
  if (session.status === "READY" || session.status === "WAITING_FOR_HOST") return chain.slice(0, cursor);
  if (session.status === "COMPLETED") return chain.slice(0, cursor);
  if (["STOPPED", "QUARANTINED"].includes(session.status) && cursor < chain.length) return [...chain.slice(0, cursor), chain[cursor]];
  return chain.slice(0, cursor);
}

function validateWriteTerminalEvidence(session, failures) {
  const s08 = session.skillResults?.[RUNTIME_SKILL_IDS.FULL_CONVERGENCE_SWEEP];
  const s09 = session.skillResults?.[RUNTIME_SKILL_IDS.ARTIFACT_BUILD];
  const s11 = session.skillResults?.[RUNTIME_SKILL_IDS.USER_DELIVERY_EXISTING_CONTRACT];
  if (s08?.pass !== true || s08?.decision !== "SUCCESS" || s08?.success !== true) failures.push(failure("S08_SUCCESS_EVIDENCE_REQUIRED", "skillResults.S08"));
  if (s09?.pass !== true || s09?.decision !== "ARTIFACT_READY" || s09?.artifact == null) failures.push(failure("S09_ARTIFACT_EVIDENCE_REQUIRED", "skillResults.S09"));
  if (s11?.pass !== true || s11?.decision !== "DELIVERY_READY" || s11?.delivery?.artifact == null) failures.push(failure("S11_DELIVERY_EVIDENCE_REQUIRED", "skillResults.S11"));
  if (s09?.artifact?.successAuthority !== RUNTIME_SKILL_IDS.FULL_CONVERGENCE_SWEEP) failures.push(failure("ARTIFACT_SUCCESS_AUTHORITY_INVALID", "skillResults.S09.artifact.successAuthority"));
  if (s09?.artifact != null && s11?.delivery?.artifact != null && !sameJson(s09.artifact, s11.delivery.artifact)) failures.push(failure("DELIVERY_ARTIFACT_MISMATCH", "skillResults.S11.delivery.artifact"));
}

export function validateRuntimeSessionIntegrity(session) {
  const failures = [];
  if (session == null || typeof session !== "object" || Array.isArray(session)) return Object.freeze([failure("RUNTIME_SESSION_OBJECT_REQUIRED", "session")]);
  if (session.schema !== RUNTIME_SESSION_SCHEMA) failures.push(failure("RUNTIME_SESSION_SCHEMA_MISMATCH", "schema", session.schema));
  if (session.engineId !== RUNTIME_ENGINE_ID) failures.push(failure("RUNTIME_ENGINE_ID_MISMATCH", "engineId", session.engineId));
  if (session.runtimeVersion !== RUNTIME_VERSION) failures.push(failure("RUNTIME_VERSION_MISMATCH", "runtimeVersion", session.runtimeVersion));
  let expectedPlan = null;
  try { expectedPlan = buildRuntimeExecutionPlan(session.input ?? {}); }
  catch (error) { failures.push(failure("RUNTIME_PLAN_REBUILD_FAILED", "input", error.message)); }
  if (expectedPlan != null && !sameJson(session.plan, expectedPlan)) failures.push(failure("RUNTIME_PLAN_TAMPER_OR_DRIFT", "plan"));
  const expectedChain = expectedPlan?.skillChain ?? [];
  if (!sameJson(session.skillChain ?? [], expectedChain)) failures.push(failure("RUNTIME_SKILL_CHAIN_TAMPER_OR_DRIFT", "skillChain"));
  if (!Number.isInteger(session.cursor) || session.cursor < 0 || session.cursor > (session.skillChain?.length ?? 0)) failures.push(failure("RUNTIME_CURSOR_INVALID", "cursor", session.cursor));
  const chain = session.skillChain ?? [];
  const expectedCurrent = session.cursor < chain.length ? chain[session.cursor] : null;
  if (["READY", "WAITING_FOR_HOST"].includes(session.status) && session.currentSkill !== expectedCurrent) failures.push(failure("RUNTIME_CURRENT_SKILL_MISMATCH", "currentSkill", { expected: expectedCurrent, actual: session.currentSkill }));
  if (session.status === "COMPLETED" && (session.cursor !== chain.length || session.currentSkill != null)) failures.push(failure("RUNTIME_COMPLETION_CURSOR_INVALID", "cursor"));
  if (session.status === "WAITING_FOR_HOST") {
    if (session.pendingHostAction?.skillId !== expectedCurrent || session.pendingHostAction?.decision !== "HOST_ACTION_REQUIRED") failures.push(failure("RUNTIME_PENDING_HOST_ACTION_INVALID", "pendingHostAction"));
  } else if (session.pendingHostAction != null) failures.push(failure("RUNTIME_PENDING_HOST_ACTION_STALE", "pendingHostAction"));

  const actualKeys = Object.keys(session.skillResults ?? {});
  const expectedKeys = expectedResultKeys(session);
  if (!sameJson([...actualKeys].sort(), [...expectedKeys].sort())) failures.push(failure("RUNTIME_SKILL_RESULTS_PREFIX_INVALID", "skillResults", { expected: expectedKeys, actual: actualKeys }));
  for (const key of actualKeys) {
    const result = session.skillResults[key];
    if (result?.skillId !== key) failures.push(failure("RUNTIME_SKILL_RESULT_ID_MISMATCH", `skillResults.${key}.skillId`));
    const index = chain.indexOf(key);
    if (index < 0) failures.push(failure("RUNTIME_SKILL_RESULT_NOT_IN_CHAIN", `skillResults.${key}`));
    if (index < session.cursor && result?.pass !== true) failures.push(failure("RUNTIME_COMPLETED_PREFIX_RESULT_NOT_PASS", `skillResults.${key}.pass`));
  }

  if (session.status === "COMPLETED") {
    if (session.plan?.maintenanceOperation != null) {
      const s00 = session.skillResults?.[RUNTIME_SKILL_IDS.MOUNT_BOOT];
      if (session.plan.maintenanceOperation !== "BOOT") failures.push(failure("UNSUPPORTED_MAINTENANCE_COMPLETION", "plan.maintenanceOperation", session.plan.maintenanceOperation));
      if (session.terminalState !== RUNTIME_STATE_IDS.MAINTENANCE_COMPLETE_NO_BODY) failures.push(failure("MAINTENANCE_TERMINAL_STATE_INVALID", "terminalState"));
      if (s00?.pass !== true || s00?.decision !== "BOOT_READY") failures.push(failure("S00_BOOT_EVIDENCE_REQUIRED", "skillResults.S00"));
    } else {
      if (session.terminalState !== RUNTIME_STATE_IDS.SUCCESS) failures.push(failure("WRITE_TERMINAL_STATE_INVALID", "terminalState"));
      validateWriteTerminalEvidence(session, failures);
    }
  }
  return Object.freeze(failures);
}

function stopForIntegrity(session, failures) {
  return freezeSession({
    ...session,
    status: "STOPPED",
    terminalState: RUNTIME_STATE_IDS.STOP_BEFORE_TEXT,
    currentSkill: session?.skillChain?.[session?.cursor] ?? null,
    pendingHostAction: null,
    integrityFailures: failures,
    trace: [...(session?.trace ?? []), { event: "SESSION_INTEGRITY_STOP", failures: clone(failures) }]
  });
}

function terminalFromResult(result) {
  if (result.decision === "FAILED_TEXT_QUARANTINE") return RUNTIME_STATE_IDS.FAILED_TEXT_QUARANTINE;
  if (["STOP", "STOP_BEFORE_TEXT", "STOP_AT_INITIAL_MOUNT"].includes(result.decision)) return RUNTIME_STATE_IDS.STOP_BEFORE_TEXT;
  return null;
}

export function advanceRuntimeSession(session, payload = {}) {
  const integrity = validateRuntimeSessionIntegrity(session);
  if (integrity.length > 0) return stopForIntegrity(session, integrity);
  if (runtimeSessionComplete(session)) return session;
  const skillId = session.skillChain?.[session.cursor];
  if (skillId == null) {
    const terminalFailures = [];
    if (session.plan?.maintenanceOperation != null) {
      const s00 = session.skillResults?.[RUNTIME_SKILL_IDS.MOUNT_BOOT];
      if (session.plan.maintenanceOperation !== "BOOT") terminalFailures.push(failure("UNSUPPORTED_MAINTENANCE_COMPLETION", "plan.maintenanceOperation"));
      if (s00?.pass !== true || s00?.decision !== "BOOT_READY") terminalFailures.push(failure("S00_BOOT_EVIDENCE_REQUIRED", "skillResults.S00"));
      if (terminalFailures.length > 0) return stopForIntegrity(session, terminalFailures);
      return freezeSession({ ...session, status: "COMPLETED", terminalState: RUNTIME_STATE_IDS.MAINTENANCE_COMPLETE_NO_BODY, currentSkill: null, pendingHostAction: null, trace: [...session.trace, { event: "SESSION_COMPLETED", terminalState: RUNTIME_STATE_IDS.MAINTENANCE_COMPLETE_NO_BODY }] });
    }
    validateWriteTerminalEvidence(session, terminalFailures);
    if (terminalFailures.length > 0) return stopForIntegrity(session, terminalFailures);
    return freezeSession({ ...session, status: "COMPLETED", terminalState: RUNTIME_STATE_IDS.SUCCESS, currentSkill: null, pendingHostAction: null, trace: [...session.trace, { event: "SESSION_COMPLETED", terminalState: RUNTIME_STATE_IDS.SUCCESS, successAuthority: RUNTIME_SKILL_IDS.FULL_CONVERGENCE_SWEEP }] });
  }

  const result = executeRuntimeSkill({ skillId, session, payload });
  const trace = [...session.trace, { event: "SKILL_EXECUTED", skillId, executorStatus: SKILL_EXECUTOR_STATUS[skillId], decision: result.decision }];
  if (result.decision === "HOST_ACTION_REQUIRED") return freezeSession({ ...session, status: "WAITING_FOR_HOST", currentSkill: skillId, pendingHostAction: clone(result), trace });
  const skillResults = { ...session.skillResults, [skillId]: clone(result) };
  if (result.pass !== true) {
    const terminalState = terminalFromResult(result) ?? RUNTIME_STATE_IDS.STOP_BEFORE_TEXT;
    return freezeSession({ ...session, status: terminalState === RUNTIME_STATE_IDS.FAILED_TEXT_QUARANTINE ? "QUARANTINED" : "STOPPED", terminalState, currentSkill: skillId, pendingHostAction: null, skillResults, trace });
  }
  const nextCursor = session.cursor + 1;
  return freezeSession({ ...session, status: "READY", terminalState: null, cursor: nextCursor, currentSkill: session.skillChain[nextCursor] ?? null, pendingHostAction: null, skillResults, trace });
}

export function runRuntimeUntilBoundary(session, payloadBySkill = {}) {
  let current = session;
  while (!runtimeSessionComplete(current) && current.status !== "WAITING_FOR_HOST") {
    const skillId = current.skillChain?.[current.cursor];
    current = advanceRuntimeSession(current, payloadBySkill?.[skillId] ?? {});
  }
  return current;
}
export function startRuntime(input = {}, payloadBySkill = {}) { return runRuntimeUntilBoundary(createRuntimeSession(input), payloadBySkill); }
export function resumeRuntimeSession(session, { payload = {}, payloadBySkill = {} } = {}) {
  const integrity = validateRuntimeSessionIntegrity(session);
  if (integrity.length > 0) return stopForIntegrity(session, integrity);
  if (session?.status !== "WAITING_FOR_HOST") return runRuntimeUntilBoundary(session, payloadBySkill);
  const skillId = session.currentSkill;
  const resumed = freezeSession({ ...session, status: "READY", pendingHostAction: null });
  const next = advanceRuntimeSession(resumed, payloadBySkill?.[skillId] ?? payload);
  return runRuntimeUntilBoundary(next, payloadBySkill);
}
export function summarizeRuntimeSession(session) {
  return Object.freeze({ engineId: session.engineId, runtimeVersion: session.runtimeVersion, status: session.status, terminalState: session.terminalState, bodyRoute: session.plan?.bodyRoute ?? null, currentSkill: session.currentSkill, cursor: session.cursor, skillCount: session.skillChain?.length ?? 0, pendingHostAction: session.pendingHostAction?.hostAction ?? null, completedSkills: Object.keys(session.skillResults ?? {}), soleSuccessAuthority: RUNTIME_SKILL_IDS.FULL_CONVERGENCE_SWEEP, integrityFailureCount: session.integrityFailures?.length ?? 0 });
}
