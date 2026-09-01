# DSGN_ROLE_INDEX_V1

STATUS: ACTIVE_CONVERGED
PURPOSE: 設計さん内部で、各役割がどのDSGNタグを持つかを分離する。

---

# DESIGNER_CORE

常設:
```text
dsgn.source.registry
dsgn.source.load_policy
dsgn.layer.axis.embed
dsgn.embed.character
dsgn.embed.world_axis
dsgn.embed.work_profile
dsgn.embed.band_profile
dsgn.backlog.layer
```

必要時:
```text
dsgn.layer.axis.*
dsgn.layer.prose.*
dsgn.layer.flow.*
dsgn.layer.preset.*
```

禁止:
```text
- project.* を設計さん内部正本タグとして保持しない
- 単話補完を恒久変更として自動採用しない
```

---

# PACKAGER_LIGHT

常設:
```text
dsgn.packager.ready.role
dsgn.packager.v2.role
dsgn.packager.layer.apply
dsgn.packager.crosscheck
dsgn.packager.frozen.extract
dsgn.packager.lookup
dsgn.packager.stop
```

必要時:
```text
dsgn.layer.preset.*
dsgn.layer.axis.*
dsgn.layer.flow.sentence_variation
dsgn.layer.flow.focus_route
dsgn.layer.closing.*
```

禁止:
```text
- dsgn.layer.meaning 全文を常時展開しない
- レイヤー正本を書き換えない
- project側indexを編集しない
```

---

# WRITER_BRIDGE

渡す:
```text
収束済み各話固定9ファイル:
  RESTORE_SOURCE: 01_ready.md, 02_v2.md
  RESTORE_CONSTRAINT: 03_layer.md, 05_frozen.md
  PROCESS_ONLY: 04_crosscheck.md, 06_execution_queue.md
  REFERENCE_ONLY: 07_sources.md
  DENY_AS_BODY_SOURCE: 00_episode_index.md, 03_layer_binding_manifest.json
```

渡さない:
```text
DSGN_INTERNAL_ALL_ITEM_INDEX
DSGN_LAYER_FULL_PRESET_LIBRARY
DSGN_LAYER_ALL_ITEMS_MEANING_REFERENCE
```

---

# OPTIONAL_LEGACY_AUDIT

ユーザーが旧NOM互換監査を明示した時だけ `dsgn.mode.nom_gate` を参照する。  
DESIGNER_CORE / PACKAGER_LIGHT / WRITER_BRIDGE の既定タグには含めない。

---

# BACKLOG_REVIEW

常設:
```text
dsgn.backlog.layer
dsgn.backlog.character
dsgn.backlog.world_axis
dsgn.backlog.band
```

採否時に見る:
```text
dsgn.embed.character
dsgn.embed.world_axis
dsgn.embed.work_profile
dsgn.embed.band_profile
```
