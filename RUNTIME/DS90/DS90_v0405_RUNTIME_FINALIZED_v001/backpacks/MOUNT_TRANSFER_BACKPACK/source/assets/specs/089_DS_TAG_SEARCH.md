# 089_DS_TAG_SEARCH.md
# DS90 v0400 / TAG SEARCH + CURRENT SHELF RESOLUTION

区分: 補助制御 / project knowledge locator
版: v0400_shelf_pkdb_tag_backend
更新日: 2026-08-17

## 0. 固定関係

```txt
棚 = 実体・正本
TAG = 意味札
PKDB = TAGと棚実体の紐付け
SEARCH = 問い合わせ
INDEX = 何がどこにあるか解決
```

TAGは検索導線であり、作品事実の正本根拠ではない。

v0400でDS90自身にINDEX / SEARCHを戻す。PKDBへ検索判断を委譲しない。

## 1. standard route

```txt
user request
-> DS90 search intent
-> machine intent
   SEARCH_TERM / ALIAS / CANONICAL_NAME / RECORD_ID / LOGICAL_ID
-> PKDB ACCESS
-> locator record
-> payload.shelf_pointer
-> K04 SHELF_READ
-> current shelf bytes verify/read
-> design / check / card / log
```

PKDB ACCESSへ自然文推論を依頼しない。

`search.query` は表示用の検索意図。実行には `search.intents[]` が必要。

例:

```json
{
  "query": "カイに関係する設定",
  "intents": [
    {"kind":"SEARCH_TERM","value":"#CHAR:カイ","required":true},
    {"kind":"ALIAS","value":"カイ","required":false}
  ]
}
```

## 2. locator record

PKDBは既存PKDB schemaを使う。v0400 standard locatorでは、少なくとも次を使う。

```txt
aliases[]      = alias
search_terms[] = TAG / reverse lookup terms
payload.shelf_id
payload.shelf_pointer
payload.source_pointer   # optional
```

必要最小限のrelationは許可する。

世界観全文、人物全文、プロット全文、話本文をlocator recordへ再構築しない。

## 3. pointer boundary

`shelf_pointer` はcurrent project mount相対pathでなければならない。

禁止:

- absolute path
- `..` traversal
- URI
- `legacy-archive://...`
- `runtime-archive://...`
- SOURCE filenameだけをcurrent shelf扱い

archive locatorはprovenanceでありcurrent sourceではない。

## 4. 301 shelf operation restore

021_G / 022_B / 024_V / 028_H / その他既存棚は通常のproject semantic shelfである。

021_GもDB専用棚・薄型棚へしない。

棚側は従来どおり、設計骨、長文設計、部章話、CURRENT、HOLD、話カード、話パック、話レイヤー、ひな形、SAMPLE/正規見本、原典参照、作品固有意味連鎖を保持できる。

DBのために棚を削らない。棚をDBで置換しない。

## 5. compatibility TAG_INDEX

`TAG_INDEX_TEMPLATE.txt` / `STOP_TAG_INDEX_TEMPLATE.md` / `TAG_INDEX_MACHINE_SCHEMA_v1.json` は301棚運用の意味分類と互換入口を保持する。

ただしv0400 standard backendはPKDBであり、project全文をローカル巨大index graphへ再構築することを要求しない。

古いTAG_INDEXが実在する場合、それは既存棚の検索補助として読める。PKDBとの不一致は自動上書きせずHOLD/repair proposalへ送る。

## 6. STOP

- machine intent未確定
- PKDB required clause unresolved
- ambiguous/conflict
- current shelf_pointerなし
- unsafe/archive pointer
- current shelf未読
- TAGだけで未確認を確定
- TAGだけで設計完了
- PKDB record本文を作品正本化
- PKDBのために既存棚を削除/薄型化

## 7. repair

index / tag / alias / pointer補修はproposal-only。

DS90はPKDB commit authorityを持たない。
