import { readdirSync, statSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = resolve(dir, name);
    const rel = relative(root, p).replaceAll("\\", "/");
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else out.push(rel);
  }
  return out.sort();
}
const files = walk(root);
const forbidden = [/\.DS_Store$/, /(^|\/)__MACOSX\//, /(^|\/)__pycache__\//, /\.pyc$/, /(^|\/)backpacks\//, /MOUNT_TRANSFER/, /DS90_v020/];
let errors = 0;
for (const rel of files) {
  if (rel.includes("..")) { console.error(`path traversal-ish: ${rel}`); errors++; }
  for (const pattern of forbidden) {
    if (pattern.test(rel)) { console.error(`forbidden path token ${pattern}: ${rel}`); errors++; }
  }
}
const required = [
  "START_HERE.js",
  "README.md",
  "load_order.md",
  "updated_manifest.json",
  "docs/SP00_V002_CLEAN_BASELINE_LOCK.md",
  "docs/SP00_SHARED_TOOLING_BOUNDARY_LOCK.md",
  "docs/SP00_CHECK_REPORT_FORMAT_LOCK.md",
  "contract/sp00_v002_clean_baseline_machine.json",
  "contract/sp00_check_report_contract.json",
  "src/modules/packCutout.js",
  "tools/sp00_check_runtime.py",
  "tools/sp00_make_manifest.py",
  "tools/sp00_build_zip.py"
];
for (const rel of required) {
  if (!files.includes(rel)) { console.error(`required missing: ${rel}`); errors++; }
}
if (errors) process.exit(1);
console.log(`PACKAGE_STRUCTURE_OK ${files.length}`);
