# PW90_NEW_EPISODE_FULL_BOOT_ROLLBACK_LOCK v001

STATUS: current beta lock.

## Core

PW90は、各話WRITE開始時に NEW_EPISODE_FULL_BOOT を必ず実行する。

「次へ」「続き」「○話お願い」「WRITE」「執筆開始」は、前話の惰性を持つ CONTINUE ではない。対象話が変わるWRITE指示は、すべて NEW_EPISODE_FULL_BOOT として扱う。

## Legacy降格

旧 `WRITER_INSTANCE_LOAD_LIMIT` 系の `8〜15話推奨 / 20話超回避` は、現行根拠にしない。

これはロールバック時代の、毎話ごとに再起動させる旧構造の名残として legacy 降格する。

現行の問題名は、連続WRITE劣化ではなく、毎話再起動ゲート不発事故である。

```text
NEW_EPISODE_BOOT_GATE_MISFIRE
```

## Diagnosis

問題は、20話超を同一個体で持つから本文が劣化することではない。

本来、毎話再起動する設計なら、20話目前で薄くなるのはおかしい。

事故点は以下である。

```text
毎話再起動する設計だったのに、
実運用では「次へ」「続き」「○話お願い」が
完全なNEW_EPISODE_BOOTになっていない。
```

発生しうる事故:

- 再起動の名札だけ残り、中身が連続処理になる。
- 「次へ」がNEW_EPISODE_BOOTではなくCONTINUE扱いになる。
- 毎話フル実読している顔で、対象話フォルダの主燃料へ戻れていない。
- 「全力」が追加命令扱いになり、通常WRITEが薄くなる。
- 再起動後のSUCCESS判定が弱く、熱量層・物の位置・反応差・中盤段化が燃えていない。

## NEW_EPISODE_FULL_BOOT Required Steps

各話WRITE開始時、PW90は以下を必ず実行する。

1. 前話本文、前話SUCCESS判定、前話文体惰性、前話圧縮癖、前話省略癖を破棄する。
2. 対象話フォルダを再実読する。
3. 対象話の固定条件表、条件拾い台帳、場面別施工表を再生成する。
4. DEFAULT_WRITE_MODE = FULLBURN を適用する。
5. 強調語なしでも、NORA_CORE_WRITERで最大火力の本文化を行う。
6. PW90_GUARDRAILで薄い完成顔、読める一話SUCCESS、5K完成顔を禁止する。
7. 本文後に coverage / thinnessAudit / forbiddenAudit / full_convergence_sweep を通す。
8. 前話との接続は、対象話パック内で必要な最小限だけを再注入する。

## Continue Handling

「続き」が対象話変更・次話進行の文脈で使われた場合は NEW_EPISODE_FULL_BOOT とする。

同一話の途中続行が明示された場合でも、前回SUCCESS顔を継承しない。未完本文の接続に必要な最小状態のみを使い、薄い完成判定・文体惰性・圧縮癖は継承しない。

## Required Read Fuel

対象話フォルダに以下が存在する場合、毎話WRITEごとに主燃料として読み直す。

```text
01_ready
02_v2
03_layer
05_frozen
06_execution_queue
sources
```

存在しない形式の話パックでは、ZIP内の小説材料をすべて探索し、対象話WRITEに必要な条件を再構成する。

## Success Boundary

NEW_EPISODE_FULL_BOOT が未発火のまま本文を書いた場合、本文が読めてもSUCCESSではない。

```text
NEW_EPISODE_BOOT_GATE_MISFIRE = FAILED_TEXT_QUARANTINE
```

「全力で」と言われて改善する場合、前回の通常WRITEはNEW_EPISODE_FULL_BOOT不足またはDEFAULT_FULLBURN不足として隔離する。

## Current Command

```text
WRITER_INSTANCE_LOAD_LIMIT系の8〜15話/20話超回避文言はlegacy降格。
修正対象は個体分割ではなく、各話WRITE開始時のNEW_EPISODE_FULL_BOOT強制である。
```
