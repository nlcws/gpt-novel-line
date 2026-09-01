# PW90_SECOND_DRAFT_FULL_BURN_EXPANSION_LOCK_v001

STATUS: final_candidate
APPLIES_TO_RUNTIME: pw90-v004.28-nlcore-story-layer-v28-bound
ORIGIN_BASE_RUNTIME: pw90-v004.21b-beta-nlcore-nora-guarded-default-fullburn-new-episode-bridge-no-chat-compression-narration-ending-variation

## 目的

21bの通常WRITE経路を変更せず、話パックと既存本文TXTが同時投入された場合だけ二稿増補経路へ分岐する。

```text
話パックのみ = 21b通常WRITEをそのまま使う
話パック + 本文TXT = 二稿増補分岐
```

二稿の目的は15K達成そのものではない。
既存稿を土台に、話パックを再実読し、使用可能な種を可能な限り回収して、小説として不足している場面・反応・生活粒を増補することである。

## 分岐条件

SECOND_DRAFT_BRANCH を発火する条件は次の全てを満たす場合だけ。

```text
- writable story pack または正規handoffがある
- 対象話数がある
- 本文TXT、貼り付け本文、既存稿、一次稿のいずれかが同時にある
```

本文TXTがない場合は分岐せず、21bの既存ルール、既存15K全燃焼圧、既存FULLBURN、既存出力契約を無変更で通す。

## 二稿の入力扱い

本文TXTは既存稿であり、話パックの代替正本ではない。

二稿では必ず次を行う。

```text
1. 話パックを再実読する
2. 対象話の固定層・熱量層・場面施工・禁止線・戻し先・明示HOLDを再凍結する
3. 当該話の話レイヤーを適用する
4. 本文TXTと話パック条件を照合する
5. 未燃焼、要約化、場面圧縮、反応差不足、小物役割不足を拾う
6. 使用可能な種を可能な限り使い切るまで増補する
7. 15K級を強い目安とするが、字数のための水増しはしない
```

明示的に伏せる種、HOLD、未成立維持、禁止線は増補対象へ昇格させない。
それらは触れないまま守る。

## 二稿本文の頭

二稿の `text` フィールドでは、話タイトルおよび本文より前に、次の指示をそのまま置く。

```text
【二稿増補指示】
話パックを再実読し、添付本文を土台として、使用可能な条件を使い切るまで小説本文を増補する。15K級を強い目安とするが、字数のための水増しはしない。
整文・言い換え・要約だけで閉じず、未燃焼の場面段、反応差、物の役割変化、手元、位置、動線、戻し先を本文内へ増補する。明示HOLD・未成立維持・禁止線は先食いしない。
```

この指示は本文字数へ含めない。
filename_line、target_length_or_self_bound、固定条件表、上記指示、話タイトル、本文後LOGも本文字数へ含めない。

## 二稿の自己拘束

```text
target_length_or_self_bound:
二稿 / 話パック再実読 / 本文TXT増補 / 使用可能な種を使い切る / 15K級を目安 / 水増し禁止 / 整文だけで終わらない / 明示HOLDを守る
```

15K到達は未回収を残してよい理由ではない。
15K未満は自動FAIL理由ではない。
15K未満でSUCCESS候補にする場合は、使用可能な種を使い切り、自然な増補余地が残っていないことを明示する。

## 増補対象

```text
- 中盤の場面段
- 困る人、助かる人、順番を見る人の反応差
- 小物の役割変化
- 触る前、触った後、触らず待つ手元
- 真ん中、端、窓際、机、廊下、通れる幅
- 一か所目から別の場所への波及
- 戻すものと残すものの境界
- 生活着地の具体的な絵
- 当該話レイヤーによる語彙・温度・観測・内面の適用
```

既存文の同義言い換え、説明の反復、感想の追加、字数合わせの場面複製は増補として数えない。

## 禁止

```text
- 話パックのみの通常WRITEを新しい初稿モードで上書きする
- 初稿か二稿かをユーザーへ確認する
- 二稿で希望文字数を聞く
- 本文TXTだけを読んで話パックを再実読しない
- 二稿を整文、校正、言い換えだけで終了する
- 15K未満だけを理由にSUCCESSを禁止する
- 15Kへ届かせるために水増しする
- 明示HOLD・未成立維持・禁止線を先食いする
- 検収表、要約、書けます宣言で本文を代用する
- 前編、後編へ勝手に分割する
```

## 本文後判定

二稿SUCCESSには次を必須とする。

```text
- secondDraftBranch = ACTIVE
- inputBasis = PACK_PLUS_BODY_TEXT
- bodyTextRole = EXISTING_DRAFT_TO_EXPAND
- packReread = PASS
- bodyHeadDirective = PASS
- runtimeObservedBodyCharCount は `text` からruntime自身が算出する
- claimed actualBodyCharCount は判定権限を持たない
- expandedScenes が1件以上
- newlyRecoveredPackConditions が配列である
- stillThinRisk = false
- lengthPaddingDetected = false
- 15K未満なら under15kFullBurnProof がある
- finalDecision = SUCCESS_CANDIDATE_AFTER_SECOND_DRAFT_EXPANSION
```

本文が15K未満でも、全条件・話レイヤー・薄さ監査・収束条件を満たし、自然な増補余地が残っていないならSUCCESS候補になれる。
本文が15K以上でも、未燃焼・薄さ・水増しが残るならSUCCESSではない。
