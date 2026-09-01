import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { validateTransferContainerZipBuffer } from "../../../src/validation/zip_evidence.js";

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
  return table;
})();
function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function dosTimeDate() { return { time: 0, date: 0x5b21 }; }
function zipStore(files) {
  const chunks = [];
  const central = [];
  let offset = 0;
  const { time, date } = dosTimeDate();
  for (const file of files) {
    const name = Buffer.from(file.name, "utf8");
    const data = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data ?? "", "utf8");
    const crc = crc32(data);
    const local = Buffer.alloc(30 + name.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    name.copy(local, 30);
    chunks.push(local, data);
    const c = Buffer.alloc(46 + name.length);
    c.writeUInt32LE(0x02014b50, 0);
    c.writeUInt16LE(20, 4);
    c.writeUInt16LE(20, 6);
    c.writeUInt16LE(0x0800, 8);
    c.writeUInt16LE(0, 10);
    c.writeUInt16LE(time, 12);
    c.writeUInt16LE(date, 14);
    c.writeUInt32LE(crc, 16);
    c.writeUInt32LE(data.length, 20);
    c.writeUInt32LE(data.length, 24);
    c.writeUInt16LE(name.length, 28);
    c.writeUInt32LE(file.dir ? 0x41ed0010 : 0x81a40000, 38);
    c.writeUInt32LE(offset, 42);
    name.copy(c, 46);
    central.push(c);
    offset += local.length + data.length;
  }
  const centralOffset = offset;
  const centralSize = central.reduce((sum, c) => sum + c.length, 0);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralSize, 12);
  eocd.writeUInt32LE(centralOffset, 16);
  return Buffer.concat([...chunks, ...central, eocd]);
}
const hash = (buffer) => createHash("sha256").update(buffer).digest("hex").toUpperCase();
function goodOuter() {
  const reportText = JSON.stringify({ validator: "expected", decision: "PASS" });
  const contentText = "fixed condition\nrestart memo\n";
  const reportBuf = Buffer.from(reportText);
  const contentBuf = Buffer.from(contentText);
  const manifest = {
    packageType: "MOUNT_TRANSFER_CONTAINER",
    transferComplete: true,
    unresolvedStopCount: 0,
    shelfZips: [
      { name: "000_C.zip", shelfId: "000_C", purpose: "control and restart handoff" },
      { name: "022_B.zip", shelfId: "022", purpose: "fixed bones" }
    ],
    files: [
      { shelfZipName: "000_C.zip", shelfId: "000_C", path: "00_READ_FIRST/TRANSFER_CONTAINER_MANIFEST.json", disposition: "CONTROL" },
      { shelfZipName: "000_C.zip", shelfId: "000_C", path: "01_VALIDATION/VALIDATION_REPORT.json", disposition: "CONTROL", sha256: hash(reportBuf) },
      { shelfZipName: "022_B.zip", shelfId: "022", path: "022_B/CORE.md", disposition: "REFLECTED", sha256: hash(contentBuf) }
    ],
    unclassifiedItems: [],
    restartHandoff: { nextAgentRestartReady: true, entrypoint: "00_READ_FIRST/TRANSFER_CONTAINER_MANIFEST.json", readOrder: ["00_READ_FIRST/TRANSFER_CONTAINER_MANIFEST.json"] }
  };
  const control = zipStore([
    { name: "00_READ_FIRST/TRANSFER_CONTAINER_MANIFEST.json", data: JSON.stringify(manifest, null, 2) },
    { name: "01_VALIDATION/VALIDATION_REPORT.json", data: reportBuf }
  ]);
  const shelf022 = zipStore([{ name: "022_B/CORE.md", data: contentBuf }]);
  return zipStore([
    { name: "000_C.zip", data: control },
    { name: "022_B.zip", data: shelf022 }
  ]);
}

test("machine transfer container validator accepts a real nested shelf ZIP", () => {
  const result = validateTransferContainerZipBuffer(goodOuter());
  assert.equal(result.decision, "PASS", JSON.stringify(result.issues, null, 2));
});

test("machine validator rejects outer root README even if report would claim pass", () => {
  const base = goodOuter();
  const outer = zipStore([{ name: "README.md", data: "helper" }, { name: "000_C.zip", data: base }]);
  const result = validateTransferContainerZipBuffer(outer);
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.code === "TRANSFER_CONTAINER_ROOT_FILE_NOT_SHELF_ZIP"));
});

test("machine validator rejects shelf root loose files", () => {
  const badShelf = zipStore([{ name: "CORE.md", data: "loose" }]);
  const outer = zipStore([{ name: "000_C.zip", data: badShelf }]);
  const result = validateTransferContainerZipBuffer(outer);
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.code === "SHELF_ROOT_FILE_FORBIDDEN"));
});

test("machine validator rejects manifest hash mismatch", () => {
  const reportText = "{}";
  const reportBuf = Buffer.from(reportText);
  const manifest = {
    packageType: "MOUNT_TRANSFER_CONTAINER",
    transferComplete: true,
    unresolvedStopCount: 0,
    shelfZips: [{ name: "000_C.zip", shelfId: "000_C" }],
    files: [
      { shelfZipName: "000_C.zip", shelfId: "000_C", path: "00_READ_FIRST/TRANSFER_CONTAINER_MANIFEST.json", disposition: "CONTROL" },
      { shelfZipName: "000_C.zip", shelfId: "000_C", path: "01_VALIDATION/VALIDATION_REPORT.json", disposition: "CONTROL", sha256: "00" }
    ],
    unclassifiedItems: [],
    restartHandoff: { nextAgentRestartReady: true, entrypoint: "x", readOrder: ["x"] }
  };
  const control = zipStore([
    { name: "00_READ_FIRST/TRANSFER_CONTAINER_MANIFEST.json", data: JSON.stringify(manifest) },
    { name: "01_VALIDATION/VALIDATION_REPORT.json", data: reportBuf }
  ]);
  const result = validateTransferContainerZipBuffer(zipStore([{ name: "000_C.zip", data: control }]));
  assert.equal(result.decision, "STOP");
  assert.ok(result.issues.some((entry) => entry.code === "TRANSFER_CONTAINER_FILE_SHA256_MISMATCH"));
});
