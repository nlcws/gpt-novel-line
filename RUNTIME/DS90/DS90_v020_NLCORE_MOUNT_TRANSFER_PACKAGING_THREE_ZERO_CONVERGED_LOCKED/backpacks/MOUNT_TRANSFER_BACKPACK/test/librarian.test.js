import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { statSync } from "node:fs";
import { READ_ORDER, runMountTransferBackpack } from "../src/program.js";

const digest = (value) => createHash("sha256").update(Buffer.from(value, "utf8")).digest("hex");
const index = () => ({
  items: [{ id: "DS-024-001", location: "024/VAR.md#item", shelf: "024",
    state: "ADOPTED", tagShelf: "ITEM", tags: ["#ITEM:i"],
    entityIds: ["E1"], relationIds: [], stopTags: ["#stop:x"] }],
  entities: [{ id: "E1", kind: "ITEM", name: "i", location: "022/CORE.md#i",
    state: "ADOPTED", tagShelf: "ITEM", tags: ["#ITEM:i"], relationIds: [] }],
  relations: [],
  stopTags: [{ tag: "#stop:x", meaning: "x", scope: "MOUNT_TRANSFER",
    assignedTo: ["DS-024-001"], released: false }]
});

const valid = (origin = "USER_EXPLICIT") => {
  const content = "header\ncanonical condition\nfooter";
  const structure = [
    { path: "PROJECT", type: "ROOT", shelf_id: null, shelf_definition: "project-root" },
    { path: "PROJECT/022", type: "SHELF", shelf_id: "022", shelf_definition: "canonical" },
    { path: "PROJECT/022/CORE.md", type: "FILE", shelf_id: "022",
      shelf_definition: "canonical", content_digest: digest(content) }
  ];
  const value = {
    mountTransferInvocation: {
      mode: "MOUNT_TRANSFER_BACKPACK", operation: "MOUNT_TRANSFER",
      origin, reason: "versioned mount transfer"
    },
    index: index(),
    transfer: {
      currentMountPresent: true, gate021Read: true, inventoryBuilt: true,
      diffReportBuilt: true, phase: "PREPARE", dailyPrimarySource: "MOUNT_ZIP",
      canonicalArchive: "PROJECT_HISTORY_SHELF", mountTransferProcessActive: true, existingShelvesPreserved: true, nextIndividualRestartReady: true, inventory: [{ id: "I1" }],
      reflected: [{ id: "I1" }], held: [], discarded: [],
      shelves: { "022": [{ state: "USER_FIXED" }], "028": [{ state: "UNCONFIRMED" }] },
      resultGate021: { readOrder: ["022"], currentLocation: "024",
        canonicalRoute: "022", unresolvedStops: [], nextWork: "continue" },
      restartResolvedRefs: [{ path: "022/CORE.md", section: "canon", exists: true, read: true }],
      librarian: {
        beforeStructure: structuredClone(structure),
        afterStructure: structuredClone(structure),
        outputArchive: {
          format: "ZIP", root_path: "PROJECT",
          entry_paths: structure.map((entry) => entry.path)
        },
        newShelves: [],
        sourceDocuments: [{ path: "022/CORE.md", content, sha256: digest(content) }],
        catalog: [{
          condition_id: "COND-I1", item_id: "I1", item_name: "condition",
          item_type: "CONDITION", tag_name: "#COND:I1",
          role: "canonical condition", adoption_state: "ADOPTED",
          shelf_definition: "canonical", source_type: "PROJECT_CANON",
          source_text: "canonical condition", source_file: "022/CORE.md",
          source_lines: [2, 2], structure_path: "PROJECT/022/CORE.md",
          target_process: "DESIGN",
          target_shelf: "022", condition_type: "FIXED",
          canon_status: "CANONICAL", update_history: ["created"],
          is_new: false, line_changed: false, line_ref_status: "EXACT"
        }],
        indexMaintenance: {
          existing_index_read: true, repair_attempted_first: true,
          parallel_index_created: false, unresolved_items: [],
          registered_item_ids: ["I1"],
          navigation_references: { START_HERE: true, READ_ME: true, CURRENT_STATUS: true }
        },
        summaryControl: {
          all_sources_read: true, no_inference: true, no_condition_compression: true
        }
      }
    }
  };
  value.transfer.librarian.previousCatalog =
    structuredClone(value.transfer.librarian.catalog);
  return value;
};

test("every backpack read-order path exists", () => {
  const localBackpackPaths = new Set([
    "START_HERE.js",
    "assets/LIBRARIAN_TRANSFER_CONTRACT.md"
  ]);
  for (const path of READ_ORDER) {
    const url = localBackpackPaths.has(path)
      ? new URL(`../${path}`, import.meta.url)
      : new URL(`../../../${path}`, import.meta.url);
    statSync(url);
  }
});

test("explicit librarian backpack transfer passes and stays", () => {
  const result = runMountTransferBackpack(valid());
  assert.equal(result.decision, "PASS");
  assert.equal(result.completionState, "STAY_IN_TRANSFER_BACKPACK");
});

test("designer auto invocation returns to designer", () => {
  const result = runMountTransferBackpack(valid("DESIGNER_AUTO"));
  assert.equal(result.decision, "PASS");
  assert.equal(result.completionState, "RETURN_TO_DESIGNER");
});

test("normal designer request cannot accidentally activate backpack", () => {
  const input = valid();
  delete input.mountTransferInvocation;
  const result = runMountTransferBackpack(input);
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.code === "TRANSFER_BACKPACK_NOT_ACTIVATED"));
});

test("moved existing path and archive mismatch stop", () => {
  const input = valid();
  input.transfer.librarian.afterStructure[2].path = "PROJECT/NEW/CORE.md";
  const result = runMountTransferBackpack(input);
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.code === "EXISTING_PATH_REMOVED_OR_MOVED"));
  assert.ok(result.issues.some((entry) => entry.code === "OUTPUT_ARCHIVE_STRUCTURE_MISMATCH"));
});

test("unregistered addition and incomplete new shelf stop", () => {
  const input = valid();
  input.transfer.librarian.afterStructure.push({
    path: "PROJECT/NEW", type: "SHELF", shelf_id: "NEW", shelf_definition: "new-role"
  });
  input.transfer.librarian.newShelves.push({
    shelf_id: "NEW", reason: "needed", purpose: "new role",
    role_mixing_if_existing: true, future_growth_clear: true,
    template_compatible: true, old_shelf_meanings_preserved: true,
    navigation_references: { START_HERE: true, READ_ME: false, CURRENT_STATUS: true }
  });
  const result = runMountTransferBackpack(input);
  assert.ok(result.issues.some((entry) => entry.code === "NEW_PATH_UNREGISTERED"));
  assert.ok(result.issues.some((entry) => entry.code === "NEW_SHELF_CONDITIONS_INCOMPLETE"));
});

test("wrong source line and unknown canon status stop", () => {
  const input = valid();
  input.transfer.librarian.catalog[0].source_lines = [1, 1];
  input.transfer.librarian.catalog[0].canon_status = "MAYBE_CANON";
  const result = runMountTransferBackpack(input);
  assert.ok(result.issues.some((entry) => entry.code === "SOURCE_TEXT_NOT_AT_LINE_RANGE"));
  assert.ok(result.issues.some((entry) => entry.code === "CANON_STATUS_UNKNOWN"));
});

test("parallel index and unresolved index stop", () => {
  const input = valid();
  input.transfer.librarian.indexMaintenance.parallel_index_created = true;
  input.transfer.librarian.indexMaintenance.unresolved_items = ["I1"];
  const result = runMountTransferBackpack(input);
  assert.ok(result.issues.some((entry) => entry.code === "PARALLEL_INDEX_FORBIDDEN"));
  assert.ok(result.issues.some((entry) => entry.code === "INDEX_UNRESOLVED"));
});

test("line change requires updated address history", () => {
  const input = valid();
  const item = input.transfer.librarian.catalog[0];
  item.source_lines = [3, 3];
  item.source_text = "footer";
  item.line_ref_status = "UPDATED";
  const result = runMountTransferBackpack(input);
  assert.ok(result.issues.some((entry) => entry.code === "LINE_REFERENCE_UPDATE_INCOMPLETE"));
});

test("stable identity fields cannot change during transfer", () => {
  const input = valid();
  input.transfer.librarian.catalog[0].tag_name = "#COND:RENAMED";
  input.transfer.librarian.catalog[0].canon_status = "COMPARISON";
  const result = runMountTransferBackpack(input);
  assert.equal(result.decision, "STOP");
  assert.equal(result.issues.filter((entry) => entry.code === "STABLE_FIELD_CHANGED").length, 2);
});

test("new-item state is derived from previous catalog", () => {
  const input = valid();
  input.transfer.librarian.catalog[0].is_new = true;
  const result = runMountTransferBackpack(input);
  assert.ok(result.issues.some((entry) => entry.code === "NEW_ITEM_STATE_MISMATCH"));
});

test("catalog and existing index registration must be identical", () => {
  const input = valid();
  input.transfer.librarian.indexMaintenance.registered_item_ids = [];
  const result = runMountTransferBackpack(input);
  assert.ok(result.issues.some((entry) => entry.code === "INDEX_CATALOG_REGISTRATION_MISMATCH"));
});

test("changed file digest requires registered update reason", () => {
  const input = valid();
  input.transfer.librarian.afterStructure[2].content_digest = digest("changed");
  const result = runMountTransferBackpack(input);
  assert.ok(result.issues.some((entry) => entry.code === "CHANGED_FILE_NOT_REGISTERED"));
});

test("duplicate archive entry paths stop", () => {
  const input = valid();
  input.transfer.librarian.outputArchive.entry_paths.push("PROJECT/022/CORE.md");
  const result = runMountTransferBackpack(input);
  assert.ok(result.issues.some((entry) => entry.code === "OUTPUT_ARCHIVE_PATH_DUPLICATE"));
});

test("registered file-content update remains allowed", () => {
  const input = valid();
  input.transfer.librarian.afterStructure[2].content_digest = digest("changed");
  Object.assign(input.transfer.librarian.catalog[0], {
    file_change_registered: true,
    update_reason: "content revision",
    version: "v2",
    updated_at: "2026-06-23"
  });
  assert.equal(runMountTransferBackpack(input).decision, "PASS");
});

test("mechanically detected line move passes with complete history", () => {
  const input = valid();
  const content = "new header\nheader\ncanonical condition\nfooter";
  input.transfer.librarian.sourceDocuments[0] = {
    path: "022/CORE.md", content, sha256: digest(content)
  };
  input.transfer.librarian.afterStructure[2].content_digest = digest(content);
  Object.assign(input.transfer.librarian.catalog[0], {
    source_lines: [3, 3],
    line_ref_status: "UPDATED",
    file_change_registered: true,
    update_reason: "header inserted",
    version: "v2",
    updated_at: "2026-06-23"
  });
  assert.equal(runMountTransferBackpack(input).decision, "PASS");
});
