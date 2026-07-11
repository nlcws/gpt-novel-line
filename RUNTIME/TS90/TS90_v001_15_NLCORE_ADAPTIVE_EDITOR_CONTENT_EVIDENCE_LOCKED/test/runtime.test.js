import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import {
  ADAPTIVE_DIAGNOSTIC_LAYERS,
  ADAPTIVE_EDITOR_LOCK_MANIFEST,
  ADAPTIVE_EDITOR_LOCK_READ_ORDER,
  ADAPTIVE_EDITOR_POLICY,
  ADAPTIVE_FINALIZATION_ORDER,
  ADAPTIVE_STAGE_ORDER,
  ADAPTIVE_STOP_SIGNALS,
  ALL_LINE_LOCK_READ_ORDER,
  BOOT_READ_ORDER,
  CHAT_MOUNT_BOOT,
  FULL_CONVERGENCE_REQUIRED_FLAGS,
  FULL_REVISION_LOCK_MANIFEST,
  FULL_REVISION_LOCK_READ_ORDER,
  FULL_REVISION_POLICY,
  FULL_REVISION_STAGE_ORDER,
  BASELINE_PROMOTION_DECISIONS,
  BLADE_STRENGTH_SCALE,
  EDIT_CHANGE_CLASSIFICATIONS,
  ROLLBACK_REQUIRED_CLASSIFICATIONS,
  HEAT_DELIVERY_REQUIRED_FLAGS,
  LOCK_MANIFEST,
  NOVEL_LINE_CORE_MANIFEST,
  NOVEL_LINE_CORE_READ_ORDER,
  PHASE_SELF_DIRECTED_LOCK_MANIFEST,
  PHASE_SELF_DIRECTED_LOCK_READ_ORDER,
  HISTORY_MASTER_REAPPLY_LOCK_MANIFEST,
  HISTORY_MASTER_REAPPLY_LOCK_READ_ORDER,
  TEXT_RECEIVE_LOCK_MANIFEST,
  TEXT_RECEIVE_LOCK_READ_ORDER,
  PACKAGE_EXPECTED_FILES,
  PACKAGE_VERSION,
  READ_ORDER,
  RUNTIME_VERSION,
  REVISION_STRENGTHS,
  SOURCE_MANIFEST,
  SOURCE_READ_ORDER,
  TERMINAL_LOCKS
} from "../src/program.js";
import {
  baselineText,
  canonicalDiffHunks,
  extractBodyText,
  buildAdaptiveEditPlan,
  evaluateAdaptiveEditPlan,
  evaluateAdaptiveDiagnosis,
  evaluateAdaptiveEditorReport,
  evaluateRevisionComparison,
  evaluateTerminalLocks,
  evaluateToshiOutput,
  evaluateToshiReceive,
  resolveRevisionAuthorization
} from "../src/receive-gate.js";

for (const expected of SOURCE_MANIFEST) {
  test(`${expected.path} is byte-identical to original`, () => {
    const url = new URL(`../${expected.path}`, import.meta.url);
    const content = readFileSync(url);
    assert.equal(statSync(url).size, expected.bytes);
    assert.equal(createHash("sha256").update(content).digest("hex").toUpperCase(), expected.sha256);
  });
}

for (const expected of LOCK_MANIFEST) {
  test(`${expected.path} terminal lock source is byte-identical`, () => {
    const url = new URL(`../${expected.path}`, import.meta.url);
    const content = readFileSync(url);
    assert.equal(statSync(url).size, expected.bytes);
    assert.equal(createHash("sha256").update(content).digest("hex").toUpperCase(), expected.sha256);
  });
}

for (const expected of NOVEL_LINE_CORE_MANIFEST) {
  test(`${expected.path} novel line core source is byte-identical`, () => {
    const url = new URL(`../${expected.path}`, import.meta.url);
    const content = readFileSync(url);
    assert.equal(statSync(url).size, expected.bytes);
    assert.equal(createHash("sha256").update(content).digest("hex").toUpperCase(), expected.sha256);
    assert.ok(content.toString("utf8").includes("条件内で一切の妥協をせずに、限界まで本文を出す"));
  });
}

for (const expected of PHASE_SELF_DIRECTED_LOCK_MANIFEST) {
  test(`${expected.path} phase self-directed lock source is byte-identical`, () => {
    const url = new URL(`../${expected.path}`, import.meta.url);
    const content = readFileSync(url);
    assert.equal(statSync(url).size, expected.bytes);
    assert.equal(createHash("sha256").update(content).digest("hex").toUpperCase(), expected.sha256);
    assert.ok(content.toString("utf8").includes("Phase Aで修正刃さま自身が出した"));
    assert.ok(content.toString("utf8").includes("外部文献"));
  });
}

for (const expected of FULL_REVISION_LOCK_MANIFEST) {
  test(`${expected.path} full revision lock source is byte-identical`, () => {
    const url = new URL(`../${expected.path}`, import.meta.url);
    const content = readFileSync(url);
    assert.equal(statSync(url).size, expected.bytes);
    assert.equal(createHash("sha256").update(content).digest("hex").toUpperCase(), expected.sha256);
    assert.ok(content.toString("utf8").includes("編成校正"));
    assert.ok(content.toString("utf8").includes("作者不明"));
    assert.ok(content.toString("utf8").includes("基準稿"));
  });
}

for (const expected of ADAPTIVE_EDITOR_LOCK_MANIFEST) {
  test(`${expected.path} adaptive editor director lock source is byte-identical`, () => {
    const url = new URL(`../${expected.path}`, import.meta.url);
    const content = readFileSync(url);
    assert.equal(statSync(url).size, expected.bytes);
    assert.equal(createHash("sha256").update(content).digest("hex").toUpperCase(), expected.sha256);
    const text = content.toString("utf8");
    assert.ok(text.includes("必要な刃"));
    assert.ok(text.includes("効果不明"));
    assert.ok(text.includes("INPUT_SNAPSHOT"));
  });
}

for (const expected of TEXT_RECEIVE_LOCK_MANIFEST) {
  test(`${expected.path} text receive lightweight lock source is byte-identical`, () => {
    const url = new URL(`../${expected.path}`, import.meta.url);
    const content = readFileSync(url);
    assert.equal(statSync(url).size, expected.bytes);
    assert.equal(createHash("sha256").update(content).digest("hex").toUpperCase(), expected.sha256);
    assert.ok(content.toString("utf8").includes("TXT本文"));
  });
}

test("chat mount auto boots receive gate and terminal locks but never auto repairs", () => {
  assert.equal(RUNTIME_VERSION, "ts90-v001.15-nlcore-adaptive-editor-content-evidence-locked");
  assert.equal(PACKAGE_VERSION, "TS90_v001_15_NLCORE_ADAPTIVE_EDITOR_CONTENT_EVIDENCE_LOCKED");
  assert.equal(CHAT_MOUNT_BOOT.mode, "AUTO_BOOT_ON_CHAT_MOUNT");
  assert.equal(CHAT_MOUNT_BOOT.entry, "START_HERE.js");
  assert.equal(CHAT_MOUNT_BOOT.readOrderRequired, true);
  assert.equal(CHAT_MOUNT_BOOT.autoStart, true);
  assert.equal(CHAT_MOUNT_BOOT.autoRepair, false);
  assert.equal(CHAT_MOUNT_BOOT.waitState, "WAIT_FOR_RECEIVABLE_TEXT");
  assert.equal(TERMINAL_LOCKS.endUserHeatDeliveryLocked, true);
  assert.equal(TERMINAL_LOCKS.fullConvergenceSweepLocked, true);
});

const writerSuccess = () => ({
  decision: "SUCCESS",
  success: true,
  output_gate_passed: true,
  canonical_text: true,
  quarantine: false,
  degraded: false,
  unsaved: false,
  output: {
    filename_line: "E001.txt",
    target_length_or_self_bound: "full recovery",
    frozen_condition_table_short: "frozen",
    text: "本文",
    本文後LOG: "log"
  }
});

const receiveBase = () => ({
  inputMode: "WRITER_SUCCESS_HANDOFF",
  writerResult: writerSuccess(),
  targetRange: "E001-E010",
  storyCount: 10,
  requiredComparisonSourcePresent: true
});

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
      保持する熱量: "欲しい絵の核"
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
      nextAction: "Phase Bへ"
    }
  });

const phaseAOutput = () => ({
  通し診断: {
    対象範囲: "E001-E010",
    読了範囲: "E001-E010",
    最低体裁: "OK",
    累積破綻: "なし",
    矛盾: "なし",
    重複: "軽微",
    温度差: "なし",
    校正で済む箇所: "あり",
    改稿が必要な箇所: "なし",
    設計へ戻すべき箇所: "なし",
    修正可能箇所: "表層",
    "未確認 / 保留": "なし"
  },
  Phase_A_修正指示: {
    修正強度: "light",
    優先順位: "表記",
    対象話別指示: "E001",
    触ってよいもの: "誤字",
    触ってはいけないもの: "核",
    残す核: "核A",
    設計戻し: "なし",
    未解決: "なし",
    "Phase Bへ進む条件": "範囲確定"
  },
  終端ゲート: terminalGate()
});

test("plain text receive is the normal lightweight path", () => {
  const result = evaluateToshiReceive({
    inputMode: "PW90_TEXT_HANDOFF",
    targetText: "PW90本文",
    targetRange: "E001",
    storyCount: 1
  });
  assert.equal(result.decision, "PHASE_A_READY");
});

test("legacy existing text remains available only by explicit legacy mode", () => {
  const result = evaluateToshiReceive({
    inputMode: "LEGACY_EXISTING_TEXT",
    legacySourceDeclared: true,
    targetText: "既存本文",
    targetRange: "E001",
    storyCount: 1
  });
  assert.equal(result.decision, "PHASE_A_READY");
});

test("writer SUCCESS enters Phase A by default", () => {
  const result = evaluateToshiReceive(receiveBase());
  assert.equal(result.decision, "PHASE_A_READY");
  assert.equal(result.phase, "A");
});

test("STOP/DEGRADED/QUARANTINE writer states are rejected", () => {
  for (const decision of ["STOP_BEFORE_TEXT", "DEGRADED_REPORT_ONLY", "FAILED_TEXT_QUARANTINE", "OUTPUT_GATE_FAILED"]) {
    const input = receiveBase();
    input.writerResult = { decision, success: false, output: { text: "失敗本文" } };
    const result = evaluateToshiReceive(input);
    assert.equal(result.decision, "RECEIVE_STOP");
    assert.ok(result.failures.some((entry) => entry.code === "WRITER_STATE_REJECTED"));
  }
});

test("writer negative flags are rejected even if decision says SUCCESS", () => {
  for (const [field, value] of [["output_gate_passed", false], ["canonical_text", false], ["quarantine", true], ["degraded", true], ["unsaved", true]]) {
    const input = receiveBase();
    input.writerResult[field] = value;
    const result = evaluateToshiReceive(input);
    assert.equal(result.decision, "RECEIVE_STOP");
    assert.ok(result.failures.some((entry) => entry.code === "WRITER_NEGATIVE_FLAG_REJECTED"));
  }
});

test("over 50 stories stop but missing comparison source is not a receive gate stop", () => {
  const input = receiveBase();
  input.storyCount = 51;
  input.requiredComparisonSourcePresent = false;
  const result = evaluateToshiReceive(input);
  assert.equal(result.decision, "RECEIVE_STOP");
  assert.ok(result.failures.some((entry) => entry.code === "TARGET_SCOPE_OVER_50"));
  assert.equal(result.failures.some((entry) => entry.code === "REQUIRED_COMPARISON_SOURCE_MISSING"), false);
});

test("targetRange, storyCount, and storyOrderList consistency is enforced", () => {
  const input = receiveBase();
  input.targetRange = "E001-E010";
  input.storyCount = 9;
  input.storyOrderList = ["E001", "E002"];
  const result = evaluateToshiReceive(input);
  assert.equal(result.decision, "RECEIVE_STOP");
  assert.ok(result.failures.some((entry) => entry.code === "TARGET_RANGE_STORY_COUNT_MISMATCH"));
  assert.ok(result.failures.some((entry) => entry.code === "STORY_ORDER_COUNT_MISMATCH"));
});

test("Phase B requires instruction and complete scope", () => {
  const input = { ...receiveBase(), requestedPhase: "B" };
  let result = evaluateToshiReceive(input);
  assert.equal(result.decision, "RECEIVE_STOP");
  input.phaseAInstructionFromThisRuntime = true;
  input.revisionScope = "E001 paragraph 2";
  input.revisionStrength = "light";
  input.allowedTouchRange = "paragraph 2";
  input.doNotTouchRange = "other paragraphs";
  input.coreToKeep = "核A";
  result = evaluateToshiReceive(input);
  assert.equal(result.decision, "PHASE_B_READY");
  assert.equal(result.phase, "B");
});

test("Phase B accepts direct user scope but not external runtime instruction alone", () => {
  const direct = {
    ...receiveBase(), requestedPhase: "B", userDirectRevisionScope: true,
    revisionScope: "E001", revisionStrength: "light", allowedTouchRange: "誤字のみ",
    doNotTouchRange: "核と意味", coreToKeep: "核A"
  };
  assert.equal(evaluateToshiReceive(direct).decision, "PHASE_B_READY");

  const externalOnly = {
    ...receiveBase(), requestedPhase: "B", externalToshiInstruction: "外部指示",
    revisionScope: "E001", revisionStrength: "light", allowedTouchRange: "誤字のみ",
    doNotTouchRange: "核と意味", coreToKeep: "核A"
  };
  const result = evaluateToshiReceive(externalOnly);
  assert.equal(result.decision, "RECEIVE_STOP");
  assert.ok(result.failures.some((entry) => entry.code === "PHASE_B_INSTRUCTION_MISSING"));
  assert.ok(result.failures.some((entry) => entry.code === "EXTERNAL_TOSHI_INSTRUCTION_NOT_ACCEPTED_AS_SELF_DIRECTED_PHASE_B"));
});

test("strong Phase B requires explicit permission", () => {
  const input = {
    ...receiveBase(), requestedPhase: "B", userDirectRevisionScope: true,
    revisionScope: "E001", revisionStrength: "strong", allowedTouchRange: "E001",
    doNotTouchRange: "E002+", coreToKeep: "核A"
  };
  let result = evaluateToshiReceive(input);
  assert.equal(result.decision, "RECEIVE_STOP");
  assert.ok(result.failures.some((entry) => entry.code === "STRONG_REVISION_NOT_ALLOWED"));
  input.strongAllowed = true;
  result = evaluateToshiReceive(input);
  assert.equal(result.decision, "PHASE_B_READY");
});

test("natural-language full revision request routes to adaptive director without literal flag", () => {
  const input = {
    ...receiveBase(), requestedPhase: "B", userDirectRevisionScope: true,
    revisionScope: "E001", revisionStrength: "medium", allowedTouchRange: "本文全域",
    doNotTouchRange: "核・設定・新事件", coreToKeep: "核A",
    baselineName: "S0",
    userRevisionPolicy: "本文量は十二分にあるから思う存分やっていいよ。AI臭も可能な限り消し込んで、目標は作者不明。A→Bでお願い"
  };
  const result = evaluateToshiReceive(input);
  assert.equal(result.decision, "PHASE_B_READY");
  assert.equal(result.effectiveRevisionStrength, "strong");
  assert.equal(result.revisionProfile, "ADAPTIVE_DIRECTOR");
  assert.equal(result.fullRevision.authorized, true);
  assert.deepEqual(result.fullRevision.stageOrder, ADAPTIVE_STAGE_ORDER);
  assert.equal(result.baseline.name, "S0");
  assert.equal(result.fullRevision.branchOnly, true);
  assert.equal(result.fullRevision.overwriteBase, false);
  assert.equal(result.fullRevision.authorUnknownIsDirectionNotGuarantee, true);
});

test("explicit E5 request preserves fixed full stack as a separate profile", () => {
  const input = {
    ...receiveBase(), requestedPhase: "B", userDirectRevisionScope: true,
    revisionScope: "E001", allowedTouchRange: "本文全域", doNotTouchRange: "核", coreToKeep: "核A",
    userRevisionPolicy: "E5固定フルスタックで通して"
  };
  const result = evaluateToshiReceive(input);
  assert.equal(result.decision, "PHASE_B_READY");
  assert.equal(result.revisionProfile, "FIXED_FULL_STACK");
  assert.deepEqual(result.fullRevision.stageOrder, FULL_REVISION_STAGE_ORDER);
});

test("full revision denial overrides trigger words", () => {
  const input = {
    ...receiveBase(), requestedPhase: "B", userDirectRevisionScope: true,
    revisionScope: "E001", revisionStrength: "strong", allowedTouchRange: "本文全域",
    doNotTouchRange: "核", coreToKeep: "核A",
    userRevisionPolicy: "フル修正はしない。作者不明も目標にしない。軽い確認だけ"
  };
  const result = evaluateToshiReceive(input);
  assert.equal(result.decision, "RECEIVE_STOP");
  assert.ok(result.failures.some((entry) => entry.code === "STRONG_REVISION_NOT_ALLOWED"));
  assert.equal(resolveRevisionAuthorization(input).source, "EXPLICIT_DENIAL");
});

test("explicit strongAllowed remains strong-only unless full revision is requested", () => {
  const input = {
    ...receiveBase(), requestedPhase: "B", userDirectRevisionScope: true,
    revisionScope: "E001", revisionStrength: "strong", strongAllowed: true,
    allowedTouchRange: "E001", doNotTouchRange: "核", coreToKeep: "核A"
  };
  const result = evaluateToshiReceive(input);
  assert.equal(result.decision, "PHASE_B_READY");
  assert.equal(result.revisionProfile, "STRONG");
  assert.equal(result.fullRevision.authorized, false);
});

test("full revision policy is always ready but never auto executes", () => {
  assert.equal(FULL_REVISION_POLICY.alwaysReady, true);
  assert.equal(FULL_REVISION_POLICY.autoExecute, false);
  assert.equal(FULL_REVISION_POLICY.explicitUserActivationRequired, true);
  assert.equal(FULL_REVISION_POLICY.branchOnly, true);
  assert.equal(FULL_REVISION_POLICY.overwriteBase, false);
  assert.deepEqual(FULL_REVISION_STAGE_ORDER, ["編成校正", "強改稿", "冷却", "校正", "音読調整", "固定条件照合"]);
  assert.equal(ADAPTIVE_EDITOR_POLICY.defaultFullRevisionProfile, "ADAPTIVE_DIRECTOR");
  assert.equal(ADAPTIVE_EDITOR_POLICY.zeroStrengthIsValidDecision, true);
  assert.equal(ADAPTIVE_EDITOR_POLICY.strengthFourMeansDesignReturn, true);
  assert.equal(ADAPTIVE_EDITOR_POLICY.defaultBaselineName, "INPUT_SNAPSHOT");
});

test("Phase B refuses meaning/core/new-scene/out-of-scope repair", () => {
  const input = {
    ...receiveBase(), requestedPhase: "B", userDirectRevisionScope: true,
    revisionScope: "E001", revisionStrength: "strong", strongAllowed: true, allowedTouchRange: "E001",
    doNotTouchRange: "E002+", coreToKeep: "核A",
    meaningChangeRequired: true, storyCoreChangeRequired: true,
    newSceneRequired: true, outOfScopeTouchRequired: true
  };
  const result = evaluateToshiReceive(input);
  assert.equal(result.decision, "RECEIVE_STOP");
  assert.equal(result.failures.filter((entry) => entry.code === "PHASE_B_SCOPE_VIOLATION").length, 4);
});

test("Phase A output contract requires every original template section and terminal locks", () => {
  const receive = evaluateToshiReceive(receiveBase());
  assert.equal(evaluateToshiOutput({ receiveResult: receive, output: {} }).decision, "OUTPUT_STOP");
  const result = evaluateToshiOutput({ receiveResult: receive, output: phaseAOutput() });
  assert.equal(result.decision, "PHASE_A_SUCCESS");
  assert.equal(result.terminalDecision, "TERMINAL_LOCKS_PASS");
});

test("Phase B output and text-only internal log contract are enforced with terminal locks", () => {
  const input = {
    ...receiveBase(), requestedPhase: "B", userDirectRevisionScope: true,
    revisionScope: "E001", revisionStrength: "light", allowedTouchRange: "E001",
    doNotTouchRange: "none", coreToKeep: "核A"
  };
  const receive = evaluateToshiReceive(input);
  assert.equal(evaluateToshiOutput({ receiveResult: receive, output: { 修正版: "修正版", 終端ゲート: terminalGate() }, textOnlyRequested: true }).decision,
    "OUTPUT_STOP");
  assert.equal(evaluateToshiOutput({ receiveResult: receive, output: { 修正版: "修正版", internalLog: "internal", 終端ゲート: terminalGate() }, textOnlyRequested: true }).decision,
    "PHASE_B_SUCCESS");
  assert.equal(evaluateToshiOutput({ receiveResult: receive, output: { 修正版: "修正版", 修正後LOG_INTERNAL: "internal", 終端ゲート: terminalGate() }, textOnlyRequested: true }).internalLogRequired,
    true);
  assert.equal(evaluateToshiOutput({
    receiveResult: receive,
    output: { 対象範囲: "E001", 修正強度: "light", 修正方針: "surface", 修正版: "本文", 修正後LOG: "log", 終端ゲート: terminalGate() }
  }).decision, "PHASE_B_SUCCESS");
});

test("terminal heat lock rejects cooled or genericized output", () => {
  const gate = terminalGate();
  gate.熱量配送.userHeatPolicy.doesNotFlattenToGenericSafeOutput = false;
  const result = evaluateTerminalLocks({ 終端ゲート: gate });
  assert.equal(result.decision, "TERMINAL_LOCKS_STOP");
  assert.ok(result.failures.some((entry) => entry.code === "HEAT_DELIVERY_FLAG_MISSING"));
});

test("terminal convergence sweep rejects residue and dangling flags", () => {
  const gate = terminalGate();
  gate.完全収束.noHandoffResidue = false;
  gate.完全収束.residueItems = ["未分類WARN"];
  const result = evaluateTerminalLocks({ 終端ゲート: gate });
  assert.equal(result.decision, "TERMINAL_LOCKS_STOP");
  assert.ok(result.failures.some((entry) => entry.code === "FULL_CONVERGENCE_FLAG_MISSING"));
  assert.ok(result.failures.some((entry) => entry.code === "RESIDUE_ITEMS_NOT_EMPTY"));
});

test("STOP report must preserve heat and name repair boundary", () => {
  const gate = terminalGate();
  let result = evaluateTerminalLocks({ 終端ゲート: gate, STOP: { 理由: "未確認source" } }, { allowStopReport: true });
  assert.equal(result.decision, "TERMINAL_LOCKS_STOP");
  result = evaluateTerminalLocks({
    終端ゲート: gate,
    STOP: { 理由: "未確認source", 影響: "誤配", 必要修正: "source確認", 責任境界: "設計", 保持する熱量: "欲しい絵の核" }
  }, { allowStopReport: true });
  assert.equal(result.decision, "TERMINAL_LOCKS_PASS");
});

test("source read order remains only original files while boot read order includes terminal locks", () => {
  assert.deepEqual(READ_ORDER, SOURCE_MANIFEST.map((entry) => entry.path));
  assert.deepEqual(SOURCE_READ_ORDER, SOURCE_MANIFEST.map((entry) => entry.path));
  assert.deepEqual(ALL_LINE_LOCK_READ_ORDER, LOCK_MANIFEST.map((entry) => entry.path));
  assert.ok(BOOT_READ_ORDER.includes("START_HERE.js"));
  assert.ok(BOOT_READ_ORDER.includes("src/receive-gate.js"));
  assert.ok(BOOT_READ_ORDER.includes("src/verify-package.js"));
  for (const lockPath of ALL_LINE_LOCK_READ_ORDER) assert.ok(BOOT_READ_ORDER.includes(lockPath));
  for (const lockPath of TEXT_RECEIVE_LOCK_READ_ORDER) assert.ok(BOOT_READ_ORDER.includes(lockPath));
  for (const lockPath of PHASE_SELF_DIRECTED_LOCK_READ_ORDER) assert.ok(BOOT_READ_ORDER.includes(lockPath));
  for (const lockPath of HISTORY_MASTER_REAPPLY_LOCK_READ_ORDER) assert.ok(BOOT_READ_ORDER.includes(lockPath));
  for (const lockPath of FULL_REVISION_LOCK_READ_ORDER) assert.ok(BOOT_READ_ORDER.includes(lockPath));
  for (const lockPath of ADAPTIVE_EDITOR_LOCK_READ_ORDER) assert.ok(BOOT_READ_ORDER.includes(lockPath));
});

test("package expected files includes lock sources and package verifier without adding unknown files", () => {
  assert.ok(PACKAGE_EXPECTED_FILES.includes("source/ALL_LINE_END_USER_HEAT_DELIVERY_LOCK_v001.md"));
  assert.ok(PACKAGE_EXPECTED_FILES.includes("source/ALL_LINE_FULL_CONVERGENCE_SWEEP_LOCK_v001.md"));
  assert.ok(PACKAGE_EXPECTED_FILES.includes("source/NOVEL_LINE_FINAL_CORE_LOCK_v001.md"));
  assert.ok(PACKAGE_EXPECTED_FILES.includes("source/TS90_TEXT_RECEIVE_LIGHTWEIGHT_LOCK_v001.md"));
  assert.ok(PACKAGE_EXPECTED_FILES.includes("source/TS90_PHASE_A_TO_B_SELF_DIRECTED_LOCK_v001.md"));
  assert.ok(PACKAGE_EXPECTED_FILES.includes("source/TS90_HISTORY_MASTER_REAPPLY_LOCK_v001.md"));
  assert.ok(PACKAGE_EXPECTED_FILES.includes("source/TS90_FULL_REVISION_READY_LOCK_v001.md"));
  assert.ok(PACKAGE_EXPECTED_FILES.includes("source/TS90_ADAPTIVE_EDITOR_DIRECTOR_LOCK_v001.md"));
  assert.ok(PACKAGE_EXPECTED_FILES.includes("src/verify-package.js"));
  assert.ok(PACKAGE_EXPECTED_FILES.includes("test/runtime.test.js"));
  assert.deepEqual(HEAT_DELIVERY_REQUIRED_FLAGS, [
    "capturesUserRequestedVision",
    "preservesUserHeatThroughPack",
    "doesNotFlattenToGenericSafeOutput",
    "doesNotReplaceVisionWithProcessConvenience",
    "warnDoesNotCoolSpecPass",
    "stopKeepsVisionAndNamesRepairPoint",
    "deliversWithinVerifiedMaterials"
  ]);
  assert.deepEqual(FULL_CONVERGENCE_REQUIRED_FLAGS, [
    "noUnresolvedConditionResidue",
    "noUnmappedCoverageId",
    "noDanglingWarnWithoutClass",
    "noOpenStopWithoutTicket",
    "noHandoffResidue",
    "noHeatDeliveryResidue",
    "nextActionOrStopDeclared",
    "repeatUntilStableConfirmed"
  ]);
  assert.equal(HISTORY_MASTER_REAPPLY_LOCK_MANIFEST.length, 1);
  assert.equal(FULL_REVISION_LOCK_MANIFEST.length, 1);
  assert.equal(ADAPTIVE_EDITOR_LOCK_MANIFEST.length, 1);
  assert.deepEqual(REVISION_STRENGTHS, ["light", "medium", "strong"]);
});

test("forged writer SUCCESS without complete BASE output is rejected", () => {
  const input = receiveBase();
  input.writerResult.output = { text: "本文" };
  const result = evaluateToshiReceive(input);
  assert.equal(result.decision, "RECEIVE_STOP");
  assert.ok(result.failures.some((entry) => entry.code === "WRITER_BASE_OUTPUT_MISSING"));
});

test("whitespace-only receive and output fields are rejected", () => {
  const legacy = evaluateToshiReceive({
    inputMode: "LEGACY_EXISTING_TEXT", legacySourceDeclared: true, targetText: "  ",
    targetRange: "E001", storyCount: 1, requiredComparisonSourcePresent: true
  });
  assert.equal(legacy.decision, "RECEIVE_STOP");
  const receive = evaluateToshiReceive(receiveBase());
  const output = phaseAOutput();
  output.通し診断.対象範囲 = " ";
  assert.equal(evaluateToshiOutput({ receiveResult: receive, output }).decision, "OUTPUT_STOP");
});


test("required textual fields reject objects arrays booleans and numbers", () => {
  const input = receiveBase();
  input.writerResult.output.text = { body: "本文" };
  let result = evaluateToshiReceive(input);
  assert.equal(result.decision, "RECEIVE_STOP");
  assert.ok(result.failures.some((entry) => entry.code === "WRITER_BASE_OUTPUT_MISSING"));

  const legacy = evaluateToshiReceive({
    inputMode: "LEGACY_EXISTING_TEXT", legacySourceDeclared: true, targetText: ["本文"],
    targetRange: "E001", storyCount: 1, requiredComparisonSourcePresent: true
  });
  assert.equal(legacy.decision, "RECEIVE_STOP");

  const receive = evaluateToshiReceive(receiveBase());
  const output = phaseAOutput();
  output.Phase_A_修正指示.修正強度 = true;
  result = evaluateToshiOutput({ receiveResult: receive, output });
  assert.equal(result.decision, "OUTPUT_STOP");
  assert.ok(result.failures.some((entry) => entry.code === "PHASE_A_INSTRUCTION_FIELD_MISSING"));
});

test("Phase B rejects unknown revision strength, conflict, and ambiguous scope", () => {
  const input = {
    ...receiveBase(), requestedPhase: "B", userDirectRevisionScope: true,
    revisionScope: "E001", revisionStrength: "ultra", allowedTouchRange: "E001",
    doNotTouchRange: "E002+", coreToKeep: "核A",
    instructionConflictsWithText: true, revisionScopeAmbiguous: true
  };
  const result = evaluateToshiReceive(input);
  assert.equal(result.decision, "RECEIVE_STOP");
  assert.ok(result.failures.some((entry) => entry.code === "REVISION_STRENGTH_UNKNOWN"));
  assert.equal(result.failures.filter((entry) => entry.code === "PHASE_B_SCOPE_VIOLATION").length, 2);
});

test("story range inversion and story order residue are rejected", () => {
  const input = receiveBase();
  input.targetRange = "E010-E001";
  input.storyOrderList = ["E001", "E001", " ", "E004", "E005", "E006", "E007", "E008", "E009", "E010"];
  const result = evaluateToshiReceive(input);
  assert.equal(result.decision, "RECEIVE_STOP");
  assert.ok(result.failures.some((entry) => entry.code === "TARGET_RANGE_INVALID"));
  assert.ok(result.failures.some((entry) => entry.code === "STORY_ORDER_DUPLICATE"));
  assert.ok(result.failures.some((entry) => entry.code === "STORY_ORDER_ITEM_INVALID"));
});

test("quarantine text hidden inside SUCCESS is rejected", () => {
  const input = receiveBase();
  input.writerResult.output.quarantineText = "隔離本文";
  const result = evaluateToshiReceive(input);
  assert.equal(result.decision, "RECEIVE_STOP");
  assert.ok(result.failures.some((entry) => entry.code === "WRITER_QUARANTINE_TEXT_PRESENT"));
});

test("terminal gate must be visible and include preserved vision and next action", () => {
  const flat = {
    endUserHeatDeliveryLocked: true,
    userHeatPolicy: terminalGate().熱量配送.userHeatPolicy,
    ...terminalGate().完全収束
  };
  let result = evaluateTerminalLocks(flat);
  assert.equal(result.decision, "TERMINAL_LOCKS_STOP");
  assert.ok(result.failures.some((entry) => entry.code === "TERMINAL_GATE_MISSING"));

  const gate = terminalGate();
  delete gate.熱量配送.保持する熱量;
  delete gate.完全収束.nextAction;
  result = evaluateTerminalLocks({ 終端ゲート: gate });
  assert.equal(result.decision, "TERMINAL_LOCKS_STOP");
  assert.ok(result.failures.some((entry) => entry.code === "PRESERVED_USER_VISION_TEXT_MISSING"));
  assert.ok(result.failures.some((entry) => entry.code === "NEXT_ACTION_TEXT_MISSING"));
});

test("WARN items must remain classified when present", () => {
  const gate = terminalGate();
  gate.完全収束.warnItems = [{ item: "温度差" }, { class: "WARN", reason: "規格を壊さない注意" }];
  const result = evaluateTerminalLocks({ 終端ゲート: gate });
  assert.equal(result.decision, "TERMINAL_LOCKS_STOP");
  assert.ok(result.failures.some((entry) => entry.code === "WARN_ITEM_UNCLASSIFIED"));
});



const adaptiveDiagnosis = () => ({
  "設計": { strength: 1, reason: "核は正常" },
  "構成": { strength: 2, reason: "中盤の重複" },
  "シーン": { strength: 2, reason: "場面接続" },
  "視点": { strength: 3, reason: "他人内面の断定" },
  "人物": { strength: 2, reason: "係が説明装置" },
  "感情線": { strength: 1, reason: "緩和点確認" },
  "台詞": { strength: 2, reason: "全員が正確" },
  "ペース": { strength: 2, reason: "中盤の停滞" },
  "情報開示": { strength: 1, reason: "原因提示位置" },
  "描写": { strength: 2, reason: "抽象を具体へ" },
  "強改稿": { strength: 1, reason: "局所段落だけ再作成" },
  "文体": { strength: 3, reason: "対句と説明癖" },
  "冷却": { strength: 3, reason: "作者介入温度" },
  "整合性": { strength: 2, reason: "物と位置" },
  "校正": { strength: 1, reason: "表記" },
  "音読": { strength: 1, reason: "語尾" }
});

const sha256Text = (text) => createHash("sha256").update(text, "utf8").digest("hex").toUpperCase();
const charCount = (text) => Array.from(text).length;

const adaptiveReport = ({ baselineName = "S0", baselineText: baseText = "母艦本文", revisedText = "修正版本文", minimumBodyChars = 1, fixedConditions = "核・必須場面・倫理・着地点", receiveResult = null } = {}) => {
  const receive = receiveResult ?? evaluateToshiReceive({
    inputMode: "TEXT_INPUT", targetText: baseText, targetRange: "E001", storyCount: 1,
    baselineName, userRevisionPolicy: "修正刃さまパックで通して",
    revisionScope: "本文全域", allowedTouchRange: "本文全域", doNotTouchRange: "核・設定・新事件", coreToKeep: "核A",
    constraints: { minimumBodyChars, fixedConditions, bodyExtraction: { mode: "FULL_TEXT" } }
  });
  const diagnosis = adaptiveDiagnosis();
  const diagnosisOptions = { worldSettingMaterialsPresent: false };
  const plan = buildAdaptiveEditPlan(diagnosis, diagnosisOptions);
  const baselineBody = receive.baseline.bodyText;
  const revisedBody = extractBodyText(revisedText, receive.editContract.bodyExtraction, revisedText).text;
  const diffEvidence = canonicalDiffHunks(baselineBody, revisedBody);
  const report = {
    baselineName: receive.baseline.name,
    baselineId: receive.baseline.id,
    baselineBodySha256: receive.baseline.bodySha256,
    revisedBodySha256: sha256Text(revisedBody),
    editContractSha256: receive.editContract.sha256,
    branchName: `${receive.baseline.name}_ADAPTIVE_01`,
    baselineOverwritten: false,
    branchSeparated: true,
    workReportSeparated: true,
    fixedConditionsChecked: true,
    fixedConditionsSummary: "核・必須場面・倫理・着地点を保持",
    fixedConditionEvidence: receive.editContract.fixedConditionsSource === "BASELINE_DERIVED_WITH_EVIDENCE" ? [{ id: "F1", type: "本文核", quote: baselineBody, reason: "受領本文から固定条件を抽出" }] : [],
    authorUnknownGuaranteed: false,
    externalBetaReadClaimed: false,
    diffProvided: true,
    diffEvidence,
    diagnosis,
    diagnosisOptions,
    plan,
    activeStopSignals: [],
    resolvedStopSignals: [],
    stageExecution: plan.map((entry) => ({
      stage: entry.stage,
      status: entry.strength === 0 ? "NOT_USED" : "APPLIED"
    })),
    comparison: {
      changes: [
        { id: "C1", location: "本文差分", reason: "説明を動作へ交換", classification: "明確に改善", rolledBack: false, hunkIds: diffEvidence.map((hunk) => hunk.id) },
        { id: "C2", location: "終盤試行", reason: "効果が確認できない", classification: "効果不明", rolledBack: true, hunkIds: [] }
      ]
    },
    rollbackLog: [{ id: "C2", reason: "効果不明のため母艦へ復帰" }],
    remainingConcerns: [],
    baselinePromotionRecommendation: "非推奨",
    originalBodyChars: charCount(baselineBody),
    revisedBodyChars: charCount(revisedBody),
    minimumBodyChars
  };
  Object.defineProperty(report, "__context", {
    value: { expectedBaseline: receive.baseline, editContract: receive.editContract, revisedText, revisedBodyText: revisedBody },
    enumerable: false, configurable: true
  });
  Object.defineProperty(report, "__receive", { value: receive, enumerable: false, configurable: true });
  return report;
};

test("adaptive one-line request auto snapshots baseline and enters A-to-B", () => {
  const result = evaluateToshiReceive({
    inputMode: "TEXT_INPUT", targetText: "本文", targetRange: "E001", storyCount: 1,
    userRevisionPolicy: "修正刃さまパックで通して"
  });
  assert.equal(result.decision, "ADAPTIVE_A_TO_B_READY");
  assert.equal(result.phase, "A_TO_B");
  assert.equal(result.revisionProfile, "ADAPTIVE_DIRECTOR");
  assert.equal(result.baseline.name, "INPUT_SNAPSHOT");
  assert.equal(result.baseline.mode, "AUTO_SNAPSHOT");
  assert.equal(result.baseline.bodyChars, 2);
  assert.equal(result.adaptiveEditing.planRequired, true);
});

test("consultation and explanation text do not trigger editing", () => {
  for (const text of [
    "フル修正について相談したいだけ",
    "必要な工程だけって何？",
    "作者不明を目標にする意味を教えて",
    "フル修正という意味ではない",
    "まだ作業しない。方針だけ決めたい"
  ]) {
    const auth = resolveRevisionAuthorization({ userRevisionPolicy: text });
    assert.equal(auth.fullRevisionRequested, false, text);
  }
});

test("adaptive diagnosis is complete and strong rewrite is independently selected", () => {
  const diagnosis = adaptiveDiagnosis();
  assert.equal(evaluateAdaptiveDiagnosis(diagnosis).decision, "DIAGNOSIS_PASS");
  diagnosis["構成"] = { strength: 3, reason: "場面順だけ変更" };
  diagnosis["強改稿"] = { strength: 0, reason: "文章再作成は不要" };
  const plan = buildAdaptiveEditPlan(diagnosis, { worldSettingMaterialsPresent: false });
  assert.equal(plan.find((entry) => entry.stage === "構成編集").strength, 3);
  assert.equal(plan.find((entry) => entry.stage === "強改稿").strength, 0);
});

test("adaptive plan selects different blades and keeps zero as a valid decision", () => {
  const plan = buildAdaptiveEditPlan(adaptiveDiagnosis(), { worldSettingMaterialsPresent: false });
  assert.deepEqual(plan.map((entry) => entry.stage), ADAPTIVE_STAGE_ORDER);
  assert.equal(plan.find((entry) => entry.stage === "視点編集").strength, 3);
  assert.equal(plan.find((entry) => entry.stage === "強改稿").strength, 1);
  assert.equal(plan.find((entry) => entry.stage === "世界観・設定校正").strength, 0);
  assert.equal(plan.find((entry) => entry.stage === "固定条件照合").strength, 1);
  assert.equal(evaluateAdaptiveEditPlan({ plan }).decision, "PLAN_READY");
});

test("strength four is a design-return ticket, not permission to rewrite", () => {
  const diagnosis = adaptiveDiagnosis();
  diagnosis["設計"] = { strength: 4, reason: "核と着地が不接続" };
  const plan = buildAdaptiveEditPlan(diagnosis, { worldSettingMaterialsPresent: true });
  const result = evaluateAdaptiveEditPlan({ plan });
  assert.equal(result.decision, "PLAN_DESIGN_RETURN");
  assert.ok(result.failures.some((entry) => entry.code === "STAGE_REQUIRES_DESIGN_RETURN"));
});

test("adaptive plan rejects indiscriminate all-strong editing without justification", () => {
  const plan = ADAPTIVE_STAGE_ORDER.map((stage) => ({ stage, strength: stage === "固定条件照合" ? 1 : 3, reason: "全部強く" }));
  const result = evaluateAdaptiveEditPlan({ plan });
  assert.equal(result.decision, "PLAN_INVALID");
  assert.ok(result.failures.some((entry) => entry.code === "UNSELECTIVE_FULL_FORCE_PLAN"));
});

test("active stop signals halt, while resolved stop signals remain reportable", () => {
  const report = adaptiveReport();
  report.activeStopSignals = ["編集者の美文癖が前景化した"];
  assert.equal(evaluateAdaptiveEditorReport(report, report.__context).decision, "ADAPTIVE_REPORT_STOP");

  const resolved = adaptiveReport();
  resolved.resolvedStopSignals = [{ signal: "編集者の美文癖が前景化した", action: "対象段落を母艦へロールバック" }];
  assert.equal(evaluateAdaptiveEditorReport(resolved, resolved.__context).decision, "ADAPTIVE_REPORT_PASS");
});

test("effect-unknown and degraded changes must be rolled back", () => {
  let result = evaluateRevisionComparison({ changes: [{ id: "C1", location: "中盤", reason: "冗長", classification: "劣化", rolledBack: false }] });
  assert.equal(result.decision, "COMPARISON_STOP");
  result = evaluateRevisionComparison({ changes: [{ id: "C1", location: "中盤", reason: "冗長", classification: "劣化", rolledBack: true }] });
  assert.equal(result.decision, "COMPARISON_PASS");
});

test("preference differences never auto-promote the baseline", () => {
  const report = adaptiveReport();
  report.comparison.changes.push({ id: "C3", location: "終幕", reason: "読み味のみ変化", classification: "好みの差", rolledBack: false });
  report.baselinePromotionRecommendation = "推奨";
  const result = evaluateAdaptiveEditorReport(report, report.__context);
  assert.equal(result.decision, "ADAPTIVE_REPORT_STOP");
  assert.ok(result.failures.some((entry) => entry.code === "PROMOTION_WITH_UNRESOLVED_PREFERENCE"));
});

test("report baseline must match receive baseline and branch name must differ", () => {
  const receive = evaluateToshiReceive({
    inputMode: "TEXT_INPUT", targetText: "母艦本文", targetRange: "E001", storyCount: 1,
    baselineName: "S0", userRevisionPolicy: "修正刃さまパックで通して"
  });
  const report = adaptiveReport({ baselineName: "DIFFERENT_BASE", baselineText: "母艦本文" });
  let result = evaluateAdaptiveEditorReport(report, { expectedBaseline: receive.baseline, editContract: receive.editContract, revisedText: "修正版本文", revisedBodyText: "修正版本文" });
  assert.equal(result.decision, "ADAPTIVE_REPORT_STOP");
  assert.ok(result.failures.some((entry) => entry.code === "BASELINE_NAME_MISMATCH"));

  const sameBranch = adaptiveReport({ baselineName: "S0", baselineText: "母艦本文" });
  sameBranch.branchName = "S0";
  result = evaluateAdaptiveEditorReport(sameBranch, { expectedBaseline: receive.baseline, editContract: receive.editContract, revisedText: "修正版本文", revisedBodyText: "修正版本文" });
  assert.ok(result.failures.some((entry) => entry.code === "BRANCH_NAME_MUST_DIFFER_FROM_BASELINE"));
});

test("diagnosis and plan must match", () => {
  const report = adaptiveReport();
  report.plan = report.plan.map((entry) => entry.stage === "視点編集" ? { ...entry, strength: 1 } : entry);
  const result = evaluateAdaptiveEditorReport(report, report.__context);
  assert.equal(result.decision, "ADAPTIVE_REPORT_STOP");
  assert.ok(result.failures.some((entry) => entry.code === "PLAN_DIAGNOSIS_MISMATCH"));
});

test("applied edits require concrete diff changes", () => {
  const report = adaptiveReport();
  report.comparison.changes = [];
  report.rollbackLog = [];
  const result = evaluateAdaptiveEditorReport(report, report.__context);
  assert.equal(result.decision, "ADAPTIVE_REPORT_STOP");
  assert.ok(result.failures.some((entry) => entry.code === "APPLIED_EDIT_REQUIRES_DIFF_CHANGE"));
});

test("rollback log and comparison are cross-checked in both directions", () => {
  const report = adaptiveReport();
  report.rollbackLog = [];
  let result = evaluateAdaptiveEditorReport(report, report.__context);
  assert.ok(result.failures.some((entry) => entry.code === "ROLLED_BACK_CHANGE_MISSING_LOG"));

  const extra = adaptiveReport();
  extra.rollbackLog.push({ id: "UNKNOWN", reason: "架空" });
  result = evaluateAdaptiveEditorReport(extra, extra.__context);
  assert.ok(result.failures.some((entry) => entry.code === "ROLLBACK_LOG_CHANGE_NOT_FOUND"));
});

test("stage execution rejects fictional stages and invalid status-strength pairs", () => {
  const fictional = adaptiveReport();
  fictional.stageExecution.push({ stage: "架空工程", status: "APPLIED" });
  let result = evaluateAdaptiveEditorReport(fictional, fictional.__context);
  assert.ok(result.failures.some((entry) => entry.code === "STAGE_EXECUTION_LENGTH_MISMATCH" || entry.code === "STAGE_EXECUTION_PLAN_MISMATCH"));

  const wrongStatus = adaptiveReport();
  const zeroIndex = wrongStatus.plan.findIndex((entry) => entry.strength === 0);
  wrongStatus.stageExecution[zeroIndex].status = "DESIGN_RETURN";
  result = evaluateAdaptiveEditorReport(wrongStatus, wrongStatus.__context);
  assert.ok(result.failures.some((entry) => entry.code === "STAGE_STATUS_STRENGTH_MISMATCH"));
});

test("actual target and revised text character counts are enforced", () => {
  const receive = evaluateToshiReceive({
    inputMode: "TEXT_INPUT", targetText: "母艦本文", targetRange: "E001", storyCount: 1,
    baselineName: "S0", userRevisionPolicy: "修正刃さまパックで通して"
  });
  const report = adaptiveReport({ baselineName: "S0", baselineText: "母艦本文", revisedText: "修正版本文" });
  report.originalBodyChars = 1;
  report.revisedBodyChars = 999999;
  const result = evaluateAdaptiveEditorReport(report, { expectedBaseline: receive.baseline, editContract: receive.editContract, revisedText: "修正版本文", revisedBodyText: "修正版本文" });
  assert.ok(result.failures.some((entry) => entry.code === "ORIGINAL_BODY_CHAR_COUNT_MISMATCH"));
  assert.ok(result.failures.some((entry) => entry.code === "REVISED_BODY_CHAR_COUNT_MISMATCH"));
});

test("adaptive report protects baseline and requires traceable stage execution", () => {
  let report = adaptiveReport();
  assert.equal(evaluateAdaptiveEditorReport(report, report.__context).decision, "ADAPTIVE_REPORT_PASS");
  report = adaptiveReport();
  report.baselineOverwritten = true;
  const result = evaluateAdaptiveEditorReport(report, report.__context);
  assert.equal(result.decision, "ADAPTIVE_REPORT_STOP");
  assert.ok(result.failures.some((entry) => entry.code === "BASELINE_OVERWRITE_DENIED"));
});

test("adaptive A-to-B output requires a baseline-bound editor-director report", () => {
  const baselineText = "本文";
  const revisedText = "修正版";
  const receive = evaluateToshiReceive({
    inputMode: "TEXT_INPUT", targetText: baselineText, targetRange: "E001", storyCount: 1,
    userRevisionPolicy: "修正刃さまパックで通して"
  });
  const baseOutput = {
    対象範囲: "E001", 修正強度: "strong", 修正方針: "適応型", 修正版: revisedText, 修正後LOG: "log",
    終端ゲート: terminalGate()
  };
  let result = evaluateToshiOutput({ receiveResult: receive, output: baseOutput });
  assert.equal(result.decision, "OUTPUT_STOP");
  const report = adaptiveReport({ baselineName: receive.baseline.name, baselineText, revisedText, receiveResult: receive, minimumBodyChars: null, fixedConditions: null });
  result = evaluateToshiOutput({ receiveResult: receive, output: { ...baseOutput, 編集主任レポート: report } });
  assert.equal(result.decision, "PHASE_B_SUCCESS");
  assert.equal(result.adaptiveReportDecision, "ADAPTIVE_REPORT_PASS");
});


test("writer handoff baseline source is bound to inputMode and ignores stale top-level targetText", () => {
  const input = receiveBase();
  input.targetText = "古い本文";
  input.writerResult.output.text = "執筆さん本文";
  const result = evaluateToshiReceive(input);
  assert.equal(result.decision, "PHASE_A_READY");
  assert.equal(result.baseline.bodyText, "執筆さん本文");
  assert.equal(baselineText(input), "執筆さん本文");
});

test("short full-revision commands execute, while quoted and hypothetical requests do not", () => {
  for (const text of ["フル修正", "AI臭を可能な限り消し込んで"]) {
    assert.equal(resolveRevisionAuthorization({ userRevisionPolicy: text }).fullRevisionRequested, true, text);
  }
  for (const text of ["「修正刃さまパックで通して」と言ったらどうなる？", "フル修正をお願いした場合どうなる？"]) {
    const auth = resolveRevisionAuthorization({ userRevisionPolicy: text });
    assert.equal(auth.fullRevisionRequested, false, text);
    assert.equal(auth.source, "NON_EXECUTION_CONTEXT", text);
  }
});

test("canonical diff evidence binds final body content to the comparison report", () => {
  const report = adaptiveReport({ baselineText: "AAAA", revisedText: "全然別物" });
  report.diffEvidence = canonicalDiffHunks("AAAA", "別の報告用本文");
  const result = evaluateAdaptiveEditorReport(report, report.__context);
  assert.equal(result.decision, "ADAPTIVE_REPORT_STOP");
  assert.ok(result.failures.some((entry) => entry.code === "DIFF_EVIDENCE_MISMATCH"));
});

test("all rolled-back changes require the final body to equal the baseline", () => {
  const report = adaptiveReport({ baselineText: "母艦", revisedText: "別本文" });
  report.comparison.changes = [
    { id: "C1", location: "全文", reason: "劣化したため戻した", classification: "劣化", rolledBack: true, hunkIds: [] }
  ];
  report.rollbackLog = [{ id: "C1", reason: "母艦へ復帰" }];
  const result = evaluateAdaptiveEditorReport(report, report.__context);
  assert.equal(result.decision, "ADAPTIVE_REPORT_STOP");
  assert.ok(result.failures.some((entry) => entry.code === "ALL_ROLLBACK_REQUIRES_BASELINE_BODY"));
});

test("baseline promotion requires a retained clear improvement and a changed final body", () => {
  const report = adaptiveReport();
  report.baselinePromotionRecommendation = "推奨";
  report.comparison.changes[0].classification = "固定条件上必要";
  let result = evaluateAdaptiveEditorReport(report, report.__context);
  assert.ok(result.failures.some((entry) => entry.code === "PROMOTION_REQUIRES_RETAINED_CLEAR_IMPROVEMENT"));

  const same = adaptiveReport({ baselineText: "同じ本文", revisedText: "同じ本文" });
  same.comparison.changes = [{ id: "C1", location: "なし", reason: "変更なし", classification: "明確に改善", rolledBack: false, hunkIds: [] }];
  same.rollbackLog = [];
  same.baselinePromotionRecommendation = "推奨";
  result = evaluateAdaptiveEditorReport(same, same.__context);
  assert.ok(result.failures.some((entry) => entry.code === "PROMOTION_REQUIRES_CHANGED_BODY"));
});

test("minimum body length and extraction boundaries are fixed by the receive contract", () => {
  const source = "header\nTEXT:\n12345\nLOG:\nmetadata";
  const receive = evaluateToshiReceive({
    inputMode: "TEXT_INPUT", targetText: source, targetRange: "E001", storyCount: 1,
    baselineName: "S0", userRevisionPolicy: "修正刃さまパックで通して",
    constraints: {
      minimumBodyChars: 5,
      fixedConditions: "数字本文を保持",
      bodyExtraction: { mode: "MARKERS", startMarker: "TEXT:\n", endMarker: "\nLOG:" }
    }
  });
  assert.equal(receive.baseline.bodyText, "12345");
  assert.equal(receive.baseline.bodyChars, 5);
  const revised = "header\nTEXT:\n1234\nLOG:\nmetadata";
  const report = adaptiveReport({ baselineName: "S0", baselineText: source, revisedText: revised, receiveResult: receive, minimumBodyChars: 5, fixedConditions: "数字本文を保持" });
  const output = {
    対象範囲: "E001", 修正強度: "strong", 修正方針: "適応型", 修正版: revised, 修正後LOG: "log",
    編集主任レポート: report, 終端ゲート: terminalGate()
  };
  const result = evaluateToshiOutput({ receiveResult: receive, output });
  assert.equal(result.decision, "OUTPUT_STOP");
  assert.ok(result.failures.some((entry) => entry.code === "MINIMUM_BODY_CHARS_VIOLATED"));
});

test("edit contract hash and baseline-derived fixed-condition evidence are mandatory", () => {
  const report = adaptiveReport({ baselineText: "核がここにある", revisedText: "核がここに残る", fixedConditions: null, minimumBodyChars: null });
  report.editContractSha256 = "BAD";
  report.fixedConditionEvidence = [{ id: "F1", type: "核", quote: "存在しない引用", reason: "固定" }];
  const result = evaluateAdaptiveEditorReport(report, report.__context);
  assert.equal(result.decision, "ADAPTIVE_REPORT_STOP");
  assert.ok(result.failures.some((entry) => entry.code === "EDIT_CONTRACT_HASH_MISMATCH"));
  assert.ok(result.failures.some((entry) => entry.code === "FIXED_CONDITION_QUOTE_NOT_IN_BASELINE"));
});

test("adaptive constants preserve diagnosis, finalization, and rollback policy", () => {
  assert.equal(ADAPTIVE_DIAGNOSTIC_LAYERS.length, 15);
  assert.ok(ADAPTIVE_STAGE_ORDER.includes("視点編集"));
  assert.ok(ADAPTIVE_FINALIZATION_ORDER.includes("劣化箇所のロールバック"));
  assert.equal(BLADE_STRENGTH_SCALE[0], "使用しない");
  assert.equal(BLADE_STRENGTH_SCALE[4], "全面再設計候補");
  assert.deepEqual(ROLLBACK_REQUIRED_CLASSIFICATIONS, ["効果不明", "劣化"]);
  assert.ok(EDIT_CHANGE_CLASSIFICATIONS.includes("好みの差"));
  assert.deepEqual(BASELINE_PROMOTION_DECISIONS, ["推奨", "非推奨", "保留"]);
  assert.ok(ADAPTIVE_STOP_SIGNALS.includes("編集者の美文癖が前景化した"));
});

test("runtime package keeps history only through explicit master-reapply lock", () => {
  const forbidden = /CHANGELOG|REPAIR_LOG|MIGRATION_NOTES|OLD_DIFF|REFERENCE_LOGS|FILELIST/;
  for (const rel of BOOT_READ_ORDER) assert.equal(forbidden.test(rel), false, `${rel} is forbidden residue`);
  assert.ok(BOOT_READ_ORDER.includes("source/TS90_HISTORY_MASTER_REAPPLY_LOCK_v001.md"));
});
