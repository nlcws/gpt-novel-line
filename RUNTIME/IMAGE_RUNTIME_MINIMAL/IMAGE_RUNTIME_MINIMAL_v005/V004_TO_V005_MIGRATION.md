# V004_TO_V005_MIGRATION

## Scope
構図・物理・鏡・生成前WAITの挙動変更なし。
包装整合のみ修正。

## Fixed
1. `MOUNT_INTERFACE.md`
   - stale `v002` header → `v005`
   - `IMAGE_RUNTIME_MOUNT_TEMPLATE_v002.zip` → `v005`

2. Manifest boundary
   - `MANIFEST.json` 自己除外を正式仕様化
   - `manifest_self_excluded: true`
   - `manifest_scope`
   - `listed_file_count`
   - `package_entry_count`

## Preserved
- WORLD-FIRST / ACTION-CROP
- 人数上限なし
- OBJECT_INTEGRITY_LOCK
- CROP_NOT_BREAK
- REFLECTION_GEOMETRY_LOCK
- NO_DIRECT_GENERATION
- PRE_GENERATION_REVIEW_GATE
- WAIT_FOR_USER_APPROVAL
