# CHANGELOG

## 記録形式

```text
### YYYY-MM-DD
- 対象:
- 変更:
- 理由:
- 影響:
```

---

### 2026-08-30
- 対象: IMAGE_RUNTIME_MOUNT_TEMPLATE
- 変更: v001 初期構成作成
- 理由: Projectごとの画像Runtime専用任意棚を標準化
- 影響: 全棚

### 2026-09-01
- 対象: IMAGE_RUNTIME_MOUNT_TEMPLATE v001
- 変更: 共通ルールの「最大3人」ハード上限を撤去し、人数上限なしへ同期
- 理由: 現行 IMAGE_RUNTIME_MINIMAL v005 の POPULATION_NOT_FRAME_QUOTA / 人数上限撤廃と整合させるため
- 影響: README / 00_RULES/IMAGE_RUNTIME_RULES.md
- 備考: v001 は新規マウントの初期状態を示す論理版であり、この保守修正では版番号を上げない
