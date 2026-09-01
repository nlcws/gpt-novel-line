# 904 小説制作【絶対指針】 CURRENT READ FIRST

STATUS: CURRENT
BASELINE_DATE: 2026-08-18

この束は、**小説制作における品質思想・工程分離・熱量保持の上位指針**を置く。

## 現行の読み順

1. `CURRENT_READ_FIRST.md`
2. `【絶対指針】.txt`
3. `CURRENT_CARD_PACK_MODEL_20260818.md`
4. `設計さんへの必要条件書_熱量明文化版.md`
5. 必要時のみ `現行運用接続_20260818.md`
6. `【絶対指針】LOG.txt` と旧3パックは由来確認・比較時のみ

## authority

1. ユーザーの直近明示条件
2. 当該作業で正規入力とされた現行マウント実体 / 現行runtime contract
3. 本束の絶対指針・CURRENT接続文書
4. 旧ログ・旧サンプル

機械的な受領、起動、STOP、SUCCESS、文字量、coverage、runtime routeは現行runtimeを優先する。
本束は、**条件を値引きしない、ユーザー熱を落とさない、推測補完しない、工程責任を混ぜない**という品質原則を供給する。

## 現行のカード / パック認識

- 話カード = 論理成果物としての本文施工図。単一ファイル規格ではない
- ready / V2 / 厚カード / 走行レーン型 / writer_ready = 状態・機能・carrier差
- 固定層 / 熱量層 / 裁量層を分ける
- 話レイヤーACTIVE実行基準 = v28。v21 = LINEAGE_REFERENCE。stable layer値はCHARACTER/WORLD/WORK/BANDへ埋込み、単話値はEPISODE_LAYER_APPLICATION
- 話パック = PW90へ渡すZIP artifact境界
- 50話 = 長編運用の標準的切り出し幅。PW90最低受領話数ではない
- PW90 = 書けるZIPならcanonical形欠落だけで拒否しない
- SP00 = 必要時にprojectlocked canonical最高形へ切り出す
- 本文前条件回収 -> 本文後coverage -> full convergenceまで閉じる

詳細: `CURRENT_CARD_PACK_MODEL_20260818.md`

## 旧3パック

以下は2026年4月時点の比較・由来資料としてbyte保持する。
現行カード物理規格・PW90 receiver・SP00 canonical line・話レイヤーv28のACTIVE正本ではない。

- `029_w_001_050_v0033_20260402_redeliver.zip`
- `030_w_cat_pack_v0052_20260419_JS.zip`
- `ONEECHAN_WRITERPACK_081_130_v0001_20260419.zip`

思想・熱・反応差・密度の由来確認には使える。
