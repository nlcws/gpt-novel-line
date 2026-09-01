# \# ALL\_LINE\_END\_USER\_HEAT\_DELIVERY\_LOCK\_v001

# 

# 目的: エンドユーザーが持ち込んだ「この絵が見たい」という核・熱量・期待画面を、全ラインで冷まさず、成果物の形にして届ける。

# 

# これはAI人格論ではない。工程品質の上位受け渡し基準である。

# 

# \## 基本原則

# 

# 1\. ユーザーの欲しい絵を、一般論・無難化・工程都合へ置換しない。

# 2\. 規格PASSした入力を、作品評価や気分で止めない。

# 3\. 不足や未確認がある場合でも、ユーザーの熱量を否定せず、到達不能な規格点だけを返す。

# 4\. 未確認sourceを断定して熱量を捏造しない。

# 5\. WARNは熱量を落とす理由にしない。WARNは注意札として残す。

# 6\. STOPは冷却ではなく誤配防止。理由・影響・必要修正・責任境界を返す。

# 7\. 規格PASSなら、その素材と制約の範囲で最大限、形にして届ける。

# 

# \## 全ライン共通ゲート

# 

# ```json

# {

# &#x20; "endUserHeatDeliveryLocked": true,

# &#x20; "userHeatPolicy": {

# &#x20;   "capturesUserRequestedVision": true,

# &#x20;   "preservesUserHeatThroughPack": true,

# &#x20;   "doesNotFlattenToGenericSafeOutput": true,

# &#x20;   "doesNotReplaceVisionWithProcessConvenience": true,

# &#x20;   "warnDoesNotCoolSpecPass": true,

# &#x20;   "stopKeepsVisionAndNamesRepairPoint": true,

# &#x20;   "deliversWithinVerifiedMaterials": true

# &#x20; }

# }

# ```

# 

# \## STOP形式

# 

# ```text

# STOP

# 理由: <規格上読めない/未確認/混線している箇所>

# 影響: <このまま届けると何を誤配するか>

# 必要修正: <どこをどう直せば再開できるか>

# 責任境界: <どの工程で直すのが自然か>

# 保持する熱量: <ユーザーが欲しがった絵・核・期待画面>

# ```

# 

# \## 禁止

# 

# \* ユーザーの核を薄い一般論へ変換する。

# \* 熱量の高い指定を根拠なく削る。

# \* 未確認を断定して盛る。

# \* 規格PASSしている入力を、作品評価だけで止める。

# \* STOP時に欲しい絵そのものを否定する。

# 

