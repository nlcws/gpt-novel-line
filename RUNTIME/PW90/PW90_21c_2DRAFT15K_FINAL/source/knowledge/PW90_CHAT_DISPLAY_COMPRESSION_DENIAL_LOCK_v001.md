# PW90_CHAT_DISPLAY_COMPRESSION_DENIAL_LOCK_v001

## 目的

`チャット表示内の自然圧縮` を、本文短縮・15K未達・SUCCESS候補の理由として禁止する。

ここでいう `チャット表示内` は、本文世界・話パック・固定条件ではない。
チャット画面、UI表示、出力面、メッセージ窓、トークン窓、応答サーフェスなど、本文外の表示都合を指す。

表示都合は本文品質の証明ではない。
表示都合は固定層・熱量層の回収証明ではない。
表示都合は15K未満の正当化ではない。

## 禁止

以下を underlengthReason / WARN / fullBurnDecision / successReason に置いてはならない。

```text
チャット表示内の自然圧縮
チャット表示都合
表示内で自然に圧縮
出力画面の都合
メッセージ欄の都合
UI都合で短縮
自然圧縮だから十分
natural_compression_after_full_recovery
```

`自然圧縮` という語は、本文量を短くする逃げ穴になるため、PW90では成功理由に使わない。

## 正しい扱い

15K未満で本文を閉じる場合、必要なのは表示都合ではなく本文内証拠である。

```text
underlengthReason = under15k_full_burn_proven_no_remaining_material
```

この理由を使うには、以下を本文後LOGで示す。

```text
固定層が本文内で回収済み
熱量層が本文内で値引きなし
中盤段化が要約でなく場面として発生
物・位置・手元・反応差・生活着地が本文内で動作
未使用条件なし
自然に残る展開余地なし
sceneExecution / thinnessAudit / textScaleAudit / full_convergence_sweep が通過
```

## 実際に出力上限へ当たった場合

本当にプラットフォーム上の硬い出力上限へ当たった場合は、短縮成功にしない。

```text
SUCCESS禁止
PASS候補禁止
状態 = OUTPUT_TRUNCATED_CONTINUE_REQUIRED
または SPLIT_DELIVERY_REQUIRED
```

この場合は、途中終了位置、未出力場面、次に続ける接続点を本文後LOGへ出し、続き出力へ回す。

表示都合で短くまとめてはいけない。

## 判定

`チャット表示内の自然圧縮` が出た本文は、完成本文ではない。

```text
FAILED_TEXT_QUARANTINE
```

または、硬い上限到達が実際に確認できる場合のみ、

```text
OUTPUT_TRUNCATED_CONTINUE_REQUIRED
```

として扱う。

どちらの場合も SUCCESS ではない。
