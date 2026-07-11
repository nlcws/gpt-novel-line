export const ALWAYS_READ = Object.freeze([
  "START_HERE.js",
  "src/runtime/mental-runtime.js",
  "src/runtime/types.js",
  "src/runtime/rule.js",
  "src/validation/designerGates.js",
  "src/assets.js",
  "src/profiles/narrationBase.js",
  "src/modules/core.js",
  "assets/specs/090_DS_CORE.md",
  "assets/specs/DESIGNER_COMMON_GATES_v019.md",
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
  "assets/operation_mount/00_GATE/000_START_HERE.md",
  "assets/operation_mount/00_GATE/010_REQUIRED_READING.md",
  "assets/operation_mount/00_GATE/020_REFERENCE_PRIORITY.md",
  "assets/operation_mount/00_GATE/030_VERSION_STATUS.md",
  "assets/operation_mount/00_GATE/080_WRITING_SIDE_ACCEPTANCE_V1.md",
  "assets/operation_mount/00_GATE/081_DESIGN_SIDE_ACCEPTANCE_V1.md",
  "assets/operation_mount/00_GATE/082_JOINT_FINAL_ACCEPTANCE_V1.md",
  "assets/operation_mount/10_CANON/100_SHARED_ABSOLUTE_GUIDELINE.md",
  "assets/operation_mount/10_CANON/105_USER_DECLARATION.md",
  "assets/operation_mount/10_CANON/110_JOINT_DECLARATION.md",
  "assets/operation_mount/10_CANON/120_SHARED_PROCESS_CONTRACT.md",
  "assets/operation_mount/10_CANON/125_WRITING_SIDE_VERIFICATION_LANE.md",
  "assets/operation_mount/10_CANON/150_STANDARD_CARD_SPEC.md",
  "assets/dsgn_infra/00_MANIFEST/current/DSGN_CURRENT_PACKAGE_MANIFEST_v1.md",
  "assets/dsgn_infra/00_MANIFEST/current/DSGN_CURRENT_PACKAGE_TAG_MAP_v1.json",
  "assets/dsgn_infra/00_MANIFEST/current/DSGN_CURRENT_PACKAGE_LOAD_ORDER_v1.md",
  "assets/dsgn_infra/00_MANIFEST/current/DSGN_CURRENT_PACKAGE_CONVERGED_GUARD_v1.md",
  "assets/dsgn_infra/01_ALWAYS_LIGHT/namespace/DSGN_INTERNAL_NAMING_NAMESPACE_v1.md",
  "assets/dsgn_infra/01_ALWAYS_LIGHT/index/DSGN_INTERNAL_ALL_ITEM_INDEX_v1.md",
  "assets/dsgn_infra/01_ALWAYS_LIGHT/index/DSGN_ROLE_INDEX_v1.md",
  "assets/dsgn_infra/01_ALWAYS_LIGHT/index/designer_canonical_tag_registry_v1.md",
  "assets/dsgn_infra/01_ALWAYS_LIGHT/index/designer_reverse_lookup_index_v1.md",
  "assets/dsgn_infra/01_ALWAYS_LIGHT/protocol/designer_lookup_protocol_v1.md",
  "assets/dsgn_infra/01_ALWAYS_LIGHT/runtime/DSGN_RUNTIME_OPERATION_CONDITIONS_v1.md",
  "assets/dsgn_infra/01_ALWAYS_LIGHT/runtime/DSGN_RUNTIME_ACTIVATION_MATRIX_v1.md",
  "assets/dsgn_infra/01_ALWAYS_LIGHT/runtime/DSGN_OPERATION_CONVERGED_GUARD_v1.md",
  "assets/dsgn_infra/01_ALWAYS_LIGHT/embed/DSGN_LAYER_EMBED_FIXATION_MATRIX_v1.md",
  "assets/dsgn_infra/01_ALWAYS_LIGHT/embed/DSGN_DESIGN_LAYER_ANCHOR_SCHEMA_v1.md",
  "assets/dsgn_infra/01_ALWAYS_LIGHT/embed/DSGN_LAYER_EMBED_BACKLOG_FLOW_v1.md",
  "assets/dsgn_infra/01_ALWAYS_LIGHT/embed/DSGN_LAYER_EMBED_PLACEMENT_POLICY_v1.md",
  "assets/dsgn_infra/01_ALWAYS_LIGHT/embed/DSGN_PURE_DESIGN_VS_LAYER_BOUNDARY_v1.md"
]);

const issue = (code, path, message) => ({ code, path, message, severity: "STOP" });

export function validateBoot(input) {
  const issues = [];
  const ledger = input.boot?.readLedger ?? [];
  for (const path of ALWAYS_READ) {
    const record = ledger.find((entry) => entry.path === path);
    if (!record || record.exists !== true || record.read !== true) {
      issues.push(issue("ALWAYS_READ_MISSING", "boot.readLedger", `${path}を毎回実読する必要があります`));
    }
  }
  if (input.project?.present === true) {
    const gate = input.project?.gate021;
    if (!gate?.path || gate.exists !== true || gate.read !== true) {
      issues.push(issue("GATE_021_UNREAD", "externalContext.gate021", "021を自動探索して実読する必要があります"));
    }
    for (const ref of gate?.readOrderRefs ?? []) {
      if (!ref?.path || ref.exists !== true || ref.read !== true) {
        issues.push(issue("EXTERNAL_CONTEXT_READ_ORDER_UNRESOLVED", "externalContext.gate021.readOrderRefs",
          "021の読む順をすべて解決・実読する必要があります"));
      }
    }
  }
  return { issues };
}
