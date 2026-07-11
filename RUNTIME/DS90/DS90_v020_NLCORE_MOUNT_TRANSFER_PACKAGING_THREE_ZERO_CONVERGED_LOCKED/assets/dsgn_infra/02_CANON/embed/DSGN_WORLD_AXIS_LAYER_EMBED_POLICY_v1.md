# DSGN_WORLD_AXIS_LAYER_EMBED_POLICY_v1

STATUS: complete_candidate
PURPOSE: レイヤー値を世界軸側・設計側へ固定する条件を定義する。
SCOPE:
  - 世界軸へ埋め込むlayer値
  - キャラ設計へ埋め込むlayer値との境界
  - 作品/帯/単話layerとの継承関係
  - 梱包さんが勝手に恒久変更しないための採用フロー
NAMESPACE: DSGN_ / dsgn.*

---

# 0. HARD CONCLUSION

世界軸側に固定するレイヤーは、本文の雰囲気ではない。  
世界が毎回同じように作動するための **物理・手順・配置・生活運用・非協力要素** である。

固定してよいもの:
```text
- 場所の使い方
- 物の動き方
- 人間と非人間の位置関係
- 作業や生活の手順
- どかす/どかさない対象
- 反応が出る物理チャンネル
- 残留しやすいもの
- 割り込みやすい生活音/作業
- 象徴化してはいけない対象
```

固定してはいけないもの:
```text
- 単話だけの感情方向
- 単話だけの締め方
- その回だけの会話ズレ
- その回だけの小道具
- キャラ固有の身体癖
- 読者へ出すテーマ説明
- 文体の美的プリセット
```

---

# 1. EMBED DESTINATION SEPARATION

## 1-1. WORLD_AXIS に固定するもの

WORLD_AXIS は「場所・物・手順・共同体・非人間の通常運用」を持つ。

world_axis_layer_fixed:
```yaml
physical_routing_channels:
  meaning: 圧をどの物理経路へ逃がしやすい世界か
  examples:
    - seat
    - corridor
    - counter
    - doorway
    - dish
    - notebook
    - bag_space
    - cat_route

spatial_constraints:
  meaning: 人や物がどう置かれ、何が通路や境界になるか
  examples:
    - 猫はどかさない
    - 人間側が椅子や皿をずらす
    - 通路幅が関係圧を持つ
    - 戸口が返答前の滞留点になる

ordinary_operation_rules:
  meaning: 普段の作業や生活手順
  examples:
    - 会計前に帳面を確認する
    - 皿は客より猫の動線を優先して置く
    - 閉店前に床ではなく椅子下を先に見る

nonhuman_agent_rules:
  meaning: 猫・天気・音・物など、人間以外の作動規則
  examples:
    - 猫は象徴ではなく移動障害として働く
    - 風は会話の意味を代弁しない
    - 生活音は清潔な沈黙を割る

residue_types:
  meaning: 残りやすい物理的なもの
  examples:
    - 毛
    - 水滴
    - 帳面のズレ
    - 椅子の幅
    - 払われなかった皿
    - 片付かない音

irregularity_sources:
  meaning: 世界側から発生する小さな非協力要素
  examples:
    - 猫が人間のタイミングを無視する
    - 作業音が返答前に入る
    - 道具が少し足りない
    - 皿が予定と違う位置に残る

forbidden_symbolization:
  meaning: 象徴化してはいけない対象
  examples:
    - 猫を救済や自由の象徴にしない
    - 白い毛を優しさの象徴にしない
    - 店を居場所の説明装置にしない
```

---

## 1-2. CHARACTER_DESIGN に固定するもの

CHARACTER_DESIGN は「人物が安定して出す漏れ方」を持つ。

character_layer_fixed:
```yaml
body_leak_patterns:
  examples:
    - 手元を直す
    - 袖を触る
    - 靴先を引く
    - 返答前に物を持ち替える

notice_bias:
  examples:
    - 顔より手元を見る
    - 人より皿の位置を見る
    - 音に先に反応する

speech_gap_patterns:
  examples:
    - 感情を言う前に作業を言う
    - 質問に正面から答えない
    - 返事を短くして次の動作へ逃がす

substitute_actions:
  examples:
    - 片付ける
    - 数える
    - 皿をずらす
    - 席を一つ空ける
```

WORLD_AXIS と CHARACTER_DESIGN を混ぜない。

```text
世界がそう動く -> WORLD_AXIS
その人物がそう漏らす -> CHARACTER_DESIGN
その話だけそうする -> EPISODE_LAYER
```

---

## 1-3. WORK_PROFILE に固定するもの

WORK_PROFILE は作品全体の初期値を持つ。

work_profile_layer_fixed:
```yaml
default_surface_axis:
  example: objective_near

default_explanation_volume:
  example: low_with_action_replacement

global_forbidden_group:
  examples:
    - clean_close
    - theme_summary
    - symbolic_cat_or_object

default_routing_bias:
  examples:
    - emotion_to_body_or_object
    - relation_to_distance_or_procedure
    - aftertaste_to_residue
```

---

## 1-4. BAND_PROFILE に固定するもの

BAND_PROFILE は帯ごとの変化を持つ。

band_profile_layer_fixed:
```yaml
band_pressure_bias:
  examples:
    - 前半はworld_operation_pressure多め
    - 中盤はrelationship_pressure多め

band_closing_bias:
  examples:
    - 前半はroutine_continues_with_difference
    - 後半はunresolved_residue増加

band_irregularity_density:
  examples:
    - 中盤以降、clean_proof_breakerを軽く増やす
```

---

## 1-5. EPISODE_LAYER に置くもの

EPISODE_LAYER は今回だけの適用値を持つ。

episode_layer_only:
```yaml
selected_pressure_axis:
selected_leak_axis:
selected_scene_vector:
selected_support_scene_vector:
selected_closing_vector:
selected_sentence_flow:
selected_focus_route:
selected_irregularity_slot:
expected_effect_summary:
```

単話で使ったからといって、世界軸へ固定しない。

---

# 2. FIXATION LEVELS

レイヤー埋込は、必ず固定レベルを持つ。

```yaml
FIXATION_LEVEL:
  HARD_FIXED:
    meaning: 世界/作品の恒久法則。単話で上書き不可。
    example: 猫は象徴ではなく、物理的な移動障害として扱う。

  SOFT_DEFAULT:
    meaning: 通常値。ready/V2根拠があれば単話で変更可。
    example: 店内の圧は皿・席・帳面へ逃がしやすい。

  CONDITIONAL_FIXED:
    meaning: 条件つき恒久値。
    example: 閉店前だけ、生活音が返答を割りやすい。

  EPISODE_ONLY:
    meaning: 今回だけの適用。
    example: 今回だけ男客の鞄を漏れ口にする。

  BACKLOG_CANDIDATE:
    meaning: 恒久化候補。まだ採用しない。
    example: 3話続けて皿の位置が関係圧を持った。

  PROHIBITED:
    meaning: 禁止固定。
    example: 猫を癒しの象徴として使う。
```

---

# 3. ADOPTION RULE

## 3-1. 直接 WORLD_AXIS に固定できる条件

以下を満たす時のみ、WORLD_AXISへ固定できる。

```text
- 作品/世界の根本法則として明示されている
- 複数話で反復している
- その値が変わると世界の作動が変わる
- キャラ固有ではなく場所/物/手順側の性質である
- 物理的・手順的な本文効果を説明できる
- 象徴/テーマ説明ではない
```

## 3-2. BACKLOG止まりにする条件

```text
- 1話でしか出ていない
- 便利だが世界法則か不明
- キャラ由来か世界由来か判別不能
- 物理本文効果はあるが反復未確認
- 単話の都合で作った可能性がある
```

## 3-3. 採用禁止

```text
- 「いい感じだから」
- 「毎回使えそうだから」
- 「AI臭が減ったから」
- 「読後感がよかったから」
- 「テーマに合うから」
```

採用理由は、必ず物理・手順・配置・生活運用で書く。

---

# 4. WORLD AXIS LAYER FIXED SCHEMA

世界軸側に持たせる最小スキーマ。

```yaml
WORLD_AXIS_LAYER_FIXED:
  namespace: dsgn.embed.world_axis
  version:
  owner: designer_core
  fixation_level:
  source_basis:
    from_work_profile:
    from_existing_world_axis:
    from_repeated_episode_evidence:
    from_backlog:
  physical_routing_channels:
  spatial_constraints:
  ordinary_operation_rules:
  nonhuman_agent_rules:
  sensory_channels:
  residue_types:
  irregularity_sources:
  forbidden_symbolization:
  allowed_episode_overrides:
  prohibited_episode_overrides:
  expected_text_effect:
    increases_in_text:
    decreases_or_forbids_in_text:
    routing_destinations:
    closing_destinations:
  crosscheck:
    not_character_specific:
    not_episode_only:
    not_theme_summary:
    has_physical_or_procedural_effect:
  tags:
    - dsgn.embed.world_axis
    - dsgn.layer.axis.routing
    - dsgn.layer.scene.procedure
```

---

# 5. DESIGN SIDE HOLDING SCHEMA

設計さん側が持つ管理レコード。

```yaml
DSGN_DESIGN_LAYER_ANCHOR:
  anchor_id:
  anchor_type:
    - world_axis_layer_fixed
    - character_layer_fixed
    - work_profile_layer_fixed
    - band_profile_layer_fixed
    - episode_layer_only
  source_id:
  linked_tags:
  fixation_level:
  owner:
  editable_by:
    designer_core: true
    packager: false
    writer: false
  lookup_policy:
  adoption_policy:
  override_policy:
  backlog_policy:
  writer_visibility:
    full_anchor: false
    frozen_extract_only: true
```

---

# 6. OVERRIDE RULE

## 6-1. HARD_FIXED

単話上書き不可。

できること:
```text
- 一時例外として episode_layer に exception を書く
- reason を書く
- backlog_review へ送る
```

できないこと:
```text
- 梱包さんが世界軸値を書き換える
- 執筆さんが都合で無視する
- 単話readyで勝手に反転する
```

## 6-2. SOFT_DEFAULT

ready/V2根拠があれば変更可。  
ただし変更理由を episode_layer に書く。

```yaml
override_reason:
  ready_basis:
  v2_basis:
  expected_effect:
  not_world_axis_update: true
```

## 6-3. CONDITIONAL_FIXED

条件が一致する時だけ発動。  
条件外では使わない。

```yaml
condition:
  time:
  place:
  actor_group:
  operation_state:
```

---

# 7. PACKAGER RULE

梱包さんは世界軸固定値を読む時、以下を守る。

```text
1. WORLD_AXIS_LAYER_FIXED を参照する
2. 今回のready/V2と一致する固定値だけ使う
3. HARD_FIXEDを上書きしない
4. SOFT_DEFAULT変更時は override_reason を書く
5. 恒久化したい場合は backlog へ送る
6. 執筆さんへは frozen 最小値だけ渡す
```

梱包さんが出すもの:

```yaml
PACKAGER_WORLD_LAYER_USE_RECORD:
  episode_id:
  world_axis_fixed_refs:
  used_values:
  overridden_values:
  override_reason:
  frozen_extract:
  backlog_candidates:
```

---

# 8. WRITER RULE

執筆さんへは、世界軸固定値そのものを渡さない。  
渡すのは本文施工用に変換した値だけ。

渡す例:
```yaml
frozen_world_layer_extract:
  - 猫はどかさず、人間側が皿をずらす。
  - 帳面の白い毛は意味説明せず、最後に残してよい。
  - 店の優しさを説明しない。
```

渡さない例:
```text
WORLD_AXIS_LAYER_FIXED全文
DSGN_DESIGN_LAYER_ANCHOR全文
全タグ辞書
採用理由ログ
```

---

# 9. STOP CONDITIONS

```text
STOP_IF:
  - 世界軸固定値に fixation_level がない
  - キャラ由来と世界由来が混ざっている
  - 1話だけの値をHARD_FIXEDにしている
  - 物理/手順効果が書けない
  - 梱包さんがHARD_FIXEDを上書きしている
  - 執筆さんへ固定正本全文を渡そうとしている
  - symbolic_cat_or_object が混ざっている
  - project.* タグで世界軸正本を固定しようとしている
```

---

# 10. MINIMUM EXAMPLE

```yaml
WORLD_AXIS_LAYER_FIXED:
  namespace: dsgn.embed.world_axis
  version: v1
  owner: designer_core
  fixation_level: SOFT_DEFAULT
  source_basis:
    from_work_profile: "猫カフェ系世界"
    from_repeated_episode_evidence: null
    from_backlog: null
  physical_routing_channels:
    - seat
    - dish
    - cat_route
    - notebook
  spatial_constraints:
    - 猫はどかさない
    - 人間側が皿や椅子を少しずらす
  ordinary_operation_rules:
    - 閉店前に帳面を確認する
  nonhuman_agent_rules:
    - 猫は象徴ではなく物理的な割込として働く
  residue_types:
    - 毛
    - 皿の位置
    - 帳面のズレ
  irregularity_sources:
    - 猫が返答のタイミングを無視する
    - 皿が予定と違う場所に残る
  forbidden_symbolization:
    - 猫を癒しの象徴にしない
    - 白い毛を優しさの象徴にしない
  expected_text_effect:
    increases_in_text:
      - 皿
      - 席
      - 帳面
      - 通路
    decreases_or_forbids_in_text:
      - 居場所だった
      - 癒された
      - 優しさが残った
    routing_destinations:
      - relation_to_distance_or_procedure
      - aftertaste_to_residue
    closing_destinations:
      - unresolved_residue
  crosscheck:
    not_character_specific: true
    not_episode_only: true
    not_theme_summary: true
    has_physical_or_procedural_effect: true
  tags:
    - dsgn.embed.world_axis
    - dsgn.layer.scene.procedure
    - dsgn.layer.scene.object_position
    - dsgn.layer.scene.residue
```
