# CODEX_INTEGRATION_REPORT

```yaml
status: integrated
target_runtime: DS90_SOURCE_RUNTIME_v019_4_3_DESIGNER_CONVERGED_LOCKED
files_added:
  dsgn_infra: 46
  runtime_modules:
    - src/dsgn/namespace.js
    - src/dsgn/lookup.js
    - src/modules/packCutout.js
    - src/v2/activation.js
    - src/v2/material-map.js
    - src/modules/mountTransferBackpackAdapter.js
    - backpacks/MOUNT_TRANSFER_BACKPACK
    - src/indexing/searchEngine.js
    - src/validation/designerGates.js
    - assets/specs/DESIGNER_COMMON_GATES_v019.md
source_ids_registered: preserved_from_DSGN_manifest
tags_registered: preserved_from_DSGN_tag_map
load_order_updated: true
writer_isolation_confirmed: true
namespace_check: PASS
pure_vs_layer_boundary_check: PASS
fixation_policy_check: PASS
dry_run_results: 83_PASS
unresolved_items: []
retained_source_labels:
  - layer_runtime v28 is the supplied asset label, not the DS runtime version
safe_next_steps:
  - run real project pack cutout with indexed one-episode folders
  - compare context loss before reducing files
```

## Integration Shape

DSGN is integrated as a namespaced infrastructure layer.
Normal designer work remains available.
The user-facing role name is `梱包さん`.
Pack construction activates only through `梱包さんを起動` or `DSGN.MODE.pack_cutout`.

Story pack construction now requires:

1. `packGateIndex` at the story-pack root.
2. `episodeIndex` inside every one-story folder.
3. `layerBindingManifest` inside every one-story folder.
4. Index read order resolving to real folders/files.
5. Indexes used only as maps, never as read substitutes, story sources, or project canon.
6. Profile, candidate shelf, and layer values passing only through current-story explicit bindings.

Each episode uses one folder. File count is flexible:
one-card, ready-only, V2-only, two-card, three-card, four-card, five-card, and larger layouts are allowed when indexed and read.

## v019 Ordinary Designer Gates

The always-read floor now includes the common summary-discipline and new-item
registration gates. TAG_SEARCH additionally locks tag meanings, requires specialized
ENTITY/RELATION definitions, validates line-reference history, and emits repair
suggestions only as `PROPOSAL_ONLY`. V2 and transfer-backpack implementation files
remain unchanged from v018.
