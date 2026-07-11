# DESIGNER_REVERSE_LOOKUP_INDEX_V1

STATUS: complete_candidate
PURPOSE: 症状・役割・作業目的から、どのタグ/正本を引くか逆引きする。

---

# 1. SYMPTOM_TO_TAG

| symptom_or_question | lookup_tags |
| --- | --- |
| 客観視が無色になる | layer.axis.pressure<br>layer.axis.leak<br>layer.prose.observation |
| 副/本来主が補助役扱いされる | layer.axis.pressure<br>layer.axis.embed |
| 感情名が直接出る | layer.prose.inner_output<br>layer.axis.routing<br>layer.axis.leak<br>layer.preset.body_leak_restraint |
| 関係が『距離が縮まる』で説明される | layer.scene.distance<br>layer.axis.routing<br>layer.preset.distance_boundary_relation |
| 締めが『十分だった』『分かった』になる | layer.closing.unresolved_residue<br>layer.scene.residue<br>layer.preset.residue_close |
| 猫や物が象徴化される | layer.scene.object_position<br>layer.expanded.description_suppression<br>layer.preset.cat_cafe_object_operation |
| 店や世界の普通を説明し始める | layer.scene.procedure<br>layer.prose.explanation<br>layer.preset.procedure_world_pressure |
| 文章が清潔すぎる/全員が意味に協力する | layer.flow.interruption<br>layer.scene.interruption<br>layer.preset.clean_proof_breaker |
| 変奏が曖昧 | layer.flow.sentence_variation<br>layer.flow.sentence_length<br>layer.flow.object_first_rate<br>layer.flow.verb_timing |
| 会話がテーマ説明になる | layer.flow.dialogue_ratio<br>layer.preset.conversation_mismatch<br>layer.prose.speech_verb |
| 沈黙がAI的余韻になる | layer.flow.dialogue_ratio<br>layer.axis.leak<br>layer.scene.residue |
| 描写が飾りになる | layer.expanded.description_output<br>layer.flow.focus_route<br>layer.expanded.description_psychology |
| 比喩がきれいな説明になる | layer.prose.metaphor<br>layer.expanded.description_suppression |
| 薄い回を説明で水増しする | layer.expanded.thin_reinforcement<br>layer.preset.high_density_12k<br>packager.execution_queue |
| ready抽象文が本文に漏れる | packager.ready.role<br>packager.crosscheck<br>packager.frozen.extract |
| V2動作を拾い切れない | packager.v2.role<br>packager.execution_queue<br>packager.crosscheck |
| 梱包さんが設定値で迷う | packager.lookup.layer<br>layer.preset.packager_balanced<br>layer.meaning.v1 |
| NOMを本文素材に読んでしまう | nom.gate.validation<br>nom.fixed_layer<br>nom.frozen_table |
| 読んだふりが起きる | nom.reading.actual<br>nom.stop.no_draft |
| 単話補完が恒久化しそう | backlog.layer<br>embed.character<br>embed.world_axis |


---

# 2. ROLE_TO_TAG

| role | default_lookup_tags |
| --- | --- |
| 設計さん | source.registry<br>runtime.load.policy<br>layer.axis.embed<br>embed.character<br>embed.world_axis<br>backlog.layer<br>nom.gate.validation |
| 梱包さん | packager.core.light<br>packager.cutout.50pack<br>packager.folder.episode<br>packager.lookup.layer<br>packager.crosscheck<br>packager.frozen.extract<br>packager.stop |
| 執筆さん | packager.frozen.extract<br>nom.gate.validation<br>nom.stop.no_draft |
| 通し番/検査 | nom.frozen_table<br>packager.crosscheck<br>layer.prose.forbidden<br>layer.closing.unresolved_residue |
| 初心者公開ライン | layer.preset.beginner_heat<br>runtime.load.policy<br>packager.core.light |

