#!/usr/bin/env node
import { inspectProjectLockedPackDirectory } from "./projectlocked-pack-gate.js";

const root = process.argv[2];
const availableMountIds = (process.env.PW_AVAILABLE_MOUNTS ?? "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const result = inspectProjectLockedPackDirectory(root, { availableMountIds });
console.log(JSON.stringify(result, null, 2));
process.exit(result.inspectDecision === "PROJECTLOCKED_PACK_INSPECT_OK" ? 0 : 1);
