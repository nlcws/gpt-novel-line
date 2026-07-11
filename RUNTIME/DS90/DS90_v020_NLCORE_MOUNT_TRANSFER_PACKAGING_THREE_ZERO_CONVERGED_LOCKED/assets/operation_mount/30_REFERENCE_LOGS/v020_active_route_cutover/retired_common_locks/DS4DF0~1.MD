# DS90 MOUNT TRANSFER SHELF NATIVE USE GATE LOCK v019.16g

STATUS: ACTIVE_REQUIRED_READ
SCOPE: MOUNT_TRANSFER / remount / shelf refresh / next-chat handoff / mounted project-knowledge ZIP update

## 0. Reason for this lock

This lock exists because a prior transfer attempt created a private outer structure such as `FORBIDDEN_PRIVATE_OUTER_FOLDER_LAYOUT/`, treated working files as if they were mounted shelf files, and submitted a ZIP before proving that the mounted shelves, templates, and NOM-related gates had actually been used.

That route is invalid.

## 1. Absolute rule

When the user asks for マウント移管, the operation must start from the existing mounted shelf ZIPs.

The producing instance must open and read the current shelf ZIPs before deciding where anything belongs.

For the current 021/022/024/028 shelf model:

- `021_G` = start / reading order / maximum-load reference material / gate documents
- `022_B` = fixed bones / non-negotiable rules / high-cost-to-change invariants
- `024_V` = variable operational state / work history / update memo / next actions
- `028_H` = oral conditions / pending / hold / rejected routes / unconfirmed instructions

Do not invent a new outer shelf layout when these shelves already exist.

## 2. Required use gate, not mere inclusion

The following are not useful merely because they are present in a ZIP:

- current mounted shelf ZIPs
- reading order / first-read files
- templates / common operation hinagata
- NOM or NOM-related pack-prep material
- mount / remount operation rules
- STOP gates
- convergence reports

They only count when the output proves:

1. where the source file is located,
2. that it was opened/read for the operation,
3. which decision it controlled,
4. which shelf received the resulting material,
5. how the next instance retrieves it,
6. what STOP condition applies if it cannot be read.

A file being "inside the ZIP" is not proof of use.

## 3. Shelf-native output rule

A valid MOUNT_TRANSFER output for an existing 021/022/024/028 shelf model is one of the following:

A. updated shelf ZIPs preserving the existing shelf IDs and meanings, or
B. STOP with a shelf-read failure report.

It is not valid to submit a self-invented outer folder tree as the mount transfer artifact.

Forbidden output roots include, unless they are already part of the mounted shelf model:

- `FORBIDDEN_PRIVATE_OUTER_FOLDER_LAYOUT/`
- `FORBIDDEN_PRIVATE_OUTER_FOLDER_LAYOUT/`
- `03_CHAT_TRANSFER_RECORD/`
- `04_REPLAY_BLUEPRINT/`
- any loose naked working-file collection outside the shelf model

A transport bundle may exist only as an optional carrier, and only if it contains the shelf ZIPs unchanged at its root. The shelf ZIPs remain the artifact; the carrier is not a shelf.

## 4. Storage and retrieval proof

Before submitting a transfer output, produce a shelf correspondence table with at least:

- source item
- source location
- read/use status
- decision controlled
- destination shelf
- destination path
- retrieval route for the next instance
- STOP condition if absent

If this table is missing, the transfer output is STOP.

## 5. Hinagata / NOM / mounted shelf gate

For mount transfer, packaging pre-stage, or writer handoff preparation:

- the mounted shelves must be read first;
- the common operation hinagata must be located and used when applicable;
- NOM/NOM-related gate material must be located and used when the operation touches pack-prep / writer-handoff / full-mount comparison;
- if a required item is nested inside another ZIP, either extract a readable route into the correct shelf or STOP with the missing route;
- do not claim the gate was satisfied by filename search, index search, screenshot, URL, or prior memory.

## 6. Convergence before submission

Any submitted ZIP must include a convergence report that proves:

- existing shelf ZIPs were opened;
- shelf roles were identified from their own README / first-read files;
- added material was stored inside the correct shelf, not outside;
- no invented external outer structure became the artifact;
- JSON files parse when present;
- ZIP integrity passes;
- unresolved STOP items are either absent or explicitly listed;
- the output states what was not independently tested.

If this proof is absent, the output is not a deliverable.

## 7. Required STOP

If mounted shelves are unavailable, unread, ambiguous, or contradicted by the requested operation, answer:

```text
[STOP]
対象: MOUNT_TRANSFER
停止工程: mounted_shelf_use_gate
不足:
確認済み:
再開条件:
```

Do not build a private substitute shelf.
