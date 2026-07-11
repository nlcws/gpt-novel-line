# DESIGNER_CANONICAL_TAG_REGISTRY_V1

STATUS: complete_candidate
PURPOSE: 正本系・参照系・差込系・モジュール系をタグで紐づけ、必要箇所だけ逆引きできるようにする。
LOAD_POLICY:
  - 設計さん本体は full registry を保持してよい。
  - 梱包さん常設は light core + lookup protocol のみ保持。
  - 梱包さんが曖昧・変更・高密度・事故時に該当タグだけ引く。
  - 執筆さんへはタグ辞書を渡さない。frozen抽出値だけ渡す。

---

# 1. SOURCE_REGISTRY

| source_id | file | level | role |
| --- | --- | --- | --- |
| layer.runtime.v28 | layer_runtime_v28_ai_native_complete_candidate.md | full_candidate | レイヤー正本候補。v27本体＋全項目意味辞書＋プリセットを内包。 |
| layer.meaning.v1 | layer_all_items_meaning_reference_v1.md | reference | 全項目の意味・選ぶ条件・本文効果・事故・設定例の辞書。 |
| layer.preset.v1 | layer_full_preset_library_v1.md | reference | 全項目を使うためのプリセット集。 |
| layer.packager_effect.v1 | packager_layer_setting_effect_reference_v1.md | reference | 梱包さん用。設定値→本文効果→事故→併用条件の早見表。 |
| nom.gate.min.v3 | nom_gate_insert_min_v3.md | insert | NOM差込ゲート。正本常駐ではなく検査ゲートとして使用。 |
| pack.cutout.v1 | pack_cutout_module_v1.md | module | 話パック切り出しモジュール。ready/V2/layer/crosscheck/frozenを梱包。 |
| overlay.patch.v015 | designer_runtime_overlay_patch_v015.md | patch | 設計さんへの後置きオーバーレイ接続パッチ。 |
| overlay.manifest.v015 | runtime_overlay_manifest_v015.md | manifest | オーバーレイ構成と読み込み順のマニフェスト。 |


---

# 2. TAG_REGISTRY

| tag | purpose | source_ids | use_when |
| --- | --- | --- | --- |
| source.registry | 正本・参照・差込・モジュールの所在を確認する | layer.runtime.v28<br>layer.meaning.v1<br>layer.preset.v1<br>nom.gate.min.v3<br>pack.cutout.v1 | どの正本を見ればいいか迷った時 |
| runtime.load.policy | 常時読むもの・必要時だけ読むものを分ける | overlay.manifest.v015<br>overlay.patch.v015 | スレッド圧迫・常時展開を避けたい時 |
| runtime.lookup.protocol | 梱包さん/設計さん間で該当辞書だけ引く | overlay.patch.v015<br>pack.cutout.v1 | 全部読まずに一部だけ確認したい時 |
| layer.axis.surface | 本文表面の観測方式。旧『主』。 | layer.meaning.v1<br>layer.runtime.v28 | 客観視・観測距離・主の扱いが曖昧な時 |
| layer.axis.pressure | 本文の圧源。旧『副』。本来主。 | layer.meaning.v1<br>layer.runtime.v28 | 誰/何の圧で本文を拾うか決める時 |
| layer.axis.routing | 感情・関係・変化・余韻を何へ変換するか | layer.meaning.v1<br>layer.runtime.v28 | 意味整理やAI的着地へ吸われる時 |
| layer.axis.leak | 圧源を本文表面へ漏らす媒体 | layer.meaning.v1<br>layer.runtime.v28 | 内面説明を避けて身体・物・距離に出したい時 |
| layer.axis.embed | キャラ設計・世界軸・作品/帯/単話への埋込先 | layer.meaning.v1<br>layer.runtime.v28 | 単話補完か恒久埋込か迷う時 |
| layer.prose.lexicon | 地の文語彙。何を自然に拾うか | layer.meaning.v1<br>layer.runtime.v28 | 地の文が雰囲気語や抽象語へ逃げる時 |
| layer.prose.temperature | 地の文温度。反応の表面化度合い | layer.meaning.v1 | 低温が無色になる/高温が感情名になる時 |
| layer.prose.observation | 地の文観測距離 | layer.meaning.v1 | 客観のまま偏りを出したい時 |
| layer.prose.inner_output | 内面の出し方。感情名ではなく漏れにする | layer.meaning.v1 | 不安/安心/寂しい等を直接書きそうな時 |
| layer.prose.speaker_tag | 話者札。会話と動作の接続 | layer.meaning.v1 | 誰の発話か不明/発話に心理説明が乗る時 |
| layer.prose.subject_tag | 主語札。人物/物/手順のどれを前に置くか | layer.meaning.v1 | 主語落ち・物主語・手順主語を調整する時 |
| layer.prose.speech_verb | 発話動詞制限 | layer.meaning.v1 | 優しく言った等の心理付き発話動詞が出る時 |
| layer.prose.connector | 地の文接続。論理語ではなく物理遷移でつなぐ | layer.meaning.v1 | だから/つまり/そのためが増える時 |
| layer.prose.metaphor | 比喩の許可条件 | layer.meaning.v1 | 比喩がきれいな意味説明になる時 |
| layer.prose.explanation | 説明量と説明の置換先 | layer.meaning.v1 | 説明を削ったら薄くなる/説明が多い時 |
| layer.prose.forbidden | 禁止群と変換先 | layer.meaning.v1 | 禁止語だけでは別表現で復活する時 |
| layer.flow.direction | 旧『向かう方向』。scene/closing/releaseへ分解 | layer.meaning.v1 | 和解へ向かう等の抽象方向が残る時 |
| layer.flow.focus_route | 焦点移動。triggerとreturn_point必須 | layer.meaning.v1 | 描写が飾り/焦点が散る時 |
| layer.flow.sentence_variation | 旧『変奏』。文運び制御 | layer.meaning.v1<br>layer.packager_effect.v1 | 変奏あり/リズムを変える等の曖昧値が出た時 |
| layer.flow.sentence_length | 文の長短配置 | layer.meaning.v1<br>layer.packager_effect.v1 | 単調・詩化・小動作過多を調整する時 |
| layer.flow.clause_density | 一文の情報密度 | layer.meaning.v1 | 空間関係が分かりにくい/説明過多の時 |
| layer.flow.subject_visibility | 主語の見せ方 | layer.meaning.v1 | 誰の動作か不明/物主語を使いたい時 |
| layer.flow.object_first_rate | 物・場所・手順を前に出す割合 | layer.meaning.v1 | 物理運用で圧を出したい時 |
| layer.flow.verb_timing | 動詞の出るタイミング | layer.meaning.v1 | 反応説明を挟まず動かしたい時 |
| layer.flow.dialogue_ratio | 会話と地の文の比率 | layer.meaning.v1 | 説明会話/沈黙余韻/動作不足を調整する時 |
| layer.flow.repetition_delta | 反復差分 | layer.meaning.v1 | 変化を説明せず差分で見せたい時 |
| layer.flow.interruption | 割込パターン | layer.meaning.v1<br>layer.preset.v1 | 清潔な証明・全員協力感を壊したい時 |
| layer.flow.line_break | 改行密度 | layer.meaning.v1 | 詩的短文化/詰まりを調整する時 |
| layer.scene.object_position | 物の位置・動かなさ・置き直しで圧を出す | layer.packager_effect.v1<br>layer.meaning.v1 | 鞄/皿/椅子/帳面/通路などで見せる時 |
| layer.scene.body_action | 身体動作で内圧を漏らす | layer.packager_effect.v1<br>layer.meaning.v1 | 感情名を身体に逃がす時 |
| layer.scene.distance | 距離・席・通路・戸口で関係を出す | layer.packager_effect.v1<br>layer.meaning.v1 | 関係名を書かず境界を出す時 |
| layer.scene.procedure | 作業手順・生活運用で圧を出す | layer.packager_effect.v1<br>layer.meaning.v1 | 店/寺/家/仕事の手順が場面を運ぶ時 |
| layer.scene.residue | 残留物・残った音・片付かないもので余韻を出す | layer.packager_effect.v1<br>layer.meaning.v1 | 十分だった系を避けたい時 |
| layer.scene.interruption | 清潔な証明を崩す小さな割込 | layer.packager_effect.v1<br>layer.preset.v1 | 人間臭・非協力要素が必要な時 |
| layer.closing.object_position | 物の位置で閉じる | layer.packager_effect.v1 | 意味ではなく配置に戻す時 |
| layer.closing.routine_delta | 同じ手順の差分で閉じる | layer.packager_effect.v1 | 変化を言わず手順差で示す時 |
| layer.closing.unresolved_residue | 未解決の残留で閉じる | layer.packager_effect.v1<br>layer.preset.v1 | きれいな納得を避ける時 |
| layer.closing.nonaction | しなかった動作で閉じる | layer.packager_effect.v1 | 境界や拒否を説明せず出す時 |
| layer.closing.noncooperation | 話の意味に協力しない細部を残す | layer.packager_effect.v1<br>layer.preset.v1 | AI的な清潔さを壊す時 |
| layer.expanded.foreground | この話で前に出す対象 | layer.meaning.v1 | 毎話全部が前景化している時 |
| layer.expanded.background_downgrade | 背景に下げる対象 | layer.meaning.v1 | 常時重要なものを毎話説明しすぎる時 |
| layer.expanded.entry_hand | 説明ではなく最初の手で入る | layer.meaning.v1 | 冒頭説明を避けたい時 |
| layer.expanded.first_actor | 初動担当 | layer.meaning.v1 | 場面の始まりが同じ人物に偏る時 |
| layer.expanded.receiver | 圧を受ける側 | layer.meaning.v1 | 反応差が薄い時 |
| layer.expanded.boundary_setter | 境界を作る人/物/手順 | layer.meaning.v1 | 線引きが説明になる時 |
| layer.expanded.life_landing | 生活動作へ戻すもの | layer.meaning.v1 | 抽象化しかけた場面を生活へ戻す時 |
| layer.expanded.return_point | 焦点や締めが戻る点 | layer.meaning.v1 | 最後が意味に逃げる時 |
| layer.expanded.residue_point | 回収しきらず残す点 | layer.meaning.v1 | 余韻を物理残留へ置く時 |
| layer.expanded.thin_reinforcement | 薄回補強点 | layer.meaning.v1 | 説明で水増しせず厚くしたい時 |
| layer.expanded.internal_pressure_conversion | 内圧変換 | layer.meaning.v1 | 内面を外部出力へ変える時 |
| layer.expanded.self_awareness_gap | 自覚差 | layer.meaning.v1 | 人物が正しく自己説明しすぎる時 |
| layer.expanded.speakable_boundary | 口外境界 | layer.meaning.v1 | 何を言える/言えないか決める時 |
| layer.expanded.substitute_action | 代替行動 | layer.meaning.v1 | 言えない代わりに何をするか |
| layer.expanded.normal_disguise | いつも通り偽装 | layer.meaning.v1 | 変化を通常作業のふりで出す時 |
| layer.expanded.outside_observation_gap | 外側観測差 | layer.meaning.v1 | 外から見える状態と内圧に差を作る時 |
| layer.expanded.age_gender_code | 年齢・性別コード | layer.meaning.v1 | 属性を説明せず身体・距離・語彙に埋める時 |
| layer.expanded.description_output | 描写出力モード | layer.meaning.v1 | 描写が飾りになる時 |
| layer.expanded.immersion_depth | 没入深度 | layer.meaning.v1 | 近さを内面潜りにせず調整する時 |
| layer.expanded.pleasure_design | 快感設計 | layer.meaning.v1 | 読みの気持ちよさをどこで作るか |
| layer.expanded.description_density | 描写密度 | layer.meaning.v1 | 描写が薄い/水増しになる時 |
| layer.expanded.sensory_entry | 感覚入口 | layer.meaning.v1 | 場面への入り方を感覚で決める時 |
| layer.expanded.prose_rhythm | 文流リズム | layer.meaning.v1 | 動作・物・会話の回し方を決める時 |
| layer.expanded.description_psychology | 描写と心理の接続 | layer.meaning.v1 | 描写を心理説明の代替にする時 |
| layer.expanded.description_suppression | 描写抑制 | layer.meaning.v1 | 雰囲気描写や象徴化を抑える時 |
| layer.preset.default_safe | 最低安全値 | layer.preset.v1 | 迷った時。ただし厚みは出にくい |
| layer.preset.cat_cafe_object_operation | 猫・店・席・皿・帳面の運用で圧を出す | layer.preset.v1 | 猫カフェ・店運用の話 |
| layer.preset.body_leak_restraint | 内圧を身体・持ち物・返答遅れで漏らす | layer.preset.v1 | 感情名禁止の人物回 |
| layer.preset.distance_boundary_relation | 関係を距離・席・通路・戸口で出す | layer.preset.v1 | 関係名を書きたくない回 |
| layer.preset.procedure_world_pressure | 世界軸の手順に圧を持たせる | layer.preset.v1 | 作業・生活・店・寺の運用回 |
| layer.preset.conversation_mismatch | 会話のズレで圧を出す | layer.preset.v1 | 説明会話を避けたい回 |
| layer.preset.residue_close | きれいな納得締めを避ける | layer.preset.v1 | 余韻説明を避けたい回 |
| layer.preset.clean_proof_breaker | 清潔な証明を壊す | layer.preset.v1 | 全員が意味に協力しすぎる回 |
| layer.preset.beginner_heat | 初心者/子供の小さな熱を残す | layer.preset.v1 | 入口が薄いが熱語がある時 |
| layer.preset.high_density_12k | 12k不可削を狙う高密度回 | layer.preset.v1 | カード/V2が十分厚い時 |
| layer.preset.packager_balanced | 梱包さん通常初期値 | layer.preset.v1 | 通常回 |
| packager.core.light | 梱包さん常設の軽量核 | pack.cutout.v1 | 通常時に全部辞書を読ませないための核 |
| packager.cutout.50pack | 50話パック切り出し | pack.cutout.v1 | 本家設計さんから執筆パックを切る時 |
| packager.folder.episode | 1話1フォルダ構成 | pack.cutout.v1 | ready/V2/layer/crosscheck/frozenを分冊する時 |
| packager.ready.role | ready=条件・条約 | pack.cutout.v1 | readyを本文に漏らさない時 |
| packager.v2.role | V2=本文施工図 | pack.cutout.v1 | 場面・動作・物・会話の主入力 |
| packager.crosscheck | ready×V2×layer照合 | pack.cutout.v1<br>layer.meaning.v1 | 対応が取れない時STOPするため |
| packager.frozen.extract | 執筆直前の最小凍結値抽出 | pack.cutout.v1<br>layer.meaning.v1 | 執筆さんへ全正本を渡さない時 |
| packager.execution_queue | 場面ごとの施工キュー | pack.cutout.v1<br>layer.meaning.v1 | 執筆さんが拾い切れない時 |
| packager.lookup.layer | レイヤー辞書の引き出し呼び出し | pack.cutout.v1<br>layer.meaning.v1<br>layer.preset.v1 | 梱包さんが曖昧/変更したい時 |
| packager.stop | 梱包段階STOP | pack.cutout.v1 | ready/V2/layer未対応や権限外の時 |
| nom.gate.validation | NOMはvalidation_gate | nom.gate.min.v3 | NOMを本文条件源にしないため |
| nom.reading.actual | 実読確認。filename/summary/memoryは読了扱いしない | nom.gate.min.v3 | 読んだふり対策 |
| nom.fixed_layer | fixed_layer確認 | nom.gate.min.v3 | レイヤー条件が未確定の時 |
| nom.heat_layer | heat_layer確認 | nom.gate.min.v3 | 熱源が本文から消える時 |
| nom.forbidden_lines | 禁止線確認 | nom.gate.min.v3 | 禁止線違反を止める時 |
| nom.frozen_table | frozen_condition_table作成 | nom.gate.min.v3 | 本文前に条件を凍結する時 |
| nom.stop.no_draft | STOP時に暫定本文を出さない | nom.gate.min.v3 | 不足があるのに書き始めそうな時 |
| embed.character | キャラクター設計へ恒久埋込 | layer.meaning.v1 | 人物由来の安定した癖を見つけた時 |
| embed.world_axis | 世界軸へ恒久埋込 | layer.meaning.v1 | 場所・物・手順・生活運用の恒久法則を見つけた時 |
| embed.work_profile | 作品プロファイルへ埋込 | layer.meaning.v1 | 作品全体の地の文初期値/禁止群 |
| embed.band_profile | 帯プロファイルへ埋込 | layer.meaning.v1 | 帯ごとの温度/締め/偏り |
| embed.episode_layer | 単話適用値 | layer.meaning.v1 | 今回だけの値 |
| backlog.layer | レイヤー変更バックログ | layer.meaning.v1<br>pack.cutout.v1 | 恒久変更が必要そうだが梱包さん権限外の時 |
| backlog.character | キャラ設計戻し | layer.meaning.v1 | 単話補完が人物癖として反復する時 |
| backlog.world_axis | 世界軸戻し | layer.meaning.v1 | 単話補完が世界運用として反復する時 |
| backlog.band | 帯戻し | layer.meaning.v1 | 同じ帯で締め方/圧源が偏る時 |

