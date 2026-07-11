# DSGN_CURRENT_PACKAGE_LOAD_ORDER_v1

STATUS: converged
PURPOSE: 現状パッケージを設計さんへ読む時の順番。

---

# 1. ALWAYS_LIGHT

最初に読む。正本全文ではなく、索引・稼働条件・ガードだけ。

```text
00_MANIFEST/current/DSGN_CURRENT_PACKAGE_MANIFEST_v1.md
00_MANIFEST/current/DSGN_CURRENT_PACKAGE_TAG_MAP_v1.json
01_ALWAYS_LIGHT/namespace/DSGN_INTERNAL_NAMING_NAMESPACE_v1.md
01_ALWAYS_LIGHT/index/DSGN_INTERNAL_ALL_ITEM_INDEX_v1.md
01_ALWAYS_LIGHT/index/DSGN_ROLE_INDEX_v1.md
01_ALWAYS_LIGHT/index/designer_canonical_tag_registry_v1.md
01_ALWAYS_LIGHT/index/designer_reverse_lookup_index_v1.md
01_ALWAYS_LIGHT/protocol/designer_lookup_protocol_v1.md
01_ALWAYS_LIGHT/runtime/DSGN_RUNTIME_OPERATION_CONDITIONS_v1.md
01_ALWAYS_LIGHT/runtime/DSGN_RUNTIME_ACTIVATION_MATRIX_v1.md
01_ALWAYS_LIGHT/runtime/DSGN_OPERATION_CONVERGED_GUARD_v1.md
01_ALWAYS_LIGHT/embed/DSGN_LAYER_EMBED_FIXATION_MATRIX_v1.md
01_ALWAYS_LIGHT/embed/DSGN_DESIGN_LAYER_ANCHOR_SCHEMA_v1.md
01_ALWAYS_LIGHT/embed/DSGN_LAYER_EMBED_BACKLOG_FLOW_v1.md
01_ALWAYS_LIGHT/embed/DSGN_LAYER_EMBED_PLACEMENT_POLICY_v1.md
01_ALWAYS_LIGHT/embed/DSGN_PURE_DESIGN_VS_LAYER_BOUNDARY_v1.md
```

---

# 2. LOOKUP_REFERENCE

必要時だけ読む。

```text
03_REFERENCE/layer/layer_all_items_meaning_reference_v1.md
03_REFERENCE/layer/layer_full_preset_library_v1.md
03_REFERENCE/layer/packager_layer_setting_effect_reference_v1.md
03_REFERENCE/embed/DSGN_LAYER_EMBED_SECTION_TEMPLATES_v1.md
```

---

# 3. MODE_ACTIVATION

モード起動時に読む。

```text
04_MODULE/packager/pack_cutout_module_v1.md
05_INSERT/nom/nom_gate_insert_min_v3.md
```

---

# 4. FULL_CANON_AUDIT

設計さんが正本監査・統合作業をする時だけ読む。

```text
02_CANON/layer/layer_runtime_v28_ai_native_complete_candidate.md
02_CANON/embed/DSGN_WORLD_AXIS_LAYER_EMBED_POLICY_v1.md
```

---

# 5. NEVER_DIRECT_TO_WRITER

執筆さんへ直接渡さない。

```text
00_MANIFEST/*
01_ALWAYS_LIGHT/*
02_CANON/*
03_REFERENCE/*
04_MODULE/*
05_INSERT/*
06_PATCH/*
07_AUDIT/*
08_COMPONENT_ZIPS/*
```

執筆さんへ渡すのは、梱包後の `05_frozen.md` と必要時の execution_queue のみ。
