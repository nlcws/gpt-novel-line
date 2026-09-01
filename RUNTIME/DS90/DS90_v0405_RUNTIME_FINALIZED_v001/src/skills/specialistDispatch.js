import { specialistHandoffModule } from "../modules/specialistHandoff.js";

const issue = (code, path, message) => ({ code, path, message, decision: "STOP", nonOverrideable: true });
const HEX64 = /^[0-9a-f]{64}$/i;

const FIXED = Object.freeze({
  MOUNT_TRANSFER: { target: "MT00", dispatchRoute: "MOUNT_TRANSFER", resultKind: "MOUNT_TRANSFER_ARTIFACT" },
  PACK_CUTOUT: { target: "SP00", dispatchRoute: "PACK_CUTOUT", resultKind: "STORY_PACK_ARTIFACT" },
  MOUNT_ZIP_BOOTSTRAP: { target: "MT00_BOOTSTRAP_EA", dispatchRoute: "MOUNT_ZIP_BOOTSTRAP", resultKind: "MOUNT_ZIP_ARTIFACT" }
});

function resolveDynamicTarget(request) {
  const validated = specialistHandoffModule.validate(request);
  if (validated.issues.length > 0) return { issues: validated.issues, target: null, handoff: null };
  return { issues: [], target: validated.output.target, handoff: validated.output };
}

export function resolveSpecialistDispatch(operation, request) {
  if (FIXED[operation]) return { issues: [], ...FIXED[operation] };
  if (operation !== "SPECIALIST_HANDOFF") {
    return { issues: [issue("SPECIALIST_OPERATION_INVALID", "operation", "operation is not a specialist-dispatch operation")] };
  }
  const dynamic = resolveDynamicTarget(request);
  if (dynamic.issues.length > 0) return dynamic;
  const routeMap = {
    MT00: "MOUNT_TRANSFER",
    SP00: "PACK_CUTOUT",
    MT00_BOOTSTRAP_EA: "MOUNT_ZIP_BOOTSTRAP",
    PW90_STORY_PACK_RECEIVER_CHECKER: "STORY_PACK_RECEIVER_CHECK",
    PW90: null,
    TS90: null
  };
  const resultKinds = {
    MT00: "MOUNT_TRANSFER_ARTIFACT",
    SP00: "STORY_PACK_ARTIFACT",
    MT00_BOOTSTRAP_EA: "MOUNT_ZIP_ARTIFACT",
    PW90_STORY_PACK_RECEIVER_CHECKER: "RECEIVER_CHECK_RESULT",
    PW90: "WRITING_RESULT",
    TS90: "REVISION_RESULT"
  };
  return {
    issues: [], target: dynamic.target,
    dispatchRoute: routeMap[dynamic.target] ?? null,
    resultKind: resultKinds[dynamic.target] ?? "SPECIALIST_RESULT",
    handoff: dynamic.handoff
  };
}

export function buildCurrent000CDispatchResolveAction(operation, request, makeActionId) {
  const resolved = resolveSpecialistDispatch(operation, request);
  if ((resolved.issues ?? []).length > 0) return { issues: resolved.issues, action: null, resolved: null };
  if (resolved.dispatchRoute == null) return { issues: [], action: null, resolved };
  return {
    issues: [], resolved,
    action: {
      actionId: makeActionId("CURRENT_000C_DISPATCH_RESOLVE"),
      actionType: "CURRENT_000C_DISPATCH_RESOLVE",
      skillId: "R00_CURRENT_000C_DISPATCH_RESOLVE",
      operation,
      target: resolved.target,
      dispatchRoute: resolved.dispatchRoute,
      manifestPath: "00_READ_FIRST/RUNTIME_DIRECT_DISPATCH.json",
      expectedProof: "CURRENT_000_C_EXACT_ROUTE_PATH_AND_SHA256",
      rule: "The host must read the currently mounted 000_C dispatch and verify the exact selected target bytes. Request-side dispatch claims are not evidence."
    }
  };
}

export function validateCurrent000CDispatchResolveResult(action, result) {
  const issues = [];
  if (result?.actionId !== action.actionId || result?.actionType !== "CURRENT_000C_DISPATCH_RESOLVE") {
    issues.push(issue("SPECIALIST_DISPATCH_PROOF_ACTION_MISMATCH", "hostResult", "current 000_C dispatch proof does not match the pending R00 action"));
    return { issues, proof: null };
  }
  if (result?.decision !== "VERIFIED" || result?.source !== "CURRENT_000_C") {
    issues.push(issue("SPECIALIST_DISPATCH_PROOF_NOT_VERIFIED", "hostResult.decision", "specialist dispatch requires VERIFIED proof from the current mounted 000_C"));
  }
  if (result?.manifestPath !== action.manifestPath || result?.routeKey !== action.dispatchRoute || result?.target !== action.target) {
    issues.push(issue("SPECIALIST_DISPATCH_PROOF_ROUTE_MISMATCH", "hostResult", "dispatch proof route/target/manifest must exactly match the pending action"));
  }
  if (typeof result?.path !== "string" || result.path.trim() === "") {
    issues.push(issue("SPECIALIST_DISPATCH_PROOF_PATH_MISSING", "hostResult.path", "dispatch proof must include the exact current-000_C target path"));
  }
  if (!HEX64.test(String(result?.declaredSha256 ?? "")) || !HEX64.test(String(result?.actualSha256 ?? "")) || String(result.declaredSha256).toLowerCase() !== String(result.actualSha256).toLowerCase()) {
    issues.push(issue("SPECIALIST_DISPATCH_PROOF_SHA_MISMATCH", "hostResult", "dispatch proof must bind declared route SHA-256 to the exact selected current-000_C target bytes"));
  }
  const proof = issues.length === 0 ? {
    source: "CURRENT_000_C",
    manifestPath: result.manifestPath,
    routeKey: result.routeKey,
    target: result.target,
    path: result.path,
    sha256: String(result.actualSha256).toLowerCase(),
    verified: true
  } : null;
  return { issues, proof };
}

export function buildSpecialistHostAction(operation, request, makeActionId, routeProof = null) {
  const resolved = resolveSpecialistDispatch(operation, request);
  const issues = [...(resolved.issues ?? [])];
  if (resolved.dispatchRoute != null) {
    if (!routeProof || routeProof.verified !== true || routeProof.source !== "CURRENT_000_C" || routeProof.routeKey !== resolved.dispatchRoute || routeProof.target !== resolved.target) {
      issues.push(issue("SPECIALIST_DISPATCH_TRUSTED_PROOF_REQUIRED", "routeProof", `${resolved.dispatchRoute} requires a trusted R00 proof from the current mounted 000_C`));
    }
  }
  if (issues.length > 0) return { issues, action: null };
  return {
    issues: [],
    action: {
      actionId: makeActionId("SPECIALIST_RUNTIME_INVOKE"),
      actionType: "SPECIALIST_RUNTIME_INVOKE",
      skillId: "R01_SPECIALIST_DISPATCH",
      operation,
      target: resolved.target,
      dispatchRoute: resolved.dispatchRoute,
      routeEvidence: routeProof == null ? null : structuredClone(routeProof),
      resultKind: resolved.resultKind,
      handoff: resolved.handoff ?? null,
      runtimeInput: structuredClone(request),
      inputAuthority: "ORIGINAL_DS90_REQUEST_PRESERVED",
      resultProofSchema: `DS90_${resolved.target}_RESULT_PROOF_v001`,
      rule: "DS90 must wait for the real specialist result and validate target-specific result proof; dispatch metadata or a generic ref cannot constitute completion."
    }
  };
}

function validateTargetSpecificArtifact(action, result) {
  const issues = [];
  const artifact = result?.artifact;
  if (!artifact || typeof artifact !== "object" || Array.isArray(artifact)) {
    issues.push(issue("SPECIALIST_STRUCTURED_ARTIFACT_PROOF_REQUIRED", "hostResult.artifact", `${action.target} PASS requires a structured artifact proof`));
    return issues;
  }
  if (artifact.kind !== action.resultKind) {
    issues.push(issue("SPECIALIST_ARTIFACT_KIND_MISMATCH", "hostResult.artifact.kind", `artifact.kind must exactly match ${action.resultKind}`));
  }
  switch (action.target) {
    case "MT00":
      if (!HEX64.test(String(artifact.zipSha256 ?? "")) || artifact.validatorDecision !== "PASS") {
        issues.push(issue("MT00_RESULT_PROOF_INVALID", "hostResult.artifact", "MT00 completion requires a real ZIP SHA-256 and validatorDecision=PASS"));
      }
      break;
    case "SP00":
      if (!HEX64.test(String(artifact.zipSha256 ?? "")) || artifact.validationDecision !== "PASS" || artifact.selfContained !== true) {
        issues.push(issue("SP00_RESULT_PROOF_INVALID", "hostResult.artifact", "SP00 completion requires a self-contained story-pack ZIP SHA-256 with validationDecision=PASS"));
      }
      break;
    case "MT00_BOOTSTRAP_EA":
      if (!HEX64.test(String(artifact.zipSha256 ?? "")) || artifact.validatorDecision !== "PASS") {
        issues.push(issue("EA_RESULT_PROOF_INVALID", "hostResult.artifact", "Ea completion requires a real mount ZIP SHA-256 and validatorDecision=PASS"));
      }
      break;
    case "PW90_STORY_PACK_RECEIVER_CHECKER":
      if (artifact.acceptedByPw90 !== true || artifact.writableOnPw90Line !== true || !String(artifact.receiverDecision ?? "").startsWith("PW90_RECEIVER_ACCEPTS_")) {
        issues.push(issue("PW90_RECEIVER_RESULT_PROOF_INVALID", "hostResult.artifact", "receiver completion requires an actual accepting PW90 receiver decision"));
      }
      break;
    case "PW90":
      if (artifact.terminalState !== "SUCCESS" || artifact.artifactKind !== "PW90_FULLY_CONVERGED_TEXT_ARTIFACT" || typeof artifact.artifactRef !== "string" || artifact.artifactRef.trim() === "") {
        issues.push(issue("PW90_RESULT_PROOF_INVALID", "hostResult.artifact", "PW90 completion requires SUCCESS plus a fully converged text artifact reference"));
      }
      break;
    case "TS90":
      if (artifact.terminalDecision !== "TERMINAL_LOCKS_PASS" || !["PHASE_A_SUCCESS", "PHASE_B_SUCCESS", "A_TO_C_TXTDL_PASS"].includes(artifact.outputDecision) || typeof artifact.artifactRef !== "string" || artifact.artifactRef.trim() === "") {
        issues.push(issue("TS90_RESULT_PROOF_INVALID", "hostResult.artifact", "TS90 completion requires terminal locks PASS, a recognized success output decision, and an artifact reference"));
      }
      break;
    default:
      issues.push(issue("SPECIALIST_RESULT_SCHEMA_UNKNOWN", "hostResult.artifact", `no specialist result schema is registered for ${action.target}`));
  }
  return issues;
}

export function validateSpecialistHostResult(action, result) {
  const issues = [];
  if (result?.actionId !== action.actionId || result?.actionType !== "SPECIALIST_RUNTIME_INVOKE") {
    issues.push(issue("SPECIALIST_RESULT_ACTION_MISMATCH", "hostResult", "specialist result does not match the pending action"));
    return { issues };
  }
  if (result?.target !== action.target) {
    issues.push(issue("SPECIALIST_RESULT_TARGET_MISMATCH", "hostResult.target", "specialist result target does not match dispatch target"));
  }
  if (!["PASS", "STOP"].includes(result?.decision)) {
    issues.push(issue("SPECIALIST_RESULT_DECISION_INVALID", "hostResult.decision", "specialist result decision must be PASS or STOP"));
  }
  if (result?.decision === "STOP") {
    issues.push(issue("SPECIALIST_RUNTIME_STOP", "hostResult.decision", "specialist runtime returned STOP"));
  }
  if (result?.decision === "PASS") {
    if (result?.completed !== true) {
      issues.push(issue("SPECIALIST_RESULT_NOT_COMPLETED", "hostResult.completed", "PASS requires completed=true from the specialist runtime"));
    }
    if (result?.resultKind !== action.resultKind) {
      issues.push(issue("SPECIALIST_RESULT_KIND_MISMATCH", "hostResult.resultKind", `PASS resultKind must exactly match ${action.resultKind}`));
    }
    issues.push(...validateTargetSpecificArtifact(action, result));
  }
  return { issues };
}
