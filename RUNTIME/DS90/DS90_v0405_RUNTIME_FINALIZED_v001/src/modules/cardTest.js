import { forbidden, required } from "../runtime/rule.js";
import { validateCardTest } from "../validation/deterministic.js";

export const cardTestModule = Object.freeze({
  id: "CARD_TEST",
  axes: [
    "userReaction", "beginnerPath", "shortageVisibility", "causalConversion",
    "goal", "nextAnchor", "characterReaction", "livingConstraint", "cityCost",
    "manuscriptEntry", "middleDepth", "coreSafety", "prohibitionSafety",
    "aftertaste", "logTraceability", "heatTraceability", "load"
  ],
  rules: [
    required("CT-001", "test.card", "検査対象カードが必要"),
    required("CT-002", "test.goalCondition", "比較ゴールが必要"),
    forbidden("CT-003", "test.evaluateOutputOnly", "本文成果だけで評価しない"),
    forbidden("CT-004", "test.ignoreHeatLog", "熱源LOGを無視しない"),
    forbidden("CT-005", "test.adoptByFormatName", "形式名だけで採用しない"),
    forbidden("CT-006", "test.fixDisplayDepth", "見せる量を固定正解にしない")
  ],
  validate: validateCardTest
});
