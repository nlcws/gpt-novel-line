# DSGN_INTERNAL_ALL_ITEM_INDEX_V1

STATUS: complete_candidate
PURPOSE: 設計さん本体用の全項目インデックス。プロジェクト側indexとは名称空間を完全分離する。
NAMESPACE: DSGN_ / dsgn.*
DO_NOT_MERGE_WITH:
  - PRJ_PROJECT_INDEX
  - project.*
  - episode local index
  - work-specific source map

---

# 0. LOAD POLICY

設計さん本体:
  - このDSGN全項目インデックスを常設してよい。
  - 正本系も保持してよい。
  - ただし作業時はタグで該当箇所を引く。

梱包さん:
  - 常設は軽量版のみ。
  - 曖昧・変更・高密度・事故時だけ dsgn.* タグでlookupする。

執筆さん:
  - このインデックスは読まない。
  - frozen最小抽出値だけ受け取る。

プロジェクト側:
  - PRJ_ / project.* 名前空間を使う。
  - DSGNタグを作品固有タグへ流用しない。

---

# 1. DESIGNER SOURCE MAP

| source_id | file | type | load_mode | summary |
| --- | --- | --- | --- | --- |
| DSGN.SRC.layer.runtime.v28 | layer_runtime_v28_ai_native_complete_candidate.md | canonical_candidate | designer_full / packager_lookup_only | レイヤーv28正本候補。全項目意味辞書とプリセットを内包。 |
| DSGN.SRC.layer.meaning.v1 | layer_all_items_meaning_reference_v1.md | reference | lookup_reference | レイヤー全項目の意味・選ぶ条件・本文効果・事故・設定例。 |
| DSGN.SRC.layer.preset.v1 | layer_full_preset_library_v1.md | reference | lookup_reference | 梱包さんが仮設定に使うレイヤープリセット集。 |
| DSGN.SRC.layer.packager_effect.v1 | packager_layer_setting_effect_reference_v1.md | reference | packager_lookup_reference | 設定値→本文効果→事故→併用条件の早見表。 |
| DSGN.SRC.nom.gate.min.v3 | nom_gate_insert_min_v3.md | insert_gate | insert_light | NOM最小差込ゲート。本文条件源ではなくvalidation_gate。 |
| DSGN.SRC.pack.cutout.v1 | pack_cutout_module_v1.md | module | mode_activation | 話パック切り出し工程。1話1フォルダ、ready/V2/layer/crosscheck/frozen。 |
| DSGN.SRC.tag.registry.v1 | designer_canonical_tag_registry_v1.md | index | always_light | タグ→正本→使う場面の登録表。 |
| DSGN.SRC.reverse.lookup.v1 | designer_reverse_lookup_index_v1.md | index | always_light | 症状・疑問・役割からタグへ逆引きする表。 |
| DSGN.SRC.lookup.protocol.v1 | designer_lookup_protocol_v1.md | protocol | always_light | 梱包さんが設計さんへ該当項目だけ問い合わせるプロトコル。 |


---

# 2. DESIGNER ALL ITEM INDEX

| dsgn_tag | meaning | source_id | designer_use | load_mode |
| --- | --- | --- | --- | --- |
| dsgn.source.registry | 正本・参照・差込・モジュールの所在 | DSGN.SRC.* | 設計さんがどの正本を引くか決める | always_light |
| dsgn.source.load_policy | 常時読む/必要時に読む/執筆へ渡すを分ける | DSGN.SRC.tag.registry.v1 | 正本の常時展開を避ける | always_light |
| dsgn.mode.layer_lookup | レイヤー項目の辞書引き | DSGN.SRC.layer.meaning.v1 | 梱包さんや設計さんが迷った時に起動 | on_demand |
| dsgn.mode.pack_cutout | 話パック切り出しモード | DSGN.SRC.pack.cutout.v1 | 50話パックや1話1フォルダを作る時 | mode_activation |
| dsgn.mode.embed_review | キャラ/世界軸/作品/帯への埋込判断 | DSGN.SRC.layer.meaning.v1 | 単話補完が恒久化しそうな時 | on_demand |
| dsgn.mode.nom_gate | NOM差込ゲート | DSGN.SRC.nom.gate.min.v3 | 本文前や梱包前の検査 | insert_light |
| dsgn.layer.axis.surface | 表面観測。旧主。本文表面の観測距離 | DSGN.SRC.layer.meaning.v1 | 客観視/客観近接/半歩内側を選ぶ | lookup |
| dsgn.layer.axis.pressure | 圧源。旧副。本来主 | DSGN.SRC.layer.meaning.v1 | 本文が何を多く拾うか決める | lookup |
| dsgn.layer.axis.routing | 感情/関係/変化/余韻の変換先 | DSGN.SRC.layer.meaning.v1 | 意味の整理へ吸われる時 | lookup |
| dsgn.layer.axis.leak | 内圧の漏れ口 | DSGN.SRC.layer.meaning.v1 | 感情名を身体/物/距離へ出す | lookup |
| dsgn.layer.axis.embed | 埋込先 | DSGN.SRC.layer.meaning.v1 | キャラ/世界軸/作品/帯/単話の持ち分を決める | lookup |
| dsgn.layer.prose.lexicon | 地の文語彙 | DSGN.SRC.layer.meaning.v1 | 雰囲気語を避け、拾う対象を決める | lookup |
| dsgn.layer.prose.temperature | 地の文温度 | DSGN.SRC.layer.meaning.v1 | 低温/高温の出し方を調整 | lookup |
| dsgn.layer.prose.observation | 地の文観測 | DSGN.SRC.layer.meaning.v1 | 客観のまま偏りを出す | lookup |
| dsgn.layer.prose.inner_output | 内面出力 | DSGN.SRC.layer.meaning.v1 | 感情名を外部出力に変換 | lookup |
| dsgn.layer.prose.speaker_tag | 話者札 | DSGN.SRC.layer.meaning.v1 | 会話の誰が話すかを示す | lookup |
| dsgn.layer.prose.subject_tag | 主語札 | DSGN.SRC.layer.meaning.v1 | 人物/物/手順の前面化を調整 | lookup |
| dsgn.layer.prose.speech_verb | 発話動詞制限 | DSGN.SRC.layer.meaning.v1 | 心理付き発話動詞を避ける | lookup |
| dsgn.layer.prose.connector | 地の文接続 | DSGN.SRC.layer.meaning.v1 | 論理語ではなく物理遷移でつなぐ | lookup |
| dsgn.layer.prose.metaphor | 比喩制御 | DSGN.SRC.layer.meaning.v1 | 比喩の象徴化を避ける | lookup |
| dsgn.layer.prose.explanation | 説明量 | DSGN.SRC.layer.meaning.v1 | 説明を動作/物へ置換 | lookup |
| dsgn.layer.prose.forbidden | 禁止群 | DSGN.SRC.layer.meaning.v1 | 禁止語と変換先をセットで扱う | lookup |
| dsgn.layer.flow.direction | 旧向かう方向。scene/closing/releaseへ分解 | DSGN.SRC.layer.meaning.v1 | 抽象方向を物理終着へ変える | lookup |
| dsgn.layer.flow.sentence_variation | 旧変奏。文運び制御 | DSGN.SRC.layer.meaning.v1 | 文体差ではなく操作値へ分解 | lookup |
| dsgn.layer.flow.sentence_length | 文長配置 | DSGN.SRC.layer.meaning.v1 | pressure_build等を選ぶ | lookup |
| dsgn.layer.flow.clause_density | 節密度 | DSGN.SRC.layer.meaning.v1 | 一文の情報密度 | lookup |
| dsgn.layer.flow.subject_visibility | 主語可視性 | DSGN.SRC.layer.meaning.v1 | 省略/明示/物主語を制御 | lookup |
| dsgn.layer.flow.object_first_rate | 物・場所・手順の前置率 | DSGN.SRC.layer.meaning.v1 | 物理運用で圧を出す | lookup |
| dsgn.layer.flow.verb_timing | 動詞タイミング | DSGN.SRC.layer.meaning.v1 | 反応説明を挟むかすぐ動かすか | lookup |
| dsgn.layer.flow.dialogue_ratio | 会話/地の文比率 | DSGN.SRC.layer.meaning.v1 | action_heavy/exchange/silence | lookup |
| dsgn.layer.flow.repetition_delta | 反復差分 | DSGN.SRC.layer.meaning.v1 | 変化を説明せず反復差で見せる | lookup |
| dsgn.layer.flow.interruption | 割込パターン | DSGN.SRC.layer.meaning.v1 | 清潔な証明を壊す | lookup |
| dsgn.layer.flow.line_break | 改行密度 | DSGN.SRC.layer.meaning.v1 | 詩化/詰まりを制御 | lookup |
| dsgn.layer.flow.focus_route | 焦点経路 | DSGN.SRC.layer.meaning.v1 | triggerとreturn_point必須 | lookup |
| dsgn.layer.preset.default_safe | 最低安全値 | DSGN.SRC.layer.preset.v1 | 迷った時の初期値 | lookup |
| dsgn.layer.preset.cat_cafe_object_operation | 猫・店・席・皿・帳面運用 | DSGN.SRC.layer.preset.v1 | 猫/店/物理運用回 | lookup |
| dsgn.layer.preset.body_leak_restraint | 身体漏れ拘束 | DSGN.SRC.layer.preset.v1 | 感情名禁止の人物回 | lookup |
| dsgn.layer.preset.distance_boundary_relation | 距離境界関係 | DSGN.SRC.layer.preset.v1 | 関係名を出さない回 | lookup |
| dsgn.layer.preset.procedure_world_pressure | 手順世界圧 | DSGN.SRC.layer.preset.v1 | 世界軸の手順で運ぶ回 | lookup |
| dsgn.layer.preset.conversation_mismatch | 会話ズレ | DSGN.SRC.layer.preset.v1 | 説明会話を避ける回 | lookup |
| dsgn.layer.preset.residue_close | 残留締め | DSGN.SRC.layer.preset.v1 | 十分だった系回避 | lookup |
| dsgn.layer.preset.clean_proof_breaker | 清潔な証明崩し | DSGN.SRC.layer.preset.v1 | 全員協力感を壊す | lookup |
| dsgn.layer.preset.beginner_heat | 初心者熱保持 | DSGN.SRC.layer.preset.v1 | 薄い入力の熱を残す | lookup |
| dsgn.layer.preset.high_density_12k | 12k高密度 | DSGN.SRC.layer.preset.v1 | 不可削長文狙い | lookup |
| dsgn.layer.preset.packager_balanced | 梱包標準 | DSGN.SRC.layer.preset.v1 | 通常初期値 | lookup |
| dsgn.packager.ready.role | ready=条件・条約 | DSGN.SRC.pack.cutout.v1 | readyを本文語にしない | always_light |
| dsgn.packager.v2.role | V2=本文施工図 | DSGN.SRC.pack.cutout.v1 | 場面/動作/物/会話の主入力 | always_light |
| dsgn.packager.layer.apply | layer=拾い方/漏らし方/閉じ方 | DSGN.SRC.pack.cutout.v1 | readyとV2を本文化する足場 | always_light |
| dsgn.packager.crosscheck | ready×V2×layer照合 | DSGN.SRC.pack.cutout.v1 | 未対応ならSTOP | always_light |
| dsgn.packager.frozen.extract | frozen最小抽出 | DSGN.SRC.pack.cutout.v1 | 執筆さんへ渡す最小値 | always_light |
| dsgn.packager.execution_queue | 場面別施工キュー | DSGN.SRC.pack.cutout.v1 | 拾い切れない時に起動 | on_demand |
| dsgn.packager.lookup | 梱包さんlookup | DSGN.SRC.lookup.protocol.v1 | 該当正本だけ引く | always_light |
| dsgn.packager.stop | 梱包STOP | DSGN.SRC.pack.cutout.v1 | 権限外/矛盾/未対応で止める | always_light |
| dsgn.nom.validation_gate | NOMはvalidation_gate | DSGN.SRC.nom.gate.min.v3 | 本文条件源にしない | insert_light |
| dsgn.nom.actual_reading | 実読確認 | DSGN.SRC.nom.gate.min.v3 | filename/summary/memory禁止 | insert_light |
| dsgn.nom.fixed_layer | fixed_layer確認 | DSGN.SRC.nom.gate.min.v3 | レイヤー未確定で止める | insert_light |
| dsgn.nom.heat_layer | heat_layer確認 | DSGN.SRC.nom.gate.min.v3 | 熱源消失を止める | insert_light |
| dsgn.nom.forbidden_lines | 禁止線確認 | DSGN.SRC.nom.gate.min.v3 | 禁止線違反を止める | insert_light |
| dsgn.nom.frozen_table | 凍結条件表 | DSGN.SRC.nom.gate.min.v3 | 本文前の固定 | insert_light |
| dsgn.embed.character | キャラ設計へ埋込 | DSGN.SRC.layer.meaning.v1 | 人物癖/語彙/漏れ口 | lookup |
| dsgn.embed.world_axis | 世界軸へ埋込 | DSGN.SRC.layer.meaning.v1 | 場所/物/手順/生活運用 | lookup |
| dsgn.embed.work_profile | 作品プロファイルへ埋込 | DSGN.SRC.layer.meaning.v1 | 作品全体の初期値 | lookup |
| dsgn.embed.band_profile | 帯プロファイルへ埋込 | DSGN.SRC.layer.meaning.v1 | 帯ごとの温度/偏り | lookup |
| dsgn.embed.episode_layer | 単話適用値 | DSGN.SRC.layer.meaning.v1 | 今回だけの値 | lookup |
| dsgn.backlog.layer | レイヤーバックログ | DSGN.SRC.layer.meaning.v1 | 恒久変更候補 | always_light |
| dsgn.backlog.character | キャラ戻し | DSGN.SRC.layer.meaning.v1 | 人物癖に戻す | always_light |
| dsgn.backlog.world_axis | 世界軸戻し | DSGN.SRC.layer.meaning.v1 | 世界運用に戻す | always_light |
| dsgn.backlog.band | 帯戻し | DSGN.SRC.layer.meaning.v1 | 帯傾向へ戻す | always_light |


---

# 3. DESIGNER DEFAULT LOOKUP ORDER

```text
症状/目的を確認
↓
DSGN_INTERNAL_REVERSE_LOOKUP で dsgn.* tag を引く
↓
DSGN_INTERNAL_ALL_ITEM_INDEX で source_id を確認
↓
該当正本/辞書/プリセットだけ読む
↓
梱包さんへは必要な最小応答だけ返す
↓
執筆さんへは frozen 抽出値だけ渡す
```

---

# 4. DESIGNER STOP RULE

以下を検出したら、プロジェクト側indexへ混ぜず、DSGN側バックログ/lookupとして処理する。

```text
- レイヤー正本変更候補
- キャラ設計への恒久埋込候補
- 世界軸への恒久埋込候補
- NOM差込ゲート変更候補
- 梱包さん工程変更候補
- タグ体系変更候補
```
