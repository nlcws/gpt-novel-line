const fail = (code, path, message) => ({ code, path, message });

const REGULAR_DENIED_REQUESTS = new Set([
  "REGULAR_MANUSCRIPT",
  "CANON_TEXT",
  "VERIFIED_V2",
  "SCHEDULED_POST_READY",
  "REVISION_BLADE_DONE",
  "NUMBERED_SERIES_CANON"
]);

const RETURN_V2_TRIGGERS = new Set([
  "V2で戻して",
  "検証用にV2で返して",
  "野良ちゃん戻しV2",
  "設計さんへ戻す素材",
  "試走結果をV2化"
]);

export const NORA_OUTPUT_CONTRACT = Object.freeze({
  trialText: Object.freeze(["text", "fireSeed"]),
  returnV2: Object.freeze([
    "対象", "元入力", "読んだ素材", "使用した燃料", "本文で実際に走った方向", "今回の核",
    "本文で強く出たもの", "固定層候補", "熱量層候補",
    "小物 / 場所 / 反応差", "次話への再開点", "正規昇格候補",
    "保留", "WARN", "STOP", "RETURN", "破棄した方がよい偶発要素", "禁止線に触れそうなもの",
    "未分類残渣スイープ", "設計さんが揉み直すべき点"
  ]),
  sweep: Object.freeze(["WARN", "STOP", "RETURN", "unclassifiedResidue"])
});

export function evaluateNoraBoot(input = {}) {
  const failures = [];
  const ledger = input.readLedger ?? [];
  for (const path of input.readOrder ?? []) {
    const entry = ledger.find((item) => item?.path === path);
    if (entry == null || entry.exists !== true || entry.read !== true) {
      failures.push(fail("NORA_SOURCE_UNREAD", path, "野良ちゃん原本は起動時に読む必要があります"));
    }
  }
  return Object.freeze({
    decision: failures.length === 0 ? "NORA_BOOT_READY" : "STOP",
    failures: Object.freeze(failures)
  });
}

export function evaluateNoraRequest(input = {}) {
  const failures = [];
  const requested = input.requestedOutputTypes ?? [];
  for (const type of requested) {
    if (REGULAR_DENIED_REQUESTS.has(type)) {
      failures.push(fail("REGULAR_LINE_DENIED", "requestedOutputTypes",
        "野良ちゃん本文は正規本文・正本・検証済みV2・通し番済み本文にできません"));
    }
  }
  if (input.treatGeneratedFactsAsCanon === true) {
    failures.push(fail("NORA_FACT_PROMOTION_DENIED", "treatGeneratedFactsAsCanon",
      "野良本文で増えた要素はユーザー明示固定まで正規昇格しません"));
  }
  if (input.userSaysDoNotAdd === true && input.missingPartsNeedDecision === true) {
    failures.push(fail("NORA_ASK_SHORT_REQUIRED", "missingPartsNeedDecision",
      "勝手に足すな指定がある場合、足りない部分は短く確認して止めます"));
  }
  if (input.explicitContradiction === true) {
    failures.push(fail("NORA_CONTRADICTION_STOP", "explicitContradiction",
      "明示条件同士が矛盾する場合は短く確認して止めます"));
  }
  const returnV2 = (input.triggers ?? []).some((trigger) => RETURN_V2_TRIGGERS.has(trigger));
  const materialReadable = input.materialReadable !== false;
  return Object.freeze({
    decision: failures.length === 0 ? (returnV2 ? "NORA_RETURN_V2_ALLOWED" : "NORA_TRIAL_WRITE_ALLOWED") : "STOP_OR_ASK_SHORT",
    outputContract: returnV2 ? NORA_OUTPUT_CONTRACT.returnV2 : NORA_OUTPUT_CONTRACT.trialText,
    returnV2,
    readAndRun: failures.length === 0 && materialReadable,
    sourceAsFuel: failures.length === 0,
    heatDeliveryLocked: true,
    endSweepRequired: true,
    canon: false,
    regularManuscript: false,
    verifiedV2: false,
    failures: Object.freeze(failures)
  });
}

export function evaluateNoraSweep(input = {}) {
  const failures = [];
  const unclassified = input.unclassifiedResidue ?? [];
  if (Array.isArray(unclassified) && unclassified.length > 0) {
    failures.push(fail("NORA_UNCLASSIFIED_RESIDUE", "unclassifiedResidue",
      "未分類残渣はWARN、STOP、RETURNのいずれかへ閉じる必要があります"));
  }
  if (input.cooledUserHeat === true) {
    failures.push(fail("NORA_HEAT_COOLING_DENIED", "cooledUserHeat",
      "ユーザーの見たい絵を一般論や工程都合へ冷却できません"));
  }
  if (input.warnUsedAsCooling === true) {
    failures.push(fail("NORA_WARN_COOLING_DENIED", "warnUsedAsCooling",
      "WARNは熱量を落とす理由ではなく注意札です"));
  }
  return Object.freeze({
    decision: failures.length === 0 ? "NORA_SWEEP_CLEAR" : "STOP",
    noUnclassifiedResidue: failures.length === 0,
    failures: Object.freeze(failures)
  });
}

export function evaluateNoraOutput(input = {}) {
  const failures = [];
  const result = input.requestResult;
  const output = input.output ?? {};
  if (result?.decision === "NORA_TRIAL_WRITE_ALLOWED") {
    for (const key of NORA_OUTPUT_CONTRACT.trialText) {
      if (typeof output[key] !== "string" || output[key].trim() === "") {
        failures.push(fail("NORA_OUTPUT_FIELD_MISSING", key, "野良本文出力に必要な欄が不足しています"));
      }
    }
  } else if (result?.decision === "NORA_RETURN_V2_ALLOWED") {
    for (const key of NORA_OUTPUT_CONTRACT.returnV2) {
      if (typeof output[key] !== "string" || output[key].trim() === "") {
        failures.push(fail("NORA_RETURN_V2_FIELD_MISSING", key, "野良ちゃん戻しV2の必須欄が不足しています"));
      }
    }
  } else {
    failures.push(fail("NORA_OUTPUT_NOT_ALLOWED", "requestResult", "STOP状態では本文出力しません"));
  }
  const sweep = evaluateNoraSweep({
    unclassifiedResidue: output.unclassifiedResidue,
    cooledUserHeat: output.cooledUserHeat,
    warnUsedAsCooling: output.warnUsedAsCooling
  });
  failures.push(...sweep.failures);
  if (output.canon === true || output.regularManuscript === true || output.verifiedV2 === true) {
    failures.push(fail("NORA_OUTPUT_PROMOTION_DENIED", "output", "野良出力を正規成果物扱いできません"));
  }
  return Object.freeze({
    decision: failures.length === 0 ? "NORA_OUTPUT_READY" : "STOP",
    canon: false,
    regularManuscript: false,
    verifiedV2: false,
    failures: Object.freeze(failures)
  });
}


export function evaluateNoraLayerUse(input = {}) {
  const failures = [];
  if (input.layerUsed === true && input.promoteToCanon === true) {
    failures.push(fail("NORA_LAYER_PROMOTION_DENIED", "promoteToCanon",
      "話レイヤーを使っても野良本文は正規成果物へ昇格しません"));
  }
  if (input.layerUsed === true && input.commonExampleFixedAsProfile === true) {
    failures.push(fail("NORA_LAYER_COMMON_EXAMPLE_FIXED", "commonExampleFixedAsProfile",
      "共通定義や例を作品固有値として固定できません"));
  }
  if (input.layerUsed === true && input.stereotypeUse === true) {
    failures.push(fail("NORA_LAYER_STEREOTYPE_DENIED", "stereotypeUse",
      "年齢・性別候補棚を固定観念として使えません"));
  }
  if (input.layerUsed === true && input.cooledUserHeat === true) {
    failures.push(fail("NORA_LAYER_HEAT_COOLING_DENIED", "cooledUserHeat",
      "レイヤー処理でユーザーの見たい絵を冷ませません"));
  }
  return Object.freeze({
    decision: failures.length === 0 ? (input.layerUseful === true ? "NORA_LAYER_USE_ALLOWED" : "NORA_LAYER_OPTIONAL_SKIP_ALLOWED") : "STOP",
    layerRequired: false,
    stopIfUnused: false,
    useIfImproves: true,
    promoteToCanon: false,
    failures: Object.freeze(failures)
  });
}
