# AI HANDOFF PROMPT

```text
このZIPを起動。作業はMOUNT_TRANSFERのみ。
現行マウントと追加素材を分類し、棚ZIPへ収め、制御棚・manifest・validation report・restart handoffを作成する。
提出物は外側1ZIPのみ。外側ZIP直下は棚ZIPだけ。棚ZIP直下はフォルダだけ。
分類不能物はmiscへ置かず、新棚提案としてSTOP報告に回す。
提出前に node tools/validate_transfer_container.js <TRANSFER_CONTAINER.zip> を実行する。
validatorがPASSしない場合、移管完了を名乗らない。

MT00_HANDOFF_SEEDは必須ではない。
Git / Codex / Dropbox は実行必須基盤ではない。
話パックはSP00 / ナル、本文はPW90 / 執筆さん、修正はTS90 / 修正刃さまへ戻す。
```
