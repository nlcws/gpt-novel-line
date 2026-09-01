# MT00_BOOTSTRAP GPT PROJECT FIRST FLOW

## Starting condition

The user wants to create or initialize a new GPT Project and has the base shelves:

- `021_G_v000.zip`
- `022_B_v000.zip`
- `024_V_v000.zip`
- `028_H_v000.zip`

## Required behavior

1. Confirm the four base shelves are present.
2. Confirm the common operation template knowledge is available.
3. Read the base shelf roles.
4. Do not ask the user to manually unzip or inspect internal files.
5. Do not allow project material insertion before the design-side gate permits it.
6. Prepare first-transfer shelf structure.
7. Preserve primary source material without summary/compression.
8. Produce a normal-MT00-compatible transfer target.

## Stop conditions

STOP if:

- one of the four base shelves is absent;
- 021 base gate cannot be identified;
- 022 / 024 / 028 roles are missing or contradicted;
- the user asks to summarize/flatten 022 or 028 source material;
- project material is being mixed in before the setup gate is passed;
- 099 is being created as an initial shelf;
- normal MT00 transfer-container validation would fail.
