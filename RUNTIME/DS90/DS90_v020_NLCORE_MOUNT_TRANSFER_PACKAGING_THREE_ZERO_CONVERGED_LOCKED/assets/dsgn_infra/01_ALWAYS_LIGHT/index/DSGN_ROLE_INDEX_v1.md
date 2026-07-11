# DSGN_ROLE_INDEX_V1

STATUS: complete_candidate
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
dsgn.mode.nom_gate
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
frozen extracted values only
```

渡さない:
```text
DSGN_INTERNAL_ALL_ITEM_INDEX
DSGN_LAYER_FULL_PRESET_LIBRARY
DSGN_LAYER_ALL_ITEMS_MEANING_REFERENCE
```

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
