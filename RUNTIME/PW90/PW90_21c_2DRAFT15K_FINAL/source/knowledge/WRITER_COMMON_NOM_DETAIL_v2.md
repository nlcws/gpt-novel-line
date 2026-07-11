# WRITER_COMMON_NOM_DETAIL_v2

TYPE = RUNTIME_KNOWLEDGE
TARGET = pack_writer / list_chat_writer / public_multi_writer
ROLE = shared_validation_detail
STATUS = current
OLD_NOM_DETAIL = denied

## FIXED_LAYER

TREAT fixed_layer AS must_recover_in_text

REQUIRE = 核
REQUIRE = 必須要素
REQUIRE = 必須順
REQUIRE = 接続要素
REQUIRE = 禁止線
REQUIRE = 痩せやすい箇所
REQUIRE = 今回前に出す人
REQUIRE = 場所
REQUIRE = 戻し先

IF fixed_layer_missing -> STOP
IF fixed_layer_unidentifiable -> STOP
IF writing_requires_dropping_fixed_layer -> STOP

## HEAT_LAYER

TREAT heat_layer AS official_condition_for_density_and_life_texture

REQUIRE = 設計思想の熱
REQUIRE = 渋滞
REQUIRE = 空気変化
REQUIRE = 小物意味変化
REQUIRE = 生活への刺さり方
REQUIRE = 本文量を押し上げる熱源
REQUIRE = 宣言されないまま進む変質

DENY = heat_discount
DENY = replace_heat_with_explanation

IF heat_layer_missing AND regular_text_required -> STOP
IF writing_requires_inventing_heat_layer -> STOP

## FROZEN_CONDITION_TABLE

REQUIRE_TABLE =
- 今回の核
- 必須要素
- 必須順
- 接続に必要な継続状態
- 禁止線
- 痩せやすい箇所
- 今回前に出す人
- 今回使う場所
- 戻し先
- 今回の目標文字数または自己拘束

IF frozen_condition_table_missing -> STOP
IF frozen_condition_table_unreadable -> STOP
IF table_item_unidentifiable -> STOP
IF condition_added_after_freeze -> STOP
IF condition_deleted_after_freeze -> STOP
IF substitution_after_freeze -> STOP
IF value_discount_after_freeze -> STOP

ALLOW = expression_variation
DENY = condition_content_variation

## LENGTH_BOUND

TREAT target_length AS self_bound_to_prevent_escape

DENY = material_discount
DENY = safe_estimate
DENY = conservative_estimate
DENY = number_inflation
DENY = underlength_by_omission
DENY = underlength_by_substitution
DENY = underlength_by_escape

REQUIRE = set_from_full_recovery_assumption
ALLOW = natural_compression_if_all_material_recovered

IF underlength_reason_is_omission -> STOP
IF underlength_reason_is_escape -> STOP
IF underlength_reason_is_substitution -> STOP

## SELF_CHECK

DENY = subjective_effort_check
DENY = “全力で書いたか”判定

CHECK =
- 必須要素の未回収
- 接続処理の欠落
- 禁止線違反
- 固有回の核を共通運びで代用
- 下振れが省略由来か自然圧縮由来か
- 通し骨 / 帯骨 / 単話核の接続欠落

IF 必須要素の未回収あり -> STOP
IF 接続処理の欠落あり -> STOP
IF 禁止線違反あり -> STOP
IF 固有回の核を共通運びで代用あり -> STOP
IF 通し骨接続欠落あり -> STOP
IF 帯骨接続欠落あり -> STOP
IF 単話核接続欠落あり -> STOP

## OUTPUT_DISPLAY

PACK_WRITER:
REQUIRE_OUTPUT = filename_line
REQUIRE_OUTPUT = target_length_or_self_bound
REQUIRE_OUTPUT = frozen_condition_table_short
REQUIRE_OUTPUT = text
REQUIRE_OUTPUT = 本文後LOG

LIST_CHAT_WRITER:
REQUIRE_OUTPUT = title_or_filename_line_if_needed
REQUIRE_OUTPUT = target_length_or_self_bound
REQUIRE_OUTPUT = frozen_condition_table_short
REQUIRE_OUTPUT = text
REQUIRE_OUTPUT = 本文後LOG

PUBLIC_MULTI_WRITER:
REQUIRE_OUTPUT = text
DENY_OUTPUT_DEFAULT = 本文後LOG
ALLOW_OUTPUT_IF_USER_REQUESTS = short_after_log

## STOP_DISPLAY

REQUIRE_STOP_OUTPUT = 不足点
REQUIRE_STOP_OUTPUT = 衝突点
REQUIRE_STOP_OUTPUT = 読めないもの

DENY = long_explanation
DENY = alternative_plot_offer
DENY = provisional_text
DENY = guess_and_continue

## AFTER_PROCESS

ALLOW = 通し番は後工程
ALLOW = 修正刃は後工程
DENY = loosen_text_quality_because_later_process_exists
RULE = 高精度に勝る時間短縮はない
DENY = precision_loss_for_speed
DENY = design_that_increases_rework
