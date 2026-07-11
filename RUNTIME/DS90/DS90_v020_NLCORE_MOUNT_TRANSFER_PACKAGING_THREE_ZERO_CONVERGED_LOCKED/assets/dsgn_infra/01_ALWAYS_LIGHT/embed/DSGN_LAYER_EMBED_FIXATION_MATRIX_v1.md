# DSGN_LAYER_EMBED_FIXATION_MATRIX_v1

STATUS: complete_candidate
PURPOSE: どのレイヤー値を、どこへ、どの固定レベルで入れるかを決める判定表。

| value_origin | repeated? | physical/procedural? | character_specific? | world_specific? | action |
|---|---:|---:|---:|---:|---|
| 単話ready/V2由来 | no | yes | no | unclear | EPISODE_ONLY |
| 単話ready/V2由来 | yes | yes | yes | no | BACKLOG -> CHARACTER_DESIGN |
| 単話ready/V2由来 | yes | yes | no | yes | BACKLOG -> WORLD_AXIS |
| 作品コンセプト由来 | n/a | yes | no | yes | WORLD_AXIS SOFT_DEFAULT |
| 世界の根本法則 | n/a | yes | no | yes | WORLD_AXIS HARD_FIXED |
| 帯ごとの傾向 | yes | yes | no | partial | BAND_PROFILE CONDITIONAL_FIXED |
| 文体の雰囲気 | yes | no | no | no | DO_NOT_FIX |
| テーマ説明 | yes | no | no | no | PROHIBITED |
| キャラの身体癖 | yes | yes | yes | no | CHARACTER_DESIGN SOFT_DEFAULT/HARD_FIXED |
| 物の象徴化 | yes | no | no | yes | PROHIBITED |

---

# QUICK JUDGMENT

```text
世界がそう動く？ -> WORLD_AXIS
人物がそう漏れる？ -> CHARACTER_DESIGN
作品全体の書き方？ -> WORK_PROFILE
帯の傾向？ -> BAND_PROFILE
今回だけ？ -> EPISODE_LAYER
まだ不明？ -> BACKLOG_CANDIDATE
象徴/テーマ説明？ -> PROHIBITED
```

---

# FIXATION_LEVEL DECISION

```text
HARD_FIXED:
  世界/作品の根本法則。上書き不可。

SOFT_DEFAULT:
  通常値。ready/V2根拠で単話変更可。

CONDITIONAL_FIXED:
  条件一致時だけ発動。

EPISODE_ONLY:
  今回だけ。

BACKLOG_CANDIDATE:
  恒久化候補。まだ採用しない。

PROHIBITED:
  禁止固定。
```
