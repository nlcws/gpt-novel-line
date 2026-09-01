# layer_alias_to_current_keys_v0194

STATUS: current_lookup_bridge
ROLE: 旧サンプル語を現行 PACK_CUTOUT / layerBindingManifest 用キーへ解決する橋
VERSION: v019.4-DESIGNER-CONVERGED-LOCKED
UPDATED: 2026-06-24

---

## 0. 原則

旧語は入力補助名であり、本文条件源ではない。
旧語を見つけたら、作品側正規資料を実読し、現行キーへ写してから固定する。
解決できない場合は推測せず STOP。

`変奏あり` のような単一値は使用禁止。
何が、どこで、どの文流に、どの強度で効くかへ分解する。

---

## 1. PACK_CUTOUT layer必須キー

各話の `03_layer.md` または `layerBindingManifest` では、最低限以下を解決する。

| 現行キー | 役割 | 旧語からの主な入口 | 不足時 |
| --- | --- | --- | --- |
| `surfaceAxis` | 表面上の観測主軸 | 主 / 前景 / 初動担当 | STOP |
| `pressureAxis` | 実際に圧を持つ副軸 | 副 / 受け手 / 線引き手 | STOP |
| `narrationDestination` | 地の文の向かう先 | 地の文観測 / 向かう方向 / 焦点移動 | STOP |
| `leakAxis` | 内面を漏らす経路 | 内面 / 手元 / 反応差 / 感覚入口 | STOP |
| `irregularFrame` | 今回だけの逸脱枠 | イレギュラー / 今回だけ追加 | 空なら `[]` |
| `episodeSupplement` | 単話補完 | 薄回補強点 / 場面補強 / 生活落とし手 | STOP |
| `backlogRouting` | 常設化せず後送する項目 | 非常用項目 / 未確認 / 後送 | STOP |
| `closingVector` | 閉じの戻し方向 | 戻し先 / 残留点 / 閉じ | STOP |
| `expectedTextEffect` | 本文で出る効果 | 構文変奏 / 文流 / 説明量 / 空気変化 | STOP |

---

## 2. layerBindingManifest必須欄

本文へ渡るlayer値は、必ず以下を持つ。

```json
{
  "item": "",
  "selected_value": "",
  "source_id": "",
  "source_role": "story_condition",
  "allowed_use": "",
  "forbidden_expansion": []
}
```

`source_role` が `story_condition` でない値は本文条件として渡さない。
候補棚、profile、layer辞書、比較資料は、選択値の根拠補助にはなっても本文条件源にはならない。

---

## 3. 旧語の扱い

| 旧語 | 現行処理 |
| --- | --- |
| 主 | `surfaceAxis` へ写す。人物名ではなく観測の表軸として固定する。 |
| 副 | `pressureAxis` へ写す。副なしも可。副を帯固定しない。 |
| 地の文語彙 | `expectedTextEffect` か作品標準へ。語彙だけで本文条件にしない。 |
| 地の文温度 | `expectedTextEffect` と作品/帯標準へ。数値化できない場合は説明せずSTOP。 |
| 地の文観測 | `narrationDestination` へ。 |
| 内面 | `leakAxis` へ。心理設定そのものはキャラ設計側へ戻す。 |
| 向かう方向 | `narrationDestination` と `closingVector` へ分ける。 |
| 構文変奏 | `expectedTextEffect` へ。単なる「変奏あり」は禁止。 |
| 焦点移動 | `narrationDestination` へ。 |
| 比喩 | `expectedTextEffect` へ。作者都合の美化を追加しない。 |
| 説明量 | `expectedTextEffect` と禁止線へ。 |
| 前景 | `surfaceAxis` またはbindingの `item` にする。 |
| 背景降格 | forbidden_expansion / backlogRouting に入れる。 |
| 導入手型 | ready/V2の導入場面へ。layer値にする場合はsource_id必須。 |
| 初動担当 | `surfaceAxis` 補助。人物設定を増やさない。 |
| 受け手 | `pressureAxis` またはV2反応順へ。 |
| 線引き手 | 禁止線または `pressureAxis` へ。 |
| 生活落とし手 | `episodeSupplement` へ。 |
| 戻し先 | `closingVector` へ。 |
| 残留点 | `closingVector` とfrozenへ。 |
| 薄回補強点 | `episodeSupplement` へ。 |

---

## 4. 禁止

- 旧語を現行キーへ変換せず `03_layer.md` に置かない。
- 旧語から新イベント・新設定・新裏設定を推測しない。
- サンプル上の猫条件を別作品へ移植しない。
- layer辞書の一般効果を、作品未読の本文条件へ昇格しない。
- 自動刺し込み、profile自動起動、動的結合をしない。
