# DS90 v0405 NLCORE Shelf + PKDB Origin Runtime

STATUS: `CURRENT_RUNTIME`
VERSION: `v0405`
RUNTIME_LINE: `DS90_v0405_NLCORE_SHELF_PKDB_ORIGIN_TURN_RUNTIME_LOCKED`

## Definition

```text
DS90 v0405
= v0402 shelf + PKDB locator + 000_C shrine runtime
+ common operation template V2 current-sync
+ 2026-08-18 logical-card / ZIP-story-pack semantics sync
+ story-layer execution canon unified on v28 (v21 = lineage reference)
+ CHARACTER_DESIGN / WORLD_AXIS / WORK_PROFILE / BAND_PROFILE embed semantics retained
+ 904 novel-quality lookup reference integration
+ v0309 trusted skill/runtime hardening retained
```

v0400 restored v0301 shelf operation and DS90-side INDEX/SEARCH on the v0309 hardened runtime. v0401 corrected the locator representation to the existing legal SOURCE record shape. v0402 keeps that route and hardens the control-shelf operation boundary: `000_C` is USE_ONLY in normal work, while user-fired transfer or user-approved maintenance may rebuild and replace it. v0403 changes no shelf/PKDB/000_C authority. The current artifact revision synchronizes the project-start template and 904 lookup reference to the 2026-08-18 logical-card / ZIP-story-pack model and makes v28 the explicit story-layer execution canon for the designer line (v21 remains lineage reference only): talk-card carrier shape is not globally fixed, PW90 reception is artifact-based, and SP00 projectlocked shape is the canonical high-reproducibility line rather than the minimum receiver line.

## Project knowledge authority

```text
project shelf = source / canon authority
TAG           = meaning label / lookup key
PKDB          = TAG / alias / locator backend
SEARCH        = DS90 query intent
INDEX         = DS90 location resolution
```

Normal route:

```text
user request
-> DS90 INDEX / SEARCH
-> explicit machine intent
-> K01 PKDB_ACCESS
-> schema-legal SOURCE locator record
   payload.locator = current project mount relative path
   payload.sha256  = exact shelf source SHA
-> K04 SHELF_READ
-> exact current shelf bytes + byte-length / UTF-8 verification
-> recomputed shelf SHA-256 must equal locator SOURCE `payload.sha256`
-> DS90 design / check / card / log
```

`SEARCH_TERM / ALIAS / CANONICAL_NAME / RECORD_ID / LOGICAL_ID` are supported DS90 machine lookup kinds. PKDB ACCESS must not invent query meaning from natural language.

A URI/archive SOURCE locator such as `legacy-archive://...` is not current shelf authority. K02 `SOURCE_MATERIALIZE` remains a hardened compatibility/fallback lane and requires explicit fallback permission.

## Shelf operation restore

`021_G / 022_B / 024_V / 028_H / other existing project shelves` remain normal project shelves. Do not delete, thin, or replace them because PKDB exists.

021_G may retain design bones, long-form design, part/chapter/episode design, CURRENT, HOLD, story cards, story packs, story layers, templates, samples/canonical examples, source references, and project-specific semantic chains according to project operation.

## Runtime / host boundaries retained

- dependency-graph Skill runtime
- explicit HOST actions and exact resume
- current `000_C` dispatch proof
- K01 resident execution/consumer binding, authority flags and delivery-count checks
- K02 exact snapshot binding and byte verification
- K03 proposal-only PKDB input, MT00/Nul commit authority
- K04 exact requested current-shelf byte read
- terminal authority / report separation
- session integrity / canonical replay
- target-specific specialist PASS proof
- declared negative-path STOP remains non-overrideable

## PKDB input policy

Standard v0403 locator maintenance uses the unchanged v0402 schema-legal fields:

- top-level `aliases[]`
- top-level `search_terms[]`
- `record_type = SOURCE`
- `payload.source_role`
- `payload.locator` as a safe current-mount relative path
- `payload.sha256`
- optional `payload.media_type` / `payload.selection`
- necessary minimal relation/reference only when genuinely required

World/character/plot/story full text is not rebuilt into PKDB as the standard operation. DS90 may produce `PKDB_INPUT_PROPOSAL`; only MT00/Nul may commit it. Direct editing of PKDB record files is forbidden.

## Boot / read order

1. Read `START_HERE.js`.
2. Follow `READ_ORDER` from `src/runtime/program.js`.
3. Read every `ALWAYS_READ` path from `src/boot/validator.js`.
4. Read operation-specific paths.
5. For project work, verify current `000_C` start gate / dispatch and mounted PKDB capability.
6. On every user turn after BOOT, apply `evaluateUserTurn()` / TURN_GATE before any generic response path.
7. Resolve source through DS90 INDEX/SEARCH -> K01 -> current SOURCE locator -> K04 current shelf read.
8. Resume only from the exact pending host action result.

## Release boundary

v0400 and later separate execution and release history. Runtime contains execution material; Update-History contains migration/diff/validation/rollback material and is not required on a normal execution mount.

## Validation

A release is valid only after current manifest/checker, runtime/negative tests, ZIP/CRC/path checks and mount-boundary checks actually pass. Do not claim unexecuted validation.

## Retained novel-line / packager contracts

v0403 does not remove the established novel-line and PACK_CUTOUT contracts. The active retained set includes:

- `assets/dsgn_infra/04_MODULE/packager/WORLD_AXIS_LAYER_BINDING_SCHEMA_v1.json`
- `assets/dsgn_infra/04_MODULE/packager/EPISODE_LAYER_ACTIVATION_SCHEMA_v1.json`
- `assets/dsgn_infra/04_MODULE/common/NOVEL_LINE_FINAL_CORE_LOCK_v001.md`
- `assets/dsgn_infra/04_MODULE/common/DS90_PW90_ARTIFACT_HANDOFF_JOINT_LOCK_v001.md`
- `assets/dsgn_infra/04_MODULE/common/ARTIFACT_EQUALS_FULL_CONVERGENCE_LOCK_v020.md`

These remain execution contracts, not v0401 release-history payload.


## Current common template / quality reference

- `assets/templates/COMMON_OPERATION_TEMPLATE_V2.md` is the current new-project setup template, synchronized on 2026-08-18 to the logical-card / ZIP-pack receiver model. It is not an always-read project canon and is loaded only for external-context/new-project setup.
- `assets/dsgn_infra/03_REFERENCE/quality/904_小説制作絶対指針/CURRENT_READ_FIRST.md` is the designer lookup entry for the 904 quality bundle. It supplies quality/heat/process-responsibility principles plus the current logical-card / ZIP-pack model, but does not override current runtime mechanics or project canon.
- The three historical packs inside the 904 bundle remain legacy comparison/reference material and are never auto-loaded as current story-card or PW90 authority.


## 000_C shrine-style operation

Normal state is `USE_ONLY`. The shelf is not treated as technically immutable; it is operationally touched only inside a user-gated event.

- MOUNT_TRANSFER: the user explicitly requests or approves transfer, then MT00 may rebuild `000_C` as part of the transfer.
- MAINTENANCE: DS90/runtime presents target, reason, and change scope, then explicit user approval opens a one-event maintenance window.
- `DESIGNER_AUTO` and `RUNTIME_AUTO` cannot start MOUNT_TRANSFER.
- after rebuild, dispatch targets/SHA, resident lanes, control gates, HANDOFF/AUDIT evidence, and mount shape are validated before returning to USE_ONLY.

## v0405 runtime delta

- emits `PKDB_QUERY_SCHEMA_v003`;
- intersects required PKDB clauses as AND instead of union;
- uses a 5000-record default delivery ceiling for broad candidate retrieval;
- uses `PAYLOAD_ONLY` as the normal SOURCE locator projection to keep broad high-recall search transport light; requests that can create/supersede PKDB records force `FULL_RECORD`;
- recognizes the fixed portable origin `LID-PORTABLE-5000-ORIGIN` as bootstrap/recovery principles supplied by the mounted control/PKDB layer.

- adds a per-user-turn role continuity gate: successful BOOT keeps DS90 control active until explicit user role change; declared specialist handoff owns only that task and returns control to DS90;
- treats operation-router `UNKNOWN_OPERATION` as DS90 role continuation, never as permission for ordinary ChatGPT fallback;
- distinguishes write persistence (`persistenceAuthority`) from conversational role continuity (`roleContinuity`);
- routes clear prose-writing intent to the PW90 boundary and clear revision intent to the TS90 boundary without letting DS90 write/revise by generic fallback.
