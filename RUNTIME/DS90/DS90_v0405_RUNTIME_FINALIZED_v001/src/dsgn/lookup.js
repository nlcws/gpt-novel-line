export const OLD_ALIAS = Object.freeze({
  "主": "dsgn.layer.axis.surface",
  "副": "dsgn.layer.axis.pressure",
  "変奏": "dsgn.layer.flow.sentence_variation",
  "向かう方向": "dsgn.layer.flow.direction",
  "地の文観測": "dsgn.layer.narration.destination",
  "内面": "dsgn.layer.leak.axis",
  "前景": "dsgn.layer.axis.surface",
  "背景降格": "dsgn.layer.backlog.routing",
  "戻し先": "dsgn.layer.closing.vector",
  "残留点": "dsgn.layer.closing.vector",
  "薄回補強点": "dsgn.layer.episode.supplement"
});

const issue = (code, path, message) => ({ code, path, message, severity: "STOP" });

export function validateLookup(input) {
  const issues = [];
  const lookup = input.dsgn?.lookup ?? {};
  if ((lookup.oldAliases ?? []).some((value) => value === "変奏あり")) {
    issues.push(issue("OLD_ALIAS_SINGLE_VALUE", "dsgn.lookup.oldAliases",
      "変奏ありを単一値として使えません。sentence_variationの分解lookupが必要です"));
  }
  for (const request of lookup.requests ?? []) {
    if (!request?.tag?.startsWith("dsgn.")) {
      issues.push(issue("LOOKUP_TAG_INVALID", "dsgn.lookup.requests", "lookupにはdsgn.* tagが必要です"));
    }
    if (!request?.sourceId?.startsWith("DSGN.SRC.")) {
      issues.push(issue("LOOKUP_SOURCE_UNRESOLVED", "dsgn.lookup.requests",
        "lookup対象のsource_idを確認する必要があります"));
    }
  }
  return issues;
}
