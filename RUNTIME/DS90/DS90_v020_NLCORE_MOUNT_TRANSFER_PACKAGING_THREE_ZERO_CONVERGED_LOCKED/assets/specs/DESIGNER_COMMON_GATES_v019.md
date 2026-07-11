# DESIGNER_COMMON_GATES_v019

This is an always-read executable contract for ordinary designer operations.
It does not activate or modify `MOUNT_TRANSFER_BACKPACK` or `V2_FOLDER_RESTORE`.

## Gate Order

1. `COMMON_SUMMARY_DISCIPLINE_GATE`
2. `NEW_ITEM_REGISTRATION_GATE`
3. `TAG_MEANING_LOCK`
4. `ENTITY_RELATION_TAG_DEFINITION_GATE`
5. `LINE_REFERENCE_UPDATE_GATE`
6. `TAG_SEARCH_REPAIR_OUTPUT`

## Common Summary Discipline

For CHECK, TAG_SEARCH, CARD, CARD_TEST, SINGLE_EPISODE_PROFILE_GATE,
EPISODE_PACK, and PACK_CUTOUT, all five discipline assertions are required:

- sources_read_before_summary
- unconfirmed_kept_unconfirmed
- missing_kept_missing
- no_inference_fill
- no_source_condition_reduction

Any missing or false assertion stops before operation completion. These assertions
never replace source, address, digest, ID, or graph checks.

## New Item Registration

Every newly created file, condition, card, tag, or shelf requires a registration
containing its stable ID, role, canon state, exact source address and text, target
process and shelf, condition type, reason, dependencies, relations, and history.
An incomplete registration stops. Placing an item without registering it is denied.

`navigation_references.START_HERE`, `READ_ME`, and `CURRENT_STATUS` are stable logical
role keys. They mean the entrance, explanatory, and current-location references
defined by the existing template. They do not require physical files with those exact
names. Update the existing template's equivalent routes; never create a parallel file
or shelf merely to satisfy a logical key.

## Tag Meaning Lock

Tag meaning is fixed by `tag_name + tag_type + definition_digest`.
Existing meaning or role may change only through an approved `changeRequests` entry
with a concrete user decision reference. Adding a new tag must not mutate an old tag.

## Entity And Relation Definitions

ENTITY tags require entity kind, meaning, alias policy, and canonical state.
RELATION tags require relation kind, subject kind, object kind, directionality,
meaning, usage policy, and canonical state. Unknown or incomplete definitions stop.

## Line Reference Update

Line movement may update only the allowed address/history fields. Stable item IDs,
tag meanings, roles, shelf definitions, source types, canon states, and condition
types may not drift. Every changed line address requires old/new ranges, reason,
timestamp, status, and history. The runtime re-resolves source text at the new range.

## Search Repair Output

TAG_SEARCH may diagnose index, address, tag, entity, relation, and line-reference
repairs. Every repair is `PROPOSAL_ONLY`. Search never applies a repair, creates a
parallel index, promotes canon, or claims completion from self-report.

Final rule: reading is not permission, summary is not evidence, and a repair proposal
is not an applied change.
