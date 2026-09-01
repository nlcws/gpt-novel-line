# SP00 CHECK REPORT FORMAT LOCK

SP00 runtime-package checks write a Markdown sidecar named `CHECK_REPORT.md`.

Required sections:

1. `# SP00 Runtime Package Check Report`
2. `target`
3. `checked_at_utc`
4. `decision`
5. `summary`
6. `issues`
7. `manifest`

Allowed decisions:

- `PASS`
- `STOP`

`CHECK_REPORT.md` is not part of the runtime manifest. A generated report may be attached next to the ZIP for human review.
