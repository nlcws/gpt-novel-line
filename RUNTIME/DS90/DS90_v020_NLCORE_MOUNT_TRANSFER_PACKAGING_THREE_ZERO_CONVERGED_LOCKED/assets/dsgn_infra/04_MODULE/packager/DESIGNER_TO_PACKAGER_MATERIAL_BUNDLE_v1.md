# DESIGNER_TO_PACKAGER_MATERIAL_BUNDLE_v1

STATUS: current_designer_to_packager_boundary
ROLE: 設計さんが梱包さんへ渡す材料束を固定し、設計さん単独の話パックZIP化を禁止する。

APPLIES_TO_DESIGNER_RUNTIME: v019.12-TAG-PROJECT-LAYER-FULL-CONVERGENCE-LOCKED
TARGET_HANDOFF_SCHEMA: PACKAGER_WRITER_HANDOFF_SCHEMA_v1
TARGET_WRITER_RUNTIME: PACK_WRITER_RUNTIME_v004_8b

---

## 0. 結論

設計さんは話パックZIP正本候補を作らない。

設計さんが作るのは、梱包さんが唯一の正規ルートで話パックへ荷造りするための材料束である。

```text
設計さん:
  材料束を閉じる。
  話パックZIPを正本化しない。

梱包さん:
  材料束を受け取り、PACKAGER_WRITER_HANDOFF_SCHEMA_v1で話パックZIPを作る。

パック執筆さん:
  梱包さん正規出力だけを読む。
```

---

## 1. 材料束の必須内容

```text
project_source_read_ledger
target_episode_range
episode_order
work_profile
band_profiles
continuity_cards
writer_ready_cards_v2
v2_scene_build_cards
layer_current_key_bindings
crosscheck_results
writing_freeze_cards_v2
source_mount_requirements
forbidden_lines
end_user_heat_delivery_points
writer_output_comfort_expectations
unresolved_backlog
```

上記のいずれかが未読・未解決・未分類なら、梱包さんへ渡さずSTOPする。

---

## 2. source住所

`source_file_current` と `source_lines_current` は混ぜない。

複数根拠は `current_sources[]` に分ける。

```json
{
  "source_file_current": "07_episodes/episode_081/01_ready.md",
  "source_lines_current": "L10-L20",
  "current_sources": [
    {"file": "source/a.md", "lines": "L1-L4", "role": "core"},
    {"file": "source/b.md", "lines": "L9-L12", "role": "constraint"}
  ]
}
```

---

## 3. internalized source

現ZIP内へ内部住所化できないsourceがあるなら、材料束は `WRITE_READY` を名乗らない。

必要なSTOP理由:

```text
INTERNAL_PACK_REFERENCE_MISSING
```

---

## 4. 梱包さんへ渡してよいもの

- ready / V2 / layer / crosscheck / frozen の材料
- current keyへ解決済みのlayer binding
- coverage ID候補
- coverage tableへ渡す条件ID
- WARN分類候補
- return ticket候補
- FULL_CONVERGENCE_SWEEP_LOCKを通すための未解決backlog

---

## 5. 梱包さんへ渡してはいけないもの

- 設計さん単独生成の話パックZIP
- 手作業で見た目だけ揃えたepisode folder
- materialMap旧経路を現行WRITE候補へ戻す指定
- DSGN辞書・タグ全文・レイヤー正本全文
- 未確認sourceを確認済みに見せる札
- 未分類WARN
- 未解決STOP

---

## 6. 成立条件

```text
材料束PASS =
  作品source実読PASS
  + episode範囲確定
  + ready/V2/layer/crosscheck/frozen整備PASS
  + 内部住所化済みsource要求明示
  + WARN分類
  + return ticket準備
  + FULL_CONVERGENCE_SWEEP_LOCK予定
```

材料束PASSは話パックWRITE候補ではない。話パックWRITE候補は梱包さん正規出力だけである。
