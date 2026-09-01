export const RUNTIME_VERSION = "ts90-v001.25-nlcore-json-roundtrip-boundary";
export const PACKAGE_VERSION = "TS90_v001_25_NLCORE_JSON_ROUNDTRIP_BOUNDARY_FINALIZED";

export const CHAT_MOUNT_BOOT = Object.freeze({
  mode: "AUTO_BOOT_ON_CHAT_MOUNT",
  entry: "START_HERE.js",
  readOrderRequired: true,
  autoStart: true,
  autoRepair: false,
  waitState: "WAIT_FOR_RECEIVABLE_TEXT",
  note: "Chat mount boots the receive gate and terminal locks. It does not revise text until valid TXT input, explicit legacy input, or a complete writer SUCCESS object passes. Phase A does not require external documents or comparison sources."
});

export const SOURCE_READ_ORDER = Object.freeze([
  "source/GPT_BUILDER_INSTRUCTIONS_TOSHI_SHUSEI_v1_0.txt",
  "source/README_SET.md"
]);

export const ALL_LINE_LOCK_READ_ORDER = Object.freeze([
  "source/ALL_LINE_END_USER_HEAT_DELIVERY_LOCK_v001.md",
  "source/ALL_LINE_FULL_CONVERGENCE_SWEEP_LOCK_v001.md"
]);

export const NOVEL_LINE_CORE_READ_ORDER = Object.freeze([
  "source/NOVEL_LINE_FINAL_CORE_LOCK_v001.md"
]);

export const TEXT_RECEIVE_LOCK_READ_ORDER = Object.freeze([
  "source/TS90_TEXT_RECEIVE_LIGHTWEIGHT_LOCK_v001.md"
]);

export const PHASE_SELF_DIRECTED_LOCK_READ_ORDER = Object.freeze([
  "source/TS90_PHASE_A_TO_B_SELF_DIRECTED_LOCK_v001.md"
]);

export const HISTORY_MASTER_REAPPLY_LOCK_READ_ORDER = Object.freeze([
  "source/TS90_HISTORY_MASTER_REAPPLY_LOCK_v001.md"
]);

export const FULL_REVISION_LOCK_READ_ORDER = Object.freeze([
  "source/TS90_FULL_REVISION_READY_LOCK_v001.md"
]);

export const ADAPTIVE_EDITOR_LOCK_READ_ORDER = Object.freeze([
  "source/TS90_ADAPTIVE_EDITOR_DIRECTOR_LOCK_v001.md"
]);

export const TITLE_DECISION_LOCK_READ_ORDER = Object.freeze([
  "source/TS90_PHASE_C_TITLE_DECISION_LOCK_v001.md"
]);

export const A_TO_C_TXTDL_LOCK_READ_ORDER = Object.freeze([
  "source/TS90_A_TO_C_TXTDL_OUTPUT_LOCK_v002.md"
]);

export const SKILL_RUNTIME_EVIDENCE_LOCK_READ_ORDER = Object.freeze([
  "source/TS90_SKILL_RUNTIME_EVIDENCE_BINDING_LOCK_v005.md"
]);

export const BOOT_READ_ORDER = Object.freeze([
  "START_HERE.js",
  "src/program.js",
  "src/json-data.js",
  "src/receive-gate.js",
  "src/verify.js",
  "src/verify-package.js",
  ...SOURCE_READ_ORDER,
  ...ALL_LINE_LOCK_READ_ORDER,
  ...NOVEL_LINE_CORE_READ_ORDER,
  ...TEXT_RECEIVE_LOCK_READ_ORDER,
  ...PHASE_SELF_DIRECTED_LOCK_READ_ORDER,
  ...HISTORY_MASTER_REAPPLY_LOCK_READ_ORDER,
  ...FULL_REVISION_LOCK_READ_ORDER,
  ...ADAPTIVE_EDITOR_LOCK_READ_ORDER,
  ...TITLE_DECISION_LOCK_READ_ORDER,
  ...A_TO_C_TXTDL_LOCK_READ_ORDER,
  ...SKILL_RUNTIME_EVIDENCE_LOCK_READ_ORDER
]);

export const READ_ORDER = SOURCE_READ_ORDER;

export const SOURCE_MANIFEST = Object.freeze([
  Object.freeze({
    path: "source/GPT_BUILDER_INSTRUCTIONS_TOSHI_SHUSEI_v1_0.txt",
    bytes: 6189,
    sha256: "12B095EA3D74B8966C6CD3CA7E105CA660ED490D8004AF4E52D84FAF6BAF5222"
  }),
  Object.freeze({
    path: "source/README_SET.md",
    bytes: 424,
    sha256: "66FC7ECE2936F6CEA697BF936D30A6F9388C0C903B5BE965E1CED6DE98B942AE"
  })
]);

export const LOCK_MANIFEST = Object.freeze([
  Object.freeze({
    path: "source/ALL_LINE_END_USER_HEAT_DELIVERY_LOCK_v001.md",
    bytes: 2245,
    sha256: "B06431771C2DAFC00D7AF1221426CEC1ED39033F6AA807AB2D39135D1D03CD30"
  }),
  Object.freeze({
    path: "source/ALL_LINE_FULL_CONVERGENCE_SWEEP_LOCK_v001.md",
    bytes: 1924,
    sha256: "8EFE254E90E1219578577C028557176C4F77C6CCA885A697FE99EC13048D2F73"
  })
]);

export const NOVEL_LINE_CORE_MANIFEST = Object.freeze([
  Object.freeze({
    path: "source/NOVEL_LINE_FINAL_CORE_LOCK_v001.md",
    bytes: 2712,
    sha256: "3F4B8F17061E6102F00DABA44444FF884EA96B5FB5089CA4A2C6F36CEBAC30A6"
  })
]);

export const TEXT_RECEIVE_LOCK_MANIFEST = Object.freeze([
  Object.freeze({
    path: "source/TS90_TEXT_RECEIVE_LIGHTWEIGHT_LOCK_v001.md",
    bytes: 1315,
    sha256: "02637977EA818C442DD87ED926BD7CA85998D19BB1A228C412D6DA07DCD09FC2"
  })
]);

export const PHASE_SELF_DIRECTED_LOCK_MANIFEST = Object.freeze([
  Object.freeze({
    path: "source/TS90_PHASE_A_TO_B_SELF_DIRECTED_LOCK_v001.md",
    bytes: 2165,
    sha256: "9FFD75E2031BE03391433057CE2FFC6ED35075F59B3A89A240A7B111AD4A0337"
  })
]);

export const HISTORY_MASTER_REAPPLY_LOCK_MANIFEST = Object.freeze([
  Object.freeze({
    path: "source/TS90_HISTORY_MASTER_REAPPLY_LOCK_v001.md",
    bytes: 672,
    sha256: "19E33709EAC30E82046AA8EB1246DF7DDA5C1C63FAB8C76C4B7C13C551D820EF"
  })
]);

export const FULL_REVISION_LOCK_MANIFEST = Object.freeze([
  Object.freeze({
    path: "source/TS90_FULL_REVISION_READY_LOCK_v001.md",
    bytes: 3950,
    sha256: "584D4C8D99DD56FB136087EE8179DBF8B6642A3F9AA419896D85588EF086B699"
  })
]);

export const ADAPTIVE_EDITOR_LOCK_MANIFEST = Object.freeze([
  Object.freeze({
    path: "source/TS90_ADAPTIVE_EDITOR_DIRECTOR_LOCK_v001.md",
    bytes: 14101,
    sha256: "30CDCC50B045B8F00B560A9F436BA8197B44EB0727F77ADCD84D4504F8EE1CAA"
  })
]);

export const TITLE_DECISION_LOCK_MANIFEST = Object.freeze([
  Object.freeze({
    path: "source/TS90_PHASE_C_TITLE_DECISION_LOCK_v001.md",
    bytes: 2663,
    sha256: "0B7866494C3E716B3C4A0056EE836C5F45C3B164F8802040E73A476F48BD6764"
  })
]);

export const A_TO_C_TXTDL_LOCK_MANIFEST = Object.freeze([
  Object.freeze({
    path: "source/TS90_A_TO_C_TXTDL_OUTPUT_LOCK_v002.md",
    bytes: 3528,
    sha256: "45E19ACA0747EB02488CCEB3A49C58B842991B133CA55CE778B981433EA5342D"
  })
]);

export const SKILL_RUNTIME_EVIDENCE_LOCK_MANIFEST = Object.freeze([
  Object.freeze({
    path: "source/TS90_SKILL_RUNTIME_EVIDENCE_BINDING_LOCK_v005.md",
    bytes: 7157,
    sha256: "8F843331771F2963373ACC7902EB9CDCFF62A324E829621485E52C4CF3D397EB"
  })
]);

export const FULL_REVISION_STAGE_ORDER = Object.freeze([
  "編成校正",
  "強改稿",
  "冷却",
  "校正",
  "音読調整",
  "固定条件照合"
]);

export const FULL_REVISION_POLICY = Object.freeze({
  alwaysReady: true,
  autoExecute: false,
  explicitUserActivationRequired: true,
  branchOnly: true,
  overwriteBase: false,
  authorUnknownIsDirectionNotGuarantee: true,
  abstractToConcreteExchangeAllowed: true,
  newPlotOrSettingDenied: true
});


export const ADAPTIVE_DIAGNOSTIC_LAYERS = Object.freeze([
  "設計", "構成", "シーン", "視点", "人物", "感情線", "台詞", "ペース",
  "情報開示", "描写", "文体", "冷却", "整合性", "校正", "音読"
]);

export const ADAPTIVE_STAGE_ORDER = Object.freeze([
  "設計照合", "構成編集", "シーン編集", "情報開示編集",
  "視点編集", "キャラクター編集", "感情線編集", "台詞編集", "ペーシング編集",
  "描写編集", "強改稿", "ラインエディット", "冷却",
  "連続性・整合性チェック", "世界観・設定校正", "コピーエディット", "音読校正",
  "固定条件照合"
]);

export const ADAPTIVE_FINALIZATION_ORDER = Object.freeze([
  "母艦との差分評価", "劣化箇所のロールバック", "最終冷却", "固定条件照合", "納品本文と作業報告の分離", "Cモードタイトル決定", "TXTDL納品"
]);

export const BLADE_STRENGTH_SCALE = Object.freeze({
  0: "使用しない",
  1: "局所確認",
  2: "標準修正",
  3: "強修正",
  4: "全面再設計候補"
});

export const EDIT_CHANGE_CLASSIFICATIONS = Object.freeze([
  "明確に改善", "好みの差", "効果不明", "劣化", "固定条件上必要"
]);

export const ROLLBACK_REQUIRED_CLASSIFICATIONS = Object.freeze(["効果不明", "劣化"]);
export const BASELINE_PROMOTION_DECISIONS = Object.freeze(["推奨", "非推奨", "保留"]);

export const ADAPTIVE_STOP_SIGNALS = Object.freeze([
  "全人物の話し方が似た",
  "段落長が均一化した",
  "各場面が毎回結論化した",
  "感覚描写が全段落へ均等増加した",
  "原文固有の手触りが消えた",
  "本文量維持の水増しが始まった",
  "編集後の説明が増えた",
  "固定条件保持の不自然文が生まれた",
  "編集者の美文癖が前景化した",
  "人物全員が主題を理解しすぎた"
]);

export const ADAPTIVE_EDITOR_POLICY = Object.freeze({
  alwaysReady: true,
  autoExecute: false,
  explicitUserActivationRequired: true,
  defaultFullRevisionProfile: "ADAPTIVE_DIRECTOR",
  fixedFullStackRequiresExplicitRequest: true,
  branchOnly: true,
  overwriteBase: false,
  autoSnapshotWhenBaselineMissing: true,
  defaultBaselineName: "INPUT_SNAPSHOT",
  diagnoseBeforeEditing: true,
  zeroStrengthIsValidDecision: true,
  strengthFourMeansDesignReturn: true,
  effectUnknownOrDegradedMustRollback: true,
  preferenceDifferenceNeverAutoPromotesBaseline: true,
  externalBetaReadNotClaimed: true,
  authorUnknownIsDirectionNotGuarantee: true,
  executionIntentRequired: true,
  consultationDoesNotExecute: true,
  baselineEvidenceBound: true,
  diagnosisPlanBinding: true,
  strictStageExecutionBinding: true,
  activeResolvedStopHistory: true,
  rollbackBidirectionalBinding: true,
  actualCharacterCountVerification: true,
  inputModeBoundBaselineSource: true,
  revisedBodyHashVerification: true,
  canonicalDiffEvidenceBinding: true,
  editContractEvidenceBinding: true,
  retainedImprovementPromotionGate: true
});

export const TITLE_DECISION_POLICY = Object.freeze({
  mode: "PHASE_C_TITLE_DECISION",
  autoExecute: false,
  afterBodyCompletionOnly: true,
  bodyRevisionDenied: true,
  newStoryFactDenied: true,
  storyPackNotRequiredWhenFinalBodyPresent: true,
  finalBodyRequired: true,
  fixedCoreRequired: true,
  candidatesRequired: true,
  selectedTitleRequired: true,
  candidateReasonsRequired: true,
  rejectedReasonsRequired: true,
  noUnprovidedSeriesRuleClaim: true
});

export const TITLE_DECISION_REQUIRED_FIELDS = Object.freeze([
  "対象範囲",
  "本文状態",
  "固定条件",
  "タイトル候補",
  "採用タイトル",
  "採用理由",
  "却下候補と理由",
  "未確認 / 保留",
  "次工程"
]);

export const A_TO_C_TXTDL_STAGE_ORDER = Object.freeze([
  "Phase A診断",
  "Phase B修正",
  "適応型最終化",
  "最終冷却",
  "固定条件照合",
  "本文と作業報告を分離",
  "Cモードタイトル決定",
  "採用タイトルを本文先頭へ挿入",
  "TXTDL納品"
]);

export const A_TO_C_TXTDL_POLICY = Object.freeze({
  mode: "A_TO_C_CONTINUOUS_TXTDL_OUTPUT",
  defaultRun: "PHASE_A_TO_C_UNLESS_STOP",
  perStageUserNextRequired: false,
  stopAtFirstStopCondition: true,
  outputMode: "TXTDL",
  mountBootIsNotExecution: true,
  executionIntentRequired: true,
  finalBodyTxtRequired: true,
  workReportTxtRequired: true,
  stopReportTxtRequiredWhenStopped: true,
  bodyReportSeparatedBeforeTitle: true,
  phaseCAfterFinalBodyOnly: true,
  titleBlockInsertedAtBodyTop: true,
  titleBlockOrder: Object.freeze(["作品タイトル?", "部・編等?", "話数", "話タイトル"]),
  selectedTitleMustBeInTitleBlock: true,
  episodeLabelRequiredInTitleBlock: true,
  separateFinalTitleTxtDenied: true,
  titleCandidatesRemainInWorkReport: true
});

export const A_TO_C_TXTDL_SUCCESS_FILES = Object.freeze([
  "TS90_FINAL_BODY.txt",
  "TS90_WORK_REPORT.txt"
]);

export const A_TO_C_TXTDL_OPTIONAL_FILES = Object.freeze([
  "TS90_TITLE_CANDIDATES.txt"
]);

export const A_TO_C_TXTDL_STOP_FILES = Object.freeze([
  "TS90_STOP_REPORT.txt"
]);

export const HEAT_DELIVERY_REQUIRED_FLAGS = Object.freeze([
  "capturesUserRequestedVision",
  "preservesUserHeatThroughPack",
  "doesNotFlattenToGenericSafeOutput",
  "doesNotReplaceVisionWithProcessConvenience",
  "warnDoesNotCoolSpecPass",
  "stopKeepsVisionAndNamesRepairPoint",
  "deliversWithinVerifiedMaterials"
]);

export const FULL_CONVERGENCE_REQUIRED_FLAGS = Object.freeze([
  "noUnresolvedConditionResidue",
  "noUnmappedCoverageId",
  "noDanglingWarnWithoutClass",
  "noOpenStopWithoutTicket",
  "noHandoffResidue",
  "noHeatDeliveryResidue",
  "nextActionOrStopDeclared",
  "repeatUntilStableConfirmed"
]);

export const REVISION_STRENGTHS = Object.freeze(["light", "medium", "strong"]);

export const TERMINAL_LOCKS = Object.freeze({
  endUserHeatDeliveryLocked: true,
  fullConvergenceSweepLocked: true,
  requireNoResidueItems: true,
  requirePreservedUserVisionText: true,
  requireNextActionText: true,
  stopFormatRequires: Object.freeze(["理由", "影響", "必要修正", "責任境界", "保持する熱量"]),
  warnMustRemainClassified: true,
  passRequiresVisibleTerminalGate: true
});

export const PACKAGE_EXPECTED_FILES = Object.freeze([
  "RUNTIME_FILE_MANIFEST.json",
  "manifest.json",
  "package.json",
  "README.md",
  "START_HERE.js",
  "source/GPT_BUILDER_INSTRUCTIONS_TOSHI_SHUSEI_v1_0.txt",
  "source/README_SET.md",
  "source/ALL_LINE_END_USER_HEAT_DELIVERY_LOCK_v001.md",
  "source/ALL_LINE_FULL_CONVERGENCE_SWEEP_LOCK_v001.md",
  "source/NOVEL_LINE_FINAL_CORE_LOCK_v001.md",
  "source/TS90_TEXT_RECEIVE_LIGHTWEIGHT_LOCK_v001.md",
  "source/TS90_PHASE_A_TO_B_SELF_DIRECTED_LOCK_v001.md",
  "source/TS90_HISTORY_MASTER_REAPPLY_LOCK_v001.md",
  "source/TS90_FULL_REVISION_READY_LOCK_v001.md",
  "source/TS90_ADAPTIVE_EDITOR_DIRECTOR_LOCK_v001.md",
  "source/TS90_PHASE_C_TITLE_DECISION_LOCK_v001.md",
  "source/TS90_A_TO_C_TXTDL_OUTPUT_LOCK_v002.md",
  "source/TS90_SKILL_RUNTIME_EVIDENCE_BINDING_LOCK_v005.md",
  "src/program.js",
  "src/json-data.js",
  "src/runtime-engine.js",
  "src/receive-gate.js",
  "src/verify.js",
  "src/verify-package.js",
  "test/runtime.test.js",
  "test/runtime-engine.test.js"
]);
