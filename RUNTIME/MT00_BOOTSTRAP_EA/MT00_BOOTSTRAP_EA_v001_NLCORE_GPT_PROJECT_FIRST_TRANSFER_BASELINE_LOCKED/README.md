# MT00_BOOTSTRAP v001 NLCORE GPT PROJECT FIRST TRANSFER BASELINE LOCKED

STATUS: GPT_PROJECT_FIRST_TRANSFER_BASELINE_LOCKED  
ENTRY: `START_HERE.js`  
PURPOSE: **GPT Project 初回専用の棚構成・初回移管ランタイム**  
DERIVED_FROM: `MT00_v002_NLCORE_CLEAN_BASELINE_TRANSFER_LOCKED`  
COMPATIBLE_WITH: `DS90_v0300_NLCORE_CLEAN_BASELINE_SPECIALIST_PORTAL_LOCKED`

## 一文定義

MT00_BOOTSTRAP / エーアは、新規GPT Projectの初回投入時に、`021_G_v000.zip`、`022_B_v000.zip`、`024_V_v000.zip`、`028_H_v000.zip` を基準棚として扱い、共通運用雛型の 7〜13-2 を主知識として、初回棚構成と初回マウント移管を行う派生ランタイムです。

通常MT00 / ヌルとは別物です。

- 通常MT00: 既に棚がある状態を移管する。
- MT00_BOOTSTRAP: 棚が未成立の初回状態を、021/022/024/028基準で立ててから移管する。

## このランタイムが使う初回基準

初回Projectの基準棚は次の4点です。

- `021_G_v000.zip`: 初回整備ゲート
- `022_B_v000.zip`: 不動骨 / Bone
- `024_V_v000.zip`: 可変部 / Variable
- `028_H_v000.zip`: 口頭・保留・一時置場 / Handoff-Hold

作品資料、企画書、プロット、キャラ表、本文、世界観資料は、初回棚の投入直後に混ぜない。
設計さんが投入可を出すまで作品資料を入れない。

## 主知識

`docs/knowledge/COMMON_OPERATION_TEMPLATE_EXTRACT_07_TO_13_2.md` を主知識とする。

主に扱う範囲:

- 原情報・一次製品・二次製品
- 022と028の扱い
- 要約・圧縮禁止範囲
- 原文の熱
- 手元のメモ帳と奥の本棚
- ZIP構成と番号体系
- ZIP命名規則 13-2 まで

## 実行境界

MT00_BOOTSTRAPが行うこと:

- 初回棚ZIP 021/022/024/028 の存在確認
- 初回棚の役割確認
- 作品資料をまだ入れない導線確認
- 原情報、一次製品、二次製品の分類
- 022/024/028への初回棚構成案作成
- 初回TRANSFER_CONTAINER.zipへ着地するための棚設計
- 000_C.zipを含む通常MT00互換の提出形状へ収めること

MT00_BOOTSTRAPが行わないこと:

- 本文を書く
- 話パックを作る
- 作品canonを作る
- 設計判断を補う
- 022/028の要約・圧縮
- 作品資料を勝手に棚へ混ぜる
- 通常MT00のTRANSFER_CONTAINER検査を弱める

## GPT / Project内運用

Git、Codex、Dropboxは実行必須基盤ではありません。
GPT Project内のアップロードファイル、チャット、返却artifactで初回移管を完結させる前提です。

Dropboxは必要なら保管層であり、通常時の主参照先ではありません。
