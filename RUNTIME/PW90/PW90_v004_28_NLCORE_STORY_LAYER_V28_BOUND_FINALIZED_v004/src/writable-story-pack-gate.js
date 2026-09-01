import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { evaluateHardBinding } from "./hard-binding-adapter.js";
import { validatePreTextPickupLedger, collectPreTextConditionIds } from "./pickup-ledger-gate.js";
import { validateFullPowerPreWriteGate } from "./full-power-write-lock.js";
import { validateCommonPreWriteState } from "./prewrite-common-contract.js";

export const WRITABLE_STORY_PACK_GATE_ID = "WRITABLE_ZIP_STORY_PACK_MINIMUM_GATE";
export const WRITABLE_STORY_PACK_INPUT_MODE = "WRITABLE_ZIP_STORY_PACK";
export const WRITABLE_STORY_PACK_CONTRACT_ID = "WRITER_ACCEPTS_WRITABLE_ZIP_PACK";
export const WRITABLE_CONDITION_LEDGER_SCHEMA = "PW90_WRITABLE_CONDITION_LEDGER_v001";

export const WRITER_CORE_INVARIANT = Object.freeze({
  id: "WRITER_COLLECTS_ALL_PACK_CONDITIONS_AND_WRITES_TEXT", acceptsChatInputAsStoryPack: false,
  acceptsZipPack: true, rejectsByDesignerVersion: false, rejectsByFormatLuxury: false,
  coreDuty: "collect_all_conditions_inside_the_story_pack_and_write_novel_text",
  handoffBasis: "artifact_based_not_code_or_version_based"
});
export const CANONICAL_FORMAT_STATUS = Object.freeze({ latestCanonicalStoryPack: "best_for_reproducibility_and_audit", minimumStoryPack: "zip_pack_with_body_eligible_material_plus_complete_condition_extraction", missingReadyV2LayerFrozenManifest: "warn_not_reject_when_material_is_writable" });

const TEXT_EXTENSIONS = Object.freeze([".txt", ".md", ".markdown", ".json", ".jsonl", ".yaml", ".yml", ".csv", ".tsv"]);
const NON_BODY_PATTERNS = Object.freeze([
  /(^|\/)(99_)?manifest\.json$/i, /(^|\/)(package|schema|metadata)\.json$/i,
  /(^|\/)(execution[_-]?queue|runtime[_-]?queue|readme|validation|validator|audit|report|checksum|sha256|index)(\.|_|-)/i,
  /(^|\/)(execution[_-]?queue|runtime[_-]?queue|readme|validation|audit|report|checksum|index)\.(md|txt|json)$/i
]);
const CONSTRAINT_PATTERNS = Object.freeze([/(^|\/)(03_)?layer\.(md|txt|json)$/i, /(^|\/)(05_)?frozen\.(md|txt|json)$/i, /forbidden|constraint|禁止|固定層|heat[_-]?layer/i]);
const fail = (code, path, detail = null) => detail == null ? { code, path } : { code, path, detail };
const warn = (code, path, detail = null) => detail == null ? { code, path } : { code, path, detail };
function pathIsSafe(rel) { return typeof rel === "string" && rel.trim() !== "" && !rel.startsWith("/") && !rel.includes("\\") && !rel.split("/").some((part) => part === "" || part === "." || part === ".."); }
function listFilesRecursive(root) { const out=[]; const walk=(dir)=>{ for(const name of readdirSync(dir)){ const path=join(dir,name); const rel=relative(root,path).replaceAll("\\","/"); const st=statSync(path); if(st.isDirectory()) walk(path); else out.push(rel);} }; walk(root); return out.sort(); }
function extOf(rel) { const lower=rel.toLowerCase(); return TEXT_EXTENSIONS.find((ext)=>lower.endsWith(ext)) ?? null; }
function readUtf8(path) { const content=readFileSync(path,"utf8"); if(content.includes("\uFFFD")) throw new Error("replacement character detected"); return content; }
function sha256Text(content) { return createHash("sha256").update(Buffer.from(content,"utf8")).digest("hex"); }
function hasMeaningfulText(content) { if(typeof content!=="string") return false; return content.replace(/```[\s\S]*?```/g," ").replace(/[{}\[\]\",:]/g," ").trim().length >= 1; }
function classifyPath(rel) { if(NON_BODY_PATTERNS.some((r)=>r.test(rel))) return "PROCESS_ONLY"; if(CONSTRAINT_PATTERNS.some((r)=>r.test(rel))) return "RESTORE_CONSTRAINT_CANDIDATE"; return "RESTORE_SOURCE_CANDIDATE"; }
function freezeCatalogEntry(entry){ return Object.freeze({ ...entry }); }

export function inspectWritableStoryPackDirectory(root, options = {}) {
  const failures=[]; const warnings=[];
  if(options.chatInput===true || options.inputKind==="CHAT") return Object.freeze({ gate:WRITABLE_STORY_PACK_GATE_ID, inspectDecision:"WRITABLE_STORY_PACK_REJECTED", writeDecision:"STOP_BEFORE_TEXT", inputKind:"CHAT", failures:Object.freeze([fail("CHAT_INPUT_NOT_ACCEPTED_AS_RUNTIME_STORY_PACK","input")]), warnings:Object.freeze([]), bodyEligibleFileCount:0, fileCatalog:Object.freeze([]), shelves:null });
  if(typeof root!=="string" || root.trim()==="" || !existsSync(root) || !statSync(root).isDirectory()) return Object.freeze({ gate:WRITABLE_STORY_PACK_GATE_ID, inspectDecision:"WRITABLE_STORY_PACK_SHAPE_FAILED", writeDecision:"STOP_BEFORE_TEXT", inputKind:"ZIP_PACK_DIRECTORY", failures:Object.freeze([fail("PACK_ROOT_DIRECTORY_MISSING","root")]), warnings:Object.freeze([]), bodyEligibleFileCount:0, fileCatalog:Object.freeze([]), shelves:null });
  const files=listFilesRecursive(root); if(files.length===0) failures.push(fail("PACK_EMPTY","root"));
  const catalog=[];
  for(const rel of files){
    if(!pathIsSafe(rel)) failures.push(fail("PACK_PATH_UNSAFE",rel));
    if(rel.toLowerCase().endsWith(".zip")){ warnings.push(warn("NESTED_ZIP_PRESENT_REFERENCE_ONLY",rel)); continue; }
    if(extOf(rel)==null) continue;
    try{
      const content=readUtf8(join(root,rel));
      if(content.startsWith("\uFEFF")) warnings.push(warn("BOM_PRESENT_WARN",rel));
      if(content.includes("\r")) warnings.push(warn("CRLF_PRESENT_WARN",rel));
      const role=classifyPath(rel);
      if(!hasMeaningfulText(content)){ warnings.push(warn("TEXT_FILE_EMPTY_OR_NO_WRITABLE_SIGNAL",rel)); continue; }
      catalog.push(freezeCatalogEntry({ path:rel, role, bytes:Buffer.byteLength(content,"utf8"), sha256:sha256Text(content), content }));
    }catch(error){ failures.push(fail("TEXT_FILE_UNREADABLE",rel,error.message)); }
  }
  const bodyEligible=catalog.filter((x)=>x.role==="RESTORE_SOURCE_CANDIDATE");
  if(bodyEligible.length===0) failures.push(fail("BODY_ELIGIBLE_STORY_MATERIAL_MISSING","root"));
  const hasCanonicalReady=files.some((rel)=>(/(^|\/)01_ready\.md$/).test(rel));
  const hasCanonicalV2=files.some((rel)=>(/(^|\/)02_v2\.md$/).test(rel));
  const hasCanonicalLayer=files.some((rel)=>(/(^|\/)03_layer\.md$/).test(rel));
  const hasCanonicalFrozen=files.some((rel)=>(/(^|\/)05_frozen\.md$/).test(rel));
  const hasManifest=files.some((rel)=>(/(^|\/)(99_)?manifest\.json$/).test(rel) || /(^|\/)manifest\.json$/.test(rel));
  if(!hasCanonicalReady || !hasCanonicalV2 || !hasCanonicalLayer || !hasCanonicalFrozen || !hasManifest) warnings.push(warn("NON_CANONICAL_BUT_WRITABLE_PACK_FORMAT","root",{ready:hasCanonicalReady,v2:hasCanonicalV2,layer:hasCanonicalLayer,frozen:hasCanonicalFrozen,manifest:hasManifest}));
  return Object.freeze({ gate:WRITABLE_STORY_PACK_GATE_ID, contract:WRITABLE_STORY_PACK_CONTRACT_ID,
    inspectDecision:failures.length===0?"WRITABLE_STORY_PACK_INSPECT_OK":"WRITABLE_STORY_PACK_SHAPE_FAILED",
    writeDecision:failures.length===0?"WRITABLE_STORY_PACK_PREWRITE_EXTRACTION_REQUIRED":"STOP_BEFORE_TEXT",
    inputKind:"ZIP_PACK_DIRECTORY", minimumDefinitionSatisfied:failures.length===0, canonicalFormatRequired:false, designerVersionRequired:false, chatInputAccepted:false,
    failures:Object.freeze(failures), warnings:Object.freeze(warnings), bodyEligibleFileCount:bodyEligible.length,
    conditionSourceFiles:Object.freeze(catalog.filter((x)=>x.role!=="PROCESS_ONLY").map((x)=>x.path)),
    processOnlyFiles:Object.freeze(catalog.filter((x)=>x.role==="PROCESS_ONLY").map((x)=>x.path)), fileCatalog:Object.freeze(catalog), shelves:null });
}

const ALLOWED_CONDITION_ROLES = Object.freeze(["RESTORE_SOURCE","RESTORE_CONSTRAINT","OUTPUT_CONTRACT","REFERENCE_ONLY","DENY_AS_BODY_SOURCE"]);
function validateConditionLedger(ledger, inspection, failures){
  if(ledger?.schema!==WRITABLE_CONDITION_LEDGER_SCHEMA) failures.push(fail("WRITABLE_CONDITION_LEDGER_SCHEMA_REQUIRED","writableConditionLedger.schema"));
  if(!Array.isArray(ledger?.sourceCoverage)) failures.push(fail("WRITABLE_SOURCE_COVERAGE_REQUIRED","writableConditionLedger.sourceCoverage"));
  if(!Array.isArray(ledger?.conditions) || ledger.conditions.length===0) failures.push(fail("WRITABLE_CONDITION_ENTRIES_REQUIRED","writableConditionLedger.conditions"));
  const catalog=new Map((inspection?.fileCatalog??[]).map((e)=>[e.path,e]));
  const requiredPaths=(inspection?.fileCatalog??[]).filter((e)=>e.role!=="PROCESS_ONLY").map((e)=>e.path).sort();
  const coverage=new Map();
  for(const [i,item] of (ledger?.sourceCoverage??[]).entries()){
    const p=`writableConditionLedger.sourceCoverage[${i}]`; if(typeof item?.path!=="string" || !catalog.has(item.path)){ failures.push(fail("WRITABLE_COVERAGE_SOURCE_UNKNOWN",`${p}.path`,item?.path)); continue; }
    if(item.extractionComplete!==true) failures.push(fail("WRITABLE_SOURCE_EXTRACTION_INCOMPLETE",`${p}.extractionComplete`));
    if(item.sha256!==catalog.get(item.path).sha256) failures.push(fail("WRITABLE_SOURCE_DIGEST_MISMATCH",`${p}.sha256`));
    coverage.set(item.path,item);
  }
  for(const path of requiredPaths) if(!coverage.has(path)) failures.push(fail("WRITABLE_SOURCE_COVERAGE_MISSING","writableConditionLedger.sourceCoverage",path));
  const ids=new Set(); const byRole={RESTORE_SOURCE:[],RESTORE_CONSTRAINT:[],PROCESS_ONLY:[],OUTPUT_CONTRACT:[],REFERENCE_ONLY:[],DENY_AS_BODY_SOURCE:[]};
  for(const [i,c] of (ledger?.conditions??[]).entries()){
    const p=`writableConditionLedger.conditions[${i}]`;
    if(typeof c?.id!=="string" || !/^(REQ|FORBID|LAYER|CONN|SRC|HEAT)_[A-Z0-9]+_[0-9]{3}$/.test(c.id)) failures.push(fail("WRITABLE_CONDITION_ID_INVALID",`${p}.id`,c?.id));
    else if(ids.has(c.id)) failures.push(fail("WRITABLE_CONDITION_ID_DUPLICATE",`${p}.id`,c.id)); else ids.add(c.id);
    if(!ALLOWED_CONDITION_ROLES.includes(c?.role)) failures.push(fail("WRITABLE_CONDITION_ROLE_INVALID",`${p}.role`,c?.role));
    const source=catalog.get(c?.sourcePath); if(source==null || source.role==="PROCESS_ONLY") failures.push(fail("WRITABLE_CONDITION_SOURCE_INVALID",`${p}.sourcePath`,c?.sourcePath));
    if(typeof c?.sourceLocator!=="string" || c.sourceLocator.trim()==="") failures.push(fail("WRITABLE_CONDITION_LOCATOR_REQUIRED",`${p}.sourceLocator`));
    if(typeof c?.conditionText!=="string" || c.conditionText.trim()==="") failures.push(fail("WRITABLE_CONDITION_TEXT_REQUIRED",`${p}.conditionText`));
    if(ALLOWED_CONDITION_ROLES.includes(c?.role) && source!=null && source.role!=="PROCESS_ONLY" && typeof c?.id==="string"){
      const material=Object.freeze({ material_id:`WZ_${c.id}`, condition_id:c.id, path:c.sourcePath, source_locator:c.sourceLocator, writer_use:c.role, canonical_state:"FROZEN", read_required:true, content:c.conditionText });
      byRole[c.role].push(material);
    }
  }
  for(const e of inspection?.fileCatalog??[]) if(e.role==="PROCESS_ONLY") byRole.PROCESS_ONLY.push(Object.freeze({ material_id:`WZ_PROCESS_${e.sha256.slice(0,12).toUpperCase()}`, path:e.path, writer_use:"PROCESS_ONLY", canonical_state:"FROZEN", read_required:true, content:e.content }));
  if(byRole.RESTORE_SOURCE.length===0) failures.push(fail("WRITABLE_RESTORE_SOURCE_CONDITION_MISSING","writableConditionLedger.conditions"));
  return Object.freeze(Object.fromEntries(Object.entries(byRole).map(([k,v])=>[k,Object.freeze(v)])));
}

export function evaluateWritableStoryPackPreWrite(input = {}) {
  const failures=[];
  if(input.activation?.input_mode!==WRITABLE_STORY_PACK_INPUT_MODE) failures.push(fail("WRITABLE_STORY_PACK_INPUT_MODE_REQUIRED","activation.input_mode"));
  if(input.activation?.input_kind==="CHAT" || input.chatInput===true) failures.push(fail("CHAT_INPUT_NOT_ACCEPTED_AS_RUNTIME_STORY_PACK","input"));
  if(!input.activation?.episode_id || !input.activation?.activation_id) failures.push(fail("ACTIVATION_IDENTITY_MISSING","activation"));
  if(input.activation?.degraded_mode!==false) failures.push(fail("DEGRADED_WRITE_FORBIDDEN","activation.degraded_mode"));
  if(input.activation?.custom_pack_extension!=null) failures.push(fail("CUSTOM_PACK_EXTENSION_REMOVED","activation.custom_pack_extension"));
  const validity=input.activation?.activation_validity;
  if(validity?.user_or_design_declared!==true || validity?.filename_inference_allowed!==false || validity?.folder_size_inference_allowed!==false || validity?.style_inference_allowed!==false) failures.push(fail("ACTIVATION_VALIDITY_INVALID","activation.activation_validity"));
  const hardBinding=evaluateHardBinding(input.hardBindingState); if(hardBinding.decision!=="ACTIVE_RUNTIME_READY") failures.push(...hardBinding.failures);
  const result=input.writableStoryPackResult;
  if(result?.inspectDecision!=="WRITABLE_STORY_PACK_INSPECT_OK") failures.push(fail("WRITABLE_STORY_PACK_INSPECT_NOT_OK","writableStoryPackResult.inspectDecision"));
  if(result?.writeDecision!=="WRITABLE_STORY_PACK_PREWRITE_EXTRACTION_REQUIRED") failures.push(fail("WRITABLE_STORY_PACK_PREWRITE_STATE_INVALID","writableStoryPackResult.writeDecision"));
  const shelves=validateConditionLedger(input.writableConditionLedger,result,failures);
  failures.push(...validatePreTextPickupLedger({ shelves, pickupLedger:input.preTextPickup }));
  const pickupConditionIds=collectPreTextConditionIds(input.preTextPickup);
  failures.push(...validateFullPowerPreWriteGate({ gate:input.fullPowerWriteGate, pickupConditionIds }));
  failures.push(...validateCommonPreWriteState(input.preWrite));
  return Object.freeze({ decision:failures.length===0?"WRITE_ALLOWED":"STOP_BEFORE_TEXT", state:failures.length===0?"WRITE_ALLOWED":"WRITABLE_STORY_PACK_GATE", failures:Object.freeze(failures), shelves:failures.length===0?shelves:null, pickupConditionIds:failures.length===0?Object.freeze(pickupConditionIds):Object.freeze([]), fullPowerWritePlan:failures.length===0?Object.freeze([...(input.fullPowerWriteGate?.sceneConstructionPlan??[])]):Object.freeze([]), deliveryIntent:failures.length===0?Object.freeze({ ...(input.preTextPickup?.deliveryIntent??{}) }):null });
}
