# DS90 V0401 CURRENT SOURCE LOCATOR LOCK

STATUS: CURRENT_RUNTIME_LOCK
VERSION: v0401
BASE: v0400 shelf + PKDB TAG operation

## Purpose

v0401 closes the integration mismatch between the v0400 current-shelf route and the resident `PKDB_RECORD_SCHEMA_v004`.

The PKDB schema is NOT changed. The standard current-shelf locator is represented by an existing schema-legal `SOURCE` record.

## Mandatory

1. Project shelves remain source/canon authority. PKDB remains lookup/locator backend only.
2. DS90 forms explicit machine search intent before K01 PKDB ACCESS.
3. Standard current locator record is `record_type=SOURCE` with a current-project-mount relative `payload.locator`.
4. The same SOURCE record carries exact `payload.sha256`, `payload.source_role`, and optional trusted `payload.media_type`; top-level `aliases[]` and `search_terms[]` provide lookup labels.
5. `payload.locator` used as current authority MUST be a safe relative path inside the current project mount. Absolute paths, traversal and URIs are forbidden.
6. `legacy-archive://...`, `runtime-archive://...`, and other URI SOURCE locators are provenance/fallback sources only. They MUST NOT be elevated to K04 current-shelf authority.
7. K04 `SHELF_READ` must read the exact requested current shelf bytes, recompute their SHA/length/text decoding as applicable, and require the recomputed SHA-256 to equal the locator SOURCE record's `payload.sha256` before project judgment.
8. K02 `SOURCE_MATERIALIZE` remains explicit fallback only and cannot run silently when the standard current-shelf route is expected.
9. DS90 remains proposal-only for PKDB input. MT00/Nul remains the sole DB commit authority.
10. No direct `records.jsonl` editing may be used to bypass PKDB schema/core validation.

## Compatibility

Runtime normalization may still recognize an explicit legacy-compatible `payload.shelf_pointer` if supplied by a future/alternate compatible backend, but under the resident `PKDB_RECORD_SCHEMA_v004` it is NOT the v0401 standard committed representation.

## Deny

- add `payload.shelf_pointer` to a v004 record by bypassing schema
- change PKDB core/schema merely to make the v0400 field sketch fit
- treat a SOURCE record body or PKDB payload as project canon
- use archive URI as current shelf authority
- skip actual current shelf read
- let DS90 commit directly
