import test from "node:test";
import assert from "node:assert/strict";
import { observeNormalFullburnBody, observeSecondDraftBody } from "../src/body-char-observer.js";
import { SECOND_DRAFT_BODY_HEAD_DIRECTIVE, validateSecondDraftPostText } from "../src/second-draft-branch-lock.js";
import { validateFullPowerPostTextGate, REQUIRED_FULL_POWER_POSTTEXT_FLAGS } from "../src/full-power-write-lock.js";

const baseFullGate = () => ({
  flags:Object.fromEntries(REQUIRED_FULL_POWER_POSTTEXT_FLAGS.map((f)=>[f,true])), quarantineIfThin:true,
  sceneExecution:[{sceneId:"SCENE_01",recoveredConditionIds:["REQ"],concreteWorkRecovered:["a","b","c","d"],conditionPropagationRecovered:["a","b","c"],bodyEvidence:"observed body"}], thinnessAudit:{underlengthReason:"under15k_full_burn_proven_no_remaining_material",omissionDetected:false,substitutionDetected:false,escapeDetected:false,genericFlatteningDetected:false,userWouldNeedToPointOutThinness:false,selfRewriteRequired:false,finalDensityDecision:"full burn"},
  textScaleAudit:{episodeScaleStandard:"15K",ds90PackTreatedAs15kMaterial:true,externalAverageComparisonUsed:false,readableFiveKCompletionAccepted:false,conditionsLeftAsChecklistOnly:false,unresolvedNaturalExpansionRemaining:false,actualCharCount:999999,fullBurnDecision:"full burn",under15kFullBurnProof:"all material burned"}
});
const emptyPre = { fullPowerWritePlan:[{sceneId:"SCENE_01"}] };
const secondGate = () => ({secondDraftBranch:"ACTIVE",inputBasis:"PACK_PLUS_BODY_TEXT",bodyTextRole:"EXISTING_DRAFT_TO_EXPAND",packReread:"PASS",bodyHeadDirective:"PASS",actualBodyCharCount:999999,expandedScenes:["SCENE"],newlyRecoveredPackConditions:[],stillThinRisk:false,lengthPaddingDetected:false,finalDecision:"SUCCESS_CANDIDATE_AFTER_SECOND_DRAFT_EXPANSION"});

test("normal 14999 chars with full-burn proof is not rejected by a hard 15K floor",()=>{
  const gate=baseFullGate();
  const failures=validateFullPowerPostTextGate({preWriteResult:emptyPre,gate,bodyText:"あ".repeat(14999)});
  assert.deepEqual(failures,[]);
});

test("normal 14999 chars without proof fails the proof path, not a hard floor",()=>{
  const gate=baseFullGate(); gate.textScaleAudit.under15kFullBurnProof="";
  const failures=validateFullPowerPostTextGate({preWriteResult:emptyPre,gate,bodyText:"あ".repeat(14999)});
  assert.ok(failures.some((x)=>x.code==="EPISODE_15K_UNDER15K_FULL_BURN_PROOF_REQUIRED"));
  assert.equal(failures.some((x)=>x.code==="SECOND_DRAFT_BODY_UNDER_15K"),false);
});

test("claimed normal actualCharCount cannot hide a 5000-char observed body",()=>{
  const gate=baseFullGate(); gate.textScaleAudit.actualCharCount=15000; gate.textScaleAudit.under15kFullBurnProof="";
  const failures=validateFullPowerPostTextGate({preWriteResult:emptyPre,gate,bodyText:"あ".repeat(5000)});
  const hit=failures.find((x)=>x.code==="EPISODE_15K_UNDER15K_FULL_BURN_PROOF_REQUIRED");
  assert.equal(hit.detail.observedBodyCharCount,5000);
});

test("normal 15000+ remains subject to thinness and convergence gates",()=>{
  const gate=baseFullGate(); gate.thinnessAudit.genericFlatteningDetected=true;
  const failures=validateFullPowerPostTextGate({preWriteResult:emptyPre,gate,bodyText:"あ".repeat(15000)});
  assert.ok(failures.some((x)=>x.code==="FULL_POWER_THINNESS_AUDIT_FAILED"));
});

test("second draft observed 14999 enters full-burn proof path rather than hard-floor failure",()=>{
  const text=`${SECOND_DRAFT_BODY_HEAD_DIRECTIVE}\n# 第1話　題\n${"あ".repeat(14999)}`;
  const failures=validateSecondDraftPostText({gate:secondGate(),text});
  const hit=failures.find((x)=>x.code==="SECOND_DRAFT_UNDER15K_FULL_BURN_PROOF_REQUIRED");
  assert.equal(hit.detail.observedBodyCharCount,14999);
  assert.equal(failures.some((x)=>x.code==="SECOND_DRAFT_BODY_UNDER_15K"),false);
});

test("second draft observed 15000 body passes the length condition",()=>{
  const gate=secondGate(); gate.actualBodyCharCount=1;
  const text=`${SECOND_DRAFT_BODY_HEAD_DIRECTIVE}\n# 第1話　題\n${"あ".repeat(15000)}`;
  assert.deepEqual(validateSecondDraftPostText({gate,text}),[]);
});

test("second draft structural directive, title and markdown headings are excluded",()=>{
  const text=`${SECOND_DRAFT_BODY_HEAD_DIRECTIVE}\n# 第1話　題\n## 本文ヘッダ\n${"あ".repeat(14999)}`;
  const observed=observeSecondDraftBody(text,SECOND_DRAFT_BODY_HEAD_DIRECTIVE);
  assert.equal(observed.observedBodyCharCount,14999);
});

test("normal body observer ignores leading markdown title but not body prose",()=>{
  const observed=observeNormalFullburnBody(`# 第1話　題\n\n${"あ".repeat(14999)}`);
  assert.equal(observed.observedBodyCharCount,14999);
});


test("normal 15000+ with unburned natural expansion still fails",()=>{
  const gate=baseFullGate(); gate.textScaleAudit.unresolvedNaturalExpansionRemaining=true;
  const failures=validateFullPowerPostTextGate({preWriteResult:emptyPre,gate,bodyText:"あ".repeat(15000)});
  assert.ok(failures.some((x)=>x.code==="EPISODE_15K_NATURAL_EXPANSION_REMAINING"));
});

test("second draft total text can exceed 15K while body 14999 still requires body full-burn proof",()=>{
  const hugeTitle="# "+"題".repeat(1000);
  const text=`${SECOND_DRAFT_BODY_HEAD_DIRECTIVE}\n${hugeTitle}\n${"あ".repeat(14999)}`;
  const failures=validateSecondDraftPostText({gate:secondGate(),text});
  assert.ok(failures.some((x)=>x.code==="SECOND_DRAFT_UNDER15K_FULL_BURN_PROOF_REQUIRED"));
});

test("second draft 15000 body with stillThinRisk true fails despite length",()=>{
  const gate=secondGate(); gate.stillThinRisk=true;
  const text=`${SECOND_DRAFT_BODY_HEAD_DIRECTIVE}\n# 第1話　題\n${"あ".repeat(15000)}`;
  const failures=validateSecondDraftPostText({gate,text});
  assert.ok(failures.some((x)=>x.code==="SECOND_DRAFT_STILL_THIN_RISK_DENIED"));
});


test("second draft observed 14999 can pass with full-burn proof and no padding",()=>{
  const gate=secondGate(); gate.under15kFullBurnProof="all usable conditions burned; explicit HOLD preserved; further expansion would be padding";
  const text=`${SECOND_DRAFT_BODY_HEAD_DIRECTIVE}\n# 第1話　題\n${"あ".repeat(14999)}`;
  assert.deepEqual(validateSecondDraftPostText({gate,text}),[]);
});

test("second draft 15000 body still fails when length padding is detected",()=>{
  const gate=secondGate(); gate.lengthPaddingDetected=true;
  const text=`${SECOND_DRAFT_BODY_HEAD_DIRECTIVE}\n# 第1話　題\n${"あ".repeat(15000)}`;
  assert.ok(validateSecondDraftPostText({gate,text}).some((x)=>x.code==="SECOND_DRAFT_LENGTH_PADDING_DENIED"));
});
