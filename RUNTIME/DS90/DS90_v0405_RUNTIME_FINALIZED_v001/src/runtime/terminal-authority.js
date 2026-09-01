const PRIORITY = Object.freeze({ PASS: 0, USER_OVERRIDDEN: 1, STOP: 2 });

function strongest(stages) {
  return stages.reduce((current, stage) => {
    const next = stage?.decision ?? "PASS";
    return PRIORITY[next] > PRIORITY[current] ? next : current;
  }, "PASS");
}

export function decideTerminal({ stages, remainingIssues, consumedOverrides, hostAction, coreState }) {
  if (hostAction != null) {
    return Object.freeze({
      terminal: false,
      decision: null,
      state: "WAITING_FOR_HOST",
      coreState
    });
  }
  const rawDecision = strongest(stages);
  const decision = remainingIssues.length > 0
    ? "STOP"
    : rawDecision === "STOP" && consumedOverrides.length > 0
      ? "USER_OVERRIDDEN"
      : rawDecision;
  const state = decision === "STOP" && coreState === "BOOT_CONNECTED"
    ? "PROJECT_STOP"
    : decision === "STOP"
      ? "FACTORY_STOP"
      : coreState;
  return Object.freeze({ terminal: true, decision, state, coreState });
}
