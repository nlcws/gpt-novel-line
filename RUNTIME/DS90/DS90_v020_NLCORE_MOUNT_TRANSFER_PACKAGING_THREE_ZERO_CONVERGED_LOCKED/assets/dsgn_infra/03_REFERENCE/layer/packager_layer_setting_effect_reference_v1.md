# PACKAGER_LAYER_SETTING_EFFECT_REFERENCE_V1

STATUS: provisional_reference
SOURCE: layer_runtime_v27_ai_native_complete_candidate
SCOPE: 梱包さんが単話レイヤー値を設定するための参照表
IMPORTANT: これは文体プリセットではない。ready / V2 / layer / crosscheck から選ぶ操作表である。

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
