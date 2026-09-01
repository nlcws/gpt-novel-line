# NAMING_RULES

## 0. 目的
画像資料名を見ただけで、人物・用途・版・状態を判断しやすくする。

厳密な一形式への強制はしない。
既存Projectの命名文化がある場合はそちらを優先してよい。

---

## 1. 推奨基本形

```text
<CHARACTER>_<TYPE>_<DETAIL>_vNNN.<ext>
```

例:
```text
SEKKEI_BASE_THREEVIEW_v001.png
SEKKEI_COSTUME_NORMAL_v002.png
NORA_BASE_STANDING_v003.png
SHUUSEI_ACCESSORY_TOOLSET_v001.png
```

日本語名運用でもよい:

```text
設計さん_三面図_v001.png
設計さん_通常衣装_v002.png
野良ちゃん_基準立ち絵_v003.png
```

---

## 2. TYPE推奨語
- `BASE` / `基準`
- `THREEVIEW` / `三面図`
- `STANDING` / `立ち絵`
- `FACE` / `顔`
- `COSTUME` / `衣装`
- `PARTS` / `パーツ`
- `ACCESSORY` / `小物`
- `GROUP` / `複数`
- `EVENT` / `イベント`
- `ARCHIVE` / `旧`

---

## 3. バージョン
正本差し替えや意味のある更新時だけ上げる。

推奨:
```text
v001
v002
v003
```

単なるコピーや再圧縮だけで版を上げない。

---

## 4. 現行・旧版
現行資料:
- 通常棚へ置く

旧版:
- `05_ARCHIVE` へ移動
- 必要なら `_OLD_` / `_REPLACED_` / `_ARCHIVE_` を付ける

例:
```text
設計さん_三面図_v001_REPLACED.png
```

---

## 5. イベント差分
推奨:
```text
<CHARACTER>_EVENT_<EVENT>_vNNN
```

例:
```text
野良ちゃん_EVENT_ハロウィン_v001.png
設計さん_EVENT_お月見_v001.png
```

イベント資料がないことは異常ではない。

---

## 6. 複数人画像
人物名を無理に全部ファイル名へ詰め込まなくてよい。

例:
```text
GROUP_工房_読書の秋_v001.png
GROUP_設計さん_執筆さん_作業机_v001.png
```

人数が増える場合は場面名優先でよい。

---

## 7. 禁止
- `final_final2_new.png` のような意味不明な連番
- 正本と旧版が同じ場所・同じ名前で共存
- 用途不明の `image01.png`
- 版の根拠がない過剰なバージョン増加

---

## 8. 最優先
命名の美しさより、
**画像ランタイムが現行正本を取り違えないこと**を優先する。
