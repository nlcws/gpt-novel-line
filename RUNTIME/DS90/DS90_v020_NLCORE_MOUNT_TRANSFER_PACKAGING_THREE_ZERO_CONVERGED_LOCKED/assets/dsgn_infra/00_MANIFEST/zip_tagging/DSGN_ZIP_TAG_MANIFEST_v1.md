# DSGN_ZIP_TAG_MANIFEST_v1

STATUS: zip_tagged_complete_candidate
PURPOSE: ZIP内の全ファイルを source_id / dsgn.* tag / load_mode / activation mode で紐づける。
NAMESPACE:
  designer: DSGN_ / dsgn.* / DSGN.SRC.*
  project_reserved: PRJ_ / project.* / PRJ.SRC.*

---

# 1. ZIP RULES

```text
1. ZIP内の正本系は source_id と dsgn.* tag で引く。
2. 常時読むのは DSGN_INDEX / DSGN_RUNTIME の軽量条件のみ。
3. DSGN_CANON / DSGN_REF は lookup 時だけ該当箇所を読む。
4. 執筆さんへDSGN_CANON/DSGN_REF全文を渡さない。
5. project側indexとは名称を混ぜない。
```

---

# 2. FILE TAG MAP

| source_id | zip_path | type | load_mode | tags | role |
| --- | --- | --- | --- | --- | --- |
| DSGN.SRC.layer.runtime.v28 | DSGN_CANON/layer/layer_runtime_v28_ai_native_complete_candidate.md | canonical_candidate | designer_full__packager_lookup_only | dsgn.layer.*<br>dsgn.layer.runtime<br>dsgn.source.canon | レイヤーv28正本候補。全項目意味辞書とプリセットを内包。 |
| DSGN.SRC.layer.meaning.v1 | DSGN_REF/layer/layer_all_items_meaning_reference_v1.md | reference | lookup_reference | dsgn.layer.meaning<br>dsgn.layer.axis.*<br>dsgn.layer.prose.*<br>dsgn.layer.flow.*<br>dsgn.embed.* | レイヤー全項目の意味・選ぶ条件・本文効果・事故・設定例。 |
| DSGN.SRC.layer.preset.v1 | DSGN_REF/layer/layer_full_preset_library_v1.md | reference | lookup_reference | dsgn.layer.preset.* | 全項目を使うためのプリセット集。 |
| DSGN.SRC.layer.packager_effect.v1 | DSGN_REF/layer/packager_layer_setting_effect_reference_v1.md | reference | packager_lookup_reference | dsgn.packager.lookup<br>dsgn.layer.effect_reference | 梱包さん用。設定値→本文効果→事故→併用条件の早見表。 |
| DSGN.SRC.nom.gate.min.v3 | DSGN_INSERT/nom/nom_gate_insert_min_v3.md | insert_gate | insert_light | dsgn.nom.*<br>dsgn.nom.validation_gate | NOM最小差込ゲート。本文条件源ではなくvalidation_gate。 |
| DSGN.SRC.pack.cutout.v1 | DSGN_MODULE/packager/pack_cutout_module_v1.md | module | mode_activation | dsgn.packager.*<br>dsgn.packager.cutout | 話パック切り出し工程。1話1フォルダ、ready/V2/layer/crosscheck/frozen。 |
| DSGN.SRC.overlay.patch.v015 | DSGN_PATCH/designer_runtime_overlay_patch_v015.md | patch | designer_integration | dsgn.runtime.overlay<br>dsgn.integration.patch | 設計さんへの後置きオーバーレイ接続パッチ。 |
| DSGN.SRC.overlay.manifest.v015 | DSGN_MANIFEST/runtime_overlay_manifest_v015.md | manifest | always_light | dsgn.runtime.manifest<br>dsgn.load_order | オーバーレイ構成と読み込み順のマニフェスト。 |
| DSGN.SRC.tag.registry.v1 | DSGN_INDEX/tag/designer_canonical_tag_registry_v1.md | index | always_light | dsgn.index.tags<br>dsgn.source.registry | タグ→正本→使う場面の登録表。 |
| DSGN.SRC.reverse.lookup.v1 | DSGN_INDEX/tag/designer_reverse_lookup_index_v1.md | index | always_light | dsgn.index.reverse<br>dsgn.lookup.reverse | 症状・疑問・役割からタグへ逆引きする表。 |
| DSGN.SRC.lookup.protocol.v1 | DSGN_INDEX/protocol/designer_lookup_protocol_v1.md | protocol | always_light | dsgn.lookup.protocol<br>dsgn.packager.lookup | 梱包さんが設計さんへ該当項目だけ問い合わせるプロトコル。 |
| DSGN.SRC.tag.machine.v1 | DSGN_INDEX/machine/designer_tag_index_machine_v1.json | machine_index | runtime_machine | dsgn.index.machine | 機械用タグ索引。 |
| DSGN.SRC.namespace.v1 | DSGN_INDEX/namespace/DSGN_INTERNAL_NAMING_NAMESPACE_v1.md | namespace_rule | always_light | dsgn.namespace<br>dsgn.guard.namespace | DSGN_ / dsgn.* と PRJ_ / project.* を分離する命名規約。 |
| DSGN.SRC.internal.all_item_index.v1 | DSGN_INDEX/designer/DSGN_INTERNAL_ALL_ITEM_INDEX_v1.md | designer_index | always_light | dsgn.index.all_items<br>dsgn.source.map | 設計さん本体用の全項目インデックス。 |
| DSGN.SRC.role.index.v1 | DSGN_INDEX/designer/DSGN_ROLE_INDEX_v1.md | role_index | always_light | dsgn.index.roles<br>dsgn.role.* | 設計さん/梱包さん/執筆さん接続の役割別タグ分離。 |
| DSGN.SRC.internal.all_item_machine.v1 | DSGN_INDEX/machine/DSGN_INTERNAL_ALL_ITEM_INDEX_machine_v1.json | machine_index | runtime_machine | dsgn.index.machine<br>dsgn.index.all_items | 設計さん全項目インデックスの機械用JSON。 |
| DSGN.SRC.runtime.operation_conditions.v1 | DSGN_RUNTIME/activation/DSGN_RUNTIME_OPERATION_CONDITIONS_v1.md | runtime_condition | always_light | dsgn.runtime.conditions<br>dsgn.activation | DSGN系の正本・辞書・タグを稼働条件として扱う運用規約。 |
| DSGN.SRC.runtime.activation_matrix.v1 | DSGN_RUNTIME/activation/DSGN_RUNTIME_ACTIVATION_MATRIX_v1.md | runtime_matrix | always_light | dsgn.runtime.activation_matrix<br>dsgn.mode.* | 状況→MODE→タグ→source policy→outputの起動表。 |
| DSGN.SRC.dry_run.report.v1 | DSGN_RUNTIME/dry_run/DSGN_DRY_RUN_CONVERGENCE_REPORT_v1.md | dry_run_report | audit_reference | dsgn.dry_run.report<br>dsgn.convergence | 稼働条件の空回し3巡収束レポート。 |
| DSGN.SRC.runtime.converged_guard.v1 | DSGN_RUNTIME/guard/DSGN_OPERATION_CONVERGED_GUARD_v1.md | runtime_guard | always_light | dsgn.runtime.guard<br>dsgn.stop.* | 空回し後に確定した稼働ガード。 |
| DSGN.SRC.dry_run.cases.v1 | DSGN_RUNTIME/dry_run/DSGN_DRY_RUN_CASES_v1.json | dry_run_cases | audit_machine | dsgn.dry_run.cases | 空回しケース定義。 |
| DSGN.SRC.dry_run.machine_report.v1 | DSGN_RUNTIME/dry_run/DSGN_DRY_RUN_MACHINE_REPORT_v1.json | dry_run_machine_report | audit_machine | dsgn.dry_run.machine<br>dsgn.convergence | 空回し結果の機械用レポート。 |


---

# 3. LOAD_MODE INDEX

| load_mode | source_ids |
| --- | --- |
| always_light | DSGN.SRC.overlay.manifest.v015<br>DSGN.SRC.tag.registry.v1<br>DSGN.SRC.reverse.lookup.v1<br>DSGN.SRC.lookup.protocol.v1<br>DSGN.SRC.namespace.v1<br>DSGN.SRC.internal.all_item_index.v1<br>DSGN.SRC.role.index.v1<br>DSGN.SRC.runtime.operation_conditions.v1<br>DSGN.SRC.runtime.activation_matrix.v1<br>DSGN.SRC.runtime.converged_guard.v1 |
| audit_machine | DSGN.SRC.dry_run.cases.v1<br>DSGN.SRC.dry_run.machine_report.v1 |
| audit_reference | DSGN.SRC.dry_run.report.v1 |
| designer_full__packager_lookup_only | DSGN.SRC.layer.runtime.v28 |
| designer_integration | DSGN.SRC.overlay.patch.v015 |
| insert_light | DSGN.SRC.nom.gate.min.v3 |
| lookup_reference | DSGN.SRC.layer.meaning.v1<br>DSGN.SRC.layer.preset.v1 |
| mode_activation | DSGN.SRC.pack.cutout.v1 |
| packager_lookup_reference | DSGN.SRC.layer.packager_effect.v1 |
| runtime_machine | DSGN.SRC.tag.machine.v1<br>DSGN.SRC.internal.all_item_machine.v1 |


---

# 4. MODE_TO_SOURCE INDEX

| activation_mode | source_ids |
| --- | --- |
| DSGN.MODE.embed_review | DSGN.SRC.layer.runtime.v28<br>DSGN.SRC.layer.meaning.v1 |
| DSGN.MODE.index_maintenance | DSGN.SRC.overlay.patch.v015 |
| DSGN.MODE.layer_lookup | DSGN.SRC.layer.runtime.v28<br>DSGN.SRC.layer.meaning.v1<br>DSGN.SRC.layer.preset.v1<br>DSGN.SRC.layer.packager_effect.v1 |
| DSGN.MODE.nom_gate | DSGN.SRC.nom.gate.min.v3 |
| DSGN.MODE.pack_cutout | DSGN.SRC.layer.packager_effect.v1<br>DSGN.SRC.pack.cutout.v1 |
| always | DSGN.SRC.overlay.manifest.v015<br>DSGN.SRC.tag.registry.v1<br>DSGN.SRC.reverse.lookup.v1<br>DSGN.SRC.lookup.protocol.v1<br>DSGN.SRC.namespace.v1<br>DSGN.SRC.internal.all_item_index.v1<br>DSGN.SRC.role.index.v1<br>DSGN.SRC.runtime.operation_conditions.v1<br>DSGN.SRC.runtime.activation_matrix.v1<br>DSGN.SRC.runtime.converged_guard.v1 |
| audit | DSGN.SRC.dry_run.report.v1<br>DSGN.SRC.dry_run.cases.v1<br>DSGN.SRC.dry_run.machine_report.v1 |
| runtime | DSGN.SRC.tag.machine.v1<br>DSGN.SRC.internal.all_item_machine.v1 |

