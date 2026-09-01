# MOUNT TRANSFER BACKPACK v004 USER-EXPLICIT + LIBRARIAN LOCKED

既存MOUNT_TRANSFER挙動へ司書型管理ゲートを追加する選択起動バックパックです。

- 通常の設計作業では起動しない
- `MOUNT_TRANSFER_BACKPACK / MOUNT_TRANSFER / USER_EXPLICIT` の組だけで起動
- DS90は移管必要性を提示できるが、自動発火しない
- ユーザーが直接移管を要求するか、提示された移管へ明示承認した後だけ起動
- `DESIGNER_AUTO` / `RUNTIME_AUTO` はSTOP
- `source/`は旧移管コードと依存資料の凍結床
- 構成維持、管理札、行参照、既存索引修復、ZIP返却を追加検査
- stable fieldは旧新カタログを機械比較し、意味変更を拒否
- 行変更は旧新行範囲から自動判定し、自己申告値を使わない
- file digest変更、索引登録、管理札を相互照合
- USER_EXPLICIT起動後は移管担当のまま待機する

`000_C` は通常USE_ONLY。ユーザー発火の移管中は、移管成立に必要な範囲で再構築・resident更新・HANDOFF/AUDIT更新が可能です。
