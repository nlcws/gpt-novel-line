import { forbidden, required } from "../runtime/rule.js";
import { validateIndexGraph } from "../indexing/validator.js";
import { validateTransferDeterministic } from "../validation/deterministic.js";

export const transferModule = Object.freeze({
  id: "MOUNT_TRANSFER",
  indexValidator: "src/indexing/validator.js",
  shelfPolicy: Object.freeze({
    "021": ["readOrder", "currentLocation", "canonicalRoute", "unresolvedStops", "nextWork"],
    "022": ["fixedWorld", "background", "characterCore", "prohibitions", "immutableTruth"],
    "024": ["variableFlow", "goals", "anchors", "simulation", "candidateHandling"],
    "028": ["oral", "hold", "unconfirmed", "provisional", "inferred"],
    "092": ["episodeCard", "episodeBone", "thickCardConditions"],
    "094": ["logs", "heat", "conditions", "results"],
    "099": ["writerPack", "cards", "requiredOriginals"]
  }),
  rules: [
    required("MT-001", "transfer.currentMountPresent", "現行マウントZIPが必要"),
    required("MT-002", "transfer.gate021Read", "021実読が必要"),
    required("MT-003", "transfer.inventoryBuilt", "回収素材一覧が必要"),
    required("MT-004", "transfer.diffReportBuilt", "差分レポートが必要"),
    required("MT-013", "transfer.phase", "移管段階が必要"),
    required("MT-014", "transfer.inventory", "回収素材実体が必要"),
    required("MT-015", "transfer.reflected", "反映素材一覧が必要"),
    required("MT-016", "transfer.held", "保留素材一覧が必要"),
    required("MT-017", "transfer.discarded", "棄却素材一覧が必要"),
    required("MT-018", "transfer.dailyPrimarySource", "日常一次参照層が必要"),
    required("MT-019", "transfer.canonicalArchive", "正本保管層が必要"),
    required("MT-012", "index", "移管後索引グラフが必要"),
    forbidden("MT-005", "transfer.includeDs90InProject", "90制御ファイルを作品棚へ混ぜない"),
    forbidden("MT-006", "transfer.putUnconfirmedIn022", "未確認を022へ入れない"),
    forbidden("MT-007", "transfer.putEverythingIn028", "全素材を028へ逃がさない"),
    forbidden("MT-008", "transfer.use099AsCanon", "099を作品骨の代替にしない"),
    forbidden("MT-009", "transfer.claimCompleteWhileStopped", "STOP中に反映済みと書かない")
    ,
    forbidden("MT-020", "transfer.commonOperationUsedAsStorySource", "共通運用を本文条件源にしない")
  ],
  validate(input) {
    const indexResult = validateIndexGraph(input.index);
    const transferResult = validateTransferDeterministic(input);
    return { issues: [...indexResult.issues, ...transferResult.issues] };
  },
  stopOutputs: ["reason", "inventory", "shelfCandidates", "unreflectedReasons", "deletionCandidates", "requiredAttachments", "provisionalStart"]
});
