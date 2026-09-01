# DSGN_OPERATION_CONVERGED_GUARD_v1

STATUS: ACTIVE_CONVERGED
PURPOSE: 空回し後に確定し、DS90 V020へ統合済みの稼働ガード。

---

# 1. CONVERGED RULES

```text
RULE 1:
  DSGN内部サブフローでは DSGN.MODE を選ぶまで正本を展開しない。
  root operationへDSGN.MODEを強制しない。

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
  全検査PASS後の各話固定9ファイルを、定義済みwriter roleのまま渡す。
  frozenを前段読了の代替にしない。

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
  NOM旧互換資料は本文条件源ではない。
  現行active routeへ自動差込せず、明示監査時だけ参照する。

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

# 3. INTEGRATION STATE

このbundleはDS90 V020本体へ配置済みで、読み込み順は
`src/boot/validator.js`と`src/loading/manifest.js`により機械検証される。
PACK_CUTOUT接続と単話fixtureは現行テストで検証する。
