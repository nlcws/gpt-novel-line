import test from "node:test";
import assert from "node:assert/strict";
import { runLiteralMountTransfer } from "../src/program.js";

const validIndex = () => ({
  items: [{
    id: "DS-024-001", location: "024/VAR.md#item", shelf: "024",
    state: "ADOPTED", tagShelf: "CHARACTER", tags: ["#CHAR:kai"],
    entityIds: ["ENT-CHAR-001"], relationIds: ["REL-001"],
    stopTags: ["#stop:no_auto_mount"]
  }],
  entities: [
    { id: "ENT-CHAR-001", kind: "CHARACTER", name: "Kai", location: "022/CHAR.md#kai",
      state: "ADOPTED", tagShelf: "CHARACTER", tags: ["#CHAR:kai"], relationIds: ["REL-001"] },
    { id: "ENT-ORG-001", kind: "ORGANIZATION", name: "Org", location: "022/ORG.md#org",
      state: "ADOPTED", tagShelf: "ORGANIZATION", tags: ["#ORG:org"], relationIds: ["REL-001"] }
  ],
  relations: [{
    id: "REL-001", kind: "MEMBERSHIP", subjectId: "ENT-CHAR-001",
    objectId: "ENT-ORG-001", state: "ADOPTED",
    location: "022/ORG.md#membership", tags: ["#RELTYPE:membership"]
  }],
  stopTags: [{
    tag: "#stop:no_auto_mount", meaning: "No automatic mount",
    scope: "MOUNT_TRANSFER", assignedTo: ["DS-024-001"], released: false
  }]
});

const validInput = () => ({
  index: validIndex(),
  transfer: {
    currentMountPresent: true, gate021Read: true, inventoryBuilt: true,
    diffReportBuilt: true, phase: "PREPARE", dailyPrimarySource: "MOUNT_ZIP",
    canonicalArchive: "PROJECT_HISTORY_SHELF", mountTransferProcessActive: true, existingShelvesPreserved: true, nextIndividualRestartReady: true, inventory: [{ id: "I1" }],
    reflected: [{ id: "I1" }], held: [], discarded: [],
    shelves: { "022": [{ state: "USER_FIXED" }], "028": [{ state: "UNCONFIRMED" }] },
    resultGate021: {
      readOrder: ["022"], currentLocation: "024", canonicalRoute: "022",
      unresolvedStops: [], nextWork: "continue"
    },
    restartResolvedRefs: [{ path: "022/CORE.md", section: "canon", exists: true, read: true }]
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

test("literal extraction preserves current shelf and restart STOP", () => {
  const input = validInput();
  input.transfer.shelves["022"].push({ state: "UNCONFIRMED" });
  input.transfer.restartResolvedRefs[0].read = false;
  const result = runLiteralMountTransfer(input);
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.ruleId === "UNCONFIRMED_IN_022"));
  assert.ok(result.issues.some((entry) => entry.ruleId === "RESTART_RESOLUTION_FAILED"));
});
