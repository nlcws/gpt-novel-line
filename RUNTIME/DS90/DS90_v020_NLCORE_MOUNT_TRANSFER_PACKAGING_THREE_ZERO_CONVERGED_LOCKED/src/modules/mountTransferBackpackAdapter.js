import { runMountTransferBackpack } from "../../backpacks/MOUNT_TRANSFER_BACKPACK/src/program.js";

function withAutoInvocation(input) {
  if (input.mountTransferInvocation != null) return input;
  return {
    ...input,
    mountTransferInvocation: {
      mode: "MOUNT_TRANSFER_BACKPACK",
      operation: "MOUNT_TRANSFER",
      origin: "DESIGNER_AUTO",
      reason: "AUTO_DETECTED_MOUNT_TRANSFER_OPERATION"
    }
  };
}

export const mountTransferBackpackModule = Object.freeze({
  id: "MOUNT_TRANSFER",
  rules: Object.freeze([]),
  validate(input) {
    const normalizedInput = withAutoInvocation(input);
    const result = runMountTransferBackpack(normalizedInput);
    return {
      issues: result.issues,
      invocation: normalizedInput.mountTransferInvocation,
      completionState: result.completionState
    };
  }
});
