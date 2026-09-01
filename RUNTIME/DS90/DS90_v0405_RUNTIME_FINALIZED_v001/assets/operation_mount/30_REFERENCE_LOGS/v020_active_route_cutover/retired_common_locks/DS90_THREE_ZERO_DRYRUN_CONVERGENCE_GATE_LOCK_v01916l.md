# DS90 THREE ZERO DRYRUN CONVERGENCE GATE LOCK v019.16l

## Status
LOCKED / ACTIVE / ALWAYS_READ / MOUNT_TRANSFER / PACK_CUTOUT

## Core meaning
「収束」は宣言ではない。成果物名、PASS文、収束レポートだけでは収束扱いにしない。
他個体・エンドユーザーへ渡す前に、同一条件の空回しで三回以上連続してゼロが出ることを提出条件にする。

## Zero categories
各DryRunで以下がすべて0であること。

- error
- intent_mismatch
- route_mismatch
- shelf_mismatch
- reference_missing
- output_shape_mismatch
- user_instruction_violation
- unresolved_stop

## Counter rule
1件でも出たら未収束。修正後、連続ゼロカウントを1からやり直す。
途中で検査内容を変えた場合も未収束として、連続ゼロカウントをリセットする。

## Mount transfer application
マウント移管では以下も意図違いとして扱う。

- 現行マウント棚を読まずに外箱を作る
- MOUNT_TRANSFER_BACKPACKを読まずに進める
- ひな形/NOMを同梱物としてだけ扱い、判断に使わない
- 収納先と取り出し口を棚対応表にしない
- エンドユーザーへ021/022/024/028を4本DLさせる
- 配布ZIP直下にフォルダや裸ファイルを置く
- マウント可能ZIP以外を配布ZIP直下に置く

## Packaging application
梱包作業では以下も意図違いとして扱う。

- PACK_CUTOUTを通さない
- 執筆さんへの受け渡し条件を確認しない
- material bundle / writer handoff schema を踏まない
- 薄いメモだけを成果物にする

## Submission gate
三回連続ゼロの証跡がない成果物は提出不可。
未収束なら成果物リンクではなくSTOPと不足だけを出す。
