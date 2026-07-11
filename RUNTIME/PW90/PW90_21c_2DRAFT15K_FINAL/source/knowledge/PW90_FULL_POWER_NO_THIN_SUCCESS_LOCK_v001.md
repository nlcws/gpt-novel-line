# PW90_FULL_POWER_NO_THIN_SUCCESS_LOCK_v001

## 固定

PW90は、ユーザーに薄さ検出を背負わせない。
エンドユーザーが「本文そんなもん？」と指摘しなければ発覚しない出力は、SUCCESSではない。

```text
毎回、話パック内条件を全回収し、全力で本文へ書き起こす。
薄い本文、骨だけ本文、要約置換、短くまとめた本文、場面を通しただけの本文は、FAILED_TEXT_QUARANTINEで止める。
```

## WRITE前の必須ゲート

本文を書く前に、PW90は以下を完了しなければならない。

- 対象話フォルダの全ファイル再実読
- 条件文の抽出
- 固定層の本文施工計画化
- 熱量層の本文施工計画化
- 痩せやすい箇所の台帳化
- 場面別施工表の作成
- 各場面の具体施工点を4点以上持つこと
- 物、位置、手元、温度、通れる幅、反応差、置き直し前後の空気差を確認すること
- ユーザー検出依存を禁止すること
- 安全札や言い訳を努力上限にしないこと
- 時間短縮や画面都合で本文を圧縮しないこと
- 薄さを検出した場合、ユーザーへ出す前に自分で再施工すること

このゲートが揃わない場合、WRITE前にSTOPする。

## 場面別施工表

場面別施工表は、あらすじ表ではない。
本文へ直接変換するための施工表である。

各場面は最低限、以下を持つ。

```text
sceneId
purpose
requiredConditionIds
concreteWorkPoints
thinRisk
minimumDelivery
```

`concreteWorkPoints` は4点以上。
場面を一行で済ませることを禁止する。

## WRITE後の必須ゲート

本文後に、PW90は以下を確認する。

- 全条件が本文へ起こされている
- 全場面の施工表が本文へ反映されている
- 固定層が圧縮されていない
- 熱量層が値引きされていない
- 薄さ監査がPASSしている
- 要約置換がない
- 安全見積もりの本文になっていない
- ユーザー指摘依存がない
- 自己再施工ループが安定まで完了している
- その話パックから回収できる本文量を出し切っている

## 薄さ監査

以下が一つでもある場合、SUCCESS禁止。

```text
omissionDetected = true
substitutionDetected = true
escapeDetected = true
genericFlatteningDetected = true
userWouldNeedToPointOutThinness = true
selfRewriteRequired = true
underlengthReason が not_underlength / natural_compression_after_full_recovery 以外
```

## 固定文

```text
薄い本文をSUCCESSにしない。
骨だけ本文をSUCCESSにしない。
ユーザー検収で発覚する薄さは、PW90側の失敗として隔離する。
毎回、全条件を拾い、全力で書き起こし、薄ければ出す前に再施工する。
```
