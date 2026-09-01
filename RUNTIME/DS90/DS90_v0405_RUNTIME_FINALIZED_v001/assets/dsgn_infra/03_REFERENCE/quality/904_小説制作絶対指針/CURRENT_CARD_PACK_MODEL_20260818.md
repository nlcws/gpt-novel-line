# 904 現行話カード / 話パック認識 2026-08-18

STATUS: CURRENT
PURPOSE: 絶対指針の熱量・工程分離思想を、現行DS90 / PW90 / SP00 / 話レイヤーv28へ接続する。

## 1. 結論

```text
話カード = 論理成果物としての本文施工図
話パック = PW90へ渡すZIP artifact境界
canonical projectlocked pack = SP00等で作る最高再現性形
```

この三つを混同しない。

## 2. 話カード

話カードを単一ファイル形式へ固定しない。
ready、V2、厚カード、走行レーン型、writer_ready等は、状態・機能・物理carrier・作品固有実装として扱う。

一枚MDでもよい。
複数ファイルのepisode packetでもよい。
本文へ必要な条件が解決できるなら同じ論理話カードである。

最低限、意味上次を解決する。

- 今回の核 / 因果走行レーン
- 固定層
- 熱量層
- 裁量層
- 接続状態
- 禁止線
- 痩せると困る箇所
- 開示速度 / 今回開けないもの
- 戻し先 / 残留点
- 人物固定設計
- 話レイヤーprofile
- source / 熱源導線
- HOLD / 未成立維持 / 次話境界

V2の走行レーン項目は有力な実装だが、全作品へ同じ欄を埋めることを目的にしない。
作品固有項目を追加してよい。

## 3. 話レイヤー

ACTIVE実行基準は `layer_runtime_v28_ai_native_complete_candidate.md`。
v21はv28の基準系譜を確認するLINEAGE_REFERENCEであり、ACTIVE意味へ混成しない。

v28では、

```text
SURFACE_AXIS = 表面観測（旧alias: 主）
PRESSURE_AXIS = 圧源（旧alias: 副）
ROUTING_AXIS = 行き先
LEAK_AXIS = 漏れ口
EMBED_AXIS = 埋込先
```

をprimary runtime termsとする。旧地の文項目はnative fieldsへ分解して扱う。

安定した人物側layer値は `CHARACTER_LAYER_EMBED`、安定した世界運用側layer値は `WORLD_LAYER_EMBED`、作品標準はWORK_PROFILE、帯差はBAND_PROFILEへ置く。単話では `EPISODE_LAYER_APPLICATION` が既存embed/profileから今回値を選び、単話固有値だけを補う。

PURE DESIGNとlayer embedは別欄で保持する。layerは人物・世界・プロットを新規発明するsourceではない。

未指定相当はON。OFFは明示根拠がある場合のみ。ONは全sublayerのFULL強制ではなく、当該pack/profile/applicationで選ばれたv28条件を有効にする。

## 4. 話パック

PW90現行receiverの最低受領線はartifact-based。

```text
ZIPである
+ 小説を書ける材料がある
+ パック内条件を回収できる
```

次の欠落だけを理由に拒否しない。

- ready
- V2
- layer
- frozen
- manifest
- 特定DS90版
- 特定packager版

したがって、設計・梱包側で既に書けるZIPが成立しているなら、そのZIPをPW90へ直接渡してよい。
50話は長編運用の標準的な切り出し幅であり、PW90 receiverの必須話数ではない。

## 5. SP00 canonical line

SP00を通す場合は、writer-ready cutoutとして厳密なprojectlocked形へ整える。

単話では概ね、

```text
index / ready / v2 / layer / layer-binding / crosscheck / frozen / execution-queue / sources
```

を分離する。

本文源、制約、PROCESS_ONLY、REFERENCE_ONLYを一枚の要約へ潰さない。
これは再現性・監査・source addressに強い最高形だが、PW90最低受領条件そのものではない。

## 6. 熱量

ユーザーが欲しい絵、核、期待画面を一般論・無難化・工程都合へ置換しない。
カード化 / パック化は熱を冷ます工程ではない。

未確認sourceを断定して熱を捏造しない。
WARNは注意札であり、規格PASSした熱を落とす理由にしない。
STOPは誤配防止として、理由・影響・必要修正・責任境界・保持する熱を返す。

## 7. 完全収束

本文が出ただけでは完了ではない。

- 条件回収台帳
- 条件ID
- coverage
- WARN分類
- STOP処理
- handoff residue
- heat delivery
- next action / stop

を閉じる。
未分類残渣を残したまま次工程へ渡さない。

## 8. authority

1. ユーザー直近明示条件
2. 現行マウント実体 / 現行runtime contract
3. 本文書を含む904 CURRENT quality reference
4. 旧ログ / 旧3パック

旧3パックは熱や受け渡し思想の由来確認に使えるが、現行カード・パック物理規格の正本にはしない。
