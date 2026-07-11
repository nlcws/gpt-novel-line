# INDEX_MAP_TEMPLATE.md
# 対象小説プロジェクト用 000_INDEX_MAP.md テンプレート

区分: 最上位索引テンプレート
役割: 多層インデックスの入口 / 棚ルーター
注意: これは作品本文ではない。
注意: 本文、要約、判断履歴、LOCK詳細を入れない。
注意: 実際の `000_INDEX_MAP.md` は対象小説プロジェクト側へ置く。

---

## ルール

最上位インデックスには、タグ、見出し、正本インデックスへのリンクだけを書く。

詳細は下位インデックスまたは正本ファイルへ置く。

作品ごとの多層化は許可する。

階層数は作品側で決める。

---

## エントリ形式

```txt
[INDEX]
タグ:
見出し:
正本インデックス:
STOP_TAG:
備考:
```

`備考:` は短文に限る。

備考へ要約、判断履歴、LOCK詳細を書かない。

---

## 例

```txt
[INDEX]
タグ: #overseas1 #law_state #outer_port
見出し: 海外1 / 法国家 / 外港
正本インデックス: 024_V_vXXX/OVERSEAS1_INDEX.md
STOP_TAG: #stop:no_four_group_overseas1 #stop:no_akito_rescue_plan
備考: 詳細は正本インデックスへ。
```
