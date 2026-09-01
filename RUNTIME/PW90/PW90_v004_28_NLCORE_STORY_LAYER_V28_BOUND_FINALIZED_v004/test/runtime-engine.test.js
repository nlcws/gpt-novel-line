import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { READ_ORDER, RUNTIME_VERSION } from "../src/program.js";
import { REQUIRED_NEW_EPISODE_FULL_BOOT_FLAGS } from "../src/new-episode-full-boot-lock.js";
import { REQUIRED_FULL_POWER_PREWRITE_FLAGS } from "../src/full-power-write-lock.js";
import { REQUIRED_PREWRITE_FLAGS, WRITE_EXECUTION_ORDER } from "../src/prewrite-common-contract.js";
import { REQUIRED_PRETEXT_PICKUP_CHECKS, CONFLICT_RESOLUTION_ORDER, WARN_POLICY } from "../src/pickup-ledger-gate.js";
import { WRITABLE_CONDITION_LEDGER_SCHEMA } from "../src/writable-story-pack-gate.js";
import { RUNTIME_SKILL_IDS, RUNTIME_STATE_IDS } from "../src/runtime-vocabulary.js";
import { createRuntimeSession, startRuntime, resumeRuntimeSession, summarizeRuntimeSession, validateRuntimeSessionIntegrity } from "../src/runtime-engine.js";
import { executeRuntimeSkill, SKILL_EXECUTOR_STATUS } from "../src/runtime-skill-executors.js";

const validOperation = (extra = {}) => ({ mode:"WRITE", writerPackOrHandoffPresent:true, targetStoryNumberPresent:true, outputFormatPresent:true, ...extra });
const validNewEpisodeGate = () => ({ bootMode:"NEW_EPISODE_FULL_BOOT", previousEpisodeInertiaAllowed:false, writerInstanceLoadLimitUsedAsCurrentBasis:false, continueAsCarryoverAllowed:false, fullburnWriteRequired:true, newEpisodeBootGateMisfireQuarantinesText:true, flags:Object.fromEntries(REQUIRED_NEW_EPISODE_FULL_BOOT_FLAGS.map((f)=>[f,true])) });
const validMountState = () => ({ mountedArchiveReadable:true, zipIntegrityValid:true, unsafePathsAbsent:true, nestedZipAbsent:true, readLedger:READ_ORDER.map((path)=>({path,exists:true,read:true})), sourceIdentityVerified:true, activeRuntimeContractConstructed:true, successOutputContractResolved:true, nomDetailPackWriterOutputAdopted:true });
const validHardBindingState = () => ({ ...validMountState(), mountIntegrityChecked:true, flow1To11Completed:true, frozenConditionTableShortGenerated:true, currentCycleRereadConfirmed:true, memoryFilenameSummaryNotUsedAsRead:true });
const conditionIds = () => ["REQ_PACK_001","FORBID_PACK_001","LAYER_PACK_001","CONN_PACK_001","SRC_PACK_001"];
const validFullPowerPrewrite = (ids=conditionIds()) => ({ flags:Object.fromEntries(REQUIRED_FULL_POWER_PREWRITE_FLAGS.map((f)=>[f,true])), episodeScaleStandard:"15K", storyCardConditionUse:"all_conditions_for_one_episode", ds90PackBurnExpectation:"15k_full_burn_material", successBasis:"pack_full_burn_not_external_average", under15kPolicy:"allowed_only_after_full_burn", endUserDependencyAllowed:false, safetyCaveatAsEffortLimitAllowed:false, successMayBeThin:false, sceneConstructionPlan:[{sceneId:"SCENE_01",purpose:"pack condition burn",requiredConditionIds:[...ids],concreteWorkPoints:["object","position","hand","temperature"],conditionPropagationPoints:["object changes action","position changes reaction","temperature remains"],thinRisk:"summary substitution",minimumDelivery:"all pack conditions become body"}] });
const validPreWrite = () => ({ ...Object.fromEntries(REQUIRED_PREWRITE_FLAGS.map((f)=>[f,true])), executionOrder:[...WRITE_EXECUTION_ORDER] });
const validPickup = () => ({
  checks:Object.fromEntries(REQUIRED_PRETEXT_PICKUP_CHECKS.map((f)=>[f,true])),
  plannedRestoreMaterialIds:["WZ_REQ_PACK_001"],
  plannedConstraintMaterialIds:["WZ_FORBID_PACK_001","WZ_LAYER_PACK_001","WZ_CONN_PACK_001","WZ_SRC_PACK_001"],
  readButNonBodyMaterialIds:[], bodyEligibleMaterialIds:["WZ_REQ_PACK_001"], forbiddenBodyMaterialIds:[],
  requiredElementLedger:[{id:"REQ_PACK_001",sourceMaterialId:"WZ_REQ_PACK_001",status:"picked"}],
  forbiddenLineLedger:[{id:"FORBID_PACK_001",sourceMaterialId:"WZ_FORBID_PACK_001",status:"picked"}],
  layerBindingLedger:[{id:"LAYER_PACK_001",sourceMaterialId:"WZ_LAYER_PACK_001",status:"picked"}],
  connectionLedger:[{id:"CONN_PACK_001",sourceMaterialId:"WZ_CONN_PACK_001",status:"picked"}],
  sourceVerificationLedger:[{id:"SRC_PACK_001",mountId:"WRITABLE_ZIP_TEST",status:"verified",writeAuthority:"allowed"}],
  deliveryIntent:{requestedVision:"story pack conditions",nonDroppableCore:"all conditions",forbiddenLineFocus:"keep forbidden lines",endpoint:"write novel text"},
  conflictResolutionOrder:[...CONFLICT_RESOLUTION_ORDER], warnPolicy:{...WARN_POLICY},
  quarantineReturnTicketTemplate:{reason:"spec defect",impact:"text cannot promote",requiredFix:"repair named evidence",boundary:"PW90 quarantine",resumeCondition:"rerun repaired gate"}
});
function validWritablePrewrite(root, text) {
  const sha=createHash("sha256").update(Buffer.from(text,"utf8")).digest("hex");
  const roles=[
    ["REQ_PACK_001","RESTORE_SOURCE","core event"], ["FORBID_PACK_001","RESTORE_CONSTRAINT","do not invert outcome"],
    ["LAYER_PACK_001","RESTORE_CONSTRAINT","layer ON"], ["CONN_PACK_001","RESTORE_CONSTRAINT","continue from prior anchor"],
    ["SRC_PACK_001","RESTORE_CONSTRAINT","source verified"]
  ];
  return {
    activation:{ input_mode:"WRITABLE_ZIP_STORY_PACK", episode_id:"EP001", activation_id:"ACT001", degraded_mode:false, activation_validity:{user_or_design_declared:true,filename_inference_allowed:false,folder_size_inference_allowed:false,style_inference_allowed:false} },
    writableConditionLedger:{ schema:WRITABLE_CONDITION_LEDGER_SCHEMA, sourceCoverage:[{path:"story.txt",sha256:sha,extractionComplete:true}], conditions:roles.map(([id,role,conditionText],i)=>({id,role,sourcePath:"story.txt",sourceLocator:`line:${i+1}`,conditionText})) },
    preTextPickup:validPickup(), fullPowerWriteGate:validFullPowerPrewrite(), preWrite:validPreWrite()
  };
}
function validWriteInput(root,text){ return { operation:validOperation(), writeTrigger:"write", hasWritableStoryPack:true, mountState:validMountState(), hardBindingState:validHardBindingState(), newEpisode:{trigger:"write",targetEpisodeChanged:true}, newEpisodeGate:validNewEpisodeGate(), pack:{kind:"WRITABLE_ZIP",root}, prewriteInput:validWritablePrewrite(root,text) }; }

test("v004.28 exposes story-layer-v28-bound executable runtime engine",()=>{ assert.equal(RUNTIME_VERSION,"pw90-v004.28-nlcore-story-layer-v28-bound"); assert.equal(SKILL_EXECUTOR_STATUS[RUNTIME_SKILL_IDS.FULLBURN_BODY_WRITE_21C],"HOST_BODY"); assert.equal(SKILL_EXECUTOR_STATUS[RUNTIME_SKILL_IDS.FULL_CONVERGENCE_SWEEP],"SOLE_SUCCESS_AUTHORITY"); });
test("maintenance BOOT runs S00 and terminates body-free",()=>{ const s=startRuntime({operation:{mode:"BOOT",noManuscriptRequested:true},mountState:validMountState()}); assert.equal(s.status,"COMPLETED"); assert.equal(s.terminalState,RUNTIME_STATE_IDS.MAINTENANCE_COMPLETE_NO_BODY); assert.deepEqual(s.skillChain,[RUNTIME_SKILL_IDS.MOUNT_BOOT]); assert.equal(validateRuntimeSessionIntegrity(s).length,0); });
test("WRITE always executes S00 before S01-S03 and pauses at S04",()=>{ const root=mkdtempSync(join(tmpdir(),"pw90-v425-pack-")); try{ const text="雨の駅で姉が弟へ嘘をつき、最後に白い傘を残す。\n"; writeFileSync(join(root,"story.txt"),text,"utf8"); const s=startRuntime(validWriteInput(root,text)); assert.equal(s.status,"WAITING_FOR_HOST"); assert.equal(s.currentSkill,RUNTIME_SKILL_IDS.FULLBURN_BODY_WRITE_21C); assert.equal(s.skillResults[RUNTIME_SKILL_IDS.MOUNT_BOOT].decision,"BOOT_READY"); assert.equal(s.skillResults[RUNTIME_SKILL_IDS.PREWRITE_CONDITION_BUILD].decision,"WRITE_ALLOWED"); assert.equal(s.pendingHostAction.contract.mandatoryInternalRevisionCount,0); } finally{rmSync(root,{recursive:true,force:true});} });

test("SECOND_DRAFT route pauses at S05 with 15K target but no hard minimum",()=>{ const root=mkdtempSync(join(tmpdir(),"pw90-v427-second-")); try{ const text="story material"; writeFileSync(join(root,"story.txt"),text); const input=validWriteInput(root,text); input.hasBodyTxt=true; const s=startRuntime(input); assert.equal(s.status,"WAITING_FOR_HOST"); assert.equal(s.currentSkill,RUNTIME_SKILL_IDS.EXTERNAL_SECOND_DRAFT); assert.equal(s.pendingHostAction.contract.targetBodyChars,15000); assert.equal(s.pendingHostAction.contract.hardMinBodyChars,null); assert.equal(s.pendingHostAction.contract.under15kRequiresFullBurnProof,true); } finally{rmSync(root,{recursive:true,force:true});} });
test("WRITE without mount/read proof stops at S00",()=>{ const root=mkdtempSync(join(tmpdir(),"pw90-v425-nomount-")); try{ const text="story material"; writeFileSync(join(root,"story.txt"),text); const input=validWriteInput(root,text); delete input.mountState; const s=startRuntime(input); assert.equal(s.status,"STOPPED"); assert.equal(s.currentSkill,RUNTIME_SKILL_IDS.MOUNT_BOOT); assert.ok(s.skillResults[RUNTIME_SKILL_IDS.MOUNT_BOOT].failures.length>0); } finally{rmSync(root,{recursive:true,force:true});} });
test("host body resumes and missing posttext evidence is quarantined by S07",()=>{ const root=mkdtempSync(join(tmpdir(),"pw90-v425-resume-")); try{ const text="story material"; writeFileSync(join(root,"story.txt"),text); let s=startRuntime(validWriteInput(root,text)); s=resumeRuntimeSession(s,{payload:{hostBodyResult:{output:{text:"本文"},checks:{},consumption:{}}}}); assert.equal(s.status,"QUARANTINED"); assert.equal(s.currentSkill,RUNTIME_SKILL_IDS.POSTTEXT_AUDIT); } finally{rmSync(root,{recursive:true,force:true});} });
test("serialized session cursor/chain tampering cannot fabricate SUCCESS",()=>{ const root=mkdtempSync(join(tmpdir(),"pw90-v425-tamper-")); try{ const text="story material"; writeFileSync(join(root,"story.txt"),text); const s=startRuntime(validWriteInput(root,text)); const tampered=JSON.parse(JSON.stringify(s)); tampered.status="READY"; tampered.pendingHostAction=null; tampered.cursor=tampered.skillChain.length; tampered.currentSkill=null; const out=resumeRuntimeSession(tampered); assert.equal(out.status,"STOPPED"); assert.equal(out.terminalState,RUNTIME_STATE_IDS.STOP_BEFORE_TEXT); assert.ok(out.integrityFailures.some((x)=>["RUNTIME_SKILL_RESULTS_PREFIX_INVALID","S08_SUCCESS_EVIDENCE_REQUIRED"].includes(x.code))); } finally{rmSync(root,{recursive:true,force:true});} });
test("explicit lightweight request stops at entry instead of entering S06",()=>{ const s=createRuntimeSession({operation:validOperation(),writeTrigger:"write",explicitLightweightMode:"short",hasWritableStoryPack:true}); assert.equal(s.status,"STOPPED"); assert.deepEqual(s.skillChain,[]); assert.ok(s.plan.routeResolution.failures.some((x)=>x.code==="LIGHTWEIGHT_MODE_UNSUPPORTED_CURRENT_RUNTIME")); });
test("INSPECT and REPAIR are rejected because no active owner exists",()=>{ for(const mode of ["INSPECT","REPAIR"]){ const s=createRuntimeSession({operation:{mode,noManuscriptRequested:true}}); assert.equal(s.status,"STOPPED"); assert.ok(s.plan.routeResolution.failures.some((x)=>x.code==="OPERATION_MODE_UNSUPPORTED_CURRENT_RUNTIME")); } });
test("S09 cannot fabricate artifact without S08 SUCCESS",()=>{ const session=createRuntimeSession({operation:validOperation(),writeTrigger:"write",hasWritableStoryPack:true}); const result=executeRuntimeSkill({skillId:RUNTIME_SKILL_IDS.ARTIFACT_BUILD,session}); assert.equal(result.pass,false); assert.equal(result.failures[0].code,"S08_SUCCESS_REQUIRED_BEFORE_ARTIFACT"); });
test("runtime sessions remain JSON serializable and report sole success authority",()=>{ const s=createRuntimeSession({operation:{mode:"BOOT",noManuscriptRequested:true}}); const rt=JSON.parse(JSON.stringify(s)); const summary=summarizeRuntimeSession(rt); assert.equal(summary.soleSuccessAuthority,RUNTIME_SKILL_IDS.FULL_CONVERGENCE_SWEEP); assert.equal(summary.runtimeVersion,RUNTIME_VERSION); });
