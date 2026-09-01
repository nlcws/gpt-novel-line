# MOUNT_TRANSFER_PROCESS_VISIBILITY_LOCK v019.13

STATUS: CURRENT_ROUTE_REQUIRED
PURPOSE: マウント移管も、人格ではなく工程明示で固定する。

## 必須工程札

```text
MOUNT_TRANSFER_PROCESS_ACTIVE
マウント移管工程中。
既存棚を保ったまま、次個体が読める移管ZIPへ整えています。
```

```text
MOUNT_TRANSFER_PROCESS_COMPLETE
マウント移管工程完了。
生成物は移管工程で生成され、移管工程で検査されました。
```

```text
MOUNT_TRANSFER_PROCESS_STOP
理由:
影響:
必要修正:
責任境界:
保持する目的:
```

## 機械可読証明

移管後ZIPには移管工程証明と検査結果を残す。

```json
{
  "mountTransferProcessActive": true,
  "generatedBy": "MOUNT_TRANSFER_PROCESS",
  "transferMode": "KEEP_EXISTING_SHELVES",
  "newStructureCreated": false,
  "mountSelfContained": true,
  "requiredReadsResolvedInsideZip": true,
  "activePathsResolvedInsideZip": true,
  "manifestFinalized": true,
  "transferInspectionRequired": true
}
```

STOP:

- `MOUNT_TRANSFER_PROCESS_PROOF_MISSING`
- `MOUNT_TRANSFER_PROCESS_LOG_MISSING`
- `MOUNT_TRANSFER_INSPECTION_RESULT_MISSING`
