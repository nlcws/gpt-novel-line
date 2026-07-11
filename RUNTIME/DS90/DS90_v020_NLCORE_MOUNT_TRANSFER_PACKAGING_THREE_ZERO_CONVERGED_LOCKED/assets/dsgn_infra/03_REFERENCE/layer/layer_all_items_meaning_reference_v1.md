# LAYER_ALL_ITEMS_MEANING_REFERENCE_V1

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
