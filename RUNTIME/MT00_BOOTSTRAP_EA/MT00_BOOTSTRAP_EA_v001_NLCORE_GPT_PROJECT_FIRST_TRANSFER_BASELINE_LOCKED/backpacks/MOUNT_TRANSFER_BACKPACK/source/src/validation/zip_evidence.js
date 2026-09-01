import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { inflateRawSync } from "node:zlib";

const CONTRACT = Object.freeze({
  packageType: "MOUNT_TRANSFER_CONTAINER",
  controlShelfZipName: "000_C.zip",
  manifestPath: "00_READ_FIRST/TRANSFER_CONTAINER_MANIFEST.json",
  validationReportPath: "01_VALIDATION/VALIDATION_REPORT.json",
  forbiddenEscapeFolders: new Set(["misc", "MISC", "Misc", "その他", "未分類", "unclassified", "UNCLASSIFIED", "loose", "LOOSE", "tmp", "TMP", "temp", "TEMP"])
});

const issue = (code, path, message) => ({ code, path, message, severity: "STOP" });
const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");
const isObject = (value) => value != null && typeof value === "object" && !Array.isArray(value);
const normalizePath = (name) => String(name ?? "").replace(/\\/g, "/").replace(/^\/+/, "");
const isDirName = (name) => normalizePath(name).endsWith("/");
const isZipName = (name) => normalizePath(name).toLowerCase().endsWith(".zip");

function pathIssueChecks(name, path, issues) {
  const normalized = normalizePath(name);
  if (!normalized) issues.push(issue("ZIP_ENTRY_PATH_EMPTY", path, "ZIP内エントリ名が空です"));
  if (normalized.startsWith("/") || normalized.includes("../") || normalized === ".." || normalized.startsWith("../")) {
    issues.push(issue("ZIP_PATH_TRAVERSAL", path, "ZIP内エントリにpath traversalが含まれます"));
  }
  if (/^[A-Za-z]:/.test(normalized)) issues.push(issue("ZIP_ABSOLUTE_WINDOWS_PATH", path, "Windows絶対パス形式は禁止です"));
  if (normalized.includes("//")) issues.push(issue("ZIP_PATH_DOUBLE_SLASH", path, "ZIP内パスの二重スラッシュは禁止です"));
}

function isSymlinkExternalAttr(entry) {
  const unixMode = (entry.externalAttributes >>> 16) & 0o170000;
  return unixMode === 0o120000;
}

export function readZipEntriesFromBuffer(buffer, label = "ZIP") {
  const issues = [];
  const sig = 0x06054b50;
  let eocd = -1;
  const min = Math.max(0, buffer.length - 22 - 65535);
  for (let offset = buffer.length - 22; offset >= min; offset -= 1) {
    if (buffer.readUInt32LE(offset) === sig) { eocd = offset; break; }
  }
  if (eocd < 0) return { entries: [], issues: [issue("ZIP_EOCD_NOT_FOUND", label, "ZIP中央ディレクトリ終端を検出できません")] };
  const diskNumber = buffer.readUInt16LE(eocd + 4);
  const centralDisk = buffer.readUInt16LE(eocd + 6);
  const totalEntries = buffer.readUInt16LE(eocd + 10);
  const centralSize = buffer.readUInt32LE(eocd + 12);
  const centralOffset = buffer.readUInt32LE(eocd + 16);
  if (diskNumber !== 0 || centralDisk !== 0) issues.push(issue("ZIP_MULTI_DISK_FORBIDDEN", label, "分割ZIPは禁止です"));
  if (centralOffset + centralSize > buffer.length) issues.push(issue("ZIP_CENTRAL_DIRECTORY_RANGE_INVALID", label, "中央ディレクトリ範囲がZIPサイズを超えています"));
  const entries = [];
  const seen = new Set();
  let ptr = centralOffset;
  for (let index = 0; index < totalEntries; index += 1) {
    if (ptr + 46 > buffer.length || buffer.readUInt32LE(ptr) !== 0x02014b50) {
      issues.push(issue("ZIP_CENTRAL_HEADER_INVALID", `${label}.central[${index}]`, "中央ディレクトリヘッダが壊れています"));
      break;
    }
    const flags = buffer.readUInt16LE(ptr + 8);
    const method = buffer.readUInt16LE(ptr + 10);
    const crc32 = buffer.readUInt32LE(ptr + 16);
    const compressedSize = buffer.readUInt32LE(ptr + 20);
    const uncompressedSize = buffer.readUInt32LE(ptr + 24);
    const nameLen = buffer.readUInt16LE(ptr + 28);
    const extraLen = buffer.readUInt16LE(ptr + 30);
    const commentLen = buffer.readUInt16LE(ptr + 32);
    const externalAttributes = buffer.readUInt32LE(ptr + 38);
    const localHeaderOffset = buffer.readUInt32LE(ptr + 42);
    const nameBytes = buffer.subarray(ptr + 46, ptr + 46 + nameLen);
    const name = normalizePath(nameBytes.toString((flags & 0x0800) ? "utf8" : "utf8"));
    const path = `${label}.entries[${index}]`;
    pathIssueChecks(name, `${path}.name`, issues);
    if (seen.has(name)) issues.push(issue("ZIP_ENTRY_DUPLICATE", `${path}.name`, "ZIP内に重複エントリがあります"));
    seen.add(name);
    const entry = { index, name, flags, method, crc32, compressedSize, uncompressedSize, externalAttributes, localHeaderOffset, directory: isDirName(name) };
    if (compressedSize === 0xffffffff || uncompressedSize === 0xffffffff || localHeaderOffset === 0xffffffff) {
      issues.push(issue("ZIP64_UNSUPPORTED", path, "この検査器ではZIP64を扱いません。通常サイズの移管ZIPにしてください"));
    }
    if (isSymlinkExternalAttr(entry)) issues.push(issue("ZIP_SYMLINK_FORBIDDEN", `${path}.name`, "ZIP内シンボリックリンクは禁止です"));
    entries.push(entry);
    ptr += 46 + nameLen + extraLen + commentLen;
  }
  return { entries, issues };
}

export function readZipEntryContent(buffer, entry) {
  const off = entry.localHeaderOffset;
  if (off + 30 > buffer.length || buffer.readUInt32LE(off) !== 0x04034b50) throw new Error(`local header invalid: ${entry.name}`);
  const nameLen = buffer.readUInt16LE(off + 26);
  const extraLen = buffer.readUInt16LE(off + 28);
  const dataStart = off + 30 + nameLen + extraLen;
  const dataEnd = dataStart + entry.compressedSize;
  if (dataEnd > buffer.length) throw new Error(`entry data out of range: ${entry.name}`);
  const compressed = buffer.subarray(dataStart, dataEnd);
  if (entry.method === 0) return Buffer.from(compressed);
  if (entry.method === 8) return inflateRawSync(compressed);
  throw new Error(`unsupported compression method ${entry.method}: ${entry.name}`);
}

function validateOuterEntries(entries, issues) {
  const files = entries.filter((entry) => !entry.directory);
  if (files.length === 0) issues.push(issue("TRANSFER_CONTAINER_EMPTY", "outerZip", "提出コンテナZIP直下に棚ZIPが必要です"));
  for (const entry of entries) {
    const path = `outerZip.${entry.name}`;
    if (entry.directory) {
      issues.push(issue("TRANSFER_CONTAINER_ROOT_FOLDER_FORBIDDEN", path, "提出コンテナ直下にフォルダを置けません。棚ZIPだけを置いてください"));
      continue;
    }
    if (entry.name.includes("/")) issues.push(issue("TRANSFER_CONTAINER_NESTED_PATH_FORBIDDEN", path, "提出コンテナ直下にネストパスを置けません"));
    if (!isZipName(entry.name)) issues.push(issue("TRANSFER_CONTAINER_ROOT_FILE_NOT_SHELF_ZIP", path, "提出コンテナ直下には棚ZIPファイル以外を置けません"));
  }
  if (!files.some((entry) => entry.name === CONTRACT.controlShelfZipName)) {
    issues.push(issue("TRANSFER_CONTROL_ZIP_MISSING", "outerZip", `制御ZIP ${CONTRACT.controlShelfZipName} が必要です`));
  }
}

function validateShelfEntries(shelfName, entries, issues) {
  const fileEntries = entries.filter((entry) => !entry.directory);
  if (fileEntries.length === 0) issues.push(issue("SHELF_ZIP_EMPTY", `shelfZip.${shelfName}`, "棚ZIP内にファイルがありません"));
  for (const entry of entries) {
    const path = `shelfZip.${shelfName}.${entry.name}`;
    const name = normalizePath(entry.name);
    if (entry.directory) {
      const root = name.replace(/\/$/, "").split("/")[0];
      if (CONTRACT.forbiddenEscapeFolders.has(root)) issues.push(issue("SHELF_ESCAPE_FOLDER_FORBIDDEN", path, "misc/未分類/tmp等への逃げ棚は禁止です"));
      continue;
    }
    if (!name.includes("/")) {
      issues.push(issue("SHELF_ROOT_FILE_FORBIDDEN", path, "棚ZIP直下ファイルは禁止です。必ず棚フォルダ内へ置いてください"));
      continue;
    }
    const root = name.split("/")[0];
    if (CONTRACT.forbiddenEscapeFolders.has(root)) issues.push(issue("SHELF_ESCAPE_FOLDER_FORBIDDEN", path, "misc/未分類/tmp等への逃げ棚は禁止です"));
  }
}

function parseManifest(controlBuffer, controlEntries, issues) {
  const manifestEntry = controlEntries.find((entry) => entry.name === CONTRACT.manifestPath && !entry.directory);
  const validationEntry = controlEntries.find((entry) => entry.name === CONTRACT.validationReportPath && !entry.directory);
  if (!manifestEntry) {
    issues.push(issue("TRANSFER_CONTAINER_MANIFEST_MISSING", `shelfZip.${CONTRACT.controlShelfZipName}`, `${CONTRACT.manifestPath} が必要です`));
    return null;
  }
  if (!validationEntry) {
    issues.push(issue("TRANSFER_VALIDATION_REPORT_MISSING", `shelfZip.${CONTRACT.controlShelfZipName}`, `${CONTRACT.validationReportPath} が必要です`));
  }
  try {
    return JSON.parse(readZipEntryContent(controlBuffer, manifestEntry).toString("utf8"));
  } catch (error) {
    issues.push(issue("TRANSFER_CONTAINER_MANIFEST_INVALID_JSON", CONTRACT.manifestPath, `manifest JSONを読めません: ${error.message}`));
    return null;
  }
}

function allNestedFileRecords(shelfData) {
  const records = [];
  for (const [shelfZipName, data] of Object.entries(shelfData)) {
    for (const entry of data.entries) {
      if (!entry.directory) records.push({ shelfZipName, entry, content: data.contents.get(entry.name) });
    }
  }
  return records;
}

function validateManifest(manifest, outerFiles, shelfData, issues) {
  if (!isObject(manifest)) {
    issues.push(issue("TRANSFER_CONTAINER_MANIFEST_OBJECT_REQUIRED", CONTRACT.manifestPath, "manifestはobjectである必要があります"));
    return;
  }
  if (manifest.packageType !== CONTRACT.packageType) {
    issues.push(issue("TRANSFER_CONTAINER_PACKAGE_TYPE_INVALID", "manifest.packageType", "packageTypeはMOUNT_TRANSFER_CONTAINERである必要があります"));
  }
  const listedShelves = Array.isArray(manifest.shelfZips) ? manifest.shelfZips : [];
  if (listedShelves.length === 0) issues.push(issue("TRANSFER_CONTAINER_SHELF_LIST_MISSING", "manifest.shelfZips", "manifestに棚ZIP一覧が必要です"));
  const actualShelfNames = new Set(outerFiles.map((entry) => entry.name));
  const listedShelfNames = new Set();
  for (const [index, shelf] of listedShelves.entries()) {
    const p = `manifest.shelfZips[${index}]`;
    if (!shelf?.name) issues.push(issue("TRANSFER_CONTAINER_SHELF_NAME_MISSING", `${p}.name`, "棚ZIP名が必要です"));
    if (!shelf?.shelfId) issues.push(issue("TRANSFER_CONTAINER_SHELF_ID_MISSING", `${p}.shelfId`, "shelfIdが必要です"));
    if (shelf?.name) listedShelfNames.add(shelf.name);
    if (shelf?.name && !actualShelfNames.has(shelf.name)) issues.push(issue("TRANSFER_CONTAINER_LISTED_SHELF_NOT_FOUND", `${p}.name`, "manifestの棚ZIPが実体に存在しません"));
  }
  for (const name of actualShelfNames) {
    if (!listedShelfNames.has(name)) issues.push(issue("TRANSFER_CONTAINER_ACTUAL_SHELF_UNLISTED", `outerZip.${name}`, "実体棚ZIPがmanifestに登録されていません"));
  }
  const files = Array.isArray(manifest.files) ? manifest.files : [];
  if (files.length === 0) issues.push(issue("TRANSFER_CONTAINER_FILE_LIST_MISSING", "manifest.files", "manifestに全ファイル一覧が必要です"));
  const byKey = new Map();
  const listedKeys = new Set();
  for (const [index, file] of files.entries()) {
    const p = `manifest.files[${index}]`;
    const key = `${file?.shelfZipName ?? ""}::${file?.path ?? ""}`;
    if (!file?.shelfZipName) issues.push(issue("TRANSFER_CONTAINER_FILE_SHELF_MISSING", `${p}.shelfZipName`, "file recordにはshelfZipNameが必要です"));
    if (!file?.path) issues.push(issue("TRANSFER_CONTAINER_FILE_PATH_MISSING", `${p}.path`, "file recordにはpathが必要です"));
    if (!file?.shelfId) issues.push(issue("TRANSFER_CONTAINER_FILE_SHELF_ID_MISSING", `${p}.shelfId`, "file recordにはshelfIdが必要です"));
    if (!file?.disposition) issues.push(issue("TRANSFER_CONTAINER_FILE_DISPOSITION_MISSING", `${p}.disposition`, "file recordにはdispositionが必要です"));
    if (key.includes("::")) {
      if (listedKeys.has(key)) issues.push(issue("TRANSFER_CONTAINER_FILE_RECORD_DUPLICATE", p, "manifest.filesに重複があります"));
      listedKeys.add(key);
      byKey.set(key, { file, p });
    }
    if (file?.path !== CONTRACT.manifestPath && !file?.sha256) {
      issues.push(issue("TRANSFER_CONTAINER_FILE_SHA256_MISSING", `${p}.sha256`, "manifest自身以外のfile recordにはsha256が必要です"));
    }
  }
  const actualFiles = allNestedFileRecords(shelfData);
  for (const actual of actualFiles) {
    const key = `${actual.shelfZipName}::${actual.entry.name}`;
    if (!listedKeys.has(key)) {
      issues.push(issue("TRANSFER_CONTAINER_ACTUAL_FILE_UNLISTED", `shelfZip.${actual.shelfZipName}.${actual.entry.name}`, "実体ファイルがmanifest.filesに登録されていません"));
      continue;
    }
    const { file, p } = byKey.get(key);
    if (actual.entry.name !== CONTRACT.manifestPath) {
      const actualHash = sha256(actual.content).toUpperCase();
      if (String(file.sha256).toUpperCase() !== actualHash) {
        issues.push(issue("TRANSFER_CONTAINER_FILE_SHA256_MISMATCH", `${p}.sha256`, "manifestのsha256が実体ファイルと一致しません"));
      }
    }
  }
  for (const key of listedKeys) {
    const [shelfZipName, path] = key.split("::");
    if (!shelfData[shelfZipName]?.entries.some((entry) => !entry.directory && entry.name === path)) {
      issues.push(issue("TRANSFER_CONTAINER_LISTED_FILE_NOT_FOUND", `manifest.files.${key}`, "manifest.filesのファイルが実体に存在しません"));
    }
  }
  const unclassified = Array.isArray(manifest.unclassifiedItems) ? manifest.unclassifiedItems : [];
  const claimsComplete = manifest.transferComplete === true || manifest.passClaim?.transferComplete === true;
  if (claimsComplete && unclassified.length > 0) {
    issues.push(issue("TRANSFER_CONTAINER_UNCLASSIFIED_CANNOT_PASS", "manifest.unclassifiedItems", "未分類物がある場合、移管完了を名乗れません"));
  }
  const unresolvedStopCount = Number(manifest.unresolvedStopCount ?? manifest.passClaim?.unresolvedStopCount ?? 0);
  if (!Number.isFinite(unresolvedStopCount) || unresolvedStopCount !== 0) {
    issues.push(issue("TRANSFER_CONTAINER_UNRESOLVED_STOPS_PRESENT", "manifest.unresolvedStopCount", "未解決STOPが0である必要があります"));
  }
  const handoff = manifest.restartHandoff ?? {};
  if (handoff.nextAgentRestartReady !== true) issues.push(issue("TRANSFER_CONTAINER_RESTART_NOT_READY", "manifest.restartHandoff.nextAgentRestartReady", "次個体が推測なしで再開できる状態が必要です"));
  if (!Array.isArray(handoff.readOrder) || handoff.readOrder.length === 0) issues.push(issue("TRANSFER_CONTAINER_READ_ORDER_MISSING", "manifest.restartHandoff.readOrder", "再開用readOrderが必要です"));
  if (!handoff.entrypoint) issues.push(issue("TRANSFER_CONTAINER_ENTRYPOINT_MISSING", "manifest.restartHandoff.entrypoint", "再開入口が必要です"));
}

export function validateTransferContainerZipBuffer(buffer, label = "outerZip") {
  const issues = [];
  const outer = readZipEntriesFromBuffer(buffer, label);
  issues.push(...outer.issues);
  if (outer.entries.length === 0) return { decision: "STOP", issues };
  validateOuterEntries(outer.entries, issues);
  const outerFiles = outer.entries.filter((entry) => !entry.directory);
  const shelfData = {};
  for (const entry of outerFiles) {
    if (!isZipName(entry.name)) continue;
    try {
      const nestedBuffer = readZipEntryContent(buffer, entry);
      const nested = readZipEntriesFromBuffer(nestedBuffer, `shelfZip.${entry.name}`);
      issues.push(...nested.issues);
      validateShelfEntries(entry.name, nested.entries, issues);
      const contents = new Map();
      for (const nestedEntry of nested.entries) {
        if (!nestedEntry.directory) {
          try { contents.set(nestedEntry.name, readZipEntryContent(nestedBuffer, nestedEntry)); }
          catch (error) { issues.push(issue("SHELF_FILE_READ_FAILED", `shelfZip.${entry.name}.${nestedEntry.name}`, error.message)); }
        }
      }
      shelfData[entry.name] = { buffer: nestedBuffer, entries: nested.entries, contents };
    } catch (error) {
      issues.push(issue("SHELF_ZIP_READ_FAILED", `outerZip.${entry.name}`, `棚ZIPを展開検査できません: ${error.message}`));
    }
  }
  const control = shelfData[CONTRACT.controlShelfZipName];
  if (control) {
    const manifest = parseManifest(control.buffer, control.entries, issues);
    if (manifest) validateManifest(manifest, outerFiles, shelfData, issues);
  }
  return Object.freeze({
    decision: issues.length === 0 ? "PASS" : "STOP",
    issueCount: issues.length,
    issues: Object.freeze(issues),
    summary: Object.freeze({ outerEntryCount: outer.entries.length, shelfZipCount: Object.keys(shelfData).length })
  });
}

export function validateTransferContainerZipFile(filePath) {
  return validateTransferContainerZipBuffer(readFileSync(filePath), filePath);
}
