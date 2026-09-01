# DESIGNER_RUNTIME_ACTIVE_ROUTE_NO_RESIDUE_LOCK v019.16a

STATUS: CURRENT_SPEC
APPLIES_TO_RUNTIME: v019.16a-NLCORE-HISTORY-RETAINED-ACTIVE-ROUTE-LOCKED
SUPERSEDES_ACTIVE: DESIGNER_RUNTIME_NO_RESIDUE_LOCK_v01914.md

このロックは、履歴棚を削除するためのロックではない。
履歴・reference logs・source floor・修理経緯は、思想と判断境界を失わないためにZIP内へ保持してよい。
ただし、それらを通常設計、CARD、CARD_TEST、PACK_CUTOUT、本文条件化、話材補完の active input に混ぜてはならない。

## 固定

- ZIP内の履歴棚保持は許可する。
- active route は現在仕様だけで走る。
- 履歴棚は、MOUNT_TRANSFER、版上げ、差し替え監査、再施工判断、別個体引継ぎでのみ参照する。
- 履歴棚は、作品正本、本文条件源、話材、設定補完、読了代替にしない。
- NOM / MPN / comparison は CODEX fixture とし、GPT active-route acceptance へ混ぜない。
- 比較治具や旧導線は、存在していても current required read に昇格しない。
- 履歴を読む場合でも、旧実装をそのまま復活させず、旧実装が守っていた思想・禁止線・責任境界を現行構造で再施工する。

## 許可される同梱

```text
assets/operation_mount/30_REFERENCE_LOGS/
assets/operation_mount/00_GATE/070_CHANGELOG_*
assets/operation_mount/00_GATE/999_FILELIST_*
backpacks/MOUNT_TRANSFER_BACKPACK/source/
assets/operation_mount/30_REFERENCE_LOGS/v01916a_active_route_boundary_repair/
```

これらは履歴・監査・再施工参照であり、通常active story sourceではない。

## 禁止

```text
履歴棚を通常設計の条件源として読む
履歴棚をPACK_CUTOUTの現行話パック材料として読む
履歴棚を本文材料・話材・設定補完に使う
旧STOP一覧を現行STOPとして復活させる
旧pathをcurrent pathとして復活させる
比較治具を本体required readへ混入する
NOM / MPN / comparisonをGPT active acceptanceへ混入する
履歴削除を軽量化・残骸ゼロの名目で行い、思想・禁止線・責任境界まで落とす
```

## STOP

```text
ACTIVE_ROUTE_HISTORY_LEAK
ACTIVE_ROUTE_OLD_ROUTE_RESURRECTION
ACTIVE_ROUTE_CODEX_FIXTURE_LEAK
HISTORY_SHELF_DELETION_CAUSES_THOUGHT_LOSS
HISTORY_USED_AS_STORY_SOURCE
```

## 判定式

```text
history_archive_present=true
active_route_history_read=false
history_allowed_for=MOUNT_TRANSFER|VERSION_UP|REAPPLY_AUDIT|REPLACEMENT_AUDIT|NEXT_INDIVIDUAL_HANDOFF
```

履歴が存在することはSTOPではない。
履歴がactive routeへ漏れること、または履歴削除で思想を捨てることがSTOPである。
