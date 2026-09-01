const EXECUTION_TRIGGERS = Object.freeze([
  "pack_cutout",
  "story_pack_cutout",
  "話パック切り出し",
  "話パック生成",
  "話パック検査",
  "話パック正本候補",
  "梱包作業",
  "荷造り",
  "writer package",
  "pack writer handoff",
  "WRITE投入候補"
]);

const NON_EXECUTION_CONTEXT = Object.freeze([
  "とは何",
  "って何",
  "意味を教えて",
  "相談",
  "方針だけ",
  "実行不要",
  "まだ作業しない",
  "仮に",
  "と言ったら",
  "と頼んだら",
  "した場合",
  "どうなる",
  "説明して"
]);

function hasQuotedTrigger(command) {
  const quoted = [...command.matchAll(/[「『"']([^」』"']+)[」』"']/g)].map((match) => match[1]);
  return quoted.some((part) => EXECUTION_TRIGGERS.some((trigger) => part.includes(trigger)));
}

export function route(command, explicitOperation) {
  if (explicitOperation != null) {
    const normalized = String(explicitOperation).trim().toUpperCase();
    if (["PACK_CUTOUT", "STORY_PACK_CUTOUT"].includes(normalized)) {
      return { kind: "ROUTED", operation: "PACK_CUTOUT", spec: { tool: "PACK_CUTOUT" }, match: "EXPLICIT" };
    }
    return { kind: "STOP", code: "UNKNOWN_EXPLICIT_OPERATION" };
  }
  if (typeof command !== "string" || command.trim() === "") {
    return { kind: "STOP", code: "COMMAND_REQUIRED" };
  }
  const normalized = command.trim();
  const lower = normalized.toLowerCase();
  if (NON_EXECUTION_CONTEXT.some((token) => lower.includes(token.toLowerCase())) || hasQuotedTrigger(normalized)) {
    return { kind: "STOP", code: "NON_EXECUTION_CONTEXT" };
  }
  const hit = EXECUTION_TRIGGERS.find((trigger) => lower.includes(trigger.toLowerCase()));
  if (!hit) return { kind: "STOP", code: "UNKNOWN_OPERATION" };
  return { kind: "ROUTED", operation: "PACK_CUTOUT", spec: { tool: "PACK_CUTOUT" }, match: "TRIGGER", trigger: hit };
}
