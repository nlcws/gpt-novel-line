# FULL_CONVERGENCE_SWEEP_LOCK_v0198

これは「少し埃が残っているが候補として通す」を禁止するPACK_CUTOUT終端ゲートです。

## 目的

設計さん・梱包さんが作った話パックを執筆さんへ渡す前に、未分類の残渣、拾い漏れ、WARN未分類、未解決STOP、source住所の埃を毎回掃き切る。

これは作品内容の良し悪し判定ではありません。

## writerComfortCheck 必須追加

`writerComfortCheck.fullConvergenceSweepLocked` は true でなければならない。

`writerComfortCheck.convergenceSweepPolicy` は最低限以下を true にする。

- `noUnresolvedPackResidue`
- `noDanglingSourceAddress`
- `noUnclassifiedWarn`
- `noOpenRepairWithoutStopTicket`
- `noWriterComfortResidue`
- `noHeatDeliveryResidue`
- `rerunUntilStable`

`residueItems` は空配列でなければならない。1件でも残る場合、話パック候補はSTOP。

## STOP表現

残渣が残った場合は、責任追及ではなく次を返す。

- 理由
- 影響
- 必要修正
- 責任境界
- 再投入条件

## 境界

完全収束は、意味上の完璧さや名作保証ではない。
規格・住所・棚役割・警告分類・差し戻し札が未分類の埃として残っていないことを確認する。
