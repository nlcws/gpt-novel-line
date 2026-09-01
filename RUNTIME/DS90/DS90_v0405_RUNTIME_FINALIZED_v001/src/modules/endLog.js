import { forbidden } from "../runtime/rule.js";

export const endLogModule = Object.freeze({
  id: "END_LOG",
  fields: ["current", "unreflected", "next", "notice"],
  maxLines: 4,
  rules: [
    forbidden("END-001", "endLogInput.usedAsCanonical", "過去END_LOGを正本にしない"),
    forbidden("END-002", "endLogInput.usedAsSource", "過去END_LOGをsource代替にしない"),
    forbidden("END-003", "endLogInput.usedAsReadProof", "過去END_LOGを読了証明にしない"),
    forbidden("END-004", "endLogInput.usedAsTransferProof", "過去END_LOGを移管済み判定にしない"),
    forbidden("END-005", "endLogInput.containsLongText", "過去END_LOGから長文を持ち込まない"),
    forbidden("END-006", "endLogInput.containsManuscript", "過去END_LOGから本文を持ち込まない"),
    forbidden("END-007", "endLogInput.treatedAsLatestWithoutCheck", "古いEND_LOGを最新状態にしない")
  ]
});
