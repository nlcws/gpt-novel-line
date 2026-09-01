# PW90 Runtime Architecture

STATUS = current
ROLE = runtime structure and skill routing map
BEHAVIOR_AUTHORITY = existing PW90 writing gates

## Core rule

The architecture layer organizes the runtime. It does not add manuscript obligations.

- L3 UPPER_ROUTER: operation and body-route selection.
- L2 ROUTER: existing write-mode and second-draft branch resolution.
- L1 SKILL: existing PW90 gates grouped as reusable runtime skills.
- L0 CONTRACT_GUARD: source, operation, layer, output, convergence, and handoff guards.

The PACK_ONLY FULLBURN route keeps the established baseline write behavior. It does not require a synthetic Draft-A/Draft-B cycle and does not require a minimum number of revisions.

The PACK_PLUS_BODY_TEXT route keeps the existing SECOND_DRAFT_BRANCH contract.

The architecture registry, execution plan, and terminology audit are observational. They cannot create SUCCESS, rewrite a body route, add a manuscript condition, or weaken an existing gate.

## Layer default

Writer-facing layer policy follows the shared contract:

- unspecified -> ON
- explicit ON -> ON
- OFF -> only when explicitly declared

Missing layer declaration alone is not a WRITE blocker. An ungrounded OFF declaration is a blocker.

The active story-layer execution canon is `source/knowledge/layer_runtime_v28_ai_native_complete_candidate.md`. PW90 also reads `source/knowledge/PW90_PROSE_DENSITY_GROUNDING_LOCK_v001.md` as an ACTIVE prose-interpretation guard; it does not change card values or the v28 canon and only denies prose-thinning misreadings. It is read after the v002 novel-first philosophy and before the PW90 v28 writer adapter. v21 and the old multi-operation narration document remain lineage/reference only; they are not active merged definitions. Work / world / character / band / episode values remain external profile/application data, and PW90 must not redesign stable embeds during prose generation.

## Canonical route spine

START_HERE -> BOOT -> WRITE_ROUTE_RESOLUTION -> PREWRITE -> BODY_ROUTE -> POSTTEXT -> ARTIFACT -> USER_DELIVERY

BOOT is the only active maintenance route. INSPECT / REPAIR are unsupported in this runtime and STOP at operation lock.

## Current execution ownership

The L1 Skill layer is executable through `runtime-engine.js`. The engine does not create prose. It executes deterministic gates, pauses at host-owned body/delivery work, then resumes from explicit evidence.

- S00: deterministic mount/read boot gate. It is the first Skill for BOOT and every WRITE route.
- S01: deterministic new-episode boot gate.
- S02: deterministic pack shape inspection / acceptance. Generic WRITABLE_ZIP is not WRITE_READY here; condition extraction remains pending.
- S03: deterministic condition-level extraction validation, non-body separation, hard binding, pickup/freeze and prewrite contract gate.
- S04: host body generation boundary for PACK_ONLY FULLBURN.
- S05: host second-draft generation boundary for PACK_PLUS_BODY_TEXT.
- S06: legacy compatibility stub only. Explicit lightweight requests are rejected at route entry and do not enter the active Skill chain.
- S07: deterministic posttext guard sweep.
- S08: sole SUCCESS authority via `evaluateOutputGate`.
- S09: artifact packaging after S08 SUCCESS only.
- S10: next-opening bridge host boundary + deterministic bridge gate.
- S11: delivery of the already accepted artifact; cannot create SUCCESS.

A runtime session is serializable JSON. It can be paused at host action boundaries and resumed without silently changing the route, skill chain, runtime version, or success authority.

Session integrity is structural, not cryptographic: every advance/resume rebuilds the execution plan from session input, validates the canonical chain/cursor/result prefix, and terminal WRITE SUCCESS requires S08 SUCCESS + S09 ARTIFACT_READY + S11 DELIVERY_READY.
