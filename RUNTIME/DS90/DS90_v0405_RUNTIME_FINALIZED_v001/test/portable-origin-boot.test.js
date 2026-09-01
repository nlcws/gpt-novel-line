import test from 'node:test';
import assert from 'node:assert/strict';
import { validateKnowledgeBootstrap } from '../src/knowledgeBootstrap.js';
function ctx() { return { externalContext:{present:true}, knowledgeContext:{
  startGate:{path:'000_C/00_READ_FIRST/DS90_START_GATE.json',exists:true,read:true,version:'DS90_START_GATE_v001'},
  dispatch:{path:'000_C/00_READ_FIRST/RUNTIME_DIRECT_DISPATCH.json',exists:true,read:true,verified:true,dependencies:{PKDB_ACCESS_SKILL:{resolved:true,sha256Verified:true},PKDB_SOURCE_MATERIALIZE_SKILL:{resolved:true,sha256Verified:true}}},
  pkdb:{mounted:true,validated:true},
  portableOrigin:{logicalId:'LID-PORTABLE-5000-ORIGIN',lookupDelivered:true,materialized:true,read:true,sha256Verified:true}
}}; }
test('portable origin 5000 is machine-required for external project bootstrap',()=>{const x=ctx();assert.deepEqual(validateKnowledgeBootstrap(x).issues,[]);delete x.knowledgeContext.portableOrigin;const out=validateKnowledgeBootstrap(x);assert.ok(out.issues.some(i=>i.code==='DS90_PORTABLE_ORIGIN_5000_UNREAD'));});
test('origin lookup without actual read/SHA verification is not enough',()=>{const x=ctx();x.knowledgeContext.portableOrigin.read=false;x.knowledgeContext.portableOrigin.sha256Verified=false;const out=validateKnowledgeBootstrap(x);assert.ok(out.issues.some(i=>i.code==='DS90_PORTABLE_ORIGIN_5000_UNREAD'));});
