import { ALWAYS_READ } from "../boot/validator.js";

const DESIGN_READS = Object.freeze([
  "assets/operation_mount/10_CANON/151_STANDARD_CARD_TEMPLATE.md",
  "assets/operation_mount/20_ROLE_APPENDICES/220_DESIGN_DECLARATION.md",
  "assets/operation_mount/20_ROLE_APPENDICES/230_DESIGN_NECESSARY_CONDITIONS.md",
  "assets/operation_mount/20_ROLE_APPENDICES/240_CARD_TEMPLATE_UNIFICATION_REQUEST.md",
  "assets/operation_mount/20_ROLE_APPENDICES/250_LAYER_REDEFINITION_REFERENCE.md"
]);

const PACK_CUTOUT_CURRENT_ROUTE_READS = Object.freeze([
  "assets/dsgn_infra/04_MODULE/packager/PACKAGER_CURRENT_ROUTE_V2_v0194.md",
  "assets/dsgn_infra/04_MODULE/packager/WRITER_OUTPUT_COMFORT_CHECK_v0195.md",
  "assets/dsgn_infra/04_MODULE/packager/RECIPROCAL_HANDOFF_RESPECT_LOCK_v0196.md",
  "assets/dsgn_infra/04_MODULE/packager/END_USER_HEAT_DELIVERY_LOCK_v0197.md",
  "assets/dsgn_infra/04_MODULE/common/ALL_LINE_END_USER_HEAT_DELIVERY_LOCK_v001.md",
  "assets/dsgn_infra/04_MODULE/common/ALL_LINE_FULL_CONVERGENCE_SWEEP_LOCK_v001.md",
  "assets/dsgn_infra/04_MODULE/common/DS90_V020_ACTIVE_ROUTE_CANONICALIZATION_LOCK.md",
  "assets/dsgn_infra/04_MODULE/common/DS90_RUNTIME_NEUTRALITY_AND_EXTERNAL_CONTEXT_BOUNDARY_LOCK_v020.md",
  "assets/dsgn_infra/04_MODULE/common/DESIGNER_RUNTIME_ACTIVE_ROUTE_NO_RESIDUE_LOCK_v020.md",
  "assets/dsgn_infra/04_MODULE/common/EXTERNAL_CONTEXT_HISTORY_RETAINED_ACTIVE_BOUNDARY_POLICY_v020.md",
  "assets/dsgn_infra/04_MODULE/common/HANDOFF_IS_ARTIFACT_BASED_LOCK_v020.md",
  "assets/dsgn_infra/04_MODULE/common/THOUGHT_INVARIANT_IMPLEMENTATION_VARIABLE_LOCK_v020.md",
  "assets/dsgn_infra/04_MODULE/common/NOVEL_LINE_FINAL_CORE_LOCK_v001.md",
  "assets/dsgn_infra/04_MODULE/common/DS90_PW90_ARTIFACT_HANDOFF_JOINT_LOCK_v001.md",
  "assets/dsgn_infra/04_MODULE/common/ARTIFACT_EQUALS_FULL_CONVERGENCE_LOCK_v020.md",
  "assets/dsgn_infra/04_MODULE/common/DS90_CODEX_FIXTURE_ACTIVE_ROUTE_BOUNDARY_LOCK_v020.md",
  "assets/dsgn_infra/04_MODULE/common/DS90_TRANSFER_PACK_PREP_ZERO_THINK_AND_CONVERGENCE_LOCK_v020.md",
  "assets/dsgn_infra/04_MODULE/common/DS90_MOUNT_TRANSFER_AUTO_DISPATCH_LOCK_v020.md",
  "assets/dsgn_infra/04_MODULE/common/DS90_HANDOFF_NO_AMBIGUITY_LOCK_v020.md",
  "assets/dsgn_infra/04_MODULE/common/DS90_TRANSFER_CURRENT_COST_ACCEPTANCE_LOCK_v020.md",
  "assets/dsgn_infra/04_MODULE/common/DS90_MOUNT_TRANSFER_SHELF_NATIVE_USE_GATE_LOCK_v020.md",
  "assets/dsgn_infra/04_MODULE/common/DS90_SINGLE_DOWNLOAD_MOUNT_BASE_DELIVERY_LOCK_v020.md",
  "assets/dsgn_infra/04_MODULE/common/DS90_MOUNT_BASE_DISTRIBUTION_MUST_CONTAIN_MOUNTABLE_ZIPS_LOCK_v020.md",
  "assets/dsgn_infra/04_MODULE/common/DS90_MOUNT_TRANSFER_AND_PACKAGING_ROOT_ROUTE_LOCK_v020.md",
  "assets/dsgn_infra/04_MODULE/common/DS90_THREE_ZERO_DRYRUN_CONVERGENCE_GATE_LOCK_v020.md",
  "assets/dsgn_infra/04_MODULE/packager/PACKAGER_ABSOLUTE_PACKAGING_LOCK_v0199.md",
  "assets/dsgn_infra/04_MODULE/packager/PACKAGER_PROCESS_VISIBILITY_LOCK_v01913.md",
  "assets/dsgn_infra/04_MODULE/packager/ZIP_SELF_CONTAINED_LOCK_v01913.md",
  "assets/dsgn_infra/04_MODULE/packager/MOUNT_TRANSFER_PROCESS_VISIBILITY_LOCK_v01913.md",
  "assets/dsgn_infra/04_MODULE/packager/MOUNT_TRANSFER_SELF_CONTAINED_LOCK_v01913.md",
  "assets/dsgn_infra/04_MODULE/packager/PACKAGER_WRITER_CANONICAL_HANDOFF_CONTRACT_v0198.md",
  "assets/dsgn_infra/04_MODULE/packager/PACKAGER_WRITER_HANDOFF_SCHEMA_v1.json",
  "assets/dsgn_infra/04_MODULE/packager/DESIGNER_TO_PACKAGER_MATERIAL_BUNDLE_v1.md",
  "assets/dsgn_infra/04_MODULE/packager/WORLD_AXIS_LAYER_BINDING_SHARED_DEFINITION_v01912.md",
  "assets/dsgn_infra/04_MODULE/packager/WORLD_AXIS_LAYER_BINDING_SCHEMA_v1.json",
  "assets/dsgn_infra/04_MODULE/packager/EPISODE_LAYER_ACTIVATION_LOCK_v01912.md",
  "assets/dsgn_infra/04_MODULE/packager/EPISODE_LAYER_ACTIVATION_SCHEMA_v1.json",
  "assets/dsgn_infra/04_MODULE/packager/PROJECT_TAG_SEARCH_BINDING_LOCK_v01912.md",
  "assets/dsgn_infra/04_MODULE/packager/TAG_SEARCH_FULL_CONVERGENCE_LOCK_v01912.md",
  "assets/dsgn_infra/04_MODULE/packager/FULL_CONVERGENCE_SWEEP_LOCK_v0198.md",
  "assets/dsgn_infra/04_MODULE/tag_search/TAG_INDEX_MACHINE_SCHEMA_v1.json",
  "assets/dsgn_infra/03_REFERENCE/layer/layer_alias_to_current_keys_v0194.md",
  "assets/samples/SAMPLE_REFERENCES/WRITER_READY_CARD_TEMPLATE_V2.md",
  "assets/samples/SAMPLE_REFERENCES/WORK_PROFILE_TEMPLATE_V2.md",
  "assets/samples/SAMPLE_REFERENCES/BAND_PROFILE_TEMPLATE_V2.md",
  "assets/samples/SAMPLE_REFERENCES/CONNECTION_CARD_TEMPLATE_V2.md",
  "assets/samples/SAMPLE_REFERENCES/WRITING_FREEZE_CARD_TEMPLATE_V2.md",
  "assets/samples/SAMPLE_REFERENCES/ITEM_MANAGEMENT_TABLE_V2.md",
  "assets/samples/SAMPLE_REFERENCES/ZIP_STRUCTURE_V2.md",
  "assets/samples/SAMPLE_REFERENCES/REVERSE_EXTRACTION_CHECKLIST_V2.md",
  "assets/samples/SAMPLE_REFERENCES/READY_SAMPLE_NEKO_001_KAZENOTOORUHI.md",
  "assets/samples/SAMPLE_REFERENCES/READY_SAMPLE_NEKO_002_PURINHAHITOTSU.md",
  "assets/samples/SAMPLE_REFERENCES/READY_SAMPLE_NEKO_003_YUUGATAYONIKURUKO.md",
  "assets/samples/SAMPLE_REFRESH_INDEX_v019_4.md"
]);

const COMPARISON_READS = Object.freeze([
  "assets/comparison/# πÇÉΦ⌐▒πé½πâ╝πâë v2∩╝ÜΦ╡░Φíîπâ¼πâ╝πâ│σ₧ïπÇæτî½∩╝æΦ⌐▒.txt",
  "assets/comparison/# πÇÉΦ⌐▒πé½πâ╝πâë v2∩╝ÜΦ╡░Φíîπâ¼πâ╝πâ│σ₧ïπÇæτî½∩╝ö∩╝ÖΦ⌐▒.txt",
  "assets/comparison/ΘçÄΦë»πüíπéâπéôτî½∩╝æΦ⌐▒V2.txt",
  "assets/comparison/ΘçÄΦë»πüíπéâπéôτî½∩╝æΦ⌐▒τÅ╛Φíîσƒ╖τ¡åπâæπââπé».txt",
  "assets/comparison/ΘçÄΦë»πüíπéâπéôτî½∩╝ö∩╝ÖΦ⌐▒V2.txt",
  "assets/comparison/ΘçÄΦë»πüíπéâπéôτî½∩╝ö∩╝ÖΦ⌐▒τÅ╛Φíîσƒ╖τ¡åπâæπââπé».txt",
  "assets/comparison/Φ⌐▒πé½πâ╝πâë v2∩╝ÜΦ╡░Φíîπâ¼πâ╝πâ│σ₧ï πé╡πâ│πâùπâ½.txt",
  "assets/comparison/Φ⌐▒πé½πâ╝πâë v2∩╝ÜΦ╡░Φíîπâ¼πâ╝πâ│σ₧ï.txt",
  "assets/comparison/πÇÉΦ⌐▒πé½πâ╝πâëV2Θüïτö¿µû╣Θç¥πÇæ.txt",
  "assets/comparison/πâæπââπé»NOMπâòπâ½πâ₧πéªπâ│πâêτî½∩╝æΦ⌐▒V2.txt",
  "assets/comparison/πâæπââπé»NOMπâòπâ½πâ₧πéªπâ│πâêτî½∩╝æΦ⌐▒τÅ╛Φíîσƒ╖τ¡åπâæπââπé».txt",
  "assets/comparison/πâæπââπé»NOMπâòπâ½πâ₧πéªπâ│πâêτî½∩╝ö∩╝ÖΦ⌐▒V2.txt",
  "assets/comparison/πâæπââπé»NOMπâòπâ½πâ₧πéªπâ│πâêτî½∩╝ö∩╝ÖΦ⌐▒τÅ╛Φíîσƒ╖τ¡åπâæπââπé».txt",
  "assets/comparison/πâæπââπé»τî½∩╝æΦ⌐▒V2.txt",
  "assets/comparison/πâæπââπé»τî½∩╝æΦ⌐▒τÅ╛Φíîσƒ╖τ¡åπâæπââπé».txt",
  "assets/comparison/πâæπââπé»τî½∩╝ö∩╝ÖΦ⌐▒V2.txt",
  "assets/comparison/πâæπââπé»τî½∩╝ö∩╝ÖΦ⌐▒τÅ╛Φíîσƒ╖τ¡åπâæπââπé».txt",
  "assets/comparison/πâ₧πâ½πâüNOMτî½∩╝æΦ⌐▒V2.txt",
  "assets/comparison/πâ₧πâ½πâüNOMτî½∩╝ö∩╝ÖΦ⌐▒V2.txt",
  "assets/comparison/πâ₧πâ½πâüτî½∩╝æΦ⌐▒V2.txt",
  "assets/comparison/πâ₧πâ½πâüτî½∩╝ö∩╝ÖΦ⌐▒V2.txt",
  "assets/comparison/τÅ╛Φíîσƒ╖τ¡åπâæπââπé»Φ⌐▒πé½πâ╝πâëτî½∩╝æΦ⌐▒.md",
  "assets/comparison/τÅ╛Φíîσƒ╖τ¡åπâæπââπé»Φ⌐▒πé½πâ╝πâëτî½∩╝ö∩╝ÖΦ⌐▒.md"
]);

export const OPERATION_READS = Object.freeze({
  "BOOT": [],
  "CHECK": [
    "src/modules/check.js",
    "assets/specs/091_DS_CHECK.md"
  ],
  "TAG_SEARCH": [
    "src/modules/tagSearch.js",
    "src/indexing/validator.js",
    "src/indexing/searchEngine.js",
    "assets/specs/089_DS_TAG_SEARCH.md",
    "assets/specs/098_DS_INDEX.md",
    "assets/templates/TAG_INDEX_TEMPLATE.txt",
    "assets/templates/STOP_TAG_INDEX_TEMPLATE.md",
    "assets/templates/INDEX_MAP_TEMPLATE.md",
    "assets/dsgn_infra/04_MODULE/tag_search/TAG_INDEX_MACHINE_SCHEMA_v1.json",
    "assets/dsgn_infra/04_MODULE/packager/PROJECT_TAG_SEARCH_BINDING_LOCK_v01912.md",
    "assets/dsgn_infra/04_MODULE/packager/TAG_SEARCH_FULL_CONVERGENCE_LOCK_v01912.md"
  ],
  "CARD": [
    "assets/operation_mount/10_CANON/151_STANDARD_CARD_TEMPLATE.md",
    "assets/operation_mount/20_ROLE_APPENDICES/220_DESIGN_DECLARATION.md",
    "assets/operation_mount/20_ROLE_APPENDICES/230_DESIGN_NECESSARY_CONDITIONS.md",
    "assets/operation_mount/20_ROLE_APPENDICES/240_CARD_TEMPLATE_UNIFICATION_REQUEST.md",
    "assets/operation_mount/20_ROLE_APPENDICES/250_LAYER_REDEFINITION_REFERENCE.md",
    "src/modules/card.js",
    "src/validation/deterministic.js",
    "assets/specs/092_DS_CARD.md",
    "assets/templates/WORK_UNIT_CARD_TEMPLATE.md",
    "assets/templates/LAYER_PROFILE_TEMPLATE.md"
  ],
  "CARD_TEST": [
    "assets/operation_mount/10_CANON/151_STANDARD_CARD_TEMPLATE.md",
    "assets/operation_mount/20_ROLE_APPENDICES/220_DESIGN_DECLARATION.md",
    "assets/operation_mount/20_ROLE_APPENDICES/230_DESIGN_NECESSARY_CONDITIONS.md",
    "assets/operation_mount/20_ROLE_APPENDICES/240_CARD_TEMPLATE_UNIFICATION_REQUEST.md",
    "assets/operation_mount/20_ROLE_APPENDICES/250_LAYER_REDEFINITION_REFERENCE.md",
    "src/modules/cardTest.js",
    "src/validation/deterministic.js",
    "assets/specs/093_DS_CARD_TEST.md"
  ],
  "LOG": [
    "src/modules/log.js",
    "assets/specs/094_DS_LOG.md"
  ],
  "MOUNT_TRANSFER": [
    "backpacks/MOUNT_TRANSFER_BACKPACK/START_HERE.js",
    "backpacks/MOUNT_TRANSFER_BACKPACK/assets/LIBRARIAN_TRANSFER_CONTRACT.md",
    "backpacks/MOUNT_TRANSFER_BACKPACK/src/invocation.js",
    "backpacks/MOUNT_TRANSFER_BACKPACK/src/librarian-gate.js",
    "assets/operation_mount/10_CANON/130_DESIGN_AND_WRITING_ROLES.md",
    "assets/operation_mount/10_CANON/140_MOUNT_REQUIREMENTS.md",
    "assets/operation_mount/COMMON_OPERATION_TEMPLATE_V1.md",
    "src/modules/transfer.js",
    "src/validation/deterministic.js",
    "src/indexing/validator.js",
    "assets/specs/095_DS_MOUNT_TRANSFER.md",
    "assets/specs/091_DS_CHECK.md",
    "assets/specs/089_DS_TAG_SEARCH.md",
    "assets/specs/098_DS_INDEX.md",
    "assets/templates/SHELF_GUIDE_TEMPLATE.md",
    "assets/templates/RESTART_MEMO_TEMPLATE.txt",
    "assets/dsgn_infra/04_MODULE/common/DS90_V020_ACTIVE_ROUTE_CANONICALIZATION_LOCK.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_RUNTIME_NEUTRALITY_AND_EXTERNAL_CONTEXT_BOUNDARY_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/DESIGNER_RUNTIME_ACTIVE_ROUTE_NO_RESIDUE_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/EXTERNAL_CONTEXT_HISTORY_RETAINED_ACTIVE_BOUNDARY_POLICY_v020.md",
    "assets/dsgn_infra/04_MODULE/common/HANDOFF_IS_ARTIFACT_BASED_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/THOUGHT_INVARIANT_IMPLEMENTATION_VARIABLE_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/NOVEL_LINE_FINAL_CORE_LOCK_v001.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_PW90_ARTIFACT_HANDOFF_JOINT_LOCK_v001.md",
    "assets/dsgn_infra/04_MODULE/common/ARTIFACT_EQUALS_FULL_CONVERGENCE_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_CODEX_FIXTURE_ACTIVE_ROUTE_BOUNDARY_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_TRANSFER_PACK_PREP_ZERO_THINK_AND_CONVERGENCE_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_MOUNT_TRANSFER_AUTO_DISPATCH_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_HANDOFF_NO_AMBIGUITY_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_TRANSFER_CURRENT_COST_ACCEPTANCE_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_MOUNT_TRANSFER_SHELF_NATIVE_USE_GATE_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_SINGLE_DOWNLOAD_MOUNT_BASE_DELIVERY_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_MOUNT_BASE_DISTRIBUTION_MUST_CONTAIN_MOUNTABLE_ZIPS_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_MOUNT_TRANSFER_AND_PACKAGING_ROOT_ROUTE_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_THREE_ZERO_DRYRUN_CONVERGENCE_GATE_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/packager/MOUNT_TRANSFER_PROCESS_VISIBILITY_LOCK_v01913.md",
    "assets/dsgn_infra/04_MODULE/packager/MOUNT_TRANSFER_SELF_CONTAINED_LOCK_v01913.md",
    "assets/dsgn_infra/04_MODULE/packager/ZIP_SELF_CONTAINED_LOCK_v01913.md"
  ],
  "ARCHIVE": [
    "src/modules/archive.js",
    "assets/specs/096_DS_ARCHIVE.md"
  ],
  "SINGLE_EPISODE_PROFILE_GATE": [
    "assets/operation_mount/10_CANON/151_STANDARD_CARD_TEMPLATE.md",
    "assets/operation_mount/20_ROLE_APPENDICES/220_DESIGN_DECLARATION.md",
    "assets/operation_mount/20_ROLE_APPENDICES/230_DESIGN_NECESSARY_CONDITIONS.md",
    "assets/operation_mount/20_ROLE_APPENDICES/240_CARD_TEMPLATE_UNIFICATION_REQUEST.md",
    "assets/operation_mount/20_ROLE_APPENDICES/250_LAYER_REDEFINITION_REFERENCE.md",
    "src/profiles/singleEpisodeProfileGate.js",
    "src/validation/deterministic.js",
    "assets/specs/091_DS_CHECK.md",
    "assets/specs/092_DS_CARD.md"
  ],
  "EPISODE_PACK": [
    "assets/operation_mount/10_CANON/151_STANDARD_CARD_TEMPLATE.md",
    "assets/operation_mount/20_ROLE_APPENDICES/220_DESIGN_DECLARATION.md",
    "assets/operation_mount/20_ROLE_APPENDICES/230_DESIGN_NECESSARY_CONDITIONS.md",
    "assets/operation_mount/20_ROLE_APPENDICES/240_CARD_TEMPLATE_UNIFICATION_REQUEST.md",
    "assets/operation_mount/20_ROLE_APPENDICES/250_LAYER_REDEFINITION_REFERENCE.md",
    "src/modules/episodePack.js",
    "assets/specs/091_DS_CHECK.md",
    "assets/specs/092_DS_CARD.md",
    "assets/specs/093_DS_CARD_TEST.md"
  ],
  "PACK_CUTOUT": [
    "src/modules/packCutout.js",
    "src/dsgn/invocation.js",
    "src/dsgn/namespace.js",
    "src/dsgn/lookup.js",
    "assets/dsgn_infra/04_MODULE/packager/pack_cutout_module_v1.md",
    "assets/dsgn_infra/04_MODULE/packager/PACKAGER_CURRENT_ROUTE_V2_v0194.md",
    "assets/dsgn_infra/04_MODULE/packager/WRITER_OUTPUT_COMFORT_CHECK_v0195.md",
    "assets/dsgn_infra/04_MODULE/packager/RECIPROCAL_HANDOFF_RESPECT_LOCK_v0196.md",
    "assets/dsgn_infra/04_MODULE/packager/END_USER_HEAT_DELIVERY_LOCK_v0197.md",
    "assets/dsgn_infra/04_MODULE/common/ALL_LINE_END_USER_HEAT_DELIVERY_LOCK_v001.md",
    "assets/dsgn_infra/04_MODULE/common/ALL_LINE_FULL_CONVERGENCE_SWEEP_LOCK_v001.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_V020_ACTIVE_ROUTE_CANONICALIZATION_LOCK.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_RUNTIME_NEUTRALITY_AND_EXTERNAL_CONTEXT_BOUNDARY_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/DESIGNER_RUNTIME_ACTIVE_ROUTE_NO_RESIDUE_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/EXTERNAL_CONTEXT_HISTORY_RETAINED_ACTIVE_BOUNDARY_POLICY_v020.md",
    "assets/dsgn_infra/04_MODULE/common/HANDOFF_IS_ARTIFACT_BASED_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/THOUGHT_INVARIANT_IMPLEMENTATION_VARIABLE_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/NOVEL_LINE_FINAL_CORE_LOCK_v001.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_PW90_ARTIFACT_HANDOFF_JOINT_LOCK_v001.md",
    "assets/dsgn_infra/04_MODULE/common/ARTIFACT_EQUALS_FULL_CONVERGENCE_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_CODEX_FIXTURE_ACTIVE_ROUTE_BOUNDARY_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_TRANSFER_PACK_PREP_ZERO_THINK_AND_CONVERGENCE_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_MOUNT_TRANSFER_AUTO_DISPATCH_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_HANDOFF_NO_AMBIGUITY_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_TRANSFER_CURRENT_COST_ACCEPTANCE_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_MOUNT_TRANSFER_SHELF_NATIVE_USE_GATE_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_SINGLE_DOWNLOAD_MOUNT_BASE_DELIVERY_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_MOUNT_BASE_DISTRIBUTION_MUST_CONTAIN_MOUNTABLE_ZIPS_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_MOUNT_TRANSFER_AND_PACKAGING_ROOT_ROUTE_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/common/DS90_THREE_ZERO_DRYRUN_CONVERGENCE_GATE_LOCK_v020.md",
    "assets/dsgn_infra/04_MODULE/packager/PACKAGER_ABSOLUTE_PACKAGING_LOCK_v0199.md",
    "assets/dsgn_infra/04_MODULE/packager/PACKAGER_PROCESS_VISIBILITY_LOCK_v01913.md",
    "assets/dsgn_infra/04_MODULE/packager/ZIP_SELF_CONTAINED_LOCK_v01913.md",
    "assets/dsgn_infra/04_MODULE/packager/MOUNT_TRANSFER_PROCESS_VISIBILITY_LOCK_v01913.md",
    "assets/dsgn_infra/04_MODULE/packager/MOUNT_TRANSFER_SELF_CONTAINED_LOCK_v01913.md",
    "assets/dsgn_infra/04_MODULE/packager/PACKAGER_WRITER_CANONICAL_HANDOFF_CONTRACT_v0198.md",
    "assets/dsgn_infra/04_MODULE/packager/PACKAGER_WRITER_HANDOFF_SCHEMA_v1.json",
    "assets/dsgn_infra/04_MODULE/packager/DESIGNER_TO_PACKAGER_MATERIAL_BUNDLE_v1.md",
    "assets/dsgn_infra/04_MODULE/packager/WORLD_AXIS_LAYER_BINDING_SHARED_DEFINITION_v01912.md",
    "assets/dsgn_infra/04_MODULE/packager/WORLD_AXIS_LAYER_BINDING_SCHEMA_v1.json",
    "assets/dsgn_infra/04_MODULE/packager/EPISODE_LAYER_ACTIVATION_LOCK_v01912.md",
    "assets/dsgn_infra/04_MODULE/packager/EPISODE_LAYER_ACTIVATION_SCHEMA_v1.json",
    "assets/dsgn_infra/04_MODULE/packager/PROJECT_TAG_SEARCH_BINDING_LOCK_v01912.md",
    "assets/dsgn_infra/04_MODULE/packager/TAG_SEARCH_FULL_CONVERGENCE_LOCK_v01912.md",
    "assets/dsgn_infra/04_MODULE/packager/FULL_CONVERGENCE_SWEEP_LOCK_v0198.md",
    "assets/dsgn_infra/04_MODULE/tag_search/TAG_INDEX_MACHINE_SCHEMA_v1.json",
    "assets/dsgn_infra/03_REFERENCE/layer/layer_alias_to_current_keys_v0194.md",
    "assets/samples/SAMPLE_REFERENCES/WRITER_READY_CARD_TEMPLATE_V2.md",
    "assets/samples/SAMPLE_REFERENCES/WORK_PROFILE_TEMPLATE_V2.md",
    "assets/samples/SAMPLE_REFERENCES/BAND_PROFILE_TEMPLATE_V2.md",
    "assets/samples/SAMPLE_REFERENCES/CONNECTION_CARD_TEMPLATE_V2.md",
    "assets/samples/SAMPLE_REFERENCES/WRITING_FREEZE_CARD_TEMPLATE_V2.md",
    "assets/samples/SAMPLE_REFERENCES/ITEM_MANAGEMENT_TABLE_V2.md",
    "assets/samples/SAMPLE_REFERENCES/ZIP_STRUCTURE_V2.md",
    "assets/samples/SAMPLE_REFERENCES/REVERSE_EXTRACTION_CHECKLIST_V2.md",
    "assets/samples/SAMPLE_REFERENCES/READY_SAMPLE_NEKO_001_KAZENOTOORUHI.md",
    "assets/samples/SAMPLE_REFERENCES/READY_SAMPLE_NEKO_002_PURINHAHITOTSU.md",
    "assets/samples/SAMPLE_REFERENCES/READY_SAMPLE_NEKO_003_YUUGATAYONIKURUKO.md",
    "assets/samples/SAMPLE_REFRESH_INDEX_v019_4.md",
    "assets/dsgn_infra/01_ALWAYS_LIGHT/runtime/DSGN_RUNTIME_ACTIVATION_MATRIX_v1.md",
    "assets/dsgn_infra/01_ALWAYS_LIGHT/embed/DSGN_LAYER_EMBED_FIXATION_MATRIX_v1.md",
    "assets/dsgn_infra/01_ALWAYS_LIGHT/embed/DSGN_PURE_DESIGN_VS_LAYER_BOUNDARY_v1.md"
  ]
});

export const OPTIONAL_REFERENCE_ROUTES = Object.freeze({
  EXTERNAL_CONTEXT_SETUP: ["assets/operation_mount/COMMON_OPERATION_TEMPLATE_V1.md"],
  CARD_COMPARISON_FULL: ["assets/comparison/"],
  OPERATION_REVISION: [
    "assets/operation_mount/00_GATE/040_FILE_MAP.md",
    "assets/operation_mount/00_GATE/050_MANIFEST.md",
    "assets/operation_mount/00_GATE/060_REVISION_POLICY.md",
    "assets/operation_mount/00_GATE/070_CHANGELOG_V1.md",
    "assets/operation_mount/00_GATE/070_CHANGELOG_v0002.md",
    "assets/operation_mount/00_GATE/070_CHANGELOG_v0003.md",
    "assets/operation_mount/00_GATE/070_CHANGELOG_v0004.md",
    "assets/operation_mount/00_GATE/070_CHANGELOG_v0005.md",
    "assets/operation_mount/00_GATE/999_FILELIST_V1.tsv",
    "assets/operation_mount/00_GATE/999_FILELIST_v0003.tsv",
    "assets/operation_mount/00_GATE/999_FILELIST_v0004.tsv",
    "assets/operation_mount/00_GATE/999_FILELIST_v0005.tsv"
  ],
  EXTERNAL_CONTEXT_HISTORY_SHELF: ["assets/operation_mount/30_REFERENCE_LOGS/"],
  ESTABLISHMENT_CONTEXT: ["assets/operation_mount/30_REFERENCE_LOGS/"],
  RUNTIME_SOURCE_FLOOR_ARCHIVE: ["backpacks/MOUNT_TRANSFER_BACKPACK/source/"]
});

const issue = (path) => ({
  code: "OPERATION_READ_MISSING",
  path: "boot.readLedger",
  message: `${path}を作業開始前に実読する必要があります`,
  severity: "STOP"
});

export function requiredReads(operation) {
  return [...new Set([...ALWAYS_READ, ...(OPERATION_READS[operation] ?? [])])];
}

export function validateOperationReads(operation, ledger = []) {
  const records = new Map(ledger.map((entry) => [entry.path, entry]));
  const issues = (OPERATION_READS[operation] ?? [])
    .filter((path) => {
      const record = records.get(path);
      return record?.exists !== true || record?.read !== true;
    })
    .map(issue);
  return { decision: issues.length ? "STOP" : "PASS", moduleId: "LOAD_PLAN", issues };
}
