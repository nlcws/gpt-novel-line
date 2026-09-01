import { transferModule } from "../../../src/modules/transfer.js";
import { evaluateRules } from "../../../src/runtime/rule.js";
import { validateInvocation } from "./invocation.js";
import { validateLibrarianTransfer } from "./librarian-gate.js";
export { validateTransferContainerZipFile } from "../../../src/validation/zip_evidence.js";

export const READ_ORDER = Object.freeze([
  "START_HERE.js",
  "src/runtime/types.js",
  "src/runtime/rule.js",
  "src/indexing/validator.js",
  "src/validation/deterministic.js",
  "src/validation/convergence.js",
  "src/validation/shelf_packaging.js",
  "src/validation/zip_evidence.js",
  "contract/transfer_container_contract.json",
  "docs/MACHINE_TRANSFER_CONTAINER_GATE.md",
  "src/modules/transfer.js",
  "assets/operation_mount/10_CANON/130_TRANSFER_AGENT_ROLES.md",
  "assets/operation_mount/10_CANON/140_MOUNT_REQUIREMENTS.md",
  "assets/operation_mount/COMMON_TRANSFER_TEMPLATE_V1.md",
  "assets/specs/095_MOUNT_TRANSFER.md",
  "assets/specs/091_TRANSFER_CHECK.md",
  "assets/specs/089_TAG_SEARCH.md",
  "assets/specs/098_TRANSFER_INDEX.md",
  "assets/templates/SHELF_GUIDE_TEMPLATE.md",
  "assets/templates/RESTART_MEMO_TEMPLATE.txt",
  "assets/LIBRARIAN_TRANSFER_CONTRACT.md"
]);

export const SOURCE_MANIFEST = Object.freeze([
  { path: "src/runtime/types.js", sha256: "B57A2E3424050B8CB4DE62119EA2194953BB17BB2405BDC4C68004DCDA6E7B41" },
  { path: "src/modules/transfer.js", sha256: "0F73CE1CECA50291AAC9F9DBB22E0F6395C0E5BD24CDC038C6C418F2BC21B244" },
  { path: "src/validation/deterministic.js", sha256: "6BBBC26264E74C38B66FAEEC4079D74E5C5E6115F55B00A72088D72AAD859AF3" },
  { path: "src/validation/convergence.js", sha256: "33169570A6C6D533CE0E8E64B6E8F0E830CF994184DBBB74C8D51692C9A2492F" },
  { path: "src/validation/shelf_packaging.js", sha256: "8D01D2FFBB2B386990165649FC383F1B408C9CE2FE648C8DE7F3927F4DD299A1" },
  { path: "src/validation/zip_evidence.js", sha256: "5D0B9105C7E3A855DC9644DBCA2028987A67ADDB681FA5BFDD02DCE0BFD1D86A" },
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
