# DSGN_LAYER_EMBED_BACKLOG_FLOW_v1

STATUS: complete_candidate
PURPOSE: 単話で見つかったレイヤー値を、世界軸/キャラ設計/作品/帯へ固定するまでの採否フロー。

---

# 1. FLOW

```text
episode_layerで発見
↓
梱包さんが恒久化候補を検出
↓
PACKAGER_LAYER_BACKLOG_RECORD 作成
↓
設計さんが destination 判定
↓
EPISODE_ONLY / CHARACTER_DESIGN / WORLD_AXIS / WORK_PROFILE / BAND_PROFILE / PROHIBITED
↓
fixation_level 決定
↓
DSGN_DESIGN_LAYER_ANCHOR 作成または更新
↓
source_id / dsgn.* tag へ登録
```

---

# 2. PACKAGER_LAYER_BACKLOG_RECORD

```yaml
PACKAGER_LAYER_BACKLOG_RECORD:
  episode_id:
  observed_value:
  observed_text_effect:
  suspected_destination:
    - character_design
    - world_axis
    - work_profile
    - band_profile
    - episode_only
    - unknown
  evidence:
    ready_basis:
    v2_basis:
    text_effect_basis:
    repeated_episode_refs:
  risk:
    - theme_summary
    - style_only
    - character_world_mix
    - episode_only_overfix
  packager_recommendation:
  designer_decision_required: true
```

---

# 3. DESIGNER_ADOPTION_RECORD

```yaml
DESIGNER_ADOPTION_RECORD:
  backlog_id:
  decision:
    - adopt_world_axis
    - adopt_character_design
    - adopt_work_profile
    - adopt_band_profile
    - keep_episode_only
    - reject_prohibited
    - hold_more_evidence
  fixation_level:
  reason:
  physical_or_procedural_effect:
  source_refs:
  created_anchor_id:
  updated_tags:
```

---

# 4. STOP

```text
STOP_IF:
  - packager directly edits world_axis
  - adoption reason is thematic only
  - fixation_level missing
  - project.* tag used for DSGN anchor
  - writer receives backlog/adoption record
```
