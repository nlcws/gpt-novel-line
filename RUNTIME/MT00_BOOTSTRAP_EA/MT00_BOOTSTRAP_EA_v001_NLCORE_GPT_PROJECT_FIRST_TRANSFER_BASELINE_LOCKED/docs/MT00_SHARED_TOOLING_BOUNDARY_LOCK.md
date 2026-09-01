# MT00 SHARED TOOLING BOUNDARY LOCK

This file applies the shared GPT Novel Line runtime tooling boundary to MT00 / Nul.

## Boundary

1. Runtime identity, purpose, judgment rules, STOP/PASS meaning, role boundaries, and operational instructions remain Markdown/TXT.
2. Lists that must be checked by tools remain JSON when possible: manifest, machine contract, transfer-container contract, examples, and check-report contract.
3. Python is limited to runtime-package inspection, manifest generation, CHECK_REPORT.md generation, and runtime ZIP packaging support.
4. Python must not perform mount-transfer judgment, create project canon, write prose, cut story packs, revise text, or replace MT00's runtime instructions.
5. After Python inspection, the AI reads CHECK_REPORT.md and decides the next runtime step from that report plus the active Markdown/TXT locks.

## MT00-specific rule

MT00's transfer completion still depends on `node tools/validate_transfer_container.js <TRANSFER_CONTAINER.zip>` for the produced transfer container.

`tools/mt00_check_runtime.py` checks the MT00 runtime package itself. It does not certify a produced transfer container.

## Generated report boundary

`CHECK_REPORT.md` is a generated sidecar report. It may be written next to or inside an expanded runtime folder during local inspection, but it is not part of the runtime manifest and must not become a required runtime source file.
