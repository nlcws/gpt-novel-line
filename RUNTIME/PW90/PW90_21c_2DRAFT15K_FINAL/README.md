# PW90 Pack Writer Runtime 21c SECOND DRAFT 15K FINAL

現行版: `pw90-v004.21c-second-draft-15k-final`

STATUS: beta。固定LOCKEDではなく、NORA_CORE本文炉 + PW90監査ゲートの検証版。

PW90 は、ZIP話パック内の条件をすべて拾い、条件内で一切の妥協をせずに限界まで本文を出すための執筆ランタイムである。

紹介文・配布説明とは同期しない。
このZIP内は現行一本道だけを持つ。履歴・変更理由・旧仕様説明は持たない。

## 最終核

```text
条件内で一切の妥協をせずに、限界まで本文を出す。
```

PW90では、この核を次の責務として実行する。

```text
話パック内にある条件をすべて拾う。
拾った条件を落とさず、小説本文として書き起こす。
```

## 受領するもの

PW90 は、通常のランタイム話パックとしてチャット直入力を受けない。
PW90 が受けるのは、ZIPで梱包された話パックである。

最低話パック定義:

```text
ZIPで梱包されている。
中に小説を書ける材料がある。
```

最新版正規形式は最高形である。
ただし最低受領条件ではない。

## 拒否理由にしないもの

```text
DS90の版番号が違う
梱包工程の実装が違う
ready / V2 / layer / frozen がない
manifest がない
最新版棚形式ではない
txt一個だけのZIPである
```

ZIP内に小説を書ける材料があるなら、受領候補にする。

## STOPするもの

```text
ZIPが壊れている
中身が読めない
小説を書く材料が実質ない
チャット直入力を話パックとして渡された
条件矛盾で本文化不能
書くなという明示がある
話パック内条件を全回収する台帳が作れない
```

## WRITE出力

成功出力は次の5点に固定する。

```text
filename_line
target_length_or_self_bound
frozen_condition_table_short
text
本文後LOG
```

本文だけの成功扱いはしない。
本文後LOGでは、拾った条件・coverage・WARN/STOP分類・次へ返す札を確認する。


## 15K beta 認識

PW90は、小説1話を5K前後の短い完成読み物として認識しない。

```text
小説は1話15K字である。
話カード条件をすべて使って1話を出力する。
```

これは機械的な文字数ノルマではない。
DS90正規話パックを、完全燃焼時15K級の高密度本文材料として扱うための初期姿勢である。

15K未満でも、全条件を使い切った全力燃焼ならSUCCESS候補。
ただし15K未満で、未使用・未燃焼・省略・圧縮・自己増殖不足・5K完成顔が残るなら `FAILED_TEXT_QUARANTINE`。

詳細: `source/knowledge/PW90_EPISODE_15K_FULL_USE_BETA_LOCK_v001.md`


## 二稿分岐のみ

21bの話パックのみ通常WRITEは変更しない。本文TXTが話パックと同時投入された場合だけ二稿増補へ分岐する。

```text
話パックのみ = 21b通常WRITEをそのまま使用
話パック + 本文TXT = 二稿増補 / 本文のみ15K字以上
```

二稿の `text` フィールドは、話タイトルと本文の前に `【二稿増補指示】` を置く。
詳細: `source/knowledge/PW90_SECOND_DRAFT_BRANCH_15K_EXPANSION_LOCK_v001.md`

## チャット表示内の自然圧縮禁止

`チャット表示内` は本文世界ではなく、チャット画面・UI表示・出力面・メッセージ窓などの本文外表示都合を指す。

PW90では、表示都合を15K未達・本文短縮・SUCCESS候補の理由にしない。

```text
チャット表示内の自然圧縮
表示都合で短くなった
UI都合で圧縮した
自然圧縮だから十分
```

これらはすべて禁止。
実際に硬い出力上限へ当たった場合は、SUCCESSではなく `OUTPUT_TRUNCATED_CONTINUE_REQUIRED` または `SPLIT_DELIVERY_REQUIRED` として続き出力へ回す。

詳細: `source/knowledge/PW90_CHAT_DISPLAY_COMPRESSION_DENIAL_LOCK_v001.md`

## 薄いSUCCESS禁止

PW90は、ユーザーに薄さ検出を背負わせない。
本文を書く前に、全条件拾い台帳と場面別施工表を作る。
本文後に、場面施工実行表と薄さ監査を通す。

```text
薄い本文
骨だけ本文
要約置換本文
場面を通しただけの本文
ユーザーが指摘しなければ発覚しない下振れ本文
```

これらはSUCCESSではない。
必ず `FAILED_TEXT_QUARANTINE` として隔離し、出す前に再施工する。


## 成果物定義

PW90における成果物は、完全収束済みの本文出力である。

```text
本文だけでは成果物ではない。
条件回収、本文、本文後LOG、coverage、WARN/STOP分類、full_convergence_sweepまで閉じて成果物である。
```

詳細: `source/knowledge/PW90_ARTIFACT_EQUALS_FULL_CONVERGENCE_LOCK_v001.md`


## DEFAULT_WRITE_MODE_FULLBURN_LOCK

PW90 v004.20 では、WRITE指示そのものを FULLBURN として扱う。
「全力」「限界まで」「ちゃんと」等の強調語がなくても、対象話数と執筆依頼がある場合は FULLBURN WRITE を実行する。

```text
DEFAULT_WRITE_MODE = FULLBURN
WRITE指示そのものが全力トリガー。
“全力で”を言わせた時点で、前回の通常WRITEは FAILED_TEXT_QUARANTINE 扱い。
```

軽くしてよいのは、ユーザーが「試走」「短め」「骨だけ」「確認用」「抜粋」「要約」などを明示した時だけ。
通常WRITE、軽量WRITE、読み物としてまとまった時点のSUCCESSを禁止する。

詳細: `source/knowledge/PW90_DEFAULT_WRITE_MODE_FULLBURN_LOCK_v001.md`

## 地の文終止分散

話レイヤーに `地の文終止分散` を追加した。

```text
「た。」「る。」系の言い切り文末を機械禁止しない。
ただし連打で説明床・同型文・早閉じの顔になる場合、語尾だけでなく観測点・物の位置・手の動き・生活余波へ割って散らす。
```

詳細: `source/knowledge/NARRATION_LAYER_MULTI_OPERATION.md`


## NEW_EPISODE_FULL_BOOT_ROLLBACK_LOCK

PW90 v004.20 では、ロールバック時代の「毎話再起動する」意図だけを現行へ復活させる。

旧 `WRITER_INSTANCE_LOAD_LIMIT` 系の `8〜15話推奨 / 20話超回避` は現行根拠にしない。これは legacy 降格する。

現行診断名は次である。

```text
NEW_EPISODE_BOOT_GATE_MISFIRE
```

「次へ」「続き」「○話お願い」「WRITE」「執筆開始」は、前話惰性を持つ CONTINUE ではなく、対象話ごとの NEW_EPISODE_FULL_BOOT として扱う。

各話WRITE開始時は、前話本文・前話SUCCESS顔・前話文体惰性・圧縮癖・省略癖を破棄し、対象話フォルダを再実読し、固定条件表・条件拾い台帳・場面別施工表を再生成してから FULLBURN WRITE へ入る。

詳細: `source/knowledge/PW90_NEW_EPISODE_FULL_BOOT_ROLLBACK_LOCK_v001.md`

## EPISODE_TAIL_NEXT_OPENING_BRIDGE_LOCK

PW90 v004.20 では、毎話再起動を維持しつつ接続の手触りを落とさないため、各話WRITE単位を次の形にする。

```text
CURRENT_EPISODE_FULLBURN
+
NEXT_EPISODE_OPENING_BRIDGE
```

前話全文・前話文体・前話SUCCESS顔は破棄する。
ただし、前話の下部だけを接続アンカーとして確認する。
読むのは最後の生活状態、残った物、位置関係、残された問い、次話へ自然に渡る生活動線であり、文体惰性ではない。

現話本文と本文後LOGを閉じた後、次話の書き出し候補を `HANDOFF_ONLY_NOT_CANON` として作る。
これは現話本文・現話文字数・現話coverageへ混ぜない。
次話話パック再実読時に矛盾した場合は、仮橋を破棄して次話話パックを優先する。

詳細: `source/knowledge/PW90_EPISODE_TAIL_NEXT_OPENING_BRIDGE_LOCK_v001.md`

## 修正刃さまへ渡す時

PW90 から TS90 へ専用ハンドオフ契約は作らない。
基本は TXT 本文として渡す。

必要なら、以下を添える。

```text
対象話数
本文本体
本文後LOG
修正してよい範囲
修正してはいけない核
```

TS90 はそれを既存本文として読み、許可範囲だけ整える。
PW90 の SUCCESS 判定は TS90 専用受領契約に依存しない。

## DS90との受け渡し

DS90 と PW90 の受け渡しは、コード依存でも版番号依存でもない。
成果物依存である。

DS90 は、PW90 が限界まで本文を出せるように、作成時点で必要条件を話パック内へ閉じて渡す。
PW90 は、その話パック内の条件をすべて拾って本文へ起こす。

詳細: `source/knowledge/PW90_DS90_ARTIFACT_HANDOFF_JOINT_LOCK_v001.md`

## 起動

GPT は `START_HERE.js` を先に読む。
その後 `READ_ORDER` の全ファイルを読む。

Node / Codex は `npm run check` で検査する。
GPTは通常 `npm test` に依存しない。


## NORA_CORE 正規化方針

PW90 v004.19 は、本文火力の主炉を NORA_CORE として扱う。
ただし、野良ちゃん本文を正本・投稿稿・検証済みV2へ自動昇格しない。
PW90 は、NORA_CORE の本文火力を、正規条件保証・禁止線・SUCCESS判定・coverage・thinnessAudit・textScaleAudit・full_convergence_sweep で拘束する。

```text
NORA_CORE_WRITER = 本文生成炉
PW90_GUARDRAIL = 正規条件保証・監査・成功判定
DS90_WRITERPACK = 本文燃料庫
```

### 局所具体追加

話パックに明示された条件だけでなく、条件同士の間に自然発生する局所具体・手元・位置・反応差・余波を BODY_LOCAL として本文燃料にしてよい。
ただし、BODY_LOCAL は世界設定・固定条件・次話義務として扱わない。
本文後LOGで BODY_LOCAL / RETURN_CANDIDATE / FIXED_CANDIDATE / WARN / DISCARD に分類する。

### BODY_FIRST_LOG_SECOND

本文後LOG、coverage、監査表、戻し札を守るために本文本体を圧縮してはならない。
本文本体を優先し、詳細監査は必要時に別出力へ分離できる。

### AUTO_MOUNT_BOOT_HARD_LOCK

マウント済みは読了ではない。読了は起動完了ではない。起動完了は執筆可能ではない。執筆可能は成功ではない。成功にはゲート証拠が必要。
BOOT_READY は WRITE_READY ではない。
