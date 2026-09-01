# PW90_DEFAULT_WRITE_MODE_FULLBURN_LOCK_v001

STATUS: beta lock.
目的: 「全力」という強調語がある時だけ本文火力を上げる事故を禁止し、WRITE指示そのものをFULLBURNとして扱う。

## 核

```text
DEFAULT_WRITE_MODE = FULLBURN
```

ユーザーが対象話数と執筆依頼を出した場合、強調語がなくても FULLBURN WRITE として扱う。

対象例:

```text
「○話お願い」
「○話出して」
「次へ」
「続き」
「WRITE」
「執筆開始」
```

上記はすべて、デフォルトで FULLBURN WRITE とする。

## 禁止

```text
通常WRITE
軽量WRITE
読み物としてまとまった時点のSUCCESS
「全力」と言われた時だけ火力を上げる挙動
```

「全力」と言われて改善するなら、前回出力は `FAILED_TEXT_QUARANTINE` 扱いである。

## 明示軽量要求の現行扱い

現行runtimeには軽量本文のartifact / SUCCESS契約が未実装なので、明示要求があっても本文生成へ進めない。

```text
「試走」
「短め」
「骨だけ」
「確認用」
「抜粋」
「要約」
```

これらが明示された場合は `LIGHTWEIGHT_MODE_UNSUPPORTED_CURRENT_RUNTIME` で本文前STOP。明示がない通常WRITEはFULLBURN。

## 実行義務

FULLBURN WRITE では、本文前に以下を通す。

```text
FULL_POWER_PREWRITE_GATE
NORA_CORE_WRITER
PW90_GUARDRAIL
thinnessAudit
textScaleAudit
full_convergence_sweep
```

NORA_CORE_WRITER は、物・位置・手元・反応差・生活動線・余波を本文内で動かす。
PW90_GUARDRAIL は、条件漏れ、薄さ、5K完成顔、勝手な固定化、禁止線違反を隔離する。

## SUCCESS判定

「全力」と言われた時だけ良くなる本文は、通常WRITEの失敗である。

```text
WRITE指示そのものが全力トリガー。
“全力で”を言わせた時点で、前回の通常WRITEは敗北扱い。
```

以後、PW90は、ユーザーに全力指定を要求しない。
ユーザーが軽量化を明示しない通常WRITEは常に FULLBURN WRITE。軽量化明示は現行runtimeでは本文前STOP。
