# CODEX_VALIDATION_REPORT

```yaml
required_sources:
  status: PASS
  missing: []
required_tags:
  status: PASS
  missing: []
namespace_separation:
  status: PASS
  violations: []
load_order:
  status: PASS
writer_isolation:
  status: PASS
old_alias_conversion:
  status: PASS
embed_placement:
  status: PASS
dry_run_cases:
  - case_id: sample_refresh_v019_3
    status: PASS
    notes: latest v2 writer_ready / writing_freeze samples imported; old 8set not promoted; V2_SAMPLE_NEKO_49 retired because no current uploaded 49 sample exists
  - case_id: regression_suite
    status: PASS
    notes: 83 tests (64 integrated + 3 literal + 16 librarian)
  - case_id: common_summary_discipline_gate
    status: PASS
  - case_id: complete_new_item_registration
    status: PASS
  - case_id: tag_meaning_change_without_approval
    status: STOP_EXPECTED
  - case_id: tag_meaning_change_with_explicit_approval
    status: PASS
  - case_id: entity_relation_definition_gate
    status: PASS
  - case_id: line_reference_update_history
    status: PASS
  - case_id: tag_search_repairs_proposal_only
    status: PASS
  - case_id: mount_transfer_literal_equivalence
    status: PASS
  - case_id: mount_transfer_selective_activation
    status: PASS
  - case_id: librarian_structure_preservation
    status: PASS
  - case_id: librarian_line_reference_resolution
    status: PASS
  - case_id: existing_index_repair_first
    status: PASS
  - case_id: stable_field_lock
    status: PASS
  - case_id: mechanical_line_move_detection
    status: PASS
  - case_id: file_digest_update_registration
    status: PASS
  - case_id: normal_tag_search_exact_alias_source
    status: PASS
  - case_id: normal_tag_search_entity_relation
    status: PASS
  - case_id: normal_tag_search_absence_without_inference
    status: PASS
  - case_id: normal_tag_search_bad_address_or_linkage
    status: STOP_EXPECTED
  - case_id: v2_explicit_activation
    status: PASS
  - case_id: material_map_digest_and_coverage
    status: PASS
  - case_id: forged_digest_policy
    status: STOP_EXPECTED
  - case_id: empty_material_or_section
    status: STOP_EXPECTED
  - case_id: pack_five_files
    status: PASS
  - case_id: pack_indexed_one_file
    status: PASS
  - case_id: pack_gate_index_misuse
    status: STOP_EXPECTED
  - case_id: pack_episode_index_misuse
    status: STOP_EXPECTED
  - case_id: pack_episode_index_unresolved_read_order
    status: STOP_EXPECTED
  - case_id: layer_binding_manifest_missing
    status: STOP_EXPECTED
  - case_id: dynamic_binding_denied
    status: STOP_EXPECTED
  - case_id: layer_missing
    status: STOP_EXPECTED
  - case_id: ready_v2_unmapped
    status: STOP_EXPECTED
  - case_id: namespace_mixed
    status: STOP_EXPECTED
  - case_id: old_alias_single_value
    status: STOP_EXPECTED
  - case_id: writer_isolation
    status: STOP_EXPECTED
```
