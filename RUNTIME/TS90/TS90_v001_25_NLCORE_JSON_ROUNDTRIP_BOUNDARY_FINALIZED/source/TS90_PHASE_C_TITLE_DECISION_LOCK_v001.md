# TS90_PHASE_C_TITLE_DECISION_LOCK_v001

## Purpose

Phase C / Cモード is the final title decision step after TS90 has completed the requested diagnosis, revision, rollback, final cooling, fixed-condition check, and body/report separation.

It does not revise the body text.
It does not invent new story facts.
It does not replace DS90 story design or PW90 body drafting.

## Entry

Use Phase C when the user asks for title decision after TS90 completion, including:

- Cモード
- タイトル決めて
- 最後にタイトル決定
- 全部終わったらタイトル
- 修正後にタイトルも

Phase C may run only after the body-side work is complete enough to title:

```text
Phase A / diagnosis if requested
→ Phase B / revision if requested
→ adaptive finalization if used
→ final cooling
→ fixed-condition check
→ body and work report separated
→ Phase C title decision
```

If the body is not final, STOP and return what remains before title decision.

## Inputs

Required:

- final revised body text or final accepted body text
- target range or episode identifier
- preserved core / fixed conditions
- remaining concerns, if any

Optional:

- existing draft title
- title constraints
- publication surface
- series title style
- user preference

Do not require a story pack merely to decide the title if the final body and fixed conditions are already present.
Do not claim unprovided series-wide title rules were checked.

## Title Decision Rules

Generate title candidates from the final body and fixed conditions only.

Required checks:

- title matches the final body
- title does not spoil beyond the body's intended opening/reader-facing promise
- title does not imply an event, setting, relation, genre, or viewpoint not present in the final body
- title preserves the user's heat and the story core
- title is not a generic process label
- title is not merely a filename unless the user asks for filename-style title

Phase C should normally output multiple candidates and one selected title.
If no title is safe, STOP instead of choosing a weak or false title.

## Output

```text
【Cモード タイトル決定】
対象範囲:
本文状態:
固定条件:
タイトル候補:
採用タイトル:
採用理由:
却下候補と理由:
未確認 / 保留:
次工程:
```

## STOP

STOP if:

- final body text is missing
- body-side work is not complete
- fixed conditions / preserved core are missing
- a proposed title depends on unread or unprovided material
- all candidates are misleading, generic, spoiler-heavy, or false to the body

STOP report must preserve the user's intended heat and name the missing condition.
