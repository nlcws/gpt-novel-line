# WRITER_OUTPUT_COMFORT_CHECK v019.5

STATUS: current_packager_gate
ROLE: 執筆さんが本文を書く直前に、話パックが「落とさず・薄めず・迷わず」変換可能か確認する門
APPLIES_TO_RUNTIME: v019.12-TAG-PROJECT-LAYER-FULL-CONVERGENCE-LOCKED

---

## 0. 目的

梱包さんの出力規格は、梱包さん都合で決めない。  
先に、執筆さんが本文へ変換する時に必要なものを固定し、それを話パックの唯一の合格条件にする。

合格条件は「資料が多い」ではない。  
合格条件は「本文に変換できる形で閉じている」である。

---

## 1. 設計さんの責任境界

設計さん単独出力は、最大でも次のどちらかである。

```text
DESIGN_OUTPUT_CANDIDATE
PACKAGER_CANONICAL_WRITER_PACK_CANDIDATE
```

設計さんは次を自称しない。

```text
WRITE_CANON
WRITE_READY
WRITER_CONSUMABLE_REAL_PACK
```

`PACKAGER_CANONICAL_WRITER_PACK_CANDIDATE` は、梱包さん正規ランタイム生成・梱包さん検査PASS・v004.8入力規格一致の機械可読契約を満たす時だけ成立する。
`WRITER_CONSUMABLE_REAL_PACK` は、さらにパック執筆さん側ランタイムの消費門が確認した後にだけ成立する。

---

## 2. ファイル役割

本文復元源として使えるもの。

```text
RESTORE_SOURCE:
  01_ready.md
  02_v2.md
```

本文制約・固定条件として使うもの。

```text
RESTORE_CONSTRAINT:
  03_layer.md
  05_frozen.md
```

工程・検査専用。

```text
PROCESS_ONLY:
  04_crosscheck.md
  06_execution_queue.md
```

参照住所録。

```text
REFERENCE_ONLY:
  07_sources.md
```

本文源禁止。

```text
DENY_AS_BODY_SOURCE:
  00_episode_index.md
  03_layer_binding_manifest.json
  00_packGateIndex.json
  README / manifest / log
```

`04_crosscheck.md` は検査札であり、本文復元源ではない。  
`05_frozen.md` は前段読了代替ではない。  
`06_execution_queue.md` は施工順であり、本文素材そのものではない。

---

## 3. 住所規格

単一根拠は、必ず分離する。

```json
{
  "source_file_current": "07_episodes/episode_081/01_ready.md",
  "source_lines_current": "L45-L53"
}
```

`source_lines_current` にファイル名やラベルを混ぜない。

禁止。

```json
{
  "source_file_current": "07_episodes/episode_081/01_ready.md",
  "source_lines_current": "02_world_axis_used.md L1-L42"
}
```

複数根拠は `current_sources[]` に分ける。

```json
{
  "current_sources": [
    { "file": "02_world_axis_used.md", "lines": "L1-L42", "role": "project_axis_current" },
    { "file": "07_episodes/episode_081/01_ready.md", "lines": "L45-L53", "role": "ready_current" }
  ]
}
```

---

## 4. crosscheckの分離

`04_crosscheck.md` は、現ZIP内の内部住所・棚役割・条件回収を確認するPROCESS_ONLY札である。

```text
internal_pack_crosscheck:
  ready / V2 / layer / frozen の内部対応
  source_file_current / source_lines_current の現ZIP内解決
  本文源・制約源・参照・PROCESS_ONLY・DENY_AS_BODY_SOURCE の分離
```

話パックは現ZIP内完結である。  
WRITE前判定は、現ZIP内の内部住所検査PASSに基づく。

内部住所が解決できない場合だけ、次で止める。

```text
internal_pack_crosscheck: NOT_VERIFIED
write_authority: STOP_UNTIL_INTERNAL_PACK_REFERENCES_RESOLVED
```

内部住所未解決のまま `WRITE_READY` や `final PASS` を名乗らない。

---

## 5. PASS条件

WRITER_OUTPUT_COMFORT_CHECK は次が全てPASSした時だけ通る。

```text
coreLocked
requiredElementsLocked
requiredOrderLocked
forbiddenLinesLocked
connectionLocked
layerResolved
frozenNotReadSubstitute
sourceUnverifiedNotWritten
textDensityGuarded
bodySourceRolesSeparated
selfContainedSourceAddressesLocked
```

1つでも欠けたら、本文へ進めず STOP または BACKLOG に送る。

---

## 6. 梱包さんへの出力規格

話パックは、本文を書くための資料棚ではなく、本文へ変換できる固定条件の束である。  
だから、出力直前に必ず次を出す。

```json
{
  "writerComfortCheck": {
    "coreLocked": true,
    "requiredElementsLocked": true,
    "requiredOrderLocked": true,
    "forbiddenLinesLocked": true,
    "connectionLocked": true,
    "layerResolved": true,
    "frozenNotReadSubstitute": true,
    "sourceUnverifiedNotWritten": true,
    "textDensityGuarded": true,
    "bodySourceRolesSeparated": true,
    "selfContainedSourceAddressesLocked": true,
    "designOutputAuthority": "DESIGN_OUTPUT_CANDIDATE",
    "requiredPackagerWriterHandoff": "PACKAGER_TO_PACK_WRITER_CANONICAL_ROUTE"
  }
}
```
