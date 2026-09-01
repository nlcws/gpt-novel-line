# MT00 CHECK REPORT FORMAT LOCK

`CHECK_REPORT.md` is the standard Markdown report produced by MT00 Python runtime-package checks.

## Required sections

A generated MT00 CHECK_REPORT.md must contain:

1. Title naming MT00 runtime package check.
2. Target path.
3. Decision: `PASS` or `STOP`.
4. Summary counts.
5. Issues table, or an explicit no-issues line.
6. Next action.

## Meaning

- `PASS` means the inspected MT00 runtime package passed root-shape, manifest, UTF-8, hash, cache-artifact, and unsafe-path checks.
- `STOP` means the runtime package must not be treated as clean until listed issues are fixed.

## Non-meaning

A PASS runtime CHECK_REPORT.md does not mean a user-produced `TRANSFER_CONTAINER.zip` is valid. Transfer containers must still pass `tools/validate_transfer_container.js`.

## Sidecar status

`CHECK_REPORT.md` is generated output. It is excluded from `updated_manifest.json` and may be regenerated without changing runtime source identity.
