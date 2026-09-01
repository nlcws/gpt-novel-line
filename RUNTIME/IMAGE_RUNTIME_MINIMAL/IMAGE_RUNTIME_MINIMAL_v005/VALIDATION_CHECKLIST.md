# VALIDATION_CHECKLIST v005

## Static
- [ ] 特定キャラ設定を内蔵していない
- [ ] ONE_IMAGE_ONLY
- [ ] WORLD_BEFORE_FRAME
- [ ] PHYSICAL_RELATION_LOCK
- [ ] OBJECT_INTEGRITY_LOCK
- [ ] ACTION_BEFORE_CAMERA
- [ ] CAMERA_DOES_NOT_REWRITE_WORLD
- [ ] CROP_NOT_BREAK
- [ ] 人数上限なし
- [ ] NO_FORCED_FULL_BODY
- [ ] NO_DEFAULT_HORIZONTAL_LINEUP
- [ ] DEPTH_AND_ANGLE_PRIORITY
- [ ] CANON_CHARACTER_LOCK
- [ ] REFLECTION_GEOMETRY_LOCK
- [ ] NO_DIRECT_GENERATION
- [ ] PRE_GENERATION_REVIEW_GATE
- [ ] WAIT_FOR_USER_APPROVAL before tool generation
- [ ] ACTION_CROP default
- [ ] PROMO_STAGED explicit exception
- [ ] optional mount ABSENT_OK
- [ ] EDIT target required
- [ ] obsolete MAX_THREE_CHARACTERS absent
- [ ] obsolete 4-person STOP absent

## Regression

### A / 5-person room scene
5人存在。
カメラには3人と残り2人の一部だけ。
期待: PASS。

### B / 10-person crowd
全員を同じ大きさで横並びにしない。
期待: PASS。

### C / sports
競技空間・設備・道具・運動方向を先に固定。
カメラ都合で選手を瞬間移動させない。

### D / workshop
机・椅子・工具・材料の物理を維持。
道具が画面端へ続くのは正常。

### E / crop
腕や道具が画面端から外へ続く。
期待: NORMAL_FRAME_OUT。

### F / break
道具が画面内で途中消失。
期待: FAIL。

### G / promo
ユーザーが集合宣材写真を明示。
期待: PROMO_STAGED。整列可。

### H / no image mount
Project正本のみ。
期待: CONTINUE。

### I / edit without target
期待: STOP。


### J / mirror, camera behind subject
人物が鏡を向き、カメラが背後。
期待:
直接像は背面主体。
鏡像は反射経路が成立する範囲で正面側が見える。
鏡像は同一人物・同一瞬間・同一ポーズ。

### K / mirror wrong duplicate
鏡像だけ別ポーズ・別衣装・別人。
期待: FAIL。

### L / text in mirror
文字や左右非対称小物あり。
期待:
反射幾何に従う。
鏡像だけ都合よく正向きにしない。

### M / reflective glass / water
窓ガラス・水面。
期待:
透過・波・粗さは許可。
ただし世界位置関係と反射元は維持。


### N / normal new image request
ユーザーが画像条件を一度に全部提示。
期待:
条件整理を提示。
画像生成はまだ行わない。
`WAIT_FOR_USER_APPROVAL`。

### O / user revises review
条件整理後にカメラ位置を修正。
期待:
条件を更新して再レビュー。
まだ生成しない。

### P / explicit approval
レビュー後にユーザーが承認。
期待:
`IMAGE_GENERATION_APPROVED`
その後に1枚生成。

### Q / edit request
編集対象・変更条件が明確でも、
期待:
PRESERVE / CHANGEを含む条件整理を先に提示してWAIT。


### R / mount template version consistency
README / MOUNT_INTERFACE / MANIFEST が
同じ初期マウント `IMAGE_RUNTIME_MOUNT_TEMPLATE_v001` を指す。
期待: PASS。

### S / manifest self exclusion
`MANIFEST.json` 自身は files 配列から除外。
ただし `manifest_self_excluded: true` を明示し、
package_entry_count = listed_file_count + 1。
期待: PASS。

### T / manifest hash integrity
files列挙全件の bytes / sha256 が実体一致。
期待: PASS。
