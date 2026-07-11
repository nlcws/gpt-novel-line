# PACKAGER_ABSOLUTE_PACKAGING_LOCK_v0199

STATUS: current_absolute_packaging_lock
ROLE: 話パックZIP正本候補は必ず梱包さんが生成することを固定する上位ロック
APPLIES_TO_RUNTIME: v019.12-TAG-PROJECT-LAYER-FULL-CONVERGENCE-LOCKED
TARGET_WRITER_RUNTIME: PACK_WRITER_RUNTIME_PW90

---

## 0-S. 機械可読正本

梱包さん→パック執筆さん契約の機械可読正本は次の1枚に固定する。

```text
assets/dsgn_infra/04_MODULE/packager/PACKAGER_WRITER_HANDOFF_SCHEMA_v1.json
schema_sha256: 0f099fda39172368c42259fc3607e36f41582cdae13db5d6e664a0de8ac93e04
```

設計さん→梱包さんの境界は次で固定する。

```text
assets/dsgn_infra/04_MODULE/packager/DESIGNER_TO_PACKAGER_MATERIAL_BUNDLE_v1.md
```

## 0. 固定結論

話パック生成は、必ず梱包さんが行う。

```text
設計さん:
  材料と条件を作る。
  話パックZIP正本候補を作らない。
  話パックWRITE投入候補を自称しない。

梱包さん:
  唯一の正規ルートで話パックZIPを生成する。
  生成証明を付ける。
  梱包さん検査PASSを付ける。
  パック執筆さんPW90入力規格へ一致させる。

パック執筆さん:
  梱包さん正規出力だけをWRITE候補として読む。
  梱包さん生成証明がないZIPは読めてもWRITE候補にしない。
```

これは提案ではない。現行話パック生成の固定条件である。

---

## 1. 正本候補の成立条件

```text
話パック正本候補 =
  梱包さん正規生成証明PASS
  + 梱包さん検査PASS
  + パック執筆さんPW90入力規格一致
  + 内部source record解決PASS
```

この4条件のどれかが欠けた場合、WRITE投入候補ではない。

---

## 2. 梱包さん生成証明

話パックrootには、次の値を機械可読で持たせる。

```json
{
  "packagerWriterHandoff": {
    "singleRouteLocked": true,
    "absolutePackagerPackagingLocked": true,
    "packagerOutputOnly": true,
    "designerPackagingAllowed": false,
    "writerConsumesOnlyPackagerOutput": true,
    "packagerRouteStatus": "FIXED_CONFIRMED",
    "canonicalRoute": "PACKAGER_TO_PACK_WRITER_CANONICAL_ROUTE",
    "generatedBy": "PACKAGER_PROCESS",
    "designerDirectPack": false,
    "writerRuntimeTarget": "PW90_WRITABLE_ZIP_PACK_CURRENT",
    "writerGate": "V2_FOLDER_PROJECTLOCKED_REAL_PACK_GATE",
    "inputMode": "V2_EPISODE_FOLDER_PROJECTLOCKED_REAL_PACK",
    "materialMapRequired": false,
    "sourceMountIndexRequired": true,
    "packagerInspection": {
      "decision": "PASS"
    }
  }
}
```

---

## 3. STOP固定

以下は必ずSTOPする。

```text
PACKAGER_GENERATION_PROOF_MISSING
PACKAGER_INSPECTION_PASS_REQUIRED
DESIGNER_DIRECT_PACK_DENIED
WRITER_INPUT_CONTRACT_MISMATCH
INTERNAL_PACK_REFERENCE_MISSING
```

---

## 4. v0010試作の扱い

設計さん単独生成のepisode folderは、形状検査やINSPECT素材として利用できる場合がある。
しかし、梱包さん生成証明と梱包さん検査PASSがない限り、WRITE投入候補にはしない。

---

## 5. materialMap

現行の50話実話フォルダ話パックは synthetic materialMap を要求しない。
ただし、materialMap不要は内部source record未解決を読了扱いにする許可ではない。
内部source recordが現ZIP内で解決できなければ `INTERNAL_PACK_REFERENCE_MISSING` でSTOPする。
