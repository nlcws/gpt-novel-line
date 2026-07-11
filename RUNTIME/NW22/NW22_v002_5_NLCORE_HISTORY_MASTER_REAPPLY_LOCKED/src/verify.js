import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { SOURCE_MANIFEST } from "./program.js";

const results = SOURCE_MANIFEST.map((entry) => {
  const content = readFileSync(new URL(`../${entry.path}`, import.meta.url));
  const sha256 = createHash("sha256").update(content).digest("hex").toUpperCase();
  return {
    path: entry.path,
    bytes: statSync(new URL(`../${entry.path}`, import.meta.url)).size,
    sha256,
    valid: sha256 === entry.sha256 && content.length === entry.bytes
  };
});

const decision = results.every((entry) => entry.valid) ? "SOURCE_IDENTICAL" : "SOURCE_CHANGED";
console.log(JSON.stringify({ decision, results }, null, 2));
process.exit(decision === "SOURCE_IDENTICAL" ? 0 : 1);
