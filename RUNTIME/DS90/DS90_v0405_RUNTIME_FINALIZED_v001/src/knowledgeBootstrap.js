export const DS90_START_GATE = Object.freeze({
  markdownPath: "000_C/00_READ_FIRST/DS90_START_GATE.md",
  machinePath: "000_C/00_READ_FIRST/DS90_START_GATE.json",
  gateVersion: "DS90_START_GATE_v001",
  dispatchPath: "000_C/00_READ_FIRST/RUNTIME_DIRECT_DISPATCH.json",
  accessDependency: "PKDB_ACCESS_SKILL",
  materializeDependency: "PKDB_SOURCE_MATERIALIZE_SKILL"
});

const issue = (code, path, message) => ({ code, path, message, severity: "STOP" });

export function validateKnowledgeBootstrap(input) {
  if (input?.externalContext?.present !== true) return { issues: [] };
  const ctx = input?.knowledgeContext ?? {};
  const issues = [];
  const gate = ctx.startGate ?? {};
  if (gate.path !== DS90_START_GATE.machinePath || gate.exists !== true || gate.read !== true) {
    issues.push(issue(
      "DS90_START_GATE_UNREAD",
      "knowledgeContext.startGate",
      `${DS90_START_GATE.machinePath}を000_Cから実読する必要があります`
    ));
  }
  if (gate.version !== DS90_START_GATE.gateVersion) {
    issues.push(issue(
      "DS90_START_GATE_VERSION_UNVERIFIED",
      "knowledgeContext.startGate.version",
      `${DS90_START_GATE.gateVersion}を確認する必要があります`
    ));
  }
  const dispatch = ctx.dispatch ?? {};
  if (dispatch.path !== DS90_START_GATE.dispatchPath || dispatch.exists !== true || dispatch.read !== true || dispatch.verified !== true) {
    issues.push(issue(
      "DS90_RUNTIME_DISPATCH_UNVERIFIED",
      "knowledgeContext.dispatch",
      `${DS90_START_GATE.dispatchPath}を実読し、resident path/SHAを検証する必要があります`
    ));
  }
  const deps = dispatch.dependencies ?? {};
  for (const dep of [DS90_START_GATE.accessDependency, DS90_START_GATE.materializeDependency]) {
    if (deps[dep]?.resolved !== true || deps[dep]?.sha256Verified !== true) {
      issues.push(issue(
        "DS90_PKDB_DEPENDENCY_UNVERIFIED",
        `knowledgeContext.dispatch.dependencies.${dep}`,
        `${dep}を000_C dispatchから解決しSHA照合する必要があります`
      ));
    }
  }
  const pkdb = ctx.pkdb ?? {};
  if (pkdb.mounted !== true || pkdb.validated !== true) {
    issues.push(issue(
      "DS90_PKDB_SNAPSHOT_UNAVAILABLE",
      "knowledgeContext.pkdb",
      "DS90 requires one mounted and validated PKDB snapshot, including origin-only ZERO START"
    ));
  }
  const origin = ctx.portableOrigin ?? {};
  if (origin.logicalId !== "LID-PORTABLE-5000-ORIGIN" || origin.lookupDelivered !== true ||
      origin.materialized !== true || origin.read !== true || origin.sha256Verified !== true) {
    issues.push(issue(
      "DS90_PORTABLE_ORIGIN_5000_UNREAD",
      "knowledgeContext.portableOrigin",
      "LID-PORTABLE-5000-ORIGIN must be resolved by ACTIVE logical-id lookup, materialized, SHA-verified, and actually read before DS90 work"
    ));
  }
  return { issues };
}
