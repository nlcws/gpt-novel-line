import test from "node:test";
import assert from "node:assert/strict";
import { runLiteralMountTransfer } from "../src/program.js";


const validInput = () => ({
  transfer: {
    currentMountPresent: true, controlStartGateRead: true, inventoryBuilt: true,
    diffReportBuilt: true, phase: "PREPARE", dailyPrimarySource: "MOUNT_ZIP",
    canonicalArchive: "PROJECT_HISTORY_SHELF", mountTransferProcessActive: true, existingShelvesPreserved: true, nextIndividualRestartReady: true, inventory: [{ id: "I1" }],
    reflected: [{ id: "I1" }], held: [], discarded: [],
    resultControlHandoff: {
      entrypoint: "00_READ_FIRST/DS90_START_GATE.md",
      readOrder: ["00_READ_FIRST/DS90_START_GATE.md", "00_READ_FIRST/DS90_START_GATE.json", "00_READ_FIRST/RUNTIME_DIRECT_DISPATCH.json"],
      currentLocation: "PKDB", unresolvedStops: [], nextWork: "continue"
    },
    restartResolvedRefs: [{ path: "00_READ_FIRST/DS90_START_GATE.md", section: "boot", exists: true, read: true }]
  }
});

test("literal extraction preserves current PASS behavior", () => {
  assert.equal(runLiteralMountTransfer(validInput()).decision, "PASS");
});

test("literal extraction preserves current common-operation STOP", () => {
  const input = validInput();
  input.transfer.commonOperationUsedAsStorySource = true;
  const result = runLiteralMountTransfer(input);
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "MT-020"));
});

test("literal extraction preserves current restart STOP", () => {
  const input = validInput();
  input.transfer.restartResolvedRefs[0].read = false;
  const result = runLiteralMountTransfer(input);
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "RESTART_RESOLUTION_FAILED"));
});
