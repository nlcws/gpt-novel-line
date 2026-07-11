import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { execute } from "./engine.js";

const file = process.argv[2];
if (file == null) {
  console.error("usage: node src/cli.js <request.json>");
  process.exit(2);
}
try {
  const request = JSON.parse(await readFile(resolve(file), "utf8"));
  const result = execute(request);
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = { PASS: 0, USER_OVERRIDDEN: 0, STOP: 1 }[result.decision] ?? 2;
} catch (error) {
  console.error(JSON.stringify({ decision: "STOP", code: "INPUT_ERROR", message: error.message }, null, 2));
  process.exitCode = 2;
}
