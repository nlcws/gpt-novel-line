# HISTORY_RETAINED_ACTIVE_ROUTE_REPAIR v019.16a

STATUS: REPAIR_COMPLETE
SOURCE: DS90_v019_16_NLCORE_HISTORY_MASTER_REAPPLY_FROM_13B_LOCKED
OUTPUT: DS90_v019_16a_NLCORE_HISTORY_RETAINED_ACTIVE_ROUTE_LOCKED

## 修正理由

v019.16は、13b由来の履歴棚・reference logs・source floorを保持していたが、active required readにv019.14系の`DESIGNER_RUNTIME_NO_RESIDUE_LOCK_v01914.md`を残していた。
その結果、履歴を保持する実体と、履歴同梱を禁じるロック文言が衝突していた。

## 修正

- 新active lockとして `DESIGNER_RUNTIME_ACTIVE_ROUTE_NO_RESIDUE_LOCK_v01916a.md` を追加。
- 新history policyとして `PROJECT_HISTORY_RETAINED_ACTIVE_BOUNDARY_POLICY_v01916a.md` を追加。
- ALWAYS_READ / PACK_CUTOUT / MOUNT_TRANSFER required read を新lock/policyへ接続。
- 旧v01914/v01915 lockはactive authorityから外し、所在互換スタブ化。
- 旧lock本文は `assets/operation_mount/30_REFERENCE_LOGS/v01916a_active_route_boundary_repair/` に保存。

## 固定された境界

```text
history_archive_present=true
active_route_history_read=false
history_allowed_for=MOUNT_TRANSFER|VERSION_UP|REAPPLY_AUDIT|REPLACEMENT_AUDIT|NEXT_INDIVIDUAL_HANDOFF
```

履歴を消さない。
履歴で通常実行しない。
履歴を消して思想を落とさない。
