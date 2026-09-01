import assert from "node:assert/strict";
import test from "node:test";
import { evaluateUserTurn, TURN_ROLE_POLICY } from "../src/runtime/turn-gate.js";
import { execute } from "../src/engine.js";

test("public-log prose request is caught at PW90 boundary", () => {
  const result = evaluateUserTurn("兄弟が最後の夏休みを過ごす話を書いて。長さはどうでもいいから、いい感じにまとめて。", { activeRole: "DS90" });
  assert.equal(result.kind, "SPECIALIST_REQUIRED");
  assert.equal(result.specialistTarget, "PW90");
  assert.equal(result.fallback, "STOP_IF_SPECIALIST_UNAVAILABLE");
  assert.equal(result.runtimeOperation, "SPECIALIST_HANDOFF");
  assert.equal(result.requestPatch.payload.specialistTarget, "PW90");
  assert.equal(result.returnRole, "DS90");
});

test("design wording wins over generic write wording", () => {
  const result = evaluateUserTurn("この小説の設計を書いて", { activeRole: "DS90" });
  assert.equal(result.kind, "DS90_ROLE_CONTINUATION");
  assert.equal(result.activeRole, "DS90");
});

test("unknown ordinary input stops while retaining DS90 role", () => {
  const result = evaluateUserTurn("これどう思う？", { activeRole: "DS90" });
  assert.equal(result.kind, "DS90_STOP");
  assert.equal(result.genericFallback, "FORBIDDEN");
  assert.equal(result.continuity, TURN_ROLE_POLICY.continuity);
});

test("next continues DS90 current state", () => {
  const result = evaluateUserTurn("次へ", { activeRole: "DS90" });
  assert.equal(result.kind, "DS90_ROLE_CONTINUATION");
  assert.equal(result.mode, "CONTINUE_FROM_CURRENT");
});

test("known specialist command keeps machine route", () => {
  const result = evaluateUserTurn("マウント移管して", { activeRole: "DS90" });
  assert.equal(result.kind, "RUNTIME_OPERATION");
  assert.equal(result.route.operation, "MOUNT_TRANSFER");
});

test("explicit role change is user owned", () => {
  const result = evaluateUserTurn("普通に答えて", { activeRole: "DS90", explicitRoleChange: true });
  assert.equal(result.kind, "EXPLICIT_ROLE_CHANGE");
});

test("role policy forbids generic fallback while DS90 active", () => {
  assert.equal(TURN_ROLE_POLICY.genericFallback, "FORBIDDEN_WHILE_DS90_ACTIVE");
  assert.equal(TURN_ROLE_POLICY.persistenceMeaning, "WRITE_PERSISTENCE_ONLY");
  assert.equal(TURN_ROLE_POLICY.continuity, "DS90_CONTROL_ACTIVE_UNTIL_EXPLICIT_USER_ROLE_CHANGE");
});


test("execute mainline catches public-log prose request before generic routing", () => {
  const result = execute({ command: "兄弟が最後の夏休みを過ごす話を書いて。長さはどうでもいいから、いい感じにまとめて。" });
  assert.equal(result.operation, "SPECIALIST_HANDOFF");
  assert.equal(result.handler, "SPECIALIST_DISPATCH");
  assert.notEqual(result.state, "BOOT_READY");
});

test("execute mainline stops unknown ordinary input without generic fallback", () => {
  const result = execute({ command: "これどう思う？" });
  assert.equal(result.handler, "TURN_GATE");
  assert.equal(result.state, "DS90_TURN_STOP");
  assert.equal(result.decision, "STOP");
  assert.equal(result.turnGate.genericFallback, "FORBIDDEN");
  assert.equal(result.roleContinuity, TURN_ROLE_POLICY.continuity);
});

test("specialist gate patch remains schema-legal by placing target under payload", () => {
  const gate = evaluateUserTurn("小説を書いて", { activeRole: "DS90" });
  assert.equal(gate.requestPatch.operation, "SPECIALIST_HANDOFF");
  assert.equal(gate.requestPatch.payload.specialistTarget, "PW90");
  assert.equal(Object.prototype.hasOwnProperty.call(gate.requestPatch, "specialistTarget"), false);
});


test("execute mainline keeps clear design wording under DS90", () => {
  const result = execute({ command: "この小説の設計を書いて" });
  assert.equal(result.handler, "TURN_GATE");
  assert.equal(result.state, "DS90_ROLE_CONTINUATION");
  assert.equal(result.decision, "PASS");
  assert.equal(result.turnGate.mode, "DESIGN_OR_CONTROL_INPUT");
});


test("turn control END_LOG never claims operation output", () => {
  const result = execute({ command: "次へ" });
  assert.equal(result.decision, "PASS");
  assert.equal(result.endLog.unreflected, "TURN_CONTROL_ONLY_NO_OPERATION_OUTPUT");
  assert.match(result.endLog.notice, /no design, specialist, file-read, or persistence completion is claimed/);
  assert.equal(result.endLog.operation, null);
});


test("schema validation precedes turn-gate STOP", () => {
  const result = execute({ command: "これどう思う？", impossible_extra_key: true });
  assert.equal(result.decision, "STOP");
  assert.equal(result.handler, null);
  assert.ok(result.issues.length > 0);
  assert.notEqual(result.state, "DS90_TURN_STOP");
});


test("natural Japanese body revision wording routes to TS90", () => {
  for (const command of ["本文を修正して", "文章を直して", "原稿を推敲して"]) {
    const result = evaluateUserTurn(command, { activeRole: "DS90" });
    assert.equal(result.kind, "SPECIALIST_REQUIRED");
    assert.equal(result.specialistTarget, "TS90");
  }
});

test("setting revision remains DS90 design work", () => {
  const result = evaluateUserTurn("この設定を修正して", { activeRole: "DS90" });
  assert.equal(result.kind, "DS90_ROLE_CONTINUATION");
  assert.equal(result.mode, "DESIGN_OR_CONTROL_INPUT");
});


test("unknown turn STOP tells the host how to recover without changing role", () => {
  const result = execute({ command: "これどう思う？" });
  assert.equal(result.decision, "STOP");
  assert.match(result.issues[0].message, /役割は維持/);
  assert.match(result.issues[0].message, /対象を示す/);
});
