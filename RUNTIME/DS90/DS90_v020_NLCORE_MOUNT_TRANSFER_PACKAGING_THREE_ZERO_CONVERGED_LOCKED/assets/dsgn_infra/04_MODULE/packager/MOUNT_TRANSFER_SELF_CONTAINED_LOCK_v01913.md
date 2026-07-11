# MOUNT_TRANSFER_SELF_CONTAINED_LOCK v019.13

STATUS: CURRENT_ROUTE_REQUIRED
PURPOSE: 移管後ZIPを、次個体がそのZIPだけで起動前検査できる状態へ固定する。

## 必須

- required read path は現ZIP内実在必須。
- load_order path は現ZIP内実在必須。
- README正本一覧は現ZIP内実在必須。
- active spec が指すpathは現ZIP内実在必須。
- 移管工程証明がある。
- 移管工程検査PASSがある。
- manifestが現ZIP内実ファイルと一致する。
- 追加ZIP再読込要求文言を書かない。

STOP:

- `MOUNT_REQUIRED_READ_MISSING`
- `MOUNT_LOAD_ORDER_PATH_MISSING`
- `MOUNT_ACTIVE_SPEC_PATH_MISSING`
- `MOUNT_INTERNAL_REFERENCE_MISSING`
- `MOUNT_MANIFEST_MISMATCH`
- `MOUNT_TRANSFER_POLICY_CONFLICT`
- `EXTERNAL_RELOAD_TEXT_DENIED`
