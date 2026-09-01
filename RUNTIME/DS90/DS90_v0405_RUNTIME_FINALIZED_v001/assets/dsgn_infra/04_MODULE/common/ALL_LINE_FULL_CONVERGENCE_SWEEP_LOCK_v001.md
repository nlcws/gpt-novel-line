# ALL_LINE_FULL_CONVERGENCE_SWEEP_LOCK_v001

全ライン共通の終端ゲート。

目的は「若干の埃が残っているが、まあ通る」を禁止すること。
これは作品評価・名作保証・文章評価ではなく、工程間受け渡しの未分類残渣を毎回ゼロにするための品質ロックである。

## 原則

- 毎回、完了前に残渣スイープを行う。
- 未分類の条件、未分類WARN、未解決STOP、未確認source、未処理coverage ID、未返却の差し戻し札を残さない。
- 残る場合はPASSではなくSTOPまたはWARN分類へ閉じる。
- STOPは責任追及ではなく、理由・影響・必要修正・責任境界・再投入条件で返す。
- 収束は「意味上の完全証明」ではなく、工程として見える埃を未分類のまま渡さないことを指す。

## 必須状態

```text
noUnresolvedConditionResidue: true
noUnmappedCoverageId: true
noDanglingWarnWithoutClass: true
noOpenStopWithoutTicket: true
noHandoffResidue: true
noHeatDeliveryResidue: true
nextActionOrStopDeclared: true
repeatUntilStableConfirmed: true
residueItems: []
```

## 各ラインへの適用

### 設計さん

話・条件・住所・source・layer・禁止線・WARNを未分類のまま梱包さんへ渡さない。

### 梱包さん

棚役割、本文源、制約、参照、PROCESS_ONLY、DENY_AS_BODY_SOURCE、内部source record確認状態を未分類のまま執筆さんへ渡さない。

### 執筆さん

本文前に拾う予定を立て、本文後にcoverage tableで返し、残渣が残る場合は成功本文として渡さない。

## 判定

```text
PASS:
  residueItemsが空で、全flagがtrue。

WARN:
  内容評価・熱源の弱さなど、規格を壊さない注意。分類してログへ残す。

STOP:
  未分類残渣、未解決source、coverage不一致、差し戻し札不足、棚混線。
```
