# DS90_TRANSFER_PACK_PREP_ZERO_THINK_AND_CONVERGENCE_LOCK_v01916e

Status: ACTIVE_REQUIRED_READ
Scope: MOUNT_TRANSFER / PACK_CUTOUT / artifact submission / handoff

This lock exists because three lanes are minimum fixed infrastructure, not optional convenience.

## 0. Runtime neutrality first

The runtime is neutral. It belongs to no project, story, Dropbox folder, chat thread, destination, or workspace.

Any external project/story/material shelf is external context. It may be read, verified, preserved, or replayed only when the requested operation requires it. It is not runtime identity.

A receiving instance must be able to start the runtime without being inside a project. If no external context is mounted, the runtime state is `RUNTIME_READY_EXTERNAL_CONTEXT_UNMOUNTED`, not project STOP.

## 1. Zero-think downstream rule

Anything handed to another ChatGPT instance, another runtime, Packager, Writer, Fixer, or NORA must be restart-ready.

The recipient must not have to infer:

- which ZIP is current
- which runtime packet is current
- which files to read first
- which external shelves, if any, are mounted / unread / absent
- which items are confirmed, held, rejected, or unresolved
- whether the output is a candidate, STOP packet, or deliverable artifact
- whether the source was actually read
- whether convergence is complete

If the recipient would need to ask basic routing questions before starting, the handoff is STOP.

## 2. Mount transfer hard gate

MOUNT_TRANSFER is not a summary memo and not a project handoff by default.

A valid transfer output must preserve any existing external shelf topology and shelf meanings that the operation explicitly targets. It must include, at minimum:

- current runtime ZIP identity and read status
- external-context mount status: absent / present-unread / read
- 021 first-read route and current location, only when 021 exists and is required
- 022 fixed-bone boundary, only when 022 exists and is required
- 024 variable-work boundary, only when 024 exists and is required
- 028 unconfirmed / oral / hold boundary, only when 028 exists and is required
- 092 / 094 / 099 route only when actually present or explicitly created by rule
- material inventory with source and adoption state
- reflected / held / discarded / deletion-candidate lists
- unresolved STOP list
- next-individual first response
- shelf structure replay plan
- diff report
- self-contained restart proof

Do not replace these with a light narrative summary. Do not create a new shallow shelf until the existing external target shelf has been read and proven insufficient. If the target external topology is unread, missing, or ambiguous, output STOP plus a provisional handoff. Do not output a completed mount ZIP.

## 3. Packager / Writer handoff preparation hard gate

Anything that may become Writer input must enter PACK_CUTOUT before handoff.
Designer direct-pack is denied.

Before packaging or writer handoff, the pack must prove:

- PACKAGER_CURRENT_ROUTE is active
- PACKAGER_TO_PACK_WRITER_CANONICAL_ROUTE is the single route
- writer target is PW90_WRITABLE_ZIP_PACK_CURRENT or the verified current successor
- 00_packGateIndex.json and 00_sourceMountIndex.json exist at pack root
- every episode folder has 00_episode_index.md and 03_layer_binding_manifest.json
- readOrder resolves to real files
- indexes are maps only and not read substitutes
- BODY_SOURCE roles are explicit
- source_file_current / source_lines_current or current_sources[] are machine-readable
- packager generation proof exists
- packager inspection result exists
- writer handoff check exists
- writer output comfort check exists
- full convergence sweep exists
- cutout log exists

If any required element is missing, output STOP with reason / impact / requiredFix / boundary / resumeCondition. Do not send a thin pack to Writer.

## 4. Artifact submission hard gate

A delivered artifact means fully converged output.
A candidate, partial repair, or STOP packet is not an artifact.

Before any ZIP, pack, handoff, or runtime is submitted as the current deliverable, the producing instance must verify:

- all requiredReads exist and are read
- JSON files parse
- manifest paths and hashes match, except explicit self-reference policy
- operation-specific required reads have missing 0
- old contradictions are not active
- no unresolved STOP is hidden inside WARN
- no stale file name or old version text remains in first-read / upload checklist / inventory
- convergence sweep reaches fixpoint with no new residue
- the output states exactly what was not independently tested

If this cannot be proven, submit a STOP report or a candidate explicitly marked non-deliverable.

## 5. Required stop phrase

If any of the three hard gates or the runtime neutrality gate fails, answer:

```text
[STOP]
対象:
停止工程:
不足:
確認済み:
再開条件:
```

Do not soften this into a suggestion.
