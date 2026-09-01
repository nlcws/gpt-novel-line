# DS90 v0405 Shelf + PKDB Origin Runtime Load Order

## Always

1. `START_HERE.js`
2. exported `READ_ORDER` from `src/runtime/program.js`
3. every path in `ALWAYS_READ` from `src/boot/validator.js`
4. every path returned by `requiredReads(operation)`
5. build the operation plan
6. execute pending HOST action and resume only with the exact verified result
7. let `src/runtime/terminal-authority.js` own final PASS/STOP

## Current runtime locks

- `assets/runtime_control/DS90_V0402_000C_SHRINE_MAINTENANCE_LOCK.md`
- `assets/runtime_control/DS90_V0402_000C_SHRINE_MAINTENANCE_MACHINE.json`
- `assets/runtime_control/DS90_V0405_TURN_ROLE_CONTINUITY_LOCK.md`
- `assets/runtime_control/DS90_V0405_TURN_ROLE_CONTINUITY_MACHINE.json`
- `assets/dsgn_infra/04_MODULE/common/DS90_MOUNT_TRANSFER_USER_EXPLICIT_GATE_LOCK_v0402.md`
- `assets/runtime_control/DS90_V0401_CURRENT_SOURCE_LOCATOR_LOCK.md`
- `assets/runtime_control/DS90_V0401_CURRENT_SOURCE_LOCATOR_MACHINE.json`
- `assets/runtime_control/DS90_V0400_SHELF_PKDB_TAG_LOCK.md` (retained base operation law)
- `assets/runtime_control/DS90_PKDB_HOST_ADAPTER_V2_HARDENED_LOCK_v0309.md`
- `assets/runtime_control/DS90_PKDB_HOST_ADAPTER_V2_HARDENED_MACHINE_v0309.json`

The v0309-named pair remains active hardening. The v0400 pair defines the restored shelf + PKDB TAG base. v0401 defines the schema-legal current SOURCE locator bridge. v0402 adds the 000_C shrine maintenance and user-explicit transfer authority gates.


## Current optional reference assets

- New-project / external-context setup: `assets/templates/COMMON_OPERATION_TEMPLATE_V2.md` (2026-08-18 logical-card / ZIP-story-pack sync)
- Novel-quality lookup: `assets/dsgn_infra/03_REFERENCE/quality/904_小説制作絶対指針/CURRENT_READ_FIRST.md` (includes current card/pack model)

Neither is an always-read project story canon. The 904 entry is resolved through the DSGN lookup/index path only when quality, heat delivery, card reproducibility, or responsibility-boundary inspection requires it.

## Project knowledge route

```text
DS90 operation
-> DS90 INDEX / SEARCH
-> explicit machine intent
-> K01 PKDB_ACCESS
-> SOURCE locator record with safe current-mount relative payload.locator
-> K04 SHELF_READ
-> exact shelf bytes verified/read
-> design validation
```

URI/archive SOURCE locators never become K04 current shelf authority. K02 SOURCE MATERIALIZE is explicit fallback only.

## PKDB input / commit boundary

K03 may produce proposals after current-run evidence is complete. DS90 does not commit PKDB. MT00/Nul remains the DB commit lane. The runtime does not bypass `PKDB_RECORD_SCHEMA_v004` by direct record-file edits.

## Specialist routes

Normal routes resolve current 000_C proof before invocation: MT00 for mount transfer, SP00 for pack cutout, MT00_BOOTSTRAP_EA for first mount bootstrap, PW90 receiver checker for pack receipt, PW90 for writing, TS90 for revision.

Older-version filenames may remain in Runtime only when their constraints are still actively read. Release change logs and superseded operation history remain in the separate Update-History artifact.

## Retained active baselines

Older-version filenames remain in Runtime when their constraints are still actively read. Origin labels do not make them release history.

For the explicit DS90 minimum PACK_CUTOUT fallback, the retained active path set includes:

- `assets/dsgn_infra/04_MODULE/packager/pack_cutout_module_v1.md`
- `assets/dsgn_infra/04_MODULE/packager/PACKAGER_CURRENT_ROUTE_V2_v0194.md`
- `assets/dsgn_infra/03_REFERENCE/layer/layer_alias_to_current_keys_v0194.md`
- `assets/dsgn_infra/04_MODULE/common/NOVEL_LINE_FINAL_CORE_LOCK_v001.md`
- `assets/dsgn_infra/04_MODULE/common/DS90_PW90_ARTIFACT_HANDOFF_JOINT_LOCK_v001.md`
- `assets/dsgn_infra/04_MODULE/common/ARTIFACT_EQUALS_FULL_CONVERGENCE_LOCK_v020.md`

Fallback bundle assembly retains the established sequence: `ready / V2 / world_axis_layer_binding / episode_layer_activation / layer / crosscheck / frozen / execution queue / sources`.
