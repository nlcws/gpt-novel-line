# START_HERE

## IMAGE_RUNTIME BOOT v005

画像生成または画像編集依頼を受けた時だけ起動する。

### BOOT-01 / REQUEST
判定:
- NEW_IMAGE
- EDIT_IMAGE

編集の場合、編集対象画像の実体が存在しなければSTOP。

### BOOT-02 / PROJECT SOURCES
そのProjectの現行マウントZIP群を実読する。

今回必要な:
- 対象人物
- キャラ正本
- 衣装
- 小物
- 世界・場所
- 設備
- 行動
- 物理関係
- 鏡・ガラス・水面・金属等の反射面
- 身長・体格
- 禁止事項

を抽出する。

過去会話記憶だけで代用しない。

### BOOT-03 / OPTIONAL IMAGE MOUNT
`IMAGE_RUNTIME_MOUNT` が存在する場合だけ読む。

優先:
1. `00_RULES/PROJECT_IMAGE_RULES.md`
2. `00_RULES/CHARACTER_PRIORITY.md`
3. 今回必要な画像基準資料

不存在:
`OPTIONAL_IMAGE_MOUNT = ABSENT_OK`

### BOOT-04 / MODE
明示的な宣材・集合写真・プロフィール撮影等でなければ:

`COMPOSITION_MODE = ACTION_CROP`

明示的撮影依頼:
`COMPOSITION_MODE = PROMO_STAGED`

### BOOT-05 / WORLD FIRST
`COMPOSITION_MODEL.md` の順で組む。

1. WORLD
2. PHYSICS
3. ACTION
4. CAMERA
5. CROP

人数を画面サイズから逆算しない。

### BOOT-06 / READY CHECK
確認:

- Projectを特定できる
- 今回必要な正本を読んだ
- 人物・設備・道具を識別できる
- 世界内の位置関係が成立する
- 行動が物理的に成立する
- 依頼と正本が衝突していない
- EDITなら編集元画像がある

成立:
`IMAGE_GENERATION_READY`

不足:
推測補完せずSTOPし、不足だけ返す。

### BOOT-07 / PRE-GENERATION REVIEW

生成・編集前に、今回の条件をユーザーへ整理して提示する。

最低限:

- MODE
- 対象人物 / 人数
- WORLD / 場所
- PHYSICS / 位置関係・設備・道具
- ACTION / 行動
- CAMERA / カメラ位置
- CROP / 画角・フレームアウト方針
- CANON / 正本維持条件
- PRESERVE / CHANGE（編集時）
- PROHIBITED / 禁止事項
- 不確定事項

を短く明示する。

この時点では画像生成ツールを呼ばない。

状態:
`WAIT_FOR_USER_APPROVAL`

ユーザーが修正を返した場合:
条件整理を更新し、再度 `WAIT_FOR_USER_APPROVAL`。

ユーザーが承認した場合だけ:
`IMAGE_GENERATION_APPROVED`

### BOOT-08 / GENERATE
`IMAGE_GENERATION_APPROVED` が成立した後にだけ、
完成画像を1枚だけ生成または編集する。

初回依頼文だけを承認として扱わない。
条件整理提示前に生成へ直行しない。

### BOOT-09 / POST CHECK
最低限:

- 正本キャラ逸脱
- 世界位置関係破壊
- 物体途中消失
- 道具・設備の増殖 / 変形
- 動作方向破綻
- フレームアウトと破損の混同
- 全身押し込み
- 不要な横並び
- カメラ都合の瞬間移動
- 鏡像・反射像の別人化 / 別ポーズ / 別世界化
- 反射角度・鏡枠・遮蔽の破綻
- 頼まれていない図解 / UI化

問題がある場合はPASS扱いしない。
