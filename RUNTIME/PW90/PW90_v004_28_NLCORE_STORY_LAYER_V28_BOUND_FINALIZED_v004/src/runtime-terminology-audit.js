import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { RUNTIME_VERSION } from "./program.js";
import {
  CANONICAL_BODY_ROUTES, MODULE_ROLE_IDS, RUNTIME_GUARD_IDS, RUNTIME_LAYER_IDS,
  RUNTIME_SKILL_IDS, RUNTIME_STAGE_IDS, RUNTIME_STATE_IDS, TERMINOLOGY_CLASS_IDS
} from "./runtime-vocabulary.js";

export const RUNTIME_TERMINOLOGY_AUDIT_ID = "PW90_RUNTIME_TERMINOLOGY_AUDIT";
const TEXT_EXTENSIONS = Object.freeze(new Set([".js", ".json", ".md", ".txt"]));
const legacySkillRole = ["SKILL", "SKILL_GATE"].join("_");
const CURRENT_SHORT = "v004.28";
const STALE_VERSION_RE = /(?:PW90\s+|pw90-)?v004\.(?:\d+|21b|21c)(?:[-A-Za-z0-9_.]*)?/g;
const PROVENANCE_MARKERS = /ORIGIN_|PROVENANCE|HISTORICAL_|BEHAVIOR_BASELINE/;

export const INTENTIONAL_TERMINOLOGY_DIFFERENCES = Object.freeze([
  Object.freeze({ left: MODULE_ROLE_IDS.ROUTER_GUARD, right: RUNTIME_LAYER_IDS.L0, classification: TERMINOLOGY_CLASS_IDS.INTENTIONAL_SEMANTIC_DIFFERENCE, reason: "ROUTER_GUARD constrains route selection; CONTRACT_GUARD validates cross-runtime contracts" }),
  Object.freeze({ left: RUNTIME_STATE_IDS.STOP_BEFORE_TEXT, right: RUNTIME_STATE_IDS.FAILED_TEXT_QUARANTINE, classification: TERMINOLOGY_CLASS_IDS.INTENTIONAL_SEMANTIC_DIFFERENCE, reason: "STOP_BEFORE_TEXT precedes manuscript authorization; FAILED_TEXT_QUARANTINE contains rejected generated text" }),
  Object.freeze({ left: RUNTIME_STATE_IDS.ARTIFACT_READY, right: RUNTIME_STATE_IDS.SUCCESS, classification: TERMINOLOGY_CLASS_IDS.INTENTIONAL_SEMANTIC_DIFFERENCE, reason: "artifact readiness precedes the terminal SUCCESS decision" })
]);
export const LEGACY_TERMINOLOGY_COMPATIBILITY = Object.freeze([
  Object.freeze({ legacy: legacySkillRole, canonical: MODULE_ROLE_IDS.SKILL_GATE, classification: TERMINOLOGY_CLASS_IDS.LEGACY_COMPATIBILITY_REQUIRED, reason: "the legacy registry property remains available through a non-enumerable compatibility alias" })
]);
const VOCABULARY_GROUPS = Object.freeze({
  layerNames:Object.freeze(Object.values(RUNTIME_LAYER_IDS)), stageIds:Object.freeze(Object.values(RUNTIME_STAGE_IDS)), bodyRoutes:Object.freeze(Object.values(CANONICAL_BODY_ROUTES)), skillIds:Object.freeze(Object.values(RUNTIME_SKILL_IDS)), guardIds:Object.freeze(Object.values(RUNTIME_GUARD_IDS)), stateNames:Object.freeze(Object.values(RUNTIME_STATE_IDS)), moduleRoles:Object.freeze(Object.values(MODULE_ROLE_IDS)), successArtifactTerms:Object.freeze(["evaluateOutputGate","SUCCESS","PW90_FULLY_CONVERGED_TEXT_ARTIFACT","textArtifactReady","FAILED_TEXT_QUARANTINE"])
});
function listTextFiles(root){ const files=[]; const visit=(current)=>{ for(const entry of readdirSync(current,{withFileTypes:true})){ const absolute=join(current,entry.name); if(entry.isDirectory()) visit(absolute); else if(entry.isFile()&&TEXT_EXTENSIONS.has(extname(entry.name))) files.push(absolute); } }; visit(root); return files.sort(); }
function countTerm(text,term){ return term===""?0:text.split(term).length-1; }
function staleVersionFindings(contents){
  const findings=[];
  for(const file of contents){
    for(const [idx,line] of file.text.split(/\r?\n/).entries()){
      if(PROVENANCE_MARKERS.test(line)) continue;
      const matches=[...line.matchAll(STALE_VERSION_RE)].map((m)=>m[0]);
      for(const term of matches){ if(term.includes(CURRENT_SHORT)) continue; findings.push(Object.freeze({term,classification:TERMINOLOGY_CLASS_IDS.ACCIDENTAL_TERMINOLOGY_DRIFT,path:file.path,line:idx+1,reason:"stale runtime label outside explicit provenance"})); }
    }
  }
  return findings;
}
function brokenMarkdownRefs(absoluteRoot,contents){
  const findings=[]; const re=/\[[^\]]+\]\((\.\.?\/[^)]+\.md)\)/g;
  for(const file of contents.filter((x)=>x.path.endsWith('.md'))){
    const base=dirname(join(absoluteRoot,file.path));
    for(const match of file.text.matchAll(re)){ const target=resolve(base,match[1]); if(!existsSync(target)) findings.push(Object.freeze({term:match[1],classification:TERMINOLOGY_CLASS_IDS.ACCIDENTAL_TERMINOLOGY_DRIFT,path:file.path,reason:"broken internal markdown reference"})); }
  }
  return findings;
}
export function auditRuntimeTerminology(root=resolve(dirname(fileURLToPath(import.meta.url)),"..")){
  const absoluteRoot=resolve(root); const files=listTextFiles(absoluteRoot); const contents=files.map((path)=>Object.freeze({path:relative(absoluteRoot,path).replaceAll("\\","/"),text:readFileSync(path,"utf8")})); const usage={};
  for(const [group,terms] of Object.entries(VOCABULARY_GROUPS)){ usage[group]={}; for(const term of terms){ const locations=contents.map((file)=>Object.freeze({path:file.path,count:countTerm(file.text,term)})).filter((entry)=>entry.count>0); usage[group][term]=Object.freeze({count:locations.reduce((sum,e)=>sum+e.count,0),locations:Object.freeze(locations)}); } usage[group]=Object.freeze(usage[group]); }
  const legacy=contents.flatMap((file)=>{ const count=countTerm(file.text,legacySkillRole); return count===0?[]:[Object.freeze({term:legacySkillRole,canonical:MODULE_ROLE_IDS.SKILL_GATE,classification:TERMINOLOGY_CLASS_IDS.ACCIDENTAL_TERMINOLOGY_DRIFT,path:file.path,count})]; });
  const stale=staleVersionFindings(contents); const broken=brokenMarkdownRefs(absoluteRoot,contents); const accidental=[...legacy,...stale,...broken];
  return Object.freeze({ auditId:RUNTIME_TERMINOLOGY_AUDIT_ID, runtimeVersion:RUNTIME_VERSION, decision:accidental.length===0?"TERMINOLOGY_CONVERGED":"TERMINOLOGY_DRIFT_DETECTED", filesScanned:files.length, bytesScanned:files.reduce((sum,path)=>sum+statSync(path).size,0), vocabularyUsage:Object.freeze(usage), classifications:Object.freeze({intentionalSemanticDifference:INTENTIONAL_TERMINOLOGY_DIFFERENCES,legacyCompatibilityRequired:LEGACY_TERMINOLOGY_COMPATIBILITY,accidentalTerminologyDrift:Object.freeze(accidental)}), accidentalDriftCount:accidental.length });
}
const invokedPath=process.argv[1]==null?null:pathToFileURL(resolve(process.argv[1])).href; if(invokedPath===import.meta.url) process.stdout.write(`${JSON.stringify(auditRuntimeTerminology(),null,2)}\n`);
