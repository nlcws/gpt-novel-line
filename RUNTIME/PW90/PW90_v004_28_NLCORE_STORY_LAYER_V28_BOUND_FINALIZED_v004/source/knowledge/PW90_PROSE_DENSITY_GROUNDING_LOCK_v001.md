# PW90_PROSE_DENSITY_GROUNDING_LOCK_v001

LOCK_ID: PW90_PROSE_DENSITY_GROUNDING_LOCK
APPLIES_TO_RUNTIME: pw90-v004.28-nlcore-story-layer-v28-bound
STATUS: ACTIVE_INTERPRETATION_GUARD

## Purpose

話カード / PROFILE / EPISODE_LAYER_APPLICATION の会話量・説明量・即時動作・OBJECT_FIRST指定を、
「地の文を削る」「文を短く刻む」という意味へ誤変換しないためのPW90側解釈LOCK。

このLOCKはカード値を変更しない。
v28の意味をPW90が本文施工時に誤読しないための境界だけを固定する。

## Fixed semantics

### 1. `dialogue_prose_ratio: exchange_heavy`

`exchange_heavy` は、

```text
dialogue: medium_high
prose: medium
```

である。

意味は「会話が前景」。
意味は「地の文をlowへ落とす」ではない。
会話が多いため本文が縦長になること自体は正常であり、修正理由にしない。

DENY:
- dialogue_high -> prose_low の自動変換
- dialogue_high -> narration_removal
- dialogue_high -> script_format
- dialogue_high -> micro_action_only_between_quotes

### 2. `EXPLANATION_LIMIT: low / low_to_medium_low`

説明量を減らすとは、見えていることの言い直し、テーマ説明、感情の解説、作者の納得を減らすこと。

DENY:
- explanation_low -> prose_low
- explanation_low -> scene_description_low
- explanation_low -> object_position_sound_smell_light_removal
- explanation_low -> dialogue_only_scene

説明の代わりに残すもの:

```text
場の状態
物の位置と役割
手元
身体動作
視線
距離
動線
音
匂い
光
温度
周囲の人・設備・通常運転
会話によって変わった次の動作
残ったもの
```

### 3. `immediate_action`

`immediate_action` は「反応を抽象説明せず次の具体動作へ接続する」という順序指定。

DENY:
- immediate_action -> one_action_one_sentence
- immediate_action -> short_sentence_only
- immediate_action -> clause_density_forced_low
- immediate_action -> period_density_increase

一つの動作、一つの音、一つの視線ごとに句点で切る必要はない。
同じ場面運動の中で自然につながるものは、一文または複数節で運んでよい。

### 4. `OBJECT_FIRST / visible_actions_first`

これは地の文の「何を見るか」を制御する。

DENY:
- OBJECT_FIRST -> sentence_fragmentation
- visible_actions_first -> stage_direction_prose
- objects_and_positions_first -> noun_listing
- visible_actions_first -> narration_thinning

物、空間、手順、身体を前に出しても、本文は小説の連続した地の文として施工する。

## Scene grounding

会話が続くこと自体は問題ではない。
ただし、会話が続く間に場面が消えることは禁止する。

PW90は会話場面でも、必要に応じて以下の変化を本文へ残す。

```text
誰がどこにいるか
どちらを見たか
何を触ったか
何が動いたか
周囲で何が続いているか
設備や人の通常運転
音・匂い・光・温度
会話の結果として変わった位置・手順・待ち方
```

これは説明追加ではない。
場面を本文内で生存させるための小説施工である。

## No mechanical filler

地の文を確保するために、固定間隔で文章を差し込まない。

DENY:
- every_N_dialogue_turns_insert_prose
- fixed_dialogue_to_prose_character_ratio
- fixed_period_count_target
- padding_description
- scenery_restatement_without_change

「3往復したから地の文」ではなく、物・位置・動線・通常運転・反応差が動く時に書く。

## Thinness failure signs

以下が反復して本文の主要な顔になった場合、`GROUND_PROSE_THINNESS` としてSUCCESS候補から外す。

```text
会話だけで場面が進み、場所が消える
引用符の間が一動作一文の舞台指示だけになる
「見た。止まった。歩いた。光った。」型の微小文が連続する
箇条書き相当の断片文を小説本文へ並べる
会話中に周囲の人・設備・物理状態が停止する
explanation_lowを理由に地の文まで削る
exchange_heavyを理由にprose mediumを破る
```

## Success interpretation

`exchange_heavy` の話が会話主体であることは正常。
会話主体のため縦長になることも正常。

SUCCESSで必要なのは、

```text
dialogue_foreground_preserved: true
prose_medium_not_silently_downgraded: true
scene_grounding_survives_dialogue: true
explanation_reduction_not_prose_reduction: true
sentence_length_not_forced_short_by_action_bias: true
ground_prose_thinness: false
```

話カードが明示的に別のprose量を指定した場合は、その明示値を優先する。
ただしPW90が `exchange_heavy` / `explanation_low` / `immediate_action` / `OBJECT_FIRST` から
勝手に地の文量を下げる推論は禁止する。
