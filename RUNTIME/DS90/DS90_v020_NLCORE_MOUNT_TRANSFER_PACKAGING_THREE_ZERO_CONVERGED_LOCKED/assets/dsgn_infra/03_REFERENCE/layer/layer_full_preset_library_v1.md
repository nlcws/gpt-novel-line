# LAYER_FULL_PRESET_LIBRARY_V1

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
