# DS90 MOUNT TRANSFER AND PACKAGING ROOT ROUTE LOCK v019.16j

## PURPOSE

This lock repairs the repeated failure where mount transfer and pack/packaging preparation were treated as ad-hoc artifact making instead of routed operations.

## HARD LINE

`MOUNT_TRANSFER` and `PACK_CUTOUT` are not helper notes. They are routed operations.

When a user asks for mount transfer, remount, shelf update, migration, carry everything forward, or a next-instance handoff, the runtime MUST enter the `MOUNT_TRANSFER` route.

When a user asks for writer delivery, pack cutout, packaging preparation, writer handoff, or pre-packaging material preparation, the runtime MUST enter the `PACK_CUTOUT` route.

## MOUNT_TRANSFER ROUTE

The `MOUNT_TRANSFER` route MUST use the existing `backpacks/MOUNT_TRANSFER_BACKPACK/` route. It is forbidden to ignore the backpack and invent a new outer folder layout.

Required sequence:

```text
1. Read current mounted shelf ZIPs or mounted shelf folders.
2. Read 021 / 022 / 024 / 028 shelf identities before deciding storage locations.
3. Read the mount-transfer backpack START_HERE and librarian transfer contract.
4. Read template and NOM when present in the shelf, and record how they constrained the operation.
5. Produce a storage / retrieval map using the existing shelf identities.
6. For end-user base mount delivery, output one ZIP only, containing shelf-native internal folders.
7. Run convergence checks before submitting.
```

STOP if any of these are missing:

```text
current shelf read evidence
MOUNT_TRANSFER_BACKPACK route read evidence
storage / retrieval map
template / NOM usage record when template / NOM exist
single-download check for end-user base mount artifacts
convergence report
```

## PACK_CUTOUT ROUTE

The `PACK_CUTOUT` route MUST be treated as the packaging-preparation gate before writer-side handoff.

Required sequence:

```text
1. Read PACK_CUTOUT current route.
2. Read packager / writer handoff locks and schema.
3. Read NOM only when the route explicitly requires it or when it is present as a gate for the current mounted shelf.
4. Build the writer-facing material bundle through PACK_CUTOUT, not through loose direct handoff.
5. Run convergence checks before submitting writer-facing artifacts.
```

STOP if any of these are missing:

```text
PACK_CUTOUT route read evidence
writer handoff schema / contract read evidence
material bundle storage location
writer-facing output boundary
convergence report
```

## FORBIDDEN

```text
FORBIDDEN: make a private FORBIDDEN_PRIVATE_OUTER_FOLDER_LAYOUT / FORBIDDEN_PRIVATE_OUTER_FOLDER_LAYOUT outer layout instead of using shelf-native routes.
FORBIDDEN: require an end user to download 021 / 022 / 024 / 028 as four separate files for base mount.
FORBIDDEN: claim that template / NOM / backpack were used merely because they are included in a ZIP.
FORBIDDEN: submit an artifact before route convergence.
FORBIDDEN: treat runtime as belonging to any project, Dropbox folder, chat, or shelf.
```

## RESULT

The route is valid only when the output can be started by the next instance without asking where to read, where to store, or which gate controls the operation.


## v019.16j REPAIR NOTE
This compatibility-active file exists because v019.16j active routes referenced the v01916j filename. MOUNT_TRANSFER and PACK_CUTOUT must remain rooted routes, not loose helper procedures.
