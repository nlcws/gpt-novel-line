# 089_DS_TAG_SEARCH.md
# DS90 v0401 / TAG SEARCH + CURRENT SOURCE LOCATOR

区分: 補助制御 / project knowledge locator
版: v0401_current_source_locator
更新日: 2026-08-17

## 0. 固定関係

```txt
棚 = 実体・正本
TAG = 意味札
PKDB = TAGと棚実体の紐付け
SEARCH = 問い合わせ
INDEX = 何がどこにあるか解決
```

DS90自身がINDEX / SEARCHを保持し、PKDBへ自然文の検索判断を委譲しない。

## 1. standard route

```txt
user request
-> DS90 search intent
-> machine intent
   SEARCH_TERM / ALIAS / CANONICAL_NAME / RECORD_ID / LOGICAL_ID
-> K01 PKDB ACCESS
-> SOURCE locator record
   payload.locator = current project mount relative path
-> K04 SHELF_READ
-> current shelf bytes verify/read
-> design / check / card / log
```

`search.query` は表示用検索意図。実行には `search.intents[]` が必要。

## 2. schema-legal locator record

resident `PKDB_RECORD_SCHEMA_v004` は新規 `payload.shelf_pointer` を許可しない。v0401 standardはschemaを変更せず、既存SOURCE shapeを使う。

```txt
record_type         = SOURCE
aliases[]           = alias
search_terms[]      = TAG / reverse lookup term
payload.source_role = PRIMARY / SECONDARY等の既存値
payload.locator     = current project mount relative path
payload.sha256      = 対象source bytesのSHA-256
payload.media_type  = optional trusted media type
payload.selection   = optional existing schema field
```

SOURCE locator recordは場所を示すmetadataであり、作品正本ではない。必ずK04で実棚を読む。

## 3. locator boundary

K04 current locatorとして許可する `payload.locator` はcurrent project mount相対pathのみ。

禁止:

- absolute path
- `..` traversal
- URI
- `legacy-archive://...`
- `runtime-archive://...`
- archive内addressをcurrent shelf扱い

URI/archive SOURCE locatorはprovenance/fallback側であり、明示fallback時のK02 SOURCE_MATERIALIZEにだけ使える。

## 4. shelf operation

021_G / 022_B / 024_V / 028_H / その他既存棚は通常project semantic shelf。DBのために削除・薄型化・置換しない。

## 5. compatibility TAG_INDEX

旧TAG_INDEXテンプレ/分類資産は棚側互換入口として保持できるが、project全文をローカル巨大graphへ再構築することを要求しない。不一致は自動上書きせずHOLD/repair proposalへ送る。

## 6. STOP

- machine intent未確定
- required lookup unresolved / ambiguous / conflict
- schema-legal current SOURCE locatorなし
- unsafe / URI / archive locatorをcurrent authority化
- current shelf未読
- TAGだけで未確認を確定
- TAGだけで設計完了
- PKDB payloadを作品正本化
- DS90による直接commit / records.jsonl直編集

## 7. repair

index / tag / alias / current SOURCE locator補修はproposal-only。DB commit authorityはMT00/Nulのみ。
