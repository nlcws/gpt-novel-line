# DS90 V020 NLCORE MOUNT TRANSFER / PACKAGING THREE-ZERO LOCKED

STATUS: FORMAL_CANDIDATE_AFTER_FULL_FILE_SWEEP
ENTRY: `START_HERE.js`
VERSION: `v020`

This V020 cutover consolidates the previous repair chain into current active routes.

## Current active boundaries

- Runtime is neutral: no project, story, Dropbox folder, chat thread, or destination owns it.
- External context shelves are read only when the operation needs them.
- History/reference/source-floor material is retained as archive, not ordinary active input.
- MOUNT_TRANSFER and PACK_CUTOUT are root routes.
- Mount transfer uses MOUNT_TRANSFER_BACKPACK and existing mounted shelves before any storage decision.
- Packaging uses PACK_CUTOUT and pack-writer canonical handoff before any writer delivery.
- End-user base mount delivery is one downloadable distribution whose root contains mountable shelf ZIPs only.
- Convergence requires three consecutive zero dry-runs. A filename is not proof.

## V020 cutover repairs

- Active route paths no longer point to the previous patch-chain filenames.
- Previous patch-chain locks were removed from active common routes and preserved under reference logs.
- Current package audit report is V020-only; older reports were moved to archive logs.
- Optional comparison route now points at actual included comparison files.
- Required read lists are de-duplicated by route and validated for physical existence.

## GPT / Node boundary

GPT must not run `npm test` and must not depend on `package.json`. Node/Codex validation may use tests separately.

## Submit rule

If any required read, shelf shape, route, output shape, user intent, or stale active path mismatch remains, STOP. Do not emit a `CONVERGED` artifact.
