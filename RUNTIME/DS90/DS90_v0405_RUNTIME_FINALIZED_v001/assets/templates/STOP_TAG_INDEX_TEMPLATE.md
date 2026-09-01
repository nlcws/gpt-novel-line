# STOP_TAG_INDEX_TEMPLATE.md
# 対象小説プロジェクト用 STOP_TAG_INDEX.md テンプレート

区分: STOP_TAG辞書テンプレート
役割: STOP_TAGの意味 / 適用範囲 / 解除条件
注意: これは作品本文ではない。
注意: 実際の `STOP_TAG_INDEX.md` は対象小説プロジェクト側へ置く。
注意: 090_DSへ作品固有STOP_TAG辞書を入れない。

---

## ルール

STOP_TAGは、作業対象の正本インデックス、棚インデックス、本文近接へ付ける。

GPTは、本文へ直行せず、対象インデックスのSTOP_TAGを確認してから本文へ進む。

未定義STOP_TAGは使わない。

同義STOP_TAGを増やさない。

重大な全域禁止はGLOBAL_STOPにも短文で残す。

STOP_TAGは正本根拠ではない。

STOP_TAGは危険線の検出導線である。

---

## エントリ形式

```txt
[STOP_TAG]
タグ:
表示名:
意味:
適用範囲:
付与先:
関連正本インデックス:
解除条件:
同義禁止:
備考:
```

---

## 例

```txt
[STOP_TAG]
タグ: #stop:no_chapter_drop
表示名: 章幕話へ降ろさない
意味: 明示許可と必要根拠が揃うまで、章・幕・話配置へ確定降下しない。
適用範囲: 設計中 / 未確認多 / 話数未固定
付与先: 021 / 章幕話関連INDEX / 必要時のみ再開メモのSTOP_TAG所在欄
関連正本インデックス: <project-root>/000_INDEX_MAP.md
解除条件: ユーザーが章幕話降下を明示し、LOCKと未確認を確認済みにした時。
同義禁止: #stop:no_story_drop など同義タグを増やさない。
備考: GLOBAL_STOPにも短文で残す。
```
