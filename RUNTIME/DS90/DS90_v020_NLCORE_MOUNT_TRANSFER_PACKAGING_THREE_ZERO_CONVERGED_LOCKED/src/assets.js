export const ASSET_REGISTRY = Object.freeze({
  specs: Object.freeze({
    core: "assets/specs/090_DS_CORE.md",
    check: "assets/specs/091_DS_CHECK.md",
    index: "assets/specs/098_DS_INDEX.md",
    tagSearch: "assets/specs/089_DS_TAG_SEARCH.md",
    card: "assets/specs/092_DS_CARD.md",
    cardTest: "assets/specs/093_DS_CARD_TEST.md",
    log: "assets/specs/094_DS_LOG.md",
    mountTransfer: "assets/specs/095_DS_MOUNT_TRANSFER.md",
    archive: "assets/specs/096_DS_ARCHIVE.md",
    endLog: "assets/specs/END_LOG_OPERATION_RULE.md",
    manifest: "assets/specs/000_MANIFEST_090_DS_v003ap_ENDLOG_MEMO_CLEAN.txt",
    audit: "assets/specs/PACK_AUDIT_REPORT_090_DS_v003ap_ENDLOG_MEMO_CLEAN.md"
  }),
  samples: Object.freeze({
    operatingGuide: "assets/samples/097_DS_SAMPLE.md",
    narrationV21: "assets/samples/SAMPLE_REFERENCES/NARRATION_LAYER_MULTI_REFERENCE.md",
    writerReadyTemplateV2: "assets/samples/SAMPLE_REFERENCES/WRITER_READY_CARD_TEMPLATE_V2.md",
    writerReadySample001: "assets/samples/SAMPLE_REFERENCES/READY_SAMPLE_NEKO_001_KAZENOTOORUHI.md",
    writingFreezeTemplateV2: "assets/samples/SAMPLE_REFERENCES/WRITING_FREEZE_CARD_TEMPLATE_V2.md",
    packagerCurrentRouteV0194: "assets/dsgn_infra/04_MODULE/packager/PACKAGER_CURRENT_ROUTE_V2_v0194.md",
    layerAliasBridgeV0194: "assets/dsgn_infra/03_REFERENCE/layer/layer_alias_to_current_keys_v0194.md",
    workProfileTemplateV2: "assets/samples/SAMPLE_REFERENCES/WORK_PROFILE_TEMPLATE_V2.md",
    bandProfileTemplateV2: "assets/samples/SAMPLE_REFERENCES/BAND_PROFILE_TEMPLATE_V2.md",
    connectionCardTemplateV2: "assets/samples/SAMPLE_REFERENCES/CONNECTION_CARD_TEMPLATE_V2.md",
    itemManagementTableV2: "assets/samples/SAMPLE_REFERENCES/ITEM_MANAGEMENT_TABLE_V2.md",
    zipStructureV2: "assets/samples/SAMPLE_REFERENCES/ZIP_STRUCTURE_V2.md",
    reverseExtractionChecklistV2: "assets/samples/SAMPLE_REFERENCES/REVERSE_EXTRACTION_CHECKLIST_V2.md",
    writerReadySample002: "assets/samples/SAMPLE_REFERENCES/READY_SAMPLE_NEKO_002_PURINHAHITOTSU.md",
    writerReadySample003: "assets/samples/SAMPLE_REFERENCES/READY_SAMPLE_NEKO_003_YUUGATAYONIKURUKO.md",
    sampleRefreshIndexV0194: "assets/samples/SAMPLE_REFRESH_INDEX_v019_4.md",
    worldAxisLayerBindingDefinitionV01912: "assets/dsgn_infra/04_MODULE/packager/WORLD_AXIS_LAYER_BINDING_SHARED_DEFINITION_v01912.md",
    episodeLayerActivationLockV01912: "assets/dsgn_infra/04_MODULE/packager/EPISODE_LAYER_ACTIVATION_LOCK_v01912.md",
    projectTagSearchBindingLockV01912: "assets/dsgn_infra/04_MODULE/packager/PROJECT_TAG_SEARCH_BINDING_LOCK_v01912.md",
    tagSearchFullConvergenceLockV01912: "assets/dsgn_infra/04_MODULE/packager/TAG_SEARCH_FULL_CONVERGENCE_LOCK_v01912.md"
  }),
  templates: Object.freeze({
    endLog: "assets/templates/END_LOG_TEMPLATE.txt",
    indexMap: "assets/templates/INDEX_MAP_TEMPLATE.md",
    layerProfile: "assets/templates/LAYER_PROFILE_TEMPLATE.md",
    restartMemo: "assets/templates/RESTART_MEMO_TEMPLATE.txt",
    shelfGuide: "assets/templates/SHELF_GUIDE_TEMPLATE.md",
    stopTagIndex: "assets/templates/STOP_TAG_INDEX_TEMPLATE.md",
    tagIndex: "assets/templates/TAG_INDEX_TEMPLATE.txt",
    tagIndexMachineSchema: "assets/dsgn_infra/04_MODULE/tag_search/TAG_INDEX_MACHINE_SCHEMA_v1.json",
    workUnitCard: "assets/templates/WORK_UNIT_CARD_TEMPLATE.md"
  })
});

export const ASSET_POLICY = Object.freeze({
  samplesAreCanonical: false,
  templatesAreCanonical: false,
  samplesAreReadProof: false,
  templatesAreReadProof: false,
  specsAreCanonical: false,
  specsRole: "FULL_OPERATION_REFERENCE",
  narrationV21Role: "REFERENCE_SAMPLE_AND_DEFINITION_CATALOG",
  narrationBaseRole: "ALWAYS_ON_OPERATION_PROFILE",
  sampleUseRequiresExplicitNeed: true,
  packagerCurrentRouteRequiredForPackCutout: true
});

export const OPERATION_ASSETS = Object.freeze({
  root: "assets/operation_mount",
  commonTemplate: "assets/operation_mount/COMMON_OPERATION_TEMPLATE_V1.md",
  gate: "assets/operation_mount/00_GATE",
  canon: "assets/operation_mount/10_CANON",
  roleAppendices: "assets/operation_mount/20_ROLE_APPENDICES",
  archivedVersionsIncluded: false,
  projectHistoryShelf: "PROJECT_SIDE_021_022_024_028",
  runtimeHistoryIncluded: false
});

export const COMPARISON_ASSETS = Object.freeze({
  root: "assets/comparison",
  fileCount: 23,
  role: "CODEX_FIXTURE_IGNORED_BY_GPT_RUNTIME",
  canonical: false
});
