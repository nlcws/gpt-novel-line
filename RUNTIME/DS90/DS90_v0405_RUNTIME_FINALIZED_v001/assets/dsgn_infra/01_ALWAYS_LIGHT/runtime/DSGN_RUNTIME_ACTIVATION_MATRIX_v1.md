# DSGN_RUNTIME_ACTIVATION_MATRIX_v1

STATUS: ACTIVE_CONVERGED
PURPOSE: どの状況でどのDSGNタグ・正本・モードを起動するかを固定する。

| situation | mode | required_tags | source_policy | output |
|---|---|---|---|---|
| レイヤー値を新規設定 | DSGN.MODE.layer_lookup | dsgn.layer.axis.*, dsgn.layer.flow.*, dsgn.layer.preset.* | 該当辞書のみ | LAYER_LOOKUP_RESPONSE |
| 梱包さんが1話フォルダ作成 | DSGN.MODE.pack_cutout | dsgn.packager.* | pack.cutout + 必要タグ | 収束前はcandidate、全検査PASS後のみcanonical handoff |
| ready/V2/layerが未対応 | DSGN.MODE.pack_cutout | dsgn.packager.crosscheck | crosscheckのみ | STOP or backlog |
| 旧語「変奏」検出 | DSGN.MODE.layer_lookup | dsgn.layer.flow.sentence_variation | meaning + preset該当部 | 分解値 |
| 旧語「主/副」検出 | DSGN.MODE.layer_lookup | dsgn.layer.axis.surface, dsgn.layer.axis.pressure | meaning該当部 | axis変換 |
| AI的な清潔な締め | DSGN.MODE.layer_lookup | dsgn.layer.preset.clean_proof_breaker, dsgn.layer.preset.residue_close | preset該当部 | closing修正 |
| キャラ癖の反復検出 | DSGN.MODE.embed_review | dsgn.embed.character, dsgn.backlog.character | meaning該当部 | backlog |
| 世界手順の反復検出 | DSGN.MODE.embed_review | dsgn.embed.world_axis, dsgn.backlog.world_axis | meaning該当部 | backlog |
| NOM旧互換資料の監査 | active modeなし | dsgn.nom.* | optional referenceのみ。現行PACK_CUTOUTへ自動差込しない | audit noteのみ |
| 執筆さんへ渡す | DSGN.MODE.pack_cutout | dsgn.packager.* | 収束済み各話9ファイル。正本・辞書・タグ全文は除外 | canonical writer input |
| project側index編集 | PRJ側MODE | project.* only | DSGNタグ参照禁止 | project index |
