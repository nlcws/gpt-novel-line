# ZIP_SELF_CONTAINED_LOCK v019.13

STATUS: CURRENT_ROUTE_REQUIRED
PURPOSE: 話パックと移管成果物を、成果物ZIP内で完結させる。

## 共通原則

正規成果物は現ZIP内で完結する。
追加ZIP再読込前提を書かない。
追加ZIPの有無をSTOP理由にしない。
止めるのは、内部住所が壊れている時だけ。

## 話パック完結ロック

必須:

- `source_file_current` は現ZIP内実在必須。
- `source_lines_current` は対象ファイルの行数範囲内必須。
- `05_frozen.md` の参照pathは現ZIP内実在必須。
- `07_sources.md` の参照pathは現ZIP内実在必須。
- crosscheck系の参照pathは現ZIP内実在必須。
- root文書は追加ZIP再読込を要求しない。
- `storyPackSelfContained` は true。

STOP:

- `INTERNAL_PACK_REFERENCE_MISSING`
- `SOURCE_FILE_CURRENT_NOT_FOUND`
- `SOURCE_LINES_CURRENT_OUT_OF_RANGE`
- `PACK_MANIFEST_MISMATCH`
- `ROOT_GATE_POLICY_CONFLICT`
- `EXTERNAL_RELOAD_TEXT_DENIED`

## 禁止語

正規成果物のactive導線、root文書、JSONゲート、writer boot、stop rulesには以下を書かない。

- 追加ZIP名指定
- 追加ZIP再読込
- 追加ZIP依存必須

監査メモで過去事故として触れる場合は `NOT_CURRENT_ROUTE` を明示する。
