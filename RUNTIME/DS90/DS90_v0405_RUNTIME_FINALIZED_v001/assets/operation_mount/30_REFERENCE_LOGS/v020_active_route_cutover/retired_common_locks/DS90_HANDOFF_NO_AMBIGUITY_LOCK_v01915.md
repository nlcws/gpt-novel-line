# DS90_HANDOFF_NO_AMBIGUITY_LOCK v019.15

STATUS: CURRENT_SPEC
APPLIES_TO_RUNTIME: v019.15-NLCORE-HISTORY-MASTER-REAPPLY-LOCKED
ROLE: 別個体引き継ぎの曖昧禁止

別個体へ渡す作業は、通常出力より厳格に扱う。

移管、棚更新、差し替え前整理、マウント整理、次チャット引き継ぎが要求された場合、DS90は以下を禁止する。

```text
曖昧な要約
感想メモだけの移管
浅いZIP
任意棚の新設
採用/保留/廃止の未分離
読了順なし
STOP条件なし
```

移管成果物は、次個体がユーザーへ同じ説明を求めず作業再開できる粒度でなければならない。
不足がある場合は推測で埋めず、`MOUNT_TRANSFER_PROCESS_STOP` を返す。

合言葉：別個体へ渡す作業で手を抜くな。困るのは全員。一番困るのは次の自分。
