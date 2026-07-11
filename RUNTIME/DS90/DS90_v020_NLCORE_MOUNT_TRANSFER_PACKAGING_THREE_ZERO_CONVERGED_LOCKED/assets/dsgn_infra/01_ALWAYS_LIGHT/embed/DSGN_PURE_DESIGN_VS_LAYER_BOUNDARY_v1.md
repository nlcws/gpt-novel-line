# DSGN_PURE_DESIGN_VS_LAYER_BOUNDARY_v1

STATUS: complete_candidate
PURPOSE: 純設計か、レイヤー埋込か、単話layerかを判定する境界表。

---

# 1. BOUNDARY TABLE

| question | pure_design | layer_embed | episode_layer |
|---|---|---|---|
| それは世界/人物/作品の事実か | yes | no | no |
| 本文でどう拾うかか | no | yes | yes |
| 変わると物語事実が変わるか | yes | no | maybe |
| 変わると見え方だけ変わるか | no | yes | yes |
| 複数話で安定するか | maybe | yes if fixed | no |
| 今回だけか | no | no | yes |
| 執筆さんへ渡すか | no | no | frozen only |
| anchor_idが必要か | optional | required | used_anchor refs |
| fixation_levelが必要か | optional | required | EPISODE_ONLY |

---

# 2. EXAMPLES

## Example A

```text
猫が椅子に座る。
```

Placement:
```text
WORLD_PURE_DESIGN / WORLD_OPERATION_DESIGN
```

Reason:
```text
世界の事実・運用であり、本文操作ではない。
```

## Example B

```text
猫をどかさないため、人間側が椅子や皿をずらす。
```

Placement:
```text
WORLD_OPERATION_DESIGN
```

Reason:
```text
世界の運用ルール。
```

## Example C

```text
皿や椅子のズレを relation_to_distance_or_procedure の逃げ先にする。
```

Placement:
```text
DSGN_LAYER_EMBED_WORLD_AXIS
```

Reason:
```text
本文で関係圧をどう処理するか。
```

## Example D

```text
男客の鞄を今回だけ漏れ口にする。
```

Placement:
```text
EPISODE_LAYER_APPLICATION
```

Reason:
```text
単話だけの適用値。
```

## Example E

```text
すずは顔より手元を見る。
```

Placement:
```text
CHARACTER_BEHAVIOR_DESIGN
```

If used for prose routing:
```text
DSGN_LAYER_EMBED_CHARACTER.notice_bias
```

Reason:
```text
人物事実と本文運用を分割する。
```

## Example F

```text
白い毛は優しさの象徴。
```

Placement:
```text
PROHIBITED
```

Reason:
```text
symbolic_cat_or_object。
```

---

# 3. SPLIT RULE

両方に見える場合、必ず分割する。

```yaml
pure_design_entry:
  what_exists_or_happens:

layer_embed_entry:
  how_text_uses_it:
  linked_pure_design_ref:
```

分割しない散文記載は禁止。
