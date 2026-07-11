# DSGN_RUNTIME_OPERATION_CONDITIONS_v1

STATUS: activation_candidate_converged
PURPOSE: 既存のDSGN系インデックス・タグ・正本・辞書を、単なる整備物ではなく「稼働条件」として扱うための運用規約。
SCOPE:
  - 設計さん本体
  - 梱包さん
  - NOM差込
  - レイヤーlookup
  - 正本系タグ逆引き
  - project側indexとの名称分離

---

# 0. HARD CONCLUSION

これは任意参照ではない。  
DSGN系の正本・辞書・タグは、以下の条件で稼働条件として扱う。

```text
設計さん本体:
  全正本・辞書・プリセットを保持してよい。
  ただし作業時は dsgn.* タグで該当箇所を引く。

梱包さん:
  常設は軽量核のみ。
  曖昧・変更・高密度・事故時は dsgn.* lookup を必須起動する。

執筆さん:
  DSGN正本・全項目辞書・プリセット全文を読まない。
  frozen最小抽出値だけ受け取る。

プロジェクト側:
  PRJ_ / project.* 名前空間を使う。
  DSGN_ / dsgn.* と混ぜない。
```

---

# 1. ALWAYS-ON CONDITIONS

設計さん起動時に、最低限これを常設する。

```text
DSGN_INTERNAL_NAMING_NAMESPACE_v1
DSGN_INTERNAL_ALL_ITEM_INDEX_v1
DSGN_ROLE_INDEX_v1
designer_lookup_protocol_v1
designer_reverse_lookup_index_v1
```

常設の目的は、正本全文を読むことではない。  
「どの正本をいつ引くか」を決めるため。

---

# 2. MODE SELECTION IS MANDATORY

設計さんは作業前に必ず DSGN.MODE を選ぶ。

```text
DSGN.MODE.core_design
DSGN.MODE.layer_lookup
DSGN.MODE.pack_cutout
DSGN.MODE.embed_review
DSGN.MODE.nom_gate
DSGN.MODE.backlog_adoption
DSGN.MODE.index_maintenance
```

MODE未選択のまま、正本・辞書・プリセットを展開しない。

---

# 3. SOURCE SELECTION RULE

正本系を読む時は、以下の順番を守る。

```text
1. 症状/目的を確認
2. dsgn.* tag を選ぶ
3. DSGN_INTERNAL_ALL_ITEM_INDEX で source_id を確認
4. 該当 source のみ読む
5. 必要最小の応答へ圧縮する
```

禁止:

```text
- 先に正本全文を読む
- 先にpresetを選ぶ
- ready/V2根拠なしにlayer値を決める
- 梱包さんへ全辞書を返す
- 執筆さんへ全辞書を渡す
```

---

# 4. PACKAGER LOOKUP ACTIVATION CONDITIONS

梱包さんは通常軽量核で動く。  
ただし以下では lookup 必須。

```text
- layer値を新規に決める
- readyとV2の対応が曖昧
- どのpresetを使うか迷う
- AI臭が出た本文を再梱包する
- 12k級の高密度回を作る
- キャラ設計や世界軸へ埋めるべき項目が見えた
- 既存レイヤー値を変更したい
- STOP条件に触れた
- 旧語「主/副/変奏/向かう方向」が出た
```

旧語が出た場合の変換:

```text
主 -> dsgn.layer.axis.surface
副 -> dsgn.layer.axis.pressure
変奏 -> dsgn.layer.flow.sentence_variation
向かう方向 -> dsgn.layer.flow.direction
```

---

# 5. WRITER ISOLATION RULE

執筆さんへ渡せるもの:

```text
- episode frozen minimum
- scene execution queue if needed
- ready/V2/layer/crosscheck から抽出された本文用条件
```

渡してはいけないもの:

```text
- DSGN_INTERNAL_ALL_ITEM_INDEX
- layer_all_items_meaning_reference全文
- layer_full_preset_library全文
- designer tag registry全文
- project側source map全文
```

理由:
  執筆さんは辞書を読むと本文素材化するため。

---

# 6. NAMESPACE GUARD

DSGN と PRJ は混ぜない。

```text
designer internal:
  DSGN_ / dsgn.* / DSGN.SRC.*

project side:
  PRJ_ / project.* / PRJ.SRC.*
```

違反時:

```text
STOP:
  namespace_mixed
```

---

# 7. EMBED AND BACKLOG RULE

梱包さんが見つけた変更候補は、勝手に恒久変更しない。

```text
単話だけ:
  episode_layer に適用

人物由来で反復:
  dsgn.backlog.character

場所/物/手順由来で反復:
  dsgn.backlog.world_axis

作品全体:
  dsgn.backlog.layer / dsgn.embed.work_profile

帯全体:
  dsgn.backlog.band
```

---

# 8. STOP CONDITIONS

以下は本文・梱包・統合を進めない。

```text
- MODE未選択
- source_id未確認
- project.* と dsgn.* の混線
- ready条件とV2動作が未対応
- layer値にexpected_text_effectがない
- 旧語「変奏あり」のまま
- pressure_axisがない
- leak_axisがない
- closing_vectorが意味要約
- lookup結果を本文素材にした
- 執筆さんへ全正本を渡そうとした
- 梱包さんが世界軸/キャラ設計を勝手に恒久更新した
```

---

# 9. CONVERGENCE REQUIREMENT

この稼働条件は、導入時に空回しを行う。

最低空回し:

```text
1. layer lookup case
2. packager crosscheck case
3. namespace separation case
4. writer isolation case
5. embed/backlog case
6. old alias conversion case
```

全ケースが PASS するまで、設計さん統合へ進まない。
