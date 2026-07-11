# NOM差込ゲート min v3

STATUS: insert_gate
TARGET: designer_core / pack_cutout_module / writer_pack
POSITION: validation_gate

---

## 0. 位置づけ

NOMは検査ゲートである。  
NOMは本文条件源ではない。

NOMは次ではない。

- story_source
- worldbuilding_source
- character_interpretation_source
- style_value_source
- layer_source
- ready代替
- V2代替
- 不足補完の根拠

NOM正本は保守・改定・事故検証用に置く。  
通常運用では、この差込ゲートを使う。

---

## 1. 禁止

- NOMから物語条件を補わない
- NOMから世界観を作らない
- NOMからキャラ解釈を足さない
- NOMから文体値を作らない
- mounted / filename / filelist / summary / memory を読了扱いしない
- 足りない条件を推測で埋めない
- ゲート未通過のまま本文へ入らない
- STOP時に暫定本文を出さない

---

## 2. 最小通過条件

本文または話パック凍結へ進む前に、最低限以下を確認する。

1. input_scope が明確である
2. required_input が実読できる
3. ready または固定層が識別できる
4. V2 または本文施工図が識別できる
5. layer 値が必要範囲で識別できる
6. fixed_layer が存在する
7. heat_layer が存在する、または不要理由が明記されている
8. forbidden_lines が存在する
9. target_length / self_bound が設定されている
10. frozen_condition_table が作成されている
11. frozen 後に条件を増減しない
12. 未回収・代用・省略・禁止線違反があれば STOP

---

## 3. fixed_layer 最小

固定層に必要な項目。

- 核
- 必須要素
- 必須順
- 接続要素
- 禁止線
- 痩せやすい箇所
- 今回前に出す人
- 場所
- 戻し先

欠ける場合は STOP。

---

## 4. heat_layer 最小

熱量層は、本文量と生活感を押し上げる公式条件である。  
説明で置き換えない。

必要候補。

- 設計思想の熱
- 渋滞
- 空気変化
- 小物意味変化
- 生活への刺さり方
- 本文量を押し上げる熱源
- 宣言されないまま進む変質

通常本文で heat_layer が欠ける場合は STOP。  
短文・検証・軽量出力などで不要な場合は、不要理由を明記する。

---

## 5. frozen_condition_table 最小

```md
# frozen_condition_table

## 固定層
- 核:
- 必須要素:
- 必須順:
- 接続に必要な継続状態:
- 禁止線:
- 痩せやすい箇所:
- 今回前に出す人:
- 今回使う場所:
- 戻し先:

## 熱量層
-

## レイヤー値
- 主:
- 副:
- 地の文語彙:
- 地の文温度:
- 地の文観測:
- 内面:
- 地の文行き先:
- イレギュラー:

## 文字数 / 自己拘束
-

## STOP条件
-
```

---

## 6. 運用分離

- 設計さん本体: NOM差込を保持し、必要時に呼び出す
- 話パック切り出し: パック凍結前ゲートとして使う
- 執筆さん: 本文前ゲートとして使う
- 初心者公開ライン: NOMという名称を出さず、裏側で使う

