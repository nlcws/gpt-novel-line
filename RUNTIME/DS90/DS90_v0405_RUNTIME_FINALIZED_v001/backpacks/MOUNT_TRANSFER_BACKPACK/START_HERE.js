export {
  READ_ORDER, SOURCE_MANIFEST, runLiteralMountTransfer, runMountTransferBackpack
} from "./src/program.js";

/*
MOUNT_TRANSFER_BACKPACK_v001_LITERAL

The source/ floor is an archive/reference extraction of the designer MOUNT_TRANSFER behavior.
It is not active during normal designer work.
The backpack is mounted only on the MOUNT_TRANSFER root route.
That route may be selected only after user-explicit invocation.
DS90 may present a transfer recommendation, but it must not activate this route until the user explicitly requests or approves transfer.
The librarian gate is active after that user-explicit invocation.
*/
