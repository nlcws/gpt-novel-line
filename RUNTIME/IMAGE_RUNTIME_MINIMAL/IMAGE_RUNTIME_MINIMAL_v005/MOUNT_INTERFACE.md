# MOUNT_INTERFACE v005

## 1. Required Project Sources

画像専用棚より先に、そのProjectの現行正本を読む。

Runtimeは:
- 特定棚番号
- 特定キャラ名
- 特定作品構造

をハードコードしない。

---

## 2. Optional Image Reference Mount

推奨:
`IMAGE_RUNTIME_MOUNT_TEMPLATE_v001.zip`

期待構造:

```text
00_RULES/
01_CHARACTER_BASE/
02_COSTUME_BASE/
03_EVENT_VARIANTS/
04_GROUP_REFERENCE/
05_ARCHIVE/
```

空棚可。

---

## 3. Read Policy

### WHEN PRESENT
- `00_RULES/PROJECT_IMAGE_RULES.md`
- `00_RULES/CHARACTER_PRIORITY.md`

### AS NEEDED
- `01_CHARACTER_BASE`
- `02_COSTUME_BASE`
- `03_EVENT_VARIANTS`
- `04_GROUP_REFERENCE`

### NOT BY DEFAULT
- `05_ARCHIVE`

---

## 4. No Mount

```text
optional_image_mount: ABSENT
decision: CONTINUE
source: PROJECT_CANON_ONLY
```

正常動作。

---

## 5. Project-specific Rules

Project側で:
- 撮影モード
- 画風
- 背景
- 特定設備
- 競技 / 作業物理
- 追加禁止事項

などを持ってよい。

ただしProject固有規則でも、
以下は破ってはならない:

- CANON_CHARACTER_LOCK
- PHYSICAL_RELATION_LOCK
- OBJECT_INTEGRITY_LOCK
- CROP_NOT_BREAK
