# LAYER_RUNTIME_V28_AI_NATIVE_COMPLETE_CANDIDATE

STATUS: layer_only_complete_candidate_with_all_item_meaning_and_preset_reference
SCOPE: japanese_novel_text_generation_only
MODE: ai_native_control_document
REPLACES:
  - layer_runtime_v26_ai_native_complete_candidate
  - layer_runtime_v25_ai_native_complete_candidate
  - layer_runtime_v24_complete_candidate
  - layer_v23_ai_readable_runtime
  - layer_v22_novel_runtime
  - 話レイヤー再定義版_マルチ運用_v21
MERGE_POLICY: do_not_merge_with_old_layer_text
OLD_TEXT_POLICY: old_layer_documents_are_reference_history_only

---

# 0. PURPOSE

THIS_LAYER_CONTROLS:
  - surface_observation
  - pressure_source
  - prose_selection_bias
  - narration_destination
  - indirect_inner_pressure_output
  - description_function
  - anti_ai_like_destination_guard
  - non_cooperating_irregular_detail
  - embedding_rules_for_character_design
  - embedding_rules_for_world_axis
  - episode_level_layer_application
  - prose_motion_decomposition
  - sentence_variation_profile
  - scene_vector_and_focus_route

THIS_LAYER_DOES_NOT_CONTROL:
  - plot_creation
  - worldbuilding_creation
  - character_creation
  - theme_creation
  - episode_order_creation
  - new_idea_generation
  - ready_condition_rewrite
  - v2_action_rewrite
  - nom_gate_rewrite

CORE_RULE:
  ja: レイヤーは本文の表面・圧源・地の文の行き先を制御する。物語条件そのものは作らない。

---

# 1. TERMINOLOGY_REPLACEMENT

PRIMARY_TERMS:
  SURFACE_AXIS:
    japanese_alias: 表面観測
    old_alias: 主
    role: prose_surface_observation_stance
  PRESSURE_AXIS:
    japanese_alias: 圧源
    old_alias: 副
    role: true_center_that_decides_selection_bias
  ROUTING_AXIS:
    japanese_alias: 行き先
    role: where_abstract_pressure_must_be_converted
  LEAK_AXIS:
    japanese_alias: 漏れ口
    role: indirect_inner_pressure_output_channel
  EMBED_AXIS:
    japanese_alias: 埋込先
    role: decides_what_belongs_to_character_design_or_world_axis

OLD_TERM_POLICY:
  主:
    status: allowed_alias_only
    map_to: SURFACE_AXIS
  副:
    status: allowed_alias_only
    map_to: PRESSURE_AXIS
  主副:
    status: not_primary_runtime_terms
    note: human_short_alias_only

INVALID_OLD_MEANINGS:
  - 主_is_protagonist_pov
  - 主_is_camera_character
  - 主_is_distance_setting_only
  - 主の近さ
  - 副_is_helper_character
  - 副_is_optional
  - 副未設定可
  - 副_is_reaction_axis_only
  - 副_is_secondary_axis
  - layer_is_style_preset
  - layer_is_theme_instruction
  - layer_can_rewrite_story

IF_OLD_MEANING_APPEARS:
  action: ignore_old_meaning_and_apply_v25
  prohibited_action:
    - harmonize_old_and_new
    - treat_sub_as_optional
    - ask_user_to_define_old_terms_again


---

# 1B. LEGACY_FIELD_DECOMPOSITION

PURPOSE:
  ja: 旧ready/旧レイヤーの「地の文」「向かう方向」「構文変奏」などの曖昧な単一値を、AIが処理できる部品へ分解する。

CORE_RULE:
  - legacy_field_must_not_be_used_as_single_vague_setting
  - do_not_accept_value_like_あり_without_decomposition
  - do_not_convert_variation_into_decorative_sentence_shuffle
  - each_legacy_field_must_be_mapped_to_ai_native_runtime_fields

LEGACY_TO_NATIVE_MAP:
  地の文語彙:
    map_to:
      - VOCAB_SELECTION_BIAS
      - OBJECT_SELECTION_BIAS
      - PRESSURE_AXIS_NOTICE_BIAS
    invalid_use:
      - style_adjective_only
      - pretty_word_palette
      - synonym_swap

  地の文温度:
    map_to:
      - SURFACE_TEMPERATURE_PROFILE
      - PRESSURE_EXPOSURE_LIMIT
      - SENTENCE_PRESSURE_DENSITY
    invalid_use:
      - warm_cold_mood_only
      - high_temperature_equals_loud_emotion
      - low_temperature_equals_colorless

  地の文観測:
    map_to:
      - OBSERVATION_DISTANCE
      - SUBJECT_VISIBILITY_MODE
      - INNER_ACCESS_LIMIT
    invalid_use:
      - pov_switch_permission
      - direct_inner_monologue_permission

  内面:
    map_to:
      - LEAK_CHANNEL
      - INNER_OUTPUT_LIMIT
      - BODY_OBJECT_GAP_OUTPUT
    invalid_use:
      - emotion_name_report
      - self_analysis_sentence

  地の文接続:
    map_to:
      - CONNECTOR_MODE
      - ACTION_TO_ACTION_LINK
      - OBJECT_MOVEMENT_LINK
      - DIALOGUE_HANDOFF_LINK
    invalid_use:
      - abstract_logical_connector_first
      - because_therefore_summary

  向かう方向:
    map_to:
      - SCENE_VECTOR
      - ROUTING_AXIS
      - CLOSING_VECTOR
      - PRESSURE_RELEASE_DESTINATION
    invalid_use:
      - theme_direction_sentence
      - emotional_goal_statement
      - reader_takeaway

  構文変奏:
    map_to:
      - SENTENCE_VARIATION_PROFILE
      - SENTENCE_LENGTH_DISTRIBUTION
      - CLAUSE_DENSITY
      - SUBJECT_VISIBILITY_MODE
      - OBJECT_FIRST_RATE
      - VERB_TIMING
      - DIALOGUE_PROSE_RATIO
      - REPETITION_WITH_DIFFERENCE
      - INTERRUPTION_PATTERN
      - LINE_BREAK_DENSITY
    invalid_use:
      - あり
      - short_and_medium_mixed_only
      - inversion_for_flavor
      - decorative_rhythm_change
      - random_sentence_length_variation

  焦点移動:
    map_to:
      - FOCUS_ROUTE
      - FOCUS_TRANSFER_TRIGGER
      - FOCUS_RETURN_POINT
    invalid_use:
      - camera_pan_without_pressure
      - list_of_seen_objects

  比喩:
    map_to:
      - METAPHOR_SOURCE_RULE
      - METAPHOR_PERMISSION_CONDITION
      - METAPHOR_AFTER_EXPLANATION_BAN
    invalid_use:
      - abstract_beautification
      - reusable_poetic_sentence

  説明量:
    map_to:
      - EXPLANATION_LIMIT
      - EXPLANATION_REPLACEMENT_TARGET
      - READER_CLUE_POLICY
    invalid_use:
      - simply_short
      - vague_low_explanation

WRITER_COMPATIBILITY_ALIAS:
  ready_field_構文変奏:
    runtime_status: alias_only
    must_expand_before_writer_visible_form: true
  ready_field_向かう方向:
    runtime_status: alias_only
    must_expand_before_writer_visible_form: true

STOP_IF:
  - 構文変奏_is_left_as_あり
  - 向かう方向_is_left_as_感覚優先の変奏_only
  - 地の文温度_is_left_as_低め_or_高め_without_exposure_rule
  - 焦点移動_is_left_as_あり_without_route

---

# 2. AUTHORITY_AND_LOAD_ORDER

AUTHORITY_ORDER:
  1: user_or_designer_fixed_condition
  2: work_profile
  3: world_axis
  4: character_design
  5: band_profile
  6: ready_card
  7: v2_card
  8: this_layer_runtime
  9: episode_layer_application
  10: crosscheck
  11: frozen_condition_table
  12: execution_queue
  13: prose_generation

LOAD_ORDER_FOR_DESIGNER:
  1: work_profile
  2: world_axis
  3: character_design
  4: band_profile
  5: this_layer_runtime
  6: backlog

LOAD_ORDER_FOR_PACK_CUTOUT:
  1: work_profile
  2: world_axis
  3: character_design
  4: band_profile
  5: ready_card
  6: v2_card
  7: this_layer_runtime
  8: episode_layer_application
  9: crosscheck
  10: frozen_condition_table

LOAD_ORDER_FOR_WRITER:
  1: episode_readme
  2: ready_card
  3: v2_card
  4: episode_layer_application
  5: crosscheck
  6: frozen_condition_table
  7: execution_queue_if_present

CONFLICT_RULE:
  if_layer_conflicts_with_ready_or_v2: STOP
  if_episode_layer_conflicts_with_character_design: STOP_OR_BACKLOG
  if_episode_layer_conflicts_with_world_axis: STOP_OR_BACKLOG
  prohibited_action:
    - invent_compromise
    - silently_ignore_layer
    - silently_rewrite_ready
    - silently_rewrite_v2
    - silently_rewrite_character_design
    - silently_rewrite_world_axis

---

# 3. HARD_DEFINITIONS

## 3-1. SURFACE_AXIS

SURFACE_AXIS:
  japanese_alias: 表面観測
  old_alias: 主
  required: true
  fixed_default: objective_surface
  role: prose_surface_observation_stance
  means:
    - prose_surface_uses_objective_observation
    - prose_does_not_enter_first_person_or_direct_inner_monologue_by_default
    - narrator_does_not_explain_theme
    - scene_is_seen_from_outside_enough_to_keep_prose_surface_clean
  does_not_mean:
    - protagonist_pov
    - camera_character
    - god_voice
    - author_explanation
    - emotionless_camera
    - detached_summary
    - omniscient_moral_sentence
  prose_effect:
    - visible_actions_first
    - objects_and_positions_first
    - direct_emotion_names_delayed_or_avoided

## 3-2. PRESSURE_AXIS

PRESSURE_AXIS:
  japanese_alias: 圧源
  old_alias: 副
  required: true
  role: true_center_that_decides_selection_bias
  means:
    - decides_what_is_noticed
    - decides_what_action_feels_heavy
    - decides_temperature_without_direct_emotion_name
    - decides_silence_position
    - decides_which_object_or_gap_carries_pressure
    - decides_narrative_pressure_under_objective_surface
  does_not_mean:
    - helper_character
    - optional_secondary_character
    - free_pov_switch
    - inner_monologue_permission
    - character_to_explain_emotion
  default_policy:
    pressure_axis_missing: STOP
    pressure_axis_optional: invalid
    pressure_axis_may_be_nonhuman_or_place_pressure_if_designer_explicitly_defines: true

## 3-3. ROUTING_AXIS

ROUTING_AXIS:
  japanese_alias: 行き先
  required: true
  role: destination_for_abstract_pressure
  means:
    - abstract_pressure_must_be_converted_to_action_object_position_or_residue
    - emotion_relationship_theme_change_must_not_end_as_clean_summary
    - prose_destination_must_be_physical_or_behavioral_when_possible
  high_priority:
    - object_position
    - body_action
    - distance
    - procedure_change
    - unchosen_action
    - residue
    - interrupted_timing
    - non_cooperating_detail
    - incomplete_arrangement
    - repeated_action_with_difference

## 3-4. LEAK_AXIS

LEAK_AXIS:
  japanese_alias: 漏れ口
  role: indirect_inner_pressure_output_channel
  means:
    - pressure_axis_leaks_through_body_object_distance_silence
    - inner_state_is_not_reported_as_emotion_name
    - inner_state_changes_what_is_done_or_not_done

CORE_SENTENCE:
  ja: 本文表面は表面観測で進む。何を拾うか、どの順で拾うか、どの温度で残すかは圧源で決まる。圧は行き先へ変換し、感情名・関係名・意味整理で閉じない。

---

# 4. EMBED_AXIS_POLICY

PURPOSE:
  ja: レイヤー項目のうち、毎話指定すると重くなるものをキャラクター設計・世界軸・作品/帯プロファイルへ埋め込む。

CORE_RULE:
  - stable_behavior_goes_to_character_design
  - stable_physical_or_social_environment_goes_to_world_axis
  - work_wide_prose_default_goes_to_work_profile
  - band_level_shift_goes_to_band_profile
  - episode_only_choice_stays_in_episode_layer_application
  - pack_cutout_must_select_from_embedded_values_before_inventing_new_values

EMBED_DESTINATIONS:
  CHARACTER_DESIGN:
    store:
      - pressure_candidates
      - notice_bias
      - body_leak_patterns
      - speech_gap_patterns
      - avoidance_actions
      - default_object_handles
      - age_gender_output_code
      - inner_pressure_conversion
      - self_awareness_gap
      - public_private_boundary
      - alternative_action_patterns
      - normal_disguise_patterns
    do_not_store:
      - whole_episode_plot
      - universal_theme_sentence
      - final_moral
      - scene_order

  WORLD_AXIS:
    store:
      - physical_routing_channels
      - recurring_objects
      - spatial_constraints
      - social_procedures
      - nonhuman_agents
      - weather_noise_light_smell_channels
      - ordinary_operation_rules
      - what_people_move_instead_of_explaining
      - what_cannot_be_cleanly_resolved
      - residue_types
      - irregularity_sources
    do_not_store:
      - character_inner_monologue
      - episode_solution
      - author_theme_sentence

  WORK_PROFILE:
    store:
      - default_surface_axis
      - default_ai_like_destination_guard
      - default_prose_explanation_limit
      - default_description_function
      - global_forbidden_clean_endings
      - recurring_routing_preferences

  BAND_PROFILE:
    store:
      - band_temperature_shift
      - band_pressure_bias
      - band_common_residue
      - band_common_irregularity
      - band_level_description_density
      - band_level_explanation_limit

  EPISODE_LAYER_APPLICATION:
    store:
      - selected_pressure_axis_for_this_episode
      - selected_leak_channels
      - selected_routing_destinations
      - selected_irregularity
      - selected_description_entry
      - selected_explanation_limit
      - episode_specific_stop_items

DESIGNER_HOLDING_RULE:
  designer_core_must_hold:
    - this_layer_runtime
    - embed_axis_policy
    - character_design_embedding_schema
    - world_axis_embedding_schema
    - band_embedding_schema
    - episode_layer_application_schema
    - layer_backlog_schema
  designer_core_must_not_expand_every_layer_item_in_every_reply: true
  designer_core_should_call_or_apply_layer_when:
    - creating_character_design
    - creating_world_axis
    - creating_band_profile
    - cutting_out_episode_pack
    - resolving_layer_backlog

---

# 5. AI_LIKE_DESTINATION_GUARD

AI_LIKE_DESTINATION:
  definition: 素材が意味整理・関係確認・静かな納得へ吸い込まれること。
  core_failure:
    - physical_operation_becomes_theme_statement
    - object_action_becomes_emotional_summary
    - irregular_detail_becomes_symbol
    - scene_end_becomes_clean_acceptance

HIGH_RISK_DESTINATIONS:
  - 意味の整理
  - 関係の確認
  - 優しさの証明
  - 変化の明文化
  - 静かな納得
  - それだけで十分だった
  - 誰も何も言わなかった
  - 少しだけ距離が縮まった
  - 心の奥で何かがほどけた
  - これは__の話だった
  - 確かに変わっていた
  - 小さな変化だった
  - その優しさが伝わった

DESTINATION_RULE:
  abstract_pressure_must_not_end_as_abstract_sentence: true
  abstract_pressure_must_route_to:
    - object_position
    - body_action
    - distance
    - procedure_change
    - unchosen_action
    - residue
    - interrupted_timing
    - non_cooperating_detail
    - incomplete_arrangement
    - repeated_action_with_difference

---

# 6. ROUTING_TABLE

ROUTE_EMOTION:
  avoid:
    - 不安だった
    - 安心した
    - 嬉しかった
    - 寂しかった
    - ほっとした
    - 心が動いた
  route_to:
    - hand_stop
    - foot_direction
    - gaze_drop
    - object_grip_change
    - delayed_reply
    - unfinished_sentence
    - touched_or_not_touched_object
    - chair_bag_sleeve_door_cup_position

ROUTE_RELATION:
  avoid:
    - 距離が縮まった
    - 受け入れた
    - 信頼が生まれた
    - つながった
  route_to:
    - seat_distance
    - corridor_width
    - who_moves_first
    - object_handover
    - shared_or_unshared_procedure
    - unchanged_gap
    - changed_position_after_conversation

ROUTE_CHANGE:
  avoid:
    - 変わった
    - 少し変化した
    - 確かに違っていた
  route_to:
    - repeated_action_with_one_difference
    - object_not_returned_to_original_place
    - procedure_order_changed
    - person_does_not_do_previous_action
    - residue_visible_after_scene

ROUTE_ACCEPTANCE:
  avoid:
    - 受け入れた
    - 許した
    - 納得した
  route_to:
    - next_procedure_not_interrupted
    - object_left_where_it_is
    - person_makes_room_without_comment
    - repeated_operation_continues_with_slight_difference

ROUTE_REJECTION_OR_HESITATION:
  avoid:
    - 拒んだ
    - 迷った
    - 戸惑った
  route_to:
    - not_sitting
    - not_touching
    - object_kept_in_hand
    - answer_to_different_part
    - delayed_movement
    - half_open_door

ROUTE_AFTERTASTE:
  avoid:
    - 余韻が残った
    - 静かな時間が流れた
    - それだけで十分だった
  route_to:
    - remaining_object
    - remaining_sound
    - uncleaned_mark
    - unremoved_fur_or_water_or_dust
    - routine_continues_with_one_unresolved_part

---

# 7. PROSE_BASE

PROSE_BASE:
  description: prose_processing_rules_not_style_preset
  priorities:
    1: object_position
    2: body_action
    3: gaze_hand_foot_posture
    4: distance_changed_by_dialogue
    5: sound_temperature_light_smell
    6: object_replacement
    7: residue

PROSE_VOCABULARY:
  source: PRESSURE_AXIS
  rule:
    - use_pressure_axis_to_decide_what_is_noticed
    - do_not_copy_pressure_axis_inner_words_directly
    - choose_objects_and_actions_pressure_axis_cannot_ignore

PROSE_TEMPERATURE:
  source: PRESSURE_AXIS
  rule:
    - temperature_appears_as_selection_bias
    - temperature_does_not_appear_as_explanatory_adjective_first
    - high_temperature_does_not_require_shouting
    - low_temperature_does_not_mean_colorless

PROSE_OBSERVATION_DISTANCE:
  allowed:
    objective_surface:
      ja: 表面観測
      use: visible_action_object_position
    objective_near:
      ja: 客観近接
      use: pressure_axis_related_objects_more_frequent
    half_inside:
      ja: 半歩内側
      use: judgment_or_hesitation_via_body_or_unchosen_action
  prohibited:
    - direct_inner_monologue_by_default
    - free_pov_switch
    - emotion_report_first

INNER_OUTPUT:
  principle: leak_not_report
  priority:
    1: hand_stop
    2: foot_direction
    3: gaze_shift
    4: object_regrip
    5: rephrasing
    6: delayed_reply
    7: placement_change
    8: untouched_object

DESCRIPTION_FUNCTION:
  description_is_not_decoration: true
  description_must_work_as:
    - operation
    - pressure_carrier
    - route
    - delay
    - residue
    - obstacle
    - incomplete_arrangement

DESCRIPTION_HIGH_PRIORITY_TARGETS:
  - entered_object
  - object_not_moved
  - object_replaced
  - avoided_object
  - remaining_object
  - previous_episode_continuity_object
  - next_episode_handoff_object

DESCRIPTION_LOW_PRIORITY_OR_PROHIBITED:
  - atmosphere_only_description
  - metaphor_for_meaning_without_action
  - emotional_padding
  - pretty_landscape_for_clean_ending
  - prop_that_does_not_affect_scene

PROSE_FLOW:
  preferred_cycle:
    - action
    - object_change
    - short_dialogue
    - response_difference
    - next_action
  avoid:
    - long_explanation_block_before_action
    - theme_explanation_between_actions
    - summary_after_every_scene

CONNECTOR_POLICY:
  avoid_connectors:
    - だから
    - つまり
    - そのため
    - なぜなら
    - けれど本当は
    - その瞬間、彼は理解した
  prefer_connectors:
    - object_movement
    - gaze_movement
    - dialogue_handoff
    - foot_direction
    - doorway_seat_plate_notebook_position
    - action_not_taken

METAPHOR_POLICY:
  allowed_if:
    - metaphor_source_exists_in_scene_or_work_world
    - metaphor_connects_to_actual_action_or_object
    - metaphor_does_not_require_after_explanation
  avoid:
    - abstract_beautification
    - metaphor_then_meaning_explanation
    - reusable_ai_like_poetic_sentence

EXPLANATION_AMOUNT:
  default: low_to_medium_low
  rule:
    - do_not_make_thinness_the_goal
    - replace_explanation_with_action_object_position_response_difference
    - give_reader_traceable_clues_not_final_interpretation

---


# 7B. PROSE_MOTION_AND_VARIATION_DECOMPOSITION

PURPOSE:
  ja: 旧項目「向かう方向」「構文変奏」「焦点移動」を、本文の動きとして実行できる単位へ分解する。

CORE_RULE:
  - prose_motion_is_not_mood
  - sentence_variation_is_not_decoration
  - variation_must_protect_ready_v2_layer_conditions
  - variation_must_not_change_story_condition
  - variation_must_not_be_used_to_hide_missing_action

## 7B-1. SCENE_VECTOR

SCENE_VECTOR:
  japanese_alias: 向かう方向
  definition: scene-level movement_destination_before_closing
  select_from:
    object_position_vector:
      use_when: pressure_should_end_in_where_object_is_or_is_not
      output_bias:
        - where_object_starts
        - who_moves_it
        - where_it_fails_to_return
        - what_position_remains
    body_action_vector:
      use_when: pressure_should_end_in_action_or_non_action
      output_bias:
        - hand_stop
        - foot_direction
        - delayed_reply
        - action_not_taken
    distance_vector:
      use_when: relationship_pressure_must_not_be_named
      output_bias:
        - seat_distance
        - corridor_width
        - who_makes_room
        - unchanged_gap
    procedure_vector:
      use_when: world_or_work_operation_carries_pressure
      output_bias:
        - order_of_work
        - payment_or_seating_or_cleaning_step
        - changed_routine
        - next_operation_continues
    residue_vector:
      use_when: aftertaste_or_unresolved_part_must_remain
      output_bias:
        - remaining_object
        - uncleaned_mark
        - remaining_sound
        - unresolved_width_or_arrangement
    interruption_vector:
      use_when: scene_must_not_be_clean_proof
      output_bias:
        - bell_arrival_noise_animal_weather_work_interrupts
        - expected_emotional_response_is_delayed_or_replaced
  invalid_values:
    - 感覚優先の変奏_only
    - 静かな余韻へ
    - 関係の変化へ
    - 読後感を残す

## 7B-2. CLOSING_VECTOR

CLOSING_VECTOR:
  definition: where_the_scene_or_episode_must_stop_without_meaning_summary
  allowed_destinations:
    - object_position_after_scene
    - routine_continues_with_difference
    - unresolved_residue
    - action_not_taken
    - repeated_action_with_one_difference
    - noncooperating_detail_remains
  prohibited_destinations:
    - acceptance_sentence
    - theme_sentence
    - quiet_understanding
    - everyone_silent_as_meaning
    - enough_sentence

## 7B-3. SENTENCE_VARIATION_PROFILE

SENTENCE_VARIATION_PROFILE:
  japanese_alias: 構文変奏
  definition: controlled_distribution_of_sentence_operations
  does_not_mean:
    - mix_short_and_medium_randomly
    - inversion_for_style
    - synonym_exchange
    - literary_flavor
    - rhythm_decoration
  must_specify:
    - sentence_length_distribution
    - clause_density
    - subject_visibility_mode
    - object_first_rate
    - verb_timing
    - dialogue_prose_ratio
    - repetition_with_difference
    - interruption_pattern
    - line_break_density
    - stable_locks

SENTENCE_LENGTH_DISTRIBUTION:
  allowed_profiles:
    low_pressure_operation:
      short: medium
      middle: high
      long: low
      use: ordinary_operation_and_scene_setup
    pressure_build:
      short: medium_high
      middle: medium
      long: low
      use: object_body_pressure_without_explanation
    interruption:
      short: high
      middle: medium_low
      long: low
      use: bell_noise_arrival_answer_miss_timing_break
    residue_close:
      short: medium_high
      middle: medium_low
      long: very_low
      use: close_on_object_or_unresolved_arrangement
  invalid:
    - all_short_for_tension
    - all_long_for_literary_density
    - unspecified_mix

CLAUSE_DENSITY:
  allowed:
    low:
      use: action_sequence_or_work_procedure
    medium:
      use: object_position_plus_reaction
    high_limited:
      use: only_when_spatial_relation_requires_precision
  prohibited:
    - high_clause_density_for_emotion_explanation
    - stacked_subordinate_clauses_to_make_abstract_meaning

SUBJECT_VISIBILITY_MODE:
  allowed:
    explicit_name:
      use_when: actor_confusion_possible
    action_connected_omission:
      use_when: same_actor_continues_action
    object_as_grammatical_front:
      use_when: object_position_carries_pressure
    procedure_as_front:
      use_when: world_operation_carries_scene
  prohibited:
    - hiding_subject_until_actor_unclear
    - repeated_name_for_every_sentence
    - self_name_inner_prose

OBJECT_FIRST_RATE:
  definition: how_often_sentence_begins_from_object_space_procedure_instead_of_person_emotion
  default: medium
  raise_when:
    - pressure_axis_should_not_be_reported
    - world_axis_operation_carries_scene
    - cat_animal_object_space_must_drive_text
  lower_when:
    - action_actor_must_be_clear_for_sequence
  prohibited:
    - object_first_as_pretty_description_only

VERB_TIMING:
  allowed:
    immediate_action:
      use: work_operation_and_movement
    delayed_verb_limited:
      use: hesitation_or_spatial_reveal
    omitted_reaction_then_next_action:
      use: avoid_emotion_name
  prohibited:
    - delayed_verb_for_literary_effect_only
    - passive_summary_to_hide_actor

DIALOGUE_PROSE_RATIO:
  allowed_profiles:
    action_heavy:
      prose: high
      dialogue: low_to_medium
      use: object_movement_scene
    exchange_heavy:
      prose: medium
      dialogue: medium_high
      use: verbal_mismatch_or_short_repair
    silence_heavy:
      prose: medium_high
      dialogue: low
      use: pressure_leaks_by_nonanswer
  rule:
    - dialogue_must_not_explain_layer_or_theme
    - prose_after_dialogue_must_change_object_action_distance_or_timing

REPETITION_WITH_DIFFERENCE:
  required_when:
    - route_change_without_saying_changed
    - acceptance_without_saying_accepted
    - relationship_shift_without_relation_summary
  form:
    - repeat_same_procedure
    - change_one_object_position_or_action_order
    - do_not_explain_difference_as_meaning

INTERRUPTION_PATTERN:
  allowed:
    - sound_interrupts_sentence
    - animal_or_work_interrupts_emotional_timing
    - object_requires_practical_action_before_reply
    - someone_answers_wrong_layer_of_question
  prohibited:
    - interruption_used_as_gag_only
    - interruption_later_explained_as_symbol

LINE_BREAK_DENSITY:
  allowed:
    low:
      use: continuous_operation
    medium:
      use: ordinary_scene
    high_limited:
      use: interruption_or_residue_close_only
  prohibited:
    - line_breaks_to_manufacture_poetry
    - one_sentence_paragraphs_for_every_emphasis

STABLE_LOCKS:
  must_not_change_by_variation:
    - ready_condition
    - v2_action_order
    - pressure_axis
    - routing_destination
    - character_embed
    - world_axis_operation
    - forbidden_clean_endings

## 7B-4. FOCUS_ROUTE

FOCUS_ROUTE:
  japanese_alias: 焦点移動
  definition: ordered_route_of_attention_transfer_inside_scene
  required_fields:
    start_point:
      allowed:
        - object
        - body_part
        - spatial_constraint
        - work_procedure
        - sound_or_smell_or_light
    transfer_trigger:
      allowed:
        - object_moves
        - actor_does_not_answer
        - route_gets_blocked
        - sound_interrupts
        - dialogue_changes_next_action
    next_point:
      allowed:
        - hand
        - foot
        - seat
        - plate
        - doorway
        - notebook
        - residue
        - next_actor_action
    return_point:
      allowed:
        - object_position
        - unfinished_procedure
        - recurring_world_operation
        - residue
  prohibited:
    - camera_pan_without_action_change
    - list_of_details_without_pressure
    - focus_shift_to_explain_theme

## 7B-5. PROSE_MOTION_PROFILE_SCHEMA

PROSE_MOTION_PROFILE:
  required_fields:
    scene_vector:
    closing_vector:
    sentence_variation_profile:
    sentence_length_distribution:
    clause_density:
    subject_visibility_mode:
    object_first_rate:
    verb_timing:
    dialogue_prose_ratio:
    repetition_with_difference:
    interruption_pattern:
    focus_route:
    line_break_density:
    stable_locks:

MINIMUM_EPISODE_APPLICATION_VALUE:
  example:
    scene_vector: object_position_vector
    closing_vector: unresolved_residue
    sentence_variation_profile: pressure_build
    sentence_length_distribution: pressure_build
    subject_visibility_mode: object_as_grammatical_front + action_connected_omission
    object_first_rate: medium_high
    verb_timing: immediate_action + omitted_reaction_then_next_action
    repetition_with_difference: required_once
    interruption_pattern: one_small_work_or_sound_interrupt
    focus_route: object -> hand -> route_block -> object_position
    line_break_density: medium

STOP_IF:
  - prose_motion_profile_missing_when_old_構文変奏_field_exists
  - 構文変奏_value_is_あり_only
  - scene_vector_is_abstract_emotional_direction
  - focus_route_has_no_trigger
  - variation_changes_ready_or_v2
  - variation_removes_irregularity

---

# 7C. PACKAGER_SETTING_EFFECT_REFERENCE

PURPOSE:
  ja: 梱包さんが、単話フォルダへ layer 値を設定する時に参照する仮設定表。
  en: provisional effect reference for packager-side episode layer assignment.

IMPORTANT:
  - this_is_not_style_menu
  - this_is_not_mood_selection
  - packager_must_not_choose_by_pretty_word
  - packager_selects_values_from_ready_v2_layer_crosscheck
  - each_setting_must_have_expected_text_effect
  - if_expected_effect_cannot_be_written_as_action_object_distance_procedure_residue_then_STOP

PACKAGER_RULE:
  - choose_one_primary_scene_vector
  - choose_zero_or_one_support_scene_vector
  - choose_one_closing_vector
  - choose_one_sentence_variation_profile
  - choose_focus_route_with_trigger_and_return
  - choose_irregularity_slot_only_if_clean_proof_risk_exists
  - do_not_enable_all_controls
  - do_not_set_everything_high
  - do_not_treat_settings_as_literary_flavor

---

## 7C-1. SCENE_VECTOR_EFFECT_TABLE

SCENE_VECTOR_SETTING:
  object_position_vector:
    choose_when:
      - ready_mentions_position_place_seat_bag_plate_notebook_path
      - v2_has_object_movement_or_object_not_moved
      - pressure_should_be_visible_by_where_object_ends
    expected_text_effect:
      - sentences_begin_more_often_from_object_or_place
      - pressure_appears_as_position_change_or_non_change
      - emotion_summary_is_replaced_by_object_remaining_or_moved
    good_for:
      - cat_cafe_seat_plate_bag_notebook
      - shop_workflow
      - domestic_object_pressure
    risk:
      - object_becomes_pretty_description
      - relation_is_summarized_after_object_action
    pair_with:
      - object_as_grammatical_front
      - immediate_action
      - residue_close_or_object_position_after_scene

  body_action_vector:
    choose_when:
      - pressure_axis_must_not_be_named
      - character_reacts_but_cannot_explain
      - ready_forbids_emotion_name
    expected_text_effect:
      - pressure_leaks_from_hand_foot_sleeve_gaze_delay
      - inner_state_is_not_named
      - action_not_taken_can_carry_weight
    good_for:
      - hesitation
      - refusal
      - restrained_affection
      - age_or_gender_pressure_without_explanation
    risk:
      - body_detail_becomes_symbolic_poetry
      - too_many_micro_actions_make_scene_twitchy
    pair_with:
      - omitted_reaction_then_next_action
      - silence_heavy
      - medium_clause_density

  distance_vector:
    choose_when:
      - ready_mentions_distance_boundary_width_margin_seat_corridor
      - relation_pressure_must_not_be_named
      - world_axis_has_spatial_rule
    expected_text_effect:
      - relation_appears_as_seat_distance_corridor_width_who_makes_room
      - acceptance_or_rejection_is_not_named
      - unchanged_gap_can_remain
    good_for:
      - relationship_without_relation_name
      - shop_or_cafe_spatial_pressure
      - group_boundary
    risk:
      - abstract_distance_sentence_leaks
      - everyone_behaves_too_correctly
    pair_with:
      - object_position_vector_or_body_action_vector
      - focus_route_space_to_hand_to_return_point

  procedure_vector:
    choose_when:
      - world_operation_carries_pressure
      - v2_has_work_order_payment_cleaning_seating_cooking_serving
      - character_is_revealed_by_how_work_continues
    expected_text_effect:
      - routine_order_carries_meaning_without_explaining
      - scene_moves_by_work_steps
      - changed_procedure_shows_change
    good_for:
      - shop_work
      - temple_work
      - household_routine
      - animal_care
    risk:
      - becomes_manual_like
      - work_procedure_explained_as_theme
    pair_with:
      - low_pressure_operation
      - immediate_action
      - low_clause_density

  residue_vector:
    choose_when:
      - closing_must_not_be_clean
      - ready_has_remaining_object_mark_sound_unresolved_arrangement
      - episode_should_leave_aftertaste_without_meaning_sentence
    expected_text_effect:
      - ending_stops_on_leftover_object_mark_sound_width
      - unresolved_part_remains_as_physical_detail
      - quiet_understanding_sentence_is_avoided
    good_for:
      - unresolved_close
      - non_acceptance_close
      - repeated_world_operation_with_difference
    risk:
      - residue_becomes_symbol
      - narrator_explains_what_residue_means
    pair_with:
      - residue_close
      - line_break_density_high_limited
      - repetition_with_difference_required_once

  interruption_vector:
    choose_when:
      - scene_is_too_clean
      - all_parts_are_cooperating_toward_theme
      - emotional_timing_must_be_disrupted
    expected_text_effect:
      - expected_reply_or_understanding_is_delayed
      - life_work_sound_animal_weather_breaks_clean_proof
      - character_handles_practical_thing_before_emotional_resolution
    good_for:
      - anti_ai_like_clean_ending
      - human_noise
      - small_irregularity
    risk:
      - gag_scene
      - interruption_becomes_symbol_or_convenient_cut
    pair_with:
      - interruption_sentence_profile
      - one_small_work_or_sound_interrupt
      - closing_vector_noncooperating_detail_remains

---

## 7C-2. CLOSING_VECTOR_EFFECT_TABLE

CLOSING_VECTOR_SETTING:
  object_position_after_scene:
    effect: close_on_where_object_is_after_scene
    choose_when: object_position_changed_or_failed_to_change
    avoid: relation_or_theme_sentence_after_close

  routine_continues_with_difference:
    effect: close_on_same_work_step_with_one_changed_detail
    choose_when: change_should_be_seen_but_not_announced
    avoid: "前とは違っていた" type summary

  unresolved_residue:
    effect: close_on_remaining_mark_sound_object_width
    choose_when: episode_should_not_resolve_cleanly
    avoid: "それだけで十分だった" type close

  action_not_taken:
    effect: close_on_what_someone_does_not_do
    choose_when: restraint_or_boundary_is_core
    avoid: narrator_explains_why_action_was_not_taken

  repeated_action_with_one_difference:
    effect: close_on_repetition_plus_small_delta
    choose_when: change_must_be_visible_without_named_change
    avoid: explaining_delta_as_growth

  noncooperating_detail_remains:
    effect: one_detail_refuses_to_help_theme_or_clean_resolution
    choose_when: human_texture_or_irregularity_needed
    avoid: turning_detail_into_symbol

---

## 7C-3. SENTENCE_FLOW_EFFECT_TABLE

SENTENCE_LENGTH_DISTRIBUTION_EFFECT:
  low_pressure_operation:
    effect:
      - ordinary_scene_keeps_moving
      - work_order_and_object_position_stay_readable
    choose_when:
      - setup_or_routine
      - procedure_vector_primary
    risk:
      - becomes_flat_if_pressure_axis_missing

  pressure_build:
    effect:
      - short_actions_and_medium_observations_accumulate_pressure
      - emotion_name_is_replaced_by repeated small handling
    choose_when:
      - body_action_vector_or_object_position_vector_primary
      - inner_pressure_must_leak_without_explanation
    risk:
      - too_much_micro_detail_if_no_scene_vector

  interruption:
    effect:
      - clean_conversation_or_clean_emotion_breaks
      - text_can_cut_before_summary
    choose_when:
      - interruption_vector_primary_or_irregularity_slot_enabled
    risk:
      - comic_cut_or_random_noise

  residue_close:
    effect:
      - final_paragraph_tightens
      - remaining_detail_stays_without_explanation
    choose_when:
      - closing_vector_is_residue_or_action_not_taken
    risk:
      - becomes_poetic_one_sentence_paragraphs

CLAUSE_DENSITY_EFFECT:
  low:
    effect: action_sequence_is_clear
    choose_when: work_procedure_or_movement_chain
    risk: pressure_may_be_too_thin_if_no_object_or_body_detail

  medium:
    effect: object_position_and_reaction_can_coexist
    choose_when: most_ordinary_scenes
    risk: default_safe_but_can_be_AI_clean_if_route_missing

  high_limited:
    effect: spatial_relation_can_be_precise
    choose_when: seat_corridor_distance_route_block_needs_precision
    risk: abstract_explanation_or_overpacked_sentence

SUBJECT_VISIBILITY_EFFECT:
  explicit_name:
    effect: actor_is_clear
    choose_when: multiple_actors_or_action_order_can_confuse
    risk: repeated_name_rhythm

  action_connected_omission:
    effect: same_actor_flow_smooths
    choose_when: same_actor_continues_work_or_handling
    risk: actor_confusion_if_scene_has_many_people

  object_as_grammatical_front:
    effect: object_or_place_carries_pressure
    choose_when: object_position_vector_or_residue_vector
    risk: pretty_description_if_action_not_connected

  procedure_as_front:
    effect: world_operation_drives_scene
    choose_when: procedure_vector
    risk: manual_like_if_no_pressure_axis

OBJECT_FIRST_RATE_EFFECT:
  low:
    effect: actor_action_is_primary
    choose_when: action_order_actor_clarity_more_important_than_object_pressure
    risk: emotion_or_actor_explanation_may_leak

  medium:
    effect: balanced_scene
    choose_when: no_strong_object_pressure
    risk: generic_default_if_not_reasoned

  medium_high:
    effect: objects_spaces_procedures_pull_text_forward
    choose_when: cat_shop_cafe_temple_household_operation_carries_pressure
    risk: object_listing

  high_limited:
    effect: strong object-driven scene
    choose_when: episode_core_is_place_or_object_arrangement
    risk: human_reaction_disappears

VERB_TIMING_EFFECT:
  immediate_action:
    effect: movement_and_work_are_not_delayed
    choose_when: procedure_or_object_movement_scene
    risk: may_feel_dry_without_leak_axis

  delayed_verb_limited:
    effect: hesitation_or_spatial_reveal_has_slight_delay
    choose_when: pressure_needs_small_hold
    risk: literary_effect_only

  omitted_reaction_then_next_action:
    effect: avoids_emotion_name_by_skipping_to_next_handling
    choose_when: ready_forbids_feeling_words
    risk: reader_may_miss_pressure_if_leak_axis_weak

DIALOGUE_PROSE_RATIO_EFFECT:
  action_heavy:
    effect: prose_actions_objects_drive_scene
    choose_when: v2_has_much movement_or_work
    risk: dialogue_voice_thins

  exchange_heavy:
    effect: mismatch_and_short_repair_can_surface
    choose_when: conversation_is_action
    risk: characters_explain_theme

  silence_heavy:
    effect: nonanswer_delay_object_handling_carry_pressure
    choose_when: pressure_should_not_be_spoken
    risk: clean_silence_ai_close_if_no_irregularity

REPETITION_WITH_DIFFERENCE_EFFECT:
  none:
    effect: no_repeated_procedure
    choose_when: scene_has_no_change_to_show_by_repetition
    risk: change_may_require_summary

  optional_once:
    effect: one_echo_if_natural
    choose_when: small_delta_helpful_but_not_core
    risk: easy_to_skip

  required_once:
    effect: change_or_nonchange_is_visible_without_sentence_summary
    choose_when: acceptance_rejection_shift_should_not_be_named
    risk: if_difference_too_clean_it_becomes_symbol

  required_multi_light:
    effect: routine_theme_through_repeated_variation
    choose_when: entire_episode_about_routine_pressure
    risk: pattern_becomes_too_obvious

INTERRUPTION_PATTERN_EFFECT:
  none:
    effect: scene_runs_without_external_break
    choose_when: clean_proof_risk_low
    risk: may_be_too_smooth

  one_small_work_or_sound_interrupt:
    effect: human_life_noise_breaks_clean_timing
    choose_when: scene_too_correct_or_emotional
    risk: random_noise_if_no_practical_effect

  wrong_layer_answer:
    effect: answer_misses_question_but_reveals_pressure
    choose_when: character_should_not_explain_feeling
    risk: quirky_for_quirk

  action_before_reply:
    effect: practical_action_precedes_emotional_response
    choose_when: world_work_or_object_pressure_primary
    risk: can_hide_required_dialogue

LINE_BREAK_DENSITY_EFFECT:
  low:
    effect: continuous_operation
    choose_when: procedure_or_work_scene
    risk: dense_if_scene_has_many_spatial_details

  medium:
    effect: ordinary_readability
    choose_when: default
    risk: no_strong_effect

  high_limited:
    effect: interruption_or_residue_can_stand
    choose_when: closing_or_break_needs_space
    risk: poetry_manufacture

---

## 7C-4. FOCUS_ROUTE_EFFECT_TABLE

FOCUS_ROUTE_PRESETS:
  object_to_hand_to_route_to_object:
    route: object -> hand -> spatial_constraint -> object_position
    effect: object_pressure_and_body_handling_connect
    choose_when:
      - object_position_vector
      - distance_vector
    risk: decorative_if_object_does_not_move_or_block

  procedure_to_actor_to_object_to_procedure:
    route: work_step -> actor_action -> object_position -> next_work_step
    effect: world_operation_carries_pressure
    choose_when:
      - procedure_vector
    risk: manual_if_pressure_axis_missing

  sound_to_nonanswer_to_action_to_residue:
    route: sound -> nonanswer -> practical_action -> residue
    effect: interruption_prevents_clean_emotional_close
    choose_when:
      - interruption_vector
      - silence_heavy
    risk: random_sound_if_not_connected_to_next_action

  body_to_object_to_distance_to_return:
    route: hand_or_foot -> held_object -> seat_or_corridor_gap -> return_point
    effect: inner_pressure_leaks_through_body_and_distance
    choose_when:
      - body_action_vector
      - distance_vector
    risk: micro_action_overload

  repeated_procedure_to_one_difference_to_residue:
    route: same_step -> one_changed_detail -> routine_continues -> residue
    effect: change_without_named_change
    choose_when:
      - routine_continues_with_difference
      - repeated_action_with_one_difference
    risk: too_clean_if_difference_is_obvious

---

## 7C-5. PACKAGER_SELECTION_FLOW

PACKAGER_SELECTION_FLOW:
  step_1_read_ready:
    extract:
      - core_condition
      - forbidden_line
      - thinning_risk
      - return_point
      - must_not_be_named
  step_2_read_v2:
    extract:
      - concrete_actions
      - objects
      - positions
      - procedure_steps
      - dialogue_actions
      - scene_beats
  step_3_select_scene_vector:
    rule:
      - choose_vector_from_most_concrete_carrier
      - if_no_concrete_carrier_then_STOP
  step_4_select_closing_vector:
    rule:
      - use_ready_return_point_or_v2_final_placement
      - do_not_choose_meaning_close
  step_5_select_pressure_and_leak:
    rule:
      - pressure_axis_from_character_or_episode_core
      - leak_axis_from_body_object_distance_speech_gap
      - do_not_use_emotion_name_as_leak
  step_6_select_sentence_flow:
    rule:
      - choose_profile_by_scene_function
      - not_by_mood
  step_7_select_irregularity:
    rule:
      - add_only_if_scene_too_clean_or_all_parts_cooperate
      - irregularity_must_physically_affect_scene
      - do_not_symbolize_it
  step_8_write_expected_effect:
    required_format:
      - "この設定により本文では何が増えるか"
      - "何を書かなくなるか"
      - "どこで閉じるか"
  step_9_stop_check:
    STOP_IF:
      - expected_effect_is_abstract
      - setting_chosen_by_mood_only
      - ready_condition_has_no_v2_action
      - v2_action_has_no_layer_route
      - closing_is_meaning_summary
      - variation_changes_story_condition

---

# 7D. PACKAGER_PROVISIONAL_PRESET_LIBRARY

PURPOSE:
  ja: 梱包さんが仮設定を選びやすくするための初期プリセット。作品ごとの正解ではない。単話ready/V2に照らして選択・修正する。

PRESET_RULE:
  - preset_is_starting_point_not_final_answer
  - packager_must_adjust_to_episode_ready_v2
  - no_preset_may_override_character_embed_or_world_axis
  - preset_must_output_expected_effect_summary

---

## PRESET_A_OBJECT_OPERATION_PRESSURE

name: object_operation_pressure
japanese_alias: 物理運用で圧を出す
use_when:
  - shop_cafe_temple_household_work_or_animal_operation_carries_scene
  - pressure_should_not_be_explained
  - ready_has_object_place_route_procedure
settings:
  scene_vector: procedure_vector + object_position_vector
  closing_vector: routine_continues_with_difference
  sentence_length_distribution: low_pressure_operation
  clause_density: low_to_medium
  subject_visibility_mode: procedure_as_front + action_connected_omission
  object_first_rate: medium_high
  verb_timing: immediate_action
  dialogue_prose_ratio: action_heavy
  repetition_with_difference: optional_once_or_required_once
  interruption_pattern: none_or_one_small_work_or_sound_interrupt
  focus_route: procedure -> actor_action -> object_position -> next_work_step
  line_break_density: low_to_medium
expected_effect:
  - text_moves_by_work_and_object_handling
  - meaning_explanation_decreases
  - change_appears_as_changed_routine_or_object_position
risk:
  - manual_like_scene
  - object_listing_without_pressure
packager_check:
  - pressure_axis_must_be_named_in_layer_application
  - final_action_must_have_return_or_residue

## PRESET_B_BODY_LEAK_PRESSURE

name: body_leak_pressure
japanese_alias: 内圧を身体で漏らす
use_when:
  - character_pressure_exists_but_inner_monologue_is_forbidden
  - ready_forbids_emotion_name
  - scene_needs_restraint
settings:
  scene_vector: body_action_vector
  closing_vector: action_not_taken_or_unresolved_residue
  sentence_length_distribution: pressure_build
  clause_density: medium
  subject_visibility_mode: action_connected_omission
  object_first_rate: medium
  verb_timing: omitted_reaction_then_next_action
  dialogue_prose_ratio: silence_heavy
  repetition_with_difference: optional_once
  interruption_pattern: action_before_reply
  focus_route: body_part -> held_object -> next_action -> return_point
  line_break_density: medium
expected_effect:
  - emotion_words_decrease
  - hand_foot_gaze_delay_carry_pressure
  - spoken_explanation_decreases
risk:
  - micro_action_overload
  - pressure_becomes_unclear
packager_check:
  - choose_specific_body_or_object_leak
  - do_not_allow_generic_gaze_or_silence_only

## PRESET_C_DISTANCE_BOUNDARY

name: distance_boundary
japanese_alias: 距離と境界で関係を出す
use_when:
  - relationship_pressure_must_not_be_named
  - scene_has_seat_corridor_doorway_counter_gap
  - ready_mentions_boundary_or_not_fitting
settings:
  scene_vector: distance_vector + object_position_vector
  closing_vector: object_position_after_scene_or_unresolved_residue
  sentence_length_distribution: pressure_build
  clause_density: high_limited_when_needed
  subject_visibility_mode: object_as_grammatical_front + explicit_name_when_confusing
  object_first_rate: medium_high
  verb_timing: immediate_action
  dialogue_prose_ratio: action_heavy_or_silence_heavy
  repetition_with_difference: required_once
  interruption_pattern: none_or_one_small_work_or_sound_interrupt
  focus_route: object -> hand -> route_block -> object_position
  line_break_density: medium
expected_effect:
  - relation_is_shown_by_space_and_route
  - acceptance_or_rejection_is_not_named
  - unchanged_gap_can_remain
risk:
  - abstract_distance_sentence_leaks
  - spatial_description_gets_overprecise
packager_check:
  - specify_actual_distance_carrier
  - forbid_relation_summary_sentence

## PRESET_D_CONVERSATION_MISMATCH

name: conversation_mismatch
japanese_alias: 会話のズレで圧を出す
use_when:
  - dialogue_is_required_but_emotional_explanation_forbidden
  - character_should_answer_wrong_layer
  - scene_needs_human_irregularity
settings:
  scene_vector: interruption_vector + body_action_vector
  closing_vector: action_not_taken_or_noncooperating_detail_remains
  sentence_length_distribution: interruption
  clause_density: medium
  subject_visibility_mode: explicit_name + action_connected_omission
  object_first_rate: medium
  verb_timing: omitted_reaction_then_next_action
  dialogue_prose_ratio: exchange_heavy
  repetition_with_difference: optional_once
  interruption_pattern: wrong_layer_answer
  focus_route: question -> wrong_layer_answer -> practical_action -> residue
  line_break_density: medium_to_high_limited
expected_effect:
  - conversation_does_not_resolve_cleanly
  - character_pressure_leaks_through_misaligned_answer
  - theme_explanation_decreases
risk:
  - quirky_characterization
  - comedy_cut
packager_check:
  - mismatch_must_change_next_action
  - do_not_explain_what_answer_meant

## PRESET_E_RESIDUE_CLOSE

name: residue_close
japanese_alias: 意味ではなく残留で閉じる
use_when:
  - episode_should_not_cleanly_resolve
  - ready_has_return_point_or_remaining_object
  - AI_clean_ending_risk_high
settings:
  scene_vector: residue_vector
  closing_vector: unresolved_residue_or_noncooperating_detail_remains
  sentence_length_distribution: residue_close
  clause_density: low_to_medium
  subject_visibility_mode: object_as_grammatical_front
  object_first_rate: high_limited
  verb_timing: immediate_action_or_omitted_reaction_then_next_action
  dialogue_prose_ratio: silence_heavy
  repetition_with_difference: required_once
  interruption_pattern: none_or_one_small_work_or_sound_interrupt
  focus_route: repeated_procedure -> one_changed_detail -> residue
  line_break_density: high_limited
expected_effect:
  - final_sentence_stops_on_remaining_detail
  - enough_sentence_and_understanding_sentence_disappear
  - aftertaste_is_physical_not_explanatory
risk:
  - symbolized_residue
  - fake_poetic_close
packager_check:
  - last_detail_must_have_appeared_or_be_prepared
  - no_explanation_after_residue

## PRESET_F_CLEAN_PROOF_BREAKER

name: clean_proof_breaker
japanese_alias: 清潔な証明を壊す
use_when:
  - all_actions_cooperate_too_well
  - scene_feels_AI_like_or_morally_tidy
  - ready_requires_irregularity_or_noncooperation
settings:
  scene_vector: interruption_vector
  closing_vector: noncooperating_detail_remains
  sentence_length_distribution: interruption
  clause_density: low_to_medium
  subject_visibility_mode: explicit_name_when_needed
  object_first_rate: medium
  verb_timing: immediate_action
  dialogue_prose_ratio: action_heavy_or_exchange_heavy
  repetition_with_difference: none_or_optional_once
  interruption_pattern: one_small_work_or_sound_interrupt
  focus_route: sound_or_work_interrupt -> practical_action -> interrupted_reply_or_residue
  line_break_density: medium_to_high_limited
expected_effect:
  - clean_emotional_timing_is_disrupted
  - practical_life_noise_enters
  - not_everything_serves_theme
risk:
  - random_noise
  - gag_or_symbol
packager_check:
  - irregularity_must_affect_action_order
  - do_not_recover_irregularity_as_meaning

---

# 7E. PACKAGER_LAYER_SETTING_SHEET_SCHEMA

PACKAGER_LAYER_SETTING_SHEET:
  episode_id:
  source_ready:
  source_v2:
  chosen_preset:
  pressure_axis:
  leak_axis:
  scene_vector:
  support_scene_vector:
  closing_vector:
  sentence_length_distribution:
  clause_density:
  subject_visibility_mode:
  object_first_rate:
  verb_timing:
  dialogue_prose_ratio:
  repetition_with_difference:
  interruption_pattern:
  focus_route:
  line_break_density:
  irregularity_slot:
  expected_effect_summary:
    increases_in_text:
    decreases_or_forbids_in_text:
    closing_destination:
    risk_to_watch:
  STOP_IF:
    - setting_chosen_without_ready_v2_basis
    - expected_effect_summary_missing
    - closing_destination_is_meaning_summary
    - irregularity_has_no_physical_effect
    - pressure_axis_has_no_leak_axis

MINIMUM_PACKAGER_OUTPUT_EXAMPLE:
  episode_id: "episode_001"
  chosen_preset: object_operation_pressure
  pressure_axis: "男客の置き場不安"
  leak_axis: "鞄・靴先・袖"
  scene_vector: "object_position_vector"
  support_scene_vector: "distance_vector"
  closing_vector: "unresolved_residue"
  sentence_length_distribution: "pressure_build"
  subject_visibility_mode: "object_as_grammatical_front + action_connected_omission"
  object_first_rate: "medium_high"
  verb_timing: "immediate_action + omitted_reaction_then_next_action"
  dialogue_prose_ratio: "silence_heavy"
  repetition_with_difference: "required_once"
  interruption_pattern: "one_small_work_or_sound_interrupt"
  focus_route: "object -> hand -> route_block -> object_position"
  line_break_density: "medium"
  irregularity_slot: "袖の毛を先に気にする。意味回収しない。"
  expected_effect_summary:
    increases_in_text:
      - "鞄・椅子・通路・靴先の位置変化"
      - "返答前の実務動作"
    decreases_or_forbids_in_text:
      - "安心した"
      - "店を受け入れた"
      - "人間だけの場所ではない"
    closing_destination:
      - "帳面または通路に残った物理的な残り"
    risk_to_watch:
      - "客の変化を説明してしまう"
      - "猫を象徴化する"

---

# 8. IRREGULARITY_SLOT

IRREGULARITY_SLOT:
  japanese_alias: イレギュラー枠
  required_by_default: true
  episode_count_default: 1_to_3
  purpose:
    - prevent_scene_from_becoming_clean_proof
    - prevent_everything_from_cooperating_with_theme
    - keep_life_timing_object_or_person_from_becoming_symbol_only
  rules:
    - small_not_big_event
    - physically_or_behaviorally_present
    - not_explained_as_theme
    - not_fully_recovered_as_symbol
    - does_not_break_ready_or_v2

IRREGULARITY_TYPES:
  action_irregularity:
    example: expected_emotional_response_replaced_by_small_practical_action
  object_irregularity:
    example: object_does_not_cleanly_return_or_clear
  dialogue_irregularity:
    example: answer_misses_question_and_handles_object_or_procedure
  timing_irregularity:
    example: good_moment_interrupted_by_sound_arrival_animal_or_work
  recognition_irregularity:
    example: character_remembers_inconvenience_not_kindness
  residue_irregularity:
    example: unresolved_width_mark_noise_or_object_remains

PROHIBITED_IRREGULARITY_USE:
  - random_gag
  - new_big_plot
  - explanatory_symbol
  - final_meaning_collection
  - contradiction_to_ready_condition

---

# 9. CHARACTER_DESIGN_EMBED_SCHEMA

CHARACTER_LAYER_EMBED:
  required_sections:
    pressure_candidates:
      description: who_or_what_can_be_PRESSURE_AXIS_for_this_character_or_around_this_character
    notice_bias:
      description: what_this_character_notices_before_faces_or_words
    body_leak_patterns:
      description: how_inner_pressure_leaks_without_emotion_name
    speech_gap_patterns:
      description: how_this_character_avoids_or_misses_direct_answer
    object_handles:
      description: objects_or_positions_that_carry_this_character_pressure
    avoidance_actions:
      description: actions_not_taken_when_pressure_exists
    normal_disguise:
      description: how_pressure_hides_inside_usual_routine
    public_private_boundary:
      description: what_this_character_does_not_say_outside
    age_gender_output_code:
      description: body_speed_distance_social_reading_speech_limit_not_stereotype

CHARACTER_EMBED_RULE:
  - stable_character_output_must_be_stored_here_not_recreated_each_episode
  - episode_layer_application_selects_from_character_embed
  - if_needed_channel_missing_then_backlog_to_designer_core

---

# 10. WORLD_AXIS_EMBED_SCHEMA

WORLD_LAYER_EMBED:
  required_sections:
    physical_routing_channels:
      description: spaces_objects_routes_that_convert_pressure_to_action
    ordinary_operation_rules:
      description: what_people_normally_do_without_explanation
    social_procedures:
      description: payment_seating_greeting_cleaning_waiting_work_rules
    spatial_constraints:
      description: widths_heights_doors_chairs_paths_counters_windows
    recurring_objects:
      description: objects_available_as_pressure_carriers
    nonhuman_agents:
      description: animals_weather_machines_noise_that_move_without_theme_obedience
    unresolved_residue_types:
      description: marks_sounds_objects_arrangements_that_can_remain
    irregularity_sources:
      description: ordinary_sources_of_noncooperation

WORLD_EMBED_RULE:
  - stable_world_operation_must_be_stored_here_not_recreated_each_episode
  - episode_v2_actions_should_use_world_channels
  - layer_routing_should_prefer_existing_world_channels
  - if_world_channel_missing_then_backlog_not_invent

---

# 11. EPISODE_LAYER_APPLICATION_SCHEMA

EPISODE_LAYER_APPLICATION:
  fields:
    surface_axis:
      value: objective_surface
      old_alias: 主=客観視
    pressure_axis:
      value: selected_true_center_or_pressure_source
      old_alias: 副=本来主
      required: true
    pressure_source_basis:
      value: selected_from_character_or_world_or_ready_v2
    prose_vocabulary_bias:
      value: what_objects_words_actions_are_selected
    prose_temperature:
      value: how_much_pressure_is_allowed_on_surface
    observation_distance:
      allowed_values:
        - objective_surface
        - objective_near
        - half_inside
    inner_output_channel:
      value: body_object_gap_silence_action_not_taken
    routing_destinations:
      value: selected_DESTINATION_RULE_items
    irregularity_slot:
      value: one_to_three_noncooperating_details
    description_entry:
      value: object_space_sound_smell_light_body
    explanation_limit:
      value: direct_explanation_limit_for_this_episode
    prose_motion_profile:
      value: selected_SCENE_VECTOR_and_SENTENCE_VARIATION_PROFILE
    focus_route:
      value: start_point_transfer_trigger_next_point_return_point
    forbidden_clean_endings:
      value: episode_specific_ai_like_destination_bans
    embed_source_references:
      value:
        - character_design_item
        - world_axis_item
        - band_profile_item
    backlog_items:
      value: missing_or_conflicting_stable_layer_items

EPISODE_LAYER_RULE:
  - do_not_define_whole_character_again
  - do_not_define_world_operation_again
  - select_and_apply_existing_embedded_values
  - supplement_only_episode_specific_values
  - stable_new_discovery_goes_to_backlog

---

# 12. CROSSCHECK_COLUMNS

CROSSCHECK_REQUIRED_COLUMNS:
  - ready_condition
  - v2_action_or_scene
  - layer_pressure_axis
  - routing_destination
  - prose_motion_profile
  - focus_route
  - irregularity_if_any
  - forbidden_ai_like_destination
  - embedded_source_character_or_world
  - status

STATUS_VALUES:
  - ok
  - missing
  - conflict
  - backlog_needed
  - stop

CROSSCHECK_RULE:
  if_ready_condition_has_no_v2_action: STOP
  if_v2_action_has_no_layer_route_when_pressure_exists: STOP_OR_BACKLOG
  if_layer_route_requires_missing_world_or_character_channel: BACKLOG_OR_STOP
  if_irregularity_is_meaning_recovered: REVISE_OR_STOP

---

# 13. FROZEN_EXTRACTION

FROZEN_LAYER_MINIMUM:
  include:
    - surface_axis
    - pressure_axis
    - observation_distance
    - inner_output_channel
    - routing_destinations
    - irregularity_slot
    - prose_motion_profile
    - focus_route
    - explanation_limit
    - forbidden_clean_endings
  exclude:
    - full_layer_runtime
    - old_theory_text
    - character_design_full_text
    - world_axis_full_text

FROZEN_RULE:
  frozen_layer_is_episode_application_not_layer_redefinition: true
  frozen_must_not_replace_required_reading_of_ready_v2_crosscheck: true

---

# 14. EXECUTION_QUEUE_USE

EXECUTION_QUEUE_LAYER_FIELDS_PER_SCENE:
  - scene_goal
  - ready_conditions_in_this_scene
  - v2_actions_in_this_scene
  - pressure_axis_for_this_scene
  - routing_destination_for_pressure
  - leak_channel
  - irregularity_detail
  - prose_motion_profile_for_this_scene
  - focus_route_for_this_scene
  - forbidden_sentence_patterns
  - target_length_range

SCENE_AFTER_OUTPUT_CHECK:
  required:
    - ready_condition_recovered
    - v2_action_recovered
    - layer_route_applied
    - pressure_not_reported_as_emotion_name
    - irregularity_not_meaning_recovered
    - prose_motion_profile_followed
    - focus_route_has_trigger_and_return
    - forbidden_clean_ending_not_used

---

# 15. BACKLOG_POLICY

BACKLOG_TO_DESIGNER_CORE_WHEN:
  - pressure_axis_missing_repeatedly
  - character_notice_bias_missing
  - world_routing_channel_missing
  - band_temperature_conflict
  - irregularity_source_repeated_or_exhausted
  - AI_like_destination_recurs_across_episodes
  - episode_layer_requires_stable_character_or_world_update

BACKLOG_ITEM_SCHEMA:
  fields:
    source_episode:
    issue_type:
    affected_axis:
    current_temporary_handling:
    reason_not_to_update_locally:
    proposed_embed_destination:
      allowed_values:
        - character_design
        - world_axis
        - work_profile
        - band_profile
        - layer_runtime_revision
    required_designer_decision:

LOCAL_PATCH_ALLOWED:
  - episode_specific_pressure_selection
  - episode_specific_leak_channel
  - episode_specific_irregularity
  - episode_specific_explanation_limit

LOCAL_PATCH_NOT_ALLOWED:
  - permanent_character_behavior_change
  - permanent_world_operation_change
  - permanent_layer_runtime_redefinition
  - replacing_surface_axis_with_pov
  - making_pressure_axis_optional

---

# 16. STOP_CONDITIONS

STOP_IF:
  - PRESSURE_AXIS_missing
  - pressure_axis_treated_as_optional
  - layer_used_as_theme_sentence
  - layer_rewrites_ready_or_v2
  - episode_layer_conflicts_with_ready_or_v2
  - needed_character_embed_missing_and_cannot_be_episode_specific
  - needed_world_channel_missing_and_cannot_be_episode_specific
  - routing_destination_is_abstract_summary_only
  - irregularity_slot_absent_without_explicit_reason
  - prose_motion_profile_missing_or_left_as_構文変奏あり
  - scene_vector_left_as_abstract_direction
  - focus_route_missing_trigger_or_return
  - irregularity_is_recovered_as_symbol_or_moral
  - frozen_layer_missing_required_minimum
  - writer_attempts_to_use_old_main_sub_definitions

STOP_OUTPUT:
  required:
    - stop_reason
    - missing_or_conflicting_item
    - required_owner
    - suggested_backlog_destination
  prohibited:
    - provisional_prose
    - silent_compromise
    - new_story_idea_to_cover_gap

---

# 17. MINIMUM_WRITER_VISIBLE_FORM

WRITER_VISIBLE_LAYER_MINIMUM:
  note: show_to_writer_only_after_pack_cutout_crosscheck
  format:
    surface_axis: objective_surface
    pressure_axis: selected_pressure_source
    observation_distance: objective_surface_or_objective_near_or_half_inside
    leak_channel: body_object_gap_silence_action_not_taken
    routing_destination:
      - object_position
      - body_action
      - distance
      - procedure_change
      - residue
    irregularity_slot:
      - small_noncooperating_detail
    prose_motion_profile:
      scene_vector: object_position_or_body_action_or_distance_or_procedure_or_residue
      sentence_variation_profile: specify_length_subject_object_verb_dialogue_repetition_interrupt
      focus_route: start_trigger_next_return
    forbidden:
      - emotion_name_first
      - relation_summary
      - meaning_summary
      - clean_acceptance_ending

WRITER_RULE:
  - writer_must_not_see_full_layer_theory_unless_needed
  - writer_uses_episode_layer_application_and_execution_queue
  - writer_does_not_update_character_or_world_embed
  - writer_STOPS_if_required_layer_field_missing

---

# 18. VERSION_NOTE

V27_CHANGE_FROM_V26:
  - added_packager_setting_effect_reference
  - added_scene_vector_effect_table
  - added_sentence_flow_effect_table
  - added_focus_route_effect_table
  - added_packager_selection_flow
  - added_provisional_preset_library
  - added_packager_layer_setting_sheet_schema
  - clarified_that_legacy_hensou_is_not_a_single_setting

V26_CHANGE_FROM_V25:
  - 主/副_are_no_longer_primary_runtime_terms
  - SURFACE_AXIS/PRESSURE_AXIS/ROUTING_AXIS/LEAK_AXIS/EMBED_AXIS_are_primary
  - added_character_design_embedding_schema
  - added_world_axis_embedding_schema
  - added_designer_holding_rule
  - added_crosscheck_embedded_source_column
  - clarified_episode_layer_application_selects_from_embedded_values
  - clarified_backlog_destination_for_stable_updates
  - decomposed_legacy_prose_motion_fields
  - replaced_koubun_hensou_as_single_setting_with_sentence_variation_profile
  - added_scene_vector_focus_route_and_prose_motion_profile
  - added_writer_visible_variation_minimum



---

# APPENDIX_A_ALL_ITEMS_MEANING_REFERENCE

STATUS: complete_candidate_reference
SCOPE: layer_runtime_v27 系の全主要項目について、梱包さん・設計さん・執筆さんが誤読しないための意味辞書。
RULE: これは文体メニューではない。各項目は本文で起きる処理を指定するための操作項目である。
LOAD_POLICY:
  - designer_can_read_full
  - packager_should_read_full_when_setting_layer
  - writer_should_receive_only_minimum_extracted_form
  - do_not_show_full_reference_to_beginner_user

---

# 0. GLOBAL_RULE

レイヤーは物語条件源ではない。  
レイヤーは本文の「見え方・拾い方・漏らし方・閉じ方」を決める処理表である。

梱包さんは以下の順で判断する。

1. ready を読む。
2. V2 を読む。
3. ready条件をV2動作でどう回収するか見る。
4. その回収をどのレイヤー値で本文化するか決める。
5. 期待される本文効果を必ず書く。
6. 効果が抽象語しか書けない場合はSTOPする。

---

# 1. AXIS_FIELDS

## 1-1. SURFACE_AXIS

旧alias:
  - 主
  - 表面観測

意味:
  本文表面の観測方式。誰の一人称に近いかではなく、本文がどこまで内面へ入らずに見せるかを決める。

標準値:
  - objective_surface
  - objective_near
  - half_step_inside_limited

選ぶ条件:
  objective_surface:
    - 場の物理運用を見せたい
    - 感情名を避けたい
    - 複数人物を同時に扱う
  objective_near:
    - 圧源人物の気になる物を多めに拾いたい
    - 内面説明は避けたい
  half_step_inside_limited:
    - 判断の揺れを少しだけ本文に出したい
    - ただし感情名や長い内面は禁止したい

本文効果:
  - 内面説明が減る。
  - 物・手・足・視線・位置が増える。
  - 語りが人物の頭の中に潜りすぎない。

事故:
  - objective_surface だけだと無色カメラになる。
  - half_step_inside_limited を広げると内面説明になる。

梱包さん設定例:
  surface_axis: objective_near
  expected_effect: 男客の内面は言わず、鞄・靴先・袖を多めに拾う。

---

## 1-2. PRESSURE_AXIS

旧alias:
  - 副
  - 本来主
  - 圧源

意味:
  本文が何に反応して、何を多めに拾うかを決める圧の出所。補助役ではない。

値の型:
  - character_pressure
  - relationship_pressure
  - world_operation_pressure
  - object_pressure
  - place_pressure
  - unresolved_pressure

選ぶ条件:
  character_pressure:
    - この話の圧が人物にある
  relationship_pressure:
    - 関係名は言えないが距離・境界が効く
  world_operation_pressure:
    - 店・家・寺・職場などの手順が圧を持つ
  object_pressure:
    - 鞄、皿、帳面、椅子などの扱いが話を運ぶ
  place_pressure:
    - 席、戸口、通路、縁側などの位置が話を運ぶ
  unresolved_pressure:
    - 解決しきらない残りが話の芯になる

本文効果:
  - 何を多く拾うかが決まる。
  - 無色客観を避ける。
  - 感情名ではなく圧の媒体が本文に出る。

事故:
  - pressure_axis がないと本文が説明か無色になる。
  - pressure_axis を人物名だけにすると内面説明に逃げる。

梱包さん設定例:
  pressure_axis: world_operation_pressure + object_pressure
  expected_effect: 店の手順と皿の位置で圧を出し、店の意味は説明しない。

---

## 1-3. ROUTING_AXIS

意味:
  感情・関係・変化・余韻などを、本文で何に変換するかを決める行き先。

代表ルート:
  emotion_to_body_or_object:
    意味: 感情名を手・足・持ち替え・視線・返答遅れへ逃がす。
  relation_to_distance_or_procedure:
    意味: 関係を席・通路・手順・距離へ逃がす。
  change_to_repetition_with_difference:
    意味: 変化を同じ手順の差分へ逃がす。
  aftertaste_to_residue:
    意味: 余韻を残留物・残った音・片付かないものへ逃がす。
  refusal_to_action_not_taken:
    意味: 拒否や境界を「しなかった動作」へ逃がす。

本文効果:
  - AI的な意味整理を減らす。
  - 抽象文が物理運用へ変わる。
  - 締めが説明ではなく配置になる。

事故:
  - routing がないと禁止語を避けても別の綺麗語で意味回収する。
  - routing が抽象だと本文が変わらない。

梱包さん設定例:
  routing_axis:
    emotion: body_action_vector
    relation: distance_vector
    aftertaste: residue_vector

---

## 1-4. LEAK_AXIS

意味:
  圧源の内側を、何を通じて本文表面へ漏らすか。

代表値:
  - hand
  - foot
  - gaze
  - sleeve
  - held_object
  - seat_choice
  - door_position
  - reply_delay
  - nonanswer
  - object_not_moved
  - work_step_changed
  - repeated_action_delta

本文効果:
  - 内面説明を減らす。
  - 読者が追える具体的な漏れが出る。
  - 圧源が本文に残る。

事故:
  - gaze だけに頼ると薄い。
  - silence だけに頼るとAI的な余韻になる。
  - leak_axis が多すぎると挙動不審になる。

梱包さん設定例:
  leak_axis: bag + foot + reply_delay
  expected_effect: 男客の迷いを鞄の置けなさ、靴先、返答前の遅れで出す。

---

## 1-5. EMBED_AXIS

意味:
  レイヤー値をどこへ恒久的に埋めるか。

埋込先:
  character_design:
    - 安定した人物由来の語彙
    - 身体反応
    - 判断癖
    - 触る物
    - 話し始め方
    - 内圧変換
  world_axis:
    - 店・場所・共同体の手順
    - 席や通路の法則
    - 動物や道具の扱い
    - 生活音
    - どかさない/動かす対象
  work_profile:
    - 作品全体の地の文初期値
    - 作品共通の説明量
    - 禁止群
    - 標準のsurface/routing
  band_profile:
    - 帯ごとの温度
    - よく出る圧源
    - 締め方の偏り
    - 反復の許容量
  episode_layer:
    - 今回だけの適用値
    - 今回だけの漏れ口
    - 今回だけのイレギュラー

本文効果:
  - 毎話のレイヤー設定が軽くなる。
  - キャラや世界の安定癖として本文に出る。
  - 単話が管理表化しにくくなる。

事故:
  - 単話で恒久値を勝手に変える。
  - キャラ由来と世界由来を混ぜる。
  - 埋込済み値を毎話の指示として再説明する。

梱包さん設定例:
  embed_axis:
    character_design: すずは顔より手元と足元を先に拾う。
    world_axis: 猫はどかさず人間側が席や皿を動かす。
    episode_layer: 今回は男客の鞄を漏れ口にする。

---

# 2. PROSE_BASE_FIELDS

## 2-1. GROUND_TEXT_LEXICON

意味:
  地の文で使いやすい語彙の方向。美文語ではなく、何を自然に拾うか。

値候補:
  - object_plain
  - work_plain
  - body_plain
  - spatial_plain
  - residue_plain
  - child_near_plain
  - elderly_plain
  - urban_plain
  - rural_plain

本文効果:
  - 拾う名詞と動詞が安定する。
  - 世界軸と人物圧が本文語彙に反映される。

事故:
  - 語彙表をそのまま連呼する。
  - 「淡い」「静か」など雰囲気語へ逃げる。

設定例:
  ground_text_lexicon: object_plain + work_plain

## 2-2. GROUND_TEXT_TEMPERATURE

意味:
  地の文の温度。熱い/冷たいではなく、どれだけ本文が反応を表面化させるか。

値候補:
  - low_contained
  - low_with_pressure
  - medium_working
  - medium_warm_limited
  - high_under_surface

本文効果:
  - 同じ動作の書き方の圧が変わる。
  - 高温でも叫ばず、低温でも無色にならない。

事故:
  - low が無色になる。
  - high が感情名や泣きに化ける。

設定例:
  ground_text_temperature: low_with_pressure

## 2-3. GROUND_TEXT_OBSERVATION

意味:
  地の文の観測距離。SURFACE_AXISの本文内運用値。

値候補:
  - objective_surface
  - objective_near
  - half_step_inside_limited
  - object_attached_observation
  - procedure_attached_observation

本文効果:
  - 何を近く拾うかが決まる。
  - 内面説明を避けつつ偏りを出せる。

事故:
  - objective_near が一人称的内面に化ける。
  - object_attached が飾り描写になる。

設定例:
  ground_text_observation: objective_near + object_attached_observation

## 2-4. INNER_OUTPUT

意味:
  内面の出し方。感情名を出す項目ではなく、どの漏れに変換するか。

値候補:
  - emotion_name_forbidden
  - body_leak
  - object_handling_leak
  - reply_delay_leak
  - nonaction_leak
  - limited_judgment_phrase

本文効果:
  - 内面が行動・物・間に変わる。
  - 説明文が減る。

事故:
  - limited_judgment_phrase を広げると説明になる。
  - leak が不足すると読者が追えない。

設定例:
  inner_output: emotion_name_forbidden + object_handling_leak

## 2-5. SPEAKER_TAG_POLICY

意味:
  会話の誰が話しているかをどう示すか。

値候補:
  - explicit_when_confusing
  - action_tag_preferred
  - object_tag_preferred
  - minimal_tag
  - no_voice_guess

本文効果:
  - 会話が説明ではなく動作と接続する。
  - 話者不明を防ぐ。

事故:
  - minimal_tag が話者不明になる。
  - action_tag が過剰な身振りになる。

設定例:
  speaker_tag_policy: action_tag_preferred + explicit_when_confusing

## 2-6. SUBJECT_TAG_POLICY

意味:
  主語をどれだけ出すか。

値候補:
  - explicit_name
  - role_name_limited
  - action_connected_omission
  - object_as_front
  - procedure_as_front

本文効果:
  - 文の焦点が人物か物か手順か変わる。
  - 圧源を間接的に運べる。

事故:
  - omission過多で誰の動作か不明になる。
  - object_as_front が装飾になる。

設定例:
  subject_tag_policy: object_as_front + action_connected_omission

## 2-7. SPEECH_VERB_LIMIT

意味:
  発話動詞の制限。言った/答えた以外を増やすためではなく、発話で心理説明しないための制御。

値候補:
  - said_basic
  - answered_basic
  - asked_basic
  - action_after_speech
  - no_emotion_speech_verb
  - no_theme_speech_verb

本文効果:
  - 「優しく言った」「寂しそうに言った」が減る。
  - 発話後の物や動作で圧を出す。

事故:
  - 発話が全部無色になる。
  - 会話の温度が消える。

設定例:
  speech_verb_limit: said_basic + action_after_speech + no_emotion_speech_verb

## 2-8. PROSE_CONNECTOR_POLICY

意味:
  地の文の接続方法。論理語ではなく物理移動でつなぐ。

値候補:
  - object_transition
  - gaze_transition
  - work_step_transition
  - dialogue_to_action
  - residue_transition
  - no_logical_summary_connector

本文効果:
  - だから/つまり/そのため が減る。
  - 場面が物や動作でつながる。

事故:
  - 接続が飛びすぎる。
  - 物の移動が説明の代用品になる。

設定例:
  prose_connector_policy: work_step_transition + object_transition

## 2-9. DIRECTION_VECTOR

旧名:
  - 向かう方向

意味:
  本文が感情・関係・意味へ向かうのではなく、最終的にどの物理的/手順的状態へ向かうか。

分解後:
  - scene_vector
  - closing_vector
  - pressure_release_destination

本文効果:
  - 意味の整理へ吸い込まれにくくなる。
  - 終着点が物・手順・残留になる。

事故:
  - 「和解へ向かう」「距離が縮まる」など抽象方向のまま残る。

設定例:
  direction_vector:
    scene_vector: distance_vector
    closing_vector: unresolved_residue

## 2-10. FOCUS_ROUTE

旧名:
  - 焦点移動

意味:
  どの対象からどの対象へ視線・文の焦点を移すか。必ずtriggerとreturn_pointを持つ。

構成:
  - focus_start
  - focus_transfer_trigger
  - focus_midpoint
  - focus_return_point

本文効果:
  - 描写が飾りにならず、場面の圧を運ぶ。
  - 話の最後で戻し先が明確になる。

事故:
  - triggerがないとただの視線移動になる。
  - return_pointがないと散る。

設定例:
  focus_route: object -> hand -> route_block -> object_position

## 2-11. METAPHOR_POLICY

意味:
  比喩の使用条件。きれいな言い換えではなく、世界内物に接続した時だけ許可。

値候補:
  - no_abstract_metaphor
  - world_object_only
  - action_connected_only
  - no_explanation_after_metaphor
  - metaphor_off

本文効果:
  - 詩的なAI臭を減らす。
  - 比喩が出る場合も物語世界内に留まる。

事故:
  - きれいな締めのための比喩になる。
  - 比喩の後に意味説明する。

設定例:
  metaphor_policy: world_object_only + no_explanation_after_metaphor

## 2-12. EXPLANATION_VOLUME

意味:
  説明量。少ないほど良いではなく、説明をどの媒体へ置換するか。

値候補:
  - low_with_action_replacement
  - medium_for_procedure_clarity
  - high_only_for_required_rule
  - no_theme_explanation
  - no_emotion_explanation

本文効果:
  - 説明文が必要箇所だけになる。
  - 読者が追える手がかりは残る。

事故:
  - low が薄さになる。
  - high が設定説明になる。

設定例:
  explanation_volume: low_with_action_replacement + medium_for_procedure_clarity

## 2-13. FORBIDDEN_GROUP

意味:
  本文で避ける表現群。単なる禁止語リストではなく、禁止した語の変換先とセットで使う。

分類:
  - emotion_summary
  - relation_summary
  - theme_summary
  - clean_close
  - ai_softener
  - vague_change
  - symbolic_cat_or_object

本文効果:
  - 「少し」「輪郭」「十分だった」系の自動回収を減らす。
  - 禁止語が別の言い換えで復活するのを防ぐ。

事故:
  - 禁止だけで変換先がないと本文が薄くなる。

設定例:
  forbidden_group:
    emotion_summary -> body_action_vector
    clean_close -> residue_vector

---

# 3. SCENE_AND_PROSE_MOTION_FIELDS

## 3-1. SCENE_VECTOR

意味:
  場面の圧を何で運ぶか。

代表値:
  object_position_vector:
    意味: 物の位置・動かなさ・置き直しで圧を出す。
    本文効果: 物が主語になりやすい。感情説明が減る。
  body_action_vector:
    意味: 手足視線袖などで内圧を漏らす。
    本文効果: 感情名が減る。
  distance_vector:
    意味: 席・通路・戸口・幅・距離で関係を出す。
    本文効果: 関係名が減る。
  procedure_vector:
    意味: 作業手順や生活運用で変化を出す。
    本文効果: 店や生活が意味説明なしで動く。
  residue_vector:
    意味: 残留物・残った音・片付かないものへ向かう。
    本文効果: 余韻説明が減る。
  interruption_vector:
    意味: 清潔な証明を崩す小さな割込を入れる。
    本文効果: 人間的なズレが出る。

選択ルール:
  - ready/V2に実体がある値だけ選ぶ。
  - 抽象語だけで選ばない。
  - primaryは1つ、supportは0〜1つまで。

## 3-2. CLOSING_VECTOR

意味:
  話の終わりをどこに置くか。意味ではなく物理的/手順的/残留的な着地先。

代表値:
  - object_position_after_scene
  - routine_continues_with_difference
  - unresolved_residue
  - action_not_taken
  - repeated_action_with_one_difference
  - noncooperating_detail_remains

本文効果:
  - 「十分だった」「分かった」などの説明締めを避ける。
  - 物・手順・しなかった動作で終わる。

事故:
  - 残留物を象徴化する。
  - 閉じた後に意味を説明する。

## 3-3. SENTENCE_VARIATION_PROFILE

旧名:
  - 変奏

正式意味:
  文体を変えることではなく、文の長短・主語・物の前置・動詞タイミング・会話比率・反復・割込・改行をどう運用するか。

禁止:
  - "変奏あり"
  - "リズムを変える"
  - "少し詩的に"
  - "文体に緩急"

分解後フィールド:
  - sentence_length_distribution
  - clause_density
  - subject_visibility_mode
  - object_first_rate
  - verb_timing
  - dialogue_prose_ratio
  - repetition_with_difference
  - interruption_pattern
  - line_break_density

本文効果:
  - 説明段落ではなく、動作と物の順番で呼吸を作る。

事故:
  - 雰囲気だけの文体操作になる。

## 3-4. SENTENCE_LENGTH_DISTRIBUTION

意味:
  文の長短の配置。

値:
  low_pressure_operation:
    効果: 作業や手順が読みやすい。
  pressure_build:
    効果: 短い動作と中程度の観測で圧が溜まる。
  interruption:
    効果: 割込や切断で清潔な流れを崩す。
  residue_close:
    効果: 終盤を物理残留へ絞る。

事故:
  - residue_closeが詩的短文芸になる。
  - pressure_buildが小動作過多になる。

## 3-5. CLAUSE_DENSITY

意味:
  一文の中の情報密度。

値:
  low:
    効果: 手順・動作が明確。
  medium:
    効果: 標準。動作と観測が同居。
  high_limited:
    効果: 空間関係や距離を精密に出す時のみ。

事故:
  - high_limitedが説明過多になる。
  - lowが薄さになる。

## 3-6. SUBJECT_VISIBILITY_MODE

意味:
  主語の見せ方。

値:
  explicit_name:
    効果: 誰がしたか明確。
  action_connected_omission:
    効果: 同一人物の流れが滑らか。
  object_as_grammatical_front:
    効果: 物や場所に圧が移る。
  procedure_as_front:
    効果: 世界運用・作業手順が場面を動かす。

事故:
  - omissionで誰の動作か分からない。
  - object frontで飾り描写になる。

## 3-7. OBJECT_FIRST_RATE

意味:
  文頭や焦点が物・場所・手順から始まる割合。

値:
  low:
    効果: 人物行動が前に出る。
  medium:
    効果: 標準。
  medium_high:
    効果: 物・場所・手順が圧を持つ。
  high_limited:
    効果: 物主導の回に限定して強く効く。

事故:
  - highで人物反応が消える。
  - object listingになる。

## 3-8. VERB_TIMING

意味:
  動詞をどのタイミングで出すか。反応説明を挟むか、すぐ動かすか。

値:
  immediate_action:
    効果: すぐ動く。作業・物理運用向け。
  delayed_verb_limited:
    効果: 一瞬の間を作る。限定使用。
  omitted_reaction_then_next_action:
    効果: 感情説明の代わりに次の動作へ行く。

事故:
  - delayが文学っぽい溜めになる。
  - omittedで圧が読めなくなる。

## 3-9. DIALOGUE_PROSE_RATIO

意味:
  会話と地の文の比率。

値:
  action_heavy:
    効果: 動作・物・手順で進む。
  exchange_heavy:
    効果: 会話のズレや受け渡しが前に出る。
  silence_heavy:
    効果: 返答遅れ・非回答・物の扱いが圧を持つ。

事故:
  - exchangeがテーマ説明会話になる。
  - silenceがAI的余韻になる。

## 3-10. REPETITION_WITH_DIFFERENCE

意味:
  同じ手順や動作を、少し違う形で繰り返すか。

値:
  none:
    効果: 反復なし。
  optional_once:
    効果: 必要なら1回。
  required_once:
    効果: 変化を説明せず差分で出す。
  required_multi_light:
    効果: ルーティン回で軽く複数回。

事故:
  - 差分が綺麗すぎて象徴になる。
  - 反復がパターン芸になる。

## 3-11. INTERRUPTION_PATTERN

意味:
  清潔に進みすぎる場面をどのように割るか。

値:
  none:
    効果: 割込なし。
  one_small_work_or_sound_interrupt:
    効果: 作業音・来客・生活動作で割る。
  wrong_layer_answer:
    効果: 質問に正面から答えず、別層で反応する。
  action_before_reply:
    効果: 返答より先に実務動作が入る。

事故:
  - ランダムノイズ。
  - ギャグ化。
  - 割込を意味回収する。

## 3-12. LINE_BREAK_DENSITY

意味:
  改行密度。

値:
  low:
    効果: 手順が連続する。
  medium:
    効果: 標準。
  high_limited:
    効果: 割込や残留を立てる時だけ使う。

事故:
  - 詩的短文化。
  - 強調しすぎ。

## 3-13. FOCUS_TRANSFER_TRIGGER

意味:
  焦点が移る理由。これがない焦点移動は禁止。

値候補:
  - object_moved
  - object_not_moved
  - hand_stopped
  - reply_delayed
  - sound_entered
  - work_step_changed
  - path_blocked
  - gaze_avoided

本文効果:
  - 描写が場面の動作とつながる。
  - 焦点移動が飾りでなくなる。

事故:
  - triggerなしの雰囲気描写。

## 3-14. FOCUS_RETURN_POINT

意味:
  焦点が最後に戻る場所。

値候補:
  - same_object
  - moved_object
  - unmoved_object
  - doorway
  - seat
  - route
  - notebook
  - dish
  - sound_residue
  - nonaction

本文効果:
  - 締めが配置や残留に戻る。
  - 説明締めを避ける。

事故:
  - returnがないと場面が散る。

---

# 4. EXPANDED_LAYER_FIELDS_FROM_V21

## 4-1. FOREGROUND

意味:
  この話で前に出す対象。主役という意味ではなく、本文が最も多く拾う対象。

値候補:
  - character
  - object
  - place
  - procedure
  - relation_distance
  - residue

事故:
  - foregroundを全部にする。

## 4-2. BACKGROUND_DOWNGRADE

意味:
  今回は背景へ下げる対象。

効果:
  - 説明しすぎを避ける。
  - 常時重要なものを毎話前に出さない。

事故:
  - 下げたものを完全に消す。

## 4-3. ENTRY_HAND_TYPE

意味:
  場面へ入る最初の手。説明導入ではなく、何を触る/置く/止まる/聞くから入るか。

値候補:
  - object_touch
  - object_not_touch
  - foot_stop
  - work_step
  - sound
  - wrong_answer
  - animal_block
  - seat_adjustment

効果:
  - 冒頭説明を減らす。

## 4-4. FIRST_ACTOR

意味:
  初動を担う人物または物/手順。

効果:
  - 場面が誰の説明からではなく、何の動きから始まるか決まる。

事故:
  - 毎回同じ人物が初動になる。

## 4-5. RECEIVER

意味:
  その場面の圧を受ける側。

効果:
  - 会話や動作の反応差が出る。

事故:
  - 受け手が即理解しすぎる。

## 4-6. BOUNDARY_SETTER

旧:
  - 線引き手

意味:
  境界を作る人・物・手順。拒絶説明ではなく、どこまで入れる/入れないかを行動で示す。

値候補:
  - person_action
  - object_position
  - animal_position
  - work_rule
  - doorway_or_counter
  - nonanswer

## 4-7. LIFE_LANDING_AGENT

旧:
  - 生活落とし手

意味:
  抽象化しかけた場面を生活動作へ戻すもの。

値候補:
  - cleaning
  - payment
  - dish
  - seat
  - shoes
  - towel
  - notebook
  - food
  - animal_care
  - weather_work

## 4-8. RETURN_POINT

意味:
  話の焦点や締めが戻る点。

値候補:
  - object
  - place
  - routine
  - sound
  - nonaction
  - residue
  - previous_episode_trace

## 4-9. RESIDUE_POINT

意味:
  回収しきらず残す点。

値候補:
  - physical_object
  - stain_or_mark
  - sound
  - route_width
  - unfinished_work
  - unsaid_reply
  - changed_position
  - unchanged_position

## 4-10. THIN_EPISODE_REINFORCEMENT_POINT

旧:
  - 薄回補強点

意味:
  話が薄くなる箇所に置く増強部品。

値候補:
  - reaction_difference
  - mid_scene_step
  - object_movement
  - repeated_action_delta
  - work_procedure_change
  - irregularity
  - residue_close

事故:
  - 説明を増やして補強した気になる。

## 4-11. INTERNAL_PRESSURE_CONVERSION

旧:
  - 内圧変換

意味:
  内側の圧をどの外部出力へ変えるか。

値候補:
  - body_action
  - object_handling
  - speech_gap
  - nonaction
  - spatial_distance
  - procedure_change

## 4-12. SELF_AWARENESS_GAP

旧:
  - 自覚差

意味:
  人物が自分の圧をどこまで自覚しているか。

値候補:
  - unaware
  - half_aware
  - aware_but_unspoken
  - aware_and_mislabels
  - external_only

効果:
  - 自覚していない人物に正しい説明をさせない。

## 4-13. SPEAKABLE_BOUNDARY

旧:
  - 口外境界

意味:
  何を口に出せるか/出せないか。

値候補:
  - can_say_fact_only
  - can_say_work_only
  - cannot_say_emotion
  - avoids_answer
  - says_wrong_layer

## 4-14. SUBSTITUTE_ACTION

旧:
  - 代替行動

意味:
  言えない/できない代わりに何をするか。

値候補:
  - move_object
  - adjust_seat
  - clean
  - count
  - pour
  - write
  - open_close
  - touch_not_touch
  - leave_unmoved

## 4-15. NORMAL_OPERATION_DISGUISE

旧:
  - いつも通り偽装

意味:
  変化や圧を、いつもの作業のふりで出す。

値候補:
  - same_step_one_delta
  - ordinary_reply_with_gap
  - normal_cleaning_with_one_leftover
  - routine_order_changed_little
  - payment_or_serving_with_shift

## 4-16. OUTSIDE_OBSERVATION_DIFFERENCE

旧:
  - 外側観測差

意味:
  外から見える状態と、圧源側の内側に差を作る。

値候補:
  - appears_normal_but_object_differs
  - appears_silent_but_work_changes
  - appears_kind_but_boundary_held
  - appears_same_but_route_changes

## 4-17. AGE_GENDER_CODE

意味:
  年齢・性別による反応差を、説明やステレオタイプではなく身体・語彙・距離・手順へ埋める。

値候補:
  - body_scale
  - speech_formality
  - held_object
  - allowed_distance
  - hesitation_form
  - work_role_access
  - gaze_height

事故:
  - 属性説明。
  - stereotype化。

## 4-18. DESCRIPTION_OUTPUT_MODE

旧:
  - 描写出力モード

意味:
  描写を何のために使うか。

値候補:
  - action_linked
  - object_pressure
  - spatial_constraint
  - sensory_anchor
  - residue_anchor
  - no_decorative_description

## 4-19. IMMERSION_DEPTH

旧:
  - 没入深度

意味:
  読者をどれだけ近くへ入れるか。人物内面へ潜る深度ではない。

値候補:
  - surface_followable
  - object_near
  - body_near_limited
  - procedure_near
  - residue_near

## 4-20. PLEASURE_DESIGN

旧:
  - 快感設計

意味:
  読みの気持ちよさを何で作るか。癒しや美文ではない。

値候補:
  - work_order_satisfaction
  - object_fit_or_misfit
  - repeated_delta
  - held_boundary
  - residue_aftertaste
  - animal_operation_not_symbol
  - small_irregularity_life_texture

事故:
  - 読者サービス説明。
  - きれいな余韻。

## 4-21. DESCRIPTION_DENSITY

意味:
  描写の密度。

値候補:
  - low_action_only
  - medium_object_action
  - high_limited_spatial
  - high_limited_sensory
  - residue_dense_close

事故:
  - 風景描写で水増し。

## 4-22. SENSORY_ENTRY

旧:
  - 感覚入口

意味:
  場面に入る感覚。

値候補:
  - sound
  - touch
  - smell
  - light
  - temperature
  - weight
  - texture
  - route_block
  - animal_presence

事故:
  - 雰囲気描写だけになる。

## 4-23. PROSE_FLOW_RHYTHM

旧:
  - 文流リズム

意味:
  動作・物・会話・反応差をどう回すか。

値候補:
  - action_object_reply
  - object_action_gap
  - work_step_interruption
  - repeat_delta_residue
  - silence_action_return

## 4-24. DESCRIPTION_PSYCHOLOGY_CONNECTION

旧:
  - 描写と心理の接続

意味:
  描写が心理説明に代わる時の接続。

値候補:
  - object_handling_as_pressure
  - route_choice_as_relation
  - nonaction_as_boundary
  - repeated_delta_as_change
  - residue_as_aftertaste

## 4-25. DESCRIPTION_SUPPRESSION

旧:
  - 描写抑制

意味:
  描写しすぎない対象を決める。

値候補:
  - suppress_mood_description
  - suppress_symbolic_object
  - suppress_beautiful_close
  - suppress_repeated_softeners
  - suppress_world_rule_explanation

---

# 5. OPERATION_FIELDS

## 5-1. EPISODE_LAYER_APPLICATION

意味:
  単話で実際に使うレイヤー値の記録。

必須:
  - source_ready
  - source_v2
  - surface_axis
  - pressure_axis
  - routing_axis
  - leak_axis
  - scene_vector
  - closing_vector
  - sentence_flow
  - irregularity_slot
  - expected_effect_summary

## 5-2. CROSSCHECK_COLUMNS

意味:
  ready条件、V2動作、layer適用が噛み合っているか確認する列。

必須列:
  - ready_condition
  - v2_action
  - layer_route
  - expected_text_effect
  - forbidden_summary
  - unresolved_or_residue
  - STOP_flag

## 5-3. FROZEN_EXTRACTION

意味:
  執筆直前に渡す最小凍結値。全レイヤー正本を渡すのではなく、この話に必要な値だけ抽出する。

含める:
  - surface_axis
  - pressure_axis
  - leak_axis
  - scene_vector
  - closing_vector
  - sentence_flow_min
  - forbidden_group
  - irregularity_slot
  - STOP_condition

含めない:
  - 全項目辞書
  - 正本説明
  - 他話用設定
  - 未使用プリセット

## 5-4. EXECUTION_QUEUE_USE

意味:
  執筆さんが拾い切れない場合、場面単位で値を割り当てる運用。

場面ごとに必要:
  - scene_goal
  - ready_conditions
  - v2_actions
  - layer_values
  - irregularity
  - forbidden_lines
  - target_length_range
  - scene_recovery_check

## 5-5. BACKLOG_POLICY

意味:
  単話で恒久変更が必要そうな発見を、本家設計さんへ戻すための記録。

送る条件:
  - キャラ設計に埋めるべき癖を発見
  - 世界軸に埋めるべき手順を発見
  - 作品全体の禁止群が足りない
  - 帯全体の閉じ方が偏っている
  - 単話補完が複数話で反復した

## 5-6. STOP_CONDITIONS

意味:
  書き進めず止める条件。

主要STOP:
  - pressure_axis_missing
  - leak_axis_missing
  - scene_vector_without_v2_action
  - closing_vector_is_meaning_summary
  - routing_axis_abstract
  - sentence_variation_set_as_single_word
  - irregularity_symbolized
  - ready_condition_not_mapped_to_v2
  - layer_overrides_story_condition
  - packager_expected_effect_missing

---

# 6. WRITING_FREEZE_CARD_VISIBLE_LAYER

執筆凍結カードへ渡す最小抽出:

episode_layer_min:
  surface_axis:
  pressure_axis:
  leak_axis:
  scene_vector:
  closing_vector:
  sentence_flow_min:
    sentence_length_distribution:
    subject_visibility_mode:
    object_first_rate:
    verb_timing:
    dialogue_prose_ratio:
    interruption_pattern:
  focus_route:
  irregularity_slot:
  forbidden_group:
  expected_effect_summary:
  STOP_if:

原則:
  - 執筆さんには全項目辞書を見せない。
  - 梱包さんが選んだ最小値だけ渡す。
  - 抽象説明を渡さず、本文で増える物・減る説明・閉じ先を渡す。


---

# APPENDIX_B_FULL_PRESET_LIBRARY

STATUS: complete_candidate_preset_library
SCOPE: layer_runtime_v27 系の全主要項目を、梱包さんが設定するためのプリセット集。
RULE: プリセットは正解ではない。ready/V2/crosscheckを見て調整する初期値である。
PACKAGER_MUST_OUTPUT:
  - chosen_preset
  - adjusted_values
  - expected_effect_summary
  - risk_to_watch
  - STOP_if_not_supported_by_ready_v2

---

# PRESET 0. DEFAULT_MINIMUM_SAFE

目的:
  迷った時の最低安全値。厚みは出ないが、AI的説明化を抑える。

settings:
  surface_axis: objective_surface
  pressure_axis: must_be_set_from_episode
  routing_axis:
    emotion: body_or_object
    relation: distance_or_procedure
    change: repeated_delta
    aftertaste: residue
  leak_axis: must_be_set_from_episode
  scene_vector: choose_one_from_v2
  support_scene_vector: none
  closing_vector: object_position_after_scene_or_unresolved_residue
  ground_text_lexicon: object_plain
  ground_text_temperature: low_with_pressure
  ground_text_observation: objective_near
  inner_output: emotion_name_forbidden + object_handling_leak
  speaker_tag_policy: action_tag_preferred + explicit_when_confusing
  subject_tag_policy: action_connected_omission
  speech_verb_limit: said_basic + no_emotion_speech_verb
  prose_connector_policy: object_transition + dialogue_to_action
  sentence_length_distribution: low_pressure_operation
  clause_density: medium
  subject_visibility_mode: action_connected_omission
  object_first_rate: medium
  verb_timing: immediate_action
  dialogue_prose_ratio: action_heavy
  repetition_with_difference: optional_once
  interruption_pattern: none
  line_break_density: medium
  metaphor_policy: metaphor_off
  explanation_volume: low_with_action_replacement
  irregularity_slot: off_unless_clean_proof_risk
expected_effect:
  - 説明文が減る。
  - 動作と物が増える。
  - ただし単独では強い人間臭までは出ない。
risk:
  - 無難すぎる。
  - 圧源が弱いと無色になる。

---

# PRESET 1. CAT_CAFE_OBJECT_OPERATION

目的:
  猫・店・席・皿・帳面の運用で圧を出す。

settings:
  surface_axis: objective_near
  pressure_axis: world_operation_pressure + object_pressure
  routing_axis:
    emotion: object_handling
    relation: distance_or_procedure
    change: routine_with_one_difference
    aftertaste: residue
  leak_axis: dish + seat + notebook + cat_route + held_object
  scene_vector: procedure_vector
  support_scene_vector: object_position_vector
  closing_vector: routine_continues_with_difference_or_unresolved_residue
  ground_text_lexicon: object_plain + work_plain
  ground_text_temperature: low_with_pressure
  ground_text_observation: procedure_attached_observation + object_attached_observation
  inner_output: emotion_name_forbidden + object_handling_leak
  speaker_tag_policy: action_tag_preferred
  subject_tag_policy: procedure_as_front + object_as_front
  speech_verb_limit: said_basic + action_after_speech
  prose_connector_policy: work_step_transition + object_transition
  sentence_length_distribution: low_pressure_operation
  clause_density: low_to_medium
  subject_visibility_mode: procedure_as_front + action_connected_omission
  object_first_rate: medium_high
  verb_timing: immediate_action
  dialogue_prose_ratio: action_heavy
  repetition_with_difference: required_once
  interruption_pattern: one_small_work_or_sound_interrupt
  line_break_density: low_to_medium
  focus_route: procedure -> actor_action -> object_position -> next_work_step
  entry_hand_type: work_step_or_animal_block
  boundary_setter: animal_position_or_object_position
  life_landing_agent: dish_or_payment_or_cleaning
  return_point: notebook_or_route_or_dish
  residue_point: hair_mark_unmoved_object_route_width
  description_output_mode: action_linked + object_pressure
  pleasure_design: work_order_satisfaction + animal_operation_not_symbol
expected_effect:
  - 猫を象徴にせず、席・皿・通路・帳面で場面が動く。
  - 店の意味説明が減る。
  - 人間側が動くことで圧が出る。
risk:
  - 手順書化。
  - 猫を象徴として説明してしまう。
STOP_if:
  - 「猫は〜の象徴」になる。
  - 店の普通を説明する。
  - 動作が皿/席/帳面へ戻らない。

---

# PRESET 2. BODY_LEAK_RESTRAINT

目的:
  内圧を身体・持ち物・返答遅れで漏らす。

settings:
  surface_axis: objective_near
  pressure_axis: character_pressure
  routing_axis:
    emotion: body_action
    relation: distance
    refusal: action_not_taken
  leak_axis: hand + foot + sleeve + held_object + reply_delay
  scene_vector: body_action_vector
  support_scene_vector: object_position_vector
  closing_vector: action_not_taken_or_unresolved_residue
  ground_text_lexicon: body_plain + object_plain
  ground_text_temperature: low_with_pressure
  ground_text_observation: objective_near
  inner_output: emotion_name_forbidden + body_leak + object_handling_leak
  speaker_tag_policy: action_tag_preferred
  subject_tag_policy: action_connected_omission
  speech_verb_limit: no_emotion_speech_verb + action_after_speech
  prose_connector_policy: gaze_transition + object_transition
  sentence_length_distribution: pressure_build
  clause_density: medium
  subject_visibility_mode: action_connected_omission
  object_first_rate: medium
  verb_timing: omitted_reaction_then_next_action
  dialogue_prose_ratio: silence_heavy
  repetition_with_difference: optional_once
  interruption_pattern: action_before_reply
  line_break_density: medium
  focus_route: body_part -> held_object -> next_action -> return_point
  self_awareness_gap: half_aware_or_unaware
  speakable_boundary: cannot_say_emotion
  substitute_action: move_object_or_touch_not_touch
  description_psychology_connection: object_handling_as_pressure
expected_effect:
  - 感情名が出ず、手や物の扱いに圧が出る。
  - 返答前の動作が増える。
risk:
  - 小動作が多すぎる。
  - 何を感じているか不明になる。
STOP_if:
  - 感情名で説明する。
  - 目線・沈黙だけに頼る。

---

# PRESET 3. DISTANCE_BOUNDARY_RELATION

目的:
  関係を距離・席・通路・戸口・境界で出す。

settings:
  surface_axis: objective_near
  pressure_axis: relationship_pressure + place_pressure
  routing_axis:
    relation: distance
    emotion: body_or_object
    acceptance: procedure_not_disturbed
  leak_axis: seat_choice + door_position + route_block + object_not_moved
  scene_vector: distance_vector
  support_scene_vector: object_position_vector
  closing_vector: object_position_after_scene_or_unresolved_residue
  ground_text_lexicon: spatial_plain + object_plain
  ground_text_temperature: low_with_pressure
  ground_text_observation: object_attached_observation
  inner_output: emotion_name_forbidden + spatial_distance_leak
  speaker_tag_policy: explicit_when_confusing + action_tag_preferred
  subject_tag_policy: object_as_front + explicit_name
  speech_verb_limit: said_basic + no_theme_speech_verb
  prose_connector_policy: object_transition + gaze_transition
  sentence_length_distribution: pressure_build
  clause_density: high_limited_when_needed
  subject_visibility_mode: object_as_grammatical_front
  object_first_rate: medium_high
  verb_timing: immediate_action
  dialogue_prose_ratio: action_heavy_or_silence_heavy
  repetition_with_difference: required_once
  interruption_pattern: none_or_one_small_work_or_sound_interrupt
  line_break_density: medium
  focus_route: object -> hand -> route_block -> object_position
  boundary_setter: doorway_or_counter_or_object_position
  return_point: route_or_seat_or_doorway
  residue_point: route_width_or_unchanged_position
expected_effect:
  - 関係を「近づいた」と言わず、距離や通路で出す。
  - 境界が物理的に残る。
risk:
  - 距離を抽象文で説明する。
  - 空間描写が細かすぎる。
STOP_if:
  - 「距離が縮まった」と書く。
  - 実際の席/通路/戸口が設定されていない。

---

# PRESET 4. PROCEDURE_WORLD_PRESSURE

目的:
  世界軸の手順そのものに圧を持たせる。

settings:
  surface_axis: objective_surface
  pressure_axis: world_operation_pressure
  routing_axis:
    change: work_step_changed
    relation: procedure_access
    aftertaste: routine_continues
  leak_axis: work_step_changed + repeated_action_delta + unfinished_work
  scene_vector: procedure_vector
  support_scene_vector: residue_vector
  closing_vector: routine_continues_with_difference
  ground_text_lexicon: work_plain
  ground_text_temperature: low_contained
  ground_text_observation: procedure_attached_observation
  inner_output: emotion_name_forbidden + work_step_leak
  speaker_tag_policy: minimal_tag + action_tag_preferred
  subject_tag_policy: procedure_as_front
  speech_verb_limit: said_basic
  prose_connector_policy: work_step_transition
  sentence_length_distribution: low_pressure_operation
  clause_density: low
  subject_visibility_mode: procedure_as_front
  object_first_rate: medium_high
  verb_timing: immediate_action
  dialogue_prose_ratio: action_heavy
  repetition_with_difference: required_once
  interruption_pattern: none
  line_break_density: low
  focus_route: work_step -> actor_action -> object_position -> next_work_step
  normal_operation_disguise: same_step_one_delta
  life_landing_agent: cleaning_or_payment_or_serving
  pleasure_design: work_order_satisfaction + repeated_delta
expected_effect:
  - 仕事や生活の手順で話が進む。
  - 説明なしで変化が見える。
risk:
  - マニュアル化。
  - 情緒が完全に消える。
STOP_if:
  - 手順に圧の差分がない。
  - 作業説明だけになっている。

---

# PRESET 5. CONVERSATION_MISMATCH_PRESSURE

目的:
  会話のズレで圧を出す。説明会話を避ける。

settings:
  surface_axis: objective_near
  pressure_axis: character_pressure_or_relationship_pressure
  routing_axis:
    emotion: wrong_layer_answer
    refusal: nonanswer
    relation: reply_gap
  leak_axis: nonanswer + reply_delay + action_before_reply
  scene_vector: interruption_vector
  support_scene_vector: body_action_vector
  closing_vector: action_not_taken_or_noncooperating_detail_remains
  ground_text_lexicon: body_plain + object_plain
  ground_text_temperature: medium_working
  ground_text_observation: objective_near
  inner_output: emotion_name_forbidden + reply_delay_leak
  speaker_tag_policy: explicit_when_confusing
  subject_tag_policy: explicit_name + action_connected_omission
  speech_verb_limit: no_emotion_speech_verb
  prose_connector_policy: dialogue_to_action
  sentence_length_distribution: interruption
  clause_density: medium
  subject_visibility_mode: explicit_name
  object_first_rate: medium
  verb_timing: omitted_reaction_then_next_action
  dialogue_prose_ratio: exchange_heavy
  repetition_with_difference: optional_once
  interruption_pattern: wrong_layer_answer
  line_break_density: medium_to_high_limited
  focus_route: question -> wrong_layer_answer -> practical_action -> residue
  speakable_boundary: avoids_answer_or_says_wrong_layer
  substitute_action: adjust_seat_or_move_object_or_count
expected_effect:
  - 会話が正解へ進まず、ズレた返答や実務動作で圧が出る。
risk:
  - 変人化。
  - ギャグ化。
  - 意味深会話になる。
STOP_if:
  - ズレた返答が次の動作を変えない。
  - 会話でテーマを説明する。

---

# PRESET 6. RESIDUE_CLOSE_ANTI_CLEAN

目的:
  きれいな納得締めを避け、残留で閉じる。

settings:
  surface_axis: objective_surface
  pressure_axis: unresolved_pressure_or_object_pressure
  routing_axis:
    aftertaste: residue
    change: repeated_delta
    unresolved: noncooperating_detail
  leak_axis: residue_point + object_not_moved + sound_residue
  scene_vector: residue_vector
  support_scene_vector: object_position_vector
  closing_vector: unresolved_residue_or_noncooperating_detail_remains
  ground_text_lexicon: residue_plain + object_plain
  ground_text_temperature: low_with_pressure
  ground_text_observation: object_attached_observation
  inner_output: emotion_name_forbidden
  speaker_tag_policy: minimal_tag
  subject_tag_policy: object_as_front
  speech_verb_limit: said_basic
  prose_connector_policy: residue_transition
  sentence_length_distribution: residue_close
  clause_density: low_to_medium
  subject_visibility_mode: object_as_grammatical_front
  object_first_rate: high_limited
  verb_timing: immediate_action
  dialogue_prose_ratio: silence_heavy
  repetition_with_difference: required_once
  interruption_pattern: none_or_one_small_work_or_sound_interrupt
  line_break_density: high_limited
  focus_route: repeated_procedure -> one_changed_detail -> residue
  residue_point: physical_object_or_sound_or_route_width
  description_output_mode: residue_anchor
  description_suppression: suppress_beautiful_close
expected_effect:
  - 終わりが意味ではなく残った物に乗る。
  - 「十分だった」「分かった」が出ない。
risk:
  - 詩的な象徴になる。
  - 残留物の意味を説明する。
STOP_if:
  - 残留の後に意味文を書く。
  - 残留物が本文中で準備されていない。

---

# PRESET 7. CLEAN_PROOF_BREAKER

目的:
  すべてが話の勝ち筋に協力しすぎるAI臭を壊す。

settings:
  surface_axis: objective_near
  pressure_axis: current_episode_pressure
  routing_axis:
    clean_meaning: interruption_or_noncooperation
  leak_axis: practical_noise + work_interrupt + animal_or_object_noncooperation
  scene_vector: interruption_vector
  support_scene_vector: residue_vector
  closing_vector: noncooperating_detail_remains
  ground_text_lexicon: work_plain + object_plain
  ground_text_temperature: low_with_pressure
  ground_text_observation: objective_surface
  inner_output: emotion_name_forbidden
  speaker_tag_policy: action_tag_preferred
  subject_tag_policy: explicit_name_when_needed
  speech_verb_limit: said_basic
  prose_connector_policy: dialogue_to_action + object_transition
  sentence_length_distribution: interruption
  clause_density: low_to_medium
  subject_visibility_mode: explicit_name_when_needed
  object_first_rate: medium
  verb_timing: immediate_action
  dialogue_prose_ratio: action_heavy_or_exchange_heavy
  repetition_with_difference: none_or_optional_once
  interruption_pattern: one_small_work_or_sound_interrupt
  line_break_density: medium_to_high_limited
  focus_route: sound_or_work_interrupt -> practical_action -> interrupted_reply_or_residue
  irregularity_slot: required_if_scene_too_clean
expected_effect:
  - 清潔な理解や納得の直前に、生活や実務が割り込む。
  - 全部がテーマへ協力しない。
risk:
  - ランダムノイズ。
  - ギャグ化。
  - 逆に象徴化。
STOP_if:
  - 割込が次の動作を変えない。
  - 割込を意味回収する。

---

# PRESET 8. CHILD_BEGINNER_HEAT_PRESERVE

目的:
  初心者や子供の小さな熱を、設計用語へ潰さず本文へ残す。

settings:
  surface_axis: objective_near
  pressure_axis: object_or_character_heat
  routing_axis:
    like: concrete_object_or_scene
    dislike: forbidden_line
    last_feeling: residue_or_object_position
  leak_axis: selected_by_user_seed
  scene_vector: object_position_vector_or_body_action_vector
  support_scene_vector: none
  closing_vector: simple_residue_or_action_not_taken
  ground_text_lexicon: plain_object_body
  ground_text_temperature: low_with_pressure
  ground_text_observation: objective_near
  inner_output: emotion_name_limited_only_if_user_word_is_heat
  speaker_tag_policy: explicit_when_confusing
  subject_tag_policy: explicit_name + action_connected_omission
  speech_verb_limit: said_basic
  prose_connector_policy: object_transition + dialogue_to_action
  sentence_length_distribution: low_pressure_operation
  clause_density: low_to_medium
  subject_visibility_mode: explicit_name
  object_first_rate: medium
  verb_timing: immediate_action
  dialogue_prose_ratio: balanced
  repetition_with_difference: optional_once
  interruption_pattern: none_or_small
  line_break_density: medium
expected_effect:
  - 入力の小さな好きが物や動作で残る。
  - 設計語で上書きしない。
risk:
  - 薄い。
  - AIが良い話へ整えすぎる。
STOP_if:
  - ユーザーの熱語を別のテーマへ置換する。
  - 初心者に設定項目を選ばせる。

---

# PRESET 9. HIGH_DENSITY_12K_EPISODE

目的:
  12k級の不可削本文を狙う時の高密度設定。ただし水増しは禁止。

settings:
  surface_axis: objective_near
  pressure_axis: character_pressure + world_operation_pressure
  routing_axis:
    emotion: body_and_object
    relation: distance_and_procedure
    change: repetition_with_difference
    aftertaste: residue
  leak_axis: two_or_three_specific_leaks
  scene_vector: primary + support
  closing_vector: unresolved_residue_or_repeated_action_with_one_difference
  ground_text_lexicon: object_plain + work_plain + body_plain
  ground_text_temperature: low_with_pressure_or_medium_working
  ground_text_observation: objective_near
  inner_output: emotion_name_forbidden + multiple_leak_routes
  speaker_tag_policy: action_tag_preferred + explicit_when_confusing
  subject_tag_policy: object_as_front + action_connected_omission
  speech_verb_limit: no_emotion_speech_verb + action_after_speech
  prose_connector_policy: object_transition + work_step_transition + dialogue_to_action
  sentence_length_distribution: pressure_build
  clause_density: medium
  subject_visibility_mode: mixed_controlled
  object_first_rate: medium_high
  verb_timing: immediate_action + omitted_reaction_then_next_action
  dialogue_prose_ratio: action_heavy_with_exchange_nodes
  repetition_with_difference: required_once_or_required_multi_light
  interruption_pattern: one_small_work_or_sound_interrupt
  line_break_density: medium
  focus_route: scene_specific_required
  thin_episode_reinforcement_point:
    - reaction_difference
    - mid_scene_step
    - object_movement
    - repeated_action_delta
    - irregularity
    - residue_close
expected_effect:
  - 場面段数、反応差、物の動き、反復差分で厚くなる。
  - 説明水増しではなく不可削拍が増える。
risk:
  - 管理表臭。
  - 全部回収しようとして硬くなる。
STOP_if:
  - 厚みが説明段落で増えている。
  - scene_vectorが場面ごとに割れていない。
  - expected_effectが書けない。

---

# PRESET 10. PACKAGER_BALANCED_STANDARD

目的:
  梱包さんの通常初期値。ready/V2が十分ある単話向け。

settings:
  surface_axis: objective_near
  pressure_axis: choose_from_episode
  routing_axis:
    emotion: body_or_object
    relation: distance_or_procedure
    change: repeated_delta_or_object_position
    aftertaste: residue
  leak_axis: choose_1_to_3_concrete
  scene_vector: choose_primary
  support_scene_vector: optional_one
  closing_vector: choose_from_ready_return_or_v2_final
  ground_text_lexicon: object_plain + selected_world_plain
  ground_text_temperature: low_with_pressure
  ground_text_observation: objective_near
  inner_output: emotion_name_forbidden + selected_leak
  speaker_tag_policy: action_tag_preferred + explicit_when_confusing
  subject_tag_policy: action_connected_omission + object_as_front_when_needed
  speech_verb_limit: said_basic + action_after_speech
  prose_connector_policy: object_transition + dialogue_to_action
  sentence_length_distribution: pressure_build
  clause_density: medium
  subject_visibility_mode: controlled_mix
  object_first_rate: medium_high_if_object_pressure_else_medium
  verb_timing: immediate_action
  dialogue_prose_ratio: action_heavy_or_balanced
  repetition_with_difference: optional_once
  interruption_pattern: none_unless_clean
  line_break_density: medium
  metaphor_policy: world_object_only_or_off
  explanation_volume: low_with_action_replacement
expected_effect:
  - 通常回の厚みと読みやすさを両立する。
  - 梱包さんがready/V2に合わせて調整しやすい。
risk:
  - 全部が中庸になる。
STOP_if:
  - どの値も「なんとなく」で選ばれている。

---

# PACKAGER_PRESET_SELECTION_TABLE

IF:
  ready/V2 has shop work, objects, route, animal operation
USE:
  PRESET 1 CAT_CAFE_OBJECT_OPERATION

IF:
  emotion must exist but cannot be named
USE:
  PRESET 2 BODY_LEAK_RESTRAINT

IF:
  relation must be shown without relation name
USE:
  PRESET 3 DISTANCE_BOUNDARY_RELATION

IF:
  world operation or routine itself carries the episode
USE:
  PRESET 4 PROCEDURE_WORLD_PRESSURE

IF:
  dialogue is required but direct answer would be too clean
USE:
  PRESET 5 CONVERSATION_MISMATCH_PRESSURE

IF:
  ending risks "understood/sufficient/quiet warmth"
USE:
  PRESET 6 RESIDUE_CLOSE_ANTI_CLEAN

IF:
  all scene parts cooperate too neatly
USE:
  PRESET 7 CLEAN_PROOF_BREAKER

IF:
  beginner input is thin but has a concrete seed
USE:
  PRESET 8 CHILD_BEGINNER_HEAT_PRESERVE

IF:
  target is 12k不可削 and card/V2 is dense enough
USE:
  PRESET 9 HIGH_DENSITY_12K_EPISODE

IF:
  no special risk but normal packager assignment is needed
USE:
  PRESET 10 PACKAGER_BALANCED_STANDARD
