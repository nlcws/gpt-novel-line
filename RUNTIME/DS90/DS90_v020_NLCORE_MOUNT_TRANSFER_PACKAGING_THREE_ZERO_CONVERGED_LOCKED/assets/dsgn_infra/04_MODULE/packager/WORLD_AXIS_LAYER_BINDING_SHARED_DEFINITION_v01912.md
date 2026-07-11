# WORLD_AXIS_LAYER_BINDING_SHARED_DEFINITION_v01912

STATUS: CURRENT_SHARED_DEFINITION
APPLIES_TO_RUNTIME: v019.12-TAG-PROJECT-LAYER-FULL-CONVERGENCE-LOCKED
PURPOSE: 世界軸を汚さず、レイヤーを設置して本文へ効かせるための共有定義。

## 結論

レイヤーは存在するだけでは有効化されない。
設計さんが `WORLD_AXIS_LAYER_BINDING` として世界軸・帯・単話・場面へ設置して初めて有効になる。

## 禁止

- レイヤーは世界事実を作らない。
- レイヤーは世界軸の既存事実を上書きしない。
- レイヤーは未確認sourceを世界条件へ昇格しない。
- レイヤーは雰囲気だけで場所・関係・制度・物の状態を変更しない。
- bindingなしのレイヤーを執筆さんが勝手に本文へ適用しない。

## 必須フィールド

```json
{
  "binding_id": "WALB_001",
  "world_axis_target": { "axis": "place_state", "id": "kitchen.counter" },
  "layer_key": "foreground",
  "allowed_effect": ["increase_scene_weight", "adjust_observation_order"],
  "forbidden_effect": ["create_world_fact", "modify_world_axis", "promote_unverified_source"],
  "scope": "episode",
  "source_refs": ["PROJECT_SIDE_CURRENT_LOCKED#L1-L5", "episode_ready#R1"],
  "writer_role": ["CONSTRAINT_ONLY", "EMPHASIS_GUIDE", "DENY_AS_BODY_SOURCE"],
  "body_source": false,
  "stop_policy": [
    "WORLD_FACT_MODIFICATION_BY_LAYER",
    "UNVERIFIED_SOURCE_PROMOTION",
    "MISSING_WORLD_AXIS_TARGET",
    "MISSING_BINDING_SOURCE"
  ]
}
```

## writer_role

- `CONSTRAINT_ONLY`: 本文源ではなく制約として読む。
- `STYLE_GUIDE`: 文体・温度・説明量へ効く。
- `EMPHASIS_GUIDE`: 厚く見る場所、痩せ防止、前景化へ効く。
- `DENY_AS_BODY_SOURCE`: そのbinding自体から本文事実を復元しない。

## 受け渡し

設計さんはbindingを作る。梱包さんはrootの `04_world_axis_layer_binding.json` へ格納する。執筆さんは本文源ではなく制約として読む。
