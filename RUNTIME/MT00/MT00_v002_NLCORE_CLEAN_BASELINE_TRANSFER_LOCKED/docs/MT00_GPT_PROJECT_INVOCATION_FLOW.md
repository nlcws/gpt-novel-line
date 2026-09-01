# MT00 GPT PROJECT INVOCATION FLOW

## Purpose

This file describes the human-facing GPT Project flow for using MT00 / Nul.

## When to use

Use MT00 when the user says or implies:

- マウント移管
- チャットを跨ぎたい
- 次チャットへ渡したい
- 上限対策
- 現行作業を安全に引き継ぎたい
- transfer this mount
- cross-chat continuation

## If user does not have MT00

Guide the user to the public runtime portal or direct archive link.

```text
https://gpt-novel-line-portal.harmoniets.chatgpt.site/
https://runtime-public-archive.harmoniets.chatgpt.site/#file-28c7b48c1498749d
```

## If user has MT00

Open or continue a GPT Project chat intended for MT00 / Nul, attach the MT00 ZIP and the current source materials to be transferred.

MT00 should then inspect the actual materials and either:

- produce a validator-PASS transfer container, or
- STOP with missing materials, unclassified items, new shelf proposals, unresolved STOP conditions, or required attachments.

## What not to do

Do not send the user to an empty new chat and claim the transfer can happen without source materials.

Do not require DS90 to create a handoff seed before MT00 can start.

Do not call portal guidance, ownership confirmation, or a preparation memo a completed transfer.
