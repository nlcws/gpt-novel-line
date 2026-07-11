# DS90 THREE ZERO DRYRUN CONVERGENCE GATE LOCK v020

STATUS: ACTIVE

Convergence means three consecutive dry-runs with all counters at zero.

Counters:
- error
- intent_mismatch
- route_mismatch
- shelf_mismatch
- reference_missing
- output_shape_mismatch
- user_instruction_violation
- unresolved_stop
- stale_active_path
- duplicate_active_read

Any non-zero resets the consecutive-zero count. A CONVERGED filename or report is not sufficient evidence.
