function issue(code, path, message) {
  return { code, path, message, severity: "STOP" };
}

function sameSet(left = [], right = []) {
  if (!Array.isArray(left) || !Array.isArray(right)) return false;
  const a = [...new Set(left)].sort();
  const b = [...new Set(right)].sort();
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function allResolved(refs = []) {
  return Array.isArray(refs) && refs.length > 0 &&
    refs.every((ref) =>
      typeof ref?.path === "string" && ref.path.length > 0 &&
      typeof ref?.section === "string" && ref.section.length > 0 &&
      ref.exists === true && ref.read === true
    );
}

export function validateCheck(input) {
  const issues = [];
  const canon = input.verification?.canonicalCandidates ?? [];
  if (canon.length !== 1) {
    issues.push(issue("CANON_NOT_UNIQUE", "verification.canonicalCandidates",
      "正本候補は実在する1件に一意である必要があります"));
  } else if (!allResolved(canon)) {
    issues.push(issue("CANON_UNRESOLVED", "verification.canonicalCandidates",
      "正本参照を実読解決できません"));
  }
  if (!sameSet(input.verification?.requiredProhibitionIds, input.verification?.observedProhibitionIds)) {
    issues.push(issue("PROHIBITION_SET_MISMATCH", "verification",
      "必要禁止線集合と観測禁止線集合が一致しません"));
  }
  if (input.verification?.beforeCoreHash !== input.verification?.afterCoreHash) {
    issues.push(issue("CORE_HASH_CHANGED", "verification", "作品芯ハッシュが変化しています"));
  }
  return { issues };
}

export function validateCard(input) {
  const issues = [];
  const card = input.card ?? {};
  const requiredCollections = [
    "inputSources", "strongReferences", "weakReferences", "stopElements",
    "fixedConditions", "heatConditions",
    "connectionConditions", "prohibitionLines", "fragilePoints", "freedomAreas",
    "requiredCharacters", "requiredPlaces", "requiredEvents", "requiredObjects",
    "requiredOrder", "requiredScenes", "doNotStrengthen", "allowedSeeds"
  ];
  for (const field of requiredCollections) {
    if (!Array.isArray(card[field]) || card[field].length === 0) {
      issues.push(issue("STANDARD_CARD_SECTION_MISSING", `card.${field}`,
        "標準カード規格の必須集合が欠けています"));
    }
  }
  for (const field of [
    "episodeId", "version", "band", "completionBoundary", "foreground",
    "backgroundDirection", "returnDestination", "sourceTrace",
    "narrationConnection", "speechTagPolicy", "movementLayer",
    "metaphorLimit", "explanationAmount", "fuelCheck"
  ]) {
    if (card[field] == null || card[field] === "") {
      issues.push(issue("STANDARD_CARD_FIELD_MISSING", `card.${field}`,
        "標準カード規格の必須欄が欠けています"));
    }
  }
  if (card.conditionsCompleteInMountedPack !== true) {
    issues.push(issue("CARD_CONDITIONS_NOT_SELF_CONTAINED", "card.conditionsCompleteInMountedPack",
      "本文条件は対象マウントZIPまたはパック内で完結する必要があります"));
  }
  if (card.projectSpecificDevice == null || card.projectSpecificDevice === "") {
    issues.push(issue("PROJECT_DEVICE_MISSING", "card.projectSpecificDevice",
      "共通V2に加えて作品・単話固有の本文駆動装置が必要です"));
  }
  if (card.minimumNaturalExpansion == null && card.explicitShortForm !== true) {
    issues.push(issue("CARD_FUEL_UNMEASURED", "card.minimumNaturalExpansion",
      "短文化指定がないカードは自然展開可能量を検査する必要があります"));
  }
  const process = card.fixedProcessCoverage ?? [];
  const expectedSteps = Array.from({ length: 14 }, (_, index) => index + 1);
  if (!sameSet(process, expectedSteps)) {
    issues.push(issue("FIXED_PROCESS_INCOMPLETE", "card.fixedProcessCoverage",
      "執筆固定工程1〜14をすべて通せるカードである必要があります"));
  }
  const lane = input.card?.pointLane ?? [];
  if (!Array.isArray(lane) || lane.length < 2) {
    issues.push(issue("POINT_LANE_TOO_SHORT", "card.pointLane", "POINT走行レーンは2点以上必要です"));
  } else {
    lane.forEach((point, index) => {
      if (!point?.id || !point?.enterState || !point?.exitState) {
        issues.push(issue("POINT_INCOMPLETE", `card.pointLane[${index}]`,
          "各POINTにid/enterState/exitStateが必要です"));
      }
      if (index > 0 && lane[index - 1]?.exitState !== point?.enterState) {
        issues.push(issue("POINT_DISCONNECTED", `card.pointLane[${index}]`,
          "前POINTのexitStateと次POINTのenterStateが一致しません"));
      }
    });
  }
  if (input.card?.canonicalAnchor !== input.card?.returnAnchor) {
    issues.push(issue("CANONICAL_RETURN_MISMATCH", "card.returnAnchor",
      "returnAnchorがcanonicalAnchorと一致しません"));
  }
  const writerFields = input.card?.writerRequestFields ?? {};
  for (const field of ["lane", "lengthPolicy", "disclosureSpeed", "pausePoint", "fragilePoints"]) {
    if (writerFields[field] == null || writerFields[field] === "") {
      issues.push(issue("WRITER_REQUEST_INCOMPLETE", `card.writerRequestFields.${field}`,
        "執筆依頼必須欄が欠けています"));
    }
  }
  return { issues };
}

export function validateCardTest(input) {
  const issues = [];
  const requiredTraceIds = input.test?.requiredTraceIds ?? [];
  const availableTraceIds = input.test?.availableTraceIds ?? [];
  if (!requiredTraceIds.every((id) => availableTraceIds.includes(id))) {
    issues.push(issue("CARD_TRACE_MISSING", "test.availableTraceIds",
      "カードから必要LOG・熱源へ戻れません"));
  }
  const rounds = input.test?.simulationSnapshots ?? [];
  if (!Array.isArray(rounds) || rounds.length < 2) {
    issues.push(issue("SIMULATION_ROUNDS_INSUFFICIENT", "test.simulationSnapshots",
      "収束判定には複数回のシミュレーションが必要です"));
  } else {
    const last = JSON.stringify(rounds.at(-1));
    const previous = JSON.stringify(rounds.at(-2));
    if (last !== previous) {
      issues.push(issue("SIMULATION_NOT_CONVERGED", "test.simulationSnapshots",
        "直近2回の結果が一致せず未収束です"));
    }
  }
  return { issues };
}

export function validateTransferDeterministic(input) {
  const issues = [];
  const transfer = input.transfer ?? {};
  if (transfer.dailyPrimarySource !== "MOUNT_ZIP") {
    issues.push(issue("DAILY_PRIMARY_SOURCE_INVALID", "transfer.dailyPrimarySource",
      "日常運用の一次参照先は現行マウントZIPです"));
  }
  if (transfer.canonicalArchive !== "PROJECT_HISTORY_SHELF") {
    issues.push(issue("CANONICAL_ARCHIVE_INVALID", "transfer.canonicalArchive",
      "履歴と思想はプロジェクト側棚へ置きます"));
  }
  if (transfer.commonOperationUsedAsStorySource === true) {
    issues.push(issue("COMMON_OPERATION_AS_STORY_SOURCE", "transfer.commonOperationUsedAsStorySource",
      "共通運用は工程を支配し、作品本文条件源にはできません"));
  }
  if (!["PREPARE", "COMMIT"].includes(transfer.phase)) {
    issues.push(issue("TRANSFER_PHASE_REQUIRED", "transfer.phase",
      "移管はPREPAREまたはCOMMITを明示する必要があります"));
  }
  const inventoryIds = (transfer.inventory ?? []).map((entry) => entry.id);
  const dispositionIds = [
    ...(transfer.reflected ?? []),
    ...(transfer.held ?? []),
    ...(transfer.discarded ?? [])
  ].map((entry) => entry.id);
  if (!sameSet(inventoryIds, dispositionIds)) {
    issues.push(issue("TRANSFER_INVENTORY_UNACCOUNTED", "transfer",
      "回収素材の全IDを反映・保留・棄却のいずれかへ一度だけ対応させる必要があります"));
  }
  if (new Set(dispositionIds).size !== dispositionIds.length) {
    issues.push(issue("TRANSFER_DISPOSITION_DUPLICATE", "transfer",
      "同一素材を複数の移管先へ重複計上できません"));
  }
  if (transfer.phase === "PREPARE" && transfer.completedOutput != null) {
    issues.push(issue("TRANSFER_PREMATURE_COMPLETION", "transfer.completedOutput",
      "PREPARE段階では完了物を生成できません"));
  }
  if (transfer.phase === "COMMIT") {
    for (const field of ["sourceDigest", "preparedDigest", "outputDigest"]) {
      if (!transfer[field]) {
        issues.push(issue("TRANSFER_DIGEST_REQUIRED", `transfer.${field}`,
          "COMMITには移管前・準備済み・出力のdigestが必要です"));
      }
    }
    if (transfer.preparedDigest !== transfer.outputDigest) {
      issues.push(issue("TRANSFER_OUTPUT_MISMATCH", "transfer.outputDigest",
        "検査済み準備物と確定出力が一致しません"));
    }
    if (transfer.completedOutput == null) {
      issues.push(issue("TRANSFER_OUTPUT_REQUIRED", "transfer.completedOutput",
        "COMMITには確定出力が必要です"));
    }
  }
  const shelves = input.transfer?.shelves ?? {};
  for (const item of shelves["022"] ?? []) {
    if (!["CANONICAL_CONFIRMED", "USER_FIXED"].includes(item.state)) {
      issues.push(issue("UNCONFIRMED_IN_022", "transfer.shelves.022",
        "022には正本確認済みまたはユーザー固定だけを置けます"));
    }
  }
  for (const item of shelves["028"] ?? []) {
    if (["CANONICAL_CONFIRMED", "USER_FIXED"].includes(item.state)) {
      issues.push(issue("CONFIRMED_IN_028", "transfer.shelves.028",
        "確定情報を028へ逃がせません"));
    }
  }
  const gate = input.transfer?.resultGate021;
  for (const field of ["readOrder", "currentLocation", "canonicalRoute", "unresolvedStops", "nextWork"]) {
    if (gate?.[field] == null) {
      issues.push(issue("RESULT_021_INCOMPLETE", `transfer.resultGate021.${field}`,
        "移管後021の必須欄が欠けています"));
    }
  }
  if (!allResolved(input.transfer?.restartResolvedRefs ?? [])) {
    issues.push(issue("RESTART_RESOLUTION_FAILED", "transfer.restartResolvedRefs",
      "移管後021から必読参照を解決・実読できません"));
  }
  return { issues };
}

export function validateEpisodeProfileDeterministic(input, gate) {
  const issues = [];
  const before = input.episodeProfile?.before ?? {};
  const after = input.episodeProfile?.after ?? {};
  for (const field of gate.protectedBundle) {
    if (JSON.stringify(before[field]) !== JSON.stringify(after[field])) {
      issues.push(issue("PROTECTED_BUNDLE_CHANGED", `episodeProfile.after.${field}`,
        `${field}は単話プロファイル作成時に変更できません`));
    }
  }
  const outputKeys = Object.keys(input.episodeProfile?.output ?? {});
  const allowed = new Set(gate.allowedOutput);
  const forbidden = new Set(gate.forbiddenOutput);
  for (const key of outputKeys) {
    if (forbidden.has(key) || !allowed.has(key)) {
      issues.push(issue("PROFILE_OUTPUT_OUTSIDE_FENCE", `episodeProfile.output.${key}`,
        "単話プロファイルの許可範囲外です"));
    }
  }
  return { issues };
}
