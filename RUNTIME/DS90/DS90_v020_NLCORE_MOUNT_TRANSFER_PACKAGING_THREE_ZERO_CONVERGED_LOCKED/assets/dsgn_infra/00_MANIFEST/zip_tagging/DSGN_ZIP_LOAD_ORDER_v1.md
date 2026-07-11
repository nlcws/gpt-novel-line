# DSGN_ZIP_LOAD_ORDER_v1

STATUS: zip_tagged_complete_candidate
PURPOSE: ZIPから設計さんへ読み込む時の順番。

---

# 1. ALWAYS LIGHT

最初に読む。正本全文ではなく、索引と稼働条件。

```text
1. DSGN_MANIFEST/runtime_overlay_manifest_v015.md
2. DSGN_INDEX/namespace/DSGN_INTERNAL_NAMING_NAMESPACE_v1.md
3. DSGN_INDEX/designer/DSGN_INTERNAL_ALL_ITEM_INDEX_v1.md
4. DSGN_INDEX/designer/DSGN_ROLE_INDEX_v1.md
5. DSGN_INDEX/tag/designer_canonical_tag_registry_v1.md
6. DSGN_INDEX/tag/designer_reverse_lookup_index_v1.md
7. DSGN_INDEX/protocol/designer_lookup_protocol_v1.md
8. DSGN_RUNTIME/activation/DSGN_RUNTIME_OPERATION_CONDITIONS_v1.md
9. DSGN_RUNTIME/activation/DSGN_RUNTIME_ACTIVATION_MATRIX_v1.md
10. DSGN_RUNTIME/guard/DSGN_OPERATION_CONVERGED_GUARD_v1.md
```

---

# 2. ON DEMAND

必要時だけ読む。

```text
layer lookup:
  DSGN_REF/layer/layer_all_items_meaning_reference_v1.md
  DSGN_REF/layer/layer_full_preset_library_v1.md
  DSGN_REF/layer/packager_layer_setting_effect_reference_v1.md

layer full audit:
  DSGN_CANON/layer/layer_runtime_v28_ai_native_complete_candidate.md

NOM gate:
  DSGN_INSERT/nom/nom_gate_insert_min_v3.md

pack cutout:
  DSGN_MODULE/packager/pack_cutout_module_v1.md

audit:
  DSGN_RUNTIME/dry_run/DSGN_DRY_RUN_CONVERGENCE_REPORT_v1.md
  DSGN_RUNTIME/dry_run/DSGN_DRY_RUN_CASES_v1.json
  DSGN_RUNTIME/dry_run/DSGN_DRY_RUN_MACHINE_REPORT_v1.json
```

---

# 3. NEVER DIRECT TO WRITER

執筆さんへ直接渡さない。

```text
DSGN_CANON/*
DSGN_REF/*
DSGN_INDEX/*
DSGN_RUNTIME/*
```

執筆さんへ渡すのは、梱包後の frozen minimum / execution_queue のみ。
