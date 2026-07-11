import { forbidden, required } from "../runtime/rule.js";
import { validateBoot } from "../boot/validator.js";

export const coreModule = Object.freeze({
  id: "CORE",
  reads: ["090_DS_CORE"],
  states: ["BOOT_READY", "BOOT_CONNECTED", "EXTERNAL_CONTEXT_STOP", "FACTORY_STOP"],
  rules: [
    required("CORE-001", "core.loaded", "90起動核を読み込む"),
    forbidden("CORE-002", "boot.treatMissingExternalContextAsStop", "外部文脈未提示をSTOPにしない"),
    forbidden("CORE-003", "boot.useMetadataOverGate", "版メタを外部021実体より優先しない"),
    forbidden("CORE-004", "boot.useRestartMemoAsEntry", "再開メモを起動入口にしない"),
    forbidden("CORE-005", "boot.useEndLogAsCanonical", "END_LOGを正本にしない"),
    forbidden("CORE-006", "boot.readAllToolsAtStartup", "通常起動で外部ツールを全文読みにしない")
  ],
  validate: validateBoot,
  transition(input) {
    if (!input.project?.present) return "BOOT_READY";
    if (input.project?.conflict) return "EXTERNAL_CONTEXT_STOP";
    return "BOOT_CONNECTED";
  }
});
