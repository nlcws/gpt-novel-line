const DESIGNER_PREFIXES = ["DSGN_", "dsgn.", "DSGN.SRC.", "DSGN.MODE."];
const EXTERNAL_CONTEXT_PREFIXES = ["EXTCTX_", "externalContext.", "EXTCTX.SRC.", "EXTCTX.MODE.", "PRJ_", "project.", "PRJ.SRC.", "PRJ.MODE."];

const issue = (code, path, message) => ({ code, path, message, severity: "STOP" });

export function validateNamespace(input) {
  const issues = [];
  for (const entry of input.dsgn?.registrations ?? []) {
    const value = entry?.value ?? "";
    if (EXTERNAL_CONTEXT_PREFIXES.some((prefix) => value.startsWith(prefix))) {
      issues.push(issue("NAMESPACE_MIXED", "dsgn.registrations",
        `${value}はexternal context名前空間でありDSGN registryへ登録できません`));
    }
    if (!DESIGNER_PREFIXES.some((prefix) => value.startsWith(prefix))) {
      issues.push(issue("DSGN_NAMESPACE_REQUIRED", "dsgn.registrations",
        `${value}はDSGN名前空間ではありません`));
    }
  }
  return issues;
}

export const DSGN_NAMESPACE = Object.freeze({
  designer: DESIGNER_PREFIXES,
  externalContextReserved: EXTERNAL_CONTEXT_PREFIXES
});
