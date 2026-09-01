import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync, readFileSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { inspectWritableStoryPackDirectory, evaluateWritableStoryPackPreWrite } from "../src/writable-story-pack-gate.js";
import { resolveDefaultWriteMode } from "../src/default-write-mode-lock.js";
import { evaluateOperationLock } from "../src/operation-lock.js";
import { CANONICAL_BODY_ROUTES } from "../src/runtime-route-contract.js";
import { CANONICAL_SKILL_CHAINS, RUNTIME_SKILL_IDS } from "../src/runtime-skill-chain.js";
import { createRuntimeSession, resumeRuntimeSession } from "../src/runtime-engine.js";
import { auditRuntimeTerminology } from "../src/runtime-terminology-audit.js";

const root = resolve(new URL("..", import.meta.url).pathname);
const sha = (text) => createHash("sha256").update(Buffer.from(text, "utf8")).digest("hex");

function withPack(files, fn) {
  const dir = mkdtempSync(join(tmpdir(), "pw90-contract-gap-"));
  try {
    for (const [name, content] of Object.entries(files)) writeFileSync(join(dir, name), content, "utf8");
    return fn(dir);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

function walk(dir) {
  const out=[];
  for (const name of readdirSync(dir)) {
    const p=join(dir,name); const st=statSync(p);
    if (st.isDirectory()) out.push(...walk(p)); else out.push(p);
  }
  return out;
}

test("gap 01 serialized session tampering cannot bypass S08 S09 S11 terminal evidence", () => {
  const s = createRuntimeSession({ operation:{mode:"WRITE",writerPackOrHandoffPresent:true,targetStoryNumberPresent:true,outputFormatPresent:true}, writeTrigger:"write", hasWritableStoryPack:true });
  const t = JSON.parse(JSON.stringify(s));
  t.status="READY"; t.cursor=t.skillChain.length; t.currentSkill=null; t.pendingHostAction=null; t.skillResults={};
  const out=resumeRuntimeSession(t);
  assert.equal(out.status,"STOPPED");
  assert.notEqual(out.terminalState,"SUCCESS");
  assert.ok(out.integrityFailures.some((x)=>["RUNTIME_SKILL_RESULTS_PREFIX_INVALID","S08_SUCCESS_EVIDENCE_REQUIRED","S09_ARTIFACT_EVIDENCE_REQUIRED","S11_DELIVERY_EVIDENCE_REQUIRED"].includes(x.code)));
});

test("gap 02 every active WRITE chain begins at S00 mount boot", () => {
  for (const route of [CANONICAL_BODY_ROUTES.PACK_ONLY_FULLBURN, CANONICAL_BODY_ROUTES.PACK_PLUS_BODY_TEXT]) {
    assert.equal(CANONICAL_SKILL_CHAINS[route][0], RUNTIME_SKILL_IDS.MOUNT_BOOT);
  }
});

test("gap 03 manifest-only directory is not a writable story pack", () => withPack({"manifest.json":"{\"name\":\"only metadata\"}\n"}, (dir) => {
  const r=inspectWritableStoryPackDirectory(dir);
  assert.equal(r.writeDecision,"STOP_BEFORE_TEXT");
  assert.ok(r.failures.some((x)=>x.code==="BODY_ELIGIBLE_STORY_MATERIAL_MISSING"));
}));

test("gap 04 WRITABLE_ZIP keeps process metadata out of body-source candidates", () => withPack({
  "execution_queue.md":"do later\n", "manifest.json":"{\"id\":1}\n", "story.txt":"body story material\n"
}, (dir) => {
  const r=inspectWritableStoryPackDirectory(dir);
  assert.equal(r.inspectDecision,"WRITABLE_STORY_PACK_INSPECT_OK");
  assert.deepEqual([...r.processOnlyFiles].sort(),["execution_queue.md","manifest.json"]);
  assert.equal(r.fileCatalog.find((x)=>x.path==="story.txt").role,"RESTORE_SOURCE_CANDIDATE");
  assert.equal(r.fileCatalog.find((x)=>x.path==="execution_queue.md").role,"PROCESS_ONLY");
}));

test("gap 05 WRITABLE_ZIP cannot reach WRITE_ALLOWED without condition extraction and binding proof", () => withPack({"story.txt":"body story material\n"}, (dir) => {
  const pack=inspectWritableStoryPackDirectory(dir);
  const r=evaluateWritableStoryPackPreWrite({
    activation:{input_mode:"WRITABLE_ZIP_STORY_PACK",episode_id:"PACK",activation_id:"ACT",degraded_mode:false,activation_validity:{user_or_design_declared:true,filename_inference_allowed:false,folder_size_inference_allowed:false,style_inference_allowed:false}},
    writableStoryPackResult:pack
  });
  assert.equal(r.decision,"STOP_BEFORE_TEXT");
  const codes=new Set(r.failures.map((x)=>x.code));
  assert.ok(codes.has("WRITABLE_CONDITION_LEDGER_SCHEMA_REQUIRED"));
  assert.ok(codes.has("WRITABLE_SOURCE_COVERAGE_REQUIRED"));
  assert.ok(r.failures.some((x)=>x.assertion === "all_read_order_files_readable_and_read"));
}));

test("gap 06 explicit lightweight request is rejected at entry instead of routed to unresolved S06", () => {
  const r=resolveDefaultWriteMode({trigger:"write",explicitLightweightMode:"trial"});
  assert.equal(r.decision,"STOP_BEFORE_TEXT");
  assert.ok(r.failures.some((x)=>x.code==="LIGHTWEIGHT_MODE_UNSUPPORTED_CURRENT_RUNTIME"));
  for (const chain of Object.values(CANONICAL_SKILL_CHAINS)) assert.equal(chain.includes(RUNTIME_SKILL_IDS.LIGHTWEIGHT_WRITE),false);
});

test("gap 07 INSPECT and REPAIR are rejected until real owners exist", () => {
  for (const mode of ["INSPECT","REPAIR"]) {
    const r=evaluateOperationLock({mode,noManuscriptRequested:true});
    assert.equal(r.decision,"STOP_BEFORE_TEXT");
    assert.ok(r.failures.some((x)=>x.code==="OPERATION_MODE_UNSUPPORTED_CURRENT_RUNTIME"));
  }
});

test("gap 08 active source applicability labels target the current runtime or explicit origin provenance", () => {
  for (const p of walk(join(root,"source"))) {
    if (!/\.(md|txt)$/.test(p)) continue;
    for (const line of readFileSync(p,"utf8").split(/\r?\n/)) {
      if (/^(ORIGIN_|PROVENANCE|HISTORICAL_|BEHAVIOR_BASELINE)/.test(line.trim())) continue;
      if (line.includes("APPLIES_TO_RUNTIME:")) assert.ok(line.includes("v004.28"),`${p}: ${line}`);
      if (line.includes("BASE_RUNTIME:")) assert.ok(line.includes("v004.28"),`${p}: ${line}`);
    }
  }
});

test("gap 09 source output contracts agree on the fixed five-field success artifact", () => {
  const builder=readFileSync(join(root,"source/GPT_BUILDER_INSTRUCTIONS_PACK_CONVERTER_v1.txt"),"utf8");
  const detail=readFileSync(join(root,"source/knowledge/WRITER_COMMON_NOM_DETAIL_v2.md"),"utf8");
  for (const field of ["filename_line","target_length_or_self_bound","frozen_condition_table_short","text","本文後LOG"]) {
    assert.ok(builder.includes(field),`builder missing ${field}`); assert.ok(detail.includes(field),`detail missing ${field}`);
  }
});

test("gap 10 natural compression cannot be used as underlength or SUCCESS justification", () => {
  const detail=readFileSync(join(root,"source/knowledge/WRITER_COMMON_NOM_DETAIL_v2.md"),"utf8");
  const lock=readFileSync(join(root,"source/knowledge/PW90_CHAT_DISPLAY_COMPRESSION_DENIAL_LOCK_v001.md"),"utf8");
  assert.ok(detail.includes("natural_compression_as_observed_text_shape_only"));
  assert.ok(detail.includes("natural_compression_as_underlength_or_success_reason"));
  assert.ok(lock.includes("natural_compression_after_full_recovery"));
  assert.ok(lock.includes("禁止") || lock.includes("DENY"));
});

test("gap 11 narration-layer internal markdown references resolve", () => {
  const audit=auditRuntimeTerminology();
  const broken=audit.classifications.accidentalTerminologyDrift.filter((x)=>x.reason==="broken internal markdown reference");
  assert.deepEqual(broken,[]);
});

test("gap 12 terminology audit and destructive-contract suite itself converge", () => {
  const audit=auditRuntimeTerminology();
  assert.equal(audit.decision,"TERMINOLOGY_CONVERGED");
  assert.equal(audit.accidentalDriftCount,0);
});
