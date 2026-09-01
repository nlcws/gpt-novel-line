# ZIP構成見本 v2

```text
WORK_001-050_pack_vXXX/
  00_README.md
  00_packGateIndex.json
  00_sourceMountIndex.json
  01_pack_profile.md
  02_world_axis_used.md
  03_character_used.md
  04_layer_common.md
  05_band_profiles/
  06_continuity/
  07_episodes/
    episode_001/
      00_episode_index.md
      01_ready.md
      02_v2.md
      03_layer.md
      03_layer_binding_manifest.json
      04_crosscheck.md
      05_frozen.md
      06_execution_queue.md   # 常置 / PROCESS_ONLY
      07_sources.md           # 常置 / REFERENCE_ONLY
    episode_002/
      00_episode_index.md
      01_ready.md
      02_v2.md
      03_layer.md
      03_layer_binding_manifest.json
      04_crosscheck.md
      05_frozen.md
  08_terms.md
  09_writer_boot.md
  10_stop_rules.md
  11_layer_backlog.md
  12_pack_cutout_log/
    00_packager_generation_proof.json
    01_packager_inspection_result.json
    02_writer_handoff_check.json
    03_writer_output_comfort_check.json
    04_full_convergence_sweep.json
    05_cutout_log.md
```

## 固定

- 1話は1フォルダで管理する。
- パック直下に`packGateIndex`を置く。
- 各話フォルダに`episodeIndex`と`layerBindingManifest`を置く。
- `00_episode_index.md`は当該話の読み順と各ファイルの役割を示す。
- `01_ready.md`が本文条件の中心であり、要約として値引きしない。
- `02_v2.md`は本文施工図、`03_layer.md`は現話の明示結合値である。
- `04_crosscheck.md`でready / V2 / layerの対応を検査する。
- `05_frozen.md`は執筆直前に条件を閉じる。前段の読了代替ではない。
- `06_execution_queue.md`と`07_sources.md`は常置する。
- 索引は地図であり、作品正本・本文条件源・読了証明にはならない。
