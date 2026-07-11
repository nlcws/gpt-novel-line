# PW90_SECOND_DRAFT_BRANCH_15K_EXPANSION_LOCK_v001

STATUS: final_candidate
BASE_RUNTIME: pw90-v004.21b-beta-nlcore-nora-guarded-default-fullburn-new-episode-bridge-no-chat-compression-narration-ending-variation

## 目的

21bの通常WRITE経路を変更せず、話パックと既存本文TXTが同時投入された場合だけ二稿増補経路へ分岐する。

```text
話パックのみ = 21b通常WRITEをそのまま使う
話パック + 本文TXT = 二稿増補分岐
```

話パックのみの依頼へ、新しい初稿モード、追加の字数指定、追加の停止、追加の確認を入れない。

## 分岐条件

SECOND_DRAFT_BRANCH を発火する条件は次の全てを満たす場合だけ。

```text
- writable story pack または正規handoffがある
- 対象話数がある
- 本文TXT、貼り付け本文、既存稿、一次稿のいずれかが同時にある
```

本文ではないメモ、ログ、設計表、検収表だけを本文TXTとして誤認しない。

本文TXTがない場合は分岐しない。
その場合は21bの既存ルール、既存15K全燃焼圧、既存FULLBURN、既存出力契約を無変更で通す。

## 二稿の入力扱い

本文TXTは既存稿であり、話パックの代替正本ではない。

二稿では必ず次を行う。

```text
1. 話パックを再実読する
2. 対象話の固定層・熱量層・場面施工・禁止線・戻し先を再凍結する
3. 本文TXTと話パック条件を照合する
4. 未燃焼、要約化、場面圧縮、反応差不足、小物役割不足を拾う
5. 既存稿の骨を保ちながら本文のみ15K字以上まで増補する
6. 整文、言い換え、削減だけで閉じない
```

## 二稿本文の頭

二稿の `text` フィールドでは、話タイトルおよび本文より前に、次の指示をそのまま置く。

```text
【二稿増補指示】
話パックを再実読し、添付本文を土台として本文のみ15K字以上まで増やす。
整文・言い換え・要約だけで閉じず、未燃焼の場面段、反応差、物の役割変化、手元、位置、動線、戻し先を本文内へ増補する。
```

この指示は本文字数へ含めない。
filename_line、target_length_or_self_bound、固定条件表、上記指示、話タイトル、本文後LOGも本文字数へ含めない。

## 二稿の自己拘束

```text
target_length_or_self_bound:
二稿 / 話パック再実読 / 本文TXT増補 / 本文のみ15K字以上まで増やす / 整文だけで終わらない / 固定層・熱量層を落とさない
```

15K到達は未回収を残してよい理由ではない。
15Kを超えても固定層・熱量層・場面段・物の役割変化・反応差・戻し先に未回収があれば続ける。

## 増補対象

二稿は、既存稿に次を足して本文厚を作る。

```text
- 中盤の場面段
- 困る人、助かる人、順番を見る人の反応差
- 小物の役割変化
- 触る前、触った後、触らず待つ手元
- 真ん中、端、窓際、机、廊下、通れる幅
- 一か所目から別の場所への波及
- 戻すものと残すものの境界
- 生活着地の具体的な絵
```

既存文の同義言い換え、説明の反復、感想の追加は増補として数えない。

## 禁止

```text
- 話パックのみの通常WRITEを新しい初稿モードで上書きする
- 話パックのみの通常WRITEへ追加指示を入れる
- 初稿か二稿かをユーザーへ確認する
- 二稿で希望文字数を聞く
- 本文TXTだけを読んで話パックを再実読しない
- 二稿を整文、校正、言い換えだけで終了する
- 15K未満をSUCCESSにする
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
- actualBodyCharCount >= 15000
- expandedScenes が1件以上
- newlyRecoveredPackConditions が配列である
- stillThinRisk = false
- finalDecision = SUCCESS_CANDIDATE_AFTER_SECOND_DRAFT_EXPANSION
```

本文のみ15K未満なら理由を付けてSUCCESSにせず、FAILED_TEXT_QUARANTINE とする。
