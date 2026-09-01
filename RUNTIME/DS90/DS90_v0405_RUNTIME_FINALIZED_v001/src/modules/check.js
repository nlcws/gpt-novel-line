import { forbidden, required } from "../runtime/rule.js";
import { validateCheck } from "../validation/deterministic.js";

export const checkModule = Object.freeze({
  id: "CHECK",
  loadWhen: ["STOP判定", "検収", "完了確認", "カード検査", "移管検査"],
  profileGate: "src/profiles/singleEpisodeProfileGate.js",
  rules: [
    required("CHK-001", "knowledgeContext.startGate.read", "000_C DS90 START GATEを実読する"),
    required("CHK-002", "knowledgeContext.dispatch.verified", "000_C runtime dispatchを検証する"),
    required("CHK-003", "knowledgeContext.pkdb.mounted", "PKDB snapshotをマウントする"),
    required("CHK-004", "knowledgeContext.pkdb.validated", "PKDB snapshotを検証する"),
    forbidden("CHK-005", "evidence.promoteConfirmedToCanonical", "確認済みを正本確認済みにしない"),
    forbidden("CHK-006", "work.outsideDelegation", "委任範囲外へ進まない"),
    forbidden("CHK-007", "work.adoptAiCandidate", "AI候補を運用確定にしない"),
    forbidden("CHK-008", "work.fillShortageByInference", "不足を推測で補完しない")
  ],
  validate: validateCheck
});
