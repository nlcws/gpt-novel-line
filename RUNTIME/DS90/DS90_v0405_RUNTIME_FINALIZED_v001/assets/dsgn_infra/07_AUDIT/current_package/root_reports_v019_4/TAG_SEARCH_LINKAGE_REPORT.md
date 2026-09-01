# TAG_SEARCH_LINKAGE_REPORT

Status: PASS

## Normal designer search

- exact item ID
- exact tag
- alias
- shelf/tag hint
- ENTITY
- RELATION
- source file
- source text
- deterministic no-match result

## Required linkage

- item ID and item name
- role and adoption state
- tag definition and stable meaning
- source file and exact source line range
- applies-to process
- condition type
- canonical / comparison / non-condition classification
- update history
- existing ITEM index identity

Unknown tag meanings, unresolved source lines, mismatched catalog/index identities,
duplicate IDs, invalid source digests, and unconfirmed canonical entries STOP.

## v019.3b path lock

- current TAG_SEARCH spec: `assets/specs/089_DS_TAG_SEARCH.md`
- current TAG_INDEX template: `assets/templates/TAG_INDEX_TEMPLATE.txt`
- current STOP_TAG template: `assets/templates/STOP_TAG_INDEX_TEMPLATE.md`
- old `090_EXTERNAL_TOOLS/089_DS_TAG_SEARCH.md` guidance is not a current route.
- repairs remain `PROPOSAL_ONLY`; search does not apply index fixes.
