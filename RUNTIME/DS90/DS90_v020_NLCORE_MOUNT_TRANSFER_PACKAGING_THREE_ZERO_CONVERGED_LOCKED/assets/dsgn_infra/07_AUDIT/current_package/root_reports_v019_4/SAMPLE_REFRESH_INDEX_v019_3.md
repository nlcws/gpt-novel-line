# SAMPLE_REFRESH_INDEX_v019_3

STATUS: CURRENT_SAMPLE_INDEX
RUNTIME: DS90_SOURCE_RUNTIME_v019_3a_DESIGNER_GATES_SAMPLE_REFRESH_LOCKED
SOURCE_UPLOADS:
- 1. 単話readyカード・空欄テンプレ(6).txt
- 2. 単話readyカード・記入見本(6).txt
- 3. 作品プロファイル・テンプレ(6).txt
- 4. 帯プロファイル・テンプレ(6).txt
- 5. 接続カード・テンプレ(6).txt
- 6. 執筆へ渡す最小カード(6).txt
- 7. 項目管理用テーブル(6).txt
- 8. ZIP内ファイル構成の見本(6).txt
- cat_card_template_sample_v2(10).zip

## 1. 判定

旧8点セットTXTは、現行の active template にはしない。
`cat_card_template_sample_v2/02_v2_templates/` と `03_cat_ready_samples/` を現行サンプルとして採用する。

## 2. 現行で使うサンプル

- `WRITER_READY_CARD_TEMPLATE_V2.md`
- `WORK_PROFILE_TEMPLATE_V2.md`
- `BAND_PROFILE_TEMPLATE_V2.md`
- `CONNECTION_CARD_TEMPLATE_V2.md`
- `WRITING_FREEZE_CARD_TEMPLATE_V2.md`
- `ITEM_MANAGEMENT_TABLE_V2.md`
- `ZIP_STRUCTURE_V2.md`
- `REVERSE_EXTRACTION_CHECKLIST_V2.md`
- `READY_SAMPLE_NEKO_001_KAZENOTOORUHI.md`
- `READY_SAMPLE_NEKO_002_PURINHAHITOTSU.md`
- `READY_SAMPLE_NEKO_003_YUUGATAYONIKURUKO.md`

## 3. 旧名の扱い

`執筆へ渡す最小カード` は旧名。
現行では `執筆凍結カード` として扱う。
削るためのカードではなく、執筆直前に条件を閉じるカードである。

## 4. ready運用固定

- ready は要約資料として値引きしない。
- 8場面は最低骨。
- 痩せる場合は場面圧縮ではなく、具体物・手元・位置・通れる幅・客の一拍で太らせる。
- 当該readyを全文実読しないまま本文へ入らない。

## 5. 互換パス

- `V2_SAMPLE_NEKO_01.txt` は最新 ready 001 に丸ごと差し替えた互換パス。
- `V2_SAMPLE_NEKO_49.txt` は最新版対応ファイルが今回アップロード内に存在しないため、retired compatibility route とした。最新版と偽装しない。

## 6. レイヤー

`STORY_LAYER_COMMON_DEFINITION_SAMPLE.md` はアップロードサンプル由来の参考資料。
既存の `NARRATION_LAYER_MULTI_REFERENCE.md` や `assets/dsgn_infra/02_CANON/layer/layer_runtime_v28_ai_native_complete_candidate.md` は置換しない。


## 7. v019.3a lock

迷いなく現行話パックを切るための微修正。

- `V2_SAMPLE_NEKO_49.txt` 内の `SAMPLE_REFRESH_INDEX` 参照pathを実在pathへ修正。
- 旧名 `執筆へ渡す最小形` が現行使用名に見える箇所を、`執筆凍結カードへ渡す最小抽出` へ統一。
- 旧49話比較は引き続き `assets/comparison/` の参考資料であり、現行テンプレではない。


---

## v019.4 forward pointer

現行のサンプル使用導線は `assets/samples/SAMPLE_REFRESH_INDEX_v019_4.md` を正とする。
