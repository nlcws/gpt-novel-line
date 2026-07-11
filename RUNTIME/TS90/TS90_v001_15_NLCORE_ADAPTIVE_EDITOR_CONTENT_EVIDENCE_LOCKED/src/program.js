export const RUNTIME_VERSION = "ts90-v001.15-nlcore-adaptive-editor-content-evidence-locked";
export const PACKAGE_VERSION = "TS90_v001_15_NLCORE_ADAPTIVE_EDITOR_CONTENT_EVIDENCE_LOCKED";

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

export const BOOT_READ_ORDER = Object.freeze([
  "START_HERE.js",
  "src/program.js",
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
  ...ADAPTIVE_EDITOR_LOCK_READ_ORDER
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
  "母艦との差分評価", "劣化箇所のロールバック", "最終冷却", "納品本文と作業報告の分離"
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
  "src/program.js",
  "src/receive-gate.js",
  "src/verify.js",
  "src/verify-package.js",
  "test/runtime.test.js"
]);
