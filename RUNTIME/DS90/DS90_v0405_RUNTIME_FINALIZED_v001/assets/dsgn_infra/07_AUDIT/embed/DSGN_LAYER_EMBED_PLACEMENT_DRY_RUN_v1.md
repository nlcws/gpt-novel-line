# DSGN_LAYER_EMBED_PLACEMENT_DRY_RUN_v1

STATUS: pass
PURPOSE: 記載場所・記載方法固定ルールの空回し。

| case | input | placement | result |
|---|---|---|---|
| PLACE001 | 猫が椅子に座る | WORLD_PURE_DESIGN / WORLD_OPERATION_DESIGN | PASS |
| PLACE002 | 猫をどかさず人間側が皿をずらす | WORLD_OPERATION_DESIGN | PASS |
| PLACE003 | 皿のズレを関係圧の逃げ先にする | DSGN_LAYER_EMBED_WORLD_AXIS | PASS |
| PLACE004 | 男客の鞄を今回だけ漏れ口にする | EPISODE_LAYER_APPLICATION | PASS |
| PLACE005 | すずは顔より手元を見る | CHARACTER_BEHAVIOR_DESIGN + DSGN_LAYER_EMBED_CHARACTER | PASS: split |
| PLACE006 | 白い毛は優しさの象徴 | PROHIBITED | PASS |
| PLACE007 | 純設計欄に scene_vector を書く | STOP | PASS |
| PLACE008 | DSGN_LAYER_EMBED欄に新しい世界事実を書く | STOP | PASS |

---

# CONCLUSION

記載欄を分けない埋込は禁止。  
純設計とレイヤー運用が両方ある場合は、必ず分割し、anchor_id と linked_pure_design_ref で接続する。
