# MT00 AND DS90 V0300 COMPATIBILITY LOCK

## Relationship

DS90 v0300 is the designer, routing, and specialist-guidance runtime.

MT00 v002 is the independent mount-transfer specialist.

The correct relationship is:

```text
DS90 detects transfer need → DS90 guides user to MT00 → MT00 executes transfer.
```

DS90 may provide ownership confirmation and acquisition links. DS90 may explain how to start MT00. DS90 must not claim MT00 completion by a thin substitute.

MT00 does not need DS90 to prebuild a mandatory `MT00_HANDOFF_SEED`.

## Shared terms

```text
MOUNT_TRANSFER = MT00 work
PACK_CUTOUT / STORY_PACK = SP00 work
WRITING = PW90 work
REVISION = TS90 work
```

## Compatibility target

```text
compatible_with: DS90_v0300_NLCORE_CLEAN_BASELINE_SPECIALIST_PORTAL_LOCKED
```
