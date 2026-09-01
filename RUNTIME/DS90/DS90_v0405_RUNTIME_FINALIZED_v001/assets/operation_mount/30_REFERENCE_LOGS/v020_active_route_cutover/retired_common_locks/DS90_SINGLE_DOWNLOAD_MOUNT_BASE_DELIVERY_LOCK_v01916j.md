# DS90 SINGLE DOWNLOAD MOUNT BASE DELIVERY LOCK v019.16j

## PURPOSE

This lock repairs the v019.16g delivery mistake: end users must not be asked to download or mount four separate base shelf ZIPs.

## HARD RULE

When producing a base mount artifact for an end user, output exactly one user-facing ZIP.

That single ZIP may contain the internal shelf structure below, but those shelves are internal folders, not separate downloads:

```text
021_G*
022_B*
024_V*
028_H*
```

## FORBIDDEN

```text
FORBIDDEN: asking an end user to download 021/022/024/028 as four separate files.
FORBIDDEN: presenting internal shelf ZIPs as separate required end-user downloads.
FORBIDDEN: creating private outer folders such as FORBIDDEN_PRIVATE_OUTER_FOLDER_LAYOUT or FORBIDDEN_PRIVATE_OUTER_FOLDER_LAYOUT as the user-facing shelf layout.
FORBIDDEN: putting loose transfer logs at the user-facing root.
FORBIDDEN: claiming shelf-native delivery when the artifact count for the end user is greater than one.
```

## REQUIRED DELIVERY SHAPE

```text
user downloads/uploads: 1 ZIP only
inside the ZIP: shelf-native folders preserving 021 / 022 / 024 / 028 identity
startup entry: inside 021_G*/00_START/
fixed bones: inside 022_B*/
worklog/current status/convergence: inside 024_V*/
hold/corrections/chatlog snapshots: inside 028_H*/
```

## GATE

Before submitting a mount-transfer or base-mount artifact, verify:

```text
artifact_count_for_end_user == 1
root_loose_transfer_files == 0
private_outer_current_folders == 0
internal_shelves_present includes 021_G, 022_B, 024_V, 028_H
021_G has startup/read-order/use-gate files
022_B has fixed rules
024_V has current status, next actions, convergence report
028_H has hold/correction/chatlog/reference snapshots when available
```

If any item fails, STOP. Do not submit.

## RELATION TO RUNTIME NEUTRALITY

The runtime remains neutral. The single ZIP is a delivery shape for the end user, not a project identity, not a runtime owner, and not a Dropbox location.

## RELATION TO NOM / TEMPLATE / SHELF USE

NOM and templates are not meaningful because they are merely present. They are meaningful only when the mount-transfer gate records the shelf where they were read, the decision they controlled, and the output location they constrained.


## v019.16j REPAIR NOTE
This compatibility-active file exists because v019.16j active routes referenced the v01916j filename. It preserves the single-download policy while keeping the actual mounted shelf ZIP distribution rule active.
