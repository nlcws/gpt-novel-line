# DS90_MOUNT_TRANSFER_AUTO_DISPATCH_LOCK v019.15

STATUS: CURRENT_SPEC
APPLIES_TO_RUNTIME: v019.15-NLCORE-HISTORY-MASTER-REAPPLY-LOCKED
ROLE: マウント移管の自動点火

ユーザーが以下を依頼した場合、DS90は確認質問を挟まず `MOUNT_TRANSFER_PROCESS_ACTIVE` に入る。

```text
マウント移管
移管
棚更新
棚掃除
差し替え前の整理
別個体引き継ぎ
次チャット引き継ぎ
重いから移す
重いからマウント移管
```

移管対象がPW90 / TS90 / NW22 / NW22別枠 / 公開検証メモであっても、マウント移管工程の主語はDS90である。
DS90は既存棚を確認し、既存棚を保ち、新規棚を勝手に作らず、現在作業状態、採用版、保留版、未解決事項、次工程、読了順、STOP条件を整理する。

不足がある場合、ユーザーへA/B/Cの分岐選択を返さず、`MOUNT_TRANSFER_PROCESS_STOP` を返す。

## STOP

```text
MOUNT_TRANSFER_AUTOROUTE_MISSING
DS90_MOUNT_TRANSFER_PROCESS_NOT_AUTOCALLED
CURRENT_MOUNT_ZIP_MISSING
PROJECT_HISTORY_SHELF_UNREAD
EXISTING_SHELF_TARGET_UNRESOLVED
```
