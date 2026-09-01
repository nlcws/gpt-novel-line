import { runMountTransferBackpack } from "../../backpacks/MOUNT_TRANSFER_BACKPACK/src/program.js";

export const mountTransferBackpackModule = Object.freeze({
  id: "MOUNT_TRANSFER",
  rules: Object.freeze([]),
  validate(input) {
    const result = runMountTransferBackpack(input);
    return {
      issues: result.issues.map((entry) => ({
        code: entry.code ?? entry.ruleId,
        severity: entry.severity ?? entry.decision ?? "STOP",
        path: entry.path ?? entry.field,
        message: entry.message
      })),
      invocation: input.mountTransferInvocation ?? null,
      completionState: result.completionState
    };
  }
});
