import { CANONICAL_BODY_ROUTES, CANONICAL_RUNTIME_STAGE_ORDER } from "./runtime-route-contract.js";
import { CANONICAL_SKILL_CHAINS, RUNTIME_SKILL_IDS, skillChainForBodyRoute } from "./runtime-skill-chain.js";
import { LEGACY_MODULE_ROLE_ALIASES, MODULE_ROLE_IDS, RUNTIME_GUARD_IDS, RUNTIME_LAYER_IDS, RUNTIME_STATE_IDS } from "./runtime-vocabulary.js";
export const RUNTIME_ARCHITECTURE_ID = "PW90_RUNTIME_ARCHITECTURE_CONTRACT_EXECUTION_HARDENED";
export const RUNTIME_LAYERS = RUNTIME_LAYER_IDS;
const canonicalModuleMap = {
  [MODULE_ROLE_IDS.UPPER_ROUTER]: Object.freeze(["src/canonical-runtime-route.js#resolveCanonicalRuntimeRoute"]),
  [MODULE_ROLE_IDS.ROUTER]: Object.freeze(["src/canonical-runtime-route.js#resolveCanonicalBodyRoute", "src/default-write-mode-lock.js#resolveDefaultWriteMode", "src/second-draft-branch-lock.js#resolveSecondDraftBranch"]),
  [MODULE_ROLE_IDS.ROUTER_GUARD]: Object.freeze(["src/operation-lock.js#evaluateOperationLock", "src/operation-lock.js#resolveWriterLayerPolicy"]),
  [MODULE_ROLE_IDS.VOCABULARY_CONTRACT]: Object.freeze(["src/runtime-vocabulary.js"]),
  [MODULE_ROLE_IDS.ROUTE_CONTRACT]: Object.freeze(["src/runtime-route-contract.js"]),
  [MODULE_ROLE_IDS.SKILL_CHAIN_REGISTRY]: Object.freeze(["src/runtime-skill-chain.js"]),
  [MODULE_ROLE_IDS.ARCHITECTURE_REGISTRY]: Object.freeze(["src/runtime-architecture-registry.js"]),
  [MODULE_ROLE_IDS.EXECUTION_PLAN]: Object.freeze(["src/runtime-execution-plan.js", "src/runtime-engine.js"]),
  [MODULE_ROLE_IDS.SKILL_GATE]: Object.freeze([
    "src/runtime-skill-executors.js", "src/auto-mount-boot.js", "src/new-episode-full-boot-lock.js", "src/episode-bridge-draft-lock.js", "src/writable-story-pack-gate.js", "src/projectlocked-pack-gate.js", "src/v2-material-gate.js", "src/pickup-ledger-gate.js", "src/full-power-write-lock.js", "src/nora-regularization-lock.js", "src/second-draft-branch-lock.js"
  ]),
  [MODULE_ROLE_IDS.SUCCESS_ARTIFACT_ORCHESTRATOR]: Object.freeze(["src/v2-folder-restore-contract.js"]),
  [MODULE_ROLE_IDS.GLOBAL_CONTRACT]: Object.freeze(["src/program.js", "src/hard-binding-adapter.js", "src/chat-display-compression-lock.js", "src/prewrite-common-contract.js"]),
  [MODULE_ROLE_IDS.TERMINOLOGY_AUDIT]: Object.freeze(["src/runtime-terminology-audit.js"]),
  [MODULE_ROLE_IDS.VERIFICATION]: Object.freeze(["src/verify.js", "test/integrity.test.js", "test/runtime-engine.test.js", "test/runtime-contract-gaps.test.js"]),
  [MODULE_ROLE_IDS.UTILITY_ENTRY]: Object.freeze(["src/inspect-projectlocked-pack.js", "src/runtime-cli.js"]),
  [MODULE_ROLE_IDS.PUBLIC_ENTRY]: Object.freeze(["START_HERE.js"])
};
export const CURRENT_MODULE_MAP = (() => {
  const map = { ...canonicalModuleMap };
  for (const [legacyName, canonicalName] of Object.entries(LEGACY_MODULE_ROLE_ALIASES)) {
    Object.defineProperty(map, legacyName, { enumerable: false, configurable: false, get: () => map[canonicalName] });
  }
  return Object.freeze(map);
})();
export const CURRENT_FLOW_MAP = Object.freeze({
  executionPlanBuilder: "src/runtime-execution-plan.js#buildRuntimeExecutionPlan",
  stages: CANONICAL_RUNTIME_STAGE_ORDER,
  maintenanceModes: Object.freeze(["BOOT"]),
  maintenanceBodyRoute: CANONICAL_BODY_ROUTES.MAINTENANCE,
  writeBodyRoutes: Object.freeze([CANONICAL_BODY_ROUTES.PACK_ONLY_FULLBURN, CANONICAL_BODY_ROUTES.PACK_PLUS_BODY_TEXT]),
  skillChains: CANONICAL_SKILL_CHAINS
});
export const CURRENT_DEPENDENCY_MAP = Object.freeze({
  UPPER_ROUTER: Object.freeze(["ROUTER", "ROUTER_GUARD"]),
  ROUTER: Object.freeze(["ROUTING_POLICY", "SKILL_SELECTION"]),
  EXECUTION_PLAN: Object.freeze(["UPPER_ROUTER", "SKILL_CHAIN_REGISTRY", "CONTRACT_GUARD", "SUCCESS_ARTIFACT_ORCHESTRATOR"]),
  SKILL: Object.freeze(["CONTRACT_GUARD"]),
  CONTRACT_GUARD: Object.freeze(["ROUTER_OUTPUT_VALIDATION", "SKILL_OUTPUT_VALIDATION"]),
  SUCCESS_ARTIFACT_ORCHESTRATOR: Object.freeze(["CONTRACT_GUARD", "ARTIFACT_STATE"])
});
export const RUNTIME_GUARD_REGISTRY = Object.freeze({
  [RUNTIME_GUARD_IDS.SOURCE_INTEGRITY]: Object.freeze(["src/program.js", "src/verify.js"]),
  [RUNTIME_GUARD_IDS.OPERATION_LOCK]: Object.freeze(["src/operation-lock.js"]),
  [RUNTIME_GUARD_IDS.AUTO_MOUNT_BOOT_HARD_LOCK]: Object.freeze(["src/auto-mount-boot.js", "src/hard-binding-adapter.js"]),
  [RUNTIME_GUARD_IDS.DEFAULT_FULLBURN]: Object.freeze(["src/default-write-mode-lock.js"]),
  [RUNTIME_GUARD_IDS.NO_THIN_SUCCESS]: Object.freeze(["src/full-power-write-lock.js"]),
  [RUNTIME_GUARD_IDS.EPISODE_15K_FULL_USE]: Object.freeze(["src/full-power-write-lock.js"]),
  [RUNTIME_GUARD_IDS.CHAT_DISPLAY_COMPRESSION_DENIAL]: Object.freeze(["src/chat-display-compression-lock.js"]),
  [RUNTIME_GUARD_IDS.BODY_LOCAL_BOUNDARY]: Object.freeze(["src/nora-regularization-lock.js"]),
  [RUNTIME_GUARD_IDS.SECOND_DRAFT_BOUNDARY]: Object.freeze(["src/second-draft-branch-lock.js"]),
  [RUNTIME_GUARD_IDS.OUTPUT_CONTRACT]: Object.freeze(["src/v2-folder-restore-contract.js"]),
  [RUNTIME_GUARD_IDS.FULL_CONVERGENCE]: Object.freeze(["src/pickup-ledger-gate.js", "src/v2-folder-restore-contract.js"]),
  [RUNTIME_GUARD_IDS.LAYER_DEFAULT]: Object.freeze(["src/operation-lock.js", "source/knowledge/WRITER_COMMON_NOM_CORE_v2.md"])
});
export const KNOWLEDGE_CLASSIFICATION = Object.freeze({
  "source/knowledge/PW90_NOVEL_FIRST_SEED_BURN_PHILOSOPHY_v002.md": Object.freeze(["NATURAL_LANGUAGE_PHILOSOPHY", "QUALITY_INTENT"]),
  "source/knowledge/layer_runtime_v28_ai_native_complete_candidate.md": Object.freeze(["STORY_LAYER_CANON", "AI_NATIVE_LAYER_RUNTIME"]),
  "source/knowledge/PW90_LAYER_V28_WRITER_ADAPTER_v001.md": Object.freeze(["STORY_LAYER_WRITER_ADAPTER", "ROUTE_BOUNDARY_SPEC"]),
  "source/knowledge/PW90_PROSE_DENSITY_GROUNDING_LOCK_v001.md": Object.freeze(["GUARD_SPEC", "PROSE_INTERPRETATION_LOCK"]),
  "source/knowledge/PW90_NOVEL_FIRST_SEED_BURN_PHILOSOPHY_v001.md": Object.freeze(["LINEAGE_REFERENCE"]),
  "source/knowledge/PW90_SECOND_DRAFT_FULL_BURN_EXPANSION_LOCK_v001.md": Object.freeze(["SKILL_SPEC", "ROUTE_BOUNDARY_SPEC"]),
  "source/knowledge/PW90_DEFAULT_WRITE_MODE_FULLBURN_LOCK_v001.md": Object.freeze(["ROUTER_POLICY", "GUARD_SPEC"]),
  "source/knowledge/PW90_NEW_EPISODE_FULL_BOOT_ROLLBACK_LOCK_v001.md": Object.freeze(["SKILL_SPEC"]),
  "source/knowledge/PW90_ARTIFACT_EQUALS_FULL_CONVERGENCE_LOCK_v001.md": Object.freeze(["CONTRACT_SPEC"]),
  "source/knowledge/PW90_FULL_POWER_NO_THIN_SUCCESS_LOCK_v001.md": Object.freeze(["GUARD_SPEC"]),
  "source/knowledge/PW90_CHAT_DISPLAY_COMPRESSION_DENIAL_LOCK_v001.md": Object.freeze(["GUARD_SPEC"]),
  "source/knowledge/PW90_DS90_ARTIFACT_HANDOFF_JOINT_LOCK_v001.md": Object.freeze(["HANDOFF_SPEC"]),
  "source/knowledge/NARRATION_LAYER_MULTI_OPERATION.md": Object.freeze(["LINEAGE_REFERENCE"]),
  "source/knowledge/話レイヤー再定義版_マルチ運用_v21_既存例統合_心理内圧_年齢性別_描写没入快感.md": Object.freeze(["LINEAGE_REFERENCE"]),
  "source/knowledge/WRITER_COMMON_NOM_CORE_v2.md": Object.freeze(["GLOBAL_CONTRACT", "LAYER_DEFAULT_CONTRACT"])
});
export const FORBIDDEN_DEPENDENCIES = Object.freeze([
  "SKILL_TO_UPPER_ROUTER_DECISION_REWRITE",
  "GUARD_TO_ALTERNATE_BODY_ROUTE_CREATION",
  "ARCHITECTURE_TO_WRITE_BEHAVIOR_MUTATION",
  "ARTIFACT_TO_MISSING_AUDIT_FORGIVENESS"
]);
export const RUNTIME_STATE_MACHINE = Object.freeze({
  states: Object.freeze(Object.values(RUNTIME_STATE_IDS)),
  forbiddenTransitions: Object.freeze([
    "BOOT_READY_TO_SUCCESS",
    "WRITE_IN_PROGRESS_TO_ARTIFACT_READY",
    "FAILED_TEXT_QUARANTINE_TO_SUCCESS_WITHOUT_REPROCESSING",
    "PACK_PLUS_BODY_TEXT_TO_PACK_ONLY_WRITE_AS_SECOND_DRAFT_REPLACEMENT"
  ])
});
export function describeRuntimeArchitecture(routeResolution = {}) {
  const skillChain = skillChainForBodyRoute(routeResolution.bodyRoute);
  if (skillChain == null) return Object.freeze({ architectureId: RUNTIME_ARCHITECTURE_ID, decision: "ARCHITECTURE_DESCRIPTION_UNAVAILABLE", bodyRoute: routeResolution.bodyRoute ?? null, skillChain: null });
  return Object.freeze({ architectureId: RUNTIME_ARCHITECTURE_ID, decision: "ARCHITECTURE_DESCRIBED", routeDecision: routeResolution.decision ?? null, bodyRoute: routeResolution.bodyRoute, skillChain, createsSuccess: false, mutatesRoute: false, changesWriteBehavior: false });
}
export { RUNTIME_SKILL_IDS };
