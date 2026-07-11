import { createHash } from "node:crypto";
import {
  ADAPTIVE_DIAGNOSTIC_LAYERS,
  ADAPTIVE_EDITOR_POLICY,
  ADAPTIVE_STAGE_ORDER,
  ADAPTIVE_STOP_SIGNALS,
  BASELINE_PROMOTION_DECISIONS,
  BLADE_STRENGTH_SCALE,
  EDIT_CHANGE_CLASSIFICATIONS,
  FULL_CONVERGENCE_REQUIRED_FLAGS,
  FULL_REVISION_POLICY,
  FULL_REVISION_STAGE_ORDER,
  HEAT_DELIVERY_REQUIRED_FLAGS,
  REVISION_STRENGTHS,
  ROLLBACK_REQUIRED_CLASSIFICATIONS,
  TERMINAL_LOCKS
} from "./program.js";

const fail = (code, path) => ({ code, path });
const isObject = (value) => value != null && typeof value === "object" && !Array.isArray(value);
const hasText = (value) => typeof value === "string" && value.trim() !== "";
const textValue = (value) => typeof value === "string" ? value.trim() : "";

const ADAPTIVE_EDITOR_TRIGGER_TEXTS = Object.freeze([
  "修正刃さまパック",
  "修正刃様パック",
  "編集主任で",
  "適応型編集",
  "必要な刃を選んで",
  "必要な工程だけ",
  "診断して必要な",
  "フル修正",
  "思う存分",
  "目いっぱい",
  "目一杯",
  "徹底的に",
  "大胆に触って",
  "大胆に直して",
  "AI臭を可能な限り",
  "AI臭も可能な限り",
  "作者不明を目標",
  "目標は作者不明",
  "作者不明を狙",
  "作者不明の方向",
  "最大出力で修正"
]);

const FIXED_FULL_STACK_TRIGGER_TEXTS = Object.freeze([
  "E5固定フルスタック",
  "E5フルスタック",
  "固定フルスタック",
  "全工程を固定順",
  "全工程を全部強く",
  "固定順で全部強く"
]);

const FULL_REVISION_DENY_PATTERNS = Object.freeze([
  /フル(?:修正|スタック).{0,8}(?:しない|不要|禁止|避け|やめ)/i,
  /(?:強改稿|大胆な修正|全工程|編集主任).{0,8}(?:しない|不要|禁止|避け|やめ)/i,
  /作者不明.{0,8}(?:目標にしない|狙わない|不要)/i,
  /strong.{0,8}(?:false|禁止|不要)/i,
  /(?:まだ|今回は).{0,8}(?:作業しない|実行しない|直さない)/i,
  /(?:作業|実行|修正).{0,8}(?:は不要|不要です|しなくていい)/i,
  /方針だけ(?:決め|固め|相談)/i
]);

const NON_EXECUTION_CONTEXT_PATTERNS = Object.freeze([
  /相談したい(?:だけ)?|相談(?:です|したい|する)/i,
  /意味を教えて/i,
  /(?:とは|って)何(?:ですか|\?|？)?/i,
  /仮に|もしも|たとえば|例えば|検討(?:したい|する|中)/i,
  /まだ作業しない|まだ作業はしない|作業はまだ/i,
  /方針だけ|実行は不要|作業不要/i,
  /という意味ではない/i,
  /説明して|解説して|違いを教えて/i,
  /できる(?:の|か|？|\?)/i,
  /(?:と言ったら|と頼んだら|をお願いしたら|した場合|する場合).{0,20}(?:どうなる|何が起きる|どう動く)/i,
  /(?:どうなる|どう動く|何が起きる)(?:の|か|？|\?)/i,
  /[「『"].*(?:修正刃さまパック|修正刃様パック|フル修正|E5固定フルスタック).*[」』"]\s*(?:と言ったら|と頼んだら|の場合|なら)/i
]);

const EXACT_EXECUTION_COMMANDS = Object.freeze([
  "フル修正",
  "修正刃さまパックで通して",
  "修正刃様パックで通して",
  "AI臭を可能な限り消し込んで",
  "AI臭も可能な限り消し込んで",
  "作者不明を目標に",
  "目標は作者不明"
]);

const EXECUTION_INTENT_PATTERNS = Object.freeze([
  /(?:通して|走らせて|実行して|開始して|作業して|直して|修正して|改稿して|校正して|かけて|やって|お願い)/i,
  /(?:思う存分|目いっぱい|目一杯|徹底的に|最大出力で).{0,12}(?:やって|直して|修正|実行|お願い)/i,
  /A\s*(?:→|->|to)\s*B.{0,16}(?:お願い|実行|徹底|フル|修正)/i
]);

function isNonExecutionContext(policyText) {
  return hasText(policyText) && NON_EXECUTION_CONTEXT_PATTERNS.some((pattern) => pattern.test(policyText));
}

function normalizeCommandText(value) {
  return textValue(value).replace(/[。．.!！?？]+$/g, "").trim();
}

function isExactExecutionCommand(policyText) {
  return EXACT_EXECUTION_COMMANDS.includes(normalizeCommandText(policyText));
}

function hasExecutionIntent(policyText) {
  return hasText(policyText) && (isExactExecutionCommand(policyText) || EXECUTION_INTENT_PATTERNS.some((pattern) => pattern.test(policyText)));
}

function revisionPolicyText(input) {
  return [
    input.userRevisionPolicy,
    input.user_revision_policy,
    input.userInstruction,
    input.revisionRequest,
    input.instructionText,
    input.requestText
  ].filter(hasText).join("\n").replaceAll("　", " ").trim();
}

function normalizeBodyText(value) {
  return (typeof value === "string" ? value : "").replace(/\r\n?/g, "\n");
}

function textCharCount(value) {
  return Array.from(normalizeBodyText(value)).length;
}

function sha256Text(value) {
  return createHash("sha256").update(normalizeBodyText(value), "utf8").digest("hex").toUpperCase();
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (isObject(value)) return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  return value;
}

function stableStringify(value) {
  return JSON.stringify(stableValue(value));
}

function firstText(...values) {
  return values.find((value) => hasText(value)) ?? "";
}

export function baselineText(input = {}) {
  if (input.inputMode === "WRITER_SUCCESS_HANDOFF") {
    return firstText(input.writerResult?.output?.text, input.writerResult?.output?.本文, input.writerResult?.output?.body);
  }
  if (input.inputMode === "LEGACY_EXISTING_TEXT") {
    return firstText(input.legacyText, input.existingText, input.targetText);
  }
  if (input.inputMode === "TEXT_INPUT" || input.inputMode === "PW90_TEXT_HANDOFF") {
    return firstText(input.targetText);
  }
  return "";
}

function normalizeBodyExtraction(raw) {
  if (raw == null) return Object.freeze({ mode: "FULL_TEXT" });
  if (!isObject(raw)) return null;
  if (raw.mode === "FULL_TEXT") return Object.freeze({ mode: "FULL_TEXT" });
  if (raw.mode === "MARKERS" && hasText(raw.startMarker) && hasText(raw.endMarker)) {
    return Object.freeze({ mode: "MARKERS", startMarker: raw.startMarker, endMarker: raw.endMarker, includeStart: raw.includeStart === true, includeEnd: raw.includeEnd === true });
  }
  if (raw.mode === "EXPLICIT_BODY") return Object.freeze({ mode: "EXPLICIT_BODY" });
  return null;
}

export function extractBodyText(sourceText, extraction = { mode: "FULL_TEXT" }, explicitBody = null) {
  if (!extraction || !hasText(extraction.mode)) return Object.freeze({ ok: false, text: "", error: "BODY_EXTRACTION_CONTRACT_INVALID" });
  if (extraction.mode === "EXPLICIT_BODY") {
    if (!hasText(explicitBody)) return Object.freeze({ ok: false, text: "", error: "EXPLICIT_BODY_TEXT_MISSING" });
    return Object.freeze({ ok: true, text: normalizeBodyText(explicitBody), error: null });
  }
  const text = normalizeBodyText(sourceText);
  if (extraction.mode === "FULL_TEXT") return Object.freeze({ ok: true, text, error: null });
  if (extraction.mode === "MARKERS") {
    const startIndex = text.indexOf(extraction.startMarker);
    if (startIndex < 0) return Object.freeze({ ok: false, text: "", error: "BODY_START_MARKER_NOT_FOUND" });
    const contentStart = startIndex + (extraction.includeStart ? 0 : extraction.startMarker.length);
    const endIndex = text.indexOf(extraction.endMarker, startIndex + extraction.startMarker.length);
    if (endIndex < 0 || endIndex < contentStart) return Object.freeze({ ok: false, text: "", error: "BODY_END_MARKER_NOT_FOUND" });
    const contentEnd = extraction.includeEnd ? endIndex + extraction.endMarker.length : endIndex;
    return Object.freeze({ ok: true, text: text.slice(contentStart, contentEnd).replace(/^\s+|\s+$/g, ""), error: null });
  }
  return Object.freeze({ ok: false, text: "", error: "BODY_EXTRACTION_MODE_UNKNOWN" });
}

function normalizedFixedConditions(input = {}) {
  const constraints = isObject(input.constraints) ? input.constraints : {};
  const raw = constraints.fixedConditions ?? input.fixedConditions ?? input.frozenConditions ?? null;
  if (raw == null) return null;
  if (typeof raw === "string") return raw.trim();
  if (Array.isArray(raw) || isObject(raw)) return stableValue(raw);
  return null;
}

function buildEditContract(input = {}, bodyExtraction) {
  const constraints = isObject(input.constraints) ? input.constraints : {};
  const minimumBodyChars = constraints.minimumBodyChars ?? input.minimumBodyChars ?? null;
  const fixedConditions = normalizedFixedConditions(input);
  const contract = {
    targetRange: textValue(input.targetRange),
    revisionScope: textValue(input.revisionScope),
    allowedTouchRange: textValue(input.allowedTouchRange),
    doNotTouchRange: textValue(input.doNotTouchRange),
    coreToKeep: textValue(input.coreToKeep),
    fixedConditions,
    fixedConditionsSource: fixedConditions == null ? "BASELINE_DERIVED_WITH_EVIDENCE" : "EXPLICIT_INPUT",
    minimumBodyChars,
    bodyExtraction
  };
  return Object.freeze({ ...contract, sha256: sha256Text(stableStringify(contract)) });
}

function baselineInfo(input = {}, bodyExtraction = { mode: "FULL_TEXT" }) {
  const specified = [input.baselineName, input.baseDraftName, input.motherShipName].find(hasText);
  const name = specified ? specified.trim() : ADAPTIVE_EDITOR_POLICY.defaultBaselineName;
  const sourceText = baselineText(input);
  const explicitBody = input.bodyText ?? input.existingBodyText ?? input.writerResult?.output?.bodyText;
  const extracted = extractBodyText(sourceText, bodyExtraction, explicitBody);
  const bodyText = extracted.ok ? extracted.text : "";
  const bodySha256 = sha256Text(bodyText);
  return Object.freeze({
    name,
    id: `BASELINE-${bodySha256.slice(0, 16)}`,
    bodySha256,
    bodyChars: textCharCount(bodyText),
    bodyText,
    sourceSha256: sha256Text(sourceText),
    extractionOk: extracted.ok,
    extractionError: extracted.error,
    mode: specified ? "NAMED_BASELINE" : "AUTO_SNAPSHOT",
    overwriteAllowed: false
  });
}

export function canonicalDiffHunks(baselineTextValue, revisedTextValue) {
  const baselineLines = normalizeBodyText(baselineTextValue).split("\n");
  const revisedLines = normalizeBodyText(revisedTextValue).split("\n");
  if (baselineLines.length === 1 && baselineLines[0] === "" && revisedLines.length === 1 && revisedLines[0] === "") return Object.freeze([]);
  const n = baselineLines.length;
  const m = revisedLines.length;
  let operations = [];
  if (n * m <= 4_000_000) {
    const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
    for (let i = n - 1; i >= 0; i -= 1) {
      for (let j = m - 1; j >= 0; j -= 1) {
        dp[i][j] = baselineLines[i] === revisedLines[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    let i = 0; let j = 0;
    while (i < n || j < m) {
      if (i < n && j < m && baselineLines[i] === revisedLines[j]) { operations.push({ type: "equal", line: baselineLines[i] }); i += 1; j += 1; }
      else if (j < m && (i === n || dp[i][j + 1] >= dp[i + 1][j])) { operations.push({ type: "insert", line: revisedLines[j] }); j += 1; }
      else { operations.push({ type: "delete", line: baselineLines[i] }); i += 1; }
    }
  } else {
    let prefix = 0;
    while (prefix < n && prefix < m && baselineLines[prefix] === revisedLines[prefix]) prefix += 1;
    let suffix = 0;
    while (suffix < n - prefix && suffix < m - prefix && baselineLines[n - 1 - suffix] === revisedLines[m - 1 - suffix]) suffix += 1;
    operations = [
      ...baselineLines.slice(0, prefix).map((line) => ({ type: "equal", line })),
      ...baselineLines.slice(prefix, n - suffix).map((line) => ({ type: "delete", line })),
      ...revisedLines.slice(prefix, m - suffix).map((line) => ({ type: "insert", line })),
      ...baselineLines.slice(n - suffix).map((line) => ({ type: "equal", line }))
    ];
  }
  const hunks = [];
  let baselineLine = 1; let revisedLine = 1; let current = null;
  const flush = () => {
    if (!current) return;
    const beforeText = current.before.join("\n");
    const afterText = current.after.join("\n");
    const seed = stableStringify({ baselineStartLine: current.baselineStartLine, revisedStartLine: current.revisedStartLine, beforeText, afterText });
    hunks.push(Object.freeze({
      id: `H${hunks.length + 1}-${sha256Text(seed).slice(0, 12)}`,
      baselineStartLine: current.baselineStartLine,
      baselineLineCount: current.before.length,
      revisedStartLine: current.revisedStartLine,
      revisedLineCount: current.after.length,
      beforeText,
      afterText,
      beforeSha256: sha256Text(beforeText),
      afterSha256: sha256Text(afterText)
    }));
    current = null;
  };
  for (const op of operations) {
    if (op.type === "equal") { flush(); baselineLine += 1; revisedLine += 1; continue; }
    if (!current) current = { baselineStartLine: baselineLine, revisedStartLine: revisedLine, before: [], after: [] };
    if (op.type === "delete") { current.before.push(op.line); baselineLine += 1; }
    else { current.after.push(op.line); revisedLine += 1; }
  }
  flush();
  return Object.freeze(hunks);
}

export function resolveRevisionAuthorization(input = {}) {
  const policyText = revisionPolicyText(input);
  const explicitDenied = input.strongAllowed === false || input.fullRevisionRequested === false ||
    input.adaptiveEditorRequested === false || FULL_REVISION_DENY_PATTERNS.some((pattern) => pattern.test(policyText));
  if (explicitDenied) {
    return Object.freeze({
      strongAuthorized: false,
      fullRevisionRequested: false,
      revisionProfile: "NONE",
      source: "EXPLICIT_DENIAL",
      matchedTrigger: null
    });
  }

  if (input.fixedFullStackRequested === true) {
    return Object.freeze({
      strongAuthorized: true,
      fullRevisionRequested: true,
      revisionProfile: "FIXED_FULL_STACK",
      source: "FIXED_FULL_STACK_FLAG",
      matchedTrigger: "fixedFullStackRequested"
    });
  }
  if (input.adaptiveEditorRequested === true || input.fullRevisionRequested === true) {
    return Object.freeze({
      strongAuthorized: true,
      fullRevisionRequested: true,
      revisionProfile: "ADAPTIVE_DIRECTOR",
      source: input.adaptiveEditorRequested === true ? "ADAPTIVE_EDITOR_FLAG" : "FULL_REVISION_FLAG",
      matchedTrigger: input.adaptiveEditorRequested === true ? "adaptiveEditorRequested" : "fullRevisionRequested"
    });
  }

  const matchedFixed = FIXED_FULL_STACK_TRIGGER_TEXTS.find((trigger) => policyText.includes(trigger));
  const matchedAdaptive = ADAPTIVE_EDITOR_TRIGGER_TEXTS.find((trigger) => policyText.includes(trigger));
  const matchedAtoB = /A\s*(?:→|->|to)\s*B.{0,16}(?:お願い|実行|徹底|フル|修正)/i.test(policyText) ||
    /(?:お願い|実行|徹底|フル|修正).{0,16}A\s*(?:→|->|to)\s*B/i.test(policyText);
  const naturalTriggerFound = Boolean(matchedFixed || matchedAdaptive || matchedAtoB);

  if (naturalTriggerFound && (isNonExecutionContext(policyText) || !hasExecutionIntent(policyText))) {
    return Object.freeze({
      strongAuthorized: false,
      fullRevisionRequested: false,
      revisionProfile: "NONE",
      source: "NON_EXECUTION_CONTEXT",
      matchedTrigger: matchedFixed ?? matchedAdaptive ?? (matchedAtoB ? "A_TO_B_REFERENCE" : null)
    });
  }

  if (matchedFixed) {
    return Object.freeze({
      strongAuthorized: true,
      fullRevisionRequested: true,
      revisionProfile: "FIXED_FULL_STACK",
      source: "NATURAL_LANGUAGE_FIXED_FULL_STACK",
      matchedTrigger: matchedFixed
    });
  }
  if (matchedAdaptive || matchedAtoB) {
    return Object.freeze({
      strongAuthorized: true,
      fullRevisionRequested: true,
      revisionProfile: "ADAPTIVE_DIRECTOR",
      source: "NATURAL_LANGUAGE_ADAPTIVE_EDITOR",
      matchedTrigger: matchedAdaptive ?? "A_TO_B_FULL_REQUEST"
    });
  }

  if (input.strongAllowed === true) {
    return Object.freeze({
      strongAuthorized: true,
      fullRevisionRequested: false,
      revisionProfile: "STRONG",
      source: "STRONG_ALLOWED_FLAG",
      matchedTrigger: "strongAllowed"
    });
  }
  return Object.freeze({
    strongAuthorized: false,
    fullRevisionRequested: false,
    revisionProfile: "NONE",
    source: "NO_STRONG_PERMISSION",
    matchedTrigger: null
  });
}

const DIAGNOSIS_STAGE_MAP = Object.freeze({
  "設計": "設計照合",
  "構成": "構成編集",
  "シーン": "シーン編集",
  "情報開示": "情報開示編集",
  "視点": "視点編集",
  "人物": "キャラクター編集",
  "感情線": "感情線編集",
  "台詞": "台詞編集",
  "ペース": "ペーシング編集",
  "描写": "描写編集",
  "文体": "ラインエディット",
  "冷却": "冷却",
  "整合性": "連続性・整合性チェック",
  "校正": "コピーエディット",
  "音読": "音読校正"
});

function diagnosticValue(diagnosis, layer) {
  const raw = diagnosis?.[layer];
  if (Number.isInteger(raw)) return { strength: raw, reason: `${layer}診断` };
  if (isObject(raw) && Number.isInteger(raw.strength)) {
    return { strength: raw.strength, reason: hasText(raw.reason) ? raw.reason.trim() : `${layer}診断` };
  }
  return { strength: 0, reason: `${layer}診断で使用不要` };
}

export function buildAdaptiveEditPlan(diagnosis = {}, options = {}) {
  const stageMap = new Map(ADAPTIVE_STAGE_ORDER.map((stage) => [stage, { stage, strength: 0, reason: "診断で使用不要" }]));
  for (const layer of ADAPTIVE_DIAGNOSTIC_LAYERS) {
    const value = diagnosticValue(diagnosis, layer);
    const stage = DIAGNOSIS_STAGE_MAP[layer];
    stageMap.set(stage, { stage, strength: value.strength, reason: value.reason });
  }

  const rewriteValue = diagnosticValue(diagnosis, "強改稿");
  stageMap.set("強改稿", {
    stage: "強改稿",
    strength: rewriteValue.strength,
    reason: rewriteValue.reason
  });

  const worldStrength = options.worldSettingMaterialsPresent === true
    ? Math.max(diagnosticValue(diagnosis, "設計").strength, diagnosticValue(diagnosis, "整合性").strength)
    : 0;
  stageMap.set("世界観・設定校正", {
    stage: "世界観・設定校正",
    strength: worldStrength,
    reason: options.worldSettingMaterialsPresent === true ? "提示済み設定資料の範囲で照合" : "設定資料未提示のため推測しない"
  });
  stageMap.set("固定条件照合", { stage: "固定条件照合", strength: 1, reason: "全編集後に必須照合" });

  return Object.freeze(ADAPTIVE_STAGE_ORDER.map((stage) => Object.freeze(stageMap.get(stage))));
}

export function evaluateAdaptiveDiagnosis(diagnosis = {}) {
  const failures = [];
  const requiredLayers = [...ADAPTIVE_DIAGNOSTIC_LAYERS, "強改稿"];
  if (!isObject(diagnosis)) {
    return Object.freeze({ decision: "DIAGNOSIS_INVALID", failures: Object.freeze([fail("ADAPTIVE_DIAGNOSIS_REQUIRED", "diagnosis")]) });
  }
  for (const layer of requiredLayers) {
    const raw = diagnosis[layer];
    if (!isObject(raw)) {
      failures.push(fail("DIAGNOSIS_LAYER_REQUIRED", `diagnosis.${layer}`));
      continue;
    }
    if (!Number.isInteger(raw.strength) || !(raw.strength in BLADE_STRENGTH_SCALE)) {
      failures.push(fail("DIAGNOSIS_STRENGTH_INVALID", `diagnosis.${layer}.strength`));
    }
    if (!hasText(raw.reason)) failures.push(fail("DIAGNOSIS_REASON_REQUIRED", `diagnosis.${layer}.reason`));
  }
  return Object.freeze({
    decision: failures.length === 0 ? "DIAGNOSIS_PASS" : "DIAGNOSIS_INVALID",
    failures: Object.freeze(failures)
  });
}

export function evaluateAdaptiveEditPlan(input = {}) {
  const plan = Array.isArray(input) ? input : input.plan;
  const stopSignals = Array.isArray(input?.stopSignalsDetected) ? input.stopSignalsDetected : [];
  const failures = [];
  if (!Array.isArray(plan)) {
    failures.push(fail("ADAPTIVE_PLAN_ARRAY_REQUIRED", "plan"));
    return Object.freeze({ decision: "PLAN_INVALID", failures: Object.freeze(failures) });
  }

  const seen = new Set();
  for (const [index, entry] of plan.entries()) {
    if (!isObject(entry) || !hasText(entry.stage)) {
      failures.push(fail("ADAPTIVE_PLAN_STAGE_REQUIRED", `plan[${index}]`));
      continue;
    }
    if (!ADAPTIVE_STAGE_ORDER.includes(entry.stage)) failures.push(fail("ADAPTIVE_PLAN_STAGE_UNKNOWN", `plan[${index}].stage`));
    if (seen.has(entry.stage)) failures.push(fail("ADAPTIVE_PLAN_STAGE_DUPLICATE", `plan[${index}].stage`));
    seen.add(entry.stage);
    if (!Number.isInteger(entry.strength) || !(entry.strength in BLADE_STRENGTH_SCALE)) {
      failures.push(fail("ADAPTIVE_PLAN_STRENGTH_INVALID", `plan[${index}].strength`));
    }
    if (Number.isInteger(entry.strength) && entry.strength > 0 && !hasText(entry.reason)) {
      failures.push(fail("ADAPTIVE_PLAN_REASON_REQUIRED", `plan[${index}].reason`));
    }
  }
  if (JSON.stringify(plan.map((entry) => entry?.stage)) !== JSON.stringify(ADAPTIVE_STAGE_ORDER)) {
    failures.push(fail("ADAPTIVE_PLAN_ORDER_OR_COMPLETENESS_INVALID", "plan"));
  }
  const fixedStage = plan.find((entry) => entry?.stage === "固定条件照合");
  if (!fixedStage || fixedStage.strength < 1) failures.push(fail("FIXED_CONDITION_CHECK_REQUIRED", "plan.固定条件照合"));

  const allStrong = plan.filter((entry) => entry?.stage !== "固定条件照合").every((entry) => entry?.strength >= 3);
  if (allStrong && !hasText(input?.allStagesStrongJustification)) {
    failures.push(fail("UNSELECTIVE_FULL_FORCE_PLAN", "allStagesStrongJustification"));
  }

  const invalidStopSignals = stopSignals.filter((signal) => !hasText(signal));
  if (invalidStopSignals.length > 0) failures.push(fail("STOP_SIGNAL_TEXT_REQUIRED", "stopSignalsDetected"));

  if (failures.length > 0) return Object.freeze({ decision: "PLAN_INVALID", failures: Object.freeze(failures) });
  if (plan.some((entry) => entry.strength === 4)) {
    return Object.freeze({ decision: "PLAN_DESIGN_RETURN", failures: Object.freeze([fail("STAGE_REQUIRES_DESIGN_RETURN", "plan")]) });
  }
  if (stopSignals.length > 0) {
    return Object.freeze({
      decision: "PLAN_STOP_OR_ROLLBACK_REQUIRED",
      stopSignals: Object.freeze([...stopSignals]),
      knownSignals: Object.freeze(stopSignals.filter((signal) => ADAPTIVE_STOP_SIGNALS.includes(signal))),
      failures: Object.freeze([])
    });
  }
  return Object.freeze({ decision: "PLAN_READY", failures: Object.freeze([]) });
}

export function evaluateRevisionComparison(comparison = {}, options = {}) {
  const failures = [];
  const changes = comparison.changes;
  if (!Array.isArray(changes)) {
    failures.push(fail("COMPARISON_CHANGES_ARRAY_REQUIRED", "comparison.changes"));
    return Object.freeze({ decision: "COMPARISON_STOP", userChoiceRequired: false, failures: Object.freeze(failures) });
  }
  if (options.editsApplied === true && changes.length === 0) {
    failures.push(fail("APPLIED_EDIT_REQUIRES_DIFF_CHANGE", "comparison.changes"));
  }
  let userChoiceRequired = false;
  const ids = new Set();
  for (const [index, change] of changes.entries()) {
    if (!isObject(change) || !hasText(change.id)) {
      failures.push(fail("CHANGE_ID_REQUIRED", `comparison.changes[${index}].id`));
      continue;
    }
    if (ids.has(change.id)) failures.push(fail("CHANGE_ID_DUPLICATE", `comparison.changes[${index}].id`));
    ids.add(change.id);
    if (!hasText(change.location)) failures.push(fail("CHANGE_LOCATION_REQUIRED", `comparison.changes[${index}].location`));
    if (!hasText(change.reason)) failures.push(fail("CHANGE_REASON_REQUIRED", `comparison.changes[${index}].reason`));
    if (!EDIT_CHANGE_CLASSIFICATIONS.includes(change?.classification)) {
      failures.push(fail("CHANGE_CLASSIFICATION_INVALID", `comparison.changes[${index}].classification`));
      continue;
    }
    if (ROLLBACK_REQUIRED_CLASSIFICATIONS.includes(change.classification) && change.rolledBack !== true) {
      failures.push(fail("CHANGE_ROLLBACK_REQUIRED", `comparison.changes[${index}]`));
    }
    if (change.classification === "好みの差" && change.acceptedByUser !== true) userChoiceRequired = true;
  }
  return Object.freeze({
    decision: failures.length === 0 ? "COMPARISON_PASS" : "COMPARISON_STOP",
    userChoiceRequired,
    failures: Object.freeze(failures)
  });
}

const STAGE_EXECUTION_STATUSES = Object.freeze([
  "NOT_USED", "CHECKED_NO_EDIT", "APPLIED", "PARTIAL", "ROLLED_BACK", "DESIGN_RETURN"
]);

function statusAllowedForStrength(strength, status) {
  if (strength === 0) return ["NOT_USED", "CHECKED_NO_EDIT"].includes(status);
  if (strength >= 1 && strength <= 3) return ["CHECKED_NO_EDIT", "APPLIED", "PARTIAL", "ROLLED_BACK"].includes(status);
  if (strength === 4) return status === "DESIGN_RETURN";
  return false;
}

function normalizePlan(plan) {
  return Array.isArray(plan) ? plan.map(({ stage, strength, reason }) => ({ stage, strength, reason })) : plan;
}

export function evaluateAdaptiveEditorReport(report = {}, context = {}) {
  const failures = [];
  if (!isObject(report)) return Object.freeze({ decision: "ADAPTIVE_REPORT_STOP", failures: Object.freeze([fail("ADAPTIVE_REPORT_REQUIRED", "編集主任レポート")]) });
  if (!hasText(report.baselineName)) failures.push(fail("BASELINE_NAME_REQUIRED", "baselineName"));
  if (!hasText(report.baselineId)) failures.push(fail("BASELINE_ID_REQUIRED", "baselineId"));
  if (!hasText(report.baselineBodySha256)) failures.push(fail("BASELINE_HASH_REQUIRED", "baselineBodySha256"));
  if (!hasText(report.revisedBodySha256)) failures.push(fail("REVISED_BODY_HASH_REQUIRED", "revisedBodySha256"));
  if (!hasText(report.editContractSha256)) failures.push(fail("EDIT_CONTRACT_HASH_REQUIRED", "editContractSha256"));
  if (!hasText(report.branchName)) failures.push(fail("BRANCH_NAME_REQUIRED", "branchName"));
  if (hasText(report.baselineName) && hasText(report.branchName) && report.baselineName.trim() === report.branchName.trim()) {
    failures.push(fail("BRANCH_NAME_MUST_DIFFER_FROM_BASELINE", "branchName"));
  }
  if (report.baselineOverwritten !== false) failures.push(fail("BASELINE_OVERWRITE_DENIED", "baselineOverwritten"));
  if (report.branchSeparated !== true) failures.push(fail("BRANCH_SEPARATION_REQUIRED", "branchSeparated"));
  if (report.workReportSeparated !== true) failures.push(fail("WORK_REPORT_SEPARATION_REQUIRED", "workReportSeparated"));
  if (report.fixedConditionsChecked !== true) failures.push(fail("FIXED_CONDITIONS_NOT_CHECKED", "fixedConditionsChecked"));
  if (!hasText(report.fixedConditionsSummary)) failures.push(fail("FIXED_CONDITIONS_SUMMARY_REQUIRED", "fixedConditionsSummary"));
  if (report.authorUnknownGuaranteed === true) failures.push(fail("AUTHOR_UNKNOWN_GUARANTEE_DENIED", "authorUnknownGuaranteed"));
  if (report.externalBetaReadClaimed === true) failures.push(fail("FALSE_EXTERNAL_BETA_READ_CLAIM", "externalBetaReadClaimed"));
  if (!Array.isArray(report.rollbackLog)) failures.push(fail("ROLLBACK_LOG_ARRAY_REQUIRED", "rollbackLog"));
  if (!Array.isArray(report.remainingConcerns)) failures.push(fail("REMAINING_CONCERNS_ARRAY_REQUIRED", "remainingConcerns"));
  if (!Array.isArray(report.activeStopSignals)) failures.push(fail("ACTIVE_STOP_SIGNALS_ARRAY_REQUIRED", "activeStopSignals"));
  if (!Array.isArray(report.resolvedStopSignals)) failures.push(fail("RESOLVED_STOP_SIGNALS_ARRAY_REQUIRED", "resolvedStopSignals"));
  if (!BASELINE_PROMOTION_DECISIONS.includes(report.baselinePromotionRecommendation)) {
    failures.push(fail("BASELINE_PROMOTION_DECISION_INVALID", "baselinePromotionRecommendation"));
  }
  if (report.diffProvided !== true && !hasText(report.diffSummary)) failures.push(fail("BASELINE_DIFF_REQUIRED", "diffProvided|diffSummary"));

  if (isObject(context.expectedBaseline)) {
    if (report.baselineName !== context.expectedBaseline.name) failures.push(fail("BASELINE_NAME_MISMATCH", "baselineName"));
    if (report.baselineId !== context.expectedBaseline.id) failures.push(fail("BASELINE_ID_MISMATCH", "baselineId"));
    if (report.baselineBodySha256 !== context.expectedBaseline.bodySha256) failures.push(fail("BASELINE_HASH_MISMATCH", "baselineBodySha256"));
  }
  if (isObject(context.editContract) && report.editContractSha256 !== context.editContract.sha256) {
    failures.push(fail("EDIT_CONTRACT_HASH_MISMATCH", "editContractSha256"));
  }
  if (context.editContract?.fixedConditionsSource === "BASELINE_DERIVED_WITH_EVIDENCE") {
    if (!Array.isArray(report.fixedConditionEvidence) || report.fixedConditionEvidence.length === 0) {
      failures.push(fail("FIXED_CONDITION_EVIDENCE_REQUIRED", "fixedConditionEvidence"));
    } else {
      const ids = new Set();
      for (const [index, item] of report.fixedConditionEvidence.entries()) {
        if (!isObject(item) || !hasText(item.id) || !hasText(item.type) || !hasText(item.quote) || !hasText(item.reason)) {
          failures.push(fail("FIXED_CONDITION_EVIDENCE_INVALID", `fixedConditionEvidence[${index}]`));
          continue;
        }
        if (ids.has(item.id)) failures.push(fail("FIXED_CONDITION_EVIDENCE_ID_DUPLICATE", `fixedConditionEvidence[${index}].id`));
        ids.add(item.id);
        if (!normalizeBodyText(context.expectedBaseline?.bodyText).includes(normalizeBodyText(item.quote))) {
          failures.push(fail("FIXED_CONDITION_QUOTE_NOT_IN_BASELINE", `fixedConditionEvidence[${index}].quote`));
        }
      }
    }
  }

  const diagnosisResult = evaluateAdaptiveDiagnosis(report.diagnosis);
  failures.push(...diagnosisResult.failures);
  const expectedPlan = diagnosisResult.decision === "DIAGNOSIS_PASS"
    ? buildAdaptiveEditPlan(report.diagnosis, report.diagnosisOptions ?? {})
    : null;
  if (expectedPlan && JSON.stringify(normalizePlan(report.plan)) !== JSON.stringify(normalizePlan(expectedPlan))) {
    failures.push(fail("PLAN_DIAGNOSIS_MISMATCH", "plan"));
  }

  const activeStopSignals = Array.isArray(report.activeStopSignals) ? report.activeStopSignals : [];
  const planResult = evaluateAdaptiveEditPlan({
    plan: report.plan,
    stopSignalsDetected: activeStopSignals,
    allStagesStrongJustification: report.allStagesStrongJustification
  });
  if (planResult.decision !== "PLAN_READY") failures.push(...planResult.failures, fail("ADAPTIVE_PLAN_NOT_EXECUTABLE", "plan"));

  if (Array.isArray(report.resolvedStopSignals)) {
    for (const [index, item] of report.resolvedStopSignals.entries()) {
      if (!isObject(item) || !hasText(item.signal) || !hasText(item.action)) {
        failures.push(fail("RESOLVED_STOP_SIGNAL_INVALID", `resolvedStopSignals[${index}]`));
      }
    }
  }

  let editsApplied = false;
  if (!Array.isArray(report.stageExecution)) {
    failures.push(fail("STAGE_EXECUTION_ARRAY_REQUIRED", "stageExecution"));
  } else if (Array.isArray(report.plan)) {
    if (report.stageExecution.length !== report.plan.length) failures.push(fail("STAGE_EXECUTION_LENGTH_MISMATCH", "stageExecution"));
    for (let index = 0; index < report.stageExecution.length; index += 1) {
      const item = report.stageExecution[index];
      const planned = report.plan[index];
      if (!isObject(item) || !hasText(item.stage) || !STAGE_EXECUTION_STATUSES.includes(item.status)) {
        failures.push(fail("STAGE_EXECUTION_INVALID", `stageExecution[${index}]`));
        continue;
      }
      if (!planned || item.stage !== planned.stage || !ADAPTIVE_STAGE_ORDER.includes(item.stage)) {
        failures.push(fail("STAGE_EXECUTION_PLAN_MISMATCH", `stageExecution[${index}].stage`));
        continue;
      }
      if (!statusAllowedForStrength(planned.strength, item.status)) {
        failures.push(fail("STAGE_STATUS_STRENGTH_MISMATCH", `stageExecution[${index}].status`));
      }
      if (["APPLIED", "PARTIAL", "ROLLED_BACK"].includes(item.status)) editsApplied = true;
    }
  }

  const comparisonResult = evaluateRevisionComparison(report.comparison ?? {}, { editsApplied });
  failures.push(...comparisonResult.failures);
  if (report.baselinePromotionRecommendation === "推奨" && comparisonResult.userChoiceRequired) {
    failures.push(fail("PROMOTION_WITH_UNRESOLVED_PREFERENCE", "baselinePromotionRecommendation"));
  }

  const revisedBodyText = normalizeBodyText(context.revisedBodyText ?? context.revisedText ?? "");
  const actualRevisedSha256 = sha256Text(revisedBodyText);
  if (report.revisedBodySha256 !== actualRevisedSha256) failures.push(fail("REVISED_BODY_HASH_MISMATCH", "revisedBodySha256"));
  const actualDiffHunks = canonicalDiffHunks(context.expectedBaseline?.bodyText ?? "", revisedBodyText);
  const normalizedReportedDiff = Array.isArray(report.diffEvidence) ? report.diffEvidence.map((item) => stableValue(item)) : null;
  const normalizedActualDiff = actualDiffHunks.map((item) => stableValue(item));
  if (!Array.isArray(report.diffEvidence)) failures.push(fail("DIFF_EVIDENCE_ARRAY_REQUIRED", "diffEvidence"));
  else if (stableStringify(normalizedReportedDiff) !== stableStringify(normalizedActualDiff)) failures.push(fail("DIFF_EVIDENCE_MISMATCH", "diffEvidence"));

  const actualHunkIds = new Set(actualDiffHunks.map((hunk) => hunk.id));
  const coveredHunkIds = new Set();
  const retainedChanges = [];
  if (Array.isArray(report.comparison?.changes)) {
    for (const [index, change] of report.comparison.changes.entries()) {
      if (!isObject(change)) continue;
      const hunkIds = Array.isArray(change.hunkIds) ? change.hunkIds : [];
      if (change.rolledBack === true) {
        if (hunkIds.length > 0) failures.push(fail("ROLLED_BACK_CHANGE_CANNOT_CLAIM_FINAL_HUNK", `comparison.changes[${index}].hunkIds`));
      } else {
        retainedChanges.push(change);
        if (hunkIds.length === 0) failures.push(fail("RETAINED_CHANGE_HUNK_REQUIRED", `comparison.changes[${index}].hunkIds`));
        for (const hunkId of hunkIds) {
          if (!actualHunkIds.has(hunkId)) failures.push(fail("CHANGE_HUNK_NOT_IN_ACTUAL_DIFF", `comparison.changes[${index}].hunkIds`));
          else coveredHunkIds.add(hunkId);
        }
      }
    }
  }
  for (const hunkId of actualHunkIds) if (!coveredHunkIds.has(hunkId)) failures.push(fail("ACTUAL_DIFF_HUNK_UNCLASSIFIED", `diffEvidence.${hunkId}`));
  if (actualDiffHunks.length > 0 && !editsApplied) failures.push(fail("ACTUAL_DIFF_WITHOUT_APPLIED_STAGE", "stageExecution"));
  if (actualDiffHunks.length === 0 && retainedChanges.length > 0) failures.push(fail("RETAINED_CHANGE_WITHOUT_ACTUAL_DIFF", "comparison.changes"));

  const allChangesRolledBack = Array.isArray(report.comparison?.changes) && report.comparison.changes.length > 0 && report.comparison.changes.every((change) => change?.rolledBack === true);
  if (allChangesRolledBack && actualRevisedSha256 !== context.expectedBaseline?.bodySha256) {
    failures.push(fail("ALL_ROLLBACK_REQUIRES_BASELINE_BODY", "revisedBodySha256"));
  }
  if (report.baselinePromotionRecommendation === "推奨") {
    const retainedImprovement = retainedChanges.some((change) => change.classification === "明確に改善");
    if (!retainedImprovement) failures.push(fail("PROMOTION_REQUIRES_RETAINED_CLEAR_IMPROVEMENT", "baselinePromotionRecommendation"));
    if (actualRevisedSha256 === context.expectedBaseline?.bodySha256) failures.push(fail("PROMOTION_REQUIRES_CHANGED_BODY", "baselinePromotionRecommendation"));
  }

  if (Array.isArray(report.rollbackLog) && Array.isArray(report.comparison?.changes)) {
    const changeMap = new Map(report.comparison.changes.filter(isObject).map((change) => [change.id, change]));
    const rollbackMap = new Map();
    for (const [index, entry] of report.rollbackLog.entries()) {
      if (!isObject(entry) || !hasText(entry.id) || !hasText(entry.reason)) {
        failures.push(fail("ROLLBACK_LOG_ENTRY_INVALID", `rollbackLog[${index}]`));
        continue;
      }
      if (rollbackMap.has(entry.id)) failures.push(fail("ROLLBACK_LOG_ID_DUPLICATE", `rollbackLog[${index}].id`));
      rollbackMap.set(entry.id, entry);
      const change = changeMap.get(entry.id);
      if (!change) failures.push(fail("ROLLBACK_LOG_CHANGE_NOT_FOUND", `rollbackLog[${index}].id`));
      else if (change.rolledBack !== true) failures.push(fail("ROLLBACK_LOG_FOR_NON_ROLLED_BACK_CHANGE", `rollbackLog[${index}].id`));
    }
    for (const [index, change] of report.comparison.changes.entries()) {
      if (change?.rolledBack === true && !rollbackMap.has(change.id)) {
        failures.push(fail("ROLLED_BACK_CHANGE_MISSING_LOG", `comparison.changes[${index}].id`));
      }
    }
  }

  const expectedOriginalChars = Number.isInteger(context.expectedBaseline?.bodyChars) ? context.expectedBaseline.bodyChars : null;
  const expectedRevisedChars = textCharCount(revisedBodyText);
  if (!Number.isInteger(report.originalBodyChars) || !Number.isInteger(report.revisedBodyChars) || report.originalBodyChars < 0 || report.revisedBodyChars < 0) {
    failures.push(fail("BODY_CHAR_COUNTS_INVALID", "originalBodyChars|revisedBodyChars"));
  } else {
    if (expectedOriginalChars != null && report.originalBodyChars !== expectedOriginalChars) failures.push(fail("ORIGINAL_BODY_CHAR_COUNT_MISMATCH", "originalBodyChars"));
    if (report.revisedBodyChars !== expectedRevisedChars) failures.push(fail("REVISED_BODY_CHAR_COUNT_MISMATCH", "revisedBodyChars"));
  }
  const contractMinimum = context.editContract?.minimumBodyChars ?? null;
  if (report.minimumBodyChars !== contractMinimum) failures.push(fail("MINIMUM_BODY_CHARS_CONTRACT_MISMATCH", "minimumBodyChars"));
  if (Number.isInteger(contractMinimum) && expectedRevisedChars < contractMinimum) failures.push(fail("MINIMUM_BODY_CHARS_VIOLATED", "revisedBodyChars"));

  return Object.freeze({
    decision: failures.length === 0 ? "ADAPTIVE_REPORT_PASS" : "ADAPTIVE_REPORT_STOP",
    userChoiceRequired: comparisonResult.userChoiceRequired,
    editsApplied,
    failures: Object.freeze(failures)
  });
}

export const WRITER_BASE_OUTPUT = Object.freeze([
  "filename_line", "target_length_or_self_bound", "frozen_condition_table_short", "text", "本文後LOG"
]);

export const TEXT_RECEIVE_INPUT_MODES = Object.freeze([
  "TEXT_INPUT",
  "PW90_TEXT_HANDOFF",
  "LEGACY_EXISTING_TEXT"
]);

export const REJECTED_WRITER_STATES = Object.freeze([
  "STOP_BEFORE_TEXT",
  "DEGRADED_REPORT_ONLY",
  "FAILED_TEXT_QUARANTINE",
  "OUTPUT_GATE_FAILED"
]);

const WRITER_NEGATIVE_FLAGS = Object.freeze([
  ["output_gate_passed", false],
  ["canonical_text", false],
  ["quarantine", true],
  ["degraded", true],
  ["unsaved", true],
  ["failed_text_quarantine", true],
  ["diagnostic_only", true],
  ["body_source_denied", true]
]);

const QUARANTINE_TEXT_FIELDS = Object.freeze([
  "quarantineText",
  "quarantinedText",
  "failedTextQuarantine",
  "diagnosticOnlyText"
]);

const PHASE_A_DIAGNOSIS_FIELDS = Object.freeze([
  "対象範囲", "読了範囲", "最低体裁", "累積破綻", "矛盾", "重複", "温度差",
  "校正で済む箇所", "改稿が必要な箇所", "設計へ戻すべき箇所", "修正可能箇所", "未確認 / 保留"
]);

const PHASE_A_INSTRUCTION_FIELDS = Object.freeze([
  "修正強度", "優先順位", "対象話別指示", "触ってよいもの", "触ってはいけないもの",
  "残す核", "設計戻し", "未解決", "Phase Bへ進む条件"
]);

const STOP_REPORT_FIELDS = Object.freeze(TERMINAL_LOCKS.stopFormatRequires);

function parseStoryRange(targetRange) {
  if (!hasText(targetRange)) return { count: null, invalid: false };
  const normalized = String(targetRange).trim();
  const match = normalized.match(/^(?:[A-Za-z_\-]*?)(\d+)\s*-\s*(?:[A-Za-z_\-]*?)(\d+)$/);
  if (!match) return { count: null, invalid: false };
  const start = Number.parseInt(match[1], 10);
  const end = Number.parseInt(match[2], 10);
  if (!Number.isInteger(start) || !Number.isInteger(end) || end < start) return { count: null, invalid: true };
  return { count: end - start + 1, invalid: false };
}

function addScopeConsistencyFailures(input, failures) {
  if (Array.isArray(input.storyOrderList)) {
    if (input.storyOrderList.length !== input.storyCount) failures.push(fail("STORY_ORDER_COUNT_MISMATCH", "storyOrderList"));
    const normalized = input.storyOrderList.map((item) => typeof item === "string" ? item.trim() : item);
    if (normalized.some((item) => !hasText(item))) failures.push(fail("STORY_ORDER_ITEM_INVALID", "storyOrderList"));
    if (new Set(normalized).size !== normalized.length) failures.push(fail("STORY_ORDER_DUPLICATE", "storyOrderList"));
  }
  const range = parseStoryRange(input.targetRange);
  if (range.invalid) failures.push(fail("TARGET_RANGE_INVALID", "targetRange"));
  if (range.count != null && Number.isInteger(input.storyCount) && input.storyCount !== range.count) {
    failures.push(fail("TARGET_RANGE_STORY_COUNT_MISMATCH", "targetRange/storyCount"));
  }
}

function findFirstObject(output, names) {
  for (const name of names) {
    if (isObject(output?.[name])) return output[name];
  }
  return null;
}

function getTerminalGate(output = {}) {
  return findFirstObject(output, ["終端ゲート", "terminalGate", "terminal_lock", "terminalLocks"]);
}

function getHeatGate(root) {
  const heat = findFirstObject(root, ["熱量配送", "userHeat", "heatDelivery", "endUserHeatDelivery"]);
  if (heat?.userHeatPolicy != null) return heat;
  if (isObject(root?.userHeatPolicy)) return root;
  return heat;
}

function getSweepGate(root) {
  return findFirstObject(root, ["完全収束", "fullConvergenceSweep", "convergenceSweep", "residueSweep"]);
}

function addMissingTrueFlags(container, flags, code, prefix, failures) {
  for (const field of flags) {
    if (container?.[field] !== true) failures.push(fail(code, `${prefix}.${field}`));
  }
}

function addClassifiedWarnFailures(sweep, failures) {
  const warnItems = sweep?.warnItems ?? sweep?.classifiedWarnItems;
  if (warnItems == null) return;
  if (!Array.isArray(warnItems)) {
    failures.push(fail("WARN_ITEMS_ARRAY_REQUIRED", "終端ゲート.完全収束.warnItems"));
    return;
  }
  for (const [index, item] of warnItems.entries()) {
    if (!isObject(item) || !hasText(item.class) || !hasText(item.reason)) {
      failures.push(fail("WARN_ITEM_UNCLASSIFIED", `終端ゲート.完全収束.warnItems[${index}]`));
    }
  }
}

function firstPresentText(...values) {
  return values.find((value) => hasText(value));
}

export function evaluateTerminalLocks(output = {}, { allowStopReport = false } = {}) {
  const failures = [];
  const root = getTerminalGate(output);
  if (!isObject(root)) failures.push(fail("TERMINAL_GATE_MISSING", "終端ゲート"));

  const heat = getHeatGate(root ?? {});
  const heatPolicy = heat?.userHeatPolicy ?? heat;
  const sweep = getSweepGate(root ?? {});

  if (!isObject(heat)) failures.push(fail("HEAT_DELIVERY_GATE_MISSING", "終端ゲート.熱量配送"));
  if (heat?.endUserHeatDeliveryLocked !== true) {
    failures.push(fail("HEAT_DELIVERY_LOCK_MISSING", "終端ゲート.熱量配送.endUserHeatDeliveryLocked"));
  }
  addMissingTrueFlags(heatPolicy, HEAT_DELIVERY_REQUIRED_FLAGS, "HEAT_DELIVERY_FLAG_MISSING", "終端ゲート.熱量配送.userHeatPolicy", failures);
  if (TERMINAL_LOCKS.requirePreservedUserVisionText && !firstPresentText(heat?.保持する熱量, heat?.preservedUserVision, heat?.userRequestedVision)) {
    failures.push(fail("PRESERVED_USER_VISION_TEXT_MISSING", "終端ゲート.熱量配送.保持する熱量"));
  }

  if (!isObject(sweep)) failures.push(fail("FULL_CONVERGENCE_GATE_MISSING", "終端ゲート.完全収束"));
  addMissingTrueFlags(sweep, FULL_CONVERGENCE_REQUIRED_FLAGS, "FULL_CONVERGENCE_FLAG_MISSING", "終端ゲート.完全収束", failures);
  if (!Array.isArray(sweep?.residueItems)) failures.push(fail("RESIDUE_ITEMS_ARRAY_REQUIRED", "終端ゲート.完全収束.residueItems"));
  else if (sweep.residueItems.length !== 0) failures.push(fail("RESIDUE_ITEMS_NOT_EMPTY", "終端ゲート.完全収束.residueItems"));
  if (TERMINAL_LOCKS.requireNextActionText && !firstText(sweep?.nextAction, sweep?.次工程, sweep?.nextActionOrStop)) {
    failures.push(fail("NEXT_ACTION_TEXT_MISSING", "終端ゲート.完全収束.nextAction"));
  }
  addClassifiedWarnFailures(sweep, failures);

  if (allowStopReport || output?.STOP != null || output?.stopReport != null || output?.停止票 != null) {
    const stop = output?.STOP ?? output?.stopReport ?? output?.停止票;
    if (!isObject(stop)) failures.push(fail("STOP_REPORT_MISSING", "STOP"));
    for (const field of STOP_REPORT_FIELDS) {
      if (!hasText(stop?.[field])) failures.push(fail("STOP_REPORT_FIELD_MISSING", `STOP.${field}`));
    }
  }

  return Object.freeze({
    decision: failures.length === 0 ? "TERMINAL_LOCKS_PASS" : "TERMINAL_LOCKS_STOP",
    failures: Object.freeze(failures)
  });
}

function addWriterFailures(writer, failures) {
  if (!isObject(writer)) {
    failures.push(fail("WRITER_RESULT_MISSING", "writerResult"));
    return;
  }
  if (REJECTED_WRITER_STATES.includes(writer.decision)) failures.push(fail("WRITER_STATE_REJECTED", "writerResult.decision"));
  if (writer.decision !== "SUCCESS" || writer.success !== true) failures.push(fail("WRITER_SUCCESS_REQUIRED", "writerResult"));
  if (!isObject(writer.output)) failures.push(fail("WRITER_OUTPUT_MISSING", "writerResult.output"));
  for (const field of WRITER_BASE_OUTPUT) {
    if (!hasText(writer.output?.[field])) failures.push(fail("WRITER_BASE_OUTPUT_MISSING", `writerResult.output.${field}`));
  }
  for (const [field, rejectedValue] of WRITER_NEGATIVE_FLAGS) {
    if (writer[field] === rejectedValue || writer.output?.[field] === rejectedValue) {
      failures.push(fail("WRITER_NEGATIVE_FLAG_REJECTED", `writerResult.${field}`));
    }
  }
  for (const field of QUARANTINE_TEXT_FIELDS) {
    if (hasText(writer[field]) || hasText(writer.output?.[field])) {
      failures.push(fail("WRITER_QUARANTINE_TEXT_PRESENT", `writerResult.${field}`));
    }
  }
}

export function evaluateToshiReceive(input = {}) {
  const failures = [];
  const revisionAuthorization = resolveRevisionAuthorization(input);
  const constraints = isObject(input.constraints) ? input.constraints : {};
  const bodyExtraction = normalizeBodyExtraction(constraints.bodyExtraction ?? input.bodyExtraction);
  if (!bodyExtraction) failures.push(fail("BODY_EXTRACTION_CONTRACT_INVALID", "constraints.bodyExtraction"));
  const minimumBodyChars = constraints.minimumBodyChars ?? input.minimumBodyChars ?? null;
  if (minimumBodyChars != null && (!Number.isInteger(minimumBodyChars) || minimumBodyChars < 0)) {
    failures.push(fail("MINIMUM_BODY_CHARS_CONSTRAINT_INVALID", "constraints.minimumBodyChars"));
  }
  const baseline = baselineInfo(input, bodyExtraction ?? { mode: "FULL_TEXT" });
  if (!baseline.extractionOk) failures.push(fail(baseline.extractionError, "baseline.bodyExtraction"));
  const editContract = buildEditContract(input, bodyExtraction ?? { mode: "FULL_TEXT" });

  if (input.inputMode === "WRITER_SUCCESS_HANDOFF") {
    addWriterFailures(input.writerResult, failures);
  } else if (TEXT_RECEIVE_INPUT_MODES.includes(input.inputMode)) {
    if (input.inputMode === "LEGACY_EXISTING_TEXT" && input.legacySourceDeclared !== true) {
      failures.push(fail("LEGACY_SOURCE_NOT_DECLARED", "legacySourceDeclared"));
    }
    if (!hasText(input.targetText)) failures.push(fail("TARGET_TEXT_MISSING", "targetText"));
  } else {
    failures.push(fail("INPUT_MODE_UNKNOWN", "inputMode"));
  }
  if (!hasText(input.targetRange) || !Number.isInteger(input.storyCount) || input.storyCount < 1) {
    failures.push(fail("TARGET_SCOPE_UNKNOWN", "targetRange/storyCount"));
  }
  if (input.storyCount > 50) failures.push(fail("TARGET_SCOPE_OVER_50", "storyCount"));
  addScopeConsistencyFailures(input, failures);
  if (failures.length > 0) {
    return Object.freeze({ decision: "RECEIVE_STOP", phase: null, failures: Object.freeze(failures) });
  }

  const defaultPhase = revisionAuthorization.fullRevisionRequested ? "A_TO_B" : "A";
  const requestedPhase = input.requestedPhase ?? defaultPhase;
  const stageOrder = revisionAuthorization.revisionProfile === "FIXED_FULL_STACK"
    ? FULL_REVISION_STAGE_ORDER
    : revisionAuthorization.revisionProfile === "ADAPTIVE_DIRECTOR"
      ? ADAPTIVE_STAGE_ORDER
      : Object.freeze([]);

  const commonRevisionInfo = Object.freeze({
    effectiveRevisionStrength: revisionAuthorization.fullRevisionRequested ? "strong" : textValue(input.revisionStrength),
    revisionProfile: revisionAuthorization.revisionProfile === "NONE"
      ? (hasText(input.revisionStrength) ? textValue(input.revisionStrength).toUpperCase() : "STANDARD")
      : revisionAuthorization.revisionProfile,
    baseline,
    editContract,
    fullRevision: Object.freeze({
      authorized: revisionAuthorization.fullRevisionRequested,
      authorizationSource: revisionAuthorization.source,
      matchedTrigger: revisionAuthorization.matchedTrigger,
      stageOrder,
      branchOnly: FULL_REVISION_POLICY.branchOnly,
      overwriteBase: FULL_REVISION_POLICY.overwriteBase,
      authorUnknownIsDirectionNotGuarantee: FULL_REVISION_POLICY.authorUnknownIsDirectionNotGuarantee
    }),
    adaptiveEditing: Object.freeze({
      enabled: revisionAuthorization.revisionProfile === "ADAPTIVE_DIRECTOR",
      diagnoseBeforeEditing: ADAPTIVE_EDITOR_POLICY.diagnoseBeforeEditing,
      planRequired: revisionAuthorization.revisionProfile === "ADAPTIVE_DIRECTOR",
      diagnosticLayers: ADAPTIVE_DIAGNOSTIC_LAYERS,
      stageOrder: ADAPTIVE_STAGE_ORDER,
      autoSnapshotWhenBaselineMissing: ADAPTIVE_EDITOR_POLICY.autoSnapshotWhenBaselineMissing,
      zeroStrengthIsValidDecision: ADAPTIVE_EDITOR_POLICY.zeroStrengthIsValidDecision,
      strengthFourMeansDesignReturn: ADAPTIVE_EDITOR_POLICY.strengthFourMeansDesignReturn,
      rollbackUnknownOrDegraded: ADAPTIVE_EDITOR_POLICY.effectUnknownOrDegradedMustRollback
    })
  });

  if (requestedPhase === "A") {
    return Object.freeze({ decision: "PHASE_A_READY", phase: "A", ...commonRevisionInfo, failures: Object.freeze([]) });
  }

  const denied = [
    "instructionConflictsWithText", "revisionScopeAmbiguous",
    "meaningChangeRequired", "storyCoreChangeRequired", "newSettingRequired",
    "newSceneRequired", "outOfScopeTouchRequired", "strengthExceedsInstruction"
  ];
  for (const field of denied) if (input[field] === true) failures.push(fail("PHASE_B_SCOPE_VIOLATION", field));

  if (requestedPhase === "A_TO_B") {
    if (!revisionAuthorization.fullRevisionRequested) failures.push(fail("A_TO_B_FULL_REVISION_REQUEST_REQUIRED", "requestedPhase"));
    return Object.freeze({
      decision: failures.length === 0
        ? (revisionAuthorization.revisionProfile === "FIXED_FULL_STACK" ? "FULL_STACK_A_TO_B_READY" : "ADAPTIVE_A_TO_B_READY")
        : "RECEIVE_STOP",
      phase: failures.length === 0 ? "A_TO_B" : null,
      ...commonRevisionInfo,
      failures: Object.freeze(failures)
    });
  }

  if (requestedPhase !== "B") {
    return Object.freeze({ decision: "RECEIVE_STOP", phase: null,
      failures: Object.freeze([fail("PHASE_UNKNOWN", "requestedPhase")]) });
  }

  const hasInstruction = input.phaseAInstruction != null || input.phaseAInstructionFromThisRuntime === true ||
    input.userDirectRevisionScope === true || revisionAuthorization.fullRevisionRequested;
  if (!hasInstruction) failures.push(fail("PHASE_B_INSTRUCTION_MISSING", "phaseBInstruction"));
  if (input.externalToshiInstruction != null && input.phaseAInstruction == null &&
      input.phaseAInstructionFromThisRuntime !== true && input.userDirectRevisionScope !== true &&
      !revisionAuthorization.fullRevisionRequested) {
    failures.push(fail("EXTERNAL_TOSHI_INSTRUCTION_NOT_ACCEPTED_AS_SELF_DIRECTED_PHASE_B", "externalToshiInstruction"));
  }

  const required = ["revisionScope", "allowedTouchRange", "doNotTouchRange", "coreToKeep"];
  if (!revisionAuthorization.fullRevisionRequested) required.push("revisionStrength");
  for (const field of required) if (!hasText(input[field])) failures.push(fail("PHASE_B_REQUIREMENT_MISSING", field));
  const strength = textValue(input.revisionStrength);
  if (hasText(input.revisionStrength) && !REVISION_STRENGTHS.includes(strength)) failures.push(fail("REVISION_STRENGTH_UNKNOWN", "revisionStrength"));
  const effectiveRevisionStrength = revisionAuthorization.fullRevisionRequested ? "strong" : strength;
  if (effectiveRevisionStrength === "strong" && revisionAuthorization.strongAuthorized !== true) {
    failures.push(fail("STRONG_REVISION_NOT_ALLOWED", "strongAllowed|naturalLanguageFullRevision"));
  }

  return Object.freeze({
    decision: failures.length === 0 ? "PHASE_B_READY" : "RECEIVE_STOP",
    phase: failures.length === 0 ? "B" : null,
    ...commonRevisionInfo,
    effectiveRevisionStrength,
    failures: Object.freeze(failures)
  });
}

function requireTextFields(container, fields, errorCode, prefix = "") {
  return fields
    .filter((field) => !hasText(container?.[field]))
    .map((field) => fail(errorCode, `${prefix}${field}`));
}

function mergeFailures(...groups) {
  return Object.freeze(groups.flatMap((group) => Array.from(group ?? [])));
}

export function evaluateToshiOutput({ receiveResult, output, textOnlyRequested = false }) {
  const accepted = ["PHASE_A_READY", "PHASE_B_READY", "ADAPTIVE_A_TO_B_READY", "FULL_STACK_A_TO_B_READY"];
  if (!accepted.includes(receiveResult?.decision)) {
    return Object.freeze({ decision: "OUTPUT_STOP", failures: Object.freeze([fail("RECEIVE_GATE_NOT_PASSED", "receiveResult")]) });
  }
  if (!isObject(output)) {
    return Object.freeze({ decision: "OUTPUT_STOP", failures: Object.freeze([fail("OUTPUT_OBJECT_REQUIRED", "output")]) });
  }
  const terminal = evaluateTerminalLocks(output);
  if (receiveResult.phase === "A") {
    const phaseFailures = [
      ...requireTextFields(output?.通し診断, PHASE_A_DIAGNOSIS_FIELDS, "PHASE_A_DIAGNOSIS_FIELD_MISSING", "通し診断."),
      ...requireTextFields(output?.Phase_A_修正指示, PHASE_A_INSTRUCTION_FIELDS, "PHASE_A_INSTRUCTION_FIELD_MISSING", "Phase_A_修正指示.")
    ];
    const failures = mergeFailures(phaseFailures, terminal.failures);
    return Object.freeze({ decision: failures.length === 0 ? "PHASE_A_SUCCESS" : "OUTPUT_STOP", terminalDecision: terminal.decision, failures });
  }

  const adaptiveRequired = receiveResult.revisionProfile === "ADAPTIVE_DIRECTOR";
  const adaptiveReport = output?.編集主任レポート ?? output?.adaptiveEditorReport ?? output?.internalAdaptiveReport;
  const revisedExtraction = extractBodyText(output?.修正版, receiveResult.editContract?.bodyExtraction ?? { mode: "FULL_TEXT" }, output?.修正版本文 ?? output?.revisedBodyText);
  const extractionFailures = revisedExtraction.ok ? [] : [fail(revisedExtraction.error, "修正版.bodyExtraction")];
  const adaptiveResult = adaptiveRequired && revisedExtraction.ok
    ? evaluateAdaptiveEditorReport(adaptiveReport, {
        expectedBaseline: receiveResult.baseline,
        editContract: receiveResult.editContract,
        revisedText: output?.修正版,
        revisedBodyText: revisedExtraction.text
      })
    : adaptiveRequired
      ? Object.freeze({ decision: "ADAPTIVE_REPORT_STOP", failures: Object.freeze(extractionFailures) })
      : Object.freeze({ decision: "ADAPTIVE_REPORT_NOT_REQUIRED", failures: Object.freeze([]) });

  if (textOnlyRequested) {
    const phaseFailures = [];
    if (!hasText(output?.修正版)) phaseFailures.push(fail("REVISED_TEXT_MISSING", "修正版"));
    if (!hasText(output?.internalLog) && !hasText(output?.修正後LOG_INTERNAL)) {
      phaseFailures.push(fail("TEXT_ONLY_INTERNAL_LOG_MISSING", "internalLog|修正後LOG_INTERNAL"));
    }
    if (adaptiveRequired && !isObject(output?.internalAdaptiveReport) && !isObject(output?.編集主任レポート)) {
      phaseFailures.push(fail("TEXT_ONLY_ADAPTIVE_REPORT_MISSING", "internalAdaptiveReport|編集主任レポート"));
    }
    const failures = mergeFailures(phaseFailures, adaptiveResult.failures, terminal.failures);
    return Object.freeze({
      decision: failures.length === 0 ? "PHASE_B_SUCCESS" : "OUTPUT_STOP",
      internalLogRequired: true,
      adaptiveReportRequired: adaptiveRequired,
      terminalDecision: terminal.decision,
      failures
    });
  }

  const required = ["対象範囲", "修正強度", "修正方針", "修正版", "修正後LOG"];
  const phaseFailures = requireTextFields(output, required, "PHASE_B_OUTPUT_MISSING");
  if (hasText(output?.修正強度) && !REVISION_STRENGTHS.includes(textValue(output.修正強度))) {
    phaseFailures.push(fail("PHASE_B_OUTPUT_STRENGTH_UNKNOWN", "修正強度"));
  }
  const failures = mergeFailures(phaseFailures, adaptiveResult.failures, terminal.failures);
  return Object.freeze({
    decision: failures.length === 0 ? "PHASE_B_SUCCESS" : "OUTPUT_STOP",
    adaptiveReportRequired: adaptiveRequired,
    adaptiveReportDecision: adaptiveResult.decision,
    terminalDecision: terminal.decision,
    failures
  });
}
