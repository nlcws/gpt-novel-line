# DSGN_LAYER_EMBED_FIXATION_DRY_RUN_v1

STATUS: pass
PURPOSE: 世界軸/設計側へのレイヤー固定ルールの空回し。

| case | input | destination | fixation | tags | result |
|---|---|---|---|---|---|
| EMBED001 | 猫はどかさず、人間側が皿をずらす。作品コンセプトにも合う。 | WORLD_AXIS | SOFT_DEFAULT | dsgn.embed.world_axis<br>dsgn.layer.scene.procedure<br>dsgn.layer.scene.object_position | PASS: 世界の物理運用であり、本文効果が皿/席/通路に出る。 |
| EMBED002 | 男客が返答前に鞄を持ち替える。今回だけ。 | EPISODE_LAYER | EPISODE_ONLY | dsgn.embed.episode_layer<br>dsgn.layer.axis.leak | PASS: 人物固有か世界由来か未確定。単話漏れ口として扱う。 |
| EMBED003 | すずは顔より手元を見る癖が複数話で出た。 | CHARACTER_DESIGN | SOFT_DEFAULT | dsgn.embed.character<br>dsgn.layer.prose.observation | PASS: 人物のnotice_biasであり世界軸ではない。 |
| EMBED004 | 白い毛は優しさの象徴として使う。 | PROHIBITED | PROHIBITED | dsgn.layer.prose.forbidden<br>dsgn.layer.scene.residue | PASS: symbolic_cat_or_object に触れる。 |
| EMBED005 | 閉店前だけ、作業音が返答を割る。 | WORLD_AXIS | CONDITIONAL_FIXED | dsgn.embed.world_axis<br>dsgn.layer.flow.interruption | PASS: 時間条件つきの世界運用。 |
