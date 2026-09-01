export { evaluateUserTurn, TURN_ROLE_POLICY } from "./src/runtime/turn-gate.js";
export { execute, createRuntimeSession, resumeRuntimeSession, advanceRuntimeSession } from "./src/engine.js";
export { route } from "./src/router.js";
export { READ_ORDER, MODULES, runModule } from "./src/runtime/program.js";
export { ASSET_REGISTRY, ASSET_POLICY } from "./src/assets.js";
export { DS90_START_GATE, validateKnowledgeBootstrap } from "./src/knowledgeBootstrap.js";
export {
  OPERATION_READS,
  OPTIONAL_REFERENCE_ROUTES,
  requiredReads,
  validateOperationReads
} from "./src/loading/manifest.js";
export { narrationBaseProfile, narrationBaseDeny } from "./src/profiles/narrationBase.js";
export {
  singleEpisodeProfileGate,
  validateRowAlignment
} from "./src/profiles/singleEpisodeProfileGate.js";

/*
DS90 v0405 SHELF + PKDB ORIGIN + TURN-GATE RUNTIME INSTRUCTION

Read this file first, then follow READ_ORDER and ALWAYS_READ.

Current law:
- v0301 shelf operation is restored as the project-operation baseline.
- v0309 host-adapter/integrity hardening remains active as execution infrastructure.
- 021_G / 022_B / 024_V / 028_H and other existing project shelves remain normal shelves.
- PKDB is the TAG / alias / shelf-pointer lookup backend, not project canon replacement.
- DS90 keeps INDEX / SEARCH and must build explicit machine lookup intent before K01 PKDB_ACCESS.
- A normal project route is K01 PKDB_ACCESS -> current shelf_pointer -> K04 SHELF_READ -> DS90 design.
- K04 accepts only exact requested current-mount relative paths and verifies base64, SHA-256, byte length, transform=false, and UTF-8 for trusted text media types.
- K02 SOURCE_MATERIALIZE remains explicit fallback only. Do not silently fall back when current shelf pointer resolution fails.
- K03 PKDB input remains proposal-only; MT00 / Nul owns commit.
- R00 current-000_C proof must precede specialist invocation; dispatch metadata is not completion.
- RUNNER / TERMINAL_AUTHORITY / REPORT_POLICY remain separate.
- Do not claim file reads, npm/Python tests, CRC, manifest, or SHA results without execution evidence.
- Runtime and Update History are separate release artifacts from v0400 onward.
- A successful DS90 boot establishes the active DS90 role until the user explicitly changes role or a declared specialist handoff owns the task.
- Every user turn is evaluated by TURN_GATE before generic response behavior; UNKNOWN_OPERATION never authorizes falling back to ordinary ChatGPT behavior.
- persistenceAuthority describes write/persistence authority only; it does not describe conversational role continuity.

Specialist defaults:
- MOUNT_TRANSFER / chat crossing -> current 000_C / MT00.
- STORY_PACK_CUTOUT -> current 000_C / SP00.
- STORY_PACK_RECEIVER_CHECK -> current 000_C / PW90_STORY_PACK_RECEIVER_CHECKER.
- MOUNT_ZIP_BOOTSTRAP -> current 000_C / MT00_BOOTSTRAP_EA.
- WRITING -> PW90 / 執筆さん.
- REVISION -> TS90 / 修正刃さま.

DS90 minimum internal MOUNT_TRANSFER/PACK_CUTOUT is exception-only and must not be reported as specialist-complete.
*/
