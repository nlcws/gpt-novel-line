export const PUBLIC_RUNTIME_SOURCES = Object.freeze({
  portal: "https://gpt-novel-line-portal.harmoniets.chatgpt.site/",
  archiveDirectLink: "https://runtime-public-archive.harmoniets.chatgpt.site/#file-28c7b48c1498749d"
});

export const DIRECT_RUNTIME_000C = Object.freeze({
  controlShelf: "current mount 000_C.zip",
  manifest: "000_C/00_READ_FIRST/RUNTIME_DIRECT_DISPATCH.json",
  source: "CURRENT_MOUNT_CONTROL_SHELF",
  resolutionRule: "Resolve the concrete runtime path and sha256 only from RUNTIME_DIRECT_DISPATCH.json in the current mount 000_C.zip.",
  routes: Object.freeze({
    MT00: Object.freeze({
      operation: "MOUNT_TRANSFER",
      dispatchManifest: "000_C/00_READ_FIRST/RUNTIME_DIRECT_DISPATCH.json",
      dispatchRoute: "routes.MOUNT_TRANSFER",
      requiresCurrentMount000C: true
    }),
    SP00: Object.freeze({
      operation: "PACK_CUTOUT",
      dispatchManifest: "000_C/00_READ_FIRST/RUNTIME_DIRECT_DISPATCH.json",
      dispatchRoute: "routes.PACK_CUTOUT",
      requiresCurrentMount000C: true
    }),
    PW90_STORY_PACK_RECEIVER_CHECKER: Object.freeze({
      operation: "STORY_PACK_RECEIVER_CHECK",
      dispatchManifest: "000_C/00_READ_FIRST/RUNTIME_DIRECT_DISPATCH.json",
      dispatchRoute: "routes.STORY_PACK_RECEIVER_CHECK",
      requiresCurrentMount000C: true,
      requiredPredecessorLine: Object.freeze([
        "NAL_PACK_CUTOUT",
        "NAL_PACK_CHECK",
        "PW90_RECEIVER_CHECK"
      ])
    }),
    MT00_BOOTSTRAP_EA: Object.freeze({
      operation: "MOUNT_ZIP_BOOTSTRAP",
      dispatchManifest: "000_C/00_READ_FIRST/RUNTIME_DIRECT_DISPATCH.json",
      dispatchRoute: "routes.MOUNT_ZIP_BOOTSTRAP",
      requiresCurrentMount000C: true,
      residentCore: true
    })
  })
});

export const SPECIALIST_HANDOFFS = Object.freeze({
  MT00: {
    runtime: "MT00 / Nul / ヌル",
    purpose: "MOUNT_TRANSFER",
    directRuntime: DIRECT_RUNTIME_000C.routes.MT00,
    ownershipQuestion: null,
    recommendedAction: "Read current mount 000_C/00_READ_FIRST/RUNTIME_DIRECT_DISPATCH.json, select routes.MOUNT_TRANSFER, verify the dispatch path and sha256 against 000_C contents, then invoke that lane. DS90 does not make MT00_HANDOFF_SEED mandatory.",
    missingRuntimeAction: "STOP if current mount 000_C.zip, RUNTIME_DIRECT_DISPATCH.json, routes.MOUNT_TRANSFER, the selected path, or its sha256 match is absent. Public portal/archive is only a fallback distribution path.",
    fallbackAction: "DS90 minimum MOUNT_TRANSFER route is exception-only when MT00 is unavailable or the user explicitly commands DS90 to continue without MT00; DS90 must state that it is not MT00-complete.",
    acquisitionLinks: PUBLIC_RUNTIME_SOURCES
  },
  SP00: {
    runtime: "SP00 / Nal / ナル",
    purpose: "STORY_PACK_CUTOUT",
    directRuntime: DIRECT_RUNTIME_000C.routes.SP00,
    ownershipQuestion: null,
    recommendedAction: "Read current mount 000_C/00_READ_FIRST/RUNTIME_DIRECT_DISPATCH.json, select routes.PACK_CUTOUT, verify the dispatch path and sha256 against 000_C contents, then invoke that lane. DS90 does not make SP00_HANDOFF_SEED mandatory.",
    missingRuntimeAction: "STOP if current mount 000_C.zip, RUNTIME_DIRECT_DISPATCH.json, routes.PACK_CUTOUT, the selected path, or its sha256 match is absent. Public portal is only a fallback distribution path.",
    fallbackAction: "DS90 minimum PACK_CUTOUT route is exception-only when SP00 is unavailable or the user explicitly commands DS90 to continue without SP00; DS90 must state that it is not SP00-complete.",
    acquisitionLinks: { portal: PUBLIC_RUNTIME_SOURCES.portal }
  },
  MT00_BOOTSTRAP_EA: {
    runtime: "MT00_BOOTSTRAP / Ea / エーア",
    purpose: "MOUNT_ZIP_BOOTSTRAP",
    directRuntime: DIRECT_RUNTIME_000C.routes.MT00_BOOTSTRAP_EA,
    ownershipQuestion: null,
    recommendedAction: "Read current mount 000_C/00_READ_FIRST/RUNTIME_DIRECT_DISPATCH.json, select routes.MOUNT_ZIP_BOOTSTRAP, verify the dispatch path and sha256 against 000_C contents, then read the selected resident Ea core. Resolve the external distribution Ea runtime only from that resident core.",
    missingRuntimeAction: "STOP if current mount 000_C.zip, RUNTIME_DIRECT_DISPATCH.json, routes.MOUNT_ZIP_BOOTSTRAP, the selected resident core path, its sha256 match, or the resident core's external distribution runtime resolution is absent.",
    fallbackAction: "DS90 must not replace Ea bootstrap execution. It may explain the route only.",
    acquisitionLinks: { source: "EA_RESIDENT_CORE.distribution_runtime_resolution" }
  },
  PW90_STORY_PACK_RECEIVER_CHECKER: {
    runtime: "PW90 story pack receiver checker / 執筆さん受領チェッカー",
    purpose: "STORY_PACK_RECEIVER_CHECK",
    directRuntime: DIRECT_RUNTIME_000C.routes.PW90_STORY_PACK_RECEIVER_CHECKER,
    ownershipQuestion: null,
    recommendedAction: "After Nal story-pack cutout and Nal pack confirmation, read current mount 000_C/00_READ_FIRST/RUNTIME_DIRECT_DISPATCH.json, select routes.STORY_PACK_RECEIVER_CHECK, verify the dispatch path and sha256 against 000_C contents, then invoke that lane for PW90 receiver-line acceptance.",
    missingRuntimeAction: "STOP if current mount 000_C.zip, RUNTIME_DIRECT_DISPATCH.json, routes.STORY_PACK_RECEIVER_CHECK, the selected checker path, or its sha256 match is absent.",
    fallbackAction: "DS90 must not replace PW90 receiver-line acceptance. It may explain the missing route only.",
    acquisitionLinks: { source: "current mount 000_C.zip" }
  },
  PW90: {
    runtime: "PW90 / 執筆さん",
    purpose: "WRITING",
    guidanceMode: "LIGHT_PORTAL_AND_USAGE_GUIDANCE",
    ownershipQuestion: null,
    recommendedAction: "Use the public portal route and explain how to start PW90 with a writer-ready story pack. DS90 does not need the heavy MT00/SP00 ownership flow for PW90.",
    missingRuntimeAction: "Guide the user to the public portal and explain that PW90 uses writer-ready story pack input.",
    fallbackAction: "DS90 may explain usage, but must not claim to replace PW90 as a full writing runtime.",
    acquisitionLinks: { portal: PUBLIC_RUNTIME_SOURCES.portal }
  },
  TS90: {
    runtime: "TS90 / 修正刃さま",
    purpose: "REVISION",
    guidanceMode: "LIGHT_PORTAL_AND_USAGE_GUIDANCE",
    ownershipQuestion: null,
    recommendedAction: "Use the public portal route and explain how to start TS90 with target body text and bounded revision instructions. DS90 does not need the heavy MT00/SP00 ownership flow for TS90.",
    missingRuntimeAction: "Guide the user to the public portal and explain that TS90 uses target body text plus revision instructions.",
    fallbackAction: "DS90 may explain usage, but must not claim to replace TS90 as a full revision runtime.",
    acquisitionLinks: { portal: PUBLIC_RUNTIME_SOURCES.portal }
  }
});

function normalize(value) {
  return String(value ?? "").toLowerCase();
}

function detectTarget(input) {
  const explicit = String(input?.payload?.specialistTarget ?? input?.specialistTarget ?? "").toUpperCase();
  if (SPECIALIST_HANDOFFS[explicit]) return explicit;
  const text = normalize(`${input?.command ?? ""} ${input?.payload?.intent ?? ""}`);
  if (text.includes("ts90") || text.includes("修正刃") || text.includes("本文修正") || text.includes("修正")) return "TS90";
  if (text.includes("pw90_story_pack_receiver_checker") || text.includes("story_pack_receiver_check") || text.includes("受領チェッカー") || text.includes("受領チェック") || text.includes("受領確定")) return "PW90_STORY_PACK_RECEIVER_CHECKER";
  if (text.includes("pw90") || text.includes("執筆さん") || text.includes("本文出力") || text.includes("本文を書") || text.includes("本文生成")) return "PW90";
  if (text.includes("mt00_bootstrap") || text.includes("エーア") || text.includes("マウントzip構築") || text.includes("マウントzip作成") || text.includes("初回project") || text.includes("初回プロジェクト") || text.includes("初回棚")) return "MT00_BOOTSTRAP_EA";
  if (text.includes("sp00") || text.includes("ナル") || text.includes("話パック")) return "SP00";
  if (text.includes("mt00") || text.includes("ヌル") || text.includes("移管") || text.includes("チャットを跨")) return "MT00";
  return "UNKNOWN";
}

function ownershipState(input) {
  const owned = input?.payload?.runtimeOwned ?? input?.runtimeOwned;
  if (owned === true) return "OWNED_OR_AVAILABLE";
  if (owned === false) return "MISSING_RUNTIME";
  return "CHECK_RUNTIME_OWNERSHIP";
}

function ds90MinimumExceptionRequested(input) {
  return input?.payload?.forceDs90MinimumRoute === true || input?.forceDs90MinimumRoute === true;
}

function isDefaultComplianceTarget(target) {
  return target === "MT00" || target === "SP00" || target === "PW90_STORY_PACK_RECEIVER_CHECKER";
}

function isLightPortalGuidanceTarget(target) {
  return target === "PW90" || target === "TS90";
}

export const specialistHandoffModule = Object.freeze({
  id: "SPECIALIST_HANDOFF",
  loadWhen: ["GPT内専門ランタイム動線", "執筆さん投入", "修正刃さま投入"],
  rules: [],
  validate(input) {
    const target = detectTarget(input);
    if (target === "UNKNOWN") {
      return {
        issues: [{
          code: "SPECIALIST_TARGET_REQUIRED",
          severity: "STOP",
          path: "payload.specialistTarget",
          message: "MT00/SP00/MT00_BOOTSTRAP_EA/PW90/TS90のいずれかの専門ランタイム対象を指定してください"
        }]
      };
    }
    const state = ownershipState(input);
    const exceptionRequested = ds90MinimumExceptionRequested(input);
    const handoff = SPECIALIST_HANDOFFS[target];
    let nextAction = "ASK_USER_IF_RUNTIME_ZIP_IS_OWNED_OR_AVAILABLE";
    if (isLightPortalGuidanceTarget(target)) {
      nextAction = state === "OWNED_OR_AVAILABLE"
        ? "EXPLAIN_SPECIALIST_USAGE_WITH_OWNED_RUNTIME"
        : "EXPLAIN_PORTAL_AND_USAGE_PATH";
    } else {
      nextAction = "INVOKE_CURRENT_MOUNT_000_C_RUNTIME_AND_STOP_DS90_HOLDING_WORK";
      if (state === "MISSING_RUNTIME") nextAction = "STOP_DIRECT_RUNTIME_ZIP_MISSING";
      if (state === "OWNED_OR_AVAILABLE" && isDefaultComplianceTarget(target) && exceptionRequested) {
        nextAction = "DS90_MINIMUM_EXCEPTION_ROUTE_WITH_LIMITATION_NOTICE";
      }
    }
    return {
      issues: [],
      output: {
        target,
        handoff,
        runtimeOwnershipState: isLightPortalGuidanceTarget(target) ? state : "CURRENT_MOUNT_000_C_REQUIRED",
        specialistDefaultCompliance: isDefaultComplianceTarget(target),
        lightPortalGuidanceOnly: isLightPortalGuidanceTarget(target),
        ds90MinimumExceptionRequested: exceptionRequested,
        ownershipCheckRequired: false,
        directRuntimeControlShelf: DIRECT_RUNTIME_000C.controlShelf,
        directRuntimeManifest: DIRECT_RUNTIME_000C.manifest,
        directRuntimeResolutionRule: DIRECT_RUNTIME_000C.resolutionRule,
        directRuntime: handoff.directRuntime ?? null,
        publicRuntimeSources: PUBLIC_RUNTIME_SOURCES,
        nextAction,
        flowVersion: "v0301-direct-runtime-000c",
        noGitRequired: true,
        chatgptProjectPath: true,
        sourceThreadHandoffSeedRequired: false,
        mandatoryHandoffSeed: false,
        ds90MustNotForceSeed: true,
        ds90MayOfferOptionalPreparationHelp: true,
        ds90MayExplainPw90Ts90UsageInOneThread: isLightPortalGuidanceTarget(target),
        ds90DoesNotAskNormalNulNalDeclineChoice: true,
        ds90MustStateFallbackIsNotSpecialistComplete: nextAction === "DS90_MINIMUM_EXCEPTION_ROUTE_WITH_LIMITATION_NOTICE",
        ds90DoesNotSubstituteSpecialistRuntime: true
      }
    };
  }
});
