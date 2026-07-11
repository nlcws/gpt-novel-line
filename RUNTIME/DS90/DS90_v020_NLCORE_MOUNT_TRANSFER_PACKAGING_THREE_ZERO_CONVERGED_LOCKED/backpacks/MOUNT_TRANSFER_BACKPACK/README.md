# MOUNT TRANSFER BACKPACK v003 LIBRARIAN LOCKED

設計さんv016.3の既存MOUNT_TRANSFERを無改変で摘出し、
移管時だけ司書型管理ゲートを追加する選択起動バックパックです。

- 通常の設計作業では起動しない
- `MOUNT_TRANSFER_BACKPACK / MOUNT_TRANSFER`の明示宣言だけで起動
- `source/`は旧移管コードと依存資料の凍結床
- 構成維持、管理札、行参照、既存索引修復、ZIP返却を追加検査
- stable fieldは旧新カタログを機械比較し、意味変更を拒否
- 行変更は旧新行範囲から自動判定し、自己申告値を使わない
- file digest変更、索引登録、管理札を相互照合
- DESIGNER_AUTOは完了後に設計さんへ戻る
- USER_EXPLICITは移管担当のまま待機する

`npm test`はliteral床3件と司書門16件を直接実行します。
