# DSGN_LAYER_EMBED_SECTION_TEMPLATES_v1

STATUS: complete_candidate
PURPOSE: 純設計欄とレイヤー埋込欄のテンプレートを固定する。

---

# 1. WORLD_AXIS TEMPLATE

```yaml
WORLD_PURE_DESIGN:
  world_id:
  places:
  objects:
  actors_or_nonhuman_agents:
  physical_rules:
  social_rules:
  constraints:

WORLD_OPERATION_DESIGN:
  normal_operations:
  object_movements:
  spatial_routes:
  adjustment_rules:
  timing_rules:

DSGN_LAYER_EMBED_WORLD_AXIS:
  anchor_id:
  anchor_type: world_axis_layer_fixed
  linked_pure_design_ref:
  fixation_level:
  source_basis:
  layer_use:
    pressure_axis:
    routing_axis:
    leak_axis:
    scene_vector:
    closing_vector:
    sentence_flow_bias:
  residue_types:
  irregularity_sources:
  forbidden_symbolization:
  expected_text_effect:
    increases_in_text:
    decreases_or_forbids_in_text:
    routing_destinations:
    closing_destinations:
  writer_visibility:
    full_anchor: false
    frozen_extract_only: true
  validation:
    not_character_specific:
    not_episode_only:
    not_theme_summary:
    has_physical_or_procedural_effect:
    namespace_ok:
  tags:

DSGN_LAYER_ANCHOR_REFS:
  - anchor_id:

WORLD_LAYER_BACKLOG:
  - backlog_id:
```

---

# 2. CHARACTER_DESIGN TEMPLATE

```yaml
CHARACTER_PURE_DESIGN:
  character_id:
  age:
  role:
  relationships:
  desire:
  fear:
  constraints:
  history:

CHARACTER_BEHAVIOR_DESIGN:
  normal_actions:
  speech_patterns:
  avoidance_patterns:
  object_habits:
  reaction_patterns:

DSGN_LAYER_EMBED_CHARACTER:
  anchor_id:
  anchor_type: character_layer_fixed
  linked_pure_design_ref:
  fixation_level:
  source_basis:
  layer_use:
    pressure_axis:
    routing_axis:
    leak_axis:
    scene_vector:
    closing_vector:
  notice_bias:
  body_leak_patterns:
  speech_gap_patterns:
  substitute_actions:
  self_awareness_gap:
  speakable_boundary:
  expected_text_effect:
    increases_in_text:
    decreases_or_forbids_in_text:
    routing_destinations:
  writer_visibility:
    full_anchor: false
    frozen_extract_only: true
  validation:
    not_world_specific:
    not_episode_only:
    not_theme_summary:
    has_behavioral_effect:
    namespace_ok:
  tags:

DSGN_LAYER_ANCHOR_REFS:
  - anchor_id:

CHARACTER_LAYER_BACKLOG:
  - backlog_id:
```

---

# 3. WORK_PROFILE TEMPLATE

```yaml
WORK_PURE_DESIGN:
  work_id:
  genre_or_domain:
  world_type:
  reader_entry:
  stable_promises:
  prohibited_story_moves:

WORK_TEXT_POLICY:
  default_observation:
  explanation_policy:
  forbidden_summary:
  public_beginner_policy:

DSGN_LAYER_EMBED_WORK_PROFILE:
  anchor_id:
  anchor_type: work_profile_layer_fixed
  linked_pure_design_ref:
  fixation_level:
  source_basis:
  default_surface_axis:
  default_routing_bias:
  default_explanation_volume:
  global_forbidden_group:
  default_closing_guard:
  expected_text_effect:
    increases_in_text:
    decreases_or_forbids_in_text:
  writer_visibility:
    full_anchor: false
    frozen_extract_only: true
  validation:
    not_episode_only:
    not_theme_summary:
    not_style_only:
    namespace_ok:
  tags:

DSGN_LAYER_ANCHOR_REFS:
  - anchor_id:
```

---

# 4. BAND_PROFILE TEMPLATE

```yaml
BAND_PURE_DESIGN:
  band_id:
  episode_range:
  structural_change:
  relationship_change:
  world_operation_change:

BAND_OPERATION_DESIGN:
  pressure_trend:
  recurring_operations:
  relation_or_world_shift:

DSGN_LAYER_EMBED_BAND_PROFILE:
  anchor_id:
  anchor_type: band_profile_layer_fixed
  linked_pure_design_ref:
  fixation_level:
  source_basis:
  band_pressure_bias:
  band_closing_bias:
  band_irregularity_density:
  sentence_flow_bias:
  expected_text_effect:
    increases_in_text:
    decreases_or_forbids_in_text:
  writer_visibility:
    full_anchor: false
    frozen_extract_only: true
  validation:
    not_episode_only:
    not_theme_summary:
    namespace_ok:
  tags:

DSGN_LAYER_ANCHOR_REFS:
  - anchor_id:
```

---

# 5. EPISODE LAYER TEMPLATE

```yaml
EPISODE_LAYER_APPLICATION:
  episode_id:
  source_ready:
  source_v2:
  used_design_layer_anchors:
  selected_pressure_axis:
  selected_leak_axis:
  selected_scene_vector:
  selected_support_scene_vector:
  selected_closing_vector:
  selected_sentence_flow:
  focus_route:
  irregularity_slot:
  expected_text_effect:
    increases_in_text:
    decreases_or_forbids_in_text:
    closing_destination:
  not_a_design_update: true
  tags:
    - dsgn.embed.episode_layer
```

---

# 6. FROZEN EXTRACT TEMPLATE

```yaml
FROZEN_LAYER_EXTRACT_FOR_WRITER:
  episode_id:
  do:
    - 
  do_not:
    -
  world_layer_extract:
    -
  character_layer_extract:
    -
  sentence_flow_extract:
    -
  closing_extract:
    -
  STOP_if:
    -
```

ここに anchor全文は入れない。
