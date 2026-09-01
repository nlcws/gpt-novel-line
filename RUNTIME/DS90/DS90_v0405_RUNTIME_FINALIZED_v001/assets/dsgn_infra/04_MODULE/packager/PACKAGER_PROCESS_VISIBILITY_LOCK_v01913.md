# PACKAGER_PROCESS_VISIBILITY_LOCK v019.13

STATUS: CURRENT_ROUTE_REQUIRED
PURPOSE: 梱包さん人格ではなく、梱包工程の明示を必須化する。

## 基本

梱包さんの完全人格ONは不要。
ただし、梱包工程が走っていることは人間向け表示と機械可読証跡の両方で必ず残す。

## 必須工程札

```text
PACKAGER_PROCESS_ACTIVE
梱包工程中。
設計さん材料束を、パック執筆さん受け取り規格へ梱包しています。
```

```text
PACKAGER_PROCESS_COMPLETE
梱包工程完了。
生成物は梱包工程で生成され、梱包工程で検査されました。
```

```text
PACKAGER_PROCESS_STOP
理由:
影響:
必要修正:
責任境界:
保持する熱量:
```

## 機械可読証跡

`12_pack_cutout_log/00_packager_generation_proof.json` は最低限以下を持つ。

```json
{
  "packagerProcessActive": true,
  "generatedBy": "PACKAGER_PROCESS",
  "generatedByDesigner": false,
  "manualPack": false,
  "packagerRoute": "PACKAGER_TO_PACK_WRITER_CANONICAL_ROUTE",
  "packagerRouteStatus": "FIXED_CONFIRMED",
  "writerRuntimeTarget": "PACK_WRITER_RUNTIME_v004_8b",
  "inputMode": "V2_EPISODE_FOLDER_PROJECTLOCKED_REAL_PACK",
  "materialMapRequired": false,
  "storyPackSelfContained": true,
  "preclearedStopHackUsed": false,
  "packagerInspectionRequired": true
}
```

## 必須ログ棚

```text
12_pack_cutout_log/
  00_packager_generation_proof.json
  01_packager_inspection_result.json
  02_writer_handoff_check.json
  03_writer_output_comfort_check.json
  04_full_convergence_sweep.json
  05_cutout_log.md
```

`05_cutout_log.md` には `PACKAGER_PROCESS_ACTIVE` と `PACKAGER_PROCESS_COMPLETE` を含む工程ログを残す。

## STOP

- `PACKAGER_PROCESS_PROOF_MISSING`
- `PACKAGER_PROCESS_LOG_MISSING`
- `PACKAGER_GENERATION_PROOF_MISSING`
- `PACKAGER_INSPECTION_PASS_REQUIRED`
- `DESIGNER_DIRECT_PACK_DENIED`
- `MANUAL_PACK_DENIED`
