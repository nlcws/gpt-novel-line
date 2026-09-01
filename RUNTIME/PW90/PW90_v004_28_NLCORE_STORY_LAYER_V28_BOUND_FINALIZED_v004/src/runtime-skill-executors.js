import { evaluateInitialMountBoot } from "./auto-mount-boot.js";
import { resolveNewEpisodeBootMode, validateNewEpisodeFullBootGate } from "./new-episode-full-boot-lock.js";
import { inspectWritableStoryPackDirectory } from "./writable-story-pack-gate.js";
import { inspectProjectLockedPackDirectory } from "./projectlocked-pack-gate.js";
import { evaluateV2PreWrite, evaluateOutputGate } from "./v2-folder-restore-contract.js";
import { validatePostTextPickupLedger } from "./pickup-ledger-gate.js";
import { validateFullPowerPostTextGate } from "./full-power-write-lock.js";
import { validateNoraCorePostTextGate } from "./nora-regularization-lock.js";
import { validateNoChatDisplayCompressionGate } from "./chat-display-compression-lock.js";
import { SECOND_DRAFT_BODY_HEAD_DIRECTIVE, validateSecondDraftTextHead, validateSecondDraftPostText } from "./second-draft-branch-lock.js";
import { observeNormalFullburnBody, observeSecondDraftBody } from "./body-char-observer.js";
import { validateEpisodeBridgeGate } from "./episode-bridge-draft-lock.js";
import { RUNTIME_SKILL_IDS } from "./runtime-vocabulary.js";

const failResult = (skillId, decision, failures, extra = {}) => Object.freeze({
  skillId, decision, pass: false, failures: Object.freeze([...(failures ?? [])]), ...extra
});
const passResult = (skillId, decision, extra = {}) => Object.freeze({
  skillId, decision, pass: true, failures: Object.freeze([]), ...extra
});
const hostAction = (skillId, action, contract = {}) => Object.freeze({
  skillId, decision: "HOST_ACTION_REQUIRED", pass: null, hostAction: action,
  contract: Object.freeze({ ...contract }), failures: Object.freeze([])
});

export const SKILL_EXECUTOR_STATUS = Object.freeze({
  [RUNTIME_SKILL_IDS.MOUNT_BOOT]: "DETERMINISTIC",
  [RUNTIME_SKILL_IDS.NEW_EPISODE_FULL_BOOT]: "DETERMINISTIC",
  [RUNTIME_SKILL_IDS.STORY_PACK_ACCEPT]: "DETERMINISTIC",
  [RUNTIME_SKILL_IDS.PREWRITE_CONDITION_BUILD]: "DETERMINISTIC",
  [RUNTIME_SKILL_IDS.FULLBURN_BODY_WRITE_21C]: "HOST_BODY",
  [RUNTIME_SKILL_IDS.EXTERNAL_SECOND_DRAFT]: "HOST_BODY",
  [RUNTIME_SKILL_IDS.LIGHTWEIGHT_WRITE]: "BLOCKED_UNRESOLVED",
  [RUNTIME_SKILL_IDS.POSTTEXT_AUDIT]: "DETERMINISTIC",
  [RUNTIME_SKILL_IDS.FULL_CONVERGENCE_SWEEP]: "SOLE_SUCCESS_AUTHORITY",
  [RUNTIME_SKILL_IDS.ARTIFACT_BUILD]: "DETERMINISTIC_POST_SUCCESS",
  [RUNTIME_SKILL_IDS.NEXT_EPISODE_BRIDGE]: "HOST_BRIDGE_AND_GATE",
  [RUNTIME_SKILL_IDS.USER_DELIVERY_EXISTING_CONTRACT]: "DELIVERY_ONLY"
});

export function executeRuntimeSkill({ skillId, session, payload = {} } = {}) {
  switch (skillId) {
    case RUNTIME_SKILL_IDS.MOUNT_BOOT: {
      const result = evaluateInitialMountBoot(payload.mountState ?? session.input?.mountState ?? {});
      return result.decision === "BOOT_READY"
        ? passResult(skillId, "BOOT_READY", { result })
        : failResult(skillId, result.decision, result.failures, { result });
    }
    case RUNTIME_SKILL_IDS.NEW_EPISODE_FULL_BOOT: {
      const cfg = payload.newEpisode ?? session.input?.newEpisode ?? {};
      const resolution = resolveNewEpisodeBootMode(cfg);
      if (resolution.decision === "STOP_BEFORE_TEXT") return failResult(skillId, "STOP_BEFORE_TEXT", resolution.failures, { resolution });
      if (resolution.bootMode !== "NEW_EPISODE_FULL_BOOT") {
        return failResult(skillId, "STOP_BEFORE_TEXT", [{ code: "SAME_EPISODE_CONTINUATION_REQUIRES_SEPARATE_RESTITCH_CONTRACT", path: "newEpisode" }], { resolution });
      }
      const failures = validateNewEpisodeFullBootGate({ gate: payload.newEpisodeGate ?? session.input?.newEpisodeGate });
      return failures.length === 0
        ? passResult(skillId, "NEW_EPISODE_FULL_BOOT_PASS", { resolution })
        : failResult(skillId, "STOP_BEFORE_TEXT", failures, { resolution });
    }
    case RUNTIME_SKILL_IDS.STORY_PACK_ACCEPT: {
      const pack = payload.pack ?? session.input?.pack ?? {};
      if (pack.kind === "WRITABLE_ZIP") {
        if (!pack.root) return failResult(skillId, "STOP_BEFORE_TEXT", [{ code: "WRITABLE_PACK_ROOT_REQUIRED", path: "pack.root" }]);
        const inspection = inspectWritableStoryPackDirectory(pack.root, { chatInput: pack.chatInput === true });
        return inspection.inspectDecision === "WRITABLE_STORY_PACK_INSPECT_OK" && inspection.minimumDefinitionSatisfied === true
          ? passResult(skillId, "STORY_PACK_ACCEPTED_PREWRITE_EXTRACTION_REQUIRED", { packKind: pack.kind, inspection })
          : failResult(skillId, "STOP_BEFORE_TEXT", inspection.failures, { packKind: pack.kind, inspection });
      }
      if (pack.kind === "PROJECTLOCKED") {
        if (!pack.root) return failResult(skillId, "STOP_BEFORE_TEXT", [{ code: "PROJECTLOCKED_PACK_ROOT_REQUIRED", path: "pack.root" }]);
        const inspection = inspectProjectLockedPackDirectory(pack.root, pack.options ?? {});
        return inspection.writeDecision === "PROJECTLOCKED_PACK_WRITE_READY"
          ? passResult(skillId, "STORY_PACK_ACCEPTED", { packKind: pack.kind, inspection })
          : failResult(skillId, "STOP_BEFORE_TEXT", inspection.failures, { packKind: pack.kind, inspection });
      }
      if (pack.kind === "V2_EPISODE_FOLDER") {
        return passResult(skillId, "STORY_PACK_ACCEPTED", { packKind: pack.kind, inspection: null });
      }
      return failResult(skillId, "STOP_BEFORE_TEXT", [{ code: "STORY_PACK_KIND_REQUIRED", path: "pack.kind", detail: pack.kind ?? null }]);
    }
    case RUNTIME_SKILL_IDS.PREWRITE_CONDITION_BUILD: {
      const base = { ...(payload.prewriteInput ?? session.input?.prewriteInput ?? {}) };
      const accepted = session.skillResults?.[RUNTIME_SKILL_IDS.STORY_PACK_ACCEPT];
      if (base.hardBindingState == null) base.hardBindingState = payload.hardBindingState ?? session.input?.hardBindingState ?? null;
      if (accepted?.packKind === "WRITABLE_ZIP" && base.writableStoryPackResult == null) base.writableStoryPackResult = accepted.inspection;
      if (accepted?.packKind === "PROJECTLOCKED" && base.projectLockedResult == null) base.projectLockedResult = accepted.inspection;
      const result = evaluateV2PreWrite(base);
      return result.decision === "WRITE_ALLOWED"
        ? passResult(skillId, "WRITE_ALLOWED", { preWriteResult: result, activation: base.activation ?? null })
        : failResult(skillId, "STOP_BEFORE_TEXT", result.failures, { preWriteResult: result, activation: base.activation ?? null });
    }
    case RUNTIME_SKILL_IDS.FULLBURN_BODY_WRITE_21C: {
      const host = payload.hostBodyResult ?? session.input?.hostBodyResult;
      if (host == null) return hostAction(skillId, "FULLBURN_BODY_WRITE_21C", {
        bodyEngine: "NORA_CORE_WRITER", successJudge: "PW90_GUARDRAIL", bodyRoute: session.plan?.bodyRoute,
        preWriteResultAvailable: session.skillResults?.[RUNTIME_SKILL_IDS.PREWRITE_CONDITION_BUILD]?.pass === true,
        mandatoryInternalRevisionCount: 0, syntheticDraftCycleRequired: false
      });
      if (typeof host.output?.text !== "string" || host.output.text.length === 0) return failResult(skillId, "FAILED_TEXT_QUARANTINE", [{ code: "HOST_BODY_TEXT_REQUIRED", path: "hostBodyResult.output.text" }]);
      return passResult(skillId, "HOST_BODY_RETURNED", { hostBodyResult: host });
    }
    case RUNTIME_SKILL_IDS.EXTERNAL_SECOND_DRAFT: {
      const host = payload.hostBodyResult ?? session.input?.hostBodyResult;
      if (host == null) return hostAction(skillId, "EXTERNAL_SECOND_DRAFT", {
        bodyEngine: "NORA_CORE_WRITER", successJudge: "PW90_GUARDRAIL", bodyRoute: session.plan?.bodyRoute,
        existingDraftRequired: true, targetBodyChars: 15000, hardMinBodyChars: null, under15kRequiresFullBurnProof: true
      });
      const failures = [...validateSecondDraftTextHead(host.output?.text ?? "")];
      if (failures.length) return failResult(skillId, "FAILED_TEXT_QUARANTINE", failures);
      return passResult(skillId, "HOST_SECOND_DRAFT_RETURNED", { hostBodyResult: host });
    }
    case RUNTIME_SKILL_IDS.LIGHTWEIGHT_WRITE:
      return failResult(skillId, "STOP_BEFORE_TEXT", [{ code: "LIGHTWEIGHT_ROUTE_UNRESOLVED", path: "bodyRoute" }], { unresolved: true });
    case RUNTIME_SKILL_IDS.POSTTEXT_AUDIT: {
      const bodySkillId = session.plan?.bodyRoute === "PACK_PLUS_BODY_TEXT_SECOND_DRAFT" ? RUNTIME_SKILL_IDS.EXTERNAL_SECOND_DRAFT : RUNTIME_SKILL_IDS.FULLBURN_BODY_WRITE_21C;
      const host = payload.hostBodyResult ?? session.skillResults?.[bodySkillId]?.hostBodyResult ?? session.input?.hostBodyResult ?? {};
      const preWriteResult = session.skillResults?.[RUNTIME_SKILL_IDS.PREWRITE_CONDITION_BUILD]?.preWriteResult;
      const failures = [];
      failures.push(...validatePostTextPickupLedger({ preWriteResult, output: host.output, postTextCheck: host.checks?.postTextCheck }));
      const normalObservation = observeNormalFullburnBody(host.output?.text ?? "");
      failures.push(...validateFullPowerPostTextGate({ preWriteResult, gate: host.checks?.fullPowerWriteLock, bodyText: host.output?.text ?? "" }));
      failures.push(...validateNoraCorePostTextGate({ gate: host.checks?.noraCoreGuardrail }));
      failures.push(...validateNoChatDisplayCompressionGate({ gate: host.checks?.noChatDisplayCompressionGate }));
      const secondDraftObservation = session.plan?.bodyRoute === "PACK_PLUS_BODY_TEXT_SECOND_DRAFT" ? observeSecondDraftBody(host.output?.text ?? "", SECOND_DRAFT_BODY_HEAD_DIRECTIVE) : null;
      if (session.plan?.bodyRoute === "PACK_PLUS_BODY_TEXT_SECOND_DRAFT") failures.push(...validateSecondDraftPostText({ gate: host.checks?.secondDraftPostTextGate, text: host.output?.text ?? "" }));
      return failures.length === 0
        ? passResult(skillId, "POSTTEXT_AUDIT_PASS", { hostBodyResult: host, observedBodyCharCount: normalObservation.observedBodyCharCount, observedSecondDraftBodyCharCount: secondDraftObservation?.observedBodyCharCount ?? null })
        : failResult(skillId, "FAILED_TEXT_QUARANTINE", failures, { hostBodyResult: host, observedBodyCharCount: normalObservation.observedBodyCharCount, observedSecondDraftBodyCharCount: secondDraftObservation?.observedBodyCharCount ?? null });
    }
    case RUNTIME_SKILL_IDS.FULL_CONVERGENCE_SWEEP: {
      const post = session.skillResults?.[RUNTIME_SKILL_IDS.POSTTEXT_AUDIT];
      const host = payload.hostBodyResult ?? post?.hostBodyResult ?? session.input?.hostBodyResult ?? {};
      const pre = session.skillResults?.[RUNTIME_SKILL_IDS.PREWRITE_CONDITION_BUILD];
      const result = evaluateOutputGate({
        preWriteResult: pre?.preWriteResult,
        activation: pre?.activation,
        output: host.output,
        checks: host.checks,
        consumption: host.consumption
      });
      return result.decision === "SUCCESS"
        ? passResult(skillId, "SUCCESS", { success: true, outputGateResult: result, artifact: result.artifact, output: result.output })
        : failResult(skillId, result.decision, result.failures, { success: false, outputGateResult: result });
    }
    case RUNTIME_SKILL_IDS.ARTIFACT_BUILD: {
      const success = session.skillResults?.[RUNTIME_SKILL_IDS.FULL_CONVERGENCE_SWEEP];
      if (success?.decision !== "SUCCESS" || success?.success !== true) return failResult(skillId, "STOP", [{ code: "S08_SUCCESS_REQUIRED_BEFORE_ARTIFACT", path: "skillResults.S08" }]);
      const artifact = Object.freeze({ ...success.artifact, output: success.output, successAuthority: RUNTIME_SKILL_IDS.FULL_CONVERGENCE_SWEEP });
      return passResult(skillId, "ARTIFACT_READY", { artifact });
    }
    case RUNTIME_SKILL_IDS.NEXT_EPISODE_BRIDGE: {
      const bridgeGate = payload.bridgeGate ?? session.input?.bridgeGate;
      if (bridgeGate == null) return hostAction(skillId, "NEXT_EPISODE_OPENING_BRIDGE", {
        status: "HANDOFF_ONLY_NOT_CANON", countsAsCurrentEpisodeText: false, replacesNextEpisodePackReread: false
      });
      const failures = validateEpisodeBridgeGate({ gate: bridgeGate });
      return failures.length === 0
        ? passResult(skillId, "NEXT_EPISODE_BRIDGE_READY", { bridgeGate })
        : failResult(skillId, "STOP", failures, { bridgeGate });
    }
    case RUNTIME_SKILL_IDS.USER_DELIVERY_EXISTING_CONTRACT: {
      const artifact = session.skillResults?.[RUNTIME_SKILL_IDS.ARTIFACT_BUILD]?.artifact;
      const success = session.skillResults?.[RUNTIME_SKILL_IDS.FULL_CONVERGENCE_SWEEP];
      if (success?.decision !== "SUCCESS" || artifact == null) return failResult(skillId, "STOP", [{ code: "ACCEPTED_ARTIFACT_REQUIRED_FOR_DELIVERY", path: "artifact" }]);
      return passResult(skillId, "DELIVERY_READY", {
        delivery: Object.freeze({ artifact, bridge: session.skillResults?.[RUNTIME_SKILL_IDS.NEXT_EPISODE_BRIDGE]?.bridgeGate ?? null }),
        upstreamSuccessAuthority: RUNTIME_SKILL_IDS.FULL_CONVERGENCE_SWEEP,
        createsSuccess: false
      });
    }
    default:
      return failResult(skillId ?? null, "STOP", [{ code: "UNKNOWN_RUNTIME_SKILL", path: "skillId", detail: skillId ?? null }]);
  }
}
