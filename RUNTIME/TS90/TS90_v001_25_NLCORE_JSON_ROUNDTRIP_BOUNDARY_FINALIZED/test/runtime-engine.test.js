import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  buildAdaptiveEditPlan,
  canonicalDiffHunks,
  evaluateAToCTXTDLOutput,
  evaluateAdaptiveEditorReport,
  evaluateTitleDecisionReport,
  evaluateToshiReceive,
  extractBodyText
} from "../src/receive-gate.js";
import {
  createTS90RuntimeSession,
  resumeTS90RuntimeSession,
  validateTS90RuntimeSession,
  TS90_RUNTIME_SKILLS
} from "../src/runtime-engine.js";

const sha256Text = (value) => createHash("sha256").update(value, "utf8").digest("hex");
const charCount = (value) => Array.from(value).length;

const terminalGate = () => ({
  熱量配送: {
    endUserHeatDeliveryLocked: true,
    userHeatPolicy: {
      capturesUserRequestedVision: true,
      preservesUserHeatThroughPack: true,
      doesNotFlattenToGenericSafeOutput: true,
      doesNotReplaceVisionWithProcessConvenience: true,
      warnDoesNotCoolSpecPass: true,
      stopKeepsVisionAndNamesRepairPoint: true,
      deliversWithinVerifiedMaterials: true
    },
    保持する熱量: "雨上がりの駅で約束を変えない核"
  },
  完全収束: {
    noUnresolvedConditionResidue: true,
    noUnmappedCoverageId: true,
    noDanglingWarnWithoutClass: true,
    noOpenStopWithoutTicket: true,
    noHandoffResidue: true,
    noHeatDeliveryResidue: true,
    nextActionOrStopDeclared: true,
    repeatUntilStableConfirmed: true,
    residueItems: [],
    nextAction: "TXTDL納品"
  }
});

const phaseAOutput = () => ({
  通し診断: {
    対象範囲: "P1F-001", 読了範囲: "P1F-001", 最低体裁: "OK", 累積破綻: "なし",
    矛盾: "なし", 重複: "軽微", 温度差: "なし", 校正で済む箇所: "あり",
    改稿が必要な箇所: "あり", 設計へ戻すべき箇所: "なし", 修正可能箇所: "本文", "未確認 / 保留": "なし"
  },
  Phase_A_修正指示: {
    修正強度: "strong", 優先順位: "説明癖を抑える", 対象話別指示: "P1F-001",
    触ってよいもの: "本文表現", 触ってはいけないもの: "核・設定・新事件", 残す核: "約束を変えない",
    設計戻し: "なし", 未解決: "なし", "Phase Bへ進む条件": "範囲確定"
  },
  終端ゲート: terminalGate()
});

const diagnosis = () => ({
  "設計": { strength: 1, reason: "核は正常" }, "構成": { strength: 2, reason: "中盤の重複" },
  "シーン": { strength: 2, reason: "場面接続" }, "視点": { strength: 3, reason: "他人内面の断定" },
  "人物": { strength: 2, reason: "説明装置化" }, "感情線": { strength: 1, reason: "緩和点確認" },
  "台詞": { strength: 2, reason: "全員が正確" }, "ペース": { strength: 2, reason: "中盤停滞" },
  "情報開示": { strength: 1, reason: "提示位置" }, "描写": { strength: 2, reason: "抽象を具体へ" },
  "強改稿": { strength: 1, reason: "局所のみ" }, "文体": { strength: 3, reason: "説明癖" },
  "冷却": { strength: 3, reason: "作者介入温度" }, "整合性": { strength: 2, reason: "物と位置" },
  "校正": { strength: 1, reason: "表記" }, "音読": { strength: 1, reason: "語尾" }
});

function makeRequest() {
  return {
    operation: "RUN",
    metadata: { workTitle: "契の外", partLabel: "第1部 表", episodeLabel: "P1F-001" },
    input: {
      inputMode: "TEXT_INPUT",
      targetText: "雨上がりの駅で、ふたりは約束を変えずに立っていた。説明が少し長かった。",
      targetRange: "P1F-001",
      storyCount: 1,
      baselineName: "P1F-001_DRAFT",
      userRevisionPolicy: "修正刃さまパックで通して",
      revisionScope: "本文全域",
      allowedTouchRange: "本文表現",
      doNotTouchRange: "核・設定・新事件",
      coreToKeep: "約束を変えない",
      constraints: {
        minimumBodyChars: 1,
        fixedConditions: "雨上がりの駅で、約束を変えずに終える",
        bodyExtraction: { mode: "FULL_TEXT" }
      }
    }
  };
}

function makeAdaptiveReport(receive, revisedText) {
  const d = diagnosis();
  const plan = buildAdaptiveEditPlan(d, { worldSettingMaterialsPresent: false });
  const base = receive.baseline.bodyText;
  const revisedBody = extractBodyText(revisedText, receive.editContract.bodyExtraction, revisedText).text;
  const diffEvidence = canonicalDiffHunks(base, revisedBody);
  return {
    baselineName: receive.baseline.name,
    baselineId: receive.baseline.id,
    baselineBodySha256: receive.baseline.bodySha256,
    revisedBodySha256: createHash("sha256").update(revisedBody, "utf8").digest("hex").toUpperCase(),
    editContractSha256: receive.editContract.sha256,
    branchName: `${receive.baseline.name}_ADAPTIVE_01`,
    baselineOverwritten: false,
    branchSeparated: true,
    workReportSeparated: true,
    fixedConditionsChecked: true,
    fixedConditionsSummary: "雨上がりの駅で、約束を変えずに終える",
    fixedConditionEvidence: [],
    authorUnknownGuaranteed: false,
    externalBetaReadClaimed: false,
    diffProvided: true,
    diffEvidence,
    diagnosis: d,
    diagnosisOptions: { worldSettingMaterialsPresent: false },
    plan,
    activeStopSignals: [],
    resolvedStopSignals: [],
    stageExecution: plan.map((entry) => ({ stage: entry.stage, status: entry.strength === 0 ? "NOT_USED" : "APPLIED" })),
    comparison: {
      changes: [{ id: "C1", location: "本文差分", reason: "説明を動作へ交換", classification: "明確に改善", rolledBack: false, hunkIds: diffEvidence.map((h) => h.id) }]
    },
    rollbackLog: [],
    remainingConcerns: [],
    baselinePromotionRecommendation: "非推奨",
    originalBodyChars: charCount(base),
    revisedBodyChars: charCount(revisedBody),
    minimumBodyChars: 1
  };
}

function phaseBOutput(session) {
  const revised = "雨上がりの駅で、ふたりは言葉を減らした。約束は変えず、そのまま立っていた。";
  return {
    対象範囲: "P1F-001",
    修正強度: "strong",
    修正方針: "適応型",
    修正版: revised,
    修正後LOG: "説明を動作へ交換。冷却・固定条件照合済み。",
    編集主任レポート: makeAdaptiveReport(session.receiveResult, revised),
    finalCoolingComplete: true,
    fixedConditionCheckPassed: true,
    bodyReportSeparated: true,
    終端ゲート: terminalGate()
  };
}

function phaseCReport(fixed = "雨上がりの駅で、約束を変えずに終える") {
  return {
    対象範囲: "P1F-001",
    本文状態: "最終冷却・固定条件照合済み",
    固定条件: fixed,
    タイトル候補: [
      { title: "雨上がりの約束", reason: "最終本文と核に一致" },
      { title: "駅に残る言葉", reason: "場面と余韻を拾う" }
    ],
    採用タイトル: "雨上がりの約束",
    採用理由: "本文の天候と変えない約束を過不足なく拾う",
    却下候補と理由: [{ title: "世界を変えた日", reason: "本文にない規模を示す" }],
    "未確認 / 保留": "シリーズ全体の表題規則は未提示",
    次工程: "TXTDL納品",
    bodyRevisionPerformedInPhaseC: false,
    newStoryFactAdded: false,
    unprovidedSeriesRuleChecked: false
  };
}

function runToPhaseC() {
  let s = createTS90RuntimeSession(makeRequest());
  assert.equal(s.pendingAction.actionType, "PHASE_A_DIAGNOSIS");
  s = resumeTS90RuntimeSession(s, { actionId: s.pendingAction.actionId, actionType: s.pendingAction.actionType, output: phaseAOutput() });
  assert.equal(s.pendingAction.actionType, "PHASE_B_REVISION");
  s = resumeTS90RuntimeSession(s, { actionId: s.pendingAction.actionId, actionType: s.pendingAction.actionType, output: phaseBOutput(s) });
  assert.equal(s.pendingAction.actionType, "PHASE_C_TITLE");
  return s;
}

test("boot waits for receivable text and never auto edits", () => {
  const s = createTS90RuntimeSession({ operation: "BOOT" });
  assert.equal(s.state, "WAIT_FOR_RECEIVABLE_TEXT");
  assert.equal(s.pendingAction, null);
  assert.ok(TS90_RUNTIME_SKILLS.includes("T01_PHASE_A_DIAGNOSIS"));
});

test("continuous route executes Phase A before Phase B", () => {
  let s = createTS90RuntimeSession(makeRequest());
  assert.equal(s.route, "A_TO_C_CONTINUOUS");
  assert.equal(s.pendingAction.actionType, "PHASE_A_DIAGNOSIS");
  s = resumeTS90RuntimeSession(s, { actionId: s.pendingAction.actionId, actionType: s.pendingAction.actionType, output: phaseAOutput() });
  assert.equal(s.pendingAction.actionType, "PHASE_B_REVISION");
  assert.ok(s.evidence.phaseA);
});

test("session cannot carry Phase B evidence without Phase A on A-to-C route", () => {
  const s = createTS90RuntimeSession(makeRequest());
  const forged = JSON.parse(JSON.stringify(s));
  forged.evidence.phaseB = { fake: true };
  const v = validateTS90RuntimeSession(forged);
  assert.equal(v.decision, "SESSION_INVALID");
  assert.ok(v.failures.includes("PHASE_B_WITHOUT_PHASE_A_EVIDENCE"));
});

test("Phase B accepted body is the exact body sent to Phase C", () => {
  const s = runToPhaseC();
  assert.equal(s.pendingAction.payload.finalBodyText, s.evidence.phaseB.finalBodyText);
  assert.equal(s.pendingAction.payload.finalBodySha256, s.evidence.phaseB.finalBodySha256);
});

test("Phase C cannot replace receive-time fixed-condition authority", () => {
  let s = runToPhaseC();
  const bad = phaseCReport("別の固定条件");
  s = resumeTS90RuntimeSession(s, { actionId: s.pendingAction.actionId, actionType: s.pendingAction.actionType, report: bad });
  assert.equal(s.state, "STOP");
  assert.ok(s.issues.some((x) => x.code === "TITLE_FIXED_CORE_MISMATCH"));
});

test("runtime builds TXTDL from validated evidence and requires final terminal audit", () => {
  let s = runToPhaseC();
  s = resumeTS90RuntimeSession(s, { actionId: s.pendingAction.actionId, actionType: s.pendingAction.actionType, report: phaseCReport() });
  assert.equal(s.pendingAction.actionType, "FINAL_TERMINAL_AUDIT");
  assert.ok(s.evidence.artifact.files["TS90_FINAL_BODY.txt"].startsWith("契の外\n第1部 表\nP1F-001\n雨上がりの約束\n\n"));
  const report = s.evidence.artifact.files["TS90_WORK_REPORT.txt"];
  assert.ok(report.includes("Phase A"));
  assert.ok(report.includes("Phase B"));
  assert.ok(report.includes("世界を変えた日"));
  assert.ok(report.includes("シリーズ全体の表題規則は未提示"));
  s = resumeTS90RuntimeSession(s, {
    actionId: s.pendingAction.actionId,
    actionType: s.pendingAction.actionType,
    terminalGate: terminalGate(),
    finalBodyFileSha256: s.evidence.artifact.finalBodyFileSha256,
    artifactSha256: s.evidence.artifact.artifactSha256
  });
  assert.equal(s.state, "SUCCESS");
  assert.equal(s.terminalDecision, "SUCCESS");
});

test("final terminal audit rejects forged artifact hash", () => {
  let s = runToPhaseC();
  s = resumeTS90RuntimeSession(s, { actionId: s.pendingAction.actionId, actionType: s.pendingAction.actionType, report: phaseCReport() });
  s = resumeTS90RuntimeSession(s, {
    actionId: s.pendingAction.actionId,
    actionType: s.pendingAction.actionType,
    terminalGate: terminalGate(),
    finalBodyFileSha256: s.evidence.artifact.finalBodyFileSha256,
    artifactSha256: "bad"
  });
  assert.equal(s.state, "STOP");
  assert.ok(s.issues.includes("ARTIFACT_HASH_MISMATCH"));
});

test("low-level title validator rejects report-fixed-core shadowing", () => {
  const report = phaseCReport("FAKE");
  const result = evaluateTitleDecisionReport(report, {
    bodyWorkComplete: true,
    finalBodyText: "本文",
    fixedConditions: "REAL"
  });
  assert.equal(result.decision, "TITLE_DECISION_STOP");
  assert.ok(result.failures.some((x) => x.code === "TITLE_FIXED_CORE_MISMATCH"));
});

test("low-level STOP TXTDL rejects a tiny unstructured stop report", () => {
  const result = evaluateAToCTXTDLOutput({
    status: "STOP",
    stoppedStage: "固定条件照合",
    reason: "不一致",
    TXTDL: { "TS90_STOP_REPORT.txt": "tiny" }
  });
  assert.equal(result.decision, "A_TO_C_TXTDL_STOP");
  assert.ok(result.failures.some((x) => x.code === "STOP_REPORT_IMPACT_REQUIRED"));
});

test("low-level success TXTDL requires terminal locks and bound work-report evidence", () => {
  const title = phaseCReport();
  const packet = {
    bodyReportSeparated: true,
    finalCoolingComplete: true,
    fixedConditionCheckPassed: true,
    episodeLabel: "P1F-001",
    fixedConditions: "雨上がりの駅で、約束を変えずに終える",
    TXTDL: {
      "TS90_FINAL_BODY.txt": "P1F-001\n雨上がりの約束\n\n本文",
      "TS90_WORK_REPORT.txt": "x"
    },
    phaseCTitleDecision: title
  };
  const result = evaluateAToCTXTDLOutput(packet);
  assert.equal(result.decision, "A_TO_C_TXTDL_STOP");
  assert.ok(result.failures.some((x) => x.code === "TERMINAL_GATE_MISSING"));
  assert.ok(result.failures.some((x) => x.code === "WORK_REPORT_REQUIRED_SECTION_MISSING"));
});

function stableValueForTest(value) {
  if (Array.isArray(value)) return value.map(stableValueForTest);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValueForTest(value[key])]));
  }
  return value;
}
const stableStringifyForTest = (value) => JSON.stringify(stableValueForTest(value));

test("serialized session rejects a forged pending action even when request evidence is untouched", () => {
  const s = createTS90RuntimeSession(makeRequest());
  const forged = JSON.parse(JSON.stringify(s));
  forged.pendingAction.actionType = "PHASE_C_TITLE";
  forged.pendingAction.payload = { fake: true };
  forged.pendingAction.actionId = "TS90-FORGED-ACTION";
  const v = validateTS90RuntimeSession(forged);
  assert.equal(v.decision, "SESSION_INVALID");
  assert.ok(v.failures.includes("PENDING_ACTION_ID_MISMATCH"));
  assert.ok(v.failures.includes("PENDING_ACTION_TYPE_MISMATCH"));
  assert.ok(v.failures.includes("PENDING_ACTION_PAYLOAD_MISMATCH"));
});

test("serialized session revalidates Phase A evidence even when the attacker recomputes its local hash", () => {
  let s = createTS90RuntimeSession(makeRequest());
  s = resumeTS90RuntimeSession(s, {
    actionId: s.pendingAction.actionId,
    actionType: s.pendingAction.actionType,
    output: phaseAOutput()
  });
  const forged = JSON.parse(JSON.stringify(s));
  delete forged.evidence.phaseA.output["通し診断"];
  forged.evidence.phaseA.outputSha256 = sha256Text(stableStringifyForTest(forged.evidence.phaseA.output));
  const v = validateTS90RuntimeSession(forged);
  assert.equal(v.decision, "SESSION_INVALID");
  assert.ok(v.failures.includes("PHASE_A_EVIDENCE_REVALIDATION_FAILED"));
});

test("serialized SUCCESS cannot preserve success after artifact contents are forged", () => {
  let s = runToPhaseC();
  s = resumeTS90RuntimeSession(s, {
    actionId: s.pendingAction.actionId,
    actionType: s.pendingAction.actionType,
    report: phaseCReport()
  });
  s = resumeTS90RuntimeSession(s, {
    actionId: s.pendingAction.actionId,
    actionType: s.pendingAction.actionType,
    terminalGate: terminalGate(),
    finalBodyFileSha256: s.evidence.artifact.finalBodyFileSha256,
    artifactSha256: s.evidence.artifact.artifactSha256
  });
  assert.equal(s.state, "SUCCESS");
  const forged = JSON.parse(JSON.stringify(s));
  forged.evidence.artifact.files["TS90_WORK_REPORT.txt"] += "\nFORGED";
  const v = validateTS90RuntimeSession(forged);
  assert.equal(v.decision, "SESSION_INVALID");
  assert.ok(v.failures.includes("ARTIFACT_EVIDENCE_REBUILD_MISMATCH"));
});


function runToSuccess() {
  let s = runToPhaseC();
  s = resumeTS90RuntimeSession(s, {
    actionId: s.pendingAction.actionId,
    actionType: s.pendingAction.actionType,
    report: phaseCReport()
  });
  s = resumeTS90RuntimeSession(s, {
    actionId: s.pendingAction.actionId,
    actionType: s.pendingAction.actionType,
    terminalGate: terminalGate(),
    finalBodyFileSha256: s.evidence.artifact.finalBodyFileSha256,
    artifactSha256: s.evidence.artifact.artifactSha256
  });
  assert.equal(s.state, "SUCCESS");
  return s;
}

test("serialized pre-terminal session cannot forge SUCCESS with copied artifact hashes", () => {
  let s = runToPhaseC();
  s = resumeTS90RuntimeSession(s, {
    actionId: s.pendingAction.actionId,
    actionType: s.pendingAction.actionType,
    report: phaseCReport()
  });
  assert.equal(s.pendingAction.actionType, "FINAL_TERMINAL_AUDIT");
  const forged = JSON.parse(JSON.stringify(s));
  forged.evidence.terminal = {
    actionId: forged.pendingAction.actionId,
    actionType: forged.pendingAction.actionType,
    terminalGate: { fake: true },
    terminalGateSha256: sha256Text(stableStringifyForTest({ fake: true })),
    terminalPacketSha256: "0".repeat(64),
    finalBodyFileSha256: forged.evidence.artifact.finalBodyFileSha256,
    artifactSha256: forged.evidence.artifact.artifactSha256,
    decision: "TERMINAL_PASS"
  };
  forged.state = "SUCCESS";
  forged.pendingAction = null;
  forged.terminalDecision = "SUCCESS";
  forged.artifact = forged.evidence.artifact;
  const v = validateTS90RuntimeSession(forged);
  assert.equal(v.decision, "SESSION_INVALID");
  assert.ok(v.failures.includes("TERMINAL_EVIDENCE_REVALIDATION_FAILED") || v.failures.includes("TERMINAL_PACKET_HASH_MISMATCH"));
});

test("serialized SUCCESS rejects a damaged terminal gate", () => {
  const s = runToSuccess();
  const forged = JSON.parse(JSON.stringify(s));
  forged.evidence.terminal.terminalGate.完全収束.residueItems = ["FORGED"];
  forged.evidence.terminal.terminalGateSha256 = sha256Text(stableStringifyForTest(forged.evidence.terminal.terminalGate));
  const v = validateTS90RuntimeSession(forged);
  assert.equal(v.decision, "SESSION_INVALID");
  assert.ok(v.failures.includes("TERMINAL_PACKET_HASH_MISMATCH") || v.failures.includes("TERMINAL_EVIDENCE_REVALIDATION_FAILED"));
});

test("serialized SUCCESS requires terminalDecision SUCCESS", () => {
  const s = runToSuccess();
  const forged = JSON.parse(JSON.stringify(s));
  forged.terminalDecision = "STOP";
  const v = validateTS90RuntimeSession(forged);
  assert.equal(v.decision, "SESSION_INVALID");
  assert.ok(v.failures.includes("SUCCESS_TERMINAL_DECISION_MISMATCH"));
});

test("serialized session binds packageVersion", () => {
  const s = runToSuccess();
  const forged = JSON.parse(JSON.stringify(s));
  forged.packageVersion = "TS90_FORGED_PACKAGE";
  const v = validateTS90RuntimeSession(forged);
  assert.equal(v.decision, "SESSION_INVALID");
  assert.ok(v.failures.includes("SESSION_PACKAGE_VERSION_MISMATCH"));
});

test("serialized session binds deterministic sessionId", () => {
  const s = runToSuccess();
  const forged = JSON.parse(JSON.stringify(s));
  forged.sessionId = "TS90S-FORGED";
  const v = validateTS90RuntimeSession(forged);
  assert.equal(v.decision, "SESSION_INVALID");
  assert.ok(v.failures.includes("SESSION_ID_MISMATCH"));
});

test("serialized SUCCESS requires exact top-level artifact and no pending action", () => {
  const s = runToSuccess();
  const forged = JSON.parse(JSON.stringify(s));
  forged.artifact = { fake: true };
  forged.pendingAction = { actionId: "fake", actionType: "FINAL_TERMINAL_AUDIT", payload: {} };
  const v = validateTS90RuntimeSession(forged);
  assert.equal(v.decision, "SESSION_INVALID");
  assert.ok(v.failures.includes("SUCCESS_TOP_LEVEL_ARTIFACT_MISMATCH"));
  assert.ok(v.failures.includes("SUCCESS_PENDING_ACTION_DENIED"));
});


test("serialized terminal-success evidence cannot be downgraded from SUCCESS to READY", () => {
  const s = runToSuccess();
  const forged = JSON.parse(JSON.stringify(s));
  forged.state = "READY";
  const v = validateTS90RuntimeSession(forged);
  assert.equal(v.decision, "SESSION_INVALID");
  assert.ok(v.failures.includes("TERMINAL_SUCCESS_STATE_MISMATCH"));
});

test("serialized session with circular evidence fails closed instead of throwing", () => {
  const s = runToSuccess();
  const forged = { ...s, evidence: { ...s.evidence } };
  forged.evidence.loop = forged.evidence;
  assert.doesNotThrow(() => validateTS90RuntimeSession(forged));
  const v = validateTS90RuntimeSession(forged);
  assert.equal(v.decision, "SESSION_INVALID");
  assert.ok(v.failures.includes("SESSION_CIRCULAR_REFERENCE_DENIED"));
  assert.doesNotThrow(() => resumeTS90RuntimeSession(forged, {}));
  const resumed = resumeTS90RuntimeSession(forged, {});
  assert.equal(resumed.state, "STOP");
});

test("serialized success missing Phase B evidence fails closed instead of throwing", () => {
  const s = runToSuccess();
  const forged = JSON.parse(JSON.stringify(s));
  delete forged.evidence.phaseB;
  assert.doesNotThrow(() => validateTS90RuntimeSession(forged));
  const v = validateTS90RuntimeSession(forged);
  assert.equal(v.decision, "SESSION_INVALID");
  assert.ok(v.failures.includes("ARTIFACT_WITHOUT_PHASE_B_EVIDENCE") || v.failures.includes("PHASE_C_WITHOUT_PHASE_B_EVIDENCE"));
  assert.doesNotThrow(() => resumeTS90RuntimeSession(forged, {}));
  const resumed = resumeTS90RuntimeSession(forged, {});
  assert.equal(resumed.state, "STOP");
});

test("terminalDecision SUCCESS cannot exist on a non-SUCCESS state", () => {
  const s = runToSuccess();
  const forged = JSON.parse(JSON.stringify(s));
  forged.state = "WAITING_FOR_HOST";
  forged.pendingAction = null;
  const v = validateTS90RuntimeSession(forged);
  assert.equal(v.decision, "SESSION_INVALID");
  assert.ok(v.failures.includes("TERMINAL_SUCCESS_STATE_MISMATCH"));
});

test("WAIT state is re-derived from the original request and cannot shadow a RUN route", () => {
  const s = createTS90RuntimeSession(makeRequest());
  const altered = JSON.parse(JSON.stringify(s));
  altered.route = "WAIT";
  altered.state = "WAIT_FOR_RECEIVABLE_TEXT";
  altered.receiveResult = { decision: "WAIT_FOR_RECEIVABLE_TEXT", phase: null, failures: [] };
  altered.evidence = {};
  altered.pendingAction = null;
  altered.terminalDecision = null;
  const v = validateTS90RuntimeSession(altered);
  assert.equal(v.decision, "SESSION_INVALID");
  assert.ok(v.failures.includes("SESSION_ROUTE_MISMATCH"));
});

test("a legitimate BOOT WAIT session remains valid after route re-derivation", () => {
  const s = createTS90RuntimeSession({ operation: "BOOT" });
  const v = validateTS90RuntimeSession(s);
  assert.equal(v.decision, "SESSION_VALID");
});

test("Phase C evidence on the continuous route requires its deterministic artifact", () => {
  let s = runToPhaseC();
  s = resumeTS90RuntimeSession(s, {
    actionId: s.pendingAction.actionId,
    actionType: s.pendingAction.actionType,
    report: phaseCReport()
  });
  const altered = JSON.parse(JSON.stringify(s));
  delete altered.evidence.artifact;
  altered.state = "READY";
  altered.pendingAction = null;
  const v = validateTS90RuntimeSession(altered);
  assert.equal(v.decision, "SESSION_INVALID");
  assert.ok(v.failures.includes("PHASE_C_ARTIFACT_EVIDENCE_REQUIRED"));
});

test("pending action envelope binds schema runtimeVersion and sessionId", () => {
  const s = createTS90RuntimeSession(makeRequest());
  for (const mutate of [
    (x) => { delete x.pendingAction.schema; },
    (x) => { x.pendingAction.runtimeVersion = "ts90-other"; },
    (x) => { x.pendingAction.sessionId = "TS90S-other"; }
  ]) {
    const altered = JSON.parse(JSON.stringify(s));
    mutate(altered);
    const v = validateTS90RuntimeSession(altered);
    assert.equal(v.decision, "SESSION_INVALID");
  }
});

test("create fails closed on circular request input instead of throwing", () => {
  const request = makeRequest();
  request.input.loop = request.input;
  assert.doesNotThrow(() => createTS90RuntimeSession(request));
  const s = createTS90RuntimeSession(request);
  assert.equal(s.state, "STOP");
  assert.ok(s.issues.includes("SESSION_CREATE_CIRCULAR_REFERENCE_DENIED"));
});

test("resume Phase A input fails closed on circular host output", () => {
  const s = createTS90RuntimeSession(makeRequest());
  const output = phaseAOutput();
  output.loop = output;
  assert.doesNotThrow(() => resumeTS90RuntimeSession(s, { actionId: s.pendingAction.actionId, actionType: s.pendingAction.actionType, output }));
  const stopped = resumeTS90RuntimeSession(s, { actionId: s.pendingAction.actionId, actionType: s.pendingAction.actionType, output });
  assert.equal(stopped.state, "STOP");
  assert.ok(stopped.issues.includes("SESSION_RESUME_CIRCULAR_REFERENCE_DENIED"));
});

test("resume Phase B input fails closed on circular host output", () => {
  let s = createTS90RuntimeSession(makeRequest());
  s = resumeTS90RuntimeSession(s, { actionId: s.pendingAction.actionId, actionType: s.pendingAction.actionType, output: phaseAOutput() });
  const output = phaseBOutput(s);
  output.loop = output;
  assert.doesNotThrow(() => resumeTS90RuntimeSession(s, { actionId: s.pendingAction.actionId, actionType: s.pendingAction.actionType, output }));
  const stopped = resumeTS90RuntimeSession(s, { actionId: s.pendingAction.actionId, actionType: s.pendingAction.actionType, output });
  assert.equal(stopped.state, "STOP");
  assert.ok(stopped.issues.includes("SESSION_RESUME_CIRCULAR_REFERENCE_DENIED"));
});

test("resume Phase C input fails closed on circular title report", () => {
  const s = runToPhaseC();
  const report = phaseCReport();
  report.loop = report;
  assert.doesNotThrow(() => resumeTS90RuntimeSession(s, { actionId: s.pendingAction.actionId, actionType: s.pendingAction.actionType, report }));
  const stopped = resumeTS90RuntimeSession(s, { actionId: s.pendingAction.actionId, actionType: s.pendingAction.actionType, report });
  assert.equal(stopped.state, "STOP");
  assert.ok(stopped.issues.includes("SESSION_RESUME_CIRCULAR_REFERENCE_DENIED"));
});

test("resume terminal input fails closed on circular terminal gate", () => {
  let s = runToPhaseC();
  s = resumeTS90RuntimeSession(s, { actionId: s.pendingAction.actionId, actionType: s.pendingAction.actionType, report: phaseCReport() });
  const gate = terminalGate();
  gate.loop = gate;
  const host = {
    actionId: s.pendingAction.actionId,
    actionType: s.pendingAction.actionType,
    terminalGate: gate,
    finalBodyFileSha256: s.evidence.artifact.finalBodyFileSha256,
    artifactSha256: s.evidence.artifact.artifactSha256
  };
  assert.doesNotThrow(() => resumeTS90RuntimeSession(s, host));
  const stopped = resumeTS90RuntimeSession(s, host);
  assert.equal(stopped.state, "STOP");
  assert.ok(stopped.issues.includes("SESSION_RESUME_CIRCULAR_REFERENCE_DENIED"));
});


function assertSessionJsonRoundTrip(session, label) {
  const before = validateTS90RuntimeSession(session);
  assert.equal(before.decision, "SESSION_VALID", `${label}: pre-serialize validation`);
  let json;
  assert.doesNotThrow(() => { json = JSON.stringify(session); }, `${label}: JSON.stringify`);
  const parsed = JSON.parse(json);
  const after = validateTS90RuntimeSession(parsed);
  assert.equal(after.decision, "SESSION_VALID", `${label}: post-roundtrip validation: ${after.failures?.join(",")}`);
}

function deepObject(depth) {
  let value = { leaf: true };
  for (let i = 0; i < depth; i += 1) value = { next: value };
  return value;
}

test("SESSION_VALID implies JSON stringify and round-trip validity across all runtime states", () => {
  const wait = createTS90RuntimeSession({ operation: "BOOT" });
  assertSessionJsonRoundTrip(wait, "WAIT");

  let s = createTS90RuntimeSession(makeRequest());
  assertSessionJsonRoundTrip(s, "CREATE_READY");

  s = resumeTS90RuntimeSession(s, { actionId: s.pendingAction.actionId, actionType: s.pendingAction.actionType, output: phaseAOutput() });
  assertSessionJsonRoundTrip(s, "PHASE_A");

  s = resumeTS90RuntimeSession(s, { actionId: s.pendingAction.actionId, actionType: s.pendingAction.actionType, output: phaseBOutput(s) });
  assertSessionJsonRoundTrip(s, "PHASE_B");

  s = resumeTS90RuntimeSession(s, { actionId: s.pendingAction.actionId, actionType: s.pendingAction.actionType, report: phaseCReport() });
  assertSessionJsonRoundTrip(s, "PHASE_C");

  s = resumeTS90RuntimeSession(s, {
    actionId: s.pendingAction.actionId,
    actionType: s.pendingAction.actionType,
    terminalGate: terminalGate(),
    finalBodyFileSha256: s.evidence.artifact.finalBodyFileSha256,
    artifactSha256: s.evidence.artifact.artifactSha256
  });
  assertSessionJsonRoundTrip(s, "TERMINAL_SUCCESS");

  const badRequest = makeRequest();
  badRequest.input.inputMode = "UNKNOWN_INPUT_MODE";
  const stopped = createTS90RuntimeSession(badRequest);
  assert.equal(stopped.state, "STOP");
  assertSessionJsonRoundTrip(stopped, "STOP");
});

test("request values with callable toJSON are rejected before session authority is created", () => {
  class WithToJSON {
    constructor(mode = "throw") { this.mode = mode; }
    toJSON() {
      if (this.mode === "bigint") return 1n;
      throw new Error("toJSON must never execute inside TS90");
    }
  }
  for (const mode of ["throw", "bigint"]) {
    const request = makeRequest();
    request.metadata.external = new WithToJSON(mode);
    let s;
    assert.doesNotThrow(() => { s = createTS90RuntimeSession(request); });
    assert.equal(s.state, "STOP");
    assert.ok(s.issues.some((x) => String(x).includes("JSON_DATA_CALLABLE_TOJSON_DENIED")));
    assert.doesNotThrow(() => JSON.stringify(s));
  }
});

test("Date URL boxed primitives Map Set and RegExp are rejected rather than hashed as lossy JSON", () => {
  const values = [
    new Date("2026-08-17T00:00:00Z"),
    new URL("https://example.com/x"),
    new Number(1),
    new Boolean(true),
    new String("x"),
    new Map([["a", 1]]),
    new Set([1]),
    /x/
  ];
  for (const value of values) {
    const request = makeRequest();
    request.metadata.external = value;
    const s = createTS90RuntimeSession(request);
    assert.equal(s.state, "STOP", Object.prototype.toString.call(value));
    assert.ok(s.issues.some((x) => String(x).includes("SESSION_CREATE_JSON_DATA_DENIED")));
  }
});

test("non-finite numbers negative zero undefined function symbol and sparse arrays are rejected before hashing", () => {
  const cases = [
    ["NaN", NaN],
    ["Infinity", Infinity],
    ["negativeZero", -0],
    ["undefined", undefined],
    ["function", () => 1],
    ["symbol", Symbol("x")]
  ];
  for (const [label, value] of cases) {
    const request = makeRequest();
    request.metadata.external = value;
    const s = createTS90RuntimeSession(request);
    assert.equal(s.state, "STOP", label);
    assert.ok(s.issues.some((x) => String(x).includes("SESSION_CREATE_JSON_DATA_DENIED")), label);
  }
  const sparse = [];
  sparse.length = 2;
  sparse[1] = "x";
  const request = makeRequest();
  request.metadata.external = sparse;
  const s = createTS90RuntimeSession(request);
  assert.equal(s.state, "STOP");
  assert.ok(s.issues.some((x) => String(x).includes("JSON_DATA_SPARSE_ARRAY_DENIED")));
});

test("host outputs with non-JSON values fail closed before evidence hashes are stored", () => {
  let s = createTS90RuntimeSession(makeRequest());
  const output = phaseAOutput();
  output.externalDate = new Date("2026-08-17T00:00:00Z");
  const stopped = resumeTS90RuntimeSession(s, { actionId: s.pendingAction.actionId, actionType: s.pendingAction.actionType, output });
  assert.equal(stopped.state, "STOP");
  assert.ok(stopped.issues.some((x) => String(x).includes("SESSION_RESUME_JSON_DATA_DENIED")));
  assert.doesNotThrow(() => JSON.stringify(stopped));
});

test("low-level receive validator fails closed on circular and BigInt fixed conditions", () => {
  const circular = makeRequest().input;
  circular.constraints.fixedConditions = circular.constraints;
  let result;
  assert.doesNotThrow(() => { result = evaluateToshiReceive(circular); });
  assert.equal(result.decision, "RECEIVE_STOP");
  assert.ok(result.failures.some((x) => x.code.includes("JSON_DATA_BOUNDARY_DENIED")));

  const bigint = makeRequest().input;
  bigint.constraints.fixedConditions = 1n;
  assert.doesNotThrow(() => { result = evaluateToshiReceive(bigint); });
  assert.equal(result.decision, "RECEIVE_STOP");
  assert.ok(result.failures.some((x) => x.code.includes("JSON_DATA_BIGINT_DENIED")));
});

test("low-level adaptive report validator fails closed on circular diff evidence", () => {
  const report = { diffEvidence: [] };
  report.diffEvidence.push(report);
  let result;
  assert.doesNotThrow(() => { result = evaluateAdaptiveEditorReport(report, {}); });
  assert.equal(result.decision, "ADAPTIVE_REPORT_STOP");
  assert.ok(result.failures.some((x) => x.code.includes("JSON_DATA_BOUNDARY_DENIED")));
});

test("explicit structural budget rejects excessive depth without process exception", () => {
  const request = makeRequest();
  request.metadata.deep = deepObject(600);
  let s;
  assert.doesNotThrow(() => { s = createTS90RuntimeSession(request); });
  assert.equal(s.state, "STOP");
  assert.ok(s.issues.some((x) => String(x).includes("JSON_DATA_MAX_DEPTH_EXCEEDED")));
  assert.doesNotThrow(() => JSON.stringify(s));
});

test("NaN and null can no longer collapse into the same valid request identity", () => {
  const nanRequest = makeRequest();
  nanRequest.metadata.external = NaN;
  const nanSession = createTS90RuntimeSession(nanRequest);
  assert.equal(nanSession.state, "STOP");

  const nullRequest = makeRequest();
  nullRequest.metadata.external = null;
  const nullSession = createTS90RuntimeSession(nullRequest);
  assert.notEqual(nullSession.state, "STOP");
  assert.equal(validateTS90RuntimeSession(nullSession).decision, "SESSION_VALID");
});

test("callable toJSON is rejected on Phase A Phase B Phase C and terminal host inputs", () => {
  class WithToJSON {
    toJSON() { throw new Error("runtime must reject callable toJSON before JSON serialization"); }
  }
  const marked = () => new WithToJSON();

  let s = createTS90RuntimeSession(makeRequest());
  let out = phaseAOutput();
  out.external = marked();
  let stopped = resumeTS90RuntimeSession(s, { actionId: s.pendingAction.actionId, actionType: s.pendingAction.actionType, output: out });
  assert.equal(stopped.state, "STOP");
  assert.ok(stopped.issues.some((x) => String(x).includes("JSON_DATA_CALLABLE_TOJSON_DENIED")));

  s = createTS90RuntimeSession(makeRequest());
  s = resumeTS90RuntimeSession(s, { actionId: s.pendingAction.actionId, actionType: s.pendingAction.actionType, output: phaseAOutput() });
  out = phaseBOutput(s);
  out.external = marked();
  stopped = resumeTS90RuntimeSession(s, { actionId: s.pendingAction.actionId, actionType: s.pendingAction.actionType, output: out });
  assert.equal(stopped.state, "STOP");
  assert.ok(stopped.issues.some((x) => String(x).includes("JSON_DATA_CALLABLE_TOJSON_DENIED")));

  s = runToPhaseC();
  const report = phaseCReport();
  report.external = marked();
  stopped = resumeTS90RuntimeSession(s, { actionId: s.pendingAction.actionId, actionType: s.pendingAction.actionType, report });
  assert.equal(stopped.state, "STOP");
  assert.ok(stopped.issues.some((x) => String(x).includes("JSON_DATA_CALLABLE_TOJSON_DENIED")));

  s = runToPhaseC();
  s = resumeTS90RuntimeSession(s, { actionId: s.pendingAction.actionId, actionType: s.pendingAction.actionType, report: phaseCReport() });
  const host = {
    actionId: s.pendingAction.actionId,
    actionType: s.pendingAction.actionType,
    terminalGate: terminalGate(),
    finalBodyFileSha256: s.evidence.artifact.finalBodyFileSha256,
    artifactSha256: s.evidence.artifact.artifactSha256,
    external: marked()
  };
  stopped = resumeTS90RuntimeSession(s, host);
  assert.equal(stopped.state, "STOP");
  assert.ok(stopped.issues.some((x) => String(x).includes("JSON_DATA_CALLABLE_TOJSON_DENIED")));
});

test("explicit node-count and canonical-byte budgets fail closed", () => {
  const nodeRequest = makeRequest();
  nodeRequest.metadata.wide = Array.from({ length: 200001 }, () => 0);
  let s;
  assert.doesNotThrow(() => { s = createTS90RuntimeSession(nodeRequest); });
  assert.equal(s.state, "STOP");
  assert.ok(s.issues.some((x) => String(x).includes("JSON_DATA_MAX_NODES_EXCEEDED")));

  const byteRequest = makeRequest();
  byteRequest.metadata.large = "x".repeat((16 * 1024 * 1024) + 1024);
  assert.doesNotThrow(() => { s = createTS90RuntimeSession(byteRequest); });
  assert.equal(s.state, "STOP");
  assert.ok(s.issues.some((x) => String(x).includes("JSON_DATA_MAX_CANONICAL_BYTES_EXCEEDED")));
});
