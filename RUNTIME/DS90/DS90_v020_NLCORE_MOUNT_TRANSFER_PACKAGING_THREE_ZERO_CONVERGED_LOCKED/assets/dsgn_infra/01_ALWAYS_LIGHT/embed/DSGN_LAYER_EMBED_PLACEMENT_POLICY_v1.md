# DSGN_LAYER_EMBED_PLACEMENT_POLICY_v1

STATUS: complete_candidate
PURPOSE: レイヤー埋込の「記載場所」と「記載方法」を固定し、純設計とレイヤー運用の混線を防ぐ。
SCOPE:
  - WORLD_AXIS
  - CHARACTER_DESIGN
  - WORK_PROFILE
  - BAND_PROFILE
  - EPISODE_LAYER
  - BACKLOG
NAMESPACE: DSGN_ / dsgn.*

---

# 0. HARD CONCLUSION

「埋め込む」は、同じ場所に混ぜて書くことではない。  
純設計とレイヤー運用は、**同じ対象を扱っていても記載欄を分ける**。

```text
純設計:
  世界・人物・作品の事実、構造、法則、関係、物理条件を書く。

レイヤー埋込:
  その事実を本文でどう拾うか、どこへ圧を逃がすか、何を禁止するかを書く。
```

混ぜると、次の事故が起きる。

```text
- 世界軸の事実が文体指示になる
- レイヤーの本文操作が世界の事実になる
- キャラ癖と世界法則が混ざる
- 梱包さんが単話補完を恒久設定にする
- 執筆さんが設計欄を本文素材化する
```

---

# 1. FIXED SECTION RULE

各設計ファイルには、以下のように **純設計欄** と **DSGNレイヤー埋込欄** を分ける。

```text
WORLD_AXIS
  A. WORLD_PURE_DESIGN
  B. WORLD_OPERATION_DESIGN
  C. DSGN_LAYER_EMBED_WORLD_AXIS
  D. DSGN_LAYER_ANCHOR_REFS
  E. WORLD_LAYER_BACKLOG

CHARACTER_DESIGN
  A. CHARACTER_PURE_DESIGN
  B. CHARACTER_BEHAVIOR_DESIGN
  C. DSGN_LAYER_EMBED_CHARACTER
  D. DSGN_LAYER_ANCHOR_REFS
  E. CHARACTER_LAYER_BACKLOG

WORK_PROFILE
  A. WORK_PURE_DESIGN
  B. WORK_TEXT_POLICY
  C. DSGN_LAYER_EMBED_WORK_PROFILE
  D. DSGN_LAYER_ANCHOR_REFS

BAND_PROFILE
  A. BAND_PURE_DESIGN
  B. BAND_OPERATION_DESIGN
  C. DSGN_LAYER_EMBED_BAND_PROFILE
  D. DSGN_LAYER_ANCHOR_REFS

EPISODE_FOLDER
  01_ready.md
  02_v2.md
  03_layer.md
  04_crosscheck.md
  05_frozen.md
  06_backlog.md
```

---

# 2. WHAT GOES WHERE

## 2-1. WORLD_PURE_DESIGN

書くもの:
```text
- 場所の構造
- 物理的な制約
- 店/家/寺/街のルール
- 道具や物の存在
- 人や動物の通常行動
- 社会的な運用
- 作品世界の事実
```

書かないもの:
```text
- 本文でどう拾うか
- どの語順にするか
- どの締め方にするか
- AI臭回避のための禁止
- 物を何の圧の逃げ先にするか
```

例:
```yaml
WORLD_PURE_DESIGN:
  place: 猫カフェ
  rule:
    - 猫は客席に入る
    - 猫が座った椅子を人間が無理にどかさない
  object:
    - 皿
    - 帳面
    - 椅子
    - 通路
```

---

## 2-2. WORLD_OPERATION_DESIGN

書くもの:
```text
- 通常業務
- 手順
- 動線
- 物がどこへ置かれるか
- 誰が何を調整するか
```

これは純設計寄り。  
ただし、本文での使い方はまだ書かない。

例:
```yaml
WORLD_OPERATION_DESIGN:
  normal_operations:
    - 閉店前に帳面を確認する
    - 皿は猫の動線を避けて置き直す
    - 通路が狭い時、人間側が椅子を少しずらす
```

---

## 2-3. DSGN_LAYER_EMBED_WORLD_AXIS

書くもの:
```text
- 世界の事実を本文でどの圧の逃げ先にするか
- scene_vector
- routing_axis
- residue_types
- irregularity_sources
- forbidden_symbolization
- expected_text_effect
```

書かないもの:
```text
- 新しい世界事実
- 未承認の設定追加
- 単話だけの小道具
- キャラ固有の身体癖
```

例:
```yaml
DSGN_LAYER_EMBED_WORLD_AXIS:
  anchor_id: DSGN.ANCHOR.world.cat_cafe.operation.v1
  linked_pure_design_ref:
    - WORLD_OPERATION_DESIGN.normal_operations
  fixation_level: SOFT_DEFAULT
  layer_use:
    pressure_axis:
      - world_operation_pressure
      - object_pressure
    routing_axis:
      relation: distance_or_procedure
      aftertaste: residue
    scene_vector:
      - procedure_vector
      - object_position_vector
    closing_vector:
      - unresolved_residue
  residue_types:
    - 毛
    - 帳面のズレ
    - 皿の位置
  irregularity_sources:
    - 猫が返答のタイミングを無視する
    - 作業音が沈黙を割る
  forbidden_symbolization:
    - 猫を癒しの象徴にしない
    - 白い毛を優しさの象徴にしない
  expected_text_effect:
    increases_in_text:
      - 皿
      - 席
      - 通路
      - 帳面
    decreases_or_forbids_in_text:
      - 居場所だった
      - 癒された
      - 優しさが残った
```

---

# 3. CHARACTER FILE PLACEMENT

## 3-1. CHARACTER_PURE_DESIGN

書くもの:
```text
- 年齢
- 立場
- 関係
- 欲求
- 恐れ
- 経歴
- できること/できないこと
```

書かないもの:
```text
- 本文でどの順番に拾うか
- どの動作を漏れ口にするか
- どのscene_vectorを使うか
```

## 3-2. CHARACTER_BEHAVIOR_DESIGN

書くもの:
```text
- 普段の行動傾向
- 話し方
- 反応パターン
- 手癖
- 避け方
```

これは純設計とレイヤーの境界に近い。  
ただし、ここには **人物事実としての行動傾向** だけを書く。

## 3-3. DSGN_LAYER_EMBED_CHARACTER

書くもの:
```text
- body_leak_patterns
- notice_bias
- speech_gap_patterns
- substitute_actions
- self_awareness_gap
- speakable_boundary
- expected_text_effect
```

例:
```yaml
DSGN_LAYER_EMBED_CHARACTER:
  anchor_id: DSGN.ANCHOR.character.suzu.notice_bias.v1
  linked_pure_design_ref:
    - CHARACTER_BEHAVIOR_DESIGN.reaction_patterns
  fixation_level: SOFT_DEFAULT
  layer_use:
    pressure_axis:
      - character_pressure
    leak_axis:
      - hand
      - sleeve
      - reply_delay
    routing_axis:
      emotion: body_action
      refusal: action_not_taken
  notice_bias:
    - 顔より手元を見る
    - 人の説明より皿の位置を見る
  speech_gap_patterns:
    - 感情を言う前に作業を言う
  expected_text_effect:
    increases_in_text:
      - 手元
      - 皿の位置
      - 返答前の動作
    decreases_or_forbids_in_text:
      - 直接の感情説明
```

---

# 4. WORK PROFILE PLACEMENT

## 4-1. WORK_PURE_DESIGN

書くもの:
```text
- 作品の主題ではなく前提
- 作品の世界型
- 主要な場
- 読者体験の方向
- 扱う領域
```

## 4-2. WORK_TEXT_POLICY

書くもの:
```text
- 作品全体の文章方針
- 説明量
- 禁止群
- 地の文の基本観測
```

これは純設計とレイヤーの接続欄。  
ただし、個別のレイヤー値は次の欄に書く。

## 4-3. DSGN_LAYER_EMBED_WORK_PROFILE

書くもの:
```text
- default_surface_axis
- default_routing_bias
- global_forbidden_group
- explanation_volume
- default_closing_guard
```

例:
```yaml
DSGN_LAYER_EMBED_WORK_PROFILE:
  anchor_id: DSGN.ANCHOR.work.default_layer.v1
  fixation_level: SOFT_DEFAULT
  default_surface_axis: objective_near
  default_routing_bias:
    emotion: body_or_object
    relation: distance_or_procedure
    aftertaste: residue
  global_forbidden_group:
    - clean_close
    - theme_summary
    - symbolic_cat_or_object
  default_explanation_volume: low_with_action_replacement
```

---

# 5. BAND PROFILE PLACEMENT

## 5-1. BAND_PURE_DESIGN

書くもの:
```text
- 帯の話数範囲
- 帯で起こる構造変化
- 関係や世界の進み方
```

## 5-2. DSGN_LAYER_EMBED_BAND_PROFILE

書くもの:
```text
- band_pressure_bias
- band_closing_bias
- band_irregularity_density
- sentence_flow_bias
```

例:
```yaml
DSGN_LAYER_EMBED_BAND_PROFILE:
  anchor_id: DSGN.ANCHOR.band.002.layer_bias.v1
  episode_range: 011-020
  fixation_level: CONDITIONAL_FIXED
  band_pressure_bias:
    - relationship_pressure
    - world_operation_pressure
  band_closing_bias:
    - unresolved_residue
  band_irregularity_density: medium_light
```

---

# 6. EPISODE FOLDER PLACEMENT

単話フォルダでは、恒久埋込をしない。  
単話では「使う」だけ。

```text
03_layer.md:
  今回使うlayer値

04_crosscheck.md:
  ready / V2 / layer の対応

05_frozen.md:
  執筆さんへ渡す最小抽出値

06_backlog.md:
  恒久化候補
```

## 6-1. 03_layer.md

```yaml
EPISODE_LAYER_APPLICATION:
  episode_id:
  source_ready:
  source_v2:
  used_design_layer_anchors:
    - DSGN.ANCHOR.world.cat_cafe.operation.v1
  selected_pressure_axis:
  selected_leak_axis:
  selected_scene_vector:
  selected_closing_vector:
  selected_sentence_flow:
  expected_text_effect:
```

## 6-2. 06_backlog.md

```yaml
LAYER_EMBED_BACKLOG:
  episode_id:
  candidate_value:
  suspected_destination:
    - WORLD_AXIS
    - CHARACTER_DESIGN
    - WORK_PROFILE
    - BAND_PROFILE
    - EPISODE_ONLY
  reason:
  evidence:
    ready_basis:
    v2_basis:
    text_effect_basis:
  designer_decision_required: true
```

---

# 7. PURE DESIGN VS LAYER DECISION

判定質問:

```text
Q1. それは世界/人物の事実か？
  yes -> PURE_DESIGN側へ

Q2. それは本文でどう拾うかか？
  yes -> DSGN_LAYER_EMBED側へ

Q3. それが変わると物語事実が変わるか？
  yes -> PURE_DESIGN側へ

Q4. それが変わると本文の見え方だけ変わるか？
  yes -> DSGN_LAYER_EMBED側へ

Q5. 両方あるか？
  yes -> 純設計欄とレイヤー欄に分割し、anchorでリンクする
```

例:

```text
猫が椅子に座る
  -> WORLD_PURE_DESIGN / WORLD_OPERATION_DESIGN

猫をどかさず、人間側の椅子や皿がずれる
  -> WORLD_OPERATION_DESIGN

そのズレを relation_to_distance_or_procedure の逃げ先にする
  -> DSGN_LAYER_EMBED_WORLD_AXIS

白い毛を優しさの象徴にする
  -> PROHIBITED
```

---

# 8. WRITING METHOD RULE

レイヤー埋込欄は、必ず YAML ブロックで書く。  
散文で書かない。

理由:
```text
- 純設計との混線を防ぐ
- 梱包さんが抽出しやすい
- anchor_idで追跡できる
- fixation_levelを必須化できる
- writerへ全文流出を防げる
```

必須項目:

```yaml
anchor_id:
anchor_type:
linked_pure_design_ref:
fixation_level:
source_basis:
layer_use:
expected_text_effect:
writer_visibility:
validation:
tags:
```

---

# 9. ANCHOR ID RULE

形式:

```text
DSGN.ANCHOR.<destination>.<domain>.<name>.v<version>
```

例:

```text
DSGN.ANCHOR.world.cat_cafe.operation.v1
DSGN.ANCHOR.character.suzu.notice_bias.v1
DSGN.ANCHOR.work.default_layer.v1
DSGN.ANCHOR.band.002.layer_bias.v1
```

禁止:
```text
project.cat.anchor.*
episode_049_anchor
layer_anchor_1
```

---

# 10. TAG RULE

レイヤー埋込欄には必ず dsgn.* tag を付ける。

例:

```yaml
tags:
  - dsgn.embed.world_axis
  - dsgn.layer.scene.procedure
  - dsgn.layer.scene.object_position
  - dsgn.layer.scene.residue
```

project.* は使わない。  
project側へ必要なら、別途 PRJ 側に参照を書く。

---

# 11. STOP CONDITIONS

```text
STOP_IF:
  - 純設計欄に scene_vector / routing_axis / leak_axis が書かれている
  - DSGN_LAYER_EMBED欄に新しい世界事実が書かれている
  - fixation_level がない
  - anchor_id がない
  - linked_pure_design_ref がない
  - expected_text_effect がない
  - writer_visibility がない
  - tags がない
  - project.* tag が混入している
  - 散文で曖昧に埋め込まれている
```
