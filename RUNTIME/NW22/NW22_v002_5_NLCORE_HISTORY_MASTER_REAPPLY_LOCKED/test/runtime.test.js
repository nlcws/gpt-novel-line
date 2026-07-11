import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import {
  CHAT_MOUNT_BOOT,
  NORA_CHAT_VOICE,
  NORA_POLICY,
  NORA_RUNTIME_LOCKS,
  OPTIONAL_STORY_LAYER,
  READ_ORDER,
  RUNTIME_VERSION,
  SOURCE_MANIFEST
} from "../src/program.js";
import {
  NORA_OUTPUT_CONTRACT,
  evaluateNoraBoot,
  evaluateNoraLayerUse,
  evaluateNoraOutput,
  evaluateNoraRequest,
  evaluateNoraSweep
} from "../src/nora-gate.js";

test("runtime policy keeps Nora outside regular workflow", () => {
  assert.equal(RUNTIME_VERSION, "nw22-v002.5-nlcore-history-master-reapply-locked");
  assert.equal(NORA_POLICY.line, "outside_regular_workflow");
  assert.equal(NORA_POLICY.canWriteTrialText, true);
  assert.equal(NORA_POLICY.canMakeRegularManuscript, false);
  assert.equal(NORA_POLICY.canMakeCanon, false);
  assert.equal(NORA_POLICY.canMakeVerifiedV2, false);
  assert.equal(NORA_POLICY.readAndRun, true);
  assert.equal(NORA_POLICY.sourceAsFuel, true);
  assert.equal(CHAT_MOUNT_BOOT.autoStart, true);
  assert.equal(CHAT_MOUNT_BOOT.autoWrite, false);
  assert.equal(NORA_POLICY.optionalStoryLayerV21, true);
  assert.equal(NORA_POLICY.novelLineFinalCoreLocked, true);
  assert.equal(NORA_POLICY.fourRuntimeRespectEqual, true);
  assert.equal(NORA_POLICY.storyLayerUseIfImproves, true);
  assert.equal(NORA_POLICY.storyLayerForceEveryTime, false);
  assert.equal(NORA_POLICY.separateFirelineOutputLocked, true);
  assert.equal(NORA_POLICY.currentInstructionOnly, false);
  assert.equal(NORA_POLICY.oldInstructionVersionsBundled, true);
});

test("all source files are present in read order and byte-identical", () => {
  assert.deepEqual(READ_ORDER, SOURCE_MANIFEST.map((entry) => entry.path));
  for (const expected of SOURCE_MANIFEST) {
    const url = new URL(`../${expected.path}`, import.meta.url);
    const content = readFileSync(url);
    const hash = createHash("sha256").update(content).digest("hex").toUpperCase();
    assert.equal(statSync(url).size, expected.bytes);
    assert.equal(hash, expected.sha256);
  }
});

test("boot requires every Nora source file read", () => {
  const result = evaluateNoraBoot({
    readOrder: READ_ORDER,
    readLedger: READ_ORDER.map((path) => ({ path, exists: true, read: true }))
  });
  assert.equal(result.decision, "NORA_BOOT_READY");
  const stop = evaluateNoraBoot({
    readOrder: READ_ORDER,
    readLedger: [{ path: READ_ORDER[0], exists: true, read: true }]
  });
  assert.equal(stop.decision, "STOP");
  assert.ok(stop.failures.some((entry) => entry.code === "NORA_SOURCE_UNREAD"));
});

test("readable material can become trial text but never canon", () => {
  const request = evaluateNoraRequest({
    requestedOutputTypes: ["TRIAL_TEXT"],
    triggers: ["お任せ"],
    materialReadable: true
  });
  assert.equal(request.decision, "NORA_TRIAL_WRITE_ALLOWED");
  assert.equal(request.readAndRun, true);
  assert.equal(request.sourceAsFuel, true);
  assert.equal(request.canon, false);
  const output = evaluateNoraOutput({
    requestResult: request,
    output: { text: "本文試走", fireSeed: "次の火種", unclassifiedResidue: [] }
  });
  assert.equal(output.decision, "NORA_OUTPUT_READY");
  assert.equal(output.regularManuscript, false);
});

test("story-pack-like materials are treated as fuel, not stop reasons", () => {
  const request = evaluateNoraRequest({
    requestedOutputTypes: ["TRIAL_TEXT"],
    materials: ["story_pack", "execution_queue", "frozen", "dialogue"],
    materialReadable: true
  });
  assert.equal(request.decision, "NORA_TRIAL_WRITE_ALLOWED");
  assert.equal(request.readAndRun, true);
  assert.equal(request.endSweepRequired, true);
});

test("regular manuscript, canon, and verified V2 requests are denied", () => {
  const result = evaluateNoraRequest({
    requestedOutputTypes: ["REGULAR_MANUSCRIPT", "CANON_TEXT", "VERIFIED_V2"]
  });
  assert.equal(result.decision, "STOP_OR_ASK_SHORT");
  assert.equal(result.failures.filter((entry) => entry.code === "REGULAR_LINE_DENIED").length, 3);
});

test("generated Nora facts cannot be promoted automatically", () => {
  const result = evaluateNoraRequest({
    requestedOutputTypes: ["TRIAL_TEXT"],
    treatGeneratedFactsAsCanon: true
  });
  assert.equal(result.decision, "STOP_OR_ASK_SHORT");
  assert.ok(result.failures.some((entry) => entry.code === "NORA_FACT_PROMOTION_DENIED"));
});

test("do-not-add and explicit contradiction ask short instead of writing", () => {
  let result = evaluateNoraRequest({
    userSaysDoNotAdd: true,
    missingPartsNeedDecision: true
  });
  assert.equal(result.decision, "STOP_OR_ASK_SHORT");
  assert.ok(result.failures.some((entry) => entry.code === "NORA_ASK_SHORT_REQUIRED"));
  result = evaluateNoraRequest({ explicitContradiction: true });
  assert.ok(result.failures.some((entry) => entry.code === "NORA_CONTRADICTION_STOP"));
});

test("heat delivery lock refuses cooling and warn-cooling", () => {
  assert.equal(NORA_RUNTIME_LOCKS.userHeatDeliveryLocked, true);
  let sweep = evaluateNoraSweep({ cooledUserHeat: false, warnUsedAsCooling: false, unclassifiedResidue: [] });
  assert.equal(sweep.decision, "NORA_SWEEP_CLEAR");
  sweep = evaluateNoraSweep({ cooledUserHeat: true });
  assert.equal(sweep.decision, "STOP");
  assert.ok(sweep.failures.some((entry) => entry.code === "NORA_HEAT_COOLING_DENIED"));
  sweep = evaluateNoraSweep({ warnUsedAsCooling: true });
  assert.equal(sweep.decision, "STOP");
  assert.ok(sweep.failures.some((entry) => entry.code === "NORA_WARN_COOLING_DENIED"));
});

test("end sweep refuses unclassified residue", () => {
  const clear = evaluateNoraSweep({ unclassifiedResidue: [] });
  assert.equal(clear.decision, "NORA_SWEEP_CLEAR");
  const stop = evaluateNoraSweep({ unclassifiedResidue: ["dangling warn"] });
  assert.equal(stop.decision, "STOP");
  assert.ok(stop.failures.some((entry) => entry.code === "NORA_UNCLASSIFIED_RESIDUE"));
});

test("Nora return V2 is allowed only as trial memo with full fields", () => {
  const request = evaluateNoraRequest({
    triggers: ["野良ちゃん戻しV2"]
  });
  assert.equal(request.decision, "NORA_RETURN_V2_ALLOWED");
  assert.deepEqual(request.outputContract, NORA_OUTPUT_CONTRACT.returnV2);
  const output = { unclassifiedResidue: [] };
  for (const key of NORA_OUTPUT_CONTRACT.returnV2) output[key] = `${key} value`;
  const result = evaluateNoraOutput({ requestResult: request, output });
  assert.equal(result.decision, "NORA_OUTPUT_READY");
  assert.equal(result.verifiedV2, false);
});

test("chat voice is runtimeized but does not infect manuscript voice", () => {
  assert.equal(NORA_CHAT_VOICE.fast, true);
  assert.equal(NORA_CHAT_VOICE.textForward, true);
  assert.equal(NORA_CHAT_VOICE.phrase, "見た。走れる。");
  assert.equal(NORA_CHAT_VOICE.catFlavorInChatOnly, true);
  assert.equal(NORA_CHAT_VOICE.manuscriptVoiceUnaffected, true);
});

test("Nora output cannot self-label as canon or verified", () => {
  const request = evaluateNoraRequest({ requestedOutputTypes: ["TRIAL_TEXT"] });
  const result = evaluateNoraOutput({
    requestResult: request,
    output: { text: "本文試走", fireSeed: "火種", canon: true, verifiedV2: true, unclassifiedResidue: [] }
  });
  assert.equal(result.decision, "STOP");
  assert.ok(result.failures.some((entry) => entry.code === "NORA_OUTPUT_PROMOTION_DENIED"));
});


test("optional story layer v21 is fuel, not a stop reason", () => {
  assert.equal(OPTIONAL_STORY_LAYER.included, true);
  assert.equal(OPTIONAL_STORY_LAYER.useIfImproves, true);
  assert.equal(OPTIONAL_STORY_LAYER.forceEveryTime, false);
  assert.equal(OPTIONAL_STORY_LAYER.stopIfUnused, false);
  assert.equal(OPTIONAL_STORY_LAYER.promoteToCanon, false);
  assert.equal(NORA_RUNTIME_LOCKS.storyLayerDoesNotStopWriting, true);
});

test("optional story layer can be used or skipped without canon promotion", () => {
  let result = evaluateNoraLayerUse({ layerUseful: true, layerUsed: true });
  assert.equal(result.decision, "NORA_LAYER_USE_ALLOWED");
  assert.equal(result.layerRequired, false);
  assert.equal(result.promoteToCanon, false);
  result = evaluateNoraLayerUse({ layerUseful: false, layerUsed: false });
  assert.equal(result.decision, "NORA_LAYER_OPTIONAL_SKIP_ALLOWED");
  assert.equal(result.stopIfUnused, false);
});

test("optional story layer refuses stereotype and common-example fixation", () => {
  let result = evaluateNoraLayerUse({ layerUsed: true, commonExampleFixedAsProfile: true });
  assert.equal(result.decision, "STOP");
  assert.ok(result.failures.some((entry) => entry.code === "NORA_LAYER_COMMON_EXAMPLE_FIXED"));
  result = evaluateNoraLayerUse({ layerUsed: true, stereotypeUse: true });
  assert.equal(result.decision, "STOP");
  assert.ok(result.failures.some((entry) => entry.code === "NORA_LAYER_STEREOTYPE_DENIED"));
});


test("novel line final core source is present", () => {
  const core = readFileSync(new URL("../source/NOVEL_LINE_FINAL_CORE_LOCK_v001.md", import.meta.url), "utf8");
  assert.ok(core.includes("条件内で一切の妥協をせずに、限界まで本文を出す"));
  for (const name of ["設計さん", "執筆さん", "修正刃さま", "野良ちゃん"]) assert.ok(core.includes(name));
});


test("history-master runtime keeps old Nora instruction versions deliberately in READ_ORDER", () => {
  assert.equal(READ_ORDER.includes("source/GPT_BUILDER_INSTRUCTIONS_NORA_v1_0.txt"), true);
  assert.equal(READ_ORDER.includes("source/GPT_BUILDER_INSTRUCTIONS_NORA_v2_0.txt"), true);
  assert.equal(READ_ORDER.includes("source/GPT_BUILDER_INSTRUCTIONS_NORA_v2_1.txt"), true);
  assert.equal(READ_ORDER.includes("source/NORA_HISTORY_MASTER_REAPPLY_LOCK_v001.md"), true);
});

test("Nora separate fireline output lock is present", () => {
  const lock = readFileSync(new URL("../source/NORA_SEPARATE_FIRELINE_OUTPUT_LOCK_v001.md", import.meta.url), "utf8");
  assert.ok(lock.includes("条件にあるものは動かさない"));
  assert.ok(lock.includes("あったら気持ちいい設定"));
  assert.ok(lock.includes("正本、正規本文、検証済みV2"));
  assert.equal(NORA_RUNTIME_LOCKS.separateFirelineOutputLocked, true);
});


test("runtime package keeps history through explicit master-reapply lock", () => {
  assert.ok(READ_ORDER.includes("source/NORA_HISTORY_MASTER_REAPPLY_LOCK_v001.md"));
  const forbidden = /CHANGELOG|REPAIR_LOG|MIGRATION_NOTES|OLD_DIFF|REFERENCE_LOGS|FILELIST/;
  for (const rel of READ_ORDER) assert.equal(forbidden.test(rel), false, `${rel} is forbidden residue`);
});
