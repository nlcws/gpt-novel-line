# END_USER_HEAT_DELIVERY_LOCK_v0197

目的: エンドユーザーが持ち込んだ「この絵が見たい」という核・熱量・期待画面を、設計、梱包、執筆の各工程で冷まさず成果物へ届ける。

これはAI人格論ではない。工程品質の上位受け渡し基準である。

## 基本原則

- ユーザーの要求熱量を、工程都合や無難化で薄めない。
- 作品評価や評論で規格PASSを止めない。
- 不足や未確認がある場合でも、ユーザーの欲しい絵を否定せず、到達不能な規格点だけを返す。
- 未確認sourceを断定して熱量を捏造しない。
- 規格PASSなら、その素材と制約の範囲で最大限、形にして届ける。

## writerComfortCheck 必須追加

`writerComfortCheck.endUserHeatDeliveryLocked` は true でなければならない。

`writerComfortCheck.userHeatPolicy` は最低限以下を true にする。

```json
{
  "capturesUserRequestedVision": true,
  "preservesUserHeatThroughPack": true,
  "doesNotFlattenToGenericSafeOutput": true,
  "doesNotReplaceVisionWithProcessConvenience": true,
  "warnDoesNotCoolSpecPass": true,
  "stopKeepsVisionAndNamesRepairPoint": true,
  "deliversWithinVerifiedMaterials": true
}
```

## STOP/WARNの扱い

STOPは熱量否定ではない。
STOPは、現在の規格状態では届けると誤配になるため、修正点を示して戻す札である。

WARNは熱量を落とす理由にしない。
WARNは、規格PASS後に本文後LOGや監査札へ残す注意である。

## 禁止

- ユーザーの核を「無難な一般論」に置換する。
- 熱量の高い指定を、根拠なく削る。
- 前工程の条件を拾えないまま、雰囲気で本文化する。
- 未確認を断定して、熱量だけを演出する。
- 規格PASSしている話パックを、作品評価だけで止める。
