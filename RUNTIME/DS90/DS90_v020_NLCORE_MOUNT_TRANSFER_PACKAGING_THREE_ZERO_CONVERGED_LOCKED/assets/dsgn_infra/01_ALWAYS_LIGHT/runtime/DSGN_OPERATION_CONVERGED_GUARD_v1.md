# DSGN_OPERATION_CONVERGED_GUARD_v1

STATUS: converged_after_dry_run
PURPOSE: 空回し後に確定した稼働ガード。設計さん統合時はこれを必須条件として扱う。

---

# 1. CONVERGED RULES

```text
RULE 1:
  DSGN.MODE を選ぶまで正本を展開しない。

RULE 2:
  正本系は dsgn.* tag で引く。
  先に全文を読む運用は禁止。

RULE 3:
  旧語はaliasとして受け取り、正式タグへ変換する。
  主 -> dsgn.layer.axis.surface
  副 -> dsgn.layer.axis.pressure
  変奏 -> dsgn.layer.flow.sentence_variation
  向かう方向 -> dsgn.layer.flow.direction

RULE 4:
  梱包さん常設は軽量核。
  曖昧・変更・事故・高密度時のみlookup。

RULE 5:
  執筆さんへDSGN正本・全項目辞書・preset全文を渡さない。
  frozen最小値だけ渡す。

RULE 6:
  PRJ_ / project.* と DSGN_ / dsgn.* は混ぜない。
  混線したら STOP。

RULE 7:
  ready抽象文は本文語にしない。
  V2動作・layer route・expected effectへ置換済みの条件だけfrozenへ入れる。

RULE 8:
  梱包さんはキャラ設計・世界軸を勝手に恒久変更しない。
  反復/恒久化候補はbacklog。

RULE 9:
  NOMは本文条件源ではなく validation_gate。
  NOM正本常駐ではなく差込ゲート。

RULE 10:
  lookup結果は本文素材ではない。
  梱包/設計判断の根拠として使う。
```

---

# 2. INTEGRATION PRECONDITION

設計さん本体へ統合する前に、以下が存在すること。

```text
DSGN_INTERNAL_NAMING_NAMESPACE_v1
DSGN_INTERNAL_ALL_ITEM_INDEX_v1
DSGN_ROLE_INDEX_v1
designer_canonical_tag_registry_v1
designer_reverse_lookup_index_v1
designer_lookup_protocol_v1
DSGN_RUNTIME_OPERATION_CONDITIONS_v1
DSGN_RUNTIME_ACTIVATION_MATRIX_v1
DSGN_OPERATION_CONVERGED_GUARD_v1
```

---

# 3. NOT YET DONE

このbundleは、設計さん本体ZIPへ統合した完成版ではない。  
現時点では「稼働条件へ昇格した接続束」である。

次作業:
  - 現行DS90/設計さん本体の格納先へ配置
  - 読み込み順をmanifest化
  - pack_cutout_moduleとの接続確認
  - 実プロジェクト1話で稼働テスト
