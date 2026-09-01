import { readFileSync } from "node:fs";
import { createRuntimeSession, startRuntime, resumeRuntimeSession, summarizeRuntimeSession } from "./runtime-engine.js";

function readJson(path) { return JSON.parse(readFileSync(path, "utf8")); }
const [command = "help", inputPath, extraPath] = process.argv.slice(2);
let result;
if (command === "plan") result = createRuntimeSession(readJson(inputPath));
else if (command === "run") result = startRuntime(readJson(inputPath), extraPath ? readJson(extraPath) : {});
else if (command === "resume") {
  if (!inputPath) throw new Error("resume requires session json path");
  result = resumeRuntimeSession(readJson(inputPath), extraPath ? readJson(extraPath) : {});
} else if (command === "summary") result = summarizeRuntimeSession(readJson(inputPath));
else {
  console.error("usage: node src/runtime-cli.js plan|run|resume|summary <json> [payload.json]");
  process.exit(2);
}
console.log(JSON.stringify(result, null, 2));
