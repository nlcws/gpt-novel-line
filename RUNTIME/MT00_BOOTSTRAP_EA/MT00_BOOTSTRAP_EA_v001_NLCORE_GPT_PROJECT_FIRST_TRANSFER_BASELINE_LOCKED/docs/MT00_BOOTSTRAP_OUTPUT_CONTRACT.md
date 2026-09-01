# MT00_BOOTSTRAP OUTPUT CONTRACT

## Output goal

MT00_BOOTSTRAP prepares a first transfer container compatible with normal MT00.

## Required outputs

A complete run should produce:

1. First shelf inventory
2. Initial classification report
3. Source-preservation warning list
4. Required / missing base-shelf report
5. Initial transfer package candidate
6. Validation report

## Transfer container shape

The final package must remain compatible with the normal MT00 transfer container rules.

```text
TRANSFER_CONTAINER.zip
├─ 000_C.zip
├─ 021_G_*.zip
├─ 022_B_*.zip
├─ 024_V_*.zip
├─ 028_H_*.zip
└─ optional later shelves
```

The outer container may only contain shelf ZIPs.
Control and validation information belongs inside `000_C.zip`.

## What must not happen

- No loose README/report/log files at the outer root.
- No non-shelf loose files at the outer root.
- No `misc`, `tmp`, or `unclassified` escape shelves.
- No project canon fabrication.
- No summary/compression of preserved source material.
