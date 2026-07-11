import { transferModule } from "../../../src/modules/transfer.js";
import { evaluateRules } from "../../../src/runtime/rule.js";
import { validateInvocation } from "./invocation.js";
import { validateLibrarianTransfer } from "./librarian-gate.js";

export const READ_ORDER = Object.freeze([
  "START_HERE.js",
  "src/runtime/types.js",
  "src/runtime/rule.js",
  "src/indexing/validator.js",
  "src/validation/deterministic.js",
  "src/modules/transfer.js",
  "assets/operation_mount/10_CANON/130_DESIGN_AND_WRITING_ROLES.md",
  "assets/operation_mount/10_CANON/140_MOUNT_REQUIREMENTS.md",
  "assets/operation_mount/COMMON_OPERATION_TEMPLATE_V1.md",
  "assets/specs/095_DS_MOUNT_TRANSFER.md",
  "assets/specs/091_DS_CHECK.md",
  "assets/specs/089_DS_TAG_SEARCH.md",
  "assets/specs/098_DS_INDEX.md",
  "assets/templates/SHELF_GUIDE_TEMPLATE.md",
  "assets/templates/RESTART_MEMO_TEMPLATE.txt",
  "assets/LIBRARIAN_TRANSFER_CONTRACT.md"
]);

export const SOURCE_MANIFEST = Object.freeze([
  { path: "src/runtime/types.js", sha256: "B57A2E3424050B8CB4DE62119EA2194953BB17BB2405BDC4C68004DCDA6E7B41" },
  { path: "src/modules/transfer.js", sha256: "F665D0C8847C8CE1202339E41EBAD616E1AF182AB99B9D0D84CEC3643311551E" },
  { path: "src/validation/deterministic.js", sha256: "6C96A8CE9133FABBC748238D955C926E1A47ADD3E6CBF7F11AD6FB875BEA8A1B" },
  { path: "src/indexing/validator.js", sha256: "A5305FA7EC8892353BF47F20B0ADD1E872FCBB142C92167FE82BA66BB20902F9" },
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
