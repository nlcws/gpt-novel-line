# DS90 MOUNT TRANSFER OUTPUT ZIP SELF CONTAINMENT LOCK v019.16f

STATUS: ACTIVE_REQUIRED
SCOPE: MOUNT_TRANSFER / shelf update / mount update / next chat / next individual / thread rollover / current project mounted ZIP refresh

## Absolute rule

When the user asks for マウント移管, the required artifact is a **new mount ZIP** that contains the actual current mounted ZIPs plus all transfer-worthy facts produced in the current chat.

Do not answer with an explanatory memo only. Do not answer with links only. Do not answer with an abstract transfer helper. Do not invent a new category such as "移管現行".

## Required contents of a mount transfer output ZIP

A valid MOUNT_TRANSFER artifact MUST contain:

1. The current mounted ZIP files physically embedded, preserving their filenames and shelf identity.
2. A first-read file that tells the next individual exactly what to open first.
3. A mounted ZIP inventory with filenames, byte sizes, SHA-256 hashes, and shelf roles.
4. Current chat transfer decisions, including corrections, STOP lines, discarded wrong routes, and accepted rules.
5. The current runtime artifact if a runtime was repaired or created in the chat.
6. A replay blueprint that maps embedded ZIPs back to the same shelf layout.
7. A convergence report proving the artifact was checked before delivery.

## Current project mounted ZIP handling

If files such as `021_G_v000.zip`, `022_B_v000.zip`, `024_V_v000.zip`, and `028_H_v000.zip` are mounted in the current project, they are not to be summarized away. They must be embedded into the new mount ZIP unless unavailable.

If any required mounted ZIP is unavailable, STOP and list the missing file. Do not substitute a description.

## Chat transfer handling

The current chat matters. Transfer-worthy chat facts include:

- why a build was repaired,
- what was accepted,
- what was rejected,
- which generated artifacts are retired,
- which version is the current output candidate,
- what must not be repeated by the next individual,
- what the user explicitly corrected.

These must be written into the new mount ZIP as concrete files. A verbal answer in the chat is not enough.

## Runtime neutrality

The runtime remains neutral. The mount ZIP may belong to the external project/work context, but the runtime itself must not become a project member, story member, Dropbox folder member, or chat member.

## Packaging and convergence

Packaging preparation for writer handoff remains hard-gated. Any artifact submitted as a result must be converged first. Unconverged outputs are candidates only and must not be presented as deliverables.

## Forbidden

- summary-only handoff
- links-only handoff for mounted ZIPs
- helper pack instead of the requested new mount ZIP
- dropping mounted ZIPs because Dropbox has history copies
- treating `_INDEX.txt` as live Dropbox state
- asking the next individual to infer shelf structure
- claiming convergence without a convergence report
- calling an unbuilt artifact complete
