import { createHash } from "node:crypto";
import { stableStringify, jsonDataFailureCode } from "./json-data.js";
import {
  RUNTIME_VERSION,
  PACKAGE_VERSION
} from "./program.js";
import {
  evaluateAToCTXTDLOutput,
  evaluateTitleDecisionReport,
  evaluateToshiOutput,
  evaluateToshiReceive,
  extractBodyText
} from "./receive-gate.js";

export const TS90_RUNTIME_SESSION_SCHEMA = "TS90_RUNTIME_SESSION_v004";
export const TS90_RUNTIME_ACTION_SCHEMA = "TS90_RUNTIME_HOST_ACTION_v001";

export const TS90_RUNTIME_SKILLS = Object.freeze([
  "T00_RECEIVE",
  "T01_PHASE_A_DIAGNOSIS",
  "T02_PHASE_B_REVISION",
  "T03_PHASE_C_TITLE",
  "T04_TXTDL_BUILD",
  "T05_TERMINAL_AUDIT"
]);

const sha256 = (value) => createHash("sha256").update(String(value), "utf8").digest("hex");

const hasText = (value) => typeof value === "string" && value.trim() !== "";
const text = (...values) => values.find(hasText)?.trim() ?? "";

function routeForReceive(receive) {
  if (receive?.decision === "PHASE_A_READY") return "PHASE_A_ONLY";
  if (receive?.decision === "PHASE_B_READY") return "PHASE_B_ONLY";
  if (receive?.decision === "ADAPTIVE_A_TO_B_READY" || receive?.decision === "FULL_STACK_A_TO_B_READY") return "A_TO_C_CONTINUOUS";
  return "STOP";
}

function waitReceiveResult() {
  return Object.freeze({ decision: "WAIT_FOR_RECEIVABLE_TEXT", phase: null, failures: Object.freeze([]) });
}

function deriveRouteAndReceiveFromRequest(session = {}) {
  const request = session.request ?? {};
  const input = request.input ?? {};
  const bootWait = request.operation === "BOOT" && input && typeof input === "object" && !Array.isArray(input) && Object.keys(input).length === 0;
  if (bootWait) return Object.freeze({ route: "WAIT", receiveResult: waitReceiveResult() });
  const receiveResult = evaluateToshiReceive(input);
  return Object.freeze({ route: routeForReceive(receiveResult), receiveResult });
}

function receiveSignature(receive) {
  return stableStringify({
    decision: receive?.decision ?? null,
    phase: receive?.phase ?? null,
    revisionProfile: receive?.revisionProfile ?? null,
    baseline: receive?.baseline ? {
      name: receive.baseline.name,
      id: receive.baseline.id,
      bodySha256: receive.baseline.bodySha256,
      sourceSha256: receive.baseline.sourceSha256
    } : null,
    editContractSha256: receive?.editContract?.sha256 ?? null
  });
}

function actionId(session, actionType, payload) {
  return `TS90-${sha256(`${session.sessionId}|${actionType}|${stableStringify(payload)}`).slice(0, 24)}`;
}

function makeAction(session, actionType, payload) {
  return Object.freeze({
    schema: TS90_RUNTIME_ACTION_SCHEMA,
    actionId: actionId(session, actionType, payload),
    actionType,
    runtimeVersion: RUNTIME_VERSION,
    sessionId: session.sessionId,
    payload: Object.freeze(payload)
  });
}

function phaseAReceive(receive) {
  return Object.freeze({ ...receive, decision: "PHASE_A_READY", phase: "A" });
}

function fixedCoreForTitle(session) {
  const explicit = session.receiveResult?.editContract?.fixedConditions;
  if (typeof explicit === "string" && explicit.trim()) return explicit.trim();
  const report = session.evidence?.phaseB?.adaptiveReport;
  if (typeof report?.fixedConditionsSummary === "string" && report.fixedConditionsSummary.trim()) return report.fixedConditionsSummary.trim();
  const core = session.request?.input?.coreToKeep;
  return typeof core === "string" ? core.trim() : "";
}

function episodeLabelFor(session) {
  const input = session.request?.input ?? {};
  const meta = session.request?.metadata ?? {};
  return text(meta.episodeLabel, input.episodeLabel, input.storyNumberLabel, input["話数"], input["話番号"], input.targetRange);
}

function workTitleFor(session) {
  const input = session.request?.input ?? {};
  const meta = session.request?.metadata ?? {};
  return text(meta.workTitle, input.workTitle, input["作品タイトル"]);
}

function partLabelFor(session) {
  const input = session.request?.input ?? {};
  const meta = session.request?.metadata ?? {};
  return text(meta.partLabel, input.partLabel, input["部表記"], input["編表記"], input["部・編等"]);
}

function titleCandidateLines(report) {
  const candidates = Array.isArray(report?.["タイトル候補"] ?? report?.titleCandidates) ? (report["タイトル候補"] ?? report.titleCandidates) : [];
  return candidates.map((item) => {
    if (typeof item === "string") return `- ${item}`;
    return `- ${text(item?.title, item?.タイトル)} :: ${text(item?.reason, item?.理由)}`;
  });
}

function rejectedTitleLines(report) {
  const rejected = Array.isArray(report?.["却下候補と理由"] ?? report?.rejectedTitles) ? (report["却下候補と理由"] ?? report.rejectedTitles) : [];
  return rejected.map((item) => {
    if (typeof item === "string") return `- ${item}`;
    return `- ${text(item?.title, item?.タイトル)} :: ${text(item?.reason, item?.理由)}`;
  });
}

function buildWorkReport(session) {
  const a = session.evidence?.phaseA?.output ?? null;
  const b = session.evidence?.phaseB ?? {};
  const c = session.evidence?.phaseC?.report ?? {};
  const lines = [
    "TS90 WORK REPORT",
    "",
    "## Phase A",
    JSON.stringify(a, null, 2),
    "",
    "## Phase B",
    `修正後LOG: ${text(b.output?.修正後LOG, b.output?.internalLog, b.output?.修正後LOG_INTERNAL)}`,
    `final body sha256: ${b.finalBodySha256 ?? ""}`,
    `final cooling: ${b.finalCoolingComplete === true ? "PASS" : "FAIL"}`,
    `固定条件照合: ${b.fixedConditionCheckPassed === true ? "PASS" : "FAIL"}`,
    `rollback / comparison: ${JSON.stringify(b.adaptiveReport?.comparison ?? {})}`,
    `remaining concerns: ${JSON.stringify(b.adaptiveReport?.remainingConcerns ?? [])}`,
    "",
    "## Phase C",
    "タイトル候補:",
    ...titleCandidateLines(c),
    `採用タイトル: ${text(c["採用タイトル"], c.selectedTitle)}`,
    `採用理由: ${text(c["採用理由"], c.selectedReason)}`,
    "却下候補と理由:",
    ...rejectedTitleLines(c),
    `未確認 / 保留: ${text(c["未確認 / 保留"], c.remainingConcerns)}`,
    "",
    "## Delivery labels",
    `作品タイトル: ${workTitleFor(session) || "(omitted)"}`,
    `部・編等: ${partLabelFor(session) || "(omitted)"}`,
    `話数: ${episodeLabelFor(session) || "(missing)"}`,
    `固定条件: ${fixedCoreForTitle(session)}`
  ];
  return lines.join("\n");
}

function buildArtifact(session) {
  const report = session.evidence.phaseC.report;
  const selectedTitle = text(report["採用タイトル"], report.selectedTitle);
  const labels = [];
  const workTitle = workTitleFor(session);
  const partLabel = partLabelFor(session);
  const episodeLabel = episodeLabelFor(session);
  if (workTitle) labels.push(workTitle);
  if (partLabel) labels.push(partLabel);
  labels.push(episodeLabel);
  labels.push(selectedTitle);
  const finalBodyTxt = `${labels.join("\n")}\n\n${session.evidence.phaseB.finalBodyText}`;
  const workReportTxt = buildWorkReport(session);
  const files = {
    "TS90_FINAL_BODY.txt": finalBodyTxt,
    "TS90_WORK_REPORT.txt": workReportTxt
  };
  if (session.request?.includeTitleCandidates === true) {
    files["TS90_TITLE_CANDIDATES.txt"] = titleCandidateLines(report).join("\n");
  }
  const artifactSha256 = sha256(stableStringify(files));
  return Object.freeze({
    files: Object.freeze(files),
    artifactSha256,
    finalBodyFileSha256: sha256(finalBodyTxt),
    selectedTitle
  });
}

function buildStopPacket(stage, stop) {
  const stoppedStage = text(stop?.stoppedStage, stage);
  const reason = text(stop?.理由, stop?.reason);
  const impact = text(stop?.影響, stop?.impact);
  const requiredRepair = text(stop?.必要修正, stop?.requiredRepair, stop?.missingMaterial);
  const boundary = text(stop?.責任境界, stop?.responsibilityBoundary);
  const heat = text(stop?.["保持する熱量"], stop?.preservedHeat, stop?.coreToKeep);
  const partialSafe = text(stop?.partialBodySafety, stop?.["部分修正版の安全性"]);
  const stopText = [
    `停止工程: ${stoppedStage}`,
    `理由: ${reason}`,
    `影響: ${impact}`,
    `必要修正: ${requiredRepair}`,
    `責任境界: ${boundary}`,
    `保持する熱量: ${heat}`,
    `部分修正版の安全性: ${partialSafe}`
  ].join("\n");
  return {
    status: "STOP",
    stoppedStage,
    reason,
    TXTDL: { "TS90_STOP_REPORT.txt": stopText }
  };
}

function validateHostEnvelope(session, hostResult) {
  const failures = [];
  if (!hostResult || typeof hostResult !== "object" || Array.isArray(hostResult)) return ["HOST_RESULT_OBJECT_REQUIRED"];
  if (!session.pendingAction) return ["PENDING_ACTION_REQUIRED"];
  if (hostResult.actionId !== session.pendingAction.actionId) failures.push("HOST_ACTION_ID_MISMATCH");
  if (hostResult.actionType !== session.pendingAction.actionType) failures.push("HOST_ACTION_TYPE_MISMATCH");
  return failures;
}

function validatePendingActionEnvelope(session, failures) {
  const action = session.pendingAction;
  if (action == null) return;
  if (!action || typeof action !== "object" || Array.isArray(action)) {
    failures.push("PENDING_ACTION_OBJECT_REQUIRED");
    return;
  }
  if (action.schema !== TS90_RUNTIME_ACTION_SCHEMA) failures.push("PENDING_ACTION_SCHEMA_MISMATCH");
  if (action.runtimeVersion !== RUNTIME_VERSION) failures.push("PENDING_ACTION_RUNTIME_VERSION_MISMATCH");
  if (action.sessionId !== session.sessionId) failures.push("PENDING_ACTION_SESSION_ID_MISMATCH");
}

function recomputeReceive(session) {
  return deriveRouteAndReceiveFromRequest(session).receiveResult;
}


function expectedSessionIdForRequestSha(requestSha256) {
  return `TS90S-${String(requestSha256 ?? "").slice(0, 24)}`;
}

function terminalAuditPayload(evidence = {}) {
  return {
    finalBodyFileSha256: evidence.artifact?.finalBodyFileSha256,
    artifactSha256: evidence.artifact?.artifactSha256,
    selectedTitle: evidence.artifact?.selectedTitle
  };
}

function expectedTerminalAuditAction(session, evidence = session.evidence ?? {}) {
  return makeAction(session, "FINAL_TERMINAL_AUDIT", terminalAuditPayload(evidence));
}

function buildTerminalAuditPacket(session, evidence, terminalGate) {
  return {
    bodyReportSeparated: true,
    finalCoolingComplete: evidence.phaseB?.finalCoolingComplete,
    fixedConditionCheckPassed: evidence.phaseB?.fixedConditionCheckPassed,
    workTitle: workTitleFor(session),
    partLabel: partLabelFor(session),
    episodeLabel: episodeLabelFor(session),
    fixedConditions: evidence.phaseC?.fixedConditions,
    TXTDL: evidence.artifact?.files,
    phaseCTitleDecision: evidence.phaseC?.report,
    "終端ゲート": terminalGate
  };
}

function validateStoredEvidence(session, recomputedReceive) {
  const failures = [];
  const e = session.evidence ?? {};
  if (e.phaseA) {
    if (e.phaseA.decision !== "PHASE_A_SUCCESS") failures.push("PHASE_A_EVIDENCE_DECISION_INVALID");
    if (!e.phaseA.output || typeof e.phaseA.output !== "object" || Array.isArray(e.phaseA.output)) {
      failures.push("PHASE_A_EVIDENCE_OUTPUT_MISSING");
    } else {
      if (e.phaseA.outputSha256 !== sha256(stableStringify(e.phaseA.output))) failures.push("PHASE_A_EVIDENCE_HASH_MISMATCH");
      const result = evaluateToshiOutput({ receiveResult: phaseAReceive(recomputedReceive), output: e.phaseA.output });
      if (result.decision !== "PHASE_A_SUCCESS") failures.push("PHASE_A_EVIDENCE_REVALIDATION_FAILED");
    }
  }
  if (e.phaseB) {
    if (session.route === "A_TO_C_CONTINUOUS" && !e.phaseA) failures.push("PHASE_B_WITHOUT_PHASE_A_EVIDENCE");
    if (e.phaseB.decision !== "PHASE_B_SUCCESS") failures.push("PHASE_B_EVIDENCE_DECISION_INVALID");
    if (!e.phaseB.output || typeof e.phaseB.output !== "object" || Array.isArray(e.phaseB.output)) {
      failures.push("PHASE_B_EVIDENCE_OUTPUT_MISSING");
    } else {
      if (e.phaseB.outputSha256 !== sha256(stableStringify(e.phaseB.output))) failures.push("PHASE_B_EVIDENCE_HASH_MISMATCH");
      const result = evaluateToshiOutput({ receiveResult: recomputedReceive, output: e.phaseB.output, textOnlyRequested: session.request?.textOnlyRequested === true });
      if (result.decision !== "PHASE_B_SUCCESS") failures.push("PHASE_B_EVIDENCE_REVALIDATION_FAILED");
      const extraction = extractBodyText(
        e.phaseB.output?.修正版,
        recomputedReceive.editContract?.bodyExtraction ?? { mode: "FULL_TEXT" },
        e.phaseB.output?.修正版本文 ?? e.phaseB.output?.revisedBodyText
      );
      if (!extraction.ok || extraction.text !== e.phaseB.finalBodyText) failures.push("PHASE_B_FINAL_BODY_EVIDENCE_MISMATCH");
      if (sha256(e.phaseB.finalBodyText ?? "") !== e.phaseB.finalBodySha256) failures.push("PHASE_B_FINAL_BODY_HASH_MISMATCH");
      if (session.route === "A_TO_C_CONTINUOUS") {
        if (e.phaseB.finalCoolingComplete !== true || e.phaseB.output?.finalCoolingComplete !== true) failures.push("PHASE_B_FINAL_COOLING_EVIDENCE_MISSING");
        if (e.phaseB.fixedConditionCheckPassed !== true || e.phaseB.output?.fixedConditionCheckPassed !== true) failures.push("PHASE_B_FIXED_CONDITION_EVIDENCE_MISSING");
        if (e.phaseB.bodyReportSeparated !== true || e.phaseB.output?.bodyReportSeparated !== true) failures.push("PHASE_B_BODY_REPORT_SEPARATION_EVIDENCE_MISSING");
      }
    }
  }
  if (e.phaseC) {
    if (!e.phaseB) failures.push("PHASE_C_WITHOUT_PHASE_B_EVIDENCE");
    if (session.route === "A_TO_C_CONTINUOUS" && !e.artifact) failures.push("PHASE_C_ARTIFACT_EVIDENCE_REQUIRED");
    if (e.phaseC.decision !== "TITLE_DECISION_PASS") failures.push("PHASE_C_EVIDENCE_DECISION_INVALID");
    if (!e.phaseC.report || typeof e.phaseC.report !== "object" || Array.isArray(e.phaseC.report)) failures.push("PHASE_C_EVIDENCE_REPORT_MISSING");
    else if (e.phaseC.reportSha256 !== sha256(stableStringify(e.phaseC.report))) failures.push("PHASE_C_EVIDENCE_HASH_MISMATCH");
    if (e.phaseB && e.phaseC.finalBodySha256 !== e.phaseB.finalBodySha256) failures.push("PHASE_C_BODY_HASH_BINDING_MISMATCH");
    const fixedCore = fixedCoreForTitle(session);
    if (e.phaseC.fixedConditions !== fixedCore) failures.push("PHASE_C_FIXED_CORE_BINDING_MISMATCH");
    const result = evaluateTitleDecisionReport(e.phaseC.report, {
      bodyWorkComplete: true,
      finalBodyText: e.phaseB?.finalBodyText ?? "",
      fixedConditions: fixedCore
    });
    if (result.decision !== "TITLE_DECISION_PASS" || result.selectedTitle !== e.phaseC.selectedTitle) failures.push("PHASE_C_EVIDENCE_REVALIDATION_FAILED");
  }
  if (e.artifact) {
    if (!e.phaseC) failures.push("ARTIFACT_WITHOUT_PHASE_C_EVIDENCE");
    if (!e.phaseB) failures.push("ARTIFACT_WITHOUT_PHASE_B_EVIDENCE");
    if (e.phaseB && e.phaseC) {
      const rebuilt = buildArtifact(session);
      if (stableStringify(rebuilt) !== stableStringify(e.artifact)) failures.push("ARTIFACT_EVIDENCE_REBUILD_MISMATCH");
    }
  }
  if (e.terminal) {
    if (!e.artifact) failures.push("TERMINAL_WITHOUT_ARTIFACT_EVIDENCE");
    if (!e.phaseB) failures.push("TERMINAL_WITHOUT_PHASE_B_EVIDENCE");
    if (!e.phaseC) failures.push("TERMINAL_WITHOUT_PHASE_C_EVIDENCE");
    if (e.artifact) {
      if (e.terminal.finalBodyFileSha256 !== e.artifact.finalBodyFileSha256) failures.push("TERMINAL_FINAL_BODY_HASH_BINDING_MISMATCH");
      if (e.terminal.artifactSha256 !== e.artifact.artifactSha256) failures.push("TERMINAL_ARTIFACT_HASH_BINDING_MISMATCH");
      if (e.terminal.decision !== "TERMINAL_PASS") failures.push("TERMINAL_EVIDENCE_DECISION_INVALID");
      const expectedAction = expectedTerminalAuditAction(session, e);
      if (e.terminal.actionType !== expectedAction.actionType) failures.push("TERMINAL_ACTION_TYPE_BINDING_MISMATCH");
      if (e.terminal.actionId !== expectedAction.actionId) failures.push("TERMINAL_ACTION_ID_BINDING_MISMATCH");
      if (e.terminal.terminalGate == null) failures.push("TERMINAL_GATE_EVIDENCE_MISSING");
      else {
        const gateSha256 = sha256(stableStringify(e.terminal.terminalGate));
        if (e.terminal.terminalGateSha256 !== gateSha256) failures.push("TERMINAL_GATE_HASH_MISMATCH");
      }
      if (e.phaseB && e.phaseC && e.terminal.terminalGate != null) {
        const packet = buildTerminalAuditPacket(session, e, e.terminal.terminalGate);
        const packetSha256 = sha256(stableStringify(packet));
        if (e.terminal.terminalPacketSha256 !== packetSha256) failures.push("TERMINAL_PACKET_HASH_MISMATCH");
        const checked = evaluateAToCTXTDLOutput(packet);
        if (checked.decision !== "A_TO_C_TXTDL_PASS") {
          failures.push("TERMINAL_EVIDENCE_REVALIDATION_FAILED");
          for (const item of checked.failures ?? []) {
            const code = typeof item === "string" ? item : item?.code;
            if (code) failures.push(`TERMINAL_REVALIDATION:${code}`);
          }
        }
      }
    }
  }
  return failures;
}

function validateTS90RuntimeSessionUnsafe(session = {}) {
  const failures = [];
  // Serialized runtime state must be canonically serializable as a whole.
  // This touches unknown/unused branches too, so circular or non-JSON-like state cannot hide outside evidence paths.
  stableStringify(session);
  if (session.schema !== TS90_RUNTIME_SESSION_SCHEMA) failures.push("SESSION_SCHEMA_MISMATCH");
  if (session.runtimeVersion !== RUNTIME_VERSION) failures.push("SESSION_RUNTIME_VERSION_MISMATCH");
  if (session.packageVersion !== PACKAGE_VERSION) failures.push("SESSION_PACKAGE_VERSION_MISMATCH");
  const requestSha256 = sha256(stableStringify(session.request ?? {}));
  if (session.requestSha256 !== requestSha256) failures.push("SESSION_REQUEST_HASH_MISMATCH");
  if (session.sessionId !== expectedSessionIdForRequestSha(requestSha256)) failures.push("SESSION_ID_MISMATCH");
  validatePendingActionEnvelope(session, failures);

  const derived = deriveRouteAndReceiveFromRequest(session);
  const recomputed = derived.receiveResult;
  if (receiveSignature(recomputed) !== receiveSignature(session.receiveResult)) failures.push("SESSION_RECEIVE_EVIDENCE_MISMATCH");
  if (derived.route !== session.route) failures.push("SESSION_ROUTE_MISMATCH");

  if (derived.route === "WAIT") {
    if (session.route !== "WAIT" || session.state !== "WAIT_FOR_RECEIVABLE_TEXT") failures.push("WAIT_SESSION_STATE_MISMATCH");
    if (session.pendingAction != null) failures.push("WAIT_SESSION_PENDING_ACTION_DENIED");
    if (session.terminalDecision != null) failures.push("WAIT_SESSION_TERMINAL_DECISION_DENIED");
    if (Object.keys(session.evidence ?? {}).length !== 0) failures.push("WAIT_SESSION_EVIDENCE_DENIED");
    return Object.freeze({ decision: failures.length === 0 ? "SESSION_VALID" : "SESSION_INVALID", failures: Object.freeze(failures) });
  }

  failures.push(...validateStoredEvidence(session, recomputed));

  const hasTerminalEvidence = session.evidence?.terminal != null;
  const hasTerminalSuccessMarker = hasTerminalEvidence || session.terminalDecision === "SUCCESS" || session.artifact != null;
  if (hasTerminalSuccessMarker && session.state !== "SUCCESS") failures.push("TERMINAL_SUCCESS_STATE_MISMATCH");

  if (session.state === "SUCCESS") {
    if (session.route !== "A_TO_C_CONTINUOUS") failures.push("SUCCESS_ROUTE_INVALID");
    if (!session.evidence?.phaseA || !session.evidence?.phaseB || !session.evidence?.phaseC || !session.evidence?.artifact || !session.evidence?.terminal) {
      failures.push("SUCCESS_EVIDENCE_INCOMPLETE");
    }
    if (session.terminalDecision !== "SUCCESS") failures.push("SUCCESS_TERMINAL_DECISION_MISMATCH");
    if (session.pendingAction != null) failures.push("SUCCESS_PENDING_ACTION_DENIED");
    if (stableStringify(session.artifact ?? null) !== stableStringify(session.evidence?.artifact ?? null)) failures.push("SUCCESS_TOP_LEVEL_ARTIFACT_MISMATCH");
    if (nextActionFor(session) != null) failures.push("SUCCESS_PIPELINE_NOT_TERMINAL");
  }
  if (session.state === "STOP") {
    if (session.terminalDecision !== "STOP") failures.push("STOP_TERMINAL_DECISION_MISMATCH");
    if (session.pendingAction != null) failures.push("STOP_PENDING_ACTION_DENIED");
  }
  if (session.state === "PHASE_A_COMPLETE") {
    if (session.route !== "PHASE_A_ONLY" || !session.evidence?.phaseA || session.terminalDecision !== "PHASE_A_SUCCESS" || session.pendingAction != null) failures.push("PHASE_A_COMPLETE_STATE_MISMATCH");
  }
  if (session.state === "PHASE_B_COMPLETE") {
    if (session.route !== "PHASE_B_ONLY" || !session.evidence?.phaseB || session.terminalDecision !== "PHASE_B_SUCCESS" || session.pendingAction != null) failures.push("PHASE_B_COMPLETE_STATE_MISMATCH");
  }

  if (session.state !== "STOP" && session.state !== "SUCCESS" && !["PHASE_A_COMPLETE", "PHASE_B_COMPLETE", "WAIT_FOR_RECEIVABLE_TEXT"].includes(session.state)) {
    const expectedAction = nextActionFor(session);
    if (expectedAction == null && session.pendingAction != null) failures.push("UNEXPECTED_PENDING_ACTION");
    if (expectedAction != null) {
      if (session.pendingAction == null) failures.push("EXPECTED_PENDING_ACTION_MISSING");
      else {
        if (session.pendingAction.actionId !== expectedAction.actionId) failures.push("PENDING_ACTION_ID_MISMATCH");
        if (session.pendingAction.actionType !== expectedAction.actionType) failures.push("PENDING_ACTION_TYPE_MISMATCH");
        if (stableStringify(session.pendingAction.payload) !== stableStringify(expectedAction.payload)) failures.push("PENDING_ACTION_PAYLOAD_MISMATCH");
      }
      if (session.state !== "WAITING_FOR_HOST") failures.push("PENDING_ACTION_STATE_MISMATCH");
    }
  }

  return Object.freeze({ decision: failures.length === 0 ? "SESSION_VALID" : "SESSION_INVALID", failures: Object.freeze(failures) });
}


export function validateTS90RuntimeSession(session = {}) {
  try {
    return validateTS90RuntimeSessionUnsafe(session);
  } catch (error) {
    const rawCode = jsonDataFailureCode(error, "SESSION_VALIDATION_EXCEPTION_DENIED");
    const code = rawCode === "STABLE_SERIALIZATION_CIRCULAR_REFERENCE"
      ? "SESSION_CIRCULAR_REFERENCE_DENIED"
      : rawCode.startsWith("JSON_DATA_")
        ? `SESSION_JSON_DATA_DENIED:${rawCode}`
        : "SESSION_VALIDATION_EXCEPTION_DENIED";
    return Object.freeze({
      decision: "SESSION_INVALID",
      failures: Object.freeze([code])
    });
  }
}

function nextActionFor(session) {
  const e = session.evidence ?? {};
  if (session.route === "PHASE_A_ONLY") {
    if (!e.phaseA) return makeAction(session, "PHASE_A_DIAGNOSIS", {
      baseline: session.receiveResult.baseline,
      editContract: session.receiveResult.editContract,
      targetRange: session.request.input.targetRange
    });
    return null;
  }
  if (session.route === "PHASE_B_ONLY") {
    if (!e.phaseB) return makeAction(session, "PHASE_B_REVISION", {
      receiveResult: session.receiveResult,
      phaseAOutput: null
    });
    return null;
  }
  if (session.route === "A_TO_C_CONTINUOUS") {
    if (!e.phaseA) return makeAction(session, "PHASE_A_DIAGNOSIS", {
      baseline: session.receiveResult.baseline,
      editContract: session.receiveResult.editContract,
      targetRange: session.request.input.targetRange
    });
    if (!e.phaseB) return makeAction(session, "PHASE_B_REVISION", {
      receiveResult: session.receiveResult,
      phaseAOutput: e.phaseA.output
    });
    if (!e.phaseC) return makeAction(session, "PHASE_C_TITLE", {
      finalBodyText: e.phaseB.finalBodyText,
      finalBodySha256: e.phaseB.finalBodySha256,
      fixedConditions: fixedCoreForTitle(session),
      targetRange: session.request.input.targetRange
    });
    if (!e.artifact) return null;
    if (!e.terminal) return makeAction(session, "FINAL_TERMINAL_AUDIT", {
      finalBodyFileSha256: e.artifact.finalBodyFileSha256,
      artifactSha256: e.artifact.artifactSha256,
      selectedTitle: e.artifact.selectedTitle
    });
  }
  return null;
}

function withNextAction(session) {
  const pendingAction = nextActionFor(session);
  const state = pendingAction ? "WAITING_FOR_HOST" : session.state;
  return Object.freeze({ ...session, state, pendingAction });
}

function createTS90RuntimeSessionUnsafe(request = {}) {
  const normalizedRequest = Object.freeze({
    operation: request.operation ?? (request.input ? "RUN" : "BOOT"),
    input: request.input ?? {},
    metadata: request.metadata ?? {},
    includeTitleCandidates: request.includeTitleCandidates === true,
    textOnlyRequested: request.textOnlyRequested === true
  });
  const requestSha256 = sha256(stableStringify(normalizedRequest));
  const sessionId = `TS90S-${requestSha256.slice(0, 24)}`;

  if (normalizedRequest.operation === "BOOT" && Object.keys(normalizedRequest.input).length === 0) {
    return Object.freeze({
      schema: TS90_RUNTIME_SESSION_SCHEMA,
      runtimeVersion: RUNTIME_VERSION,
      packageVersion: PACKAGE_VERSION,
      sessionId,
      request: normalizedRequest,
      requestSha256,
      route: "WAIT",
      state: "WAIT_FOR_RECEIVABLE_TEXT",
      receiveResult: waitReceiveResult(),
      evidence: Object.freeze({}),
      pendingAction: null,
      terminalDecision: null
    });
  }

  const receiveResult = evaluateToshiReceive(normalizedRequest.input);
  const route = routeForReceive(receiveResult);
  if (route === "STOP") {
    return Object.freeze({
      schema: TS90_RUNTIME_SESSION_SCHEMA,
      runtimeVersion: RUNTIME_VERSION,
      packageVersion: PACKAGE_VERSION,
      sessionId,
      request: normalizedRequest,
      requestSha256,
      route,
      state: "STOP",
      receiveResult,
      evidence: Object.freeze({}),
      pendingAction: null,
      terminalDecision: "STOP",
      issues: receiveResult.failures
    });
  }
  const base = {
    schema: TS90_RUNTIME_SESSION_SCHEMA,
    runtimeVersion: RUNTIME_VERSION,
    packageVersion: PACKAGE_VERSION,
    sessionId,
    request: normalizedRequest,
    requestSha256,
    route,
    state: "READY",
    receiveResult,
    evidence: Object.freeze({}),
    pendingAction: null,
    terminalDecision: null
  };
  return withNextAction(base);
}

function createFailureSession(error) {
  const safeRequest = Object.freeze({ operation: "INVALID_CREATE", input: Object.freeze({}), metadata: Object.freeze({}), includeTitleCandidates: false, textOnlyRequested: false });
  const requestSha256 = sha256(stableStringify(safeRequest));
  const receiveResult = evaluateToshiReceive({});
  const rawCode = jsonDataFailureCode(error, "SESSION_CREATE_EXCEPTION_DENIED");
  const code = rawCode === "STABLE_SERIALIZATION_CIRCULAR_REFERENCE"
    ? "SESSION_CREATE_CIRCULAR_REFERENCE_DENIED"
    : rawCode.startsWith("JSON_DATA_")
      ? `SESSION_CREATE_JSON_DATA_DENIED:${rawCode}`
      : "SESSION_CREATE_EXCEPTION_DENIED";
  return Object.freeze({
    schema: TS90_RUNTIME_SESSION_SCHEMA,
    runtimeVersion: RUNTIME_VERSION,
    packageVersion: PACKAGE_VERSION,
    sessionId: expectedSessionIdForRequestSha(requestSha256),
    request: safeRequest,
    requestSha256,
    route: "STOP",
    state: "STOP",
    receiveResult,
    evidence: Object.freeze({}),
    pendingAction: null,
    terminalDecision: "STOP",
    issues: Object.freeze([code]),
    createFailure: true
  });
}

export function createTS90RuntimeSession(request = {}) {
  try {
    return createTS90RuntimeSessionUnsafe(request);
  } catch (error) {
    return createFailureSession(error);
  }
}

function stopFromHost(session, hostResult) {
  const packet = buildStopPacket(session.pendingAction?.actionType ?? "UNKNOWN", hostResult.stopReport ?? hostResult.STOP ?? {});
  const checked = evaluateAToCTXTDLOutput(packet);
  return Object.freeze({
    ...session,
    state: "STOP",
    pendingAction: null,
    terminalDecision: "STOP",
    stopPacket: Object.freeze(packet),
    issues: checked.failures
  });
}

function failClosedResumeStop(session, issues) {
  const normalizedIssues = Object.freeze([...(Array.isArray(issues) ? issues : [String(issues ?? "SESSION_RESUME_EXCEPTION_DENIED")])]);
  try {
    stableStringify(session);
    return Object.freeze({ ...session, state: "STOP", pendingAction: null, terminalDecision: "STOP", issues: normalizedIssues });
  } catch {
    return Object.freeze({
      schema: TS90_RUNTIME_SESSION_SCHEMA,
      runtimeVersion: RUNTIME_VERSION,
      packageVersion: PACKAGE_VERSION,
      sessionId: typeof session?.sessionId === "string" ? session.sessionId : null,
      route: "STOP",
      state: "STOP",
      receiveResult: null,
      evidence: Object.freeze({}),
      pendingAction: null,
      terminalDecision: "STOP",
      issues: normalizedIssues
    });
  }
}

function resumeTS90RuntimeSessionUnsafe(session, hostResult = {}) {
  stableStringify(hostResult);
  const validation = validateTS90RuntimeSession(session);
  if (validation.decision !== "SESSION_VALID") {
    return failClosedResumeStop(session, validation.failures);
  }
  const envelopeFailures = validateHostEnvelope(session, hostResult);
  if (envelopeFailures.length > 0) {
    return Object.freeze({ ...session, state: "STOP", pendingAction: null, terminalDecision: "STOP", issues: Object.freeze(envelopeFailures) });
  }
  if (hostResult.stop === true) return stopFromHost(session, hostResult);

  const actionType = session.pendingAction.actionType;
  const evidence = { ...(session.evidence ?? {}) };

  if (actionType === "PHASE_A_DIAGNOSIS") {
    const output = hostResult.output;
    const result = evaluateToshiOutput({ receiveResult: phaseAReceive(session.receiveResult), output });
    if (result.decision !== "PHASE_A_SUCCESS") {
      return Object.freeze({ ...session, state: "STOP", pendingAction: null, terminalDecision: "STOP", issues: result.failures });
    }
    evidence.phaseA = Object.freeze({ output, outputSha256: sha256(stableStringify(output)), decision: result.decision });
    if (session.route === "PHASE_A_ONLY") {
      return Object.freeze({ ...session, evidence: Object.freeze(evidence), state: "PHASE_A_COMPLETE", pendingAction: null, terminalDecision: "PHASE_A_SUCCESS" });
    }
  } else if (actionType === "PHASE_B_REVISION") {
    const output = hostResult.output;
    const result = evaluateToshiOutput({ receiveResult: session.receiveResult, output, textOnlyRequested: session.request.textOnlyRequested });
    if (result.decision !== "PHASE_B_SUCCESS") {
      return Object.freeze({ ...session, state: "STOP", pendingAction: null, terminalDecision: "STOP", issues: result.failures });
    }
    const extraction = extractBodyText(
      output?.修正版,
      session.receiveResult.editContract?.bodyExtraction ?? { mode: "FULL_TEXT" },
      output?.修正版本文 ?? output?.revisedBodyText
    );
    if (!extraction.ok || !hasText(extraction.text)) {
      return Object.freeze({ ...session, state: "STOP", pendingAction: null, terminalDecision: "STOP", issues: Object.freeze([extraction.error ?? "FINAL_BODY_EXTRACTION_FAILED"]) });
    }
    if (session.route === "A_TO_C_CONTINUOUS") {
      const requiredFlags = ["finalCoolingComplete", "fixedConditionCheckPassed", "bodyReportSeparated"];
      const missing = requiredFlags.filter((field) => output?.[field] !== true);
      if (missing.length > 0) {
        return Object.freeze({ ...session, state: "STOP", pendingAction: null, terminalDecision: "STOP", issues: Object.freeze(missing.map((field) => `PHASE_B_FINALIZATION_FLAG_MISSING:${field}`)) });
      }
    }
    const adaptiveReport = output?.編集主任レポート ?? output?.adaptiveEditorReport ?? output?.internalAdaptiveReport ?? null;
    evidence.phaseB = Object.freeze({
      output,
      outputSha256: sha256(stableStringify(output)),
      adaptiveReport,
      finalBodyText: extraction.text,
      finalBodySha256: sha256(extraction.text),
      finalCoolingComplete: output?.finalCoolingComplete === true,
      fixedConditionCheckPassed: output?.fixedConditionCheckPassed === true,
      bodyReportSeparated: output?.bodyReportSeparated === true,
      decision: result.decision
    });
    if (session.route === "PHASE_B_ONLY") {
      return Object.freeze({ ...session, evidence: Object.freeze(evidence), state: "PHASE_B_COMPLETE", pendingAction: null, terminalDecision: "PHASE_B_SUCCESS" });
    }
  } else if (actionType === "PHASE_C_TITLE") {
    const report = hostResult.report ?? hostResult.output;
    const fixedCore = fixedCoreForTitle({ ...session, evidence });
    const result = evaluateTitleDecisionReport(report, {
      bodyWorkComplete: true,
      finalBodyText: evidence.phaseB.finalBodyText,
      fixedConditions: fixedCore
    });
    if (result.decision !== "TITLE_DECISION_PASS") {
      return Object.freeze({ ...session, state: "STOP", pendingAction: null, terminalDecision: "STOP", issues: result.failures });
    }
    evidence.phaseC = Object.freeze({
      report,
      reportSha256: sha256(stableStringify(report)),
      selectedTitle: result.selectedTitle,
      fixedConditions: fixedCore,
      finalBodySha256: evidence.phaseB.finalBodySha256,
      decision: result.decision
    });
    evidence.artifact = buildArtifact({ ...session, evidence });
  } else if (actionType === "FINAL_TERMINAL_AUDIT") {
    const terminalGate = hostResult.terminalGate ?? hostResult["終端ゲート"] ?? hostResult.output?.["終端ゲート"];
    if (hostResult.finalBodyFileSha256 !== evidence.artifact?.finalBodyFileSha256) {
      return Object.freeze({ ...session, state: "STOP", pendingAction: null, terminalDecision: "STOP", issues: Object.freeze(["FINAL_BODY_FILE_HASH_MISMATCH"]) });
    }
    if (hostResult.artifactSha256 !== evidence.artifact?.artifactSha256) {
      return Object.freeze({ ...session, state: "STOP", pendingAction: null, terminalDecision: "STOP", issues: Object.freeze(["ARTIFACT_HASH_MISMATCH"]) });
    }
    const packet = buildTerminalAuditPacket(session, evidence, terminalGate);
    const checked = evaluateAToCTXTDLOutput(packet);
    if (checked.decision !== "A_TO_C_TXTDL_PASS") {
      return Object.freeze({ ...session, state: "STOP", pendingAction: null, terminalDecision: "STOP", issues: checked.failures });
    }
    evidence.terminal = Object.freeze({
      actionId: session.pendingAction.actionId,
      actionType: session.pendingAction.actionType,
      terminalGate,
      terminalGateSha256: sha256(stableStringify(terminalGate)),
      terminalPacketSha256: sha256(stableStringify(packet)),
      finalBodyFileSha256: hostResult.finalBodyFileSha256,
      artifactSha256: hostResult.artifactSha256,
      decision: "TERMINAL_PASS"
    });
    return Object.freeze({
      ...session,
      evidence: Object.freeze(evidence),
      state: "SUCCESS",
      pendingAction: null,
      terminalDecision: "SUCCESS",
      artifact: evidence.artifact
    });
  } else {
    return Object.freeze({ ...session, state: "STOP", pendingAction: null, terminalDecision: "STOP", issues: Object.freeze(["UNKNOWN_PENDING_ACTION"]) });
  }

  const next = { ...session, evidence: Object.freeze(evidence), state: "READY", pendingAction: null };
  return withNextAction(next);
}

export function resumeTS90RuntimeSession(session, hostResult = {}) {
  try {
    return resumeTS90RuntimeSessionUnsafe(session, hostResult);
  } catch (error) {
    const rawCode = jsonDataFailureCode(error, "SESSION_RESUME_EXCEPTION_DENIED");
    const code = rawCode === "STABLE_SERIALIZATION_CIRCULAR_REFERENCE"
      ? "SESSION_RESUME_CIRCULAR_REFERENCE_DENIED"
      : rawCode.startsWith("JSON_DATA_")
        ? `SESSION_RESUME_JSON_DATA_DENIED:${rawCode}`
        : "SESSION_RESUME_EXCEPTION_DENIED";
    return failClosedResumeStop(session, [code]);
  }
}
