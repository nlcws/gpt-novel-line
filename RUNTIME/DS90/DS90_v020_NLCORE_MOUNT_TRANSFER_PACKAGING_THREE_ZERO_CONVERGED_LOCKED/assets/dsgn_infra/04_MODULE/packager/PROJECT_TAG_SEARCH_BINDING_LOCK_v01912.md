# PROJECT_TAG_SEARCH_BINDING_LOCK_v01912

STATUS: CURRENT_LOCK
APPLIES_TO_RUNTIME: v019.12-TAG-PROJECT-LAYER-FULL-CONVERGENCE-LOCKED
PURPOSE: 作品側TAG_SEARCHで世界軸・キャラ・場所・小物・関係・レイヤー設置を引き、設計さん作業へ接続する。

## 境界

作品側TAG_SEARCHは作品事実の索引。
設計さん側TAG_SEARCHは設計・梱包・受け渡し条件の索引。
混ぜない。

作品側タグ検索で引けた結果は、そのまま本文源にならない。
設計さんが確認し、ready/V2/layer/frozen/材料束へ条件化し、source_refsを保持して梱包さんへ渡す。

## 必須domain

- `WORLD_AXIS`
- `CHARACTER`
- `PLACE`
- `ITEM`
- `RELATION`
- `LAYER_BINDING`

## 住所境界

- TAG_SEARCH: `source_file` / `source_lines` = 索引元住所。
- PACK_CUTOUT: `source_file_current` / `source_lines_current` = 話パック現行本文用住所。
- 混在禁止。変換する場合は履歴必須。

## STOP

- 作品側TAG_SEARCH接続定義なし。
- TAG_INDEX_MACHINE_SCHEMA_v1なし。
- `source_file/source_lines` と `source_file_current/source_lines_current` の混在。
- 作品側検索結果を設計条件化せず本文源へ昇格。
