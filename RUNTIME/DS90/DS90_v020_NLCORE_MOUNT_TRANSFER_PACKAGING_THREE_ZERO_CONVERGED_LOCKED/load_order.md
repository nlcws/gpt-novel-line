# DS90 V020 Load Order

## Environment Boundary

```text
GPT:
  do not run npm test
  do not depend on package.json
  start from START_HERE.js

Codex / Node:
  may use package.json and npm test for mechanical validation
```

## Always

1. `START_HERE.js`
2. `READ_ORDER`
3. `ALWAYS_READ`
4. Current V020 common locks under `assets/dsgn_infra/04_MODULE/common/`
5. Project 021 and its complete read order only when project content is needed

## PACK_CUTOUT

Activate automatically when the work is packaging work. Read `requiredReads("PACK_CUTOUT")`. Do not continue packaging work as ordinary designer, CARD, or legacy EPISODE_PACK.

## MOUNT_TRANSFER

Activate automatically when the work is mount transfer work. Read `requiredReads("MOUNT_TRANSFER")`, including MOUNT_TRANSFER_BACKPACK and shelf-native V020 locks. Preserve mounted shelf structure. Do not create private outer-folder layouts or loose root files.

## Convergence

Before submitting a transfer or packaging artifact, run identical dry-run validation until all counters are zero for three consecutive runs. Any non-zero resets the count.

## Archive boundary

History/reference/source-floor archives are retained for audit and restart diagnosis. They are not ordinary active sources.
