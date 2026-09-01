import { transferModule } from "../../../src/modules/transfer.js";
import { evaluateRules } from "../../../src/runtime/rule.js";
import { validateInvocation } from "./invocation.js";
import { validateLibrarianTransfer } from "./librarian-gate.js";

export const READ_ORDER = Object.freeze([
  "START_HERE.js",
  "src/runtime/types.js",
  "src/runtime/rule.js",
  "src/validation/deterministic.js",
  "src/validation/convergence.js",
  "src/modules/transfer.js",
  "assets/operation_mount/10_CANON/130_DESIGN_AND_WRITING_ROLES.md",
  "assets/operation_mount/10_CANON/140_MOUNT_REQUIREMENTS.md",
  "assets/templates/COMMON_OPERATION_TEMPLATE_V2.md",
  "assets/specs/095_DS_MOUNT_TRANSFER.md",
  "assets/specs/091_DS_CHECK.md",
  "assets/templates/SHELF_GUIDE_TEMPLATE.md",
  "assets/templates/RESTART_MEMO_TEMPLATE.txt",
  "assets/LIBRARIAN_TRANSFER_CONTRACT.md"
]);

export const SOURCE_MANIFEST = Object.freeze([
  { path: "src/runtime/types.js", sha256: "B57A2E3424050B8CB4DE62119EA2194953BB17BB2405BDC4C68004DCDA6E7B41" },
  { path: "src/modules/transfer.js", sha256: "BF69F04D713704A881664F05FF19A824D51F8A803424D61E547A683DAF35D565" },
  { path: "src/validation/deterministic.js", sha256: "95660C538C004A0E6DAFB188F5998072FDAC012FE81E0B9E1C753DDF95209F77" },
  { path: "src/validation/convergence.js", sha256: "33169570A6C6D533CE0E8E64B6E8F0E830CF994184DBBB74C8D51692C9A2492F" },
  { path: "src/runtime/rule.js", sha256: "E939EF592D384F4C67691D69E1049476A79B898DF42EE1B9D93B9EA28A535DD8" }
]);

export function runLiteralMountTransfer(input) {
  const issues = evaluateRules(transferModule.rules, input);
  const validated = transferModule.validate(input);
  issues.push(...validated.issues.map((entry) => ({
    ruleId: entry.code,
    decision: entry.severity ?? "STOP",
    field: entry.path,
    message: entry.message
  })));
  return Object.freeze({
    decision: issues.length === 0 ? "PASS" : "STOP",
    moduleId: "MOUNT_TRANSFER",
    issues: Object.freeze(issues)
  });
}

export function runMountTransferBackpack(input) {
  const invocation = validateInvocation(input.mountTransferInvocation);
  const literal = runLiteralMountTransfer(input);
  const librarian = validateLibrarianTransfer(input);
  const issues = [...invocation.issues, ...literal.issues, ...librarian.issues];
  return Object.freeze({
    decision: issues.length === 0 ? "PASS" : "STOP",
    moduleId: "MOUNT_TRANSFER_BACKPACK",
    issues: Object.freeze(issues),
    completionState: invocation.completionState
  });
}
