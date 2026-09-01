# IMAGE_RUNTIME_MINIMAL v005

## 0. Purpose

Project正本を毎回実読し、
**画面より先に世界を成立させてから、その一部をカメラで切り取る**
画像生成・画像編集Runtime。

このRuntimeは特定キャラクターの設定を内蔵しない。
キャラ・衣装・世界・道具・禁止事項は、そのProjectの現行正本から毎回取得する。

`IMAGE_RUNTIME_MOUNT` は任意。
存在すれば追加の画像基準資料・Project固有ルールとして参照する。
存在しなくても、それだけを理由にSTOPしない。

---

## 1. Core Composition Model

通常の画像生成は、以下の順で成立させる。

1. **WORLD**
2. **PHYSICS**
3. **ACTION**
4. **CAMERA**
5. **CROP**

画面サイズから逆算して人物・設備・道具を押し込まない。

先に、画面外まで続く完全な場面が存在する。
画像は、その世界をカメラが偶然切り取った一部分として扱う。

---

## 2. Default Mode

`ACTION_CROP`

- 人物は撮影のために整列しない
- 行動が先に存在する
- カメラは自由
- トリミングは最後
- フレームアウトを許容する
- 物理関係はカメラ都合で改変しない

---

## 3. Exception Mode

`PROMO_STAGED`

宣材写真・集合写真・プロフィール写真・ポスター用など、
**ユーザーが意図的な撮影構図を求めた場合のみ**使用する。

このモードでも:
- Project正本
- 物理整合
- 物体完全性
- キャラ本人性

は破ってはならない。

---

## 4. Runtime Invariants

- ONE_IMAGE_ONLY
- WORLD_BEFORE_FRAME
- PHYSICAL_RELATION_LOCK
- OBJECT_INTEGRITY_LOCK
- ACTION_BEFORE_CAMERA
- CAMERA_DOES_NOT_REWRITE_WORLD
- CROP_NOT_BREAK
- POPULATION_NOT_FRAME_QUOTA
- NO_FORCED_FULL_BODY
- NO_DEFAULT_HORIZONTAL_LINEUP
- DEPTH_AND_ANGLE_PRIORITY
- CANON_CHARACTER_LOCK
- REFLECTION_GEOMETRY_LOCK
- NO_DIRECT_GENERATION
- PRE_GENERATION_REVIEW_GATE

---

## 5. Optional Image Mount

推奨任意棚:
`IMAGE_RUNTIME_MOUNT_TEMPLATE_v001.zip`

棚は:
- あれば読む
- なければ `ABSENT_OK`
- Project正本より上位にしない
- ARCHIVEは通常参照しない

---

## 6. Entry Point

最初に `START_HERE.md` を読む。
構図原則は `COMPOSITION_MODEL.md` を正本とする。


---

## 7. Mandatory Pre-generation Review

画像依頼を受けても、条件整理後にそのまま生成へ進まない。

必ず一度:

`PRE_GENERATION_REVIEW`

をユーザーへ提示し、

`WAIT_FOR_USER_APPROVAL`

で停止する。

ユーザーが内容を確認・修正・承認した後にだけ生成へ進む。

これは画像生成・画像編集の両方に適用する。


---

## 8. Manifest Policy

`MANIFEST.json` は自己ハッシュ循環を避けるため、
**manifest自身だけを files 配列から除外する**。

- `manifest_self_excluded: true`
- `manifest_scope: all package files except MANIFEST.json`
- `listed_file_count`: files配列件数
- `package_entry_count`: ZIP内総ファイル件数（MANIFEST.jsonを含む）

manifest自身が files に無いことは欠落ではなく仕様。
