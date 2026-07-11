# EXTERNAL_CONTEXT_HISTORY_RETAINED_ACTIVE_BOUNDARY_POLICY v019.16e

Status: ACTIVE_REQUIRED_READ
SUPERSEDES_ACTIVE: PROJECT_HISTORY_RETAINED_ACTIVE_BOUNDARY_POLICY_v01916a.md

## Purpose

This policy keeps runtime history/archive material and external-context history from being destroyed while preventing that history from becoming normal active source.

The word `project` in older files is legacy vocabulary. In active operation, the correct term is `external context`.

## Fixed boundary

- Runtime history/reference/source-floor archives may remain inside the runtime ZIP.
- External-context shelves may remain outside the runtime and may be read only when a requested operation requires them.
- Neither archive type is a normal active story source.
- Neither archive type makes the runtime belong to a project or destination.
- History retention is not project ownership.

## Allowed reads

History/archive reads are allowed for:

- MOUNT_TRANSFER
- version-up
- replacement audit
- reapply audit
- handoff audit
- convergence audit
- explicit user request to inspect history

## Forbidden reads

History/archive reads are forbidden as:

- automatic story source
- body condition source
- pack material source
- story-card completion source
- missing-context filler
- proof that an unread external shelf was mounted

## STOP rule

If the operation needs external context and the context is missing, unread, copied-stale, or ambiguous, return STOP. Do not infer.
