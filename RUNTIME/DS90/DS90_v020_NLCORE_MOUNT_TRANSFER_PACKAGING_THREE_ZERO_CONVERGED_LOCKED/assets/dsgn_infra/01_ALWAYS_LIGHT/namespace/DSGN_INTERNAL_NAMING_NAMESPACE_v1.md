# DSGN_INTERNAL_NAMING_NAMESPACE_V1

STATUS: complete_candidate
PURPOSE: プロジェクト側インデックスと設計さん内部インデックスを混線させないための命名規約。

---

# 1. HARD RULE

設計さん内部の索引・タグ・正本参照は、必ず `DSGN_` または `dsgn.*` 名前空間を使う。

プロジェクト側の索引・作品固有ログ・話別管理は `PRJ_` または `project.*` を予約する。

禁止:
- `INDEX.md` のような汎用名だけで置く
- `layer.index` のように所有者不明のタグを使う
- project側のタグをdesigner内部タグとして再利用する
- designer側の正本タグをprojectの話別タグへ流用する

---

# 2. FILE NAME NAMESPACE

## designer internal files

Use:
- `DSGN_INTERNAL_ALL_ITEM_INDEX_v1.md`
- `DSGN_INTERNAL_SOURCE_MAP_v1.md`
- `DSGN_INTERNAL_TAG_REGISTRY_v1.md`
- `DSGN_INTERNAL_REVERSE_LOOKUP_v1.md`
- `DSGN_INTERNAL_LOOKUP_PROTOCOL_v1.md`
- `DSGN_LAYER_ITEM_INDEX_v1.md`
- `DSGN_PACKAGER_CONNECTION_INDEX_v1.md`
- `DSGN_BACKLOG_EMBED_INDEX_v1.md`

Do not use:
- `INDEX.md`
- `layer_index.md`
- `tag_registry.md`
- `lookup.md`

## project side reserved names

Reserved:
- `PRJ_PROJECT_INDEX.md`
- `PRJ_SOURCE_MAP.md`
- `PRJ_EPISODE_INDEX.md`
- `PRJ_CONTINUITY_INDEX.md`
- `PRJ_BACKLOG.md`
- `project.*`

Designer files must not use `PRJ_` or `project.*`.

---

# 3. TAG NAMESPACE

## designer tags

Format:
```text
dsgn.<domain>.<group>.<item>
```

Examples:
```text
dsgn.layer.axis.surface
dsgn.layer.axis.pressure
dsgn.layer.flow.sentence_variation
dsgn.layer.preset.clean_proof_breaker
dsgn.packager.crosscheck
dsgn.nom.validation_gate
dsgn.embed.character
dsgn.backlog.world_axis
```

## project tags

Reserved format:
```text
project.<work_code>.<domain>.<item>
```

Examples:
```text
project.cat.episode.049
project.cat.character.suzu
project.cat.world.cafe_route
project.cat.backlog.layer
```

Designer must not emit project tags unless explicitly writing project-side files.

---

# 4. SOURCE ID NAMESPACE

Designer source IDs use:
```text
DSGN.SRC.<domain>.<name>.<version>
```

Examples:
```text
DSGN.SRC.layer.runtime.v28
DSGN.SRC.layer.meaning.v1
DSGN.SRC.layer.preset.v1
DSGN.SRC.nom.gate.min.v3
DSGN.SRC.pack.cutout.v1
```

Project source IDs use:
```text
PRJ.SRC.<work_code>.<domain>.<name>.<version>
```

---

# 5. MODE NAMESPACE

Designer runtime modes use:
```text
DSGN.MODE.<mode_name>
```

Examples:
```text
DSGN.MODE.core_design
DSGN.MODE.layer_lookup
DSGN.MODE.pack_cutout
DSGN.MODE.embed_review
DSGN.MODE.backlog_adoption
```

Project workflow modes use:
```text
PRJ.MODE.<work_code>.<mode_name>
```

---

# 6. WHY THIS EXISTS

設計さん本体は正本を重く持つ。  
プロジェクト側も作品固有のインデックスを持つ。  
名称を分けないと、AIが以下を混ぜる。

- 正本タグと作品タグ
- 汎用レイヤー項目と猫固有の運用
- 設計さんの保持ルールと話別の適用値
- 恒久埋込と単話補完
- 梱包さん用lookupとプロジェクト読了index

そのため、designer内部は `DSGN_ / dsgn.*` に固定する。
