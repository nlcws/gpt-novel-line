# 098_DS_INDEX.md
# DS90 v0400 SUPPORT INDEX / SHELF + PKDB TAG BACKEND

区分: 所在確認補助
版: v0400

## DS90 internal index

DS90は「そもそも何があったっけ？」を避けるため、INDEX / SEARCH能力を自身に保持する。

INDEXは作品正本ではない。INDEXは「何がどこにあるか」を解決する。

## project lookup

```txt
DS90 INDEX / SEARCH
-> PKDB TAG / alias lookup
-> current shelf_pointer
-> project shelf actual read
```

PKDBは場所を返すbackend。考える主体・採用主体はDS90。

## shelf roles

- `021_G`: 通常project shelf。設計骨、長文、部章話、CURRENT、HOLD等を保持可。
- `022_B`: 通常project shelf。
- `024_V`: 通常project shelf。
- `028_H`: 通常project shelf。
- その他既存棚: 301基本棚運用を維持。
- `000_C`: runtime / dispatch / mount-control。作品意味正本の代替ではない。
- `PKDB`: TAG / alias / pointer / reverse index backend。作品全文の代替ではない。

## lookup fields

PKDB schema上では主に次を使う。

- `aliases`
- `search_terms`
- `payload.shelf_id`
- `payload.shelf_pointer`
- `payload.source_pointer`
- 最小限relation/reference

## authority

TAG / INDEX / search result / short summary / alias は正本根拠ではない。

current shelfを読んだ内容がproject source/canon authorityとなる。

HOLD / UNKNOWNはHOLD / UNKNOWNのまま扱う。

## fallback

K02 SOURCE MATERIALIZEはv0309 hardening互換の明示fallback。標準routeではK04 SHELF_READを使う。
