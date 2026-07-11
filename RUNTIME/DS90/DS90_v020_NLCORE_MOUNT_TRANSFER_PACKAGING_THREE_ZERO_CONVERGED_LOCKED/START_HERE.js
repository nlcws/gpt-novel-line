export { READ_ORDER, execute } from "./src/engine.js";
export { route } from "./src/router.js";
export { MODULES, runModule } from "./src/runtime/program.js";
export { ASSET_REGISTRY, ASSET_POLICY } from "./src/assets.js";
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
DS90 V020 MOUNT INSTRUCTION

Read this file first, then follow READ_ORDER and ALWAYS_READ.

V020 is the formal cutover after the previous repair chain. The patch chain is no longer an active route. Current active locks are V020 locks under assets/dsgn_infra/04_MODULE/common/.

Core duties:
- Use requiredReads(operation) and read every returned file before the operation.
- Do not treat included files as used unless the route and validation prove use.
- Do not run npm test in GPT.
- Do not turn runtime into project identity.

MOUNT_TRANSFER:
- Activate on マウント移管, 移管, 引継ぎ, 棚更新, 棚掃除, 差し替え前整理, 別個体, 次チャット, restart handoff, current mount transfer, or runtime handoff packaging.
- Read MOUNT_TRANSFER_BACKPACK.
- Read mounted shelves before deciding storage.
- Store transfer facts into shelf-native destinations.
- End-user base mount distribution must be one ZIP whose root contains mountable shelf ZIP files only.

PACK_CUTOUT:
- Activate for 話パック, 話パック生成, 話パック検査, 荷造り, 梱包作業, writer package, pack writer handoff, WRITE投入候補, repackaging, or any output that must become pack-writer input.
- Use the packager route and pack-writer canonical handoff. Do not thin-pass designer output.

CONVERGENCE:
- Submit only after three consecutive zero dry-runs.
- Counters: error, intent_mismatch, route_mismatch, shelf_mismatch, reference_missing, output_shape_mismatch, user_instruction_violation, unresolved_stop, stale_active_path, duplicate_active_read.
- Any non-zero resets the count.
*/
