const RUNTIME_PREFIXES = ["SP00_", "sp00.", "SP00.SRC.", "SP00.MODE."];
const EXTERNAL_CONTEXT_PREFIXES = ["EXTCTX_", "externalContext.", "EXTCTX.SRC.", "EXTCTX.MODE.", "PRJ_", "project.", "PRJ.SRC.", "PRJ.MODE."];

const issue = (code, path, message) => ({ code, path, message, severity: "STOP" });

export function validateNamespace(input) {
  const issues = [];
  for (const entry of input.dsgn?.registrations ?? []) {
    const value = entry?.value ?? "";
    if (EXTERNAL_CONTEXT_PREFIXES.some((prefix) => value.startsWith(prefix))) {
      issues.push(issue("NAMESPACE_MIXED", "runtime.registrations",
        `${value}はexternal context名前空間でありSP00 registryへ登録できません`));
    }
    if (!RUNTIME_PREFIXES.some((prefix) => value.startsWith(prefix))) {
      issues.push(issue("SP00_NAMESPACE_REQUIRED", "runtime.registrations",
        `${value}はSP00名前空間ではありません`));
    }
  }
  return issues;
}

export const SP00_NAMESPACE = Object.freeze({
  runtime: RUNTIME_PREFIXES,
  externalContextReserved: EXTERNAL_CONTEXT_PREFIXES
});
