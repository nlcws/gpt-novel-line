import { SOURCE_POLICY } from "../catalog.js";
import { validateExtensions } from "../extensions.js";
import { validateOperationReads } from "../loading/manifest.js";
import { applyUserOverrides } from "../override.js";
import { runModule, resolveCoreState } from "./program.js";
import {
  validateDesignerDiscipline,
  validateNewItemRegistration,
  validatePkdbEvidenceBoundary,
  validateSemanticDefinitionStability,
  validateProvenanceUpdateBoundary,
  validatePkdbInputRecognition
} from "../validation/designerGates.js";
import {
  operationNeedsProjectKnowledge,
  buildPkdbAccessAction,
  validatePkdbAccessResult,
  buildSourceMaterializeAction,
  validateMaterializeResult,
  buildKnowledgeEvidence
} from "../skills/pkdbRead.js";
import { extractShelfPointers } from "../indexing/validator.js";
import { buildShelfReadAction, validateShelfReadResult } from "../skills/shelfRead.js";
import { buildPkdbInputProposal } from "../skills/pkdbInput.js";
import {
  buildCurrent000CDispatchResolveAction,
  validateCurrent000CDispatchResolveResult,
  buildSpecialistHostAction,
  validateSpecialistHostResult
} from "../skills/specialistDispatch.js";

function issue(code, path, message, decision = "STOP") {
  return { code, path, message, decision };
}

function validateSources(sources = []) {
  const issues = [];
  for (let index = 0; index < sources.length; index += 1) {
    const source = sources[index];
    const policy = SOURCE_POLICY[source.type];
    if (policy == null) issues.push(issue("UNKNOWN_SOURCE_TYPE", `sources[${index}].type`, "未知の資料種別"));
    if (source.canonical === true && policy !== "CANONICAL") {
      issues.push(issue("ILLEGAL_CANONICAL_PROMOTION", `sources[${index}]`, `${source.type}は正本にできない`));
    }
    if (source.read === false && source.required === true) {
      issues.push(issue("REQUIRED_SOURCE_UNREAD", `sources[${index}]`, "必須資料が未読"));
    }
  }
  return issues;
}

function get(input, path) {
  return path.split(".").reduce((value, key) => value?.[key], input);
}

export function validateRequiredFields(spec, request) {
  return (spec.required ?? [])
    .filter((path) => {
      const value = get(request, path);
      return value == null || value === false || value === "";
    })
    .map((path) => issue("OPERATION_INPUT_REQUIRED", path, `${path}が必要です`));
}

function stage(moduleId, issues, extras = {}) {
  return { decision: issues.length === 0 ? "PASS" : "STOP", moduleId, issues, ...extras };
}

function flattenIssues(stages) {
  return stages.flatMap((entry) => (entry?.issues ?? []).map((item) => ({ ...item, moduleId: entry.moduleId })));
}

function findHostResult(hostResults, action) {
  return [...hostResults].reverse().find((entry) => entry?.actionId === action.actionId) ?? null;
}

function runKnowledgeBoundary({ operation, request, hostResults, makeActionId }) {
  if (!operationNeedsProjectKnowledge(operation, request)) {
    return { issues: [], hostAction: null, knowledgeEvidence: null, stages: [] };
  }
  const accessBuilt = buildPkdbAccessAction(operation, request, makeActionId);
  if (accessBuilt.issues.length > 0 || accessBuilt.action == null) {
    const accessPlanStage = stage("K01_PKDB_ACCESS_REQUEST", accessBuilt.issues);
    return { issues: accessBuilt.issues, hostAction: null, knowledgeEvidence: null, stages: [accessPlanStage] };
  }
  const accessAction = accessBuilt.action;
  const accessResult = findHostResult(hostResults, accessAction);
  if (accessResult == null) {
    return { issues: [], hostAction: accessAction, knowledgeEvidence: null, stages: [] };
  }
  const accessChecked = validatePkdbAccessResult(accessAction, accessResult);
  const accessStage = stage("K01_PKDB_ACCESS_REQUEST", accessChecked.issues);
  if (accessChecked.issues.length > 0) {
    return { issues: accessChecked.issues, hostAction: null, knowledgeEvidence: null, stages: [accessStage] };
  }
  const normalizedAccess = accessChecked.normalized;
  const located = extractShelfPointers(normalizedAccess.semanticRecords ?? []);
  if (located.issues.length > 0) {
    const locatorStage = stage("DS90_INDEX_SEARCH_POINTER_RESOLUTION", located.issues);
    return { issues: located.issues, hostAction: null, knowledgeEvidence: null, stages: [accessStage, locatorStage] };
  }

  if (located.pointers.length > 0) {
    const shelfBuilt = buildShelfReadAction(located.pointers, makeActionId);
    const shelfPlanStage = stage("K04_PROJECT_SHELF_READ_REQUEST", shelfBuilt.issues);
    if (shelfBuilt.issues.length > 0 || shelfBuilt.action == null) {
      return { issues: shelfBuilt.issues, hostAction: null, knowledgeEvidence: null, stages: [accessStage, shelfPlanStage] };
    }
    const shelfResult = findHostResult(hostResults, shelfBuilt.action);
    if (shelfResult == null) {
      return { issues: [], hostAction: shelfBuilt.action, knowledgeEvidence: null, stages: [accessStage, shelfPlanStage] };
    }
    const shelfChecked = validateShelfReadResult(shelfBuilt.action, shelfResult);
    const shelfStage = stage("K04_PROJECT_SHELF_READ_REQUEST", shelfChecked.issues);
    const evidence = shelfChecked.issues.length === 0
      ? buildKnowledgeEvidence(normalizedAccess, { shelfPointers: located.pointers, shelfReads: shelfChecked.evidence, route: "CURRENT_SHELF_LOCATOR" })
      : null;
    return {
      issues: shelfChecked.issues, hostAction: null, knowledgeEvidence: evidence,
      stages: [accessStage, shelfPlanStage, shelfStage]
    };
  }

  const sourceFallbackAllowed = request?.knowledgeRequest?.allowSourceMaterializeFallback === true;
  if ((normalizedAccess.sourceIds?.length ?? 0) > 0 && sourceFallbackAllowed) {
    const materializeAction = buildSourceMaterializeAction(normalizedAccess, makeActionId);
    const materializeResult = findHostResult(hostResults, materializeAction);
    if (materializeResult == null) {
      return { issues: [], hostAction: materializeAction, knowledgeEvidence: null, stages: [accessStage] };
    }
    const materialChecked = validateMaterializeResult(materializeAction, materializeResult);
    const materialStage = stage("K02_SOURCE_MATERIALIZE_REQUEST", materialChecked.issues);
    const evidence = materialChecked.issues.length === 0
      ? buildKnowledgeEvidence(normalizedAccess, { materializedEvidence: materialChecked.evidence, route: "SOURCE_MATERIALIZE_FALLBACK" })
      : null;
    return {
      issues: materialChecked.issues, hostAction: null, knowledgeEvidence: evidence,
      stages: [accessStage, materialStage]
    };
  }

  const noPointerIssues = [issue(
    "PKDB_LOOKUP_NO_CURRENT_SHELF_POINTER",
    "hostResult.semanticRecords[]",
    "v0401 requires PKDB lookup metadata to resolve a current project shelf locator before design; schema-legal current-mount SOURCE payload.locator is standard, SOURCE materialize is fallback-only when explicitly enabled"
  )];
  return {
    issues: noPointerIssues, hostAction: null, knowledgeEvidence: null,
    stages: [accessStage, stage("DS90_INDEX_SEARCH_POINTER_RESOLUTION", noPointerIssues)]
  };
}

function operationClassification(operation) {
  const roleContinuity = "DS90_CONTROL_ACTIVE_UNTIL_EXPLICIT_USER_ROLE_CHANGE";
  if (operation === "LOG") return { operationClass: "VALIDATION_AND_PKDB_INPUT_RECOGNITION", persistenceAuthority: "NONE_VALIDATION_ONLY", roleContinuity };
  if (operation === "ARCHIVE") return { operationClass: "ARCHIVE_CANDIDATE_VALIDATION", persistenceAuthority: "NONE_VALIDATION_ONLY", roleContinuity };
  if (["MOUNT_TRANSFER", "PACK_CUTOUT", "MOUNT_ZIP_BOOTSTRAP", "SPECIALIST_HANDOFF"].includes(operation)) {
    return { operationClass: "SPECIALIST_RUNTIME_DISPATCH", persistenceAuthority: "SPECIALIST_RUNTIME", roleContinuity };
  }
  return { operationClass: "DESIGN_VALIDATION", persistenceAuthority: "NO_IMPLICIT_WRITE_PERSISTENCE", roleContinuity };
}

export function runOperation({ request, routed, plan, hostResults, makeActionId }) {
  const stages = [];
  const inputIssues = validateRequiredFields(routed.spec, request);
  stages.push(stage("OPERATION_INPUT", inputIssues));

  const loadResult = validateOperationReads(routed.operation, request.boot?.readLedger, {
    minimumFallback: plan.kind === "DS90_MINIMUM_FALLBACK"
  });
  stages.push(loadResult);

  const coreResult = runModule("CORE", request);
  stages.push(coreResult);
  const coreState = resolveCoreState(request);

  const commonIssues = validateSources(request.sources);
  stages.push(stage("SOURCE_POLICY", commonIssues));
  const extensionIssues = validateExtensions(routed.operation, request.meta, request.payload);
  stages.push(stage("EXTENSIONS", extensionIssues));

  if (stages.some((entry) => entry.decision === "STOP")) {
    const rawIssues = flattenIssues(stages);
    const overridden = applyUserOverrides(rawIssues, request.userOverrides, routed.operation);
    return {
      stages, hostAction: null, requestedResult: null, moduleOutput: null,
      knowledgeEvidence: null, pkdbInputProposal: null,
      remainingIssues: overridden.remaining, consumedOverrides: overridden.consumed,
      coreState,
      ...operationClassification(routed.operation)
    };
  }

  if (plan.kind === "SPECIALIST_HOST") {
    const dispatchBuilt = buildCurrent000CDispatchResolveAction(routed.operation, request, makeActionId);
    if (dispatchBuilt.issues.length > 0) stages.push(stage("R00_CURRENT_000C_DISPATCH_RESOLVE", dispatchBuilt.issues));
    let routeProof = null;
    if (dispatchBuilt.action != null) {
      const dispatchResult = findHostResult(hostResults, dispatchBuilt.action);
      if (dispatchResult == null) {
        const rawIssues = flattenIssues(stages);
        const overridden = applyUserOverrides(rawIssues, request.userOverrides, routed.operation);
        return {
          stages, hostAction: dispatchBuilt.action, requestedResult: null, moduleOutput: null,
          knowledgeEvidence: null, pkdbInputProposal: null,
          remainingIssues: overridden.remaining, consumedOverrides: overridden.consumed,
          coreState,
          ...operationClassification(routed.operation)
        };
      }
      const dispatchChecked = validateCurrent000CDispatchResolveResult(dispatchBuilt.action, dispatchResult);
      stages.push(stage("R00_CURRENT_000C_DISPATCH_RESOLVE", dispatchChecked.issues, { dispatchProof: dispatchChecked.proof }));
      if (dispatchChecked.issues.length > 0) {
        const rawIssues = flattenIssues(stages);
        const overridden = applyUserOverrides(rawIssues, request.userOverrides, routed.operation);
        return {
          stages, hostAction: null, requestedResult: null, moduleOutput: null,
          knowledgeEvidence: null, pkdbInputProposal: null,
          remainingIssues: overridden.remaining, consumedOverrides: overridden.consumed,
          coreState,
          ...operationClassification(routed.operation)
        };
      }
      routeProof = dispatchChecked.proof;
    }
    const built = buildSpecialistHostAction(routed.operation, request, makeActionId, routeProof);
    if (built.issues.length > 0) stages.push(stage("R01_SPECIALIST_DISPATCH", built.issues));
    if (built.action != null) {
      const hostResult = findHostResult(hostResults, built.action);
      if (hostResult == null) {
        const rawIssues = flattenIssues(stages);
        const overridden = applyUserOverrides(rawIssues, request.userOverrides, routed.operation);
        return {
          stages, hostAction: built.action, requestedResult: null, moduleOutput: null,
          knowledgeEvidence: null, pkdbInputProposal: null,
          remainingIssues: overridden.remaining, consumedOverrides: overridden.consumed,
          coreState,
          ...operationClassification(routed.operation)
        };
      }
      const checked = validateSpecialistHostResult(built.action, hostResult);
      stages.push(stage("R01_SPECIALIST_DISPATCH", checked.issues, { specialistResult: hostResult }));
      const moduleOutput = checked.issues.length === 0 ? {
        specialistTarget: built.action.target,
        specialistDecision: hostResult.decision,
        specialistCompleted: hostResult.completed === true,
        resultKind: hostResult.resultKind,
        resultRef: hostResult.resultRef ?? null,
        artifact: hostResult.artifact ?? null,
        dispatchProof: routeProof
      } : null;
      const rawIssues = flattenIssues(stages);
      const overridden = applyUserOverrides(rawIssues, request.userOverrides, routed.operation);
      return {
        stages, hostAction: null, requestedResult: null, moduleOutput,
        knowledgeEvidence: null, pkdbInputProposal: null,
        remainingIssues: overridden.remaining, consumedOverrides: overridden.consumed,
        coreState,
        specialistDecision: hostResult.decision,
        ...operationClassification(routed.operation)
      };
    }
  }

  const knowledge = runKnowledgeBoundary({ operation: routed.operation, request, hostResults, makeActionId });
  stages.push(...knowledge.stages);
  if (knowledge.hostAction != null) {
    const rawIssues = flattenIssues(stages);
    const overridden = applyUserOverrides(rawIssues, request.userOverrides, routed.operation);
    return {
      stages, hostAction: knowledge.hostAction, requestedResult: null, moduleOutput: null,
      knowledgeEvidence: null, pkdbInputProposal: null,
      remainingIssues: overridden.remaining, consumedOverrides: overridden.consumed,
      coreState,
      ...operationClassification(routed.operation)
    };
  }
  if (knowledge.issues.length > 0) {
    const rawIssues = flattenIssues(stages);
    const overridden = applyUserOverrides(rawIssues, request.userOverrides, routed.operation);
    return {
      stages, hostAction: null, requestedResult: null, moduleOutput: null,
      knowledgeEvidence: null, pkdbInputProposal: null,
      remainingIssues: overridden.remaining, consumedOverrides: overridden.consumed,
      coreState,
      ...operationClassification(routed.operation)
    };
  }

  const activeRequest = knowledge.knowledgeEvidence == null
    ? request
    : { ...request, runtimeEvidence: { ...(request.runtimeEvidence ?? {}), pkdb: knowledge.knowledgeEvidence } };

  const disciplineResult = validateDesignerDiscipline(routed.operation, activeRequest);
  const registrationResult = validateNewItemRegistration(routed.operation, activeRequest);
  const evidenceBoundary = validatePkdbEvidenceBoundary(routed.operation, activeRequest);
  const semanticStability = validateSemanticDefinitionStability(routed.operation, activeRequest);
  const provenanceBoundary = validateProvenanceUpdateBoundary(routed.operation, activeRequest);
  const inputRecognition = validatePkdbInputRecognition(routed.operation, activeRequest);
  stages.push(disciplineResult, registrationResult, evidenceBoundary, semanticStability, provenanceBoundary, inputRecognition);

  const requestedResult = routed.spec.tool === "CORE" ? null : runModule(plan.tool, activeRequest);
  if (requestedResult) stages.push(requestedResult);

  const preProposalStop = stages.some((entry) => entry.decision === "STOP");
  const proposalBuilt = preProposalStop
    ? { issues: [], proposal: null }
    : buildPkdbInputProposal(routed.operation, activeRequest, knowledge.knowledgeEvidence);
  stages.push(stage("K03_PKDB_INPUT_PROPOSAL", proposalBuilt.issues));

  const rawIssues = flattenIssues(stages);
  const overridden = applyUserOverrides(rawIssues, request.userOverrides, routed.operation);
  let moduleOutput = requestedResult?.moduleOutput ?? null;
  if (plan.kind === "DS90_MINIMUM_FALLBACK" && moduleOutput != null) {
    moduleOutput = {
      ...moduleOutput,
      ds90MinimumFallback: true,
      limitationNotice: "This is DS90 internal minimum fallback and is not specialist-runtime complete."
    };
  }
  return {
    stages,
    hostAction: null,
    requestedResult,
    moduleOutput,
    modeCompletion: requestedResult?.completionState ?? null,
    activationState: requestedResult?.activationState ?? null,
    materialState: requestedResult?.materialState ?? null,
    invocation: requestedResult?.invocation ?? null,
    knowledgeEvidence: knowledge.knowledgeEvidence,
    pkdbInputProposal: proposalBuilt.proposal,
    remainingIssues: overridden.remaining,
    consumedOverrides: overridden.consumed,
    coreState,
    ...operationClassification(routed.operation)
  };
}
