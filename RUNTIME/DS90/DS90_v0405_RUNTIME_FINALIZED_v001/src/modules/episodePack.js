import { forbidden, required } from "../runtime/rule.js";

const issue = (code, path, message) => ({ code, path, message, severity: "STOP" });

function longestRun(values) {
  let longest = 0;
  let current = 0;
  let previous = Symbol();
  for (const value of values) {
    current = value === previous ? current + 1 : 1;
    longest = Math.max(longest, current);
    previous = value;
  }
  return longest;
}

export const episodePackModule = Object.freeze({
  id: "EPISODE_PACK",
  reads: ["assets/specs/092_DS_CARD.md", "assets/specs/093_DS_CARD_TEST.md", "assets/specs/091_DS_CHECK.md"],
  rules: [
    required("PACK-001", "episodePack.expectedCount", "期待話数が必要"),
    required("PACK-002", "episodePack.episodes", "単話一覧が必要"),
    forbidden("PACK-003", "episodePack.createWriterReadyBeforeCommit", "検収前にwriter_readyを作らない"),
    forbidden("PACK-004", "episodePack.create099BeforeCommit", "検収前に099を作らない")
  ],
  validate(input) {
    const issues = [];
    const pack = input.episodePack ?? {};
    const episodes = pack.episodes ?? [];
    if (episodes.length !== pack.expectedCount) {
      issues.push(issue("PACK_COUNT_MISMATCH", "episodePack.episodes", "話数が期待値と一致しません"));
    }
    if (new Set(episodes.map((entry) => entry.id)).size !== episodes.length) {
      issues.push(issue("PACK_DUPLICATE_EPISODE", "episodePack.episodes", "話IDが重複しています"));
    }
    episodes.forEach((episode, index) => {
      for (const field of ["id", "profileId", "cardId", "canonicalAnchor", "returnDestination"]) {
        if (!episode?.[field]) {
          issues.push(issue("PACK_EPISODE_REQUIRED", `episodePack.episodes[${index}].${field}`,
            "単話必須欄が欠けています"));
        }
      }
      if ((episode.requiredStopIds ?? []).some((id) => !(episode.observedStopIds ?? []).includes(id))) {
        issues.push(issue("PACK_STOP_DROPPED", `episodePack.episodes[${index}]`, "禁止線が単話で脱落しています"));
      }
      if (episode.writerRequestCardId !== episode.cardId) {
        issues.push(issue("PACK_WRITER_CARD_MISMATCH", `episodePack.episodes[${index}]`,
          "writer requestとカードが一致しません"));
      }
    });
    const threshold = pack.maxSameRoleRun ?? 3;
    for (const field of ["mainCharacter", "secondary", "openingType", "receiver", "returnDestination"]) {
      if (longestRun(episodes.map((entry) => entry[field] ?? null)) > threshold) {
        issues.push(issue("PACK_ROLE_MONOTONY", `episodePack.episodes.${field}`,
          `${field}の連続固定が上限を超えています`));
      }
    }
    return { issues };
  }
});
