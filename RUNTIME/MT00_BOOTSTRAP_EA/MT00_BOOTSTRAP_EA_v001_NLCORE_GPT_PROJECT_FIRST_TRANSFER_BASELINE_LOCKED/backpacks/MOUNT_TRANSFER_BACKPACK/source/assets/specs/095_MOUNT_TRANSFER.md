# 095_MOUNT_TRANSFER

## Definition

MOUNT_TRANSFER is the operation that moves a working mount into a validator-PASS transfer container for the next environment.

## Required state

- currentMountPresent
- inventoryBuilt
- diffReportBuilt
- reflected / held / discarded disposition
- existingShelvesPreserved
- nextIndividualRestartReady
- outputMountZipBuilt in COMMIT phase
- outputMountZipConverged in COMMIT phase

## Completion

Completion requires a real ZIP artifact and a validator PASS. A summary, explanation, or helper memo is STOP.
