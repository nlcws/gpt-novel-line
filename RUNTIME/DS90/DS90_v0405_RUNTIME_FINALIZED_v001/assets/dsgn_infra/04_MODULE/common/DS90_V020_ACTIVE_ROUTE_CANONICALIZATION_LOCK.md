# DS90 V020 ACTIVE ROUTE CANONICALIZATION LOCK

STATUS: ACTIVE
APPLIES_TO_RUNTIME: DS90_v020_NLCORE_MOUNT_TRANSFER_PACKAGING_THREE_ZERO_CONVERGED_LOCKED

## Purpose

V020 is a cutover line. It exists to stop the previous patch chain from remaining active as scattered filename references.

## Fixed rules

- Active boot, MOUNT_TRANSFER, and PACK_CUTOUT reads must point to V020 current locks for mount transfer, packaging, single-download distribution, shelf-native storage, and three-zero convergence.
- Previous patch-line locks may remain only under reference logs as audit history.
- A path being present in the ZIP is not proof that it was used. The route must require it and validation must prove it was read or block.
- Old current-package reports are archive records, not current proof.
- If a file name says CONVERGED but the validation evidence lacks three consecutive zero dry-runs, the file is not converged.
