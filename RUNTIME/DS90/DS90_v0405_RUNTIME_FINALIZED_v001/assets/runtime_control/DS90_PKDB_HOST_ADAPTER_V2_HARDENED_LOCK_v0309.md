# DS90 PKDB Host Adapter v2 Hardened Runtime Lock v0309

STATUS: ACTIVE_ALWAYS_READ
VERSION: v0309
PURPOSE: Bind DS90 K01/K02 to exact resident PKDB request/response identity, snapshot, and packet invariants without changing design semantics.

## Adapter authority

`DS90_PKDB_HOST_ADAPTER_v002 = BIDIRECTIONAL_RESIDENT_REQUEST_RESPONSE_ADAPTER`

It owns the mechanical PKDB boundary only:

1. bind resident `execution_id` and `consumer_id` to the pending DS90 action;
2. expose resident ACCESS request identity/snapshot contract without inventing query meaning;
3. bind K02 to the exact K01 `snapshot_sha256`;
4. construct the exact resident MATERIALIZE request from K02;
5. validate resident ACCESS/MATERIALIZE packet invariants before normalization;
6. normalize only validated resident facts into DS90 evidence.

DS90 does not invent PKDB query meaning. Query clauses require an explicit query plan.

## K01 -> K02 snapshot lock

K02 MUST carry:

`snapshotBinding = { mode: EXACT, snapshotSha256: <K01 snapshot_sha256> }`

and its resident request MUST carry the same SHA as `snapshot_binding.snapshot_sha256`. Any different MATERIALIZE packet snapshot is STOP.

## Resident ACCESS invariants

- packet schema is `PKDB_DELIVERY_PACKET_v001`;
- packet `execution_id / consumer_id` equal the pending DS90 action binding;
- `project_meaning_authored_by_skill / inference_permitted / db_mutation_performed / runtime_work_performed / external_service_required` are all false;
- `delivery_count === delivered_records.length`;
- a DELIVERED clause has `RESOLVED` or `RESOLVED_SET`;
- every resolved record used as evidence is represented by a delivered record;
- packet DELIVERED implies every required clause DELIVERED.

## Resident MATERIALIZE invariants

- packet schema is `PKDB_SOURCE_MATERIALIZE_PACKET_v001`;
- packet identity equals the pending K02 resident binding;
- packet snapshot equals the exact K01/K02 snapshot binding;
- `source_bytes_transformed / db_mutation_performed / runtime_work_performed / external_service_required` are all false;
- packet DELIVERED implies every required item DELIVERED;
- bundle bytes remain subject to canonical base64, byte count, SHA, media_type-derived UTF-8 validation.

## Existing boundaries retained

The six v0307/v0308 closure points remain active: K03 evidence/provenance binding, trusted media_type, current-000_C R00 proof, target-specific specialist result proof, SOURCE-record promotion, and non-cryptographic host-internal session boundary.

## STOP

STOP on snapshot mismatch, resident identity mismatch, authority-flag violation, delivery-count mismatch, resolved-but-undelivered evidence, required delivery inconsistency, transformed source bytes, or any direct DB mutation attempt by DS90.
