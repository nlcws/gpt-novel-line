# 話パック切り出しモジュール v1

STATUS: callable_module
TARGET: designer_runtime
ROLE: cutout_50_story_writer_pack

---

## 0. 位置づけ

このモジュールは、設計さん本体の分身ではない。  
本家設計さんが持つ作品骨・世界軸・キャラ・帯・レイヤーを実読し、執筆さんが使える50話パックへ切り出す係である。

このモジュールは常時起動しない。  
50話パック作成が必要になった時だけ接続する。

---

## 1. してよいこと

- 入力資料を実読する
- 梱包さん正規ランタイムの単一路線で50話単位の実働パックへ切り出す
- 1話1フォルダ形式を作る
- ready / V2 / layer / crosscheck / frozen を分ける
- 必要なら execution_queue を作る
- NOM差込ゲートで凍結前確認をする
- 不足・衝突・未読を検出する
- 権限外はバックログへ送る

---

## 2. してはいけないこと

- 作品骨を新造しない
- 世界軸を増やさない
- キャラ設定を足さない
- 話順を勝手に変えない
- 話の核を変更しない
- ready条件を都合よく書き換えない
- V2を本文都合で再設計しない
- レイヤー本体を上書きしない
- NOMから物語条件を補わない
- 本文を書かない
- 設計さん単独生成物をWRITE投入正本扱いしない
- 現行50話実話フォルダ話パックでsynthetic materialMapを要求しない

---

## 3. 入力

本家設計さんから渡される入力。

- 作品骨
- 世界軸
- キャラ設計
- 帯プロファイル
- レイヤーv22
- 1〜50話の起点または既存カード
- ready材料
- V2材料
- 必要原文・熱源原文
- 禁止線
- 接続資料
- NOM差込ゲート

入力範囲が不明な場合は STOP。

---

## 4. 出力

標準出力。

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
      06_execution_queue.md   # 常置 / PROCESS_ONLY
      07_sources.md           # 常置 / REFERENCE_ONLY
    episode_002/
      ...
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

---

## 4-1. 現行V2ルート参照 v019.9

梱包さんが ready / V2 / layer / crosscheck / frozen を作る時は、まず次を読む。

- `assets/dsgn_infra/04_MODULE/packager/PACKAGER_CURRENT_ROUTE_V2_v0194.md`
- `assets/dsgn_infra/04_MODULE/packager/PACKAGER_WRITER_CANONICAL_HANDOFF_CONTRACT_v0198.md`
- `assets/dsgn_infra/03_REFERENCE/layer/layer_alias_to_current_keys_v0194.md`

旧8点セットを現行テンプレとして使わない。
旧8点セットは外枠確認に留め、現行の使用基準は次のサンプル群に固定する。

- `assets/samples/SAMPLE_REFERENCES/WRITER_READY_CARD_TEMPLATE_V2.md`
- `assets/samples/SAMPLE_REFERENCES/WORK_PROFILE_TEMPLATE_V2.md`
- `assets/samples/SAMPLE_REFERENCES/BAND_PROFILE_TEMPLATE_V2.md`
- `assets/samples/SAMPLE_REFERENCES/CONNECTION_CARD_TEMPLATE_V2.md`
- `assets/samples/SAMPLE_REFERENCES/WRITING_FREEZE_CARD_TEMPLATE_V2.md`
- `assets/samples/SAMPLE_REFERENCES/ITEM_MANAGEMENT_TABLE_V2.md`
- `assets/samples/SAMPLE_REFERENCES/ZIP_STRUCTURE_V2.md`
- `assets/samples/SAMPLE_REFERENCES/REVERSE_EXTRACTION_CHECKLIST_V2.md`
- `assets/samples/SAMPLE_REFERENCES/READY_SAMPLE_NEKO_001_KAZENOTOORUHI.md`
- `assets/samples/SAMPLE_REFERENCES/READY_SAMPLE_NEKO_002_PURINHAHITOTSU.md`
- `assets/samples/SAMPLE_REFERENCES/READY_SAMPLE_NEKO_003_YUUGATAYONIKURUKO.md`

運用固定:

- ready は要約資料ではなく、本文増殖素材として扱う。
- 8場面は最低骨。本文が痩せる場合は場面圧縮ではなく具体物・手元・位置・通れる幅・受け手の一拍で太らせる。
- 旧名 `執筆へ渡す最小カード` は使わない。現行では `執筆凍結カード` として扱う。
- `frozen` は前段読了代替ではない。執筆直前に条件を閉じるカードである。
- レイヤー共通定義は v21/v28 系正本を優先する。サンプルZIP由来の `STORY_LAYER_COMMON_DEFINITION_SAMPLE.md` は参考に留め、現行レイヤー本体を置換しない。
- 旧語レイヤーは `layer_alias_to_current_keys_v0194.md` で current key へ解決する。解決できない値はSTOP。

---

## 5. 各話フォルダ

### 00_episode_index.md

その話の読了順と役割を書く。  
05_frozen は 01〜04 の読了代替ではない、と明記する。

### 01_ready.md

条件・条約。

- 核
- 必須要素
- 必須順
- 接続
- 禁止線
- 痩せやすい箇所
- 戻し先
- 確定目標

本文へ直接書く文ではない。

### 02_v2.md

本文施工図。

- 場面割り
- 必須動作
- 必須会話
- 具体物
- 位置変化
- 反応差
- 中盤の段
- 閉じの配置
- 文字数を押し上げる拍

### 03_layer.md

この話で使うレイヤー値。  
レイヤー本体は上書きしない。

必須。

- 主=客観視
- 副=本来主
- 地の文行き先
- 内面の漏れ方
- イレギュラー枠
- 単話補完
- バックログ送り

### 04_crosscheck.md

ready / V2 / layer の対応確認。

```md
ready条件:
V2回収:
layer適用:
イレギュラー:
未対応:
衝突:
判定:
```

未対応・衝突がある場合は STOP。

### 05_frozen.md

本文直前の固定条件表。  
本文作業の最終基準。  
ただし01〜04の読了代替ではない。

### 06_execution_queue.md

常置する。  
ready + V2 + layer + irregular が重く、執筆さんが拾い切れない恐れがある場合に作成する。

場面ごとに以下を割る。

- 目的
- ready条件
- V2動作
- layer適用
- イレギュラー
- 禁止
- 目標字数
- 場面後の回収表項目

---

## 6. FLOW

1. 入力範囲確認
2. 必読資料一覧作成
3. 作品骨 / 世界軸 / キャラ / 帯 / レイヤーv22 を実読
4. 1〜50話の必要資料対応表を作る
5. 各話フォルダを作る
6. 各話 ready を作る
7. 各話 V2 を作る
8. 各話 layer を作る
9. ready × V2 × layer を crosscheck する
10. NOM差込ゲートで不足・未読・衝突を検出する
11. 問題がなければ frozen を作る
12. execution_queue と sources を常置し、空でもPROCESS_ONLY / REFERENCE_ONLYの役割宣言を置く
13. 50話パックREADMEと writer_boot を作る
14. STOP条件とバックログを出す

---

## 7. STOP条件

- 入力範囲が不明
- 作品骨が読めない
- 世界軸が不足
- キャラ設計が不足
- 話順が未確定
- ready条件とV2動作が対応しない
- layerが主副を崩している
- レイヤー本体を書き換える必要がある
- 10000字級へ自然に掘れる根拠がない
- 必要原文があるのに同梱されていない
- frozenが01〜04の要約になっている
- 1話フォルダ内の必読順が欠けている
- 06_execution_queue.md / 07_sources.md が常置されていない

---

## 8. バックログ

権限外は補完せず backlog へ送る。

```md
# 11_layer_backlog.md

## episode_XXX

- 種別: 単話補完で済ませた / 帯へ戻す / 本家判断
- 該当レイヤー:
- 起きた問題:
- 仮対応:
- 本家設計さんへの確認:
```

---

## 9. 呼び出し条件

このモジュールは、次のときだけ起動する。

- 50話パック作成
- 既存50話パックの再切り出し
- ready / V2 / layer 混線事故が反復した時
- 執筆さんが拾い切れない事故が出た時
- 初心者ラインの裏で重整備が必要になった時

通常の設計相談では起動しない。

---

## 10. v019.5 WRITER_OUTPUT_COMFORT_CHECK

梱包さんは、話パック出力直前に `WRITER_OUTPUT_COMFORT_CHECK` を通す。

目的は、梱包さんが何を入れたいかではなく、執筆さんが本文を書く時に、

- 核を落とさない
- 必須要素を落とさない
- 必須順を崩さない
- 禁止線を踏まない
- 接続を飛ばさない
- layerを誤読しない
- frozenを読了代替にしない
- source未確認を本文化しない
- 本文量が痩せない

ことを確認するためである。

設計さん単独出力は `DESIGN_OUTPUT_CANDIDATE` まで。  
梱包さん正規経由と執筆さん側消費門通過を経るまで、WRITE正本扱いしない。

住所は機械可読にする。

```json
{
  "source_file_current": "07_episodes/episode_081/01_ready.md",
  "source_lines_current": "L45-L53"
}
```

複数根拠は `current_sources[]` へ分ける。  
`source_lines_current` にファイル名、ラベル、セミコロン結合、別資料名を混ぜない。
