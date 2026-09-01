import { validateThreeZeroDryRuns } from "./convergence.js";

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

export function validateTransferDeterministic(input) {
  const issues = [];
  const transfer = input.transfer ?? {};
  if (transfer.dailyPrimarySource !== "MOUNT_ZIP") {
    issues.push(issue("DAILY_PRIMARY_SOURCE_INVALID", "transfer.dailyPrimarySource",
      "日常運用の一次参照先は現行マウントZIPです"));
  }
  if (transfer.canonicalArchive !== "PROJECT_HISTORY_SHELF") {
    issues.push(issue("CANONICAL_ARCHIVE_INVALID", "transfer.canonicalArchive",
      "履歴と思想は対象プロジェクト側の履歴棚へ置きます"));
  }
  if (transfer.commonOperationUsedAsContentSource === true) {
    issues.push(issue("COMMON_OPERATION_AS_CONTENT_SOURCE", "transfer.commonOperationUsedAsContentSource",
      "共通運用は工程を支配し、対象成果物の条件源にはできません"));
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
    for (const field of [
      "shelfReplayPlan", "zeroThinkStartReady", "transferAcceptanceGatePassed",
      "currentMountedZipsEmbedded", "chatTransferItemsEmbedded", "outputMountZipBuilt",
      "outputMountZipConverged", "currentRuntimeArtifactEmbedded"
    ]) {
      const value = transfer[field];
      if (value == null || value === false || value === "") {
        issues.push(issue("TRANSFER_COMMIT_FIELD_REQUIRED", `transfer.${field}`,
          "COMMIT成果物に必要な移管受入項目が不足しています"));
      }
    }
    issues.push(...validateThreeZeroDryRuns(transfer.dryRuns, "transfer.dryRuns"));
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
