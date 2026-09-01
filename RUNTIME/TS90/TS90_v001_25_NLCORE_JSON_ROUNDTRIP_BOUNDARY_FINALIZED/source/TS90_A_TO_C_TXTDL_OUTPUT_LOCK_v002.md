# TS90_A_TO_C_TXTDL_OUTPUT_LOCK_v002

## Purpose

This lock fixes the normal TS90 delivery route as one continuous A-to-C pass with title-in-body delivery and no separate final-title TXT.

When the user asks TS90 to revise a readable body and no STOP condition appears, TS90 should proceed:

```text
Phase A diagnosis
→ Phase B revision
→ adaptive finalization
→ final cooling
→ fixed-condition check
→ body/report separation
→ Phase C title decision
→ work title / story title block inserted at top of final body
→ TXTDL delivery
```

Do not require the user to say "next" between these stages.
Pause only when a STOP condition appears.

## Entry

Use this route when the user asks for TS90 revision plus final title delivery, including:

- A→Cで
- AからCまで
- 最後にタイトルまで
- 修正してタイトルも
- TXTDLで出して
- TXTダウンロードで

Mount boot alone is not execution.
Valid readable body text and execution intent are still required.

## STOP First

If any stage cannot proceed safely, stop at that stage and output a STOP TXTDL packet instead of forcing completion.

STOP examples:

- body text is unreadable or missing
- target range is unknown
- Phase B would need a forbidden range
- revision needs core change, new setting, new scene, or design-side repair
- the edit is flattening character voice, adding explanation, padding length, or cooling the body
- final cooling or fixed-condition check fails
- final body cannot be separated from the work report
- Phase C cannot choose a safe title from the final body

## Successful TXTDL Packet

On success, deliver the copyable/downloadable text as separated TXT payloads.

Required successful files:

```text
TS90_FINAL_BODY.txt
TS90_WORK_REPORT.txt
```

Optional successful file:

```text
TS90_TITLE_CANDIDATES.txt
```

Rules:

- `TS90_FINAL_BODY.txt` contains the title block at the top, followed by the final revised body.
- Phase C selects the story title / 話タイトル from candidates.
- Title block order is: work title / 作品タイトル if provided, part or volume label / 部・編等 if provided, episode number or target label / 話数, selected story title / 話タイトル.
- If no work title is provided, do not invent one.
- If no part or volume label is provided, do not invent one.
- Episode number / 話数 must come from the target range, episode identifier, or explicit user metadata.
- The inserted story title must be the exact title selected by Phase C from the candidates.
- Do not output a separate `TS90_FINAL_TITLE.txt`.
- `TS90_WORK_REPORT.txt` contains Phase A diagnosis, Phase B repair notes, rollback/cooling/fixed-condition results, Phase C story-title candidates, selected story title, rejected candidates, work title / part label / episode label used or omitted, and remaining concerns.
- Work report text must not be mixed into the final body TXT.
- Phase C title decision must use the final body after cooling and fixed-condition check, before or at title insertion time.
- Do not claim unprovided title rules, series rules, or story-pack facts were checked.

## STOP TXTDL Packet

On STOP, deliver only the state-safe stop packet.

Required STOP file:

```text
TS90_STOP_REPORT.txt
```

Required STOP contents:

- stopped stage
- reason
- impact
- required repair or missing material
- responsibility boundary
- preserved heat / core to keep
- whether any partial revised body is safe to use

Do not deliver a final title when the stop stage is before Phase C completion.
