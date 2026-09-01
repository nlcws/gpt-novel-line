# TRANSFER EXECUTION PROTOCOL

## Purpose

MT00_BOOTSTRAP performs first-transfer bootstrap for a new GPT Project.

It is derived from normal MT00 transfer logic, but its starting condition is different.

- Normal MT00 starts from an already established working mount.
- MT00_BOOTSTRAP starts from the initial base shelves: 021, 022, 024, and 028.

## Required base

The required base is:

- `021_G_v000.zip`
- `022_B_v000.zip`
- `024_V_v000.zip`
- `028_H_v000.zip`

The main injected knowledge is the common operation template sections 7 through 13-2.

## Basic procedure

1. Confirm the four base shelf ZIPs exist.
2. Confirm their roots and role readmes.
3. Confirm 021 is the first setup gate.
4. Confirm 022 / 024 / 028 are empty-or-ready initial shelves.
5. Use sections 7-13-2 to classify primary products, secondary products, fixed bone, variable material, and hold/pending material.
6. Refuse initial 099 shelf creation.
7. Refuse project-material insertion before the design-side gate permits it.
8. Prepare initial shelf inventory.
9. Prepare first transfer-container candidate compatible with normal MT00.
10. Run validation before claiming completion.

## Completion

A completed first-transfer bootstrap must produce or guide toward a normal-MT00-compatible `TRANSFER_CONTAINER.zip`.

The final outer ZIP rule remains:

```text
TRANSFER_CONTAINER.zip
├─ 000_C.zip
├─ 021_G_*.zip
├─ 022_B_*.zip
├─ 024_V_*.zip
├─ 028_H_*.zip
└─ optional later shelves
```

## STOP

STOP if:

- any of the four required base shelf ZIPs is missing;
- 021 / 022 / 024 / 028 roles cannot be verified;
- the user asks to summarize or compress 022 or 028 preserved source material;
- the user asks to insert project material before setup gate permission;
- the user asks to create 099 as an initial shelf;
- normal MT00 transfer validation cannot pass.

## Non-required

MT00_HANDOFF_SEED is not required.
Git / Codex / Dropbox are not required execution infrastructure.
