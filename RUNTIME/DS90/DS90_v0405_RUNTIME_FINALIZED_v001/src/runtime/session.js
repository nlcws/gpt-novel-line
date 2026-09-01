import { createHash } from "node:crypto";

export const DS90_RUNTIME_VERSION = "ds90-v0405-nlcore-shelf-pkdb-origin-turn-runtime";

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function hash(value) {
  return createHash("sha256").update(JSON.stringify(stable(value))).digest("hex");
}

export function makeSession(request, routed, plan) {
  const frozenRequest = structuredClone(request);
  const frozenPlan = structuredClone(plan);
  const requestHash = hash(frozenRequest);
  const planHash = hash({ operation: routed.operation, spec: routed.spec, plan: frozenPlan });
  const session = {
    runtimeVersion: DS90_RUNTIME_VERSION,
    integrityModel: "CANONICAL_REPLAY_NON_CRYPTOGRAPHIC",
    sessionTrustBoundary: "HOST_INTERNAL_ONLY_UNLESS_EXTERNALLY_SIGNED",
    request: frozenRequest,
    route: {
      operation: routed.operation,
      spec: structuredClone(routed.spec),
      match: routed.match,
      trigger: routed.trigger ?? null
    },
    plan: frozenPlan,
    requestHash,
    planHash,
    hostResults: [],
    pendingAction: null,
    state: "CREATED",
    terminal: false,
    result: null,
    stateHash: null
  };
  return sealSessionState(session);
}

export function sealSessionState(session) {
  session.stateHash = hash({
    hostResults: session.hostResults,
    pendingAction: session.pendingAction,
    state: session.state,
    terminal: session.terminal
  });
  return session;
}

export function validateSessionIntegrity(session) {
  const issues = [];
  if (session?.runtimeVersion !== DS90_RUNTIME_VERSION) {
    issues.push({ code: "SESSION_RUNTIME_VERSION_MISMATCH", path: "runtimeVersion", message: "session runtime version mismatch", decision: "STOP" });
    return issues;
  }
  if (session?.integrityModel !== "CANONICAL_REPLAY_NON_CRYPTOGRAPHIC" || session?.sessionTrustBoundary !== "HOST_INTERNAL_ONLY_UNLESS_EXTERNALLY_SIGNED") {
    issues.push({ code: "SESSION_TRUST_BOUNDARY_INVALID", path: "sessionTrustBoundary", message: "serialized DS90 session integrity is non-cryptographic and valid only inside the trusted host boundary unless an external signature envelope is supplied", decision: "STOP" });
  }
  if (hash(session.request) !== session.requestHash) {
    issues.push({ code: "SESSION_REQUEST_TAMPERED", path: "request", message: "serialized session request was modified", decision: "STOP" });
  }
  if (hash({ operation: session.route?.operation, spec: session.route?.spec, plan: session.plan }) !== session.planHash) {
    issues.push({ code: "SESSION_PLAN_TAMPERED", path: "plan", message: "serialized session route/plan was modified", decision: "STOP" });
  }
  if (!Array.isArray(session.hostResults)) {
    issues.push({ code: "SESSION_HOST_RESULTS_INVALID", path: "hostResults", message: "hostResults must be an array", decision: "STOP" });
  } else if (typeof session.stateHash !== "string" || session.stateHash !== hash({
    hostResults: session.hostResults,
    pendingAction: session.pendingAction,
    state: session.state,
    terminal: session.terminal
  })) {
    issues.push({ code: "SESSION_MUTABLE_STATE_TAMPERED", path: "stateHash", message: "serialized session host-results/pending-action state was modified", decision: "STOP" });
  }
  return issues;
}

export function actionIdFor(session, type) {
  return `${type}:${hash({ requestHash: session.requestHash, planHash: session.planHash, type }).slice(0, 20)}`;
}
