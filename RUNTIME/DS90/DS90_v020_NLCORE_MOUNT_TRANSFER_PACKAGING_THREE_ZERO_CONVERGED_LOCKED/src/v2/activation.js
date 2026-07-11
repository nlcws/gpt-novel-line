export const INPUT_MODES = Object.freeze([
  "LEGACY_PACK",
  "V2_EPISODE_FOLDER"
]);

export const CONTRACT_PRIORITY = Object.freeze([
  "ORIGINAL_STOP",
  "BASE_REQUIRED_OUTPUT",
  "PACK_WRITER_CORE",
  "V2_FOLDER_RESTORE_CONTRACT",
  "CUSTOM_PACK_EXTENSION",
  "FREE_AREA"
]);

const issue = (code, path, message) => ({ code, path, message, severity: "STOP" });

export function createPackWriterActivation({
  activationId,
  episodeId,
  customPackExtension = false
}) {
  return Object.freeze({
    input_mode: "V2_EPISODE_FOLDER",
    activate_contracts: Object.freeze(["V2_FOLDER_RESTORE_CONTRACT"]),
    custom_pack_extension: customPackExtension,
    degraded_mode: false,
    activation_source: "DESIGN",
    activation_id: activationId,
    episode_id: episodeId,
    episode_unit: "folder",
    auto_detection: "forbidden",
    activation_validity: Object.freeze({
      user_or_design_declared: true,
      filename_inference_allowed: false,
      folder_size_inference_allowed: false,
      style_inference_allowed: false
    })
  });
}

export function validatePackWriterActivation(activation) {
  const issues = [];
  if (activation == null || typeof activation !== "object" || Array.isArray(activation)) {
    return {
      decision: "STOP",
      state: "NOT_ACTIVATED",
      issues: [issue("V2_ACTIVATION_MISSING", "packWriterActivation",
        "V2話フォルダには設計さんの明示起動宣言が必要です")]
    };
  }
  if (!INPUT_MODES.includes(activation.input_mode)) {
    issues.push(issue("INPUT_MODE_UNKNOWN", "packWriterActivation.input_mode", "未知の入力モードです"));
  }
  if (activation.input_mode !== "V2_EPISODE_FOLDER") {
    issues.push(issue("V2_INPUT_MODE_REQUIRED", "packWriterActivation.input_mode",
      "V2契約にはV2_EPISODE_FOLDERが必要です"));
  }
  if (!(activation.activate_contracts ?? []).includes("V2_FOLDER_RESTORE_CONTRACT")) {
    issues.push(issue("V2_CONTRACT_NOT_ACTIVATED", "packWriterActivation.activate_contracts",
      "V2_FOLDER_RESTORE_CONTRACTの明示起動が必要です"));
  }
  if (activation.activation_source !== "DESIGN") {
    issues.push(issue("ACTIVATION_SOURCE_INVALID", "packWriterActivation.activation_source",
      "設計さん起動宣言だけを受理します"));
  }
  if (!activation.activation_id || !activation.episode_id) {
    issues.push(issue("ACTIVATION_IDENTITY_MISSING", "packWriterActivation",
      "activation_idとepisode_idが必要です"));
  }
  if (activation.episode_unit !== "folder") {
    issues.push(issue("EPISODE_UNIT_INVALID", "packWriterActivation.episode_unit",
      "V2は1話1フォルダです"));
  }
  if (activation.auto_detection !== "forbidden") {
    issues.push(issue("AUTO_DETECTION_NOT_FORBIDDEN", "packWriterActivation.auto_detection",
      "V2自動判定は禁止です"));
  }
  if (activation.degraded_mode !== false) {
    issues.push(issue("DEGRADED_WRITE_MODE_FORBIDDEN", "packWriterActivation.degraded_mode",
      "DEGRADEDは報告専用で本文生成へ進めません"));
  }
  if (typeof activation.custom_pack_extension !== "boolean") {
    issues.push(issue("CUSTOM_EXTENSION_FLAG_INVALID", "packWriterActivation.custom_pack_extension",
      "CUSTOM_PACK_EXTENSIONはtrue/falseの明示値だけです"));
  }
  const validity = activation.activation_validity ?? {};
  if (validity.user_or_design_declared !== true ||
      validity.filename_inference_allowed !== false ||
      validity.folder_size_inference_allowed !== false ||
      validity.style_inference_allowed !== false) {
    issues.push(issue("ACTIVATION_VALIDITY_INVALID", "packWriterActivation.activation_validity",
      "宣言起動と全推測禁止を固定する必要があります"));
  }
  return {
    decision: issues.length === 0 ? "PASS" : "STOP",
    state: issues.length === 0 ? "WAITING_FOR_MATERIAL_MAP" : "ACTIVATION_STOP",
    issues,
    contractPriority: CONTRACT_PRIORITY
  };
}

export function validateLegacyMode(activation) {
  if (activation == null) return { decision: "PASS", state: "LEGACY_READY", issues: [] };
  const issues = [];
  if (activation.input_mode !== "LEGACY_PACK") {
    issues.push(issue("LEGACY_MODE_MISMATCH", "packWriterActivation.input_mode",
      "LEGACY_PACK以外は明示V2起動検査が必要です"));
  }
  if ((activation.activate_contracts ?? []).includes("V2_FOLDER_RESTORE_CONTRACT")) {
    issues.push(issue("V2_CONTRACT_ON_IN_LEGACY", "packWriterActivation.activate_contracts",
      "LEGACY_PACKでV2契約を起動できません"));
  }
  return {
    decision: issues.length === 0 ? "PASS" : "STOP",
    state: issues.length === 0 ? "LEGACY_READY" : "ACTIVATION_STOP",
    issues
  };
}
