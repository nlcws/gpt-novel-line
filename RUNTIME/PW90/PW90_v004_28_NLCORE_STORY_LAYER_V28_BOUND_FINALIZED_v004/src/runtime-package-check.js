import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const manifestPath = join(root, "RUNTIME_FILE_MANIFEST.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const ignored = new Set(["RUNTIME_FILE_MANIFEST.json"]);
function walk(dir) {
  const out=[];
  for (const name of readdirSync(dir)) {
    const path=join(dir,name); const st=statSync(path);
    if (st.isDirectory()) out.push(...walk(path));
    else out.push(relative(root,path).replaceAll("\\","/"));
  }
  return out;
}
const actual = walk(root).filter((x)=>!ignored.has(x)).sort();
const expected = manifest.files.map((x)=>x.path).sort();
const missing=expected.filter((x)=>!actual.includes(x));
const extra=actual.filter((x)=>!expected.includes(x));
const mismatches=[];
for (const entry of manifest.files) {
  if (missing.includes(entry.path)) continue;
  const b=readFileSync(join(root,entry.path));
  const sha=createHash("sha256").update(b).digest("hex");
  if (b.length!==entry.bytes || sha!==entry.sha256) mismatches.push({path:entry.path,expectedBytes:entry.bytes,actualBytes:b.length,expectedSha256:entry.sha256,actualSha256:sha});
}
const report={decision:missing.length===0&&extra.length===0&&mismatches.length===0?"PASS":"FAIL",runtime:manifest.runtime,fileCount:manifest.files.length,missing,extra,mismatches};
console.log(JSON.stringify(report,null,2));
if(report.decision!=="PASS") process.exit(1);
