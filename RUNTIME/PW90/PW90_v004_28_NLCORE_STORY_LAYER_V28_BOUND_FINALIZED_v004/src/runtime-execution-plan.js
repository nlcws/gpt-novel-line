import { resolveCanonicalRuntimeRoute } from "./canonical-runtime-route.js";
import { CANONICAL_BODY_ROUTES } from "./runtime-route-contract.js";
import { skillChainForBodyRoute } from "./runtime-skill-chain.js";
import { ARTIFACT_POLICY, REPORT_POLICY, RUNTIME_GUARD_IDS, RUNTIME_STATE_IDS, SUCCESS_AUTHORITY } from "./runtime-vocabulary.js";
export const RUNTIME_EXECUTION_PLAN_ID = "PW90_RUNTIME_EXECUTION_PLAN";
const MAINTENANCE_GUARDS = Object.freeze([RUNTIME_GUARD_IDS.SOURCE_INTEGRITY, RUNTIME_GUARD_IDS.OPERATION_LOCK, RUNTIME_GUARD_IDS.AUTO_MOUNT_BOOT_HARD_LOCK]);
const FULLBURN_GUARDS = Object.freeze(Object.values(RUNTIME_GUARD_IDS));
function terminalPolicyFor(route) {
  if (route.decision === RUNTIME_STATE_IDS.STOP_BEFORE_TEXT) return Object.freeze({ currentState: RUNTIME_STATE_IDS.STOP_BEFORE_TEXT, allowedTerminalStates: Object.freeze([RUNTIME_STATE_IDS.STOP_BEFORE_TEXT]), requiresGateExecution: false });
  if (route.bodyRoute === CANONICAL_BODY_ROUTES.MAINTENANCE) return Object.freeze({ currentState: RUNTIME_STATE_IDS.MAINTENANCE_COMPLETE_NO_BODY, allowedTerminalStates: Object.freeze([RUNTIME_STATE_IDS.MAINTENANCE_COMPLETE_NO_BODY]), requiresGateExecution: false });
  return Object.freeze({ currentState: RUNTIME_STATE_IDS.EXECUTION_PLAN_READY, intermediateStates: Object.freeze([RUNTIME_STATE_IDS.ARTIFACT_READY]), allowedTerminalStates: Object.freeze([RUNTIME_STATE_IDS.FAILED_TEXT_QUARANTINE, RUNTIME_STATE_IDS.SUCCESS]), requiresGateExecution: true });
}
function policyFor(route) {
  if (route.decision === RUNTIME_STATE_IDS.STOP_BEFORE_TEXT) return Object.freeze({ requiredGuards: Object.freeze([RUNTIME_GUARD_IDS.SOURCE_INTEGRITY, RUNTIME_GUARD_IDS.OPERATION_LOCK]), successOrchestrator: null, artifactPolicy: null, reportPolicy: null });
  if (route.bodyRoute === CANONICAL_BODY_ROUTES.MAINTENANCE) return Object.freeze({ requiredGuards: MAINTENANCE_GUARDS, successOrchestrator: null, artifactPolicy: null, reportPolicy: null });
  return Object.freeze({ requiredGuards: FULLBURN_GUARDS, successOrchestrator: SUCCESS_AUTHORITY, artifactPolicy: ARTIFACT_POLICY, reportPolicy: REPORT_POLICY });
}
export function buildRuntimeExecutionPlan(input = {}) {
  const route = resolveCanonicalRuntimeRoute(input); const policy = policyFor(route); const terminalPolicy = terminalPolicyFor(route); const skillChain = route.bodyRoute == null ? Object.freeze([]) : skillChainForBodyRoute(route.bodyRoute);
  return Object.freeze({ planId: RUNTIME_EXECUTION_PLAN_ID, decision: route.decision === RUNTIME_STATE_IDS.STOP_BEFORE_TEXT ? RUNTIME_STATE_IDS.STOP_BEFORE_TEXT : "EXECUTION_PLAN_BUILT", routeDecision: route.decision, operation: route.operationMode ?? input.operation?.mode ?? null, writeMode: route.writeMode ?? null, inputBasis: route.inputBasis ?? null, bodyRoute: route.bodyRoute ?? null, resolvedLayerPolicy: route.resolvedLayerPolicy ?? null, canonicalStages: route.canonicalStages ?? Object.freeze([]), skillChain: skillChain ?? Object.freeze([]), requiredGuards: policy.requiredGuards, successOrchestrator: policy.successOrchestrator, artifactPolicy: policy.artifactPolicy, reportPolicy: policy.reportPolicy, terminalPolicy, maintenanceOperation: route.bodyRoute === CANONICAL_BODY_ROUTES.MAINTENANCE ? (route.operationMode ?? null) : null, planCreatesManuscript: false, planCreatesSuccess: false, planMutatesRoute: false, planChangesWriteBehavior: false, routeResolution: route });
}
const sameArray = (left, right) => JSON.stringify(left) === JSON.stringify(right);
export function validateRuntimeExecutionTrace(plan = {}, trace = {}) {
  const failures = [];
  if (trace.bodyRoute !== plan.bodyRoute) failures.push({ code: "EXECUTION_BODY_ROUTE_MISMATCH", path: "trace.bodyRoute" });
  if (!sameArray(trace.canonicalStages, plan.canonicalStages)) failures.push({ code: "EXECUTION_STAGE_ORDER_MISMATCH", path: "trace.canonicalStages" });
  if (!sameArray(trace.skillChain, plan.skillChain)) failures.push({ code: "EXECUTION_SKILL_CHAIN_MISMATCH", path: "trace.skillChain" });
  if (!sameArray(trace.requiredGuards, plan.requiredGuards)) failures.push({ code: "EXECUTION_GUARD_SET_MISMATCH", path: "trace.requiredGuards" });
  if (trace.maintenanceOperation !== plan.maintenanceOperation) failures.push({ code: "MAINTENANCE_OPERATION_MISMATCH", path: "trace.maintenanceOperation" });
  if (trace.artifactPreparedBeforeFullConvergence === true) failures.push({ code: "ARTIFACT_BEFORE_FULL_CONVERGENCE", path: "trace.artifactPreparedBeforeFullConvergence" });
  if (trace.planCreatesManuscript === true) failures.push({ code: "EXECUTION_PLAN_CANNOT_CREATE_MANUSCRIPT", path: "trace.planCreatesManuscript" });
  if (trace.planCreatesSuccess === true) failures.push({ code: "EXECUTION_PLAN_CANNOT_CREATE_SUCCESS", path: "trace.planCreatesSuccess" });
  if (trace.successAuthority != null && JSON.stringify(trace.successAuthority) !== JSON.stringify(plan.successOrchestrator)) failures.push({ code: "SUCCESS_AUTHORITY_MISMATCH", path: "trace.successAuthority" });
  const terminalState = trace.terminalState;
  if (terminalState == null) failures.push({ code: "EXECUTION_TERMINAL_STATE_REQUIRED", path: "trace.terminalState" });
  else if (!(plan.terminalPolicy?.allowedTerminalStates ?? []).includes(terminalState)) failures.push({ code: "EXECUTION_TERMINAL_STATE_NOT_ALLOWED", path: "trace.terminalState" });
  return Object.freeze({ decision: failures.length === 0 ? "EXECUTION_TRACE_ACCEPTED" : "EXECUTION_TRACE_REJECTED", failures: Object.freeze(failures) });
}
