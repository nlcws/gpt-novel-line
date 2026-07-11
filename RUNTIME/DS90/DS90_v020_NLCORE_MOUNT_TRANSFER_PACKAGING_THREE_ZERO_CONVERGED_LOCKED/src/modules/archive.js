import { forbidden, required } from "../runtime/rule.js";

export const archiveModule = Object.freeze({
  id: "ARCHIVE",
  rules: [
    required("ARC-001", "archive.candidates", "退避または削除候補が必要"),
    forbidden("ARC-002", "archive.mixLegacyAndCurrent", "旧版と現行を混ぜない"),
    forbidden("ARC-003", "archive.markCandidateDeleted", "削除候補を削除済みにしない"),
    forbidden("ARC-004", "archive.useComparisonAsCanonical", "比較資料を正本にしない"),
    forbidden("ARC-005", "archive.restoreUnlimitedInference", "AI無制限補完を復活させない"),
    forbidden("ARC-006", "archive.restorePlotFirst", "先プロット固定を復活させない"),
    forbidden("ARC-007", "archive.expandOutsideNovelDesign", "90を小説以外の標準へ拡張しない")
  ]
});
