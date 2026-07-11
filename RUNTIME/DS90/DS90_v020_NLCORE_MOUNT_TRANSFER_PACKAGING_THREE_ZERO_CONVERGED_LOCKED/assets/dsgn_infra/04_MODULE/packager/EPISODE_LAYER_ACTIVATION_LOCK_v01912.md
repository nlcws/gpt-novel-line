# EPISODE_LAYER_ACTIVATION_LOCK_v01912

STATUS: CURRENT_LOCK
APPLIES_TO_RUNTIME: v019.12-TAG-PROJECT-LAYER-FULL-CONVERGENCE-LOCKED
PURPOSE: 話側レイヤーを毎話選び、全部ONの台所事故を防ぐ。

## activation_mode

話側レイヤーは毎話、次のどれかを必ず宣言する。

- `OFF`: 話側レイヤーを使わない。
- `PRESET`: 既存プリセットを使う。`preset_id` 必須。
- `SELECT`: 必要項目だけ選ぶ。`enabled_layers` 必須。
- `FULL`: 全部使う。ただし例外扱い。`full_activation_reason` 必須。

## 固定ルール

- レイヤー定義が存在するだけでは使わない。
- 設計さんがONにした `enabled_layers` だけ使う。
- `disabled_layers` は執筆さんが勝手に拾わない。
- `FULL` は標準にしない。理由なしFULLはSTOP。
- 未使用レイヤーは `11_layer_backlog.md` へ送る。

## schema例

```json
{
  "episode_layer_activation": {
    "episode": "081",
    "activation_mode": "SELECT",
    "preset_id": null,
    "enabled_layers": ["foreground", "observation_position", "thin_episode_reinforcement"],
    "disabled_layers": ["metaphor", "syntax_variation"],
    "selection_reason": "今回は接続・戻し先・前景管理が主で、文体変奏は不要",
    "full_activation_reason": null,
    "writer_rule": "enabled_layers_only",
    "layer_backlog_policy": ["unused_layers_to_11_layer_backlog"]
  }
}
```
