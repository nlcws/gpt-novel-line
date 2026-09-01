# DS90 v0400 Current Runtime Backlog

STATUS: NO_KNOWN_RUNTIME_BLOCKER
APPLIES_TO_RUNTIME: DS90-v0400-NLCORE-SHELF-PKDB-TAG-RUNTIME

No unresolved implementation item remains in the active v0400 runtime route at release validation time.

Preserved explicit-decision boundaries:

- Current project shelves remain source/canon authority; PKDB TAG/alias/pointer records are lookup backend, not replacement canon.
- K02 SOURCE materialize remains an explicit fallback only. It must not silently replace the normal current-shelf read route.
- PKDB write/commit authority is not granted to DS90. Proposal and MT00/Nul commit boundaries remain explicit.
- External project acceptance, project-specific shelf contents, and project TAG population remain external project state, not runtime implementation debt.
- Naru generalization is not part of v0400 implementation scope.
