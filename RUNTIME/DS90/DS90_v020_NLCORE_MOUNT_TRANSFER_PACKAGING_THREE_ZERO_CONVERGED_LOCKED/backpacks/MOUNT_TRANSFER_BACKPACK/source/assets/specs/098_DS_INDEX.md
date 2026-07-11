# 098_DS_INDEX.md
# 設計さんカプセル v003ap / SUPPORT INDEX

区分: 起動安定点
役割: 所在確認 / 必要ファイル分岐 / 起動核と外部資料の境界管理
版: v003ap_endlog_clean_rescan
更新日: 2026-06-08

---

## 0. 位置づけ

このファイルは索引である。

このファイルは起動OSではない。

通常起動で全文読みにしない。

設計さんの唯一の起動入口は `090_DS_CORE.md` である。

`090_DS_CORE.md` 単体投入時も、設計さんはBOOT_READYとして起動する。

このファイルは、所在確認、分岐確認、必要ファイル探索が必要な場合だけ読む。

---

## 1. フォルダ構成

```txt
090_DS_CORE.md

090_BOOT_SUPPORT/
  091_DS_CHECK.md
  098_DS_INDEX.md

090_EXTERNAL_TOOLS/
  089_DS_TAG_SEARCH.md
  092_DS_CARD.md
  093_DS_CARD_TEST.md
  094_DS_LOG.md
  095_DS_MOUNT_TRANSFER.md
  096_DS_ARCHIVE.md
  END_LOG_OPERATION_RULE.md

090_EXTERNAL_TEMPLATES/
  END_LOG_TEMPLATE.txt
  INDEX_MAP_TEMPLATE.md
  LAYER_PROFILE_TEMPLATE.md
  SHELF_GUIDE_TEMPLATE.md
  RESTART_MEMO_TEMPLATE.txt
  STOP_TAG_INDEX_TEMPLATE.md
  TAG_INDEX_TEMPLATE.txt
  WORK_UNIT_CARD_TEMPLATE.md

090_EXTERNAL_SAMPLES/
  097_DS_SAMPLE.md
  NARRATION_LAYER_STANDARD_PROFILE.md
  SAMPLE_REFERENCES/

090_EXTERNAL_REPORTS/
  PACK_AUDIT_REPORT_090_DS_v003ap_ENDLOG_MEMO_CLEAN.md
```

---



## 2. 正しい起動導線

```txt
090_DS_CORE.md
-> プロジェクトマウントZIP
-> 021
-> 021が指す現在地source
-> ユーザー依頼に必要な外部ツール
```

プロジェクトマウントZIPが未提示の場合:
- STOPではなくBOOT_READYとして起動する。
- 作品固有作業へは進まない。
- 次に必要なものとして、対象小説プロジェクトのマウントZIPを要求する。

---

## 3. 読む場面

通常起動:
- `090_DS_CORE.md`
- プロジェクトマウントZIPがある場合はZIP内の `021`
- `021` が指す現在地source

STOP判定 / 検収 / 完了確認:
- `090_BOOT_SUPPORT/091_DS_CHECK.md`

所在確認 / 分岐確認:
- `090_BOOT_SUPPORT/098_DS_INDEX.md`

話カード作成:
- `090_EXTERNAL_TOOLS/092_DS_CARD.md`

話カード検査:
- `090_EXTERNAL_TOOLS/093_DS_CARD_TEST.md`

LOG確認 / 日次シミュレーション:
- `090_EXTERNAL_TOOLS/094_DS_LOG.md`

タグ検索 / TAG_INDEX作成 / 棚横断検索:
- `090_EXTERNAL_TOOLS/089_DS_TAG_SEARCH.md`

マウント移管 / 反映引継ぎ:
- `090_EXTERNAL_TOOLS/095_DS_MOUNT_TRANSFER.md`
- タグ補正が必要な場合のみ `090_EXTERNAL_TOOLS/089_DS_TAG_SEARCH.md`
- 検収時のみ `090_BOOT_SUPPORT/091_DS_CHECK.md`

旧版退避 / 削除候補確認:
- `090_EXTERNAL_TOOLS/096_DS_ARCHIVE.md`

END_LOG運用確認:
- `090_EXTERNAL_TOOLS/END_LOG_OPERATION_RULE.md`
- `090_EXTERNAL_TEMPLATES/END_LOG_TEMPLATE.txt`

テンプレート複製:
- `090_EXTERNAL_TEMPLATES/`

サンプル形式確認:
- `090_EXTERNAL_SAMPLES/`

現行監査レポート確認:
- `090_EXTERNAL_REPORTS/PACK_AUDIT_REPORT_090_DS_v003ap_ENDLOG_MEMO_CLEAN.md`

---

## 4. 禁止

通常起動で `090_BOOT_SUPPORT` を読む順へ含めない。

通常起動で `090_EXTERNAL_TOOLS` を読む順へ含めない。

通常起動でテンプレート、サンプル、改修履歴を読む順へ含めない。

`098_DS_INDEX.md` をOS扱いしない。

`091_DS_CHECK.md` を常時読む本文にしない。

`RESTART_MEMO_TEMPLATE.txt` を起動前に作成しない。

現在地共有はEND_LOGで行う。

返答末尾のEND_LOGを現在地共有面にする。

テンプレート、サンプル、改修報告を作品条件にしない。

`021` 未接続を `021未接続` と呼ばない。


---

## 5. 監査資料・過去レポート境界

`090_EXTERNAL_REPORTS/*` は現行監査資料だけを置く領域である。

現行監査資料は検算用である。

通常起動、作品条件判断、END_LOG運用、移管実行の制御源にしない。

過去レポートはランタイムZIPへ同梱しない。

外部保管された過去レポートを読む場合も、旧運用記述を現行制御として採用しない。
