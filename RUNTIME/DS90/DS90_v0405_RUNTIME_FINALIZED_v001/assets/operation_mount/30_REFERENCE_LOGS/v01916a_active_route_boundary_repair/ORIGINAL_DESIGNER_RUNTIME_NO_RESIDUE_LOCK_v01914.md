# DESIGNER_RUNTIME_NO_RESIDUE_LOCK v019.14a

STATUS: CURRENT_SPEC
APPLIES_TO_RUNTIME: v019.15-NLCORE-HISTORY-MASTER-REAPPLY-LOCKED

設計さん正規ランタイムZIPは、現行作業だけを読む実行物である。
履歴、旧思想、旧path、旧STOP、修理経緯、比較治具の所有権問題を同梱して判断させない。

## 必須

- 正規導線は現在仕様だけを書く。
- active required read は現在作業に必要なファイルだけへ絞る。
- 履歴系・修理経緯・旧版実体・旧差分説明を同梱しない。
- CODEX側検査治具は本体合否に混ぜない。
- NOM、サンプル、ひな形は使う場合も作品正本・本文条件源・読了代替にしない。

## 禁止

```text
履歴系ファイルの同梱
修理経緯の同梱
過去版実体の同梱
旧path保管
旧STOP一覧
廃止済み思想説明
補修痕跡
比較治具の本体required read混入
```

## STOP

```text
DESIGNER_RUNTIME_HISTORY_RESIDUE
DESIGNER_RUNTIME_OLD_ROUTE_RESIDUE
DESIGNER_RUNTIME_CODEX_FIXTURE_LEAK
```
