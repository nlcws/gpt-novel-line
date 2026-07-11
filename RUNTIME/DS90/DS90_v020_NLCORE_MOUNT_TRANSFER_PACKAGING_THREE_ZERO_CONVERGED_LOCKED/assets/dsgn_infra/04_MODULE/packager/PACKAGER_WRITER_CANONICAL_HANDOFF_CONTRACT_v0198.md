# PACKAGER_WRITER_CANONICAL_HANDOFF_CONTRACT_v0198

STATUS: current_packager_writer_boundary
ROLE: 梱包さん出力規格とパック執筆さん入力規格を一つに固定する契約
APPLIES_TO_DESIGNER_RUNTIME: DS90-v020-NLCORE-MOUNT-TRANSFER-PACKAGING-THREE-ZERO-LOCKED
TARGET_WRITER_RUNTIME: PW90_WRITABLE_ZIP_PACK_CURRENT

---

## 0-S. 機械可読正本

梱包さん→パック執筆さん契約の機械可読正本は次の1枚に固定する。

```text
assets/dsgn_infra/04_MODULE/packager/PACKAGER_WRITER_HANDOFF_SCHEMA_v1.json
schema_sha256: 9d6125a4c39ee59c9ab269a9ffa99b5da715c3eefcca6a99f7cc69e5f506ff2b
```

設計さん→梱包さんの境界は次で固定する。

```text
assets/dsgn_infra/04_MODULE/packager/DESIGNER_TO_PACKAGER_MATERIAL_BUNDLE_v1.md
```

## 0-A. 梱包さん絶対梱包ロック

話パックZIP正本候補は、必ず梱包さんが生成する。

```text
絶対条件:
  設計さん単独生成: WRITE投入候補不可
  手作業ZIP: WRITE投入候補不可
  見た目だけepisode folder: WRITE投入候補不可
  梱包さん生成証明なし: WRITE投入候補不可
  梱包さん検査PASSなし: WRITE投入候補不可
  PW90入力契約不一致: WRITE投入候補不可
```

このロックは提案・暫定・寄せではない。現行話パック生成の固定条件である。

## 0. 結論

話パック正本候補は、梱包さん正規ランタイムで生成され、梱包さん検査PASSを持ち、PW90入力契約に一致するものだけとする。

```text
設計さん:
  作品sourceを実読し、ready / V2 / layer / crosscheck / frozen に必要な条件を閉じる。
  話パックZIP正本を自称しない。

梱包さん:
  下記の一つの正規構成で話パックを生成する。
  生成後、自分で検査する。
  検査PASSを機械可読で付与する。
  PW90が小説を書けるZIP話パック入力契約へ固定する。

パック執筆さん:
  梱包さん正規出力を優先して読む。ただし受領判定は版番号ではなく、ZIP話パック成果物が小説を書ける条件を含むかで行う。
  内部source recordが現ZIP内で解決できなければWRITE前STOP。
```

複数の正式形式、見た目だけepisode folder、設計さん単独生成ZIPは正本化しない。

---

## 1. 正規ルートID

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

`materialMapRequired=false` は、現行の50話実話フォルダパックが synthetic materialMap 形式ではないためである。  
ただし、materialMapを要求しないことは、未確認sourceを読んだことにする許可ではない。

---

## 2. root必須ファイル

梱包さん正規出力のrootには、最低限以下を置く。

```text
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
08_terms.md
09_writer_boot.md
10_stop_rules.md
11_layer_backlog.md
12_pack_cutout_log/
```

`00_packGateIndex.json` は読順地図。読了代替・本文条件源ではない。  
`00_sourceMountIndex.json` は内部source record要求の機械可読索引。本文条件源ではない。

---

## 3. episode必須ファイル

各話フォルダは以下を固定する。

```text
07_episodes/episode_###/
  00_episode_index.md
  01_ready.md
  02_v2.md
  03_layer.md
  03_layer_binding_manifest.json
  04_crosscheck.md
  05_frozen.md
  06_execution_queue.md
  07_sources.md
```

v004.8bパック執筆さんはこの固定9ファイルを読む。  
任意扱いに見せない。空で済ませる場合も、本文源禁止・PROCESS_ONLY・REFERENCE_ONLYの宣言を持たせる。

---

## 4. 本文源ロール

```json
{
  "RESTORE_SOURCE": ["01_ready.md", "02_v2.md"],
  "RESTORE_CONSTRAINT": ["03_layer.md", "05_frozen.md"],
  "PROCESS_ONLY": ["04_crosscheck.md", "06_execution_queue.md"],
  "REFERENCE_ONLY": ["07_sources.md"],
  "DENY_AS_BODY_SOURCE": [
    "00_episode_index.md",
    "03_layer_binding_manifest.json",
    "00_packGateIndex.json",
    "00_sourceMountIndex.json",
    "README",
    "manifest",
    "log"
  ]
}
```

`04_crosscheck.md` は検査札。本文復元源ではない。  
`05_frozen.md` は固定条件札。ready / V2 / layer / crosscheck の読了代替ではない。  
`06_execution_queue.md` は施工順。本文素材そのものではない。  
`07_sources.md` は参照住所録。本文条件源ではない。

---

## 5. internal source gate

`00_sourceMountIndex.json` で `stop_if_missing_before_write` に入った内部source recordは、現ZIP内で解決されるまでWRITE不可。

未確認時のSTOP理由はこれに固定する。

```text
INTERNAL_PACK_REFERENCE_MISSING
```

現行実話フォルダパックで `MATERIAL_MAP_MISSING` を返さない。

---

## 6. 梱包さん検査PASS

話パックrootには、梱包さん検査結果を機械可読で持たせる。

```json
{
  "packagerInspection": {
    "decision": "PASS",
    "zipSafe": true,
    "rootShapeOk": true,
    "episodeShapeOk": true,
    "jsonParseOk": true,
    "sourceLineRefsOk": true,
    "bodySourceRolesSeparated": true,
    "layerManifestSafe": true,
    "sourceMountPolicyDeclared": true,
    "writerGateTarget": "V2_FOLDER_PROJECTLOCKED_REAL_PACK_GATE"
  }
}
```

`decision=PASS` がないものは、梱包さん正規出力候補ではない。

---

## 7. 設計さん単独生成物の扱い

設計さんが作ったepisode folder、手作業ZIP、見た目だけ正規形のパックは、検査素材に留める。

```text
INSPECT素材: 可
WRITE投入候補: 不可
```

梱包工程証明、梱包工程検査PASS、PW90入力契約一致、内部source record解決PASSが揃って初めてWRITE投入候補である。

---

## 8. PASS式

```text
梱包さん正規生成証明PASS
+ 梱包さん検査PASS
+ PW90入力契約一致
+ 内部source record解決PASS
= WRITE投入候補
```

設計さんの自己申告、ファイル名、見た目のfolder構成、過去試作の通過実績では代替しない。

---

## 9. STOP固定

次の状態は、理由を問わずSTOPする。

```text
PACKAGER_GENERATION_PROOF_MISSING
PACKAGER_INSPECTION_PASS_REQUIRED
DESIGNER_DIRECT_PACK_DENIED
WRITER_INPUT_CONTRACT_MISMATCH
INTERNAL_PACK_REFERENCE_MISSING
```



## v019.13 self-contained STOP additions

- `INTERNAL_PACK_REFERENCE_MISSING`
- `SOURCE_FILE_CURRENT_NOT_FOUND`
- `SOURCE_LINES_CURRENT_OUT_OF_RANGE`
- `EXTERNAL_RELOAD_TEXT_DENIED`

現行話パックは現ZIP内完結。追加ZIP再読込要求を書かない。
