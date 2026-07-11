# DSGN_CURRENT_PACKAGE_MANIFEST_v1

STATUS: converged
PURPOSE: 現状のDSGNインフラ一式を、設計さん統合前のパッケージとして束ねる。

---

# RULES

```text
- 設計さんは全保持可。ただしdsgn.*で該当箇所だけ引く。
- 梱包さん常設は軽量核。
- 執筆さんへ正本/辞書/タグ全文を渡さない。
- 純設計とレイヤー埋込を分ける。
- DSGN_ / dsgn.* と PRJ_ / project.* を混ぜない。
```

---

# FILES

| source_id | package_path | load_mode | tags | role |
| --- | --- | --- | --- | --- |
| DSGN.SRC.layer.runtime.v28 | 02_CANON/layer/layer_runtime_v28_ai_native_complete_candidate.md | on_demand_full | dsgn.layer.runtime<br>dsgn.layer.*<br>dsgn.source.canon | レイヤーv28正本候補 |
| DSGN.SRC.layer.meaning.v1 | 03_REFERENCE/layer/layer_all_items_meaning_reference_v1.md | lookup_reference | dsgn.layer.meaning<br>dsgn.layer.axis.*<br>dsgn.layer.flow.*<br>dsgn.layer.prose.*<br>dsgn.embed.*<br>dsgn.layer.axis.surface<br>dsgn.layer.axis.pressure<br>dsgn.layer.flow.sentence_variation<br>dsgn.layer.flow.direction | レイヤー全項目意味辞書 |
| DSGN.SRC.layer.preset.v1 | 03_REFERENCE/layer/layer_full_preset_library_v1.md | lookup_reference | dsgn.layer.preset.*<br>dsgn.layer.preset.residue_close<br>dsgn.layer.preset.clean_proof_breaker | レイヤー全項目プリセット |
| DSGN.SRC.layer.packager_effect.v1 | 03_REFERENCE/layer/packager_layer_setting_effect_reference_v1.md | lookup_reference | dsgn.layer.effect_reference<br>dsgn.packager.lookup | 梱包さん設定効果表 |
| DSGN.SRC.pack.cutout.v1 | 04_MODULE/packager/pack_cutout_module_v1.md | mode_activation | dsgn.packager.*<br>dsgn.packager.cutout<br>dsgn.packager.crosscheck<br>dsgn.packager.frozen.extract | 話パック切り出しモジュール |
| DSGN.SRC.pack.current_route.v0194 | 04_MODULE/packager/PACKAGER_CURRENT_ROUTE_V2_v0194.md | mode_activation_required_read | dsgn.packager.current_route<br>dsgn.packager.*<br>dsgn.packager.v2 | 梱包さん現行V2導線 |
| DSGN.SRC.layer.alias_bridge.v0194 | 03_REFERENCE/layer/layer_alias_to_current_keys_v0194.md | lookup_reference | dsgn.layer.alias_bridge<br>dsgn.layer.*<br>dsgn.packager.lookup | 旧語から現行layer keyへの橋 |
| DSGN.SRC.nom.gate.min.v3 | 05_INSERT/nom/nom_gate_insert_min_v3.md | insert_light | dsgn.nom.*<br>dsgn.nom.validation_gate | NOM最小差込ゲート |
| DSGN.SRC.overlay.patch.v015 | 06_PATCH/designer/designer_runtime_overlay_patch_v015.md | integration_patch | dsgn.runtime.overlay<br>dsgn.integration.patch | 設計さん後置きオーバーレイ |
| DSGN.SRC.overlay.manifest.v015 | 00_MANIFEST/legacy/runtime_overlay_manifest_v015.md | always_light | dsgn.runtime.manifest<br>dsgn.load_order | 既存オーバーレイmanifest |
| DSGN.SRC.tag.registry.v1 | 01_ALWAYS_LIGHT/index/designer_canonical_tag_registry_v1.md | always_light | dsgn.index.tags<br>dsgn.source.registry | タグ登録表 |
| DSGN.SRC.reverse.lookup.v1 | 01_ALWAYS_LIGHT/index/designer_reverse_lookup_index_v1.md | always_light | dsgn.index.reverse<br>dsgn.lookup.reverse | 症状逆引き表 |
| DSGN.SRC.lookup.protocol.v1 | 01_ALWAYS_LIGHT/protocol/designer_lookup_protocol_v1.md | always_light | dsgn.lookup.protocol<br>dsgn.packager.lookup | lookupプロトコル |
| DSGN.SRC.tag.machine.v1 | 01_ALWAYS_LIGHT/machine/designer_tag_index_machine_v1.json | runtime_machine | dsgn.index.machine | 機械用タグ索引 |
| DSGN.SRC.namespace.v1 | 01_ALWAYS_LIGHT/namespace/DSGN_INTERNAL_NAMING_NAMESPACE_v1.md | always_light | dsgn.namespace<br>dsgn.guard.namespace | 名称空間規約 |
| DSGN.SRC.internal.all_item_index.v1 | 01_ALWAYS_LIGHT/index/DSGN_INTERNAL_ALL_ITEM_INDEX_v1.md | always_light | dsgn.index.all_items<br>dsgn.source.map | 設計さん全項目index |
| DSGN.SRC.role.index.v1 | 01_ALWAYS_LIGHT/index/DSGN_ROLE_INDEX_v1.md | always_light | dsgn.index.roles<br>dsgn.role.* | 役割別index |
| DSGN.SRC.internal.all_item_machine.v1 | 01_ALWAYS_LIGHT/machine/DSGN_INTERNAL_ALL_ITEM_INDEX_machine_v1.json | runtime_machine | dsgn.index.machine<br>dsgn.index.all_items | 設計さん全項目機械index |
| DSGN.SRC.runtime.operation_conditions.v1 | 01_ALWAYS_LIGHT/runtime/DSGN_RUNTIME_OPERATION_CONDITIONS_v1.md | always_light | dsgn.runtime.conditions<br>dsgn.activation | 稼働条件 |
| DSGN.SRC.runtime.activation_matrix.v1 | 01_ALWAYS_LIGHT/runtime/DSGN_RUNTIME_ACTIVATION_MATRIX_v1.md | always_light | dsgn.runtime.activation_matrix<br>dsgn.mode.* | 起動表 |
| DSGN.SRC.runtime.converged_guard.v1 | 01_ALWAYS_LIGHT/runtime/DSGN_OPERATION_CONVERGED_GUARD_v1.md | always_light | dsgn.runtime.guard<br>dsgn.stop.* | 収束ガード |
| DSGN.SRC.dry_run.report.v1 | 07_AUDIT/dry_run/DSGN_DRY_RUN_CONVERGENCE_REPORT_v1.md | audit_reference | dsgn.dry_run.report<br>dsgn.convergence | 稼働条件空回し収束ログ |
| DSGN.SRC.dry_run.cases.v1 | 07_AUDIT/dry_run/DSGN_DRY_RUN_CASES_v1.json | audit_machine | dsgn.dry_run.cases | 稼働条件空回しケース |
| DSGN.SRC.dry_run.machine_report.v1 | 07_AUDIT/dry_run/DSGN_DRY_RUN_MACHINE_REPORT_v1.json | audit_machine | dsgn.dry_run.machine<br>dsgn.convergence | 稼働条件空回し機械ログ |
| DSGN.SRC.zip.tag_manifest.v1 | 00_MANIFEST/zip_tagging/DSGN_ZIP_TAG_MANIFEST_v1.md | always_light | dsgn.zip.tag_manifest<br>dsgn.source.registry | ZIPタグmanifest |
| DSGN.SRC.zip.reverse_tag.v1 | 00_MANIFEST/zip_tagging/DSGN_ZIP_REVERSE_TAG_INDEX_v1.md | always_light | dsgn.zip.reverse_tag<br>dsgn.lookup.reverse | ZIPタグ逆引き |
| DSGN.SRC.zip.load_order.v1 | 00_MANIFEST/zip_tagging/DSGN_ZIP_LOAD_ORDER_v1.md | always_light | dsgn.zip.load_order<br>dsgn.load_order | ZIP読み込み順 |
| DSGN.SRC.zip.tag_map.v1 | 00_MANIFEST/zip_tagging/DSGN_ZIP_TAG_MAP_v1.json | runtime_machine | dsgn.zip.tag_map<br>dsgn.index.machine | ZIP機械タグmap |
| DSGN.SRC.embed.world_axis_layer_policy.v1 | 02_CANON/embed/DSGN_WORLD_AXIS_LAYER_EMBED_POLICY_v1.md | designer_full__packager_lookup_only | dsgn.embed.world_axis<br>dsgn.layer.fixation<br>dsgn.runtime.guard | 世界軸レイヤー固定policy |
| DSGN.SRC.embed.fixation_matrix.v1 | 01_ALWAYS_LIGHT/embed/DSGN_LAYER_EMBED_FIXATION_MATRIX_v1.md | always_light | dsgn.layer.fixation.matrix<br>dsgn.embed.destination | 固定レベル判定表 |
| DSGN.SRC.embed.anchor_schema.v1 | 01_ALWAYS_LIGHT/embed/DSGN_DESIGN_LAYER_ANCHOR_SCHEMA_v1.md | always_light | dsgn.design.anchor<br>dsgn.embed.schema | 設計layer anchor schema |
| DSGN.SRC.embed.backlog_flow.v1 | 01_ALWAYS_LIGHT/embed/DSGN_LAYER_EMBED_BACKLOG_FLOW_v1.md | always_light | dsgn.backlog.layer<br>dsgn.embed.adoption | 埋込backlog採否flow |
| DSGN.SRC.embed.fixation_dry_run.v1 | 07_AUDIT/embed/DSGN_LAYER_EMBED_FIXATION_DRY_RUN_v1.md | audit_reference | dsgn.dry_run.embed<br>dsgn.convergence | 固定空回し |
| DSGN.SRC.embed.policy_machine.v1 | 01_ALWAYS_LIGHT/machine/DSGN_LAYER_EMBED_POLICY_machine_v1.json | runtime_machine | dsgn.embed.machine | 埋込policy machine |
| DSGN.SRC.embed.policy_tag_manifest.v1 | 00_MANIFEST/embed/DSGN_LAYER_EMBED_POLICY_TAG_MANIFEST_v1.json | runtime_machine | dsgn.embed.tag_manifest | 埋込policy tag manifest |
| DSGN.SRC.embed.placement_policy.v1 | 01_ALWAYS_LIGHT/embed/DSGN_LAYER_EMBED_PLACEMENT_POLICY_v1.md | always_light | dsgn.embed.placement<br>dsgn.guard.pure_vs_layer<br>dsgn.embed.world_axis<br>dsgn.embed.character | レイヤー埋込記載場所policy |
| DSGN.SRC.embed.section_templates.v1 | 03_REFERENCE/embed/DSGN_LAYER_EMBED_SECTION_TEMPLATES_v1.md | lookup_reference | dsgn.embed.templates<br>dsgn.design.anchor | 埋込欄テンプレート |
| DSGN.SRC.embed.pure_vs_layer_boundary.v1 | 01_ALWAYS_LIGHT/embed/DSGN_PURE_DESIGN_VS_LAYER_BOUNDARY_v1.md | always_light | dsgn.guard.pure_vs_layer<br>dsgn.embed.destination | 純設計/レイヤー境界 |
| DSGN.SRC.embed.placement_dry_run.v1 | 07_AUDIT/embed/DSGN_LAYER_EMBED_PLACEMENT_DRY_RUN_v1.md | audit_reference | dsgn.dry_run.embed<br>dsgn.convergence | 記載場所空回し |
| DSGN.SRC.embed.placement_machine.v1 | 01_ALWAYS_LIGHT/machine/DSGN_LAYER_EMBED_PLACEMENT_machine_v1.json | runtime_machine | dsgn.embed.machine<br>dsgn.embed.placement | 記載場所 machine |
| DSGN.SRC.embed.placement_tag_manifest.v1 | 00_MANIFEST/embed/DSGN_LAYER_EMBED_PLACEMENT_TAG_MANIFEST_v1.json | runtime_machine | dsgn.embed.tag_manifest<br>dsgn.embed.placement | 記載場所 tag manifest |


## EXCLUDED COMPONENT ZIPS

旧コンポーネントZIPは archive_only の履歴であり、現行runtime deliveryには同梱しない。現行作業の参照先・読了対象・本文条件源にしない。
