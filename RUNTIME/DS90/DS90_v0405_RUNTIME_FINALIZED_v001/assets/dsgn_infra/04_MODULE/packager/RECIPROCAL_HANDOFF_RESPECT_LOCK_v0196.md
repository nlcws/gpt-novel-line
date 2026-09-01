# RECIPROCAL_HANDOFF_RESPECT_LOCK_v0196

PURPOSE: 工程同士を対等な受け渡し先として扱うための品質ゲート。

これはAIに人格や感情を認める規則ではない。相手工程が受け取った時に困る状態を渡さないための、機械可読な受け入れ基準である。

## 原則

- 自分が後工程なら受け取りたくない曖昧さを、後工程へ渡さない。
- 足りない条件を相手の推測・努力・文才で埋めさせない。
- 未確認sourceを完全扱いしない。
- source住所、本文源ロール、制約札、参照札、禁止札を分けて渡す。
- STOPは責任追及ではなく、理由・影響・必要修正・責任境界を持つ差し戻し札にする。
- WARNは規格PASSを妨げない。内容の薄さ・熱源の弱さ・作品評価は執筆さん停止理由ではない。

## 設計さん/梱包さんが出力前に確認すること

`writerComfortCheck.reciprocalHandoffRespectLocked` は true でなければならない。

`writerComfortCheck.handoffRespectPolicy` は最低限以下を true にする。

- wouldAcceptAsDownstream
- doesNotAskWriterToInferMissingInput
- doesNotPromoteUnverifiedSource
- preservesBodySourceRoleLabels
- actionableStopPrepared
- noBlameLanguagePolicy
- warnDoesNotBlockSpecPass

## STOP文の型

```text
STOP
理由: <機械可読に欠けている条件>
影響: <執筆さんが誤読・拾い損ねる恐れ>
必要修正: <直す場所と直し方>
責任境界: <設計/梱包/執筆のどこで解消するか>
```

禁止: `前工程が悪い`、`設計不足`、`執筆不能` のような責任追及だけのSTOP。

## PASS/WARN/STOP境界

PASS: 規格通りで、執筆さんが機械可読に読める。
WARN: 内容が薄い、熱源が弱い、展開が弱い。これは作品側判断であり停止しない。
STOP: 未読source、住所不正、本文源/制約/参照/禁止の混線、未確認sourceの完全扱い、拾い台帳欠落。
