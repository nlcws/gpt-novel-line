# DS90 MOUNT TRANSFER USER-EXPLICIT GATE LOCK v0402

STATUS: ACTIVE

MOUNT_TRANSFER is a user-fired operation. DS90 may detect that transfer would be useful and may present the reason, target, and intended transfer scope to the user, but detection alone never activates transfer.

Activation rule:

1. DS90 may PRESENT a transfer recommendation.
2. The user explicitly requests transfer or explicitly approves the presented transfer.
3. Only then may DS90 dispatch `MOUNT_TRANSFER` with `mountTransferInvocation.origin = USER_EXPLICIT`.
4. Missing explicit user approval is STOP.

Forbidden:

- `DESIGNER_AUTO` activation
- `RUNTIME_AUTO` activation
- implicit activation from chat length, next-chat prediction, restart convenience, mount cleanup, or inferred user intent
- silently treating a recommendation as authorization

A transfer runtime may rebuild `000_C` only inside this user-fired transfer event or inside a separately user-approved `000_C` maintenance event. Normal project operation treats `000_C` as USE_ONLY.
