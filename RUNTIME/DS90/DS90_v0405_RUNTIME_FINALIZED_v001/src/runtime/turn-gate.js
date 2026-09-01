import { route } from "../router.js";

const containsAny = (text, terms) => terms.some((term) => text.includes(term));

const DESIGN_MARKERS = Object.freeze([
  "設計", "構成", "プロット", "話カード", "世界観", "設定", "フロー", "章", "幕", "部フロー", "design", "plot"
]);
const WRITING_NOUNS = Object.freeze([
  "小説", "本文", "物語", "話", "短編", "長編", "シナリオ", "novel", "story", "prose"
]);
const WRITING_ACTIONS = Object.freeze([
  "書いて", "書く", "執筆", "本文出力", "本文生成", "write", "draft"
]);
const REVISION_MARKERS = Object.freeze([
  "本文修正", "文章修正", "修正刃", "ts90", "revision", "revise"
]);
const REVISION_NOUNS = Object.freeze([
  "本文", "文章", "原稿", "prose", "manuscript"
]);
const REVISION_ACTIONS = Object.freeze([
  "修正", "直して", "直す", "推敲", "校正", "revise", "edit"
]);
const CONTINUE_MARKERS = Object.freeze([
  "次へ", "続き", "続けて", "進めて", "そのまま", "continue", "next"
]);

export const TURN_ROLE_POLICY = Object.freeze({
  activeRole: "DS90",
  continuity: "DS90_CONTROL_ACTIVE_UNTIL_EXPLICIT_USER_ROLE_CHANGE",
  unknownOperation: "RETAIN_DS90_ROLE",
  genericFallback: "FORBIDDEN_WHILE_DS90_ACTIVE",
  stopBehavior: "RETAIN_ACTIVE_ROLE_AND_RETURN_STOP_CONDITION",
  persistenceMeaning: "WRITE_PERSISTENCE_ONLY"
});

export function evaluateUserTurn(command, options = {}) {
  const activeRole = options.activeRole ?? "DS90";
  const explicitRoleChange = options.explicitRoleChange === true;
  if (explicitRoleChange) {
    return {
      kind: "EXPLICIT_ROLE_CHANGE",
      previousRole: activeRole,
      continuity: "USER_OWNS_ROLE_CHANGE"
    };
  }
  if (activeRole !== "DS90") {
    return {
      kind: "ROLE_NOT_DS90",
      activeRole,
      continuity: "DO_NOT_IMPERSONATE_DS90"
    };
  }
  if (typeof command !== "string" || command.trim() === "") {
    return {
      kind: "DS90_STOP",
      code: "COMMAND_REQUIRED",
      activeRole: "DS90",
      continuity: TURN_ROLE_POLICY.continuity
    };
  }

  const machine = route(command, null);
  if (machine.kind === "ROUTED") {
    return {
      kind: "RUNTIME_OPERATION",
      activeRole: "DS90",
      route: machine,
      continuity: TURN_ROLE_POLICY.continuity
    };
  }

  const text = command.trim().toLowerCase();
  const hasDesign = containsAny(text, DESIGN_MARKERS);
  const wantsRevision = containsAny(text, REVISION_MARKERS) || (containsAny(text, REVISION_NOUNS) && containsAny(text, REVISION_ACTIONS));
  const wantsWriting = !hasDesign && containsAny(text, WRITING_NOUNS) && containsAny(text, WRITING_ACTIONS);

  if (wantsRevision) {
    return {
      kind: "SPECIALIST_REQUIRED",
      specialistTarget: "TS90",
      code: "REVISION_ROLE_BOUNDARY",
      activeRole: "DS90",
      fallback: "STOP_IF_SPECIALIST_UNAVAILABLE",
      runtimeOperation: "SPECIALIST_HANDOFF",
      requestPatch: { operation: "SPECIALIST_HANDOFF", payload: { specialistTarget: "TS90" } },
      returnRole: "DS90",
      continuity: TURN_ROLE_POLICY.continuity
    };
  }
  if (wantsWriting) {
    return {
      kind: "SPECIALIST_REQUIRED",
      specialistTarget: "PW90",
      code: "WRITING_ROLE_BOUNDARY",
      activeRole: "DS90",
      fallback: "STOP_IF_SPECIALIST_UNAVAILABLE",
      runtimeOperation: "SPECIALIST_HANDOFF",
      requestPatch: { operation: "SPECIALIST_HANDOFF", payload: { specialistTarget: "PW90" } },
      returnRole: "DS90",
      continuity: TURN_ROLE_POLICY.continuity
    };
  }

  if (machine.code === "CONSULT_ONLY_CONTEXT") {
    return {
      kind: "DS90_ROLE_CONTINUATION",
      mode: "CONSULT",
      activeRole: "DS90",
      code: machine.code,
      continuity: TURN_ROLE_POLICY.continuity
    };
  }

  if (hasDesign) {
    return {
      kind: "DS90_ROLE_CONTINUATION",
      mode: "DESIGN_OR_CONTROL_INPUT",
      activeRole: "DS90",
      code: machine.code ?? "NO_MACHINE_OPERATION_MATCH",
      continuity: TURN_ROLE_POLICY.continuity,
      genericFallback: "FORBIDDEN"
    };
  }
  if (containsAny(text, CONTINUE_MARKERS)) {
    return {
      kind: "DS90_ROLE_CONTINUATION",
      mode: "CONTINUE_FROM_CURRENT",
      activeRole: "DS90",
      code: machine.code ?? "NO_MACHINE_OPERATION_MATCH",
      continuity: TURN_ROLE_POLICY.continuity,
      genericFallback: "FORBIDDEN"
    };
  }
  return {
    kind: "DS90_STOP",
    activeRole: "DS90",
    code: machine.code ?? "UNKNOWN_USER_TURN",
    continuity: TURN_ROLE_POLICY.continuity,
    genericFallback: "FORBIDDEN"
  };
}
