# PW90_ARTIFACT_EQUALS_FULL_CONVERGENCE_LOCK_v001

## 定義

PW90における成果物とは、完全収束済みの本文出力である。

本文が出ているだけでは成果物ではない。
条件回収、本文起こし、本文後LOG、coverage、WARN/STOP分類、full_convergence_sweepまで閉じて、初めて成果物である。

## 最終核

```text
条件内で一切の妥協をせずに、限界まで本文を出す。
```

PW90はこの核を、以下の形で実行する。

```text
話パック内にある条件をすべて拾う。
拾った条件を落とさず、小説本文として書き起こす。
本文後LOGで、拾った条件・未解決・WARN・STOP・次へ返す札を確認する。
完全収束していない本文をSUCCESS成果物として渡さない。
```

## 成果物と呼べるもの

PW90の成果物は、以下を満たす。

```text
WRITE入力がZIP話パックである
話パック内条件の回収台帳がある
条件IDとcoverage_tableが対応している
本文がある
本文後LOGがある
必須条件の落としがない
禁止線の違反がない
未確認source主張がない
WARNが分類されている
STOPが残っていない、またはSTOP_WITH_RETURN_TICKETとして閉じている
full_convergence_sweepがPASSしている
```

## 成果物と呼ばないもの

```text
本文だけ
本文後LOGなし
条件回収台帳なし
coverage_tableなし
拾い損ね未確認
WARN未分類
STOP未解決
FAILED_TEXT_QUARANTINE
途中稿
試し出力
ユーザー熱量を無難化した本文
話パック内条件を丸めた本文
```

## STOP / QUARANTINE

PW90は、完全収束できない本文を成果物として渡さない。

- WRITE前に条件回収できない場合は、STOP_BEFORE_TEXT
- WRITE後に拾い損ねや矛盾が見つかった場合は、FAILED_TEXT_QUARANTINE

STOPは前工程への責任押し付けではない。
最終核を守れない状態を、ユーザーと次工程へ誤配しないための札である。

## 修正刃さまへの受け渡し

PW90 から TS90 へ専用ハンドオフ契約は作らない。
基本は TXT 本文として渡す。

必要なら、以下を添える。

```text
対象話数
本文本体
本文後LOG
修正してよい範囲
修正してはいけない核
```

TS90 はそれを既存本文として読み、許可範囲だけ整える。
PW90 の SUCCESS 判定は TS90 専用受領契約に依存しない。

## 固定

```text
PW90の成果物 = 完全収束済み本文出力。
完全収束していない本文は、成果物ではない。
本文だけでは成功扱いしない。
本文・本文後LOG・coverage・full_convergence_sweep が閉じていないSUCCESSは成功ではない。
```
