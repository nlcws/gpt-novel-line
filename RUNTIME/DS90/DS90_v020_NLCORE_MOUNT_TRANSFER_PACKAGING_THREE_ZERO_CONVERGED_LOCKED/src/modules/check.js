import { forbidden, required } from "../runtime/rule.js";
import { validateCheck } from "../validation/deterministic.js";

export const checkModule = Object.freeze({
  id: "CHECK",
  loadWhen: ["STOP判定", "検収", "完了確認", "カード検査", "移管検査"],
  profileGate: "src/profiles/singleEpisodeProfileGate.js",
  rules: [
    required("CHK-001", "externalContext.gate021.read", "外部021を実読する"),
    required("CHK-002", "externalContext.gate021.readOrder", "021に読む順がある"),
    required("CHK-003", "externalContext.gate021.canonicalRoute", "021に正本導線がある"),
    required("CHK-004", "externalContext.gate021.currentLocation", "021に現在地がある"),
    forbidden("CHK-005", "evidence.promoteConfirmedToCanonical", "確認済みを正本確認済みにしない"),
    forbidden("CHK-006", "work.outsideDelegation", "委任範囲外へ進まない"),
    forbidden("CHK-007", "work.adoptAiCandidate", "AI候補を運用確定にしない"),
    forbidden("CHK-008", "work.fillShortageByInference", "不足を推測で補完しない")
  ],
  validate: validateCheck
});
