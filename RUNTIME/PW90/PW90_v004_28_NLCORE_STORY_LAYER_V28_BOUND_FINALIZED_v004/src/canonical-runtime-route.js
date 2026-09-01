import { evaluateOperationLock } from "./operation-lock.js";
import { resolveDefaultWriteMode } from "./default-write-mode-lock.js";
import { resolveSecondDraftBranch } from "./second-draft-branch-lock.js";
import { CANONICAL_BODY_ROUTES, CANONICAL_ROUTE_STAGE_SETS, CANONICAL_RUNTIME_ROUTE_ID, CANONICAL_RUNTIME_STAGE_ORDER } from "./runtime-route-contract.js";
import { bodySequenceForRoute } from "./runtime-skill-chain.js";
export { CANONICAL_BODY_ROUTES, CANONICAL_RUNTIME_ROUTE_ID, CANONICAL_RUNTIME_STAGE_ORDER };

function stop(reason, failures = []) {
  return Object.freeze({ routeId: CANONICAL_RUNTIME_ROUTE_ID, decision: "STOP_BEFORE_TEXT", manuscriptTextAllowed: false, bodyRoute: null, reason, failures: Object.freeze([...failures]) });
}

export function resolveCanonicalBodyRoute({ writeMode = "FULLBURN", inputBasis = "PACK_ONLY", secondDraftBranch = "INACTIVE" } = {}) {
  if (secondDraftBranch === "ACTIVE" && inputBasis === "PACK_PLUS_BODY_TEXT") {
    return Object.freeze({ bodyRoute: CANONICAL_BODY_ROUTES.PACK_PLUS_BODY_TEXT, writeMode, inputBasis, secondDraftBranch, externalSecondDraftRequired: true });
  }
  if (writeMode !== "FULLBURN") {
    return Object.freeze({ bodyRoute: null, writeMode, inputBasis, secondDraftBranch, externalSecondDraftRequired: false, unsupported: true, reason: "LIGHTWEIGHT_MODE_UNSUPPORTED_CURRENT_RUNTIME" });
  }
  return Object.freeze({ bodyRoute: CANONICAL_BODY_ROUTES.PACK_ONLY_FULLBURN, writeMode: "FULLBURN", inputBasis: "PACK_ONLY", secondDraftBranch: "INACTIVE", externalSecondDraftRequired: false });
}

export function resolveCanonicalRuntimeRoute(input = {}) {
  const operation = evaluateOperationLock(input.operation);
  if (operation.decision !== "OPERATION_ALLOWED") return stop("OPERATION_LOCK_FAILED", operation.failures);
  if (operation.mode !== "WRITE") {
    return Object.freeze({
      routeId: CANONICAL_RUNTIME_ROUTE_ID,
      decision: "MAINTENANCE_ROUTE_RESOLVED",
      operationMode: operation.mode,
      manuscriptTextAllowed: false,
      bodyRoute: CANONICAL_BODY_ROUTES.MAINTENANCE,
      canonicalStages: CANONICAL_ROUTE_STAGE_SETS.MAINTENANCE,
      nextStage: null,
      resolvedLayerPolicy: null,
      failures: Object.freeze([])
    });
  }
  const writeMode = resolveDefaultWriteMode({ trigger: input.writeTrigger, explicitLightweightMode: input.explicitLightweightMode, userRequestedFullPowerWord: input.userRequestedFullPowerWord });
  if (writeMode.decision === "STOP_BEFORE_TEXT") return stop("WRITE_MODE_RESOLUTION_FAILED", writeMode.failures);
  const secondDraft = resolveSecondDraftBranch({
    hasWritableStoryPack: input.hasWritableStoryPack,
    hasBodyTxt: input.hasBodyTxt,
    hasPastedBodyText: input.hasPastedBodyText,
    hasExistingDraftText: input.hasExistingDraftText,
    hasFirstDraftText: input.hasFirstDraftText
  });
  if (secondDraft.decision === "STOP") return stop(secondDraft.reason);
  const bodyRoute = resolveCanonicalBodyRoute({ writeMode: writeMode.writeMode, inputBasis: secondDraft.inputBasis, secondDraftBranch: secondDraft.secondDraftBranch });
  return Object.freeze({
    routeId: CANONICAL_RUNTIME_ROUTE_ID,
    decision: "WRITE_ROUTE_RESOLVED",
    operationMode: operation.mode,
    manuscriptTextAllowed: true,
    bodyRoute: bodyRoute.bodyRoute,
    writeMode: writeMode.writeMode,
    inputBasis: bodyRoute.inputBasis,
    secondDraftBranch: bodyRoute.secondDraftBranch,
    externalSecondDraftRequired: bodyRoute.externalSecondDraftRequired,
    resolvedLayerPolicy: operation.resolvedLayerPolicy,
    layerPolicySource: operation.layerPolicySource,
    canonicalStages: CANONICAL_ROUTE_STAGE_SETS.WRITE,
    bodySequence: bodySequenceForRoute(bodyRoute.bodyRoute),
    nextStage: "PREWRITE",
    operation,
    writeModeResolution: writeMode,
    secondDraftResolution: secondDraft,
    failures: Object.freeze([])
  });
}
