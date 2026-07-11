import { forbidden, required } from "../runtime/rule.js";
import { validateCard } from "../validation/deterministic.js";

export const cardModule = Object.freeze({
  id: "CARD",
  alwaysOnProfile: "src/profiles/narrationBase.js",
  creationPermissionGate: "src/profiles/singleEpisodeProfileGate.js",
  optionalReference: "assets/samples/SAMPLE_REFERENCES/NARRATION_LAYER_MULTI_REFERENCE.md",
  requiredSections: [
    "header", "sourceBoundary", "core", "lane", "points", "fixedLayer",
    "heatLayer", "connectionLayer", "prohibitionLines", "fragilePoints",
    "freedomAreas", "returnDestination", "narrationLayer", "styleLayer",
    "projectSpecificDevice", "fuelCheck", "writerRequest"
  ],
  rules: [
    required("CARD-001", "card.canonicalAnchor", "正本アンカーが必要"),
    required("CARD-002", "card.sourceRead", "source実読が必要"),
    required("CARD-003", "card.goalCondition", "ゴール条件が必要"),
    required("CARD-004", "card.nextAnchorCondition", "次起点条件が必要"),
    required("CARD-005", "card.styleLayer", "文体レイヤーが必要"),
    required("CARD-006", "card.concreteObject", "働く具体物が必要"),
    required("CARD-007", "card.localStop", "local_stopが必要"),
    forbidden("CARD-008", "card.fromEndLogOnly", "END_LOGだけでカード化しない"),
    forbidden("CARD-009", "card.fromPlotFirst", "先プロット固定から直接カード化しない"),
    forbidden("CARD-010", "card.summaryOnly", "要約カードにしない"),
    forbidden("CARD-011", "card.mixLayers", "固定層・熱量層・裁量層を混ぜない"),
    forbidden("CARD-012", "card.fillShortageByInference", "不足を推測で埋めない"),
    forbidden("CARD-013", "card.weakenFixedStyle", "固定度指定を緩めない"),
    forbidden("CARD-014", "card.slideIntoManuscript", "本文生成へ滑らない"),
    forbidden("CARD-018", "card.fixSecondaryForBand", "副を帯固定しない"),
    forbidden("CARD-019", "card.requireSecondary", "副なし可を維持する"),
    forbidden("CARD-020", "card.psychologyOwnedByNarrationLayer", "心理の権限を話レイヤーへ移さない"),
    forbidden("CARD-021", "card.backgroundAbsent", "背景弱を背景ゼロにしない"),
    forbidden("CARD-022", "card.backgroundStrengthMeansLongText", "背景強を長文化にしない"),
    forbidden("CARD-023", "card.alwaysEnableOptionalLayers", "追加レイヤーを帯常設しない")
    ,
    forbidden("CARD-024", "card.useCommonOperationAsStorySource", "共通運用を本文条件源にしない"),
    forbidden("CARD-025", "card.useComparisonAsCanonical", "比較サンプルを作品正本にしない"),
    forbidden("CARD-026", "card.deferMissingConditionsToWriter", "不足条件を執筆工程へ送らない")
  ],
  validate: validateCard
});
