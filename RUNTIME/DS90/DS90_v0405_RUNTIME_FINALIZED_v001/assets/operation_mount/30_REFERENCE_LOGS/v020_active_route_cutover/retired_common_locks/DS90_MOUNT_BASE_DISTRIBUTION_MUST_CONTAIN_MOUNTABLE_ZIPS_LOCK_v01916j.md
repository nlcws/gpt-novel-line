# DS90 MOUNT BASE DISTRIBUTION MUST CONTAIN MOUNTABLE ZIPS LOCK v019.16j

## PURPOSE
Fix the v019.16i failure where a single-download base mount was delivered as an expanded folder tree instead of a distribution containing directly mountable shelf ZIP files.

## HARD RULE
When producing an end-user base mount distribution, the user-facing download may be one ZIP, but its root MUST contain mountable shelf ZIP files, not expanded shelf folders.

Required root pattern for a base mount distribution:

```text
021_G_*.zip
022_B_*.zip
024_V_*.zip
028_H_*.zip
```

## PROHIBITED
- Do not put `021_G/`, `022_B/`, `024_V/`, or `028_H/` as expanded folders at the root of the user-facing distribution.
- Do not put private outer folders such as `FORBIDDEN_PRIVATE_OUTER_FOLDER_LAYOUT`, `FORBIDDEN_PRIVATE_OUTER_FOLDER_LAYOUT`, or `GPTS_BASE_MOUNT_*` as the root mount structure.
- Do not place loose runtime notes, validation files, HTML logs, or JSON files at the distribution root.
- Do not claim "single download" is acceptable unless the contents are directly extractable into mountable ZIP files.

## REQUIRED EXECUTION
1. Read existing mount shelves before storing transfer matter.
2. Store transfer matter inside the proper shelf ZIPs.
3. Package the shelf ZIPs as files at the root of the one downloadable distribution ZIP.
4. Validate root entries are ZIP files only.
5. Validate all required shelf IDs exist: `021_G`, `022_B`, `024_V`, `028_H`.
6. Submit only after convergence.

## STOP CONDITIONS
STOP if the distribution root contains expanded shelf folders.
STOP if the distribution root contains loose files.
STOP if any required shelf ZIP is missing.
STOP if shelf contents were not read before routing transfer matter.
STOP if NOM / template are merely included but not used as gates.
STOP if packaging or mount-transfer routes skip their backpacks.

## STATUS
ACTIVE. Required by ALWAYS_READ, MOUNT_TRANSFER, and PACK_CUTOUT routes.
