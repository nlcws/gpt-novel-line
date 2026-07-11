# runtime_overlay_manifest_v015

STATUS: overlay_patch
DATE: 2026-06-15
PURPOSE: designer runtime overlay with AI-readable layer replacement.

FILES:
  - designer_runtime_overlay_patch_v015.md
  - layer_v23_ai_readable_runtime.md
  - nom_gate_insert_min_v3.md
  - pack_cutout_module_v1.md

CHANGE_FROM_v014:
  - layer_v22_novel_runtime.md is replaced by layer_v23_ai_readable_runtime.md.
  - Layer text is no longer human-readable theory first.
  - Layer is now machine-readable directive/schema/gate format.
  - Old 主/副 wording is fully superseded.

LOAD_POLICY:
  designer_core:
    always_load:
      - designer_runtime_overlay_patch_v015.md
      - layer_v23_ai_readable_runtime.md
      - nom_gate_insert_min_v3.md
    load_on_mode_pack_cutout:
      - pack_cutout_module_v1.md
  pack_cutout_module:
    always_load:
      - layer_v23_ai_readable_runtime.md
      - nom_gate_insert_min_v3.md
  writer_pack:
    use_exported_episode_layer: true
    do_not_load_full_layer_unless_debugging: true

NOTES:
  - NOM remains an insert gate, not a story source.
  - Pack cutout remains a callable module, not always-active designer core.
  - Layer v23 replaces old layer definitions, not supplements them.
