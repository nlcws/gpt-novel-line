export const WRITE_EXECUTION_ORDER = Object.freeze([
  "CORE",
  "FIXED_LAYER",
  "HEAT_LAYER",
  "SCENE_ORDER",
  "CONNECTION",
  "FORBIDDEN_LINES",
  "FREE_AREA"
]);

export const REQUIRED_PREWRITE_FLAGS = Object.freeze([
  "episodeFolderMapRead",
  "sourceReadStatusConfirmed",
  "targetStoryCardReread",
  "connectionMaterialReread",
  "fixedConditionTableFrozen",
  "heatConditionTableFrozen",
  "connectionTableFrozen",
  "forbiddenLinesFrozen",
  "freeAreaRead",
  "outputContractResolved",
  "selfBoundOrTargetPolicySet",
  "bodyAndNonBodySeparated",
  "folderTotalNotUsedAsLengthLimit",
  "writerDidNotClassifyMaterials",
  "currentCycleOnlyConfirmed",
  "noMemoryAsRead",
  "noFilenameAsRead",
  "noFilelistAsRead",
  "noSummaryAsRead",
  "noChatAsStorySource",
  "noDesignGapFilledByWriter",
  "frozenTableCurrentCycleOnly"
]);

const fail = (code, path, detail = null) => detail == null ? { code, path } : { code, path, detail };

export function validateCommonPreWriteState(preWrite = {}) {
  const failures = [];
  for (const field of REQUIRED_PREWRITE_FLAGS) {
    if (preWrite?.[field] !== true) failures.push(fail("PRE_WRITE_REQUIREMENT_MISSING", field));
  }
  if (JSON.stringify(preWrite?.executionOrder) !== JSON.stringify(WRITE_EXECUTION_ORDER)) {
    failures.push(fail("WRITE_EXECUTION_ORDER_INVALID", "preWrite.executionOrder"));
  }
  return failures;
}
