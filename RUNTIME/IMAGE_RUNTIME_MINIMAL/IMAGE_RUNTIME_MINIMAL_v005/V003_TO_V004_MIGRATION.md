# V003_TO_V004_MIGRATION

## Added
- NO_DIRECT_GENERATION
- PRE_GENERATION_REVIEW_GATE
- WAIT_FOR_USER_APPROVAL
- IMAGE_GENERATION_APPROVED

## Core Change

旧:
依頼 → 正本読込 → 条件整理 → 生成

新:
依頼
→ 正本読込
→ WORLD / PHYSICS / ACTION / CAMERA / CROP
→ **条件整理をユーザーへ提示**
→ **WAIT**
→ 承認 / 修正
→ 承認後だけ生成

## Reason

画像は、条件整理自体が正しくても
ユーザー意図とのズレをそのまま画像へ固定すると修正コストが高い。

そのため画像ラインだけは
**生成前に明示的なレビュー境界を持つ。**
