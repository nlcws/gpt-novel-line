# TS90_SKILL_RUNTIME_EVIDENCE_BINDING_LOCK_v005

## Purpose

TS90 v001.25 keeps the v001.20 editing and title-decision rules plus the v001.24 public-entry hardening, while adding a strict JSON round-trip/canonical data boundary without changing editing behavior.

The runtime must preserve this order when the user asks for a revision through final title delivery:

```text
RECEIVE
→ Phase A diagnosis
→ Phase B revision / adaptive finalization
→ Phase C title decision
→ deterministic TXTDL build
→ final terminal audit
→ SUCCESS
```

A later stage may not be accepted without machine evidence from every required earlier stage.

## Host boundaries

Body diagnosis, revision, title choice, and final terminal judgment are host-model work.

The runtime emits one explicit pending host action at a time and resumes only from the matching action ID and type.

Host work may not mutate the runtime route or skip a required stage.

## Evidence binding

- Phase B on the continuous A-to-C route requires validated Phase A output from the same session.
- Phase C receives the exact final revised body accepted by Phase B and the fixed-condition authority established at receive/edit-contract time.
- Phase C may not replace the fixed-condition authority with a self-authored alternate value.
- The selected title must be one of the validated candidates and must be inserted by the runtime into the final body title block.
- The runtime builds `TS90_FINAL_BODY.txt` and `TS90_WORK_REPORT.txt` from validated session evidence; host text cannot substitute an unrelated work report.
- Final SUCCESS requires a terminal audit bound to the final body SHA-256 and the TXTDL artifact SHA-256.
- A low-level validator PASS is not terminal runtime SUCCESS authority.

## STOP

A STOP packet contains only `TS90_STOP_REPORT.txt`.

The STOP report must name:

- stopped stage
- reason
- impact
- required repair or missing material
- responsibility boundary
- preserved heat / core to keep
- whether any partial revised body is safe to use

## Session trust boundary

Serialized sessions are for host-internal continuation. The runtime re-derives route and required-stage state from the original request and validated evidence on resume.

This is not a cryptographic hostile-host boundary and must not be advertised as one.


## v001.22 serialized terminal authority hardening

A serialized session is not accepted as SUCCESS merely because terminal evidence fields exist.
Validation MUST reconstruct and re-run the final terminal contract from the original request and stored evidence.

Required on every session validation:
- `packageVersion` equals the current package identity;
- `sessionId` equals the deterministic ID derived from the current request hash;
- SUCCESS requires Phase A/B/C evidence, rebuilt artifact evidence, and terminal evidence;
- terminal evidence binds the exact `FINAL_TERMINAL_AUDIT` action ID/type;
- terminal gate SHA and terminal packet SHA are recomputed and must match;
- the complete terminal TXTDL packet is revalidated through the existing terminal/output validators;
- SUCCESS requires `terminalDecision=SUCCESS`, `pendingAction=null`, and top-level artifact equality with rebuilt artifact evidence.

This remains a HOST_INTERNAL_NON_CRYPTOGRAPHIC session boundary. It detects inconsistent or forged serialized state under the declared trusted-host model; it is not a cryptographic authenticity claim against a malicious host.


## v001.23 fail-closed serialized-session validation

The validator must reject inconsistent serialized state without throwing process-level exceptions.

Required:
- terminal evidence or terminal SUCCESS decision implies `state=SUCCESS`; state downgrade with terminal evidence is invalid;
- validation exceptions are converted to `SESSION_INVALID`, never propagated from `validateTS90RuntimeSession()` or `resumeTS90RuntimeSession()`;
- canonical stable serialization rejects circular references explicitly;
- artifact reconstruction is attempted only when required Phase B/Phase C dependencies exist; missing dependencies are reported as validation failures rather than dereferenced;
- this remains `HOST_INTERNAL_NON_CRYPTOGRAPHIC`; the change is structural consistency and fail-closed behavior, not hostile-host authenticity.


## v001.24 public runtime-entry and state invariants

The runtime must fail closed across every public entry point, not only serialized-session validation.

Required:
- WAIT is re-derived from the original request before any WAIT state is accepted; a RUN request cannot be re-labeled as WAIT and remain valid;
- on the continuous A-to-C route, validated Phase C evidence requires the deterministic artifact evidence generated from Phase B/Phase C;
- every stored pending action binds the current action schema, runtime version, and session ID in addition to action ID/type/payload;
- `createTS90RuntimeSession()` converts circular/non-serializable input failures into a STOP result rather than propagating an exception;
- `resumeTS90RuntimeSession()` converts exceptions from Phase A, Phase B, Phase C, and terminal host-result processing into STOP results rather than propagating them;
- public-entry fail-closed behavior is structural robustness under the existing `HOST_INTERNAL_NON_CRYPTOGRAPHIC` boundary and is not a hostile-host authenticity claim.


## v001.25 JSON round-trip and canonical data boundary

A session may be declared `SESSION_VALID` only when its runtime-visible data is safe for ordinary JSON serialization and preserves runtime validity after `JSON.stringify()` / `JSON.parse()` round-trip.

Required:
- runtime-engine and receive-gate use one shared canonical JSON-data serializer;
- request, host-result, evidence, pending action, artifact, terminal gate, and serialized session hashes are computed only from the accepted JSON data model;
- callable `toJSON`, Date, URL, boxed primitives, Map, Set, RegExp, BigInt, non-finite numbers, negative zero, enumerable undefined/function/symbol values, sparse arrays, proxies, accessors on JSON-visible properties, and non-plain objects are rejected before they can gain hash/session authority;
- low-level evaluator entry points return their normal STOP/INVALID result shape for JSON-boundary failures instead of propagating serialization exceptions;
- hidden non-enumerable test/host metadata is outside the serialized contract and is ignored, matching ordinary JSON visibility; it carries no runtime authority;
- explicit budgets are enforced before authority-bearing canonicalization: maximum depth 512, maximum nodes 200000, maximum canonical UTF-8 bytes 16777216;
- every valid WAIT, STOP, intermediate Phase A/B/C runtime state, and terminal SUCCESS state must serialize without throwing and must remain `SESSION_VALID` after JSON round-trip;
- malformed stored evidence is dependency-checked before rebuild/revalidation so absence of prerequisite evidence produces validation failures rather than serializer/dereference exceptions.

This is a serialization-integrity and resource-boundary contract. It does not change editing, diagnosis, title-decision, TXTDL, or heat-delivery behavior.
