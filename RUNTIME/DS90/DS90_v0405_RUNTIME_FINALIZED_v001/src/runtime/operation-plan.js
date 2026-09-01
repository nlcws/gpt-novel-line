const LOCAL_PROJECT_OPERATIONS = Object.freeze(new Set([
  "CHECK", "TAG_SEARCH", "CARD", "CARD_TEST", "LOG", "ARCHIVE",
  "SINGLE_EPISODE_PROFILE_GATE", "EPISODE_PACK"
]));

const SPECIALIST_OPERATIONS = Object.freeze(new Set([
  "MOUNT_TRANSFER", "PACK_CUTOUT", "MOUNT_ZIP_BOOTSTRAP", "SPECIALIST_HANDOFF"
]));

export function buildOperationPlan(operation, request, spec) {
  const forceMinimum = request?.payload?.forceDs90MinimumRoute === true;
  if (operation === "BOOT") {
    return Object.freeze({ operation, kind: "BOOT_LOCAL", tool: "CORE", requiresProjectKnowledge: false });
  }
  if (SPECIALIST_OPERATIONS.has(operation)) {
    if (forceMinimum && (operation === "MOUNT_TRANSFER" || operation === "PACK_CUTOUT")) {
      return Object.freeze({
        operation,
        kind: "DS90_MINIMUM_FALLBACK",
        tool: spec.fallbackTool,
        requiresProjectKnowledge: false,
        limitationNoticeRequired: true
      });
    }
    return Object.freeze({
      operation,
      kind: "SPECIALIST_HOST",
      tool: "SPECIALIST_DISPATCH",
      requiresProjectKnowledge: false,
      fallbackTool: spec.fallbackTool ?? null
    });
  }
  if (LOCAL_PROJECT_OPERATIONS.has(operation)) {
    return Object.freeze({
      operation,
      kind: "LOCAL_PROJECT_VALIDATION",
      tool: spec.tool,
      requiresProjectKnowledge: true
    });
  }
  return Object.freeze({
    operation,
    kind: "LOCAL_VALIDATION",
    tool: spec.tool,
    requiresProjectKnowledge: false
  });
}
