import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { READ_ORDER, RUNTIME_POLICY, RUNTIME_VERSION, SOURCE_MANIFEST } from "../src/program.js";
import {
  ACTIVE_RUNTIME_CONTRACT,
  BOOT_ASSERTIONS,
  INITIAL_MOUNT_ASSERTIONS,
  WRITE_CYCLE_ASSERTIONS,
  evaluateHardBinding,
  evaluateInitialMountBinding,
  evaluateWriteCycleHardBinding
} from "../src/hard-binding-adapter.js";
import { INITIAL_MOUNT_BOOT_POLICY, evaluateInitialMountBoot } from "../src/auto-mount-boot.js";
import {
  buildMissingWriteInputStop,
  evaluateOperationLock
} from "../src/operation-lock.js";
import { calculateMapDigest } from "../src/v2-material-gate.js";
import {
  WRITE_EXECUTION_ORDER,
  REQUIRED_OUTPUT_CHECKS,
  REQUIRED_PRETEXT_PICKUP_CHECKS,
  REQUIRED_POSTTEXT_PICKUP_CHECKS,
  REQUIRED_PREWRITE_FLAGS,
  evaluateOutputGate,
  evaluateProjectLockedPreWrite,
  evaluateV2PreWrite
} from "../src/v2-folder-restore-contract.js";
import {
  CONFLICT_RESOLUTION_ORDER,
  WARN_POLICY,
  REQUIRED_QUARANTINE_RETURN_TICKET_FIELDS,
  REQUIRED_FULL_CONVERGENCE_SWEEP_FLAGS,
  collectPreTextConditionIds
} from "../src/pickup-ledger-gate.js";
import {
  FULL_POWER_WRITE_LOCK_ID,
  EPISODE_15K_FULL_USE_LOCK_ID,
  DEFAULT_EPISODE_SCALE_STANDARD,
  REQUIRED_EPISODE_15K_PREWRITE_FLAGS,
  REQUIRED_FULL_POWER_PREWRITE_FLAGS,
  REQUIRED_FULL_POWER_POSTTEXT_FLAGS,
  REQUIRED_EPISODE_15K_POSTTEXT_FLAGS,
  validateFullPowerPreWriteGate,
  validateFullPowerPostTextGate
} from "../src/full-power-write-lock.js";

import {
  NORA_CORE_REGULARIZATION_LOCK_ID,
  AUTO_MOUNT_BOOT_HARD_LOCK_ID,
  FULL_DELIVERY_BODY_FIRST_LOCK_ID,
  validateNoraCorePreWriteGate,
  validateNoraCorePostTextGate
} from "../src/nora-regularization-lock.js";

import {
  DEFAULT_WRITE_MODE_FULLBURN_LOCK_ID,
  DEFAULT_WRITE_MODE,
  resolveDefaultWriteMode,
  validateDefaultFullburnWriteGate
} from "../src/default-write-mode-lock.js";

import {
  NEW_EPISODE_FULL_BOOT_ROLLBACK_LOCK_ID,
  LEGACY_WRITER_INSTANCE_LOAD_LIMIT_POLICY,
  resolveNewEpisodeBootMode,
  validateNewEpisodeFullBootGate
} from "../src/new-episode-full-boot-lock.js";

import {
  EPISODE_TAIL_NEXT_OPENING_BRIDGE_LOCK_ID,
  EPISODE_WRITE_UNIT,
  resolveEpisodeBridgeWriteUnit,
  validateEpisodeBridgeGate
} from "../src/episode-bridge-draft-lock.js";

import {
  CHAT_DISPLAY_COMPRESSION_DENIAL_LOCK_ID,
  ALLOWED_UNDER15K_REASON,
  evaluateNoChatDisplayCompressionStatus,
  validateNoChatDisplayCompressionGate
} from "../src/chat-display-compression-lock.js";

import {
  PROJECTLOCKED_INPUT_MODE,
  PROJECTLOCKED_CONTRACT_ID,
  PROJECTLOCKED_ROOT_REQUIRED_FILES,
  PROJECTLOCKED_ROOT_REQUIRED_SHELVES,
  inspectProjectLockedPackDirectory
} from "../src/projectlocked-pack-gate.js";
import {
  WRITABLE_STORY_PACK_INPUT_MODE,
  WRITER_CORE_INVARIANT,
  inspectWritableStoryPackDirectory,
  evaluateWritableStoryPackPreWrite
} from "../src/writable-story-pack-gate.js";

import {
  SECOND_DRAFT_BRANCH_LOCK_ID,
  SECOND_DRAFT_MIN_BODY_CHARS,
  SECOND_DRAFT_BODY_HEAD_DIRECTIVE,
  resolveSecondDraftBranch,
  validateSecondDraftBranch,
  validateSecondDraftTextHead,
  validateSecondDraftPostText
} from "../src/second-draft-branch-lock.js";

test("runtime version and policy are repair locked", () => {
  assert.equal(RUNTIME_VERSION, "pw90-v004.21c-second-draft-15k-final");
  assert.equal(RUNTIME_POLICY.originalSourceMutationAllowed, false);
  assert.equal(RUNTIME_POLICY.customPackExtensionAllowed, false);
  assert.equal(RUNTIME_POLICY.degradedTextAllowed, false);
  assert.equal(RUNTIME_POLICY.operationModesSeparated, true);
  assert.equal(RUNTIME_POLICY.initialMountCheckRequired, true);
  assert.equal(RUNTIME_POLICY.autoBootAfterMountCheckPass, true);
  assert.equal(RUNTIME_POLICY.userBootCommandRequired, false);
  assert.equal(RUNTIME_POLICY.autoWriteAfterBoot, false);
  assert.equal(RUNTIME_POLICY.projectLockedPackGateEnabled, true);
  assert.equal(RUNTIME_POLICY.materialMapRequiredForProjectLockedPack, false);
  assert.equal(RUNTIME_POLICY.pickupLedgerGateEnabled, true);
  assert.equal(RUNTIME_POLICY.postTextPickupCheckRequired, true);
  assert.equal(RUNTIME_POLICY.reciprocalHandoffRespectLockEnabled, true);
  assert.equal(RUNTIME_POLICY.endUserHeatDeliveryLockEnabled, true);
  assert.equal(RUNTIME_POLICY.coverageIdLockEnabled, true);
  assert.equal(RUNTIME_POLICY.fullConvergenceSweepLockEnabled, true);
  assert.equal(RUNTIME_POLICY.writableZipStoryPackMinimumGateEnabled, true);
  assert.equal(RUNTIME_POLICY.chatInputAsStoryPackAccepted, false);
  assert.equal(RUNTIME_POLICY.rejectWritablePackByDesignerVersion, false);
  assert.equal(RUNTIME_POLICY.rejectWritablePackByFormatLuxury, false);
  assert.equal(RUNTIME_POLICY.writerCoreCollectAllPackConditions, true);
  assert.equal(RUNTIME_POLICY.novelLineFinalCoreLocked, true);
  assert.equal(RUNTIME_POLICY.fourRuntimeRespectEqual, true);
  assert.equal(RUNTIME_POLICY.ds90Pw90ArtifactHandoffJointLockEnabled, true);
  assert.equal(RUNTIME_POLICY.writerAcceptanceArtifactBasedNotVersionGated, true);
  assert.equal(RUNTIME_POLICY.writerArtifactEqualsFullConvergenceLocked, true);
  assert.equal(RUNTIME_POLICY.writerSuccessRequiresTextArtifact, true);
  assert.equal(RUNTIME_POLICY.fullPowerNoThinSuccessLockEnabled, true);
  assert.equal(RUNTIME_POLICY.prewriteSceneConstructionPlanRequired, true);
  assert.equal(RUNTIME_POLICY.posttextThinnessAuditRequired, true);
  assert.equal(RUNTIME_POLICY.endUserThinnessDetectionDependencyDenied, true);
  assert.equal(RUNTIME_POLICY.safetyCaveatAsEffortLimitDenied, true);
  assert.equal(RUNTIME_POLICY.betaVersionManagementEnabled, true);
  assert.equal(RUNTIME_POLICY.episode15kFullUseBetaLockEnabled, true);
  assert.equal(RUNTIME_POLICY.defaultEpisodeScale15k, true);
  assert.equal(RUNTIME_POLICY.storyCardAllConditionsFullUseRequired, true);
  assert.equal(RUNTIME_POLICY.ds90Pack15kFullBurnBaselineEnabled, true);
  assert.equal(RUNTIME_POLICY.externalAverageSuccessComparisonDenied, true);
  assert.equal(RUNTIME_POLICY.under15kRequiresFullBurnProof, true);
  assert.equal(RUNTIME_POLICY.chatDisplayCompressionDenialLockEnabled, true);
  assert.equal(RUNTIME_POLICY.chatDisplayCompressionAsUnderlengthReasonDenied, true);
  assert.equal(RUNTIME_POLICY.naturalCompressionAsSuccessReasonDenied, true);
  assert.equal(RUNTIME_POLICY.platformHardLimitRequiresTruncateOrSplitStatus, true);
  assert.equal(RUNTIME_POLICY.recursiveConditionUseRequired, true);
  assert.equal(RUNTIME_POLICY.readableFiveKCompletionShortcutDenied, true);
  assert.equal(RUNTIME_POLICY.defaultWriteModeFullburnLockEnabled, true);
  assert.equal(RUNTIME_POLICY.defaultWriteMode, "FULLBURN");
  assert.equal(RUNTIME_POLICY.fullburnRequiresEmphasisWord, false);
  assert.equal(RUNTIME_POLICY.normalWriteShortcutDenied, true);
  assert.equal(RUNTIME_POLICY.lightweightWriteRequiresExplicitUserRequest, true);
  assert.equal(RUNTIME_POLICY.successAtReadableCompletionDenied, true);
  assert.equal(RUNTIME_POLICY.newEpisodeFullBootRollbackLockEnabled, true);
  assert.equal(RUNTIME_POLICY.legacyWriterInstanceLoadLimitCurrentBasis, false);
  assert.equal(RUNTIME_POLICY.writerInstanceLoadLimitLegacyOnly, true);
  assert.equal(RUNTIME_POLICY.newEpisodeBootGateMisfireDiagnosisEnabled, true);
  assert.equal(RUNTIME_POLICY.nextContinueWriteRequiresNewEpisodeFullBoot, true);
  assert.equal(RUNTIME_POLICY.previousEpisodeInertiaCarryoverDenied, true);
  assert.equal(RUNTIME_POLICY.targetEpisodeRereadEachWriteRequired, true);
  assert.equal(RUNTIME_POLICY.fixedConditionTableRegenerationEachWriteRequired, true);
  assert.equal(RUNTIME_POLICY.minimalContinuityOnlyReinjected, true);
  assert.equal(RUNTIME_POLICY.newEpisodeBootGateMisfireQuarantinesText, true);
  assert.equal(RUNTIME_POLICY.episodeTailNextOpeningBridgeLockEnabled, true);
  assert.equal(RUNTIME_POLICY.episodeWriteUnit, "CURRENT_EPISODE_FULLBURN_PLUS_NEXT_OPENING_BRIDGE");
  assert.equal(RUNTIME_POLICY.previousTailAnchorRequiredAfterClear, true);
  assert.equal(RUNTIME_POLICY.previousFullTextInertiaAllowed, false);
  assert.equal(RUNTIME_POLICY.nextEpisodeOpeningBridgeRequired, true);
  assert.equal(RUNTIME_POLICY.nextOpeningBridgeStatus, "HANDOFF_ONLY_NOT_CANON");
  assert.equal(RUNTIME_POLICY.nextOpeningCountsAsCurrentEpisodeText, false);
  assert.equal(RUNTIME_POLICY.nextOpeningReplacesNextEpisodePackReread, false);
  assert.equal(RUNTIME_POLICY.secondDraftBranchLockEnabled, true);
  assert.equal(RUNTIME_POLICY.packOnlyWritePath, "KEEP_21B_UNCHANGED");
  assert.equal(RUNTIME_POLICY.packOnlyFirstDraftOverrideAllowed, false);
  assert.equal(RUNTIME_POLICY.packOnlyTargetLengthOverrideAllowed, false);
  assert.equal(RUNTIME_POLICY.packPlusBodyTextActivatesSecondDraft, true);
  assert.equal(RUNTIME_POLICY.secondDraftRequiresPackReread, true);
  assert.equal(RUNTIME_POLICY.secondDraftMinBodyChars, 15000);
  assert.equal(RUNTIME_POLICY.secondDraftBodyHeadDirectiveRequired, true);
  assert.equal(RUNTIME_POLICY.secondDraftLineEditOnlyDenied, true);
  assert.equal(RUNTIME_POLICY.secondDraftAutoSplitDenied, true);
});

test("all source files are present in original read order", () => {
  assert.deepEqual(READ_ORDER, SOURCE_MANIFEST.map((entry) => entry.path));
  assert.equal(SOURCE_MANIFEST.length, 20);
});

for (const expected of SOURCE_MANIFEST) {
  test(`${expected.path} is byte-identical to the base source`, () => {
    const url = new URL(`../${expected.path}`, import.meta.url);
    const content = readFileSync(url);
    const hash = createHash("sha256").update(content).digest("hex").toUpperCase();
    assert.equal(statSync(url).size, expected.bytes);
    assert.equal(hash, expected.sha256);
  });
}


test("second draft branch leaves pack-only 21b path untouched", () => {
  const gate = resolveSecondDraftBranch({ hasWritableStoryPack: true });
  assert.equal(gate.decision, "KEEP_21B_WRITE_PATH");
  assert.equal(gate.secondDraftBranch, "INACTIVE");
  assert.equal(gate.inputBasis, "PACK_ONLY");
  assert.equal(gate.firstDraftOverride, false);
  assert.equal(gate.targetLengthOverride, null);
  assert.equal(gate.bodyHeadDirective, null);
  assert.deepEqual(validateSecondDraftBranch({ gate }), []);
});

test("pack plus body text activates second draft 15K expansion and exact body-head directive", () => {
  const lock = readFileSync(new URL("../source/knowledge/PW90_SECOND_DRAFT_BRANCH_15K_EXPANSION_LOCK_v001.md", import.meta.url), "utf8");
  assert.equal(SECOND_DRAFT_BRANCH_LOCK_ID, "PW90_SECOND_DRAFT_BRANCH_15K_EXPANSION_LOCK");
  assert.equal(SECOND_DRAFT_MIN_BODY_CHARS, 15000);
  assert.ok(lock.includes("話パックのみ = 21b通常WRITEをそのまま使う"));
  assert.ok(lock.includes("話パック + 本文TXT = 二稿増補分岐"));
  assert.ok(lock.includes("【二稿増補指示】"));
  assert.ok(READ_ORDER.includes("source/knowledge/PW90_SECOND_DRAFT_BRANCH_15K_EXPANSION_LOCK_v001.md"));

  const gate = resolveSecondDraftBranch({ hasWritableStoryPack: true, hasBodyTxt: true });
  assert.equal(gate.decision, "WRITE_SECOND_DRAFT");
  assert.equal(gate.secondDraftBranch, "ACTIVE");
  assert.equal(gate.inputBasis, "PACK_PLUS_BODY_TEXT");
  assert.equal(gate.bodyTextRole, "EXISTING_DRAFT_TO_EXPAND");
  assert.equal(gate.packRereadRequired, true);
  assert.equal(gate.minBodyChars, 15000);
  assert.equal(gate.bodyHeadDirective, SECOND_DRAFT_BODY_HEAD_DIRECTIVE);
  assert.equal(gate.askUserForDraftMode, false);
  assert.equal(gate.askUserForLength, false);
  assert.equal(gate.splitIntoPartsByDefault, false);
  assert.match(gate.targetLengthOrSelfBound, /15K字以上まで増やす/);
  assert.deepEqual(validateSecondDraftBranch({ gate }), []);

  const text = `${SECOND_DRAFT_BODY_HEAD_DIRECTIVE}

# 第081話　白い息の苦情

本文`;
  assert.deepEqual(validateSecondDraftTextHead(text), []);
  assert.notDeepEqual(validateSecondDraftTextHead(`# 第081話
本文`), []);
});

test("second draft posttext gate rejects under 15K and accepts expanded 15K body", () => {
  const common = {
    secondDraftBranch: "ACTIVE",
    inputBasis: "PACK_PLUS_BODY_TEXT",
    bodyTextRole: "EXISTING_DRAFT_TO_EXPAND",
    packReread: "PASS",
    bodyHeadDirective: "PASS",
    expandedScenes: ["scene-03", "scene-05"],
    newlyRecoveredPackConditions: ["fixed-layer", "heat-layer"],
    stillThinRisk: false,
    finalDecision: "SUCCESS_CANDIDATE_AFTER_SECOND_DRAFT_EXPANSION"
  };
  const under = validateSecondDraftPostText({ gate: { ...common, actualBodyCharCount: 14999 } });
  assert.ok(under.some((entry) => entry.code === "SECOND_DRAFT_BODY_UNDER_15K"));
  assert.deepEqual(validateSecondDraftPostText({ gate: { ...common, actualBodyCharCount: 15000 } }), []);
});

test("default write mode is fullburn without emphasis word", () => {
  assert.equal(DEFAULT_WRITE_MODE_FULLBURN_LOCK_ID, "PW90_DEFAULT_WRITE_MODE_FULLBURN_LOCK");
  assert.equal(DEFAULT_WRITE_MODE, "FULLBURN");
  const normal = resolveDefaultWriteMode({ trigger: "story_number_request" });
  assert.equal(normal.decision, "FULLBURN_WRITE_REQUIRED");
  assert.equal(normal.writeMode, "FULLBURN");
  assert.equal(normal.fullburnRequiresEmphasisWord, false);
  const emphasized = resolveDefaultWriteMode({ trigger: "story_number_request", userRequestedFullPowerWord: true });
  assert.equal(emphasized.priorNormalWriteShouldQuarantineIfImprovedByFullPowerWord, true);
  const light = resolveDefaultWriteMode({ trigger: "story_number_request", explicitLightweightMode: "trial" });
  assert.equal(light.decision, "LIGHTWEIGHT_WRITE_ALLOWED_BY_EXPLICIT_USER_REQUEST");
});

test("default fullburn gate rejects normal write shortcut", () => {
  const failures = validateDefaultFullburnWriteGate({
    gate: {
      defaultWriteMode: "FULLBURN",
      fullburnRequiresEmphasisWord: false,
      normalWriteAllowed: false,
      lightweightWithoutExplicitUserRequestAllowed: false,
      successAtReadableCompletionAllowed: false,
      flags: {
        defaultWriteModeIsFullburn: true,
        fullburnDoesNotRequireEmphasisWord: true,
        normalWriteShortcutDenied: true,
        lightweightRequiresExplicitUserRequest: true,
        forceWordImprovementMeansPreviousQuarantine: true,
        fullPowerPrewriteGateAlwaysRequired: true,
        noraCoreWriterAlwaysUsedForWrite: true,
        pw90GuardrailAlwaysUsedForWrite: true
      }
    }
  });
  assert.deepEqual(failures, []);
});


test("chat display natural compression cannot justify underlength or success", () => {
  const lock = readFileSync(new URL("../source/knowledge/PW90_CHAT_DISPLAY_COMPRESSION_DENIAL_LOCK_v001.md", import.meta.url), "utf8");
  assert.equal(CHAT_DISPLAY_COMPRESSION_DENIAL_LOCK_ID, "PW90_CHAT_DISPLAY_COMPRESSION_DENIAL_LOCK");
  assert.equal(ALLOWED_UNDER15K_REASON, "under15k_full_burn_proven_no_remaining_material");
  assert.ok(lock.includes("チャット表示内の自然圧縮"));
  assert.ok(READ_ORDER.includes("source/knowledge/PW90_CHAT_DISPLAY_COMPRESSION_DENIAL_LOCK_v001.md"));

  const gateFailures = validateNoChatDisplayCompressionGate({ gate: {
    chatDisplayCompressionClaimAllowed: false,
    naturalCompressionAsSuccessReasonAllowed: false,
    platformHardLimitHandling: "TRUNCATE_OR_SPLIT_NOT_SUCCESS",
    flags: {
      chatDisplayCompressionDenied: true,
      uiSurfaceNotAcceptedAsLengthReason: true,
      naturalCompressionSuccessReasonDenied: true,
      underlengthRequiresMaterialFullBurnProof: true,
      hardOutputLimitRequiresTruncationOrSplitStatus: true,
      successCandidateDeniedWhenDisplayCompressionClaimed: true
    }
  }});
  assert.deepEqual(gateFailures, []);

  const bad = evaluateNoChatDisplayCompressionStatus({
    actualCharCount: 12000,
    underlengthReason: "チャット表示内の自然圧縮",
    finalStatus: "SUCCESS",
    materialFullBurnProof: false
  });
  assert.equal(bad.decision, "FAILED_TEXT_QUARANTINE");
  assert.ok(bad.failures.some((entry) => entry.code === "CHAT_DISPLAY_COMPRESSION_REASON_DENIED"));

  const hardLimit = evaluateNoChatDisplayCompressionStatus({
    actualCharCount: 12000,
    underlengthReason: "not_underlength",
    platformHardLimitHit: true,
    finalStatus: "SUCCESS"
  });
  assert.ok(hardLimit.failures.some((entry) => entry.code === "HARD_OUTPUT_LIMIT_REQUIRES_CONTINUATION_STATUS"));
});

test("new episode full boot restores rollback intent without writer load limit basis", () => {
  assert.equal(NEW_EPISODE_FULL_BOOT_ROLLBACK_LOCK_ID, "PW90_NEW_EPISODE_FULL_BOOT_ROLLBACK_LOCK");
  assert.equal(LEGACY_WRITER_INSTANCE_LOAD_LIMIT_POLICY.legacyOnly, true);
  assert.equal(LEGACY_WRITER_INSTANCE_LOAD_LIMIT_POLICY.currentBasis, false);
  assert.equal(LEGACY_WRITER_INSTANCE_LOAD_LIMIT_POLICY.currentDiagnosis, "NEW_EPISODE_BOOT_GATE_MISFIRE");
  const next = resolveNewEpisodeBootMode({ trigger: "next_episode" });
  assert.equal(next.decision, "NEW_EPISODE_FULL_BOOT_REQUIRED");
  assert.equal(next.priorEpisodeInertiaAllowed, false);
  const continuation = resolveNewEpisodeBootMode({ trigger: "continue_write" });
  assert.equal(continuation.continueTreatedAsNewEpisodeBoot, true);
  const same = resolveNewEpisodeBootMode({ trigger: "continue_write", targetEpisodeChanged: false, explicitSameEpisodeContinuation: true });
  assert.equal(same.decision, "SAME_EPISODE_CONTINUATION_WITH_RESTITCH_GATE");
  assert.equal(same.continueIsNotSuccessCarryover, true);
});

test("new episode full boot gate rejects previous episode carryover", () => {
  const failures = validateNewEpisodeFullBootGate({
    gate: {
      bootMode: "NEW_EPISODE_FULL_BOOT",
      previousEpisodeInertiaAllowed: false,
      writerInstanceLoadLimitUsedAsCurrentBasis: false,
      continueAsCarryoverAllowed: false,
      fullburnWriteRequired: true,
      newEpisodeBootGateMisfireQuarantinesText: true,
      flags: {
        previousTextDiscarded: true,
        previousSuccessFaceDiscarded: true,
        previousStyleInertiaDiscarded: true,
        previousCompressionHabitDiscarded: true,
        targetEpisodeFolderReread: true,
        fixedConditionTableRegenerated: true,
        pickupLedgerRegenerated: true,
        sceneConstructionPlanRegenerated: true,
        defaultWriteModeFullburnApplied: true,
        noraCoreWriterUsed: true,
        pw90GuardrailUsed: true,
        thinCompletionDenied: true,
        coverageAuditRequired: true,
        thinnessAuditRequired: true,
        forbiddenAuditRequired: true,
        fullConvergenceSweepRequired: true,
        minimalContinuityOnlyReinjected: true
      }
    }
  });
  assert.deepEqual(failures, []);
});



test("episode bridge writes current episode plus next opening without canonizing bridge", () => {
  assert.equal(EPISODE_TAIL_NEXT_OPENING_BRIDGE_LOCK_ID, "PW90_EPISODE_TAIL_NEXT_OPENING_BRIDGE_LOCK");
  assert.equal(EPISODE_WRITE_UNIT, "CURRENT_EPISODE_FULLBURN_PLUS_NEXT_OPENING_BRIDGE");
  const resolved = resolveEpisodeBridgeWriteUnit({ trigger: "next_episode", targetEpisode: "082" });
  assert.equal(resolved.decision, "CURRENT_EPISODE_PLUS_NEXT_OPENING_BRIDGE_REQUIRED");
  assert.equal(resolved.previousFullTextInertiaAllowed, false);
  assert.equal(resolved.nextOpeningCanonAllowed, false);
  const failures = validateEpisodeBridgeGate({
    gate: {
      writeUnit: "CURRENT_EPISODE_FULLBURN_PLUS_NEXT_OPENING_BRIDGE",
      previousTailAnchorRequired: true,
      nextOpeningBridgeRequired: true,
      previousFullTextInertiaAllowed: false,
      nextOpeningCanonAllowed: false,
      nextOpeningCountsAsCurrentEpisodeText: false,
      nextOpeningReplacesNextEpisodePackReread: false,
      currentEpisodeFullburnRequired: true,
      previousTailAnchor: {
        lastLifeState: "前話末尾の生活状態",
        lastRemainingObject: "残った物",
        lastPositionState: "位置関係",
        remainingQuestionOrCard: "残された問い",
        unresolvedFireSeed: "未処理の火種",
        lifeLineForNextEpisode: "次話へ渡る生活動線"
      },
      nextOpeningBridge: {
        status: "HANDOFF_ONLY_NOT_CANON",
        nextEpisodeId: "082",
        firstLifeObject: "次話冒頭の生活物",
        openingPosition: "次話冒頭の位置",
        continuityHook: "前話末尾から自然に続く手元",
        carryoverAllowed: ["生活動線"],
        carryoverDenied: ["前話文体惰性", "前話SUCCESS顔"],
        revalidateAgainstNextEpisodePack: "REQUIRED"
      },
      flags: {
        previousTailReadAfterClear: true,
        previousTailUsedOnlyAsContinuityAnchor: true,
        previousFullTextInertiaNotCarried: true,
        previousStyleCompressionHabitDenied: true,
        currentEpisodePackRereadStillRequired: true,
        currentEpisodeFullburnCompletedBeforeNextOpening: true,
        nextEpisodeOpeningBridgeGenerated: true,
        nextOpeningMarkedHandoffOnlyNotCanon: true,
        nextOpeningExcludedFromCurrentTextAndCoverage: true,
        nextOpeningCannotReplaceNextEpisodePackReread: true,
        nextOpeningRevalidatedAgainstNextEpisodePack: true,
        continuityContradictionStopsBeforeText: true
      }
    }
  });
  assert.deepEqual(failures, []);
});

test("wrapper does not contain removed semantic or optional modules", () => {
  assert.throws(() => readFileSync(new URL("../src/engine.js", import.meta.url)));
  assert.throws(() => readFileSync(new URL("../src/policy.js", import.meta.url)));
  assert.throws(() => readFileSync(new URL("../src/custom-pack-extension.js", import.meta.url)));
  assert.throws(() => readFileSync(new URL("../src/degraded-report.js", import.meta.url)));
});

test("operation lock separates maintenance from writing", () => {
  assert.deepEqual(evaluateOperationLock({ mode: "REPAIR", noManuscriptRequested: true }).decision, "OPERATION_ALLOWED");
  const blocked = evaluateOperationLock({ mode: "WRITE", noManuscriptRequested: true });
  assert.equal(blocked.decision, "STOP_BEFORE_TEXT");
  assert.ok(blocked.failures.some((entry) => entry.code === "NO_MANUSCRIPT_REQUEST_CONFLICTS_WITH_WRITE"));
  const stop = buildMissingWriteInputStop({ writerPackOrHandoffPresent: false, noManuscriptRequested: true });
  assert.equal(stop.conflict, "no_manuscript_requested");
  assert.ok(stop.missing.includes("writer_pack_or_handoff"));
});

test("operation lock requires explicit write inputs", () => {
  const result = evaluateOperationLock({
    mode: "WRITE",
    writerPackOrHandoffPresent: true,
    targetStoryNumberPresent: false,
    outputFormatPresent: true,
    layerPolicyPresent: true
  });
  assert.equal(result.decision, "STOP_BEFORE_TEXT");
  assert.ok(result.failures.some((entry) => entry.path === "targetStoryNumberPresent"));
});

test("hard binding resolves mandatory five-part PACK_WRITER success output", () => {
  assert.deepEqual(ACTIVE_RUNTIME_CONTRACT.successOutputSequence, [
    "filename_line",
    "target_length_or_self_bound",
    "frozen_condition_table_short",
    "text",
    "本文後LOG"
  ]);
  assert.equal(ACTIVE_RUNTIME_CONTRACT.sourceFilesFormOneContract, true);
  assert.equal(ACTIVE_RUNTIME_CONTRACT.stopBeforeTextOnContractFailure, true);
  assert.ok(ACTIVE_RUNTIME_CONTRACT.deniedSuccessOutputs.includes("custom_pack_extension_output"));
});

const validInitialMountState = () => ({
  mountedArchiveReadable: true,
  zipIntegrityValid: true,
  unsafePathsAbsent: true,
  nestedZipAbsent: true,
  readLedger: READ_ORDER.map((path) => ({ path, exists: true, read: true })),
  sourceIdentityVerified: true,
  activeRuntimeContractConstructed: true,
  successOutputContractResolved: true,
  nomDetailPackWriterOutputAdopted: true
});

const validHardBindingState = () => ({
  ...validInitialMountState(),
  mountIntegrityChecked: true,
  flow1To11Completed: true,
  frozenConditionTableShortGenerated: true,
  currentCycleRereadConfirmed: true,
  memoryFilenameSummaryNotUsedAsRead: true
});

test("initial mount check passing auto-boots without user boot command", () => {
  assert.equal(INITIAL_MOUNT_BOOT_POLICY.userBootCommandRequired, false);
  const result = evaluateInitialMountBoot(validInitialMountState());
  assert.equal(result.decision, "BOOT_READY");
  assert.equal(result.booted, true);
  assert.equal(result.userBootCommandRequired, false);
  assert.equal(result.writeTextAllowed, false);
});

test("initial mount boot stops at mount failure", () => {
  const state = validInitialMountState();
  state.zipIntegrityValid = false;
  const result = evaluateInitialMountBoot(state);
  assert.equal(result.decision, "STOP_AT_INITIAL_MOUNT");
  assert.ok(result.failures.some((entry) => entry.code === "ZIP_INTEGRITY_NOT_VALID"));
});

test("initial mount binding is separate from write-cycle assertions", () => {
  const boot = evaluateInitialMountBinding({ ...validInitialMountState(), mountIntegrityChecked: true });
  assert.equal(INITIAL_MOUNT_ASSERTIONS.length, 6);
  assert.equal(WRITE_CYCLE_ASSERTIONS.length, 4);
  assert.equal(BOOT_ASSERTIONS.length, 10);
  assert.equal(boot.decision, "ACTIVE_RUNTIME_BOOTED");
  assert.equal(boot.writeTextAllowed, false);
});

test("all write-cycle assertions passing enables write_text", () => {
  const result = evaluateWriteCycleHardBinding(validHardBindingState());
  assert.equal(result.decision, "ACTIVE_RUNTIME_READY");
  assert.equal(result.writeTextAllowed, true);
});

test("missing hard-binding assertion stops before text", () => {
  const state = validHardBindingState();
  state.nomDetailPackWriterOutputAdopted = false;
  state.frozenConditionTableShortGenerated = false;
  state.memoryFilenameSummaryNotUsedAsRead = false;
  const result = evaluateHardBinding(state);
  assert.equal(result.decision, "STOP_BEFORE_TEXT");
  assert.equal(result.writeTextAllowed, false);
  assert.ok(result.failures.some((entry) => entry.assertion === "nom_detail_pack_writer_require_output_adopted"));
  assert.ok(result.failures.some((entry) => entry.assertion === "frozen_condition_table_short_generated_from_current_story_cycle"));
  assert.ok(result.failures.some((entry) => entry.assertion === "memory_filename_summary_not_used_as_read"));
});

test("unread source stops before text", () => {
  const state = validHardBindingState();
  state.readLedger = READ_ORDER.slice(1).map((path) => ({ path, exists: true, read: true }));
  const result = evaluateHardBinding(state);
  assert.equal(result.decision, "STOP_BEFORE_TEXT");
  assert.equal(result.writeTextAllowed, false);
});

const digest = (value) => createHash("sha256").update(Buffer.from(value, "utf8")).digest("hex");

const validWriterInput = () => {
  const content = [
    "<!-- BEGIN_SECTION: SEC-E001-CORE -->",
    "核A",
    "<!-- END_SECTION: SEC-E001-CORE -->",
    "",
    "<!-- BEGIN_SECTION: SEC-E001-CONSTRAINT -->",
    "制約A",
    "<!-- END_SECTION: SEC-E001-CONSTRAINT -->",
    "",
    "<!-- BEGIN_SECTION: SEC-E001-PROCESS -->",
    "後工程メモ",
    "<!-- END_SECTION: SEC-E001-PROCESS -->",
    ""
  ].join("\n");
  const sourceFiles = [{ path: "episode.md", content, read: true }];
  const map = {
    episode_id: "E001",
    input_mode: "V2_EPISODE_FOLDER",
    digest_policy: {
      algorithm: "SHA-256", encoding: "UTF-8", bom: "forbidden", newline: "LF",
      unicodeNormalization: "none", trailingNewline: "preserve", digestFormat: "lowercase_hex"
    },
    source_files: [{
      path: "episode.md",
      file_digest: digest(content),
      coverage: {
        unclassified_sections: [],
        classified_material_ids: ["E001-CORE-001", "E001-CONSTRAINT-001", "E001-PROCESS-001"]
      }
    }],
    entries: [{
      material_id: "E001-CORE-001", path: "episode.md", section_id: "SEC-E001-CORE",
      writer_use: "RESTORE_SOURCE", canonical_state: "FROZEN", read_required: true,
      section_digest: digest("核A\n")
    }, {
      material_id: "E001-CONSTRAINT-001", path: "episode.md", section_id: "SEC-E001-CONSTRAINT",
      writer_use: "RESTORE_CONSTRAINT", canonical_state: "FROZEN", read_required: true,
      section_digest: digest("制約A\n")
    }, {
      material_id: "E001-PROCESS-001", path: "episode.md", section_id: "SEC-E001-PROCESS",
      writer_use: "PROCESS_ONLY", canonical_state: "SUPPORT", read_required: true,
      section_digest: digest("後工程メモ\n")
    }]
  };
  map.map_digest = calculateMapDigest(map);
  return {
    activation: {
      input_mode: "V2_EPISODE_FOLDER",
      activate_contracts: ["V2_FOLDER_RESTORE_CONTRACT"],
      degraded_mode: false,
      activation_source: "DESIGN",
      activation_id: "PW-ACT-0001",
      episode_id: "E001",
      episode_unit: "folder",
      auto_detection: "forbidden",
      activation_validity: {
        user_or_design_declared: true,
        filename_inference_allowed: false,
        folder_size_inference_allowed: false,
        style_inference_allowed: false
      }
    },
    hardBindingState: validHardBindingState(),
    sourceFiles,
    materialMap: map,
    preWrite: Object.fromEntries([
      ...REQUIRED_PREWRITE_FLAGS.map((field) => [field, true]),
      ["executionOrder", [...WRITE_EXECUTION_ORDER]]
    ]),
    preTextPickup: validPreTextPickup({
      restoreIds: ["E001-CORE-001"],
      constraintIds: ["E001-CONSTRAINT-001"],
      processIds: ["E001-PROCESS-001"],
      referenceIds: [],
      denyIds: []
    }),
    fullPowerWriteGate: validFullPowerPreWriteGate(conditionIdsForEpisode("E001"))
  };
};

const validPreTextPickup = ({ restoreIds, constraintIds, processIds = [], referenceIds = [], denyIds = [], episode = "E001" }) => {
  const allowed = [...restoreIds, ...constraintIds, ...processIds, ...referenceIds, ...denyIds];
  return {
    checks: Object.fromEntries(REQUIRED_PRETEXT_PICKUP_CHECKS.map((field) => [field, true])),
    plannedRestoreMaterialIds: [...restoreIds],
    plannedConstraintMaterialIds: [...constraintIds],
    readButNonBodyMaterialIds: [...processIds, ...referenceIds],
    bodyEligibleMaterialIds: [...restoreIds],
    forbiddenBodyMaterialIds: [...processIds, ...referenceIds, ...denyIds],
    requiredElementLedger: [{ id: `REQ_${episode}_001`, sourceMaterialId: restoreIds[0], status: "picked" }],
    forbiddenLineLedger: [{ id: `FORBID_${episode}_001`, sourceMaterialId: allowed[0], status: "scanned" }],
    layerBindingLedger: [{ id: `LAYER_${episode}_001`, sourceMaterialId: constraintIds[0] ?? allowed[0], status: "applied" }],
    connectionLedger: [{ id: `CONN_${episode}_001`, sourceMaterialId: allowed[0], status: "picked" }],
    sourceVerificationLedger: [{ id: `SRC_${episode}_001`, mountId: "INTERNAL_PACK_SOURCE_RECORD", status: "verified", writeAuthority: "allowed" }],
    deliveryIntent: {
      requestedVision: "この話で届ける絵を保持する",
      nonDroppableCore: "核Aを落とさない",
      forbiddenLineFocus: "禁止線を踏まない",
      endpoint: "次話へ接続して終える"
    },
    conflictResolutionOrder: [...CONFLICT_RESOLUTION_ORDER],
    warnPolicy: { ...WARN_POLICY },
    quarantineReturnTicketTemplate: validQuarantineReturnTicket()
  };
};

const validProjectLockedPreTextPickup = () => validPreTextPickup({
  restoreIds: ["episode_081:01_ready.md", "episode_081:02_v2.md"],
  constraintIds: ["episode_081:03_layer.md", "episode_081:05_frozen.md"],
  processIds: ["episode_081:04_crosscheck.md", "episode_081:06_execution_queue.md"],
  referenceIds: ["episode_081:07_sources.md"],
  denyIds: ["episode_081:00_episode_index.md", "episode_081:03_layer_binding_manifest.json"],
  episode: "081"
});

const conditionIdsForEpisode = (episode = "E001") => [
  `REQ_${episode}_001`,
  `FORBID_${episode}_001`,
  `LAYER_${episode}_001`,
  `CONN_${episode}_001`,
  `SRC_${episode}_001`
].sort();

const validCoverageTable = (conditionIds = conditionIdsForEpisode()) => conditionIds.map((id) => ({
  id,
  status: id.startsWith("FORBID_") ? "avoided" : id.startsWith("LAYER_") ? "applied" : id.startsWith("SRC_") ? "verified" : "reflected",
  evidence: `${id} coverage confirmed`
}));

const validFullPowerPreWriteGate = (conditionIds = conditionIdsForEpisode()) => ({
  flags: Object.fromEntries(REQUIRED_FULL_POWER_PREWRITE_FLAGS.map((field) => [field, true])),
  episodeScaleStandard: "15K",
  storyCardConditionUse: "all_conditions_for_one_episode",
  ds90PackBurnExpectation: "15k_full_burn_material",
  successBasis: "pack_full_burn_not_external_average",
  under15kPolicy: "allowed_only_after_full_burn",
  endUserDependencyAllowed: false,
  safetyCaveatAsEffortLimitAllowed: false,
  successMayBeThin: false,
  sceneConstructionPlan: [
    {
      sceneId: "SCENE_01",
      purpose: "入口で核と固定層を具体物に落とす",
      requiredConditionIds: [...conditionIds],
      concreteWorkPoints: ["物", "位置", "手元", "温度"],
      conditionPropagationPoints: ["物が手順を押す", "位置が反応差を生む", "温度が生活着地へ残る"],
      thinRisk: "骨だけ通すと熱量が抜ける",
      minimumDelivery: "条件を全部本文へ施工する"
    },
    {
      sceneId: "SCENE_02",
      purpose: "中盤の段化と反応差を起こす",
      requiredConditionIds: [...conditionIds],
      concreteWorkPoints: ["通れる幅", "反応差", "置き直し前", "置き直し後"],
      conditionPropagationPoints: ["通れる幅が会話を遅らせる", "置き直しが小物の役目を変える", "余波が次の判断へ残る"],
      thinRisk: "要約置換で場面が一枚になる",
      minimumDelivery: "熱量層を本文の動きにする"
    }
  ]
});

const validFullPowerPostTextGate = (conditionIds = conditionIdsForEpisode()) => ({
  flags: Object.fromEntries(REQUIRED_FULL_POWER_POSTTEXT_FLAGS.map((field) => [field, true])),
  quarantineIfThin: true,
  sceneExecution: [
    {
      sceneId: "SCENE_01",
      recoveredConditionIds: [...conditionIds],
      concreteWorkRecovered: ["物を本文化", "位置を本文化", "手元を本文化", "温度を本文化"],
      conditionPropagationRecovered: ["物から手順を発生", "位置から反応差を発生", "温度から生活着地を発生"],
      bodyEvidence: "SCENE_01 evidence in body"
    },
    {
      sceneId: "SCENE_02",
      recoveredConditionIds: [...conditionIds],
      concreteWorkRecovered: ["通れる幅を本文化", "反応差を本文化", "置き直し前を本文化", "置き直し後を本文化"],
      conditionPropagationRecovered: ["通れる幅から行動変化を発生", "置き直しから小物意味変化を発生", "余波を次判断へ接続"],
      bodyEvidence: "SCENE_02 evidence in body"
    }
  ],
  thinnessAudit: {
    underlengthReason: "not_underlength",
    omissionDetected: false,
    substitutionDetected: false,
    escapeDetected: false,
    genericFlatteningDetected: false,
    userWouldNeedToPointOutThinness: false,
    selfRewriteRequired: false,
    finalDensityDecision: "thin text denied; full power recovered"
  },
  textScaleAudit: {
    episodeScaleStandard: "15K",
    ds90PackTreatedAs15kMaterial: true,
    externalAverageComparisonUsed: false,
    readableFiveKCompletionAccepted: false,
    conditionsLeftAsChecklistOnly: false,
    unresolvedNaturalExpansionRemaining: false,
    actualCharCount: 15000,
    fullBurnDecision: "15K episode recognition observed; pack burn completed",
    under15kFullBurnProof: "not under 15K"
  }
});

const validPostTextCheck = ({ restoreIds = ["E001-CORE-001"], constraintIds = ["E001-CONSTRAINT-001"], conditionIds = conditionIdsForEpisode() } = {}) => ({
  checks: Object.fromEntries(REQUIRED_POSTTEXT_PICKUP_CHECKS.map((field) => [field, true])),
  recoveredRestoreMaterialIds: [...restoreIds],
  appliedConstraintMaterialIds: [...constraintIds],
  bodySourceMaterialIds: [...restoreIds],
  omittedRequiredElementIds: [],
  violatedForbiddenLineIds: [],
  unresolvedConditionIds: [],
  unverifiedSourceClaims: [],
  pickupDigest: "pickup-ledger-digest-fixture",
  coverageTable: validCoverageTable(conditionIds),
  warnLedger: [{ class: "CRAFT_WARN", blocksSpecPass: false, message: "content-fuel warning logged without blocking spec pass" }],
  conflictResolutionOrderObserved: [...CONFLICT_RESOLUTION_ORDER],
  deliveryIntentResult: {
    requestedVision: "この話で届ける絵を保持した",
    nonDroppableCore: "核Aを落としていない",
    forbiddenLineFocus: "禁止線を回避した",
    endpoint: "次話へ接続して終えた"
  }
});

const validQuarantineReturnTicket = () => ({
  reason: "spec defect detected",
  impact: "generated text cannot be promoted as canon",
  requiredFix: "repair the named field and rerun the gate",
  boundary: "writer runtime quarantine, not upstream blame",
  resumeCondition: "rerun with repaired ledger or pack"
});

const validOutput = (conditionIds = conditionIdsForEpisode()) => ({
  filename_line: "E001.txt",
  target_length_or_self_bound: "full recovery; no ceiling",
  frozen_condition_table_short: "核A / fixed / heat / connection",
  text: "本文",
  本文後LOG: `核/固定層/熱量層/一時停止点/次話再生点/確認済み接続状態/火種/設計側不足
coverage_table
${conditionIds.join("\n")}`
});


const validFullConvergenceSweep = () => ({
  ...Object.fromEntries(REQUIRED_FULL_CONVERGENCE_SWEEP_FLAGS.map((field) => [field, true])),
  residueItems: [],
  finalDecision: "SUCCESS_DELIVERABLE"
});

const validChecks = (conditionIds = conditionIdsForEpisode()) => ({
  ...Object.fromEntries(REQUIRED_OUTPUT_CHECKS.map((field) => [field, true])),
  postTextCheck: validPostTextCheck({ conditionIds }),
  fullPowerWriteLock: validFullPowerPostTextGate(conditionIds),
  fullConvergenceSweep: validFullConvergenceSweep(),
  quarantineReturnTicket: validQuarantineReturnTicket()
});

const validConsumption = () => ({
  consumedRestoreMaterialIds: ["E001-CORE-001"],
  bodySourceMaterialIds: ["E001-CORE-001"],
  appliedConstraintMaterialIds: ["E001-CONSTRAINT-001"]
});

test("V2 pre-write gate authorizes only mapped frozen restore source", () => {
  const result = evaluateV2PreWrite(validWriterInput());
  assert.equal(result.decision, "WRITE_ALLOWED");
  assert.equal(result.shelves.RESTORE_SOURCE.length, 1);
  assert.equal(result.shelves.RESTORE_CONSTRAINT.length, 1);
  assert.equal(result.shelves.PROCESS_ONLY.length, 1);
});

test("V2 auto detection and folder-total length interpretation stop before text", () => {
  const input = validWriterInput();
  input.activation.auto_detection = "allowed";
  input.preWrite.folderTotalNotUsedAsLengthLimit = false;
  const result = evaluateV2PreWrite(input);
  assert.equal(result.decision, "STOP_BEFORE_TEXT");
  assert.ok(result.failures.some((entry) => entry.code === "AUTO_DETECTION_FORBIDDEN"));
  assert.ok(result.failures.some((entry) => entry.path === "folderTotalNotUsedAsLengthLimit"));
});

test("missing map and changed source stop before text", () => {
  const missing = validWriterInput();
  missing.materialMap = null;
  assert.equal(evaluateV2PreWrite(missing).decision, "STOP_BEFORE_TEXT");
  const changed = validWriterInput();
  changed.sourceFiles[0].content = changed.sourceFiles[0].content.replace("核A", "核B");
  const result = evaluateV2PreWrite(changed);
  assert.ok(result.failures.some((entry) => entry.code === "FILE_DIGEST_MISMATCH"));
  assert.ok(result.failures.some((entry) => entry.code === "SECTION_DIGEST_MISMATCH"));
});

test("unsafe paths and incomplete coverage stop before text", () => {
  const unsafe = validWriterInput();
  unsafe.sourceFiles[0].path = "../episode.md";
  unsafe.materialMap.source_files[0].path = "../episode.md";
  unsafe.materialMap.entries.forEach((entry) => { entry.path = "../episode.md"; });
  unsafe.materialMap.map_digest = calculateMapDigest(unsafe.materialMap);
  const result = evaluateV2PreWrite(unsafe);
  assert.ok(result.failures.some((entry) => entry.code === "SOURCE_PATH_UNSAFE"));
  assert.ok(result.failures.some((entry) => entry.code === "MAP_SOURCE_PATH_UNSAFE"));

  const coverage = validWriterInput();
  coverage.materialMap.source_files[0].coverage.classified_material_ids.pop();
  coverage.materialMap.map_digest = calculateMapDigest(coverage.materialMap);
  assert.ok(evaluateV2PreWrite(coverage).failures.some((entry) => entry.code === "COVERAGE_ID_MISMATCH"));
});

test("valid V2 output passes exact BASE contract and becomes SUCCESS", () => {
  const input = validWriterInput();
  const preWriteResult = evaluateV2PreWrite(input);
  const result = evaluateOutputGate({
    preWriteResult,
    activation: input.activation,
    output: validOutput(),
    checks: validChecks(),
    consumption: validConsumption()
  });
  assert.equal(result.decision, "SUCCESS");
  assert.equal(result.success, true);
  assert.equal(result.artifact.kind, "PW90_FULLY_CONVERGED_TEXT_ARTIFACT");
  assert.equal(result.artifact.fullConvergence, true);
  assert.equal(result.artifact.textArtifactReady, true);
});



test("full power write lock blocks prewrite without scene construction plan", () => {
  const input = validWriterInput();
  delete input.fullPowerWriteGate;
  const result = evaluateV2PreWrite(input);
  assert.equal(result.decision, "STOP_BEFORE_TEXT");
  assert.ok(result.failures.some((entry) => entry.code === "FULL_POWER_PREWRITE_GATE_REQUIRED"));
});

test("full power write lock quarantines thin or user-dependent success", () => {
  const input = validWriterInput();
  const checks = validChecks();
  checks.fullPowerWriteLock.thinnessAudit.omissionDetected = true;
  checks.fullPowerWriteLock.thinnessAudit.userWouldNeedToPointOutThinness = true;
  checks.fullPowerWriteLock.flags.thinOutputAuditPassed = false;
  const result = evaluateOutputGate({
    preWriteResult: evaluateV2PreWrite(input),
    activation: input.activation,
    output: validOutput(),
    checks,
    consumption: validConsumption()
  });
  assert.equal(result.decision, "FAILED_TEXT_QUARANTINE");
  assert.ok(result.failures.some((entry) => entry.code === "FULL_POWER_THINNESS_AUDIT_FAILED" && entry.path.endsWith("omissionDetected")));
  assert.ok(result.failures.some((entry) => entry.code === "FULL_POWER_THINNESS_AUDIT_FAILED" && entry.path.endsWith("userWouldNeedToPointOutThinness")));
  assert.ok(result.failures.some((entry) => entry.code === "FULL_POWER_POSTTEXT_FLAG_NOT_PASS" && entry.path.endsWith("thinOutputAuditPassed")));
});


test("full power audit rejects chat display or natural compression reasons", () => {
  const gate = validFullPowerPostTextGate();
  gate.thinnessAudit.underlengthReason = "natural_compression_after_full_recovery";
  gate.thinnessAudit.finalDensityDecision = "チャット表示内の自然圧縮";
  gate.textScaleAudit.fullBurnDecision = "表示都合で短い";
  const failures = validateFullPowerPostTextGate({
    preWriteResult: evaluateV2PreWrite(validWriterInput()),
    gate
  });
  assert.ok(failures.some((entry) => entry.code === "FULL_POWER_UNDERLENGTH_REASON_INVALID"));
  assert.ok(failures.some((entry) => entry.code === "CHAT_DISPLAY_COMPRESSION_REASON_DENIED"));
});

test("text-only output is quarantined and cannot enter downstream", () => {
  const input = validWriterInput();
  const result = evaluateOutputGate({
    preWriteResult: evaluateV2PreWrite(input),
    activation: input.activation,
    output: { text: "本文だけ" },
    checks: validChecks(),
    consumption: validConsumption()
  });
  assert.equal(result.decision, "FAILED_TEXT_QUARANTINE");
  assert.equal(result.quarantine.canon, false);
  assert.equal(result.quarantine.saved, false);
  assert.equal(result.quarantine.packagerInput, false);
  assert.equal(result.quarantine.textArtifactReady, false);
});

test("extra success fields and removed custom extension quarantine text", () => {
  const input = validWriterInput();
  input.activation.custom_pack_extension = true;
  const output = { ...validOutput(), episode_id: "E001" };
  const result = evaluateOutputGate({
    preWriteResult: evaluateV2PreWrite(input), activation: input.activation,
    output, checks: validChecks(), consumption: validConsumption()
  });
  assert.equal(result.decision, "STOP_BEFORE_TEXT");
  assert.ok(evaluateV2PreWrite(input).failures.some((entry) => entry.code === "CUSTOM_PACK_EXTENSION_REMOVED"));
});

test("condition recovery, summary substitution, and cross-shelf failure quarantine text", () => {
  const input = validWriterInput();
  const checks = validChecks();
  checks.heatLayerRecovered = false;
  checks.noSummarySubstitution = false;
  checks.noCrossShelfContamination = false;
  const result = evaluateOutputGate({
    preWriteResult: evaluateV2PreWrite(input), activation: input.activation,
    output: validOutput(), checks, consumption: validConsumption()
  });
  assert.equal(result.decision, "FAILED_TEXT_QUARANTINE");
  assert.equal(result.failures.filter((entry) => entry.code === "OUTPUT_CHECK_FAILED").length, 3);
});

test("material consumption ledger must exactly match authorized shelves", () => {
  const input = validWriterInput();
  const bad = validConsumption();
  bad.consumedRestoreMaterialIds = [];
  bad.bodySourceMaterialIds = ["E001-PROCESS-001"];
  const result = evaluateOutputGate({
    preWriteResult: evaluateV2PreWrite(input), activation: input.activation,
    output: validOutput(), checks: validChecks(), consumption: bad
  });
  assert.equal(result.decision, "FAILED_TEXT_QUARANTINE");
  assert.ok(result.failures.some((entry) => entry.code === "RESTORE_CONSUMPTION_MISMATCH"));
  assert.ok(result.failures.some((entry) => entry.code === "CROSS_SHELF_MATERIAL_ID_USED"));
});




test("reciprocal handoff respect is enforced before and after text", () => {
  const input = validWriterInput();
  input.preTextPickup.checks.noSelfRefusedStateAccepted = false;
  const pre = evaluateV2PreWrite(input);
  assert.equal(pre.decision, "STOP_BEFORE_TEXT");
  assert.ok(pre.failures.some((entry) => entry.code === "PRETEXT_PICKUP_CHECK_FAILED" && entry.path.endsWith("noSelfRefusedStateAccepted")));

  const okInput = validWriterInput();
  const checks = validChecks();
  checks.postTextCheck.checks.stopReasonsActionableNotBlaming = false;
  const post = evaluateOutputGate({
    preWriteResult: evaluateV2PreWrite(okInput),
    activation: okInput.activation,
    output: validOutput(),
    checks,
    consumption: validConsumption()
  });
  assert.equal(post.decision, "FAILED_TEXT_QUARANTINE");
  assert.ok(post.failures.some((entry) => entry.code === "POSTTEXT_PICKUP_CHECK_FAILED" && entry.path.endsWith("stopReasonsActionableNotBlaming")));
});


test("end-user heat delivery lock is enforced before and after text", () => {
  const input = validWriterInput();
  input.preTextPickup.checks.userVisionNotReplaced = false;
  const pre = evaluateV2PreWrite(input);
  assert.equal(pre.decision, "STOP_BEFORE_TEXT");
  assert.ok(pre.failures.some((entry) => entry.code === "PRETEXT_PICKUP_CHECK_FAILED" && entry.path.endsWith("userVisionNotReplaced")));

  const okInput = validWriterInput();
  const checks = validChecks();
  checks.postTextCheck.checks.noGenericFlatteningDetected = false;
  const post = evaluateOutputGate({
    preWriteResult: evaluateV2PreWrite(okInput),
    activation: okInput.activation,
    output: validOutput(),
    checks,
    consumption: validConsumption()
  });
  assert.equal(post.decision, "FAILED_TEXT_QUARANTINE");
  assert.ok(post.failures.some((entry) => entry.code === "POSTTEXT_PICKUP_CHECK_FAILED" && entry.path.endsWith("noGenericFlatteningDetected")));
});

test("pre-text pickup ledger is required and must exactly match authorized shelves", () => {
  const input = validWriterInput();
  const missing = structuredClone(input);
  delete missing.preTextPickup;
  const missingResult = evaluateV2PreWrite(missing);
  assert.equal(missingResult.decision, "STOP_BEFORE_TEXT");
  assert.ok(missingResult.failures.some((entry) => entry.code === "PRETEXT_PICKUP_LEDGER_REQUIRED"));

  const bad = validWriterInput();
  bad.preTextPickup.plannedRestoreMaterialIds = [];
  const badResult = evaluateV2PreWrite(bad);
  assert.equal(badResult.decision, "STOP_BEFORE_TEXT");
  assert.ok(badResult.failures.some((entry) => entry.code === "PRETEXT_RESTORE_PICKUP_MISMATCH"));
});

test("post-text pickup ledger quarantines omitted conditions and weak logs", () => {
  const input = validWriterInput();
  const checks = validChecks();
  checks.postTextCheck.omittedRequiredElementIds = ["core"];
  checks.postTextCheck.checks.requiredElementsNotDropped = false;
  const output = validOutput();
  output.本文後LOG = "核/固定層";
  const result = evaluateOutputGate({
    preWriteResult: evaluateV2PreWrite(input), activation: input.activation,
    output, checks, consumption: validConsumption()
  });
  assert.equal(result.decision, "FAILED_TEXT_QUARANTINE");
  assert.ok(result.failures.some((entry) => entry.code === "POSTTEXT_OMITTED_REQUIRED_ELEMENTS"));
  assert.ok(result.failures.some((entry) => entry.code === "POSTTEXT_LOG_FIELD_MISSING"));
});

test("duplicate material consumption ids never pass", () => {
  const input = validWriterInput();
  const bad = validConsumption();
  bad.bodySourceMaterialIds = ["E001-CORE-001", "E001-CORE-001"];
  const result = evaluateOutputGate({
    preWriteResult: evaluateV2PreWrite(input), activation: input.activation,
    output: validOutput(), checks: validChecks(), consumption: bad
  });
  assert.equal(result.decision, "FAILED_TEXT_QUARANTINE");
  assert.ok(result.failures.some((entry) => entry.code === "CONSUMPTION_ID_DUPLICATE"));
});

test("forged policy, incomplete activation, and blank section stop before text", () => {
  const policy = validWriterInput();
  policy.materialMap.digest_policy.newline = "CRLF";
  policy.materialMap.map_digest = calculateMapDigest(policy.materialMap);
  assert.ok(evaluateV2PreWrite(policy).failures.some((entry) => entry.code === "DIGEST_POLICY_MISMATCH"));

  const activation = validWriterInput();
  delete activation.activation.activation_validity;
  assert.ok(evaluateV2PreWrite(activation).failures.some((entry) => entry.code === "ACTIVATION_VALIDITY_INVALID"));

  const blank = validWriterInput();
  blank.sourceFiles[0].content = blank.sourceFiles[0].content.replace("核A", "   ");
  assert.ok(evaluateV2PreWrite(blank).failures.some((entry) => entry.code === "SECTION_EMPTY"));
});

test("whitespace-only BASE output and post-freeze mutation checks never pass", () => {
  const input = validWriterInput();
  const output = validOutput();
  output.text = "   \n";
  const checks = validChecks();
  checks.noPostFreezeMutation = false;
  const result = evaluateOutputGate({
    preWriteResult: evaluateV2PreWrite(input), activation: input.activation,
    output, checks, consumption: validConsumption()
  });
  assert.equal(result.decision, "FAILED_TEXT_QUARANTINE");
  assert.ok(result.failures.some((entry) => entry.code === "BASE_OUTPUT_MISSING" && entry.path === "text"));
  assert.ok(result.failures.some((entry) => entry.code === "OUTPUT_CHECK_FAILED" && entry.path === "noPostFreezeMutation"));
});



test("coverage ID lock stops unstable pre-text condition ids and missing delivery intent", () => {
  const input = validWriterInput();
  input.preTextPickup.requiredElementLedger[0].id = "core";
  input.preTextPickup.deliveryIntent.endpoint = "";
  const result = evaluateV2PreWrite(input);
  assert.equal(result.decision, "STOP_BEFORE_TEXT");
  assert.ok(result.failures.some((entry) => entry.code === "CONDITION_ID_FORMAT_INVALID"));
  assert.ok(result.failures.some((entry) => entry.code === "DELIVERY_INTENT_FIELD_REQUIRED" && entry.path.endsWith("endpoint")));
});

test("post-text coverage table must match pre-text condition ids and 本文後LOG", () => {
  const input = validWriterInput();
  const preWriteResult = evaluateV2PreWrite(input);
  const checks = validChecks();
  checks.postTextCheck.coverageTable.pop();
  const output = validOutput();
  output.本文後LOG = output.本文後LOG.replace("REQ_E001_001", "");
  const result = evaluateOutputGate({
    preWriteResult,
    activation: input.activation,
    output,
    checks,
    consumption: validConsumption()
  });
  assert.equal(result.decision, "FAILED_TEXT_QUARANTINE");
  assert.ok(result.failures.some((entry) => entry.code === "COVERAGE_TABLE_ID_MISMATCH"));
  assert.ok(result.failures.some((entry) => entry.code === "POSTTEXT_LOG_COVERAGE_ID_MISSING"));
});

test("quarantine requires actionable return ticket on failed output", () => {
  const input = validWriterInput();
  const checks = validChecks();
  delete checks.quarantineReturnTicket;
  checks.postTextCheck.omittedRequiredElementIds = ["REQ_E001_001"];
  const result = evaluateOutputGate({
    preWriteResult: evaluateV2PreWrite(input),
    activation: input.activation,
    output: validOutput(),
    checks,
    consumption: validConsumption()
  });
  assert.equal(result.decision, "FAILED_TEXT_QUARANTINE");
  assert.ok(result.failures.some((entry) => entry.code === "POSTTEXT_OMITTED_REQUIRED_ELEMENTS"));
  assert.ok(result.failures.some((entry) => entry.code === "QUARANTINE_RETURN_TICKET_REQUIRED"));
});


test("full convergence sweep quarantines remaining dust before success", () => {
  const input = validWriterInput();
  input.preTextPickup.checks.fullConvergenceSweepPlanned = false;
  const pre = evaluateV2PreWrite(input);
  assert.equal(pre.decision, "STOP_BEFORE_TEXT");
  assert.ok(pre.failures.some((entry) => entry.code === "PRETEXT_PICKUP_CHECK_FAILED" && entry.path.endsWith("fullConvergenceSweepPlanned")));

  const okInput = validWriterInput();
  const checks = validChecks();
  checks.postTextCheck.checks.fullConvergenceSweepComplete = false;
  checks.fullConvergenceSweep.noUnmappedCoverageId = false;
  checks.fullConvergenceSweep.residueItems = ["unmapped coverage id dust"];
  const result = evaluateOutputGate({
    preWriteResult: evaluateV2PreWrite(okInput),
    activation: okInput.activation,
    output: validOutput(),
    checks,
    consumption: validConsumption()
  });
  assert.equal(result.decision, "FAILED_TEXT_QUARANTINE");
  assert.ok(result.failures.some((entry) => entry.code === "POSTTEXT_PICKUP_CHECK_FAILED" && entry.path.endsWith("fullConvergenceSweepComplete")));
  assert.ok(result.failures.some((entry) => entry.code === "FULL_CONVERGENCE_SWEEP_FLAG_NOT_PASS"));
  assert.ok(result.failures.some((entry) => entry.code === "FULL_CONVERGENCE_RESIDUE_REMAINING"));
});

function writeFixtureFile(root, rel, content) {
  mkdirSync(dirname(join(root, rel)), { recursive: true });
  writeFileSync(join(root, rel), content, "utf8");
}

function makeProjectLockedFixture({ autoInsert = false } = {}) {
  const tmp = mkdtempSync(join(tmpdir(), "pw-projectlocked-"));
  const root = join(tmp, "CURRENT_SCHEMA_PROJECTLOCKED_FIXTURE");
  mkdirSync(root, { recursive: true });
  for (const file of [
    "00_README.md", "01_pack_profile.md", "02_world_axis_used.md", "03_character_used.md", "04_layer_common.md",
    "08_terms.md", "09_writer_boot.md", "10_stop_rules.md", "11_layer_backlog.md"
  ]) writeFixtureFile(root, file, `# ${file}\n本文を書かない。\n`);
  writeFixtureFile(root, "04_world_axis_layer_binding.json", JSON.stringify({
    item_id: "WORLD-AXIS-LAYER-BINDING",
    usedAsReadSubstitute: false,
    usedAsStorySource: false,
    writer_use: "CONSTRAINT_ONLY"
  }, null, 2));
  writeFixtureFile(root, "05_band_profiles/any_band_profile.md", "# band profile\n本文を書かない。\n");
  writeFixtureFile(root, "06_continuity/any_continuity.md", "# continuity\n本文を書かない。\n");
  writeFixtureFile(root, "12_pack_cutout_log/PACK_CUTOUT_LOG_fixture.md", "# cutout log\n本文を書かない。\n");
  writeFixtureFile(root, "00_packGateIndex.json", JSON.stringify({
    item_id: "PACK-GATE", pack_id: "ONEE", usedAsReadSubstitute: false, usedAsStorySource: false,
    episodeIds: ["episode_081"], readOrder: ["episode_081"], stop_if: ["source_file_current_missing"]
  }, null, 2));
  writeFixtureFile(root, "00_sourceMountIndex.json", JSON.stringify({
    item_id: "SOURCE-MOUNT", pack_id: "ONEE", usedAsReadSubstitute: false,
    source_mounts: [
      { mount_id: "INTERNAL_PACK_SOURCE_RECORD", file: "00_sourceMountIndex.json" }
    ],
    stop_if_missing: []
  }, null, 2));
  const ep = "07_episodes/episode_081";
  writeFixtureFile(root, `${ep}/00_episode_index.md`, `# episodeIndex 第081話 白い息の苦情\n\n## machine_index\n\`\`\`json\n${JSON.stringify({
    item_id: "INDEX", episode_id: "episode_081", title: "白い息の苦情", read_substitute: false, story_source: false,
    required_files: [
      "00_episode_index.md", "01_ready.md", "02_v2.md", "03_layer.md", "03_layer_binding_manifest.json",
      "04_crosscheck.md", "05_frozen.md", "06_execution_queue.md", "07_sources.md"
    ]
  }, null, 2)}\n\`\`\`\n`);
  writeFixtureFile(root, `${ep}/01_ready.md`, [
    "---", "item_id: READY", "source_file_current: 07_episodes/episode_081/01_ready.md", "source_lines_current: L1-L8", "---",
    "# ready", "核", "固定層", "熱量層", "禁止線"
  ].join("\n") + "\n");
  writeFixtureFile(root, `${ep}/02_v2.md`, "# v2\nsource_file_current: 07_episodes/episode_081/01_ready.md\nsource_lines_current: L1-L8\n");
  writeFixtureFile(root, `${ep}/03_layer.md`, "# layer\nsource_file_current: 07_episodes/episode_081/01_ready.md\nsource_lines_current: L1-L8\n");
  writeFixtureFile(root, `${ep}/03_layer_binding_manifest.json`, JSON.stringify({
    item_id: "LAYER-MANIFEST", episode_id: "episode_081", usedAsReadSubstitute: false, usedAsStorySource: false,
    dynamicOverlay: false, autoInsert, profileActivates: false,
    bindings: [{ key: "surfaceAxis", source_role: "story_condition", target_file: "07_episodes/episode_081/03_layer.md" }]
  }, null, 2));
  writeFixtureFile(root, `${ep}/04_crosscheck.md`, "# crosscheck\nsource_file_current: 07_episodes/episode_081/01_ready.md\nsource_lines_current: L1-L8\n");
  writeFixtureFile(root, `${ep}/05_frozen.md`, "# frozen\nrole: 執筆直前の固定条件表。前段読了代替ではない。\n01_ready.md / 02_v2.md / 03_layer.md / 04_crosscheck.md\n");
  writeFixtureFile(root, `${ep}/06_execution_queue.md`, "# queue\n本文ではない。\n");
  writeFixtureFile(root, `${ep}/07_sources.md`, "# sources\n読了代替ではない。\n| 項目 | 参照元ファイル名 | 行範囲 | 正本区分 |\n|---|---|---|---|\n| ready | 07_episodes/episode_081/01_ready.md | L1-L8 | current_pack_story_condition |\n");
  return { tmp, root };
}

test("projectlocked real-pack gate inspects folder shape without demanding synthetic materialMap", () => {
  const { tmp, root } = makeProjectLockedFixture();
  try {
    const result = inspectProjectLockedPackDirectory(root);
    assert.equal(result.inspectDecision, "PROJECTLOCKED_PACK_INSPECT_OK");
    assert.equal(result.writeDecision, "PROJECTLOCKED_PACK_WRITE_READY");
    assert.deepEqual(result.missingRequiredMountIds, []);
    assert.equal(result.episodeCount, 1);
    assert.equal(result.episodeResults[0].decision, "EPISODE_SHAPE_OK");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("projectlocked root shape matches DS90 canonical handoff schema", () => {
  assert.ok(PROJECTLOCKED_ROOT_REQUIRED_FILES.includes("04_world_axis_layer_binding.json"));
  assert.ok(PROJECTLOCKED_ROOT_REQUIRED_SHELVES.includes("07_episodes"));
});

test("projectlocked write gate does not block for absent additional mounts and does not demand materialMap", () => {
  const { tmp, root } = makeProjectLockedFixture();
  try {
    const projectLockedResult = inspectProjectLockedPackDirectory(root);
    const input = validWriterInput();
    input.activation = {
      input_mode: PROJECTLOCKED_INPUT_MODE,
      activate_contracts: ["V2_FOLDER_RESTORE_CONTRACT", PROJECTLOCKED_CONTRACT_ID],
      degraded_mode: false,
      activation_source: "DESIGN",
      activation_id: "PW-PROJECTLOCKED-081",
      episode_id: "episode_081",
      episode_unit: "folder",
      auto_detection: "forbidden",
      activation_validity: {
        user_or_design_declared: true,
        filename_inference_allowed: false,
        folder_size_inference_allowed: false,
        style_inference_allowed: false
      }
    };
    input.projectLockedResult = projectLockedResult;
    input.preTextPickup = validProjectLockedPreTextPickup();
    input.fullPowerWriteGate = validFullPowerPreWriteGate(conditionIdsForEpisode("081"));
    delete input.materialMap;
    delete input.sourceFiles;
    const result = evaluateV2PreWrite(input);
    assert.equal(result.decision, "WRITE_ALLOWED");
    assert.ok(!result.failures.some((entry) => entry.code === "ADDITIONAL_MOUNT_NOT_REQUIRED_FOR_WRITABLE_PACK"));
    assert.ok(!result.failures.some((entry) => entry.code === "MATERIAL_MAP_MISSING"));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("projectlocked pack with verified required mounts can reach WRITE_ALLOWED without materialMap", () => {
  const { tmp, root } = makeProjectLockedFixture();
  try {
    const projectLockedResult = inspectProjectLockedPackDirectory(root, {
      availableMountIds: []
    });
    const input = validWriterInput();
    input.activation = {
      input_mode: PROJECTLOCKED_INPUT_MODE,
      activate_contracts: ["V2_FOLDER_RESTORE_CONTRACT", PROJECTLOCKED_CONTRACT_ID],
      degraded_mode: false,
      activation_source: "DESIGN",
      activation_id: "PW-PROJECTLOCKED-081",
      episode_id: "episode_081",
      episode_unit: "folder",
      auto_detection: "forbidden",
      activation_validity: {
        user_or_design_declared: true,
        filename_inference_allowed: false,
        folder_size_inference_allowed: false,
        style_inference_allowed: false
      }
    };
    input.projectLockedResult = projectLockedResult;
    input.preTextPickup = validProjectLockedPreTextPickup();
    input.fullPowerWriteGate = validFullPowerPreWriteGate(conditionIdsForEpisode("081"));
    delete input.materialMap;
    delete input.sourceFiles;
    const result = evaluateProjectLockedPreWrite(input);
    assert.equal(result.decision, "WRITE_ALLOWED");
    assert.equal(result.shelves.RESTORE_SOURCE.length, 2);
    assert.equal(result.shelves.RESTORE_CONSTRAINT.length, 2);
    assert.equal(result.shelves.PROCESS_ONLY.length, 2);
    assert.equal(result.shelves.PROCESS_ONLY[0].path, "07_episodes/episode_081/04_crosscheck.md");
    assert.equal(result.shelves.REFERENCE_ONLY[0].path, "07_episodes/episode_081/07_sources.md");
    assert.ok(result.shelves.DENY_AS_BODY_SOURCE.some((entry) => entry.path.endsWith("00_episode_index.md")));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("projectlocked layer autoInsert or shape drift stops before text", () => {
  const { tmp, root } = makeProjectLockedFixture({ autoInsert: true });
  try {
    const result = inspectProjectLockedPackDirectory(root, {
      availableMountIds: []
    });
    assert.equal(result.inspectDecision, "PROJECTLOCKED_PACK_SHAPE_FAILED");
    assert.ok(result.failures.some((entry) => entry.code === "LAYER_AUTO_INSERT_NOT_FALSE"));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});


test("writable ZIP story pack minimum accepts a txt-only pack and warns rather than rejecting non-canonical format", () => {
  const tmp = mkdtempSync(join(tmpdir(), "pw-writable-min-"));
  try {
    writeFixtureFile(tmp, "story.txt", "この話では、雨の駅で姉が弟へ嘘をつく。最後は白い傘を残して去る。\n");
    const result = inspectWritableStoryPackDirectory(tmp);
    assert.equal(result.inspectDecision, "WRITABLE_STORY_PACK_INSPECT_OK");
    assert.equal(result.writeDecision, "WRITABLE_STORY_PACK_WRITE_READY");
    assert.equal(result.minimumDefinitionSatisfied, true);
    assert.equal(result.canonicalFormatRequired, false);
    assert.equal(result.designerVersionRequired, false);
    assert.deepEqual(result.conditionSourceFiles, ["story.txt"]);
    assert.ok(result.warnings.some((entry) => entry.code === "NON_CANONICAL_BUT_WRITABLE_PACK_FORMAT"));
    assert.equal(result.shelves.RESTORE_SOURCE.length, 1);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("writable ZIP story pack gate rejects chat input as runtime story pack", () => {
  const result = inspectWritableStoryPackDirectory("ignored", { chatInput: true });
  assert.equal(result.inspectDecision, "WRITABLE_STORY_PACK_REJECTED");
  assert.equal(result.writeDecision, "STOP_BEFORE_TEXT");
  assert.ok(result.failures.some((entry) => entry.code === "CHAT_INPUT_NOT_ACCEPTED_AS_RUNTIME_STORY_PACK"));
  assert.equal(WRITER_CORE_INVARIANT.acceptsChatInputAsStoryPack, false);
  assert.equal(WRITER_CORE_INVARIANT.rejectsByDesignerVersion, false);
  assert.equal(WRITER_CORE_INVARIANT.rejectsByFormatLuxury, false);
});

test("writable ZIP story pack prewrite is artifact based and not designer-version based", () => {
  const tmp = mkdtempSync(join(tmpdir(), "pw-writable-prewrite-"));
  try {
    writeFixtureFile(tmp, "single.txt", "少女は古い灯台で、祖母の手紙を読む。条件はこの一文に全てある。\n");
    const pack = inspectWritableStoryPackDirectory(tmp);
    const pre = evaluateWritableStoryPackPreWrite({
      activation: { input_mode: WRITABLE_STORY_PACK_INPUT_MODE, designer_runtime_version: "any-version-is-provenance-only" },
      writableStoryPackResult: pack,
      fullPowerWriteGate: validFullPowerPreWriteGate(["REQ_PACK_001"])
    });
    assert.equal(pre.decision, "WRITE_ALLOWED");
    assert.equal(pre.shelves.RESTORE_SOURCE.length, 1);
    assert.deepEqual(pre.pickupConditionIds, ["REQ_PACK_001"]);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});


test("novel line final core document is mounted", () => {
  const core = readFileSync(new URL("../source/knowledge/NOVEL_LINE_FINAL_CORE_LOCK_v001.md", import.meta.url), "utf8");
  assert.ok(core.includes("条件内で一切の妥協をせずに、限界まで本文を出す"));
  for (const name of ["設計さん", "執筆さん", "修正刃さま", "野良ちゃん"]) assert.ok(core.includes(name));
});


test("runtime package has no change-log residue artifacts", () => {
  const term = (...codes) => String.fromCharCode(...codes);
  const forbidden = new RegExp([
    term(67,72,65,78,71,69,76,79,71),
    term(82,69,80,65,73,82,95,76,79,71),
    term(77,73,71,82,65,84,73,79,78,95,78,79,84,69,83),
    term(79,76,68,95,68,73,70,70),
    term(72,73,83,84,79,82,89),
    term(82,69,70,69,82,69,78,67,69,95,76,79,71,83),
    term(70,73,76,69,76,73,83,84)
  ].join("|"));
  const paths = SOURCE_MANIFEST.map((entry) => entry.path);
  for (const rel of paths) assert.equal(forbidden.test(rel), false, `${rel} is residue`);
  const joined = paths.map((rel) => readFileSync(new URL(`../${rel}`, import.meta.url), "utf8")).join("\n");
  const jp = (...codes) => String.fromCharCode(...codes);
  const deniedTerms = [
    jp(22793,26356,23653,27508),
    jp(20462,29702,23653,27508),
    jp(36942,21435,29256) + "ZIP",
    jp(26087,29256) + "ZIP" + jp(12381,12398,12418,12398)
  ];
  for (const term of deniedTerms) assert.equal(joined.includes(term), false);
});


test("DS90/PW90 handoff lock is artifact-based and not version-gated", () => {
  const lock = readFileSync(new URL("../source/knowledge/PW90_DS90_ARTIFACT_HANDOFF_JOINT_LOCK_v001.md", import.meta.url), "utf8");
  assert.ok(lock.includes("条件内で一切の妥協をせずに、限界まで本文を出す"));
  assert.ok(lock.includes("成果物"));
  assert.ok(lock.includes("DS90の版番号が違う"));
  assert.ok(lock.includes("拒否しない"));
  assert.equal(WRITER_CORE_INVARIANT.handoffBasis, "artifact_based_not_code_or_version_based");
});

test("full power no-thin success lock is mounted and exported", () => {
  const lock = readFileSync(new URL("../source/knowledge/PW90_FULL_POWER_NO_THIN_SUCCESS_LOCK_v001.md", import.meta.url), "utf8");
  assert.equal(FULL_POWER_WRITE_LOCK_ID, "PW90_FULL_POWER_NO_THIN_SUCCESS_LOCK");
  assert.ok(lock.includes("薄い本文をSUCCESSにしない"));
  assert.ok(lock.includes("ユーザー検収で発覚する薄さ"));
  assert.ok(READ_ORDER.includes("source/knowledge/PW90_FULL_POWER_NO_THIN_SUCCESS_LOCK_v001.md"));
  assert.deepEqual(validateFullPowerPreWriteGate({ gate: validFullPowerPreWriteGate(), pickupConditionIds: conditionIdsForEpisode() }), []);
  const pre = evaluateV2PreWrite(validWriterInput());
  assert.deepEqual(validateFullPowerPostTextGate({ preWriteResult: pre, gate: validFullPowerPostTextGate() }), []);
});


test("episode 15K full-use beta lock is mounted and enforced", () => {
  const lock = readFileSync(new URL("../source/knowledge/PW90_EPISODE_15K_FULL_USE_BETA_LOCK_v001.md", import.meta.url), "utf8");
  assert.equal(EPISODE_15K_FULL_USE_LOCK_ID, "PW90_EPISODE_15K_FULL_USE_BETA_LOCK");
  assert.equal(DEFAULT_EPISODE_SCALE_STANDARD, "15K");
  assert.ok(lock.includes("小説は1話15K字である"));
  assert.ok(lock.includes("話カード条件をすべて使って1話を出力する"));
  assert.ok(READ_ORDER.includes("source/knowledge/PW90_EPISODE_15K_FULL_USE_BETA_LOCK_v001.md"));
  assert.ok(REQUIRED_EPISODE_15K_PREWRITE_FLAGS.includes("episodeRecognizedAs15k"));
  assert.ok(REQUIRED_EPISODE_15K_POSTTEXT_FLAGS.includes("noFiveKCompletionShortcut"));

  const preGate = validFullPowerPreWriteGate();
  preGate.episodeScaleStandard = "5K";
  const preFailures = validateFullPowerPreWriteGate({ gate: preGate, pickupConditionIds: conditionIdsForEpisode() });
  assert.ok(preFailures.some((entry) => entry.code === "EPISODE_15K_STANDARD_NOT_DECLARED"));

  const input = validWriterInput();
  const pre = evaluateV2PreWrite(input);
  const postGate = validFullPowerPostTextGate();
  postGate.textScaleAudit.actualCharCount = 5000;
  postGate.textScaleAudit.readableFiveKCompletionAccepted = true;
  postGate.textScaleAudit.under15kFullBurnProof = "";
  const postFailures = validateFullPowerPostTextGate({ preWriteResult: pre, gate: postGate });
  assert.ok(postFailures.some((entry) => entry.code === "EPISODE_15K_FIVEK_COMPLETION_ACCEPTED"));
  assert.ok(postFailures.some((entry) => entry.code === "EPISODE_15K_UNDER15K_FULL_BURN_PROOF_REQUIRED"));
});

test("PW90 artifact equals full convergence lock is mounted and enforced", () => {
  const lock = readFileSync(new URL("../source/knowledge/PW90_ARTIFACT_EQUALS_FULL_CONVERGENCE_LOCK_v001.md", import.meta.url), "utf8");
  assert.ok(lock.includes("PW90の成果物 = 完全収束済み本文出力"));
  assert.ok(lock.includes("TS90 専用受領契約に依存しない"));

  const input = validWriterInput();
  const checks = validChecks();
  checks.fullConvergenceSweep.writerArtifactDeclared = false;
  checks.fullConvergenceSweep.textArtifactPrepared = false;
  const result = evaluateOutputGate({
    preWriteResult: evaluateV2PreWrite(input),
    activation: input.activation,
    output: validOutput(),
    checks,
    consumption: validConsumption()
  });
  assert.equal(result.decision, "FAILED_TEXT_QUARANTINE");
  assert.ok(result.failures.some((entry) => entry.code === "FULL_CONVERGENCE_SWEEP_FLAG_NOT_PASS" && entry.path.endsWith("writerArtifactDeclared")));
  assert.ok(result.failures.some((entry) => entry.code === "FULL_CONVERGENCE_SWEEP_FLAG_NOT_PASS" && entry.path.endsWith("textArtifactPrepared")));
});

test("current runtime files do not carry changelog-style version history in README or START_HERE", () => {
  const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
  const start = readFileSync(new URL("../START_HERE.js", import.meta.url), "utf8");
  assert.equal(/## v004\.[0-9]/.test(readme), false);
  assert.equal(/v004\.[0-9]:/.test(start), false);
  assert.equal(/REMOVED IN v004/.test(start), false);
  assert.ok(readme.includes("現行一本道"));
});


test("nora core regularization lock is mounted and enforced", () => {
  const lock = readFileSync(new URL("../source/knowledge/PW90_NORA_CORE_REGULARIZED_GUARDRAIL_LOCK_v001.md", import.meta.url), "utf8");
  assert.equal(NORA_CORE_REGULARIZATION_LOCK_ID, "PW90_NORA_CORE_REGULARIZED_GUARDRAIL_LOCK");
  assert.ok(lock.includes("NORA_CORE_WRITER = 本文生成炉"));
  assert.ok(READ_ORDER.includes("source/knowledge/PW90_NORA_CORE_REGULARIZED_GUARDRAIL_LOCK_v001.md"));
  const preFailures = validateNoraCorePreWriteGate({ gate: {
    flags: {
      noraCoreAsBodyEngine: true,
      pw90GuardrailAsSuccessJudge: true,
      bodyLocalAdditionAllowedWhenNonContradictory: true,
      localConcreteNotPromotedToCanon: true,
      chatVoiceNotLeakedIntoBody: true,
      layerTermsNotLeakedIntoBody: true,
      generalizationEscapeDenied: true,
      bodyFirstLogSecond: true,
      readableCompletionNotStopPoint: true
    },
    bodyEngine: "NORA_CORE_WRITER",
    successJudge: "PW90_GUARDRAIL",
    bodyLocalPolicy: "allow_noncontradictory_local_concrete",
    autoPromotionAllowed: false,
    writeBeforeBootAllowed: false,
    bootReadyEqualsWriteReady: false
  }});
  assert.deepEqual(preFailures, []);
  const postFailures = validateNoraCorePostTextGate({ gate: {
    flags: {
      noraHeatDeliveredWithoutCooling: true,
      bodyLocalAdditionsClassified: true,
      noUnclassifiedNoraResidue: true,
      noCanonPromotionFromTrialAdditions: true,
      noNewSettingReplacedRequiredCondition: true,
      bodyFirstLogSecondObserved: true,
      noGeneralizedMoralSubstitution: true,
      localConcreteStrengthenedPackCore: true
    },
    additionClassification: [{
      item: "local prop",
      class: "BODY_LOCAL",
      reason: "strengthens pack core without future obligation",
      contradictsPack: false,
      promotedToCanon: false,
      createsFutureObligation: false
    }],
    cooledByWarnings: false,
    generalizedMoralSubstitution: false,
    chatVoiceLeakedIntoBody: false,
    layerTermsLeakedIntoBody: false
  }});
  assert.deepEqual(postFailures, []);
});

test("auto mount boot hard lock and full delivery body-first lock are mounted", () => {
  const bootLock = readFileSync(new URL("../source/knowledge/PW90_AUTO_MOUNT_BOOT_HARD_LOCK_v001.md", import.meta.url), "utf8");
  const deliveryLock = readFileSync(new URL("../source/knowledge/PW90_FULL_DELIVERY_AND_BODY_FIRST_LOCK_v001.md", import.meta.url), "utf8");
  assert.equal(AUTO_MOUNT_BOOT_HARD_LOCK_ID, "PW90_AUTO_MOUNT_BOOT_HARD_LOCK");
  assert.equal(FULL_DELIVERY_BODY_FIRST_LOCK_ID, "PW90_FULL_DELIVERY_AND_BODY_FIRST_LOCK");
  assert.ok(bootLock.includes("マウント済みは読了ではない"));
  assert.ok(deliveryLock.includes("本文本体を優先する"));
  assert.ok(READ_ORDER.includes("source/knowledge/PW90_AUTO_MOUNT_BOOT_HARD_LOCK_v001.md"));
  assert.ok(READ_ORDER.includes("source/knowledge/PW90_FULL_DELIVERY_AND_BODY_FIRST_LOCK_v001.md"));
});


test("read order includes new episode full boot rollback lock", () => {
  assert.ok(READ_ORDER.includes("source/knowledge/PW90_NEW_EPISODE_FULL_BOOT_ROLLBACK_LOCK_v001.md"));
});
