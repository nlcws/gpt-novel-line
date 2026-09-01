export const ALWAYS_READ = Object.freeze([
  "START_HERE.js",
  "README.md",
  "load_order.md",
  "docs/SP00_V002_CLEAN_BASELINE_LOCK.md",
  "docs/SP00_ROLE_BOUNDARY_LOCK.md",
  "docs/SP00_DS90_V0300_COMPATIBILITY_LOCK.md",
  "docs/SP00_GPT_PROJECT_INVOCATION_FLOW.md",
  "docs/SP00_SHARED_TOOLING_BOUNDARY_LOCK.md",
  "docs/SP00_CHECK_REPORT_FORMAT_LOCK.md",
  "contract/sp00_v002_clean_baseline_machine.json",
  "contract/sp00_check_report_contract.json",
  "src/engine.js",
  "src/router.js",
  "src/runtime/types.js",
  "src/runtime/rule.js",
  "src/modules/packCutout.js",
  "assets/contracts/STORY_PACK_CUTOUT_PROTOCOL.md",
  "assets/contracts/STORY_PACK_OUTPUT_CONTRACT.md",
  "assets/contracts/STOP_AND_PASS_CRITERIA.md"
]);

export const OPERATION_READS = Object.freeze({
  PACK_CUTOUT: [
    "src/modules/packCutout.js",
    "src/validation/convergence.js",
    "src/dsgn/invocation.js",
    "src/dsgn/namespace.js",
    "src/dsgn/lookup.js",
    "src/v2/activation.js",
    "src/v2/material-map.js",
    "assets/contracts/STORY_PACK_CUTOUT_PROTOCOL.md",
    "assets/contracts/STORY_PACK_OUTPUT_CONTRACT.md",
    "assets/contracts/WRITER_HANDOFF_CONTRACT.json",
    "assets/contracts/STOP_AND_PASS_CRITERIA.md",
    "assets/templates/STORY_PACK_ROOT_SHAPE.md",
    "assets/templates/EPISODE_FOLDER_SHAPE.md"
  ]
});

const issue = (path) => ({
  code: "OPERATION_READ_MISSING",
  path: "boot.readLedger",
  message: `${path}を作業開始前に実読する必要があります`,
  severity: "STOP"
});

export function requiredReads(operation = "PACK_CUTOUT") {
  return [...new Set([...ALWAYS_READ, ...(OPERATION_READS[operation] ?? [])])];
}

export function validateOperationReads(operation, ledger = []) {
  const records = new Map((ledger ?? []).map((entry) => [entry.path, entry]));
  const issues = (OPERATION_READS[operation] ?? [])
    .filter((path) => {
      const record = records.get(path);
      return record?.exists !== true || record?.read !== true;
    })
    .map(issue);
  return { decision: issues.length ? "STOP" : "PASS", moduleId: "LOAD_PLAN", issues };
}
