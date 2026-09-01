import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { SOURCE_MANIFEST } from "./program.js";

const results = SOURCE_MANIFEST.map((entry) => {
  const bytes = statSync(new URL(`../${entry.path}`, import.meta.url)).size;
  const content = readFileSync(new URL(`../${entry.path}`, import.meta.url));
  const sha256 = createHash("sha256").update(content).digest("hex").toUpperCase();
  return {
    path: entry.path,
    bytes,
    sha256,
    valid: bytes === entry.bytes && sha256 === entry.sha256
  };
});

console.log(JSON.stringify({
  decision: results.every((entry) => entry.valid) ? "SOURCE_IDENTICAL" : "SOURCE_MISMATCH",
  results
}, null, 2));

if (results.some((entry) => !entry.valid)) process.exit(1);
