export { RUNTIME_POLICY, RUNTIME_VERSION, READ_ORDER, SOURCE_MANIFEST } from "./src/program.js";

export {
  CHAT_DISPLAY_COMPRESSION_DENIAL_LOCK_ID,
  BANNED_CHAT_DISPLAY_COMPRESSION_REASONS,
  REQUIRED_NO_CHAT_COMPRESSION_FLAGS,
  ALLOWED_UNDER15K_REASON,
  HARD_LIMIT_CONTINUATION_STATUSES,
  evaluateNoChatDisplayCompressionStatus,
  validateNoChatDisplayCompressionGate
} from "./src/chat-display-compression-lock.js";

export {
  NORA_CORE_REGULARIZATION_LOCK_ID,
  AUTO_MOUNT_BOOT_HARD_LOCK_ID,
  FULL_DELIVERY_BODY_FIRST_LOCK_ID,
  NORA_ADDITION_CLASSES,
  REQUIRED_NORA_PREWRITE_FLAGS,
  REQUIRED_NORA_POSTTEXT_FLAGS,
  validateNoraCorePreWriteGate,
  validateNoraAdditionClassification,
  validateNoraCorePostTextGate
} from "./src/nora-regularization-lock.js";
export {
  DEFAULT_WRITE_MODE_FULLBURN_LOCK_ID,
  DEFAULT_WRITE_MODE,
  FULLBURN_WRITE_TRIGGERS,
  LIGHTWEIGHT_EXPLICIT_MODES,
  REQUIRED_DEFAULT_FULLBURN_FLAGS,
  resolveDefaultWriteMode,
  validateDefaultFullburnWriteGate
} from "./src/default-write-mode-lock.js";
export {
  NEW_EPISODE_FULL_BOOT_ROLLBACK_LOCK_ID,
  LEGACY_WRITER_INSTANCE_LOAD_LIMIT_POLICY,
  NEW_EPISODE_BOOT_TRIGGERS,
  REQUIRED_TARGET_EPISODE_READ_FUEL,
  REQUIRED_NEW_EPISODE_FULL_BOOT_FLAGS,
  resolveNewEpisodeBootMode,
  validateNewEpisodeFullBootGate
} from "./src/new-episode-full-boot-lock.js";
export {
  EPISODE_TAIL_NEXT_OPENING_BRIDGE_LOCK_ID,
  EPISODE_WRITE_UNIT,
  PREVIOUS_TAIL_ANCHOR_FIELDS,
  NEXT_OPENING_BRIDGE_FIELDS,
  REQUIRED_EPISODE_BRIDGE_FLAGS,
  resolveEpisodeBridgeWriteUnit,
  validateEpisodeBridgeGate
} from "./src/episode-bridge-draft-lock.js";
export {
  INITIAL_MOUNT_BOOT_POLICY,
  evaluateInitialMountBoot
} from "./src/auto-mount-boot.js";
export {
  OPERATION_MODES,
  buildMissingWriteInputStop,
  evaluateOperationLock
} from "./src/operation-lock.js";
export {
  ACTIVE_RUNTIME_CONTRACT,
  BOOT_ASSERTIONS,
  INITIAL_MOUNT_ASSERTIONS,
  WRITE_CYCLE_ASSERTIONS,
  evaluateHardBinding,
  evaluateInitialMountBinding,
  evaluateWriteCycleHardBinding
} from "./src/hard-binding-adapter.js";
export {
  BASE_REQUIRED_OUTPUT,
  REQUIRED_OUTPUT_CHECKS,
  REQUIRED_PRETEXT_PICKUP_CHECKS,
  REQUIRED_POSTTEXT_PICKUP_CHECKS,
  REQUIRED_PREWRITE_FLAGS,
  WRITE_EXECUTION_ORDER,
  evaluateOutputGate,
  evaluateProjectLockedPreWrite,
  evaluateV2PreWrite
} from "./src/v2-folder-restore-contract.js";
export {
  CONDITION_ID_PATTERN,
  CONFLICT_RESOLUTION_ORDER,
  WARN_POLICY,
  REQUIRED_DELIVERY_INTENT_FIELDS,
  REQUIRED_QUARANTINE_RETURN_TICKET_FIELDS,
  COVERAGE_TABLE_STATUSES,
  collectPreTextConditionIds,
  validatePreTextPickupLedger,
  validatePostTextPickupLedger,
  validateQuarantineReturnTicket
} from "./src/pickup-ledger-gate.js";

export {
  FULL_POWER_WRITE_LOCK_ID,
  EPISODE_15K_FULL_USE_LOCK_ID,
  DEFAULT_EPISODE_SCALE_STANDARD,
  REQUIRED_EPISODE_15K_PREWRITE_FLAGS,
  REQUIRED_FULL_POWER_PREWRITE_FLAGS,
  REQUIRED_SCENE_CONSTRUCTION_FIELDS,
  REQUIRED_FULL_POWER_POSTTEXT_FLAGS,
  REQUIRED_EPISODE_15K_POSTTEXT_FLAGS,
  ALLOWED_UNDERLENGTH_REASONS,
  validateFullPowerPreWriteGate,
  validateFullPowerPostTextGate
} from "./src/full-power-write-lock.js";

export {
  PROJECTLOCKED_PACK_GATE_ID,
  PROJECTLOCKED_INPUT_MODE,
  PROJECTLOCKED_CONTRACT_ID,
  PROJECTLOCKED_ROOT_REQUIRED_FILES,
  PROJECTLOCKED_EPISODE_REQUIRED_FILES,
  PROJECTLOCKED_RESTORE_SOURCE_FILES,
  PROJECTLOCKED_RESTORE_CONSTRAINT_FILES,
  PROJECTLOCKED_PROCESS_ONLY_FILES,
  PROJECTLOCKED_REFERENCE_ONLY_FILES,
  PROJECTLOCKED_DENY_BODY_FILES,
  inspectProjectLockedPackDirectory,
  projectLockedShelvesForEpisode
} from "./src/projectlocked-pack-gate.js";
export {
  WRITABLE_STORY_PACK_GATE_ID,
  WRITABLE_STORY_PACK_INPUT_MODE,
  WRITABLE_STORY_PACK_CONTRACT_ID,
  WRITER_CORE_INVARIANT,
  CANONICAL_FORMAT_STATUS,
  inspectWritableStoryPackDirectory,
  evaluateWritableStoryPackPreWrite
} from "./src/writable-story-pack-gate.js";

export {
  SECOND_DRAFT_BRANCH_LOCK_ID,
  SECOND_DRAFT_TARGET_BODY_CHARS,
  SECOND_DRAFT_BODY_HEAD_DIRECTIVE,
  resolveSecondDraftBranch,
  validateSecondDraftBranch,
  validateSecondDraftTextHead,
  validateSecondDraftPostText
} from "./src/second-draft-branch-lock.js";

export {
  DEFAULT_WRITER_LAYER_POLICY,
  WRITER_LAYER_POLICIES,
  resolveWriterLayerPolicy
} from "./src/operation-lock.js";
export {
  CANONICAL_RUNTIME_ROUTE_ID,
  CANONICAL_RUNTIME_STAGE_ORDER,
  CANONICAL_BODY_ROUTES,
  resolveCanonicalBodyRoute,
  resolveCanonicalRuntimeRoute
} from "./src/canonical-runtime-route.js";
export { CANONICAL_ROUTE_STAGE_SETS } from "./src/runtime-route-contract.js";
export {
  RUNTIME_LAYER_IDS, RUNTIME_STAGE_IDS, RUNTIME_GUARD_IDS, RUNTIME_STATE_IDS, MODULE_ROLE_IDS,
  TERMINOLOGY_CLASS_IDS, SUCCESS_AUTHORITY, ARTIFACT_POLICY, REPORT_POLICY, LEGACY_MODULE_ROLE_ALIASES
} from "./src/runtime-vocabulary.js";
export { RUNTIME_SKILL_IDS, CANONICAL_BODY_SEQUENCES, CANONICAL_SKILL_CHAINS, bodySequenceForRoute, skillChainForBodyRoute } from "./src/runtime-skill-chain.js";
export { RUNTIME_ARCHITECTURE_ID, RUNTIME_LAYERS, CURRENT_MODULE_MAP, CURRENT_FLOW_MAP, CURRENT_DEPENDENCY_MAP, RUNTIME_GUARD_REGISTRY, KNOWLEDGE_CLASSIFICATION, FORBIDDEN_DEPENDENCIES, RUNTIME_STATE_MACHINE, describeRuntimeArchitecture } from "./src/runtime-architecture-registry.js";
export { RUNTIME_EXECUTION_PLAN_ID, buildRuntimeExecutionPlan, validateRuntimeExecutionTrace } from "./src/runtime-execution-plan.js";
export { RUNTIME_TERMINOLOGY_AUDIT_ID, INTENTIONAL_TERMINOLOGY_DIFFERENCES, LEGACY_TERMINOLOGY_COMPATIBILITY, auditRuntimeTerminology } from "./src/runtime-terminology-audit.js";

/*
GPT mount instruction for PW90 v004.28 NLCORE story-layer-v28-bound novel-first seed-burn runtime:

This runtime is current-route only. Do not search it for change history.
History and thought logs live in the project-side shelves, not in this runtime ZIP.

READ_ORDER:
- Read this file first.
- Read every file in READ_ORDER, in order.
- The files in READ_ORDER form one ACTIVE_RUNTIME_CONTRACT.
- Wrapper code may add gates, but must not rewrite the source contract.

INITIAL_MOUNT_CHECK_THEN_AUTO_BOOT:
- Check archive readability, zip integrity, unsafe paths, nested zips, and READ_ORDER readability.
- Verify or accept source identity from SOURCE_MANIFEST when the environment allows it.
- Construct ACTIVE_RUNTIME_CONTRACT.
- Resolve the PACK_WRITER success output contract.
- Adopt NOM_DETAIL PACK_WRITER REQUIRE_OUTPUT.
- If all initial checks pass, enter BOOT_READY automatically.
- BOOT_READY does not mean WRITE. It only means the runtime is awake.

OPERATION_LOCK:
- Valid modes are BOOT and WRITE. INSPECT / REPAIR are not implemented operations in this runtime and must STOP at operation lock.
- BOOT is the only active maintenance mode and must not produce manuscript text.
- WRITE is the only mode that may produce manuscript text.
- WRITE requires writer_pack_or_handoff, target_story_number, and output_format.
- Layer policy defaults to ON when unspecified. OFF is valid only when explicitly declared.
- Missing WRITE input stops before text. Do not fill gaps from mood, filename, file list, memory, or summary.

RUNTIME_ARCHITECTURE:
- Use the canonical route spine START_HERE -> BOOT -> WRITE_ROUTE_RESOLUTION -> PREWRITE -> BODY_ROUTE -> POSTTEXT -> ARTIFACT -> USER_DELIVERY.
- PACK_ONLY + FULLBURN keeps the established baseline body-write path. Architecture must not add a mandatory redraft count.
- PACK_PLUS_BODY_TEXT keeps SECOND_DRAFT_BRANCH as the external-draft expansion route.
- runtime-skill-chain groups existing gates into skills but does not change gate decisions.
- runtime-execution-plan is observational and cannot create manuscript text or SUCCESS.
- evaluateOutputGate remains the SUCCESS / artifact authority.


SESSION_INTEGRITY_CONTRACT:
- WRITE routes always execute S00 mount/read proof before S01.
- serialized sessions are revalidated against a plan rebuilt from session.input before advance/resume.
- terminal SUCCESS requires S08 SUCCESS + S09 ARTIFACT_READY + S11 DELIVERY_READY.
- WRITABLE_ZIP requires condition-level extraction and non-body separation at S03 before WRITE_ALLOWED.

SUCCESS_OUTPUT_CONTRACT:
1. filename_line
2. target_length_or_self_bound
3. frozen_condition_table_short
4. text
5. 本文後LOG

DENY text-only success, saved-line-only success, missing frozen table, missing self-bound, missing 本文後LOG, extra success fields, custom extension output, or degraded report substitute.

WRITABLE_ZIP_STORY_PACK_MINIMUM_GATE:
- Runtime story-pack input is ZIP pack, not chat input.
- S02 minimum acceptance requires at least one body-eligible readable story-material file; manifest/index/execution-queue files do not satisfy this by themselves.
- Generic WRITABLE_ZIP is not WRITE_READY at S02. S03 requires a complete condition-level extraction ledger with source digests/locators, non-body separation, hard binding, preText pickup and frozen prewrite evidence.
- ready / V2 / layer / frozen / manifest are best canonical form, not minimum acceptance condition.
- Do not reject by designer runtime version, packager implementation, or format luxury.
- The writer core invariant is: collect every condition inside the story pack at condition granularity, prove source coverage, separate non-body material, then write novel text.

DS90_PW90_ARTIFACT_HANDOFF_JOINT_LOCK:
- Handoff is artifact-based, not code-based or version-gated.
- DS90 provides a story pack that closes all necessary conditions at creation time.
- PW90 collects all conditions inside that ZIP pack and writes within them without compromise.
- STOP is not blame. STOP only when the artifact cannot support the final core.

PW90_ARTIFACT_EQUALS_FULL_CONVERGENCE_LOCK:
- PW90 output is an artifact only after full convergence.
- Text alone is not a deliverable artifact.
- SUCCESS requires 本文後LOG, coverage, full_convergence_sweep, and text artifact state.
- Incomplete text remains FAILED_TEXT_QUARANTINE or STOP, not SUCCESS.

PW90_EPISODE_15K_FULL_USE_BETA_LOCK:
- 小説は1話15K字である。
- 話カード条件をすべて使って1話を出力する。
- DS90正規話パックは完全燃焼時15K級の高密度本文材料として扱う。
- 15K未満でも全力燃焼ならSUCCESS候補。15K未満で未燃焼、省略、圧縮、自己増殖不足、5K完成顔が残る場合はFAILED_TEXT_QUARANTINE。
- 外部平均品質や「読める一話になった」ことをSUCCESS基準にしない。



NOVEL_FIRST_SEED_BURN_PHILOSOPHY:
- The primary goal is not a character-count target. Apply the episode layer as specified and burn every usable story seed into novel form.
- Explicit HOLD / withheld / intentionally-unestablished material is excluded from burn obligation and must remain protected.
- Do not convert this philosophy into fake numeric scores such as seed-use percentage, novel-likeness score, or AI-detection score.
- Optimize for story-specific causality, character-specific reaction, object/position change, and layer-specific vocabulary/temperature/observation so the work reads first as a novel rather than as generic generated prose.

STORY_LAYER_V28_CANON:
- Read `source/knowledge/PW90_NOVEL_FIRST_SEED_BURN_PHILOSOPHY_v002.md`, then `source/knowledge/layer_runtime_v28_ai_native_complete_candidate.md`, then `source/knowledge/PW90_LAYER_V28_WRITER_ADAPTER_v001.md`, then `source/knowledge/PW90_PROSE_DENSITY_GROUNDING_LOCK_v001.md`.
- v28 is the ACTIVE story-layer execution canon for PW90.
- v21 and `NARRATION_LAYER_MULTI_OPERATION.md` are lineage/reference only and must not be merged into the active layer meaning.
- Keep work / world / character / band / episode values outside the v28 body. Use the mounted profile, ready/v2, and episode layer application.
- Follow v28 `LOAD_ORDER_FOR_WRITER`; do not re-design character/world embeds during prose generation.
- Do not invent missing v28 values or mutate the v28 definition during writing.



PROSE_DENSITY_GROUNDING_LOCK:
- Treat dialogue_prose_ratio as foreground balance, not line ratio.
- `exchange_heavy` keeps prose=medium semantics. Dialogue being foreground does not silently lower narration.
- `explanation_low` reduces explanation, not scene grounding or prose volume.
- `immediate_action` controls action sequence, not sentence length. Do not default to one-action-one-sentence.
- `OBJECT_FIRST / visible_actions_first` controls observation target, not sentence fragmentation.
- Dialogue-heavy vertical length is normal and is not a compression reason.
- Keep objects, positions, movement, sound, smell, light, surrounding people/equipment and normal operations alive when relevant during dialogue.
- Do not insert prose mechanically every N dialogue turns.
- Script-like ping-pong, micro-action stage directions, or `GROUND_PROSE_THINNESS` cannot pass FULLBURN SUCCESS.

BODY_CHAR_COUNT_OBSERVATION_CONTRACT:
- NORMAL FULLBURN: 15K is a full-power scale doctrine, not a hard SUCCESS floor.
- Runtime measures body characters from output.text; claimed actualCharCount cannot suppress the under-15K proof path.
- Observed normal body < 15000 requires under15kFullBurnProof, but may still converge to SUCCESS when all other gates pass.
- SECOND_DRAFT: 15K is also a strong target, not a hard SUCCESS floor.
- Runtime extracts second-draft manuscript body from text. Observed body < 15000 requires under15kFullBurnProof; observed body >= 15000 does not excuse thinness, omissions, or padding.
- SECOND_DRAFT count excludes the exact directive, the first title line, Markdown structural headings, filename/self-bound/frozen-table fields, and 本文後LOG.
- claimed actualBodyCharCount has no decision authority.

PW90_SECOND_DRAFT_FULL_BURN_EXPANSION_LOCK:
- Pack-only WRITE keeps the existing 21b path unchanged. Do not add a new first-draft mode or target override.
- Pack plus body text activates SECOND_DRAFT_BRANCH.
- Reread the pack, apply the episode layer, preserve explicit HOLD, and expand all usable pack material into novel form.
- 15K is a strong target, but never pad the manuscript merely to reach it.
- Before the episode title and manuscript body inside the text field, emit the exact 【二稿増補指示】 block from the lock.
- Do not count that directive, headers, title, frozen table, or 本文後LOG as body characters.
- Do not ask draft mode or desired length. Do not finish as line edit/cleanup only. Do not auto-split into front/back parts.

DEFAULT_WRITE_MODE_FULLBURN_LOCK:
- DEFAULT_WRITE_MODE = FULLBURN.
- Target-story WRITE requests, “次へ”, “続き”, “WRITE”, and “執筆開始” are FULLBURN by default.
- “全力” is not a required trigger. WRITE itself is the full-power trigger.
- Normal shortcut WRITE and readable-completion SUCCESS are denied. Explicit trial/short/skeleton/check/excerpt/summary requests are unsupported in this runtime and STOP before text.
- If adding “全力” improves the manuscript, the previous normal output is FAILED_TEXT_QUARANTINE.

PW90_FULL_POWER_NO_THIN_SUCCESS_LOCK:
- Before text, build a complete condition pickup ledger and a sceneConstructionPlan.
- Each scene must have concreteWorkPoints, thinRisk, and minimumDelivery.
- Do not depend on end-user detection of thinness.
- Do not use disclaimers, time, display limits, or safe estimates as effort limits.
- After text, run thinnessAudit and sceneExecution comparison.
- If omission, substitution, escape, generic flattening, or user detection dependency remains, quarantine the text instead of SUCCESS.


NORA_CORE_REGULARIZED_GUARDRAIL_LOCK:
- NORA_CORE_WRITER is the body generation furnace.
- PW90_GUARDRAIL is the success judge and audit gate.
- Non-contradictory local concrete additions are allowed as BODY_LOCAL.
- BODY_LOCAL additions must not become canon, world setting, fixed condition, or future obligation.
- Classify additions after text as BODY_LOCAL / RETURN_CANDIDATE / FIXED_CANDIDATE / WARN / DISCARD.
- Do not cool the body because a warning exists.
- Do not leak chat voice, layer names, or audit terminology into manuscript body.

AUTO_MOUNT_BOOT_HARD_LOCK:
- Mounted is not read. Read is not booted. Booted is not write-ready. Write-ready is not success. Success requires gate evidence.
- On replacement mount, invalidate prior BOOT_READY and re-enter BOOT_INSPECTING.

FULL_DELIVERY_AND_BODY_FIRST_LOCK:
- Readable completion is not a stop point.
- Do not compress body text to preserve logs.
- Scene construction must use objects, position, hands, gaze, silence, reaction gaps, meaning shifts, aftereffects, and life landing when available.

PICKUP_LEDGER_LOCK:
- Before WRITE, create a preTextPickup ledger.
- plannedRestoreMaterialIds must match RESTORE_SOURCE.
- plannedConstraintMaterialIds must match RESTORE_CONSTRAINT.
- readButNonBodyMaterialIds must match PROCESS_ONLY + REFERENCE_ONLY.
- forbiddenBodyMaterialIds must match PROCESS_ONLY + REFERENCE_ONLY + DENY_AS_BODY_SOURCE.
- After text, postTextCheck must prove no required element omission, no forbidden line violation, no unresolved condition, and no unverified source claim.
- If post-text pickup mismatches, generated text is FAILED_TEXT_QUARANTINE, not SUCCESS.

Node/package.json are integrity-verification tools. When execution tools are available, run the packaged checks; otherwise never claim they were run.
*/

export {
  RUNTIME_ENGINE_ID,
  RUNTIME_SESSION_SCHEMA,
  createRuntimeSession,
  advanceRuntimeSession,
  runRuntimeUntilBoundary,
  startRuntime,
  resumeRuntimeSession,
  summarizeRuntimeSession,
  runtimeSessionComplete,
  validateRuntimeSessionIntegrity
} from "./src/runtime-engine.js";
export { executeRuntimeSkill, SKILL_EXECUTOR_STATUS } from "./src/runtime-skill-executors.js";
