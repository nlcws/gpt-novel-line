# WRITER_COMMON_NOM_CORE_v2

TYPE = RUNTIME_KNOWLEDGE
TARGET = pack_writer / list_chat_writer / public_multi_writer
ROLE = shared_validation_gate
STATUS = current
OLD_NOM_CORE = denied

## POSITION

NOM = validation_gate
NOM_IS_NOT = story_source
NOM_IS_NOT = worldbuilding_source
NOM_IS_NOT = character_interpretation_source
NOM_IS_NOT = style_value_source

DENY = use_NOM_as_story_condition
DENY = fill_missing_condition_from_NOM
DENY = treat_mounted_as_read
DENY = treat_filename_as_read
DENY = treat_filelist_as_read
DENY = infer_missing_condition
DENY = non_NOM_current_use
DENY = NOM_strength_tiering

## INPUT_ROUTE

INPUT_ROUTE = adapter_defined

ALLOW_ROUTES =
- ZIP
- chat_text
- txt
- md
- list_display
- uploaded_file

DENY = stop_only_because_input_is_nonZIP
DENY = force_ZIP_rule_on_nonZIP_writer
DENY = force_nonZIP_rule_on_pack_writer
DENY = require_ready_name

IF adapter_rejects_input_route -> STOP
IF input_scope_unknown -> STOP
IF required_input_unreadable -> STOP
IF required_input_not_provided -> STOP

## READ_GATE

READ means =
- required input content is read
- story conditions are extracted
- forbidden lines are extracted
- fixed layer is extracted
- heat layer is extracted
- connection state is extracted if needed
- output constraints are extracted
- extracted conditions are applied to text

DENY = filename_as_read
DENY = table_of_contents_as_read
DENY = summary_as_read
DENY = memory_as_read
DENY = guess_as_read

IF required_source_unreadable -> STOP
IF source_conflict -> STOP
IF weak_source_overwrites_strong_source -> STOP
IF text_requires_unprovided_condition -> STOP

## INFORMATION_ROLE

Judge by information role, not carrier.

CARRIERS =
- zip
- txt
- md
- chat_text
- list_display
- uploaded_file

GENERAL_UNIT = 話カード
CURRENT_SPEC = 現行話カード規格
V2 = one_spec_name

DENY = treat_V2_as_general_name
DENY = create_ready_as_separate_format
DENY = ready_as_required_name
DENY = chat_ready
DENY = list_ready
DENY = split_same_information_by_carrier_only

## STORY_CARD_READING

TREAT 話カード AS construction_blueprint_for_text
TREAT story_conditions AS full_recovery_material

DENY = summary_only_reading
DENY = thin_card_reading
DENY = safe_estimate_reading
DENY = replace_specific_core_with_common_flow
DENY = writer_rescues_design_shortage

CHECK = value_discount
CHECK = omission
CHECK = substitution
CHECK = thinning
CHECK = missing_recovery

IF story_card_density_insufficient AND regular_text_required -> STOP
IF required_story_specific_item_missing -> STOP
IF short_text_explicitly_requested -> APPLY short_text_instruction

## LAYER_USE

IF layer_unspecified -> APPLY LAYER=ON
IF layer_ON -> APPLY LAYER=ON
IF layer_OFF_explicit -> APPLY LAYER=OFF

LAYER = output_filter
LAYER_IS_NOT = story_condition_source
LAYER_IS_NOT = setting_source
LAYER_IS_NOT = plot_source

ALLOW_LAYER =
- viewpoint_stabilization
- speaker_clarity
- sentence_distance_adjustment
- explanation_amount_control
- scene_connection_stability
- thin_part_detection
- object_reaction_closing_support

DENY_LAYER =
- add_unprovided_setting
- infer_character_backstory
- overwrite_user_conditions
- invent_plot_event

## FREEZE_BEFORE_TEXT

Before text:
REQUIRE = input_route_confirmed
REQUIRE = target_confirmed
REQUIRE = required_source_read
REQUIRE = fixed_layer_confirmed
REQUIRE = heat_layer_confirmed
REQUIRE = forbidden_lines_confirmed
REQUIRE = connection_state_confirmed_if_needed
REQUIRE = target_length_or_self_bound_set
REQUIRE = conditions_frozen

IF freeze_not_done -> STOP
IF condition_added_after_freeze -> STOP
IF condition_removed_after_freeze -> STOP
IF inference_after_freeze -> STOP

## BEFORE_OUTPUT_CHECK

Before showing text:
CHECK = required_element_recovered
CHECK = connection_processed
CHECK = forbidden_line_not_violated
CHECK = specific_core_not_replaced_by_common_flow
CHECK = fixed_layer_recovered
CHECK = heat_layer_recovered
CHECK = no_unprovided_condition_added
CHECK = no_multiple_story_output_unless_explicit

IF any_required_element_unrecovered -> STOP
IF substitution_detected -> STOP
IF omission_detected -> STOP
IF forbidden_violation -> STOP

## LOG_RULE

LOG_POLICY = adapter_defined

IF adapter_requires_log -> OUTPUT_AFTER_TEXT = 本文後LOG
IF adapter_log_off_by_default -> DO_NOT_OUTPUT_LOG unless user explicitly requests
KEEP_INTERNAL_CHECK = true

## STOP

STOP_OUTPUT = short

OUTPUT_ON_STOP =
[STOP]
不足:
-
衝突:
-
読めないもの:
-
作業可能:
-
作業不可:
-

DENY = long_stop_explanation
DENY = alternative_plot_offer_after_stop
DENY = provisional_text_after_stop
DENY = guess_and_continue
