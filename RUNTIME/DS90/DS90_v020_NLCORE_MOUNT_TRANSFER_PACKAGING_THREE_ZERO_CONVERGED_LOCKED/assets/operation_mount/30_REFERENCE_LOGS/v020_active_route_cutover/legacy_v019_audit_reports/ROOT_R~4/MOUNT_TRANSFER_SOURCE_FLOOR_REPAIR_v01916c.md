# MOUNT_TRANSFER_SOURCE_FLOOR_REPAIR_v01916c

Status: CONVERGED_LOCKED_NO_NPM_SCOPE
Date: 2026-06-28 Asia/Tokyo

## Reason

v019.13b already contained the shelf-preserving MOUNT_TRANSFER mechanism:

- `assets/specs/095_DS_MOUNT_TRANSFER.md`
- `src/modules/transfer.js` with `shelfPolicy`
- `backpacks/MOUNT_TRANSFER_BACKPACK/source/`
- `backpacks/MOUNT_TRANSFER_BACKPACK/assets/LIBRARIAN_TRANSFER_CONTRACT.md`

v019.16b retained the actual source floor files, but `backpacks/MOUNT_TRANSFER_BACKPACK/manifest.json` incorrectly said:

```json
"literal_source_floor": "not_shipped_in_designer_runtime"
```

That line was false for the actual package and made the transfer source floor appear dropped.

## Verification

Comparison target:

- base: `DS90_SOURCE_RUNTIME_v019_13b_SELF_CONTAINED_PROCESS_LOCKED.zip`
- previous: `DS90_v019_16b_NLCORE_HISTORY_RETAINED_ACTIVE_ROUTE_CONVERGED_LOCKED.zip`
- current: `DS90_v019_16c_NLCORE_HISTORY_RETAINED_MOUNT_TRANSFER_SOURCE_RESTORED_CONVERGED_LOCKED.zip`

Result:

```text
MOUNT_TRANSFER_BACKPACK/source file entries compared: 14
missing from v019.16b: 0
extra in v019.16b: 0
changed SHA between v019.13b and v019.16b: 0
```

Therefore the source floor itself was not physically dropped. The bug was a manifest/policy misstatement introduced during the v019.16a/v019.16b cleanup.

## Repair

`backpacks/MOUNT_TRANSFER_BACKPACK/manifest.json` is restored to truth:

```json
"literal_source_floor": "unchanged"
```

and clarified:

```json
"source_floor_policy": "included_as_frozen_source_floor; not active in normal designer route; active only inside MOUNT_TRANSFER_BACKPACK and transfer audit"
```

## Active route boundary

This does not reopen the source floor as normal design input.

The retained rule is:

```text
history/source floor retained: YES
normal active route reads it: NO
MOUNT_TRANSFER / transfer audit may read it: YES
shelf structure and shelf meanings must be preserved: YES
```

## Shelf policy retained

`src/modules/transfer.js` still contains:

```text
021: readOrder/currentLocation/canonicalRoute/unresolvedStops/nextWork
022: fixedWorld/background/characterCore/prohibitions/immutableTruth
024: variableFlow/goals/anchors/simulation/candidateHandling
028: oral/hold/unconfirmed/provisional/inferred
092: episodeCard/episodeBone/thickCardConditions
094: logs/heat/conditions/results
099: writerPack/cards/requiredOriginals
```

## Final judgement

PASS.

The correction restores the intended 13b transfer behavior: preserve existing shelf structure and shelf meanings, repair indexes, and reject new shelves unless the exception conditions are explicit.
