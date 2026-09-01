# DS90_TRANSFER_PACK_PREP_ZERO_THINK_AND_CONVERGENCE_LOCK_v01916d

Status: ACTIVE_REQUIRED_READ
Scope: MOUNT_TRANSFER / PACK_CUTOUT / artifact submission / next-individual handoff

This lock exists because three lanes are minimum fixed infrastructure, not optional convenience.

## 0. Zero-think downstream rule

Anything handed to another ChatGPT instance, another runtime, Packager, Writer, Fixer, NORA, or a new project must be restart-ready.

The recipient must not have to infer:

- which ZIP is current
- which shelf is the entry point
- which files to read first
- which items are confirmed, held, rejected, or unresolved
- whether the output is a candidate, STOP packet, or deliverable artifact
- whether the source was actually read
- whether convergence is complete

If the recipient would need to ask basic routing questions before starting, the handoff is STOP.

## 1. Mount transfer hard gate

MOUNT_TRANSFER is not a summary memo.

A valid transfer output must preserve the existing shelf topology and shelf meanings. It must include, at minimum:

- current mount ZIP identity and read status
- 021 first-read route and current location
- 022 fixed-bone boundary
- 024 variable-work boundary
- 028 unconfirmed / oral / hold boundary
- 092 / 094 / 099 route only when actually present or explicitly created by rule
- material inventory with source and adoption state
- reflected / held / discarded / deletion-candidate lists
- unresolved STOP list
- next-individual first response
- shelf structure replay plan
- diff report
- self-contained restart proof

Do not replace these with a light narrative summary.
Do not create a new shallow transfer shelf until the existing destination shelf has been read and proven insufficient.
If the destination shelf topology is unread, missing, or ambiguous, output STOP plus a provisional handoff. Do not output a completed mount ZIP.

## 2. Packager / Writer handoff preparation hard gate

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

## 3. Artifact submission hard gate

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

## 4. Binding to the current repair

For v019.16d:

- history/reference/source-floor shelves remain in ZIP and are not deleted
- history is not normal active story source
- MOUNT_TRANSFER source floor is present and manifest-visible
- transfer packet must carry shelf topology replay, not only work history
- copied `_INDEX.txt` is a snapshot, not live state
- Dropbox / external locations must be verified by path, URL, size, or metadata before being treated as current

## 5. Required stop phrase

If any of the three hard gates fails, answer:

```text
[STOP]
対象:
停止工程:
不足:
確認済み:
再開条件:
```

Do not soften this into a suggestion.
