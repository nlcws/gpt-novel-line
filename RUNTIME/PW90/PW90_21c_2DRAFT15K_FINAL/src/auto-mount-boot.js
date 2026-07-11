import { RUNTIME_POLICY } from "./program.js";
import { evaluateInitialMountBinding } from "./hard-binding-adapter.js";
import { evaluateOperationLock } from "./operation-lock.js";

export const INITIAL_MOUNT_BOOT_POLICY = Object.freeze({
  id: "INITIAL_MOUNT_CHECK_THEN_AUTO_BOOT",
  firstMountCheckRequired: true,
  autoBootOnCheckPass: true,
  userBootCommandRequired: false,
  autoWriteOnBoot: false,
  passDecision: "BOOT_READY",
  failDecision: "STOP_AT_INITIAL_MOUNT"
});

const fail = (code, path) => ({ code, path });

export function evaluateInitialMountBoot(state = {}) {
  const failures = [];
  if (RUNTIME_POLICY.initialMountCheckRequired !== true) failures.push(fail("INITIAL_MOUNT_CHECK_POLICY_MISSING", "RUNTIME_POLICY.initialMountCheckRequired"));
  if (RUNTIME_POLICY.autoBootAfterMountCheckPass !== true) failures.push(fail("AUTO_BOOT_POLICY_DISABLED", "RUNTIME_POLICY.autoBootAfterMountCheckPass"));
  if (RUNTIME_POLICY.userBootCommandRequired !== false) failures.push(fail("USER_BOOT_COMMAND_MUST_NOT_BE_REQUIRED", "RUNTIME_POLICY.userBootCommandRequired"));
  if (RUNTIME_POLICY.autoWriteAfterBoot !== false) failures.push(fail("AUTO_WRITE_AFTER_BOOT_FORBIDDEN", "RUNTIME_POLICY.autoWriteAfterBoot"));

  if (state.mountedArchiveReadable !== true) failures.push(fail("MOUNT_ARCHIVE_NOT_READABLE", "mountedArchiveReadable"));
  if (state.zipIntegrityValid !== true) failures.push(fail("ZIP_INTEGRITY_NOT_VALID", "zipIntegrityValid"));
  if (state.unsafePathsAbsent !== true) failures.push(fail("UNSAFE_PATH_CHECK_FAILED", "unsafePathsAbsent"));
  if (state.nestedZipAbsent !== true) failures.push(fail("NESTED_ZIP_CHECK_FAILED", "nestedZipAbsent"));

  const binding = evaluateInitialMountBinding({
    ...state,
    mountIntegrityChecked:
      state.mountedArchiveReadable === true &&
      state.zipIntegrityValid === true &&
      state.unsafePathsAbsent === true &&
      state.nestedZipAbsent === true
  });
  if (binding.decision !== "ACTIVE_RUNTIME_BOOTED") failures.push(...binding.failures);

  const operation = evaluateOperationLock({ mode: "BOOT" });
  if (operation.decision !== "OPERATION_ALLOWED") failures.push(...operation.failures);

  return Object.freeze({
    decision: failures.length === 0 ? "BOOT_READY" : "STOP_AT_INITIAL_MOUNT",
    mode: "BOOT",
    booted: failures.length === 0,
    userBootCommandRequired: false,
    writeTextAllowed: false,
    nextAction: failures.length === 0 ? "accept INSPECT, REPAIR, or explicit WRITE input" : "report initial mount failure and stop",
    failures: Object.freeze(failures)
  });
}
