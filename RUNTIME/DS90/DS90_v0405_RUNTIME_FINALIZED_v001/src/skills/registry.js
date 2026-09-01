export const SKILL_EXECUTION_MODEL = "DEPENDENCY_GRAPH_NO_GLOBAL_SKILL_CHAIN";

export const SKILL_REGISTRY = Object.freeze({
  K01_PKDB_ACCESS_REQUEST: Object.freeze({
    id: "K01_PKDB_ACCESS_REQUEST",
    kind: "HOST_ACTION",
    ownsDecision: false,
    purpose: "Build an exact PKDB ACCESS request from the selected DS90 operation and explicit machine references."
  }),
  K02_SOURCE_MATERIALIZE_REQUEST: Object.freeze({
    id: "K02_SOURCE_MATERIALIZE_REQUEST",
    kind: "HOST_ACTION",
    ownsDecision: false,
    dependsOn: ["K01_PKDB_ACCESS_REQUEST"],
    purpose: "Materialize exact SOURCE IDs returned by PKDB ACCESS and verify returned bytes before design validation."
  }),
  K03_PKDB_INPUT_PROPOSAL: Object.freeze({
    id: "K03_PKDB_INPUT_PROPOSAL",
    kind: "LOCAL_ARTIFACT",
    ownsDecision: false,
    purpose: "Build a machine-readable PKDB input proposal without committing PKDB."
  }),
  K04_PROJECT_SHELF_READ_REQUEST: Object.freeze({
    id: "K04_PROJECT_SHELF_READ_REQUEST",
    kind: "HOST_ACTION",
    ownsDecision: false,
    dependsOn: ["K01_PKDB_ACCESS_REQUEST"],
    purpose: "Read exact current project shelf paths returned by PKDB tag lookup and verify bytes before design judgment."
  }),
  R00_CURRENT_000C_DISPATCH_RESOLVE: Object.freeze({
    id: "R00_CURRENT_000C_DISPATCH_RESOLVE",
    kind: "HOST_ACTION",
    ownsDecision: false,
    purpose: "Read the current mounted 000_C dispatch and prove the exact specialist target path/SHA before runtime invocation."
  }),
  R01_SPECIALIST_DISPATCH: Object.freeze({
    id: "R01_SPECIALIST_DISPATCH",
    kind: "HOST_ACTION",
    ownsDecision: false,
    dependsOn: ["R00_CURRENT_000C_DISPATCH_RESOLVE"],
    purpose: "Invoke the selected specialist only after trusted current-000_C route proof and require target-specific completion proof."
  })
});
