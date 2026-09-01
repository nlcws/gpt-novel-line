const issue = (code, path, message) => ({ code, path, message, severity: "STOP" });

const isObject = (value) => value != null && typeof value === "object" && !Array.isArray(value);
const asArray = (value) => Array.isArray(value) ? value : [];
const hasSlash = (value) => typeof value === "string" && value.includes("/");
const isZipName = (value) => typeof value === "string" && value.toLowerCase().endsWith(".zip");

function directName(path) {
  return typeof path === "string" ? path.replace(/^\/+|\/+$/g, "") : "";
}

function validateOuterArchive(archive, issues) {
  if (!isObject(archive)) {
    issues.push(issue("SHELF_SUBMISSION_ARCHIVE_MISSING", "transfer.librarian.submissionArchive", "提出物1ZIPと棚ZIP入れ子構造の実測記録が必要です"));
    return;
  }
  if (archive.format !== "ZIP") {
    issues.push(issue("SHELF_SUBMISSION_NOT_ZIP", "transfer.librarian.submissionArchive.format", "提出物は1つのZIPである必要があります"));
  }
  if (archive.singleSubmissionZip !== true) {
    issues.push(issue("SHELF_SUBMISSION_NOT_SINGLE_ZIP", "transfer.librarian.submissionArchive.singleSubmissionZip", "AIへ渡す提出物は1ZIPのみである必要があります"));
  }
  const directEntries = asArray(archive.directEntries);
  if (directEntries.length === 0) {
    issues.push(issue("SHELF_SUBMISSION_EMPTY", "transfer.librarian.submissionArchive.directEntries", "提出ZIP直下に棚ZIPが必要です"));
  }
  directEntries.forEach((entry, index) => {
    const path = directName(entry?.path);
    const p = `transfer.librarian.submissionArchive.directEntries[${index}]`;
    if (!path) {
      issues.push(issue("SHELF_DIRECT_ENTRY_PATH_MISSING", `${p}.path`, "提出ZIP直下エントリのpathが必要です"));
      return;
    }
    if (hasSlash(path)) {
      issues.push(issue("SHELF_OUTER_ROOT_NESTED_PATH", `${p}.path`, "提出ZIP直下は棚ZIPのみで、直下フォルダやネストパスは禁止です"));
    }
    if (entry.type !== "FILE" || !isZipName(path)) {
      issues.push(issue("SHELF_OUTER_ROOT_LOOSE_ENTRY", `${p}.path`, "提出ZIP直下には棚ZIPファイル以外を置けません"));
    }
    if (entry.kind !== "SHELF_ZIP") {
      issues.push(issue("SHELF_OUTER_ENTRY_NOT_DECLARED_SHELF_ZIP", `${p}.kind`, "直下ZIPは棚ZIPとして明示する必要があります"));
    }
  });
  if (typeof archive.directEntryCount === "number" && archive.directEntryCount !== directEntries.length) {
    issues.push(issue("SHELF_DIRECT_ENTRY_COUNT_MISMATCH", "transfer.librarian.submissionArchive.directEntryCount", "直下エントリ数の自己申告が実測と一致しません"));
  }
}

function validateNestedShelfZip(shelfZip, index, issues) {
  const p = `transfer.librarian.submissionArchive.shelfZips[${index}]`;
  if (!isObject(shelfZip)) {
    issues.push(issue("SHELF_ZIP_RECORD_INVALID", p, "棚ZIPの実測記録はobjectである必要があります"));
    return;
  }
  if (!isZipName(shelfZip.name)) {
    issues.push(issue("SHELF_ZIP_NAME_INVALID", `${p}.name`, "棚ZIP名は.zipで終わる必要があります"));
  }
  if (!shelfZip.shelfId || typeof shelfZip.shelfId !== "string") {
    issues.push(issue("SHELF_ZIP_ID_MISSING", `${p}.shelfId`, "棚ZIPにはshelfIdが必要です"));
  }
  const rootEntries = asArray(shelfZip.nestedRootEntries);
  if (rootEntries.length === 0) {
    issues.push(issue("SHELF_ZIP_ROOT_EMPTY", `${p}.nestedRootEntries`, "各棚ZIP内の直下には棚フォルダが必要です"));
  }
  rootEntries.forEach((entry, rootIndex) => {
    const ep = `${p}.nestedRootEntries[${rootIndex}]`;
    const path = directName(entry?.path);
    if (!path) {
      issues.push(issue("SHELF_ZIP_ROOT_ENTRY_PATH_MISSING", `${ep}.path`, "棚ZIP直下エントリのpathが必要です"));
      return;
    }
    if (hasSlash(path)) {
      issues.push(issue("SHELF_ZIP_ROOT_NESTED_PATH", `${ep}.path`, "棚ZIP内の直下エントリはフォルダ名だけである必要があります"));
    }
    if (entry.type !== "DIR") {
      issues.push(issue("SHELF_ZIP_ROOT_FILE_FORBIDDEN", `${ep}.type`, "各棚ZIP内の直下にはフォルダ以外を置けません"));
    }
  });
  const rootFolders = new Set(rootEntries.filter((entry) => entry?.type === "DIR").map((entry) => directName(entry.path).replace(/\/$/, "")));
  const fileEntries = asArray(shelfZip.fileEntries);
  fileEntries.forEach((entry, fileIndex) => {
    const ep = `${p}.fileEntries[${fileIndex}]`;
    const path = typeof entry?.path === "string" ? entry.path.replace(/^\/+/, "") : "";
    if (!path) {
      issues.push(issue("SHELF_FILE_PATH_MISSING", `${ep}.path`, "棚ZIP内ファイルのpathが必要です"));
      return;
    }
    if (!hasSlash(path)) {
      issues.push(issue("SHELF_FILE_AT_NESTED_ROOT_FORBIDDEN", `${ep}.path`, "棚ZIP内の直下ファイルは禁止です。必ず棚フォルダ内へ入れてください"));
      return;
    }
    const first = path.split("/")[0];
    if (!rootFolders.has(first)) {
      issues.push(issue("SHELF_FILE_PARENT_FOLDER_UNDECLARED", `${ep}.path`, "棚ZIP内ファイルの親フォルダが直下フォルダとして実測されていません"));
    }
  });
}

function validateUnclassifiedPolicy(archive, issues) {
  const unclassified = asArray(archive.unclassifiedItems);
  const proposals = asArray(archive.newShelfProposals);
  if (unclassified.length === 0) return;
  if (archive.claimsTransferComplete === true) {
    issues.push(issue("SHELF_UNCLASSIFIED_CANNOT_PASS", "transfer.librarian.submissionArchive.unclassifiedItems", "仕分け不能物が残る場合、移管完了PASSを名乗れません"));
  }
  const proposalIds = new Set(proposals.flatMap((proposal) => asArray(proposal.itemIds)));
  unclassified.forEach((item, index) => {
    const id = item?.id;
    const p = `transfer.librarian.submissionArchive.unclassifiedItems[${index}]`;
    if (!id) {
      issues.push(issue("SHELF_UNCLASSIFIED_ID_MISSING", `${p}.id`, "仕分け不能物にはIDが必要です"));
    } else if (!proposalIds.has(id)) {
      issues.push(issue("SHELF_UNCLASSIFIED_WITHOUT_PROPOSAL", p, "仕分け不能物は内容提示と新棚提案に接続する必要があります"));
    }
    if (!item?.contentExcerpt || !item?.reason) {
      issues.push(issue("SHELF_UNCLASSIFIED_DETAILS_MISSING", p, "仕分け不能物には内容抜粋と仕分け不能理由が必要です"));
    }
  });
}

export function validateShelfZipPackaging(librarian) {
  const issues = [];
  if (!isObject(librarian)) return issues;
  const archive = librarian?.submissionArchive;
  validateOuterArchive(archive, issues);
  if (!isObject(archive)) return issues;
  const direct = new Set(asArray(archive.directEntries).map((entry) => directName(entry?.path)));
  const shelfZips = asArray(archive.shelfZips);
  if (shelfZips.length === 0) {
    issues.push(issue("SHELF_ZIP_RECORDS_MISSING", "transfer.librarian.submissionArchive.shelfZips", "直下棚ZIPごとの内部構造実測が必要です"));
  }
  shelfZips.forEach((shelfZip, index) => {
    validateNestedShelfZip(shelfZip, index, issues);
    if (shelfZip?.name && !direct.has(shelfZip.name)) {
      issues.push(issue("SHELF_ZIP_NOT_IN_OUTER_DIRECT_ENTRIES", `transfer.librarian.submissionArchive.shelfZips[${index}].name`, "棚ZIP実測記録が提出ZIP直下エントリと一致しません"));
    }
  });
  direct.forEach((path) => {
    if (path && !shelfZips.some((shelfZip) => shelfZip?.name === path)) {
      issues.push(issue("SHELF_OUTER_DIRECT_ENTRY_UNMEASURED", "transfer.librarian.submissionArchive.directEntries", "提出ZIP直下の棚ZIPに内部構造実測がありません"));
    }
  });
  validateUnclassifiedPolicy(archive, issues);
  return issues;
}
