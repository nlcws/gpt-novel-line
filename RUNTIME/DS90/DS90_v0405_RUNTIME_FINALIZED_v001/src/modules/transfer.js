import { forbidden, required } from "../runtime/rule.js";
import { validateTransferDeterministic } from "../validation/deterministic.js";

export const transferModule = Object.freeze({
  id: "MOUNT_TRANSFER",
  controlPolicy: Object.freeze({
    "000_C": ["entrypoint", "readOrder", "currentLocation", "unresolvedStops", "nextWork"]
  }),
  rules: [
    required("MT-001", "transfer.currentMountPresent", "現行マウントZIPが必要"),
    required("MT-002", "transfer.controlStartGateRead", "000_C DS90 START GATE実読が必要"),
    required("MT-003", "transfer.inventoryBuilt", "回収素材一覧が必要"),
    required("MT-004", "transfer.diffReportBuilt", "差分レポートが必要"),
    required("MT-013", "transfer.phase", "移管段階が必要"),
    required("MT-014", "transfer.inventory", "回収素材実体が必要"),
    required("MT-015", "transfer.reflected", "反映素材一覧が必要"),
    required("MT-016", "transfer.held", "保留素材一覧が必要"),
    required("MT-017", "transfer.discarded", "棄却素材一覧が必要"),
    required("MT-018", "transfer.dailyPrimarySource", "日常一次参照層が必要"),
    required("MT-019", "transfer.canonicalArchive", "正本保管層が必要"),
    required("MT-021", "transfer.mountTransferProcessActive", "MOUNT_TRANSFER_PROCESS_ACTIVEが必要"),
    required("MT-022", "transfer.existingShelvesPreserved", "既存棚保持が必要"),
    required("MT-023", "transfer.nextIndividualRestartReady", "次個体が再確認なしに再開できる引継ぎが必要"),
    forbidden("MT-005", "transfer.includeDs90InProject", "90制御ファイルを作品棚へ混ぜない"),
    forbidden("MT-009", "transfer.claimCompleteWhileStopped", "STOP中に反映済みと書かない")
    ,
    forbidden("MT-020", "transfer.commonOperationUsedAsStorySource", "共通運用を本文条件源にしない"),
    forbidden("MT-024", "transfer.shallowMemoZip", "浅いメモZIPを移管成果物にしない"),
    forbidden("MT-025", "transfer.newShelfCreatedWithoutExistingTarget", "既存棚確認なしに新棚を作らない"),
    forbidden("MT-026", "transfer.currentConveniencePrioritized", "現在個体の作業性を未来再開性より優先しない"),
    forbidden("MT-030", "transfer.summaryOnlyHandoff", "要約だけの移管成果物を出さない"),
    forbidden("MT-031", "transfer.requiresRecipientInference", "受け手に導線推測を要求しない"),
    forbidden("MT-032", "transfer.unconvergedDeliverable", "未収束成果物を提出しない"),
    forbidden("MT-038", "transfer.helperPackOnly", "移管補助メモだけをマウント移管成果物にしない"),
    forbidden("MT-039", "transfer.linksOnlyForMountedZips", "現行マウントZIPをURLだけで代替しない"),
    forbidden("MT-040", "transfer.abstractTransferConcept", "抽象的な移管理論を成果物の代わりにしない")
  ],
  validate(input) {
    const transferResult = validateTransferDeterministic(input);
    return { issues: [...transferResult.issues] };
  },
  stopOutputs: ["reason", "inventory", "shelfCandidates", "unreflectedReasons", "deletionCandidates", "requiredAttachments", "provisionalStart"]
});
