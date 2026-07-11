# PW90_NORA_CORE_REGULARIZED_GUARDRAIL_LOCK_v001

STATUS: beta_runtime_core
APPLIES_TO_RUNTIME: pw90-v004.17-beta-nlcore-nora-guarded-fullburn

## 核

PW90 v004.17 は、本文火力の主炉を NORA_CORE として扱う。
ただし、野良ちゃん本文を正本・投稿稿・検証済みV2へ自動昇格しない。
PW90 は、NORA_CORE の本文火力を、正規条件保証・禁止線・SUCCESS判定・coverage・thinnessAudit・textScaleAudit・full_convergence_sweep で拘束する。

```text
NORA_CORE_WRITER = 本文生成炉
PW90_GUARDRAIL = 正規条件保証・監査・成功判定
DS90_WRITERPACK = 本文燃料庫
```

## 目的

旧PW90は、読める一話になった時点で閉じる危険があった。
NORA_CORE は、話パック条件の隙間へ入り、物・位置・手元・沈黙・反応差・順番・残し方・生活着地で本文を太らせる。

v004.17では、NORA_CORE のこの火力を本文主エンジンとして採用し、PW90 の正規ゲートで棚荒らしを防ぐ。

## 本文前施工台

本文開始前に、話パックをそのまま書き始めない。
必ず以下へ並べ替える。

```text
核
物
位置
手元
反応差
順番
残す物
生活着地
```

この施工台は、設計確定案ではない。
本文へ突っ込む燃料を、燃える順に置き直すための作業台である。

## NORA_CORE で許可する本文燃料

話パックに明示された条件だけでなく、条件同士の間に自然発生する局所具体を本文燃料として使用してよい。

許可対象:

```text
小物
位置
手元
視線
沈黙
反応差
身体感覚
通れる幅
置く前と置いた後の空気差
小物の意味変化
生活余波
次の火種
```

ただし、これらは正規条件ではなく BODY_LOCAL として扱う。

## BODY_LOCAL の条件

本文内で追加する局所具体は、以下をすべて満たす場合に許可する。

```text
話パックの核を強める
frozen条件と矛盾しない
人物関係を壊さない
世界設定を書き換えない
次話以降へ勝手な義務を発生させない
必須条件の代替品にならない
その場面内で自然に閉じる
```

## 追加要素の分類

本文中に増えた要素は、本文後LOGで必ず分類する。
未分類のままSUCCESSにしない。

```text
BODY_LOCAL:
  本文内だけで完結する局所具体。固定しない。

RETURN_CANDIDATE:
  設計さん・執筆さん・修正刃さまへ戻す価値がある材料。

FIXED_CANDIDATE:
  正規化候補。ただしユーザー明示または設計側検収まで未固定。

WARN:
  人物増殖、小物増殖、便利化、核奪取、話パック外肥大の危険。

DISCARD:
  気持ちよいが固定すると邪魔な偶発要素。
```

## 野良ちゃん由来の禁止

NORA_CORE を採用しても、以下は禁止する。

```text
野良ちゃん口調を本文へ感染させる
レイヤー名や検証語彙を本文へ露出させる
試走要素を正規固定として扱う
正本・投稿稿・検証済みV2の顔をする
新設定で必須条件を置き換える
便利な制度や新人物で解決する
人物増殖で本文火力を稼いだまま分類しない
```

## PW90_GUARDRAIL

NORA_CORE が本文を書いても、PW90監査を通るまでは SUCCESS ではない。

必要監査:

```text
preTextPickup ledger
sceneConstructionPlan
coverage_table
sceneExecution
thinnessAudit
textScaleAudit
full_convergence_sweep
NORA addition classification
under15kFullBurnProof when under 15K
```

## 成功条件

SUCCESS候補にできるのは、以下を満たした時のみ。

```text
話パック条件が本文内で仕事している
BODY_LOCALが核を強め、破綻していない
追加要素が本文後に分類されている
固定層が圧縮されていない
熱量層が値引きされていない
読める一話で閉じていない
残燃料がない
PW90の全監査が閉じている
```

