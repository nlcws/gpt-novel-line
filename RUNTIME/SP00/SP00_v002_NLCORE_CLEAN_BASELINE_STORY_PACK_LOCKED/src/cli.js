import { readFileSync } from "node:fs";
import { execute } from "./engine.js";
const input = JSON.parse(readFileSync(0, "utf8"));
console.log(JSON.stringify(execute(input), null, 2));
