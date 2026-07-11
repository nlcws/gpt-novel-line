# DSGN_DESIGN_LAYER_ANCHOR_SCHEMA_v1

STATUS: complete_candidate
PURPOSE: 設計さんが、世界軸/キャラ/作品/帯/単話に固定されたレイヤー値を管理するためのアンカー形式。

---

# 1. DESIGN LAYER ANCHOR

```yaml
DSGN_DESIGN_LAYER_ANCHOR:
  anchor_id:
  anchor_type:
    - world_axis_layer_fixed
    - character_layer_fixed
    - work_profile_layer_fixed
    - band_profile_layer_fixed
    - episode_layer_only
  display_name:
  source_basis:
    source_kind:
      - work_concept
      - existing_design
      - repeated_episode_evidence
      - backlog_adopted
      - manual_designer_decision
    source_refs:
  linked_tags:
  fixation_level:
    - HARD_FIXED
    - SOFT_DEFAULT
    - CONDITIONAL_FIXED
    - EPISODE_ONLY
    - BACKLOG_CANDIDATE
    - PROHIBITED
  owner:
    - designer_core
  editable_by:
    designer_core: true
    packager: false
    writer: false
  applies_to:
    work:
    band:
    episode_range:
    character:
    world_area:
    condition:
  layer_values:
    surface_axis:
    pressure_axis:
    routing_axis:
    leak_axis:
    scene_vector:
    closing_vector:
    sentence_flow:
    irregularity_sources:
    forbidden_group:
  expected_text_effect:
    increases_in_text:
    decreases_or_forbids_in_text:
    routing_destinations:
    closing_destinations:
  override_policy:
    allowed_episode_overrides:
    prohibited_episode_overrides:
    required_override_reason:
  backlog_policy:
    if_repeated:
    if_conflict:
    if_unclear_destination:
  writer_visibility:
    full_anchor: false
    frozen_extract_only: true
  validation:
    not_theme_summary:
    not_style_only:
    has_physical_or_procedural_effect:
    namespace_ok:
```

---

# 2. WORLD AXIS ANCHOR EXAMPLE

```yaml
DSGN_DESIGN_LAYER_ANCHOR:
  anchor_id: DSGN.ANCHOR.world.cat_cafe.operation.v1
  anchor_type: world_axis_layer_fixed
  display_name: "猫カフェ世界の物理運用レイヤー"
  source_basis:
    source_kind: work_concept
    source_refs:
      - DSGN.SRC.layer.meaning.v1
      - DSGN.SRC.layer.preset.v1
  linked_tags:
    - dsgn.embed.world_axis
    - dsgn.layer.scene.procedure
    - dsgn.layer.scene.object_position
    - dsgn.layer.scene.residue
  fixation_level: SOFT_DEFAULT
  owner: designer_core
  editable_by:
    designer_core: true
    packager: false
    writer: false
  applies_to:
    work: current_work
    band: null
    episode_range: all
    character: null
    world_area: cafe
    condition: normal_operation
  layer_values:
    pressure_axis: world_operation_pressure + object_pressure
    routing_axis:
      relation: distance_or_procedure
      aftertaste: residue
    leak_axis:
      - dish
      - seat
      - notebook
      - cat_route
    scene_vector:
      - procedure_vector
      - object_position_vector
    closing_vector:
      - routine_continues_with_difference
      - unresolved_residue
    irregularity_sources:
      - cat_ignores_human_timing
      - work_sound_enters_before_reply
    forbidden_group:
      - symbolic_cat_or_object
      - clean_close
      - theme_summary
  expected_text_effect:
    increases_in_text:
      - 皿
      - 席
      - 通路
      - 帳面
      - 猫の動線
    decreases_or_forbids_in_text:
      - 癒された
      - 居場所だった
      - 優しさが残った
    routing_destinations:
      - relation_to_distance_or_procedure
      - aftertaste_to_residue
    closing_destinations:
      - unresolved_residue
  override_policy:
    allowed_episode_overrides:
      - SOFT_DEFAULTはready/V2根拠があれば単話で調整可
    prohibited_episode_overrides:
      - 猫を象徴化する
      - 店をテーマ説明装置にする
    required_override_reason: true
  writer_visibility:
    full_anchor: false
    frozen_extract_only: true
  validation:
    not_theme_summary: true
    not_style_only: true
    has_physical_or_procedural_effect: true
    namespace_ok: true
```
