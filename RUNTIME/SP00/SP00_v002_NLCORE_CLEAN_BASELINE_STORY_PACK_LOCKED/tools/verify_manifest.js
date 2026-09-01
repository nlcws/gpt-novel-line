import { readFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(resolve(root, "updated_manifest.json"), "utf8"));
function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = resolve(dir, name);
    const rel = relative(root, p).replaceAll("\\\\", "/");
    if (rel === "updated_manifest.json") continue;
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else out.push(rel);
  }
  return out.sort();
}
const files = walk(root);
const entries = manifest.files ?? [];
const byPath = new Map(entries.map((e) => [e.path, e]));
let errors = 0;
for (const rel of files) {
  const e = byPath.get(rel);
  if (!e) { console.error(`missing manifest entry: ${rel}`); errors++; continue; }
  const buf = readFileSync(resolve(root, rel));
  const sha = createHash("sha256").update(buf).digest("hex");
  if (e.size !== buf.length) { console.error(`size mismatch: ${rel}`); errors++; }
  if (e.sha256 !== sha) { console.error(`sha mismatch: ${rel}`); errors++; }
}
for (const e of entries) {
  if (!files.includes(e.path)) { console.error(`manifest stale entry: ${e.path}`); errors++; }
}
if (errors) process.exit(1);
console.log(`MANIFEST_OK ${files.length}`);
