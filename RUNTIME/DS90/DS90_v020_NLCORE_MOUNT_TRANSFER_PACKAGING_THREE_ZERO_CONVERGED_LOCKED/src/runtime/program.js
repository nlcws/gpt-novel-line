import { archiveModule } from "../modules/archive.js";
import { cardModule } from "../modules/card.js";
import { cardTestModule } from "../modules/cardTest.js";
import { checkModule } from "../modules/check.js";
import { coreModule } from "../modules/core.js";
import { endLogModule } from "../modules/endLog.js";
import { episodePackModule } from "../modules/episodePack.js";
import { logModule } from "../modules/log.js";
import { packCutoutModule } from "../modules/packCutout.js";
import { tagSearchModule } from "../modules/tagSearch.js";
import { mountTransferBackpackModule } from "../modules/mountTransferBackpackAdapter.js";
import {
  singleEpisodeProfileGate,
  validateEpisodeProfileGate,
  validateRowAlignment
} from "../profiles/singleEpisodeProfileGate.js";
import { evaluateRules } from "./rule.js";

export const MODULES = Object.freeze({
  CORE: coreModule,
  CHECK: checkModule,
  TAG_SEARCH: tagSearchModule,
  CARD: cardModule,
  CARD_TEST: cardTestModule,
  LOG: logModule,
  MOUNT_TRANSFER: mountTransferBackpackModule,
  ARCHIVE: archiveModule,
  END_LOG: endLogModule
  ,
  SINGLE_EPISODE_PROFILE_GATE: singleEpisodeProfileGate,
  EPISODE_PACK: episodePackModule,
  PACK_CUTOUT: packCutoutModule
});

export const READ_ORDER = Object.freeze([
  "START_HERE.js",
  "src/runtime/mental-runtime.js",
  "src/runtime/types.js",
  "src/runtime/rule.js",
  "src/assets.js",
  "src/profiles/narrationBase.js",
  "src/modules/core.js",
  "src/runtime/program.js",
  "src/loading/manifest.js",
  "every file returned by requiredReads(operation)",
  "requested module only",
  "src/modules/endLog.js"
]);

export function runModule(moduleId, input) {
  const module = MODULES[moduleId];
  if (module == null) {
    return { decision: "STOP", moduleId, issues: [{ decision: "STOP", message: "未知のmodule" }] };
  }
  const issues = evaluateRules(module.rules, input);
  let moduleOutput = null;
  if (moduleId === "SINGLE_EPISODE_PROFILE_GATE") {
    issues.push(...validateRowAlignment(input));
    issues.push(...validateEpisodeProfileGate(input).issues.map((entry) => ({
      ruleId: entry.code,
      decision: entry.severity,
      field: entry.path,
      message: entry.message
    })));
  }
  if (typeof module.validate === "function") {
    const validated = module.validate(input);
    issues.push(...validated.issues.map((entry) => ({
      ruleId: entry.code,
      decision: entry.severity ?? "STOP",
      field: entry.path,
      message: entry.message
    })));
    moduleOutput = validated.output ?? null;
    if (validated.invocation != null) {
      return {
        decision: issues.length > 0 ? "STOP" : "PASS",
        moduleId,
        issues,
        invocation: validated.invocation,
        completionState: validated.completionState,
        activationState: validated.activationState ?? null,
        materialState: validated.materialState ?? null,
        ...(moduleOutput != null ? { moduleOutput } : {})
      };
    }
  }
  const decision = issues.length > 0 ? "STOP" : "PASS";
  return {
    decision, moduleId, issues,
    ...(moduleOutput != null ? { moduleOutput } : {})
  };
}
