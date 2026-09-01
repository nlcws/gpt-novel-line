# 140_MOUNT_REQUIREMENTS

## Required inputs

- current mount ZIP
- additional chat/work artifacts if any
- user-declared adoption / hold / discard decisions if present
- unresolved STOP list if present

## Required output

- one transfer container ZIP
- nested shelf ZIPs only at outer root
- control shelf manifest
- validation report
- restart handoff
- inventory disposition table

## Stop if

- current mount is absent
- classification cannot be decided
- new shelf is needed but not approved
- validator fails
