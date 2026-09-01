# DS90 v0402 000_C Shrine Maintenance Lock

STATUS: ACTIVE

`000_C` is a control/runtime shelf with a shrine-style operational boundary. It is physically replaceable, but normal project work must only read/use it.

## Normal state

- state: `USE_ONLY`
- direct mutation: forbidden
- DS90 self-maintenance: forbidden
- automatic resident-runtime replacement: forbidden
- transfer auto-start: forbidden

## Authorized maintenance windows

`000_C` may be rebuilt and replaced only when one of these user-gated events exists:

1. `USER_EXPLICIT_MOUNT_TRANSFER`
   - the user explicitly starts or approves MOUNT_TRANSFER.
   - MT00/Nul may rebuild `000_C` as part of the transfer, including HANDOFF/AUDIT/manifest/control-state/resident-runtime changes required by that transfer.

2. `USER_APPROVED_000C_MAINTENANCE`
   - DS90/runtime first presents the exact target, reason, and intended change scope.
   - the user explicitly approves that presented maintenance.
   - the approved scope may rebuild/replace `000_C`, update resident runtime lanes, dispatch hashes, control state, handoff, and audit evidence.

The user does not need a magic phrase. A direct maintenance request or an explicit approval such as OK/許可/それで after a concrete maintenance presentation is sufficient. Silence, implication, and model inference are not approval.

## Re-seal

Before a rebuilt `000_C` becomes current:

- verify root-direct mount shape
- verify every dispatch target path exists
- verify dispatch SHA-256 against exact resident bytes
- verify required resident lanes
- verify control gate and maintenance gate
- verify HANDOFF/AUDIT/control-state evidence for the event
- then return `000_C` to `USE_ONLY`

## One-line invariant

**Anyone can technically replace the shelf; operationally it is touched only inside a user-fired transfer or user-approved maintenance window, then re-sealed to USE_ONLY.**
