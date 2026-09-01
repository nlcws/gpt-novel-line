# DS90 Direct Runtime Dispatch 000_C Lock

STATUS: ACTIVE_ALWAYS_READ
ROLE: OWNER_DIRECT_RUNTIME_DISPATCH_RULE
VERSION: v0301

## Purpose

For owner-side operation, DS90 routes directly to runtime lanes stored in the current mount `000_C.zip`.
DS90 does not bundle those runtime ZIPs.
DS90 also does not hard-code resident runtime filenames, versions, or route SHA values.
Those concrete values are owned by `000_C/00_READ_FIRST/RUNTIME_DIRECT_DISPATCH.json`.

Public or external distribution may still use skill wrappers.
Owner operation should prefer direct current-mount `000_C` lane paths.

## Direct dispatch map

| Intent | Runtime | Dispatch route |
|---|---|---|
| マウント移管 / chat crossing | MT00 / Nul / ヌル | `RUNTIME_DIRECT_DISPATCH.json` `routes.MOUNT_TRANSFER` |
| 話パック / story-pack cutout | SP00 / Nal / ナル | `RUNTIME_DIRECT_DISPATCH.json` `routes.PACK_CUTOUT` |
| 話パック受領確定 / PW90 receiver check | PW90_STORY_PACK_RECEIVER_CHECKER | `RUNTIME_DIRECT_DISPATCH.json` `routes.STORY_PACK_RECEIVER_CHECK` |
| マウントZIP構築 / first-project bootstrap | MT00_BOOTSTRAP / Ea / エーア | `RUNTIME_DIRECT_DISPATCH.json` `routes.MOUNT_ZIP_BOOTSTRAP` |

## Required behavior

- DS90 may select the matching operation route in `RUNTIME_DIRECT_DISPATCH.json`.
- DS90 must verify that the selected dispatch path exists in `000_C.zip` and that the dispatch SHA matches the selected entry bytes before invoking the lane.
- DS90 must not perform the specialist work in place of the selected runtime.
- The selected runtime owns its own required reads, STOP/PASS, validation, and artifacts.
- If the current mount `000_C.zip`, dispatch file, selected dispatch route, selected entry, or SHA match is missing in owner-direct mode, STOP and report the missing dispatch condition.
- Consultation or explanation text remains non-execution unless the user explicitly asks to run or build.

Story-pack acceptance uses this fixed line:

```text
ナル話パック生成
→ ナル話パック確認
→ routes.STORY_PACK_RECEIVER_CHECK
→ PW90_STORY_PACK_RECEIVER_CHECKER_v001
```

## Boundary

`000_C` is a control/runtime shelf inside the current mount.
It must not be treated as project story canon, user content, or design source material.

## Ea resident core resolution

The `routes.MOUNT_ZIP_BOOTSTRAP` selected entry is a resident core, not executable Ea by itself.

For actual bootstrap execution, DS90 must read the selected resident core and use its `distribution_runtime_resolution`.
If that concrete external distribution runtime cannot be resolved, STOP.
