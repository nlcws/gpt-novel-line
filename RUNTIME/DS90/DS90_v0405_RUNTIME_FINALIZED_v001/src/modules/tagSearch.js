import { forbidden, required } from "../runtime/rule.js";
import { extractShelfPointers } from "../indexing/validator.js";
import { searchTagRegistry } from "../indexing/searchEngine.js";

export const tagSearchModule = Object.freeze({
  id: "TAG_SEARCH",
  reads: [
    "assets/specs/089_DS_TAG_SEARCH.md",
    "assets/specs/098_DS_INDEX.md",
    "assets/templates/TAG_INDEX_TEMPLATE.txt",
    "assets/templates/STOP_TAG_INDEX_TEMPLATE.md",
    "assets/dsgn_infra/04_MODULE/tag_search/TAG_INDEX_MACHINE_SCHEMA_v1.json",
    "assets/runtime_control/DS90_V0401_CURRENT_SOURCE_LOCATOR_LOCK.md",
    "assets/runtime_control/DS90_V0400_SHELF_PKDB_TAG_LOCK.md"
  ],
  rules: [
    required("TAG-001", "search.query", "検索意図の表示文が必要"),
    required("TAG-002", "search.intents", "DS90側で確定したmachine intentが必要"),
    forbidden("TAG-003", "search.requireUserTagName", "ユーザーへタグ名指定を要求しない"),
    forbidden("TAG-004", "search.useTagAsCanonical", "PKDB TAGを作品正本根拠にしない"),
    forbidden("TAG-005", "search.useStopTagAsCanonical", "STOP_TAGを正本根拠にしない"),
    forbidden("TAG-006", "search.markCompleteFromTagOnly", "TAG結果だけで設計完了にしない"),
    forbidden("TAG-007", "search.confirmUnconfirmedFromResult", "TAG結果で未確認を確定しない")
  ],
  validate(input) {
    const evidence = input?.runtimeEvidence?.pkdb;
    const search = searchTagRegistry(input.search, evidence?.semanticRecords ?? []);
    const extracted = extractShelfPointers(evidence?.semanticRecords ?? []);
    const readMap = new Map((evidence?.shelfReads ?? []).map((entry) => [entry.shelfPointer, entry]));
    const matches = extracted.pointers.map((entry) => ({
      ...entry,
      read: readMap.has(entry.shelfPointer),
      shelfEvidence: readMap.get(entry.shelfPointer) ?? null
    }));
    const issues = [...search.issues, ...extracted.issues];
    if (matches.length === 0) {
      issues.push({ code: "TAG_SEARCH_NO_CURRENT_SHELF_POINTER", path: "runtimeEvidence.pkdb.semanticRecords", message: "PKDB lookup returned no current shelf pointer", severity: "STOP" });
    }
    return {
      issues,
      output: {
        query: input?.search?.query ?? null,
        intents: search.output.intents,
        matches,
        sourcePaths: matches.map((entry) => entry.shelfPointer),
        unconfirmed: matches.filter((entry) => ["HOLD", "UNKNOWN"].includes(entry.status)),
        repairs: [],
        absenceReasons: matches.length === 0 ? ["CURRENT_SHELF_POINTER_NOT_FOUND"] : []
      }
    };
  },
  output: ["matches", "sourcePaths", "unconfirmed", "repairs", "absenceReasons"]
});
