# DS90 V0400 SHELF + PKDB TAG LOCK

STATUS: RETAINED_BASE_RUNTIME_LOCK
VERSION: v0400

## Formula

`v0309 trusted runtime hardening + v0301 shelf operation restore + DS90 INDEX/SEARCH + PKDB TAG backend`

## Mandatory

1. v0309 host adapter, resident identity, exact snapshot, authority flags, resume, proposal/commit, terminal authority, integrity and specialist proof hardening remain active.
2. 021_G / 022_B / 024_V / 028_H and existing project shelves are normal semantic shelves again.
3. PKDB is locator backend, not project canon replacement.
4. DS90 builds machine-explicit query intent before PKDB ACCESS.
5. Locator record must resolve current `shelf_pointer`.
6. K04 reads exact current shelf bytes before design judgment.
7. TAG / alias / locator metadata cannot independently establish project meaning.
8. K02 SOURCE MATERIALIZE is explicit fallback only.
9. DB input is lightweight TAG/alias/pointer/reverse-index/minimal-relation by standard policy.
10. Runtime ZIP contains execution material; release Update History is separate.

## Deny

- restore v0301 runtime engine wholesale
- weaken v0309 hardening
- PKDB full-text reconstruction as standard operation
- delete/thin project shelves because PKDB exists
- treat 021_G as DB-only or provenance-only
- natural-language inference inside PKDB ACCESS
- archive locator as current shelf pointer
- semantic record payload as project canon without shelf read
- automatic PKDB commit by DS90


## v0401 representation override

The shelf-authority and INDEX/SEARCH rules remain active. The v0400 sketch that names `payload.shelf_pointer` as the committed standard representation is superseded by `DS90_V0401_CURRENT_SOURCE_LOCATOR_LOCK.md` because resident `PKDB_RECORD_SCHEMA_v004` does not permit that field.
