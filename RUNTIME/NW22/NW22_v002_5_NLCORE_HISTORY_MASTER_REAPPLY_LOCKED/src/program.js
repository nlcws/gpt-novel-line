export const RUNTIME_VERSION = "nw22-v002.5-nlcore-history-master-reapply-locked";

export const READ_ORDER = Object.freeze([
  "source/GPT_BUILDER_INSTRUCTIONS_NORA_v1_0.txt",
  "source/GPT_BUILDER_INSTRUCTIONS_NORA_v2_0.txt",
  "source/GPT_BUILDER_INSTRUCTIONS_NORA_v2_1.txt",
  "source/NORA_RUNTIME_PATCH_READ_RUN_HEAT_SWEEP_v001.md",
  "source/NORA_CHAT_VOICE_v001.md",
  "source/ALL_LINE_END_USER_HEAT_DELIVERY_LOCK_v001.md",
  "source/ALL_LINE_FULL_CONVERGENCE_SWEEP_LOCK_v001.md",
  "source/NOVEL_LINE_FINAL_CORE_LOCK_v001.md",
  "source/NORA_SEPARATE_FIRELINE_OUTPUT_LOCK_v001.md",
  "source/NORA_HISTORY_MASTER_REAPPLY_LOCK_v001.md",
  "source/NORA_OPTIONAL_STORY_LAYER_USE_v001.md",
  "source/STORY_LAYER_REDEFINITION_MULTI_USE_v21.md",
  "source/README_SET.md"
]);

export const SOURCE_MANIFEST = Object.freeze([
  Object.freeze({
    path: "source/GPT_BUILDER_INSTRUCTIONS_NORA_v1_0.txt",
    bytes: 6126,
    sha256: "B80364497BB720451E4E3C92BFB64D570AC7C3B3A9B32AF25815C2E01971112F"
  }),
  Object.freeze({
    path: "source/GPT_BUILDER_INSTRUCTIONS_NORA_v2_0.txt",
    bytes: 10308,
    sha256: "C73032187924EEBF8C06E35D9F7FB3D3C5B8F6584BE8847945E742F4E1B5095C"
  }),
  Object.freeze({
    path: "source/GPT_BUILDER_INSTRUCTIONS_NORA_v2_1.txt",
    bytes: 12177,
    sha256: "040A747F15D6ED414CEAEEA2784C3F4A7C1E1E3F4D6F387D40D77A965107CDA1"
  }),
  Object.freeze({
    path: "source/NORA_RUNTIME_PATCH_READ_RUN_HEAT_SWEEP_v001.md",
    bytes: 1909,
    sha256: "C36B24EDA46C558480FBE60F4693074241D4836507F3A14600B725674AAB1EFC"
  }),
  Object.freeze({
    path: "source/NORA_CHAT_VOICE_v001.md",
    bytes: 931,
    sha256: "A4CE8321E26707FBA42C9ADDC2FAF84250F34A933E069C7F14D04CFB8E331DA0"
  }),
  Object.freeze({
    path: "source/ALL_LINE_END_USER_HEAT_DELIVERY_LOCK_v001.md",
    bytes: 2245,
    sha256: "B06431771C2DAFC00D7AF1221426CEC1ED39033F6AA807AB2D39135D1D03CD30"
  }),
  Object.freeze({
    path: "source/ALL_LINE_FULL_CONVERGENCE_SWEEP_LOCK_v001.md",
    bytes: 1924,
    sha256: "8EFE254E90E1219578577C028557176C4F77C6CCA885A697FE99EC13048D2F73"
  }),
  Object.freeze({
    path: "source/NOVEL_LINE_FINAL_CORE_LOCK_v001.md",
    bytes: 2712,
    sha256: "3F4B8F17061E6102F00DABA44444FF884EA96B5FB5089CA4A2C6F36CEBAC30A6"
  }),
  Object.freeze({
    path: "source/NORA_SEPARATE_FIRELINE_OUTPUT_LOCK_v001.md",
    bytes: 1674,
    sha256: "8B3042CA29D779D898C89E04A1C019F1F330C819B571B62B7CA751A7F0D3055F"
  }),
  Object.freeze({
    path: "source/NORA_HISTORY_MASTER_REAPPLY_LOCK_v001.md",
    bytes: 955,
    sha256: "C3822120E983FC3F8C394B2A665BED2C86D8AE4C95F9E9581D8EBFA4A728E60D"
  }),
  Object.freeze({
    path: "source/NORA_OPTIONAL_STORY_LAYER_USE_v001.md",
    bytes: 4076,
    sha256: "706E772BE508217C07D6090506A5C29FF7BB590C814C7E9DB36FFAED079BFA84"
  }),
  Object.freeze({
    path: "source/STORY_LAYER_REDEFINITION_MULTI_USE_v21.md",
    bytes: 60896,
    sha256: "FD13522B0A77C9D965D9E434CF1CB570DECED9EFFA1898E3033FF100E489C067"
  }),
  Object.freeze({
    path: "source/README_SET.md",
    bytes: 1727,
    sha256: "82C1DF5C1394DF2EA0472BC77761CA26825B97F47BBD7CD38B12F0F8581E3B88"
  })
]);

export const CHAT_MOUNT_BOOT = Object.freeze({
  mode: "AUTO_BOOT_ON_CHAT_MOUNT",
  entry: "START_HERE.js",
  readOrderRequired: true,
  autoStart: true,
  autoWrite: false,
  waitState: "WAIT_FOR_NORA_INPUT",
  note: "Chat mount boots Nora. It does not promote output to canon or regular manuscript."
});

export const OPTIONAL_STORY_LAYER = Object.freeze({
  version: "v21",
  included: true,
  sourcePath: "source/STORY_LAYER_REDEFINITION_MULTI_USE_v21.md",
  useIfImproves: true,
  forceEveryTime: false,
  stopIfUnused: false,
  promoteToCanon: false,
  commonDefinitionNotProfile: true,
  explicitValuesOverrideCommonExamples: true,
  noStereotypeUse: true,
  noHeatCooling: true
});

export const NORA_POLICY = Object.freeze({
  line: "outside_regular_workflow",
  canWriteTrialText: true,
  canMakeRegularManuscript: false,
  canMakeCanon: false,
  canMakeVerifiedV2: false,
  canReturnNoraV2Memo: true,
  sourceMutationAllowed: false,
  readAndRun: true,
  sourceAsFuel: true,
  userHeatDeliveryLocked: true,
  limitRun: true,
  endSweepRequired: true,
  chatVoiceRuntimeized: true,
  optionalStoryLayerV21: true,
  novelLineFinalCoreLocked: true,
  fourRuntimeRespectEqual: true,
  storyLayerUseIfImproves: true,
  storyLayerForceEveryTime: false,
  separateFirelineOutputLocked: true,
  currentInstructionOnly: false,
  oldInstructionVersionsBundled: true,
  historyMasterReapplyLockEnabled: true
});

export const NORA_RUNTIME_LOCKS = Object.freeze({
  readAndRun: "読める。理解できる。書ける。なら、書く。",
  sourceAsFuel: true,
  userHeatDeliveryLocked: true,
  doesNotFlattenToGenericSafeOutput: true,
  warnDoesNotCoolSpecPass: true,
  endSweepRequired: true,
  noUnclassifiedResidue: true,
  optionalStoryLayerV21: true,
  novelLineFinalCoreLocked: true,
  fourRuntimeRespectEqual: true,
  storyLayerDoesNotStopWriting: true,
  storyLayerDoesNotPromoteCanon: true,
  canonGuard: true,
  separateFirelineOutputLocked: true,
  currentInstructionOnly: false,
  oldInstructionVersionsBundled: true,
  historyMasterReapplyLockEnabled: true
});

export const NORA_CHAT_VOICE = Object.freeze({
  fast: true,
  textForward: true,
  phrase: "見た。走れる。",
  optionalLayerPhrase: "レイヤー少し使う。本文いく。",
  avoidLongProcessTalk: true,
  catFlavorInChatOnly: true,
  manuscriptVoiceUnaffected: true
});
