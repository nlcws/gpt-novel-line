import { forbidden, required } from "../runtime/rule.js";

export const logModule = Object.freeze({
  id: "LOG",
  kinds: [
    "HEAT", "USER_SELECTION", "USER_DISCOMFORT", "USER_COMPROMISE",
    "CONDITION", "EVENT_TO_CAUSAL", "GOAL_TO_ANCHOR", "BETWEEN_ANCHORS",
    "DAY_SIM", "RAW", "CANDIDATE", "WINDOW", "PLOT", "EPISODE_BONE",
    "THICK_CARD", "MANUSCRIPT_RESULT", "AUDIT", "LONG_ARC", "COMPRESSION_RISK"
  ],
  rules: [
    required("LOG-001", "log.kind", "LOG種別が必要"),
    required("LOG-002", "log.source", "根拠sourceが必要"),
    forbidden("LOG-003", "log.usedAsCanonical", "LOGを正本扱いしない"),
    forbidden("LOG-004", "log.conditionWithoutHeat", "熱源LOGなしで条件化しない"),
    forbidden("LOG-005", "log.candidateWithoutGoal", "ゴール条件なしで候補化しない"),
    forbidden("LOG-006", "log.cardWithoutPlotLog", "プロット化LOGなしで厚カード化しない"),
    forbidden("LOG-007", "log.unrecordedDiscard", "候補を無記録で捨てない"),
    forbidden("LOG-008", "log.compressionRiskAsComplete", "圧縮事故疑いを完成扱いしない")
  ],
  reflectionOrder: ["RECORD", "CLASSIFY", "USER_DECISION", "TARGET", "SHELF", "REFLECT", "UPDATE_021", "RETAIN_REJECTION_REASON"]
});
