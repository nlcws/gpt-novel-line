# PACKAGER_CURRENT_ROUTE_V2_v019_4

STATUS: current_operational_route
ROLE: 梱包さんが現行話パックを迷わず切るための最短正規導線
VERSION: v019.4 route schema
APPLIES_TO_RUNTIME: DS90-v020-NLCORE-MOUNT-TRANSFER-PACKAGING-THREE-ZERO-LOCKED
UPDATED: 2026-06-25

---

## 0. 結論

現行話パックは **V2を使う**。

話パックZIP正本候補は、必ず梱包さんが生成する。設計さん単独生成物はWRITE投入候補にしない。

ただし、旧「話カードv2」TXTをそのまま正本テンプレにしない。
現行の正規導線は、作品資料を実読したうえで、以下の順に閉じる。

```text
project/source full read
-> work profile / band profile / connection card
-> writer_ready_card_v2
-> V2 scene build
-> layer current-key binding
-> crosscheck
-> writing_freeze_card_v2
-> packager canonical writer pack generation proof
```

`writing_freeze_card_v2` は読了代替ではない。
ready / V2 / layer / crosscheck を実読した後に、執筆直前の固定条件を閉じるカードである。

v019.9以降、話パックの最終受け渡しは `PACKAGER_TO_PACK_WRITER_CANONICAL_ROUTE` 一つだけ。設計さん単独生成のepisode folderや手作業ZIPは、INSPECT素材に留め、WRITE投入候補にしない。梱包さん生成証明と梱包さん検査PASSがないものは、形状が読めても正本候補ではない。

---

## 1. 梱包さんが必ず使う現行サンプル

```text
assets/samples/SAMPLE_REFERENCES/WRITER_READY_CARD_TEMPLATE_V2.md
assets/samples/SAMPLE_REFERENCES/WORK_PROFILE_TEMPLATE_V2.md
assets/samples/SAMPLE_REFERENCES/BAND_PROFILE_TEMPLATE_V2.md
assets/samples/SAMPLE_REFERENCES/CONNECTION_CARD_TEMPLATE_V2.md
assets/samples/SAMPLE_REFERENCES/WRITING_FREEZE_CARD_TEMPLATE_V2.md
assets/samples/SAMPLE_REFERENCES/ITEM_MANAGEMENT_TABLE_V2.md
assets/samples/SAMPLE_REFERENCES/ZIP_STRUCTURE_V2.md
assets/samples/SAMPLE_REFERENCES/REVERSE_EXTRACTION_CHECKLIST_V2.md
assets/samples/SAMPLE_REFERENCES/READY_SAMPLE_NEKO_001_KAZENOTOORUHI.md
assets/samples/SAMPLE_REFERENCES/READY_SAMPLE_NEKO_002_PURINHAHITOTSU.md
assets/samples/SAMPLE_REFERENCES/READY_SAMPLE_NEKO_003_YUUGATAYONIKURUKO.md
assets/dsgn_infra/03_REFERENCE/layer/layer_alias_to_current_keys_v0194.md
```

猫ready 001-003は、作品条件源ではなく、密度見本である。
作品固有条件は必ず作品側正規入力から取る。

---

## 2. 使わないもの

- 旧8点TXTを現行テンプレ正本として使わない。
- `V2_SAMPLE_NEKO_49.txt` を現行49話テンプレとして使わない。
- `assets/comparison/` を本文条件源にしない。
- DSGN辞書、タグ全文、レイヤー正本全文を執筆さんへ渡さない。
- NOM、索引、ログ、END_LOGから物語条件を補わない。

旧資料を読む場合は、比較・成立経緯・密度差の確認に限定する。

---

## 3. 話パック標準形

```text
WORK_001-050_pack_vXXX/
  00_README.md
  00_packGateIndex.json
  00_sourceMountIndex.json
  01_pack_profile.md
  02_world_axis_used.md
  03_character_used.md
  04_layer_common.md
  05_band_profiles/
  06_continuity/
  07_episodes/
    episode_001/
      00_episode_index.md
      01_ready.md
      02_v2.md
      03_layer.md
      03_layer_binding_manifest.json
      04_crosscheck.md
      05_frozen.md
      06_execution_queue.md
      07_sources.md
  08_terms.md
  09_writer_boot.md
  10_stop_rules.md
  11_layer_backlog.md
  12_pack_cutout_log/
    00_packager_generation_proof.json
    01_packager_inspection_result.json
    02_writer_handoff_check.json
    03_writer_output_comfort_check.json
    04_full_convergence_sweep.json
    05_cutout_log.md
```

1話1フォルダ。
パック直下には `00_packGateIndex.json` と `00_sourceMountIndex.json`、各話フォルダには `00_episode_index.md` と `03_layer_binding_manifest.json` を置く。
索引は地図であり、読了代替・本文条件源ではない。

---

## 4. STOP条件

以下は補完せず止める。

- 作品側正規入力ZIPが未読、欠損、対象話数不明。
- ready条件をV2が全回収していない。
- layer値が旧語のまま current key に解決されていない。
- layerBindingManifest に source_id / source_role / allowed_use / forbidden_expansion がない。
- crosscheck に未対応または衝突がある。
- frozen が ready / V2 / layer / crosscheck の読了代替になっている。
- 現行の50話実話フォルダ話パックで synthetic materialMap を要求している。
- 執筆さんへ渡す出力にDSGN辞書・タグ全文・正本全文が混ざる。

---

## 5. 設計さんへの戻り

梱包さんを設計さんが自律起動した場合、PASSでもSTOPでも設計さんへ戻る。
ユーザーが明示起動した場合、PASSでもSTOPでも梱包さんのまま待機する。

---

## v019.9 絶対固定: 梱包さん絶対梱包→パック執筆さん単一路線

詳細は `assets/dsgn_infra/04_MODULE/packager/PACKAGER_WRITER_CANONICAL_HANDOFF_CONTRACT_v0198.md` を読む。

必須固定:

```json
{
  "singleRouteLocked": true,
  "absolutePackagerPackagingLocked": true,
  "packagerOutputOnly": true,
  "designerPackagingAllowed": false,
  "writerConsumesOnlyPackagerOutput": true,
  "packagerRouteStatus": "FIXED_CONFIRMED",
  "canonicalRoute": "PACKAGER_TO_PACK_WRITER_CANONICAL_ROUTE",
  "generatedBy": "PACKAGER_PROCESS",
  "designerDirectPack": false,
  "writerRuntimeTarget": "PW90_WRITABLE_ZIP_PACK_CURRENT",
  "writerGate": "V2_FOLDER_PROJECTLOCKED_REAL_PACK_GATE",
  "inputMode": "V2_EPISODE_FOLDER_PROJECTLOCKED_REAL_PACK",
  "materialMapRequired": false
}
```

`00_sourceMountIndex.json` で `stop_if_missing_before_write` 指定された内部source recordが現ZIP内で解決できなければ `INTERNAL_PACK_REFERENCE_MISSING` でWRITE前STOP。

## v019.5 補助固定: 執筆さん快適出力門

v019.5以降、話パックの合格は `WRITER_OUTPUT_COMFORT_CHECK` を通った場合だけとする。

- 設計さん単独出力は `WRITE_CANON` / `WRITE_READY` / `WRITER_CONSUMABLE_REAL_PACK` を自称しない。
- `01_ready.md` / `02_v2.md` は本文復元源。
- `03_layer.md` / `05_frozen.md` は本文制約。
- `04_crosscheck.md` / `06_execution_queue.md` は PROCESS_ONLY。
- `07_sources.md` は REFERENCE_ONLY。
- `00_episode_index.md` / `03_layer_binding_manifest.json` は本文源禁止。
- `source_lines_current` は `L1-L10` 形式だけ。複数根拠は `current_sources[]` へ分ける。
- crosscheckは現ZIP内の内部住所検査 `internal_pack_crosscheck` を正本にする。
- 内部住所未解決時は `WRITE_READY` を名乗らない。

詳細は `assets/dsgn_infra/04_MODULE/packager/WRITER_OUTPUT_COMFORT_CHECK_v0195.md` を読む。
