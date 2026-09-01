#!/usr/bin/env node
import { validateTransferContainerZipFile } from "../src/validation/zip_evidence.js";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node tools/validate_transfer_container.js <transfer_container.zip>");
  process.exit(2);
}
const result = validateTransferContainerZipFile(file);
console.log(JSON.stringify(result, null, 2));
process.exit(result.decision === "PASS" ? 0 : 1);
