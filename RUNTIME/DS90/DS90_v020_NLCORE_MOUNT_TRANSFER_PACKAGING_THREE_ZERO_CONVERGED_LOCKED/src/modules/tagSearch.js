import { forbidden, required } from "../runtime/rule.js";
import { validateIndexGraph } from "../indexing/validator.js";
import { searchTagRegistry } from "../indexing/searchEngine.js";

function repairType(entry) {
  return ({
    ENTITY: "MISSING_INDEX",
    RELATION: "MISSING_INDEX",
    REVERSE_LINK: "MISSING_INDEX"
  })[entry.kind] ?? "MISSING_INDEX";
}

function proposal(id, repair_type, target_item_id, proposed_action, evidence) {
  return Object.freeze({
    repair_id: id,
    repair_type,
    target_item_id,
    proposed_action,
    evidence,
    apply_status: "PROPOSAL_ONLY"
  });
}

export const tagSearchModule = Object.freeze({
  id: "TAG_SEARCH",
  reads: [
    "assets/specs/089_DS_TAG_SEARCH.md",
    "assets/templates/TAG_INDEX_TEMPLATE.txt",
    "assets/templates/STOP_TAG_INDEX_TEMPLATE.md",
    "assets/templates/INDEX_MAP_TEMPLATE.md"
  ],
  searchOrder: [
    "EXACT", "ALIAS", "SHELF_TAG", "ENTITY",
    "RELATION", "HINT", "SOURCE", "INDEX_REPAIR"
  ],
  rules: [
    required("TAG-001", "search.query", "検索意図が必要"),
    required("TAG-008", "index", "索引グラフ入力が必要"),
    forbidden("TAG-002", "search.requireUserTagName", "ユーザーへタグ名指定を要求しない"),
    forbidden("TAG-003", "search.skipExistingIndex", "既存TAG_INDEXを飛ばさない"),
    forbidden("TAG-004", "search.useTagAsCanonical", "検索タグを正本根拠にしない"),
    forbidden("TAG-005", "search.useStopTagAsCanonical", "STOP_TAGを正本根拠にしない"),
    forbidden("TAG-006", "search.markCompleteFromTagOnly", "タグだけで完了にしない"),
    forbidden("TAG-007", "search.confirmUnconfirmedFromResult", "検索結果で未確認を確定しない")
  ],
  validate(input) {
    const graph = validateIndexGraph(input.index);
    const search = searchTagRegistry(input.search, input.index);
    const graphRepairs = graph.repairs.map((entry, index) =>
      proposal(`GRAPH-${index + 1}`, repairType(entry), entry.target,
        `${entry.kind}索引を既存索引内で補修する`, entry));
    const searchRepairs = search.issues.flatMap((entry, index) => {
      const type = ({
        TAG_MEANING_UNDEFINED: "TAG_DEFINITION_MISSING",
        TAG_MEANING_DRIFT: "TAG_MEANING_DRIFT",
        ENTITY_TAG_MEANING_UNDEFINED: "ENTITY_DEFINITION_MISSING",
        RELATION_TAG_MEANING_UNDEFINED: "RELATION_DEFINITION_MISSING",
        LINE_REFERENCE_UPDATE_INCOMPLETE: "STALE_LINE_REF"
      })[entry.code];
      return type == null ? [] : [proposal(
        `SEARCH-${index + 1}`, type, entry.path,
        "別工程または明示ユーザー裁定で管理情報を補修する", entry
      )];
    });
    return {
      issues: [...graph.issues, ...search.issues],
      output: { ...search.output, repairs: Object.freeze([...graphRepairs, ...searchRepairs]) }
    };
  },
  output: [
    "directMatches", "entityMatches", "relationMatches",
    "unconfirmed", "sourcePaths", "repairs", "absenceReasons"
  ]
});
