import test from 'node:test';
import assert from 'node:assert/strict';
import { residentBindingFor, adaptPkdbAccessHostResult, adaptPkdbMaterializeHostResult } from '../src/adapters/pkdbHostAdapter.js';
import { validatePkdbAccessResult, validateMaterializeResult } from '../src/skills/pkdbRead.js';

function action(type, id) {
  const binding = residentBindingFor(type, id, type === 'SOURCE_MATERIALIZE' ? { mode:'EXACT', snapshotSha256:'a'.repeat(64) } : {mode:'CURRENT'});
  return { actionId:id, actionType:type, requirements:{lineageMode:'ACTIVE'}, residentBinding:binding };
}
function snap(sha='b'.repeat(64)) { return { snapshot_schema_version:'PKDB_SNAPSHOT_DESCRIPTOR_v002', volume_count:1, record_count:1, source_object_count:0, volumes:[], snapshot_sha256:sha }; }
function accessPacket(a, decision, clauses=[], reasons=[]) {
  return { actionId:a.actionId, actionType:'PKDB_ACCESS', packet:{
    packet_schema_version:'PKDB_DELIVERY_PACKET_v001', execution_id:a.residentBinding.executionId, consumer_id:a.residentBinding.consumerId,
    decision, snapshot:snap(), project_meaning_authored_by_skill:false, inference_permitted:false, db_mutation_performed:false,
    runtime_work_performed:false, external_service_required:false, reason_codes:reasons, clause_results:clauses
  }};
}
function blockedClause() { return { clause_id:'Q0001', required:true, state:'BLOCKED', reason_codes:['DB_NOT_FOUND'], resolution_result:{result_schema_version:'PKDB_RESOLUTION_RESULT_v001',outcome:'NOT_FOUND',reason_codes:['NOT_FOUND'],candidate_record_ids:[],resolved_record_ids:[],scope_unresolved_record_ids:[],evidence_source_refs:[],provenance_refs:[]}, delivery_count:0, delivered_records:[] }; }

test('ACCESS BLOCKED/STALE/REJECTED packets fail closed without becoming evidence', () => {
  for (const [decision,clauses,reasons] of [
    ['BLOCKED',[blockedClause()],['REQUIRED_CLAUSE_BLOCKED']],
    ['STALE_SNAPSHOT',[],['SNAPSHOT_MISMATCH']],
    ['REJECTED',[],['DATABASE_INVALID']]
  ]) {
    const a=action('PKDB_ACCESS',`PKDB_ACCESS:${decision}`);
    const adapted=adaptPkdbAccessHostResult(a,accessPacket(a,decision,clauses,reasons));
    assert.equal(adapted.issues.length,0,JSON.stringify(adapted.issues));
    assert.equal(adapted.normalized.decision,'BLOCKED');
    assert.equal(adapted.normalized.evidenceComplete,false);
    assert.deepEqual(adapted.normalized.semanticRecords,[]);
    const checked=validatePkdbAccessResult(a,accessPacket(a,decision,clauses,reasons));
    assert.equal(checked.blocked,true);
    assert.ok(checked.issues.some(x=>x.code==='PKDB_ACCESS_BLOCKED'));
  }
});

test('ACCESS malformed packet is rejected by adapter instead of normalized', () => {
  const a=action('PKDB_ACCESS','PKDB_ACCESS:MALFORMED');
  const bad=accessPacket(a,'DELIVERED',[]); bad.packet.snapshot.snapshot_sha256='BAD';
  const out=adaptPkdbAccessHostResult(a,bad);
  assert.ok(out.issues.some(x=>x.code==='PKDB_ACCESS_SNAPSHOT_INVALID'));
  assert.equal(out.normalized,null);
});

function materialPacket(a, decision, reasons=[]) {
  return { actionId:a.actionId, actionType:'SOURCE_MATERIALIZE', packet:{
    packet_schema_version:'PKDB_SOURCE_MATERIALIZE_PACKET_v001', execution_id:a.residentBinding.executionId, consumer_id:a.residentBinding.consumerId,
    decision, snapshot:snap('a'.repeat(64)), source_bytes_transformed:false, db_mutation_performed:false,
    runtime_work_performed:false, external_service_required:false, reason_codes:reasons, item_results:[]
  }, bundleObjects:{} };
}

test('MATERIALIZE BLOCKED/STALE/REJECTED packets fail closed', () => {
  for (const [decision,reasons] of [['BLOCKED',['REQUIRED_SOURCE_BLOCKED']],['STALE_SNAPSHOT',['SNAPSHOT_MISMATCH']],['REJECTED',['DATABASE_INVALID']]]) {
    const a=action('SOURCE_MATERIALIZE',`SOURCE_MATERIALIZE:${decision}`); a.sourceIds=['SRC-TEST'];
    const out=adaptPkdbMaterializeHostResult(a,materialPacket(a,decision,reasons));
    assert.equal(out.issues.length,0,JSON.stringify(out.issues));
    assert.equal(out.normalized.decision,'BLOCKED');
    const checked=validateMaterializeResult(a,materialPacket(a,decision,reasons));
    assert.ok(checked.issues.some(x=>x.code==='SOURCE_MATERIALIZE_BLOCKED'));
  }
});
