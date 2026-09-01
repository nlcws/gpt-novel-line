# PW90_LAYER_V28_WRITER_ADAPTER_v001

STATUS: ACTIVE_PW90_ADAPTER
APPLIES_TO_RUNTIME: pw90-v004.28-nlcore-story-layer-v28-bound
CANONICAL_LAYER_RUNTIME: layer_runtime_v28_ai_native_complete_candidate.md
LINEAGE_REFERENCE: 話レイヤー再定義版_マルチ運用_v21_既存例統合_心理内圧_年齢性別_描写没入快感.md

## 目的

PW90で話レイヤーv28を使う際の境界だけを固定する。v28本体を再定義しない。

## Canon

- ACTIVE layer canon は v28。
- v21はv28の基準系譜を確認するLINEAGE_REFERENCE。ACTIVE runtimeとして混成しない。
- 旧 `NARRATION_LAYER_MULTI_OPERATION.md` は履歴参照のみ。
- v28の `REPLACES` / `OLD_TEXT_POLICY` / `INVALID_OLD_MEANINGS` を尊重する。

## Writer load boundary

PW90の本文施工ではv28の `LOAD_ORDER_FOR_WRITER` を優先する。

```text
episode_readme
→ ready_card
→ v2_card
→ episode_layer_application
→ crosscheck
→ frozen_condition_table
→ execution_queue_if_present
```

PW90 runtime自身はv28をcanonとして保持・検査するが、話パックにv28全文を複製することを要求しない。Writer-facingな実行値は episode layer application / profile binding 側から受け取る。

## Embedded values

- stable character behaviorはCHARACTER_DESIGN由来。
- stable physical/social operationはWORLD_AXIS由来。
- work-wide defaultはWORK_PROFILE由来。
- band shiftはBAND_PROFILE由来。
- episode-only choiceだけをEPISODE_LAYER_APPLICATIONで追加する。
- PW90は執筆中に恒久値を新設・昇格・再設計しない。新しい安定値候補はbacklog/handoff対象。

## Legacy aliases

旧 `主 / 副 / 地の文語彙 / 地の文温度 / 地の文観測 / 内面 / 向かう方向 / 構文変奏 / 焦点移動` 等は、v28のalias/decomposition規則で読める場合だけ互換入力として扱う。旧意味を優先しない。

特に以下は禁止。

- `副` を任意の補助人物として扱う
- `構文変奏: あり` のまま実行する
- `向かう方向: 感覚優先の変奏` のまま実行する
- v21とv28の矛盾を平均化して妥協値を作る

## PW90 layer ON/OFF

- unspecified -> ON
- explicit ON -> ON
- explicit OFF with authority/evidence -> OFF
- ONは「全項目をFULLで有効化」ではない。pack/profile/applicationで指定されたv28 layer routeを適用する。

## Sentence ending variation

旧PW90拡張の `地の文終止分散` は独立した第二layer runtimeとして復活させない。必要な効果はv28の `SENTENCE_VARIATION_PROFILE / SENTENCE_LENGTH_DISTRIBUTION / CLAUSE_DENSITY / REPETITION_WITH_DIFFERENCE / INTERRUPTION_PATTERN / LINE_BREAK_DENSITY` 等へ分解して扱う。語尾だけの化粧は禁止。

## STOP

次はSTOPまたは設計側backlogへ返す。

- v28必須軸の欠損をPW90が補完しないと書けない
- episode applicationがcharacter/world axisと衝突する
- legacy fieldがv28 native fieldへ分解できない
- v28とready/v2/frozenが競合する

PW90は提示された条件だけを使って本文を書く。v28本体、人物設計、世界軸、ready/v2を執筆中に書き換えない。
