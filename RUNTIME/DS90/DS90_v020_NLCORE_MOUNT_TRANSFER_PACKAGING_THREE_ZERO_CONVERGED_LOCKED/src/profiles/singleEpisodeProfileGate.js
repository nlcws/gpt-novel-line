import { forbidden, required } from "../runtime/rule.js";
import { validateEpisodeProfileDeterministic } from "../validation/deterministic.js";

export const singleEpisodeProfileGate = Object.freeze({
  id: "SINGLE_EPISODE_PROFILE_CREATION_PERMISSION_GATE",
  role: "PERMISSION_GATE",
  passState: "SINGLE_EPISODE_PROFILE_GATE_PASS_WITH_STOP",

  protectedBundle: Object.freeze([
    "episodeBundleCandidates",
    "observationWindowMap",
    "connectionOrderLedger",
    "fixedConditionsTable",
    "prohibitionTable",
    "returnDestinationTable",
    "freedomAreaTable",
    "supportLogBundles",
    "narrationConvergenceShelf",
    "zipIntegrity"
  ]),

  allowedOutput: Object.freeze([
    "actualMainCharacterCandidate",
    "secondaryCandidate",
    "secondaryOptionality",
    "foreground",
    "backgroundIntensityDirection",
    "backgroundDemotion",
    "returnDestination",
    "unopenedLines",
    "supportLogInclusion",
    "characterPsychologyReferenceNeed",
    "narrationAccidentFlags"
  ]),

  forbiddenOutput: Object.freeze([
    "manuscriptCardBody",
    "F1_1",
    "writerReady",
    "pack099",
    "writerHandoff",
    "newEpisodeDecision"
  ]),

  rules: [
    required("SEPG-001", "episodeProfile.bundleSize", "対象話束の話数が必要"),
    required("SEPG-002", "episodeProfile.connectionRows", "接続順台帳の行数が必要"),
    required("SEPG-003", "episodeProfile.fixedConditionRows", "固定条件表の行数が必要"),
    required("SEPG-004", "episodeProfile.prohibitionRows", "禁止線表の行数が必要"),
    required("SEPG-005", "episodeProfile.returnRows", "戻し先表の行数が必要"),
    required("SEPG-006", "episodeProfile.freedomRows", "自由領域表の行数が必要"),
    forbidden("SEPG-007", "episodeProfile.changeBundleCandidates", "話束候補を変更しない"),
    forbidden("SEPG-008", "episodeProfile.changeObservationMap", "観測窓mapを変更しない"),
    forbidden("SEPG-009", "episodeProfile.dropSupportLogs", "支えログ束を落とさない"),
    forbidden("SEPG-010", "episodeProfile.createManuscriptCard", "本文カード本文を作らない"),
    forbidden("SEPG-011", "episodeProfile.createWriterReady", "writer_readyへ進まない"),
    forbidden("SEPG-012", "episodeProfile.create099", "099を作らない"),
    forbidden("SEPG-013", "episodeProfile.handoffToWriter", "執筆さんへ渡さない"),
    forbidden("SEPG-014", "episodeProfile.makeNewEpisodeDecision", "単話プロファイル作成中に新判断しない")
  ]
});

export function expectedRows(input) {
  return input.episodeProfile?.bundleSize ?? null;
}

export function validateRowAlignment(input) {
  const expected = expectedRows(input);
  if (!Number.isInteger(expected) || expected <= 0) return [];
  const fields = [
    "connectionRows",
    "fixedConditionRows",
    "prohibitionRows",
    "returnRows",
    "freedomRows"
  ];
  return fields
    .filter((field) => input.episodeProfile?.[field] !== expected)
    .map((field) => ({
      ruleId: "SEPG-ROW-ALIGNMENT",
      decision: "STOP",
      field: `episodeProfile.${field}`,
      message: `${field}は話束数${expected}と一致する必要があります`
    }));
}

export function validateEpisodeProfileGate(input) {
  return validateEpisodeProfileDeterministic(input, singleEpisodeProfileGate);
}
