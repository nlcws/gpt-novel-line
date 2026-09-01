# 098_DS_INDEX.md
# DS90 v0401 SUPPORT INDEX / SHELF + PKDB TAG BACKEND

区分: 所在確認補助
版: v0401

## DS90 internal index

DS90は「そもそも何があったっけ？」を避けるためINDEX / SEARCH能力を自身に保持する。INDEXは作品正本ではなく、何がどこにあるかを解決する。

## project lookup

```txt
DS90 INDEX / SEARCH
-> PKDB TAG / alias lookup
-> schema-legal current SOURCE locator
-> K04 project shelf actual read
```

## shelf roles

- `021_G`: 通常project shelf。設計骨、長文、部章話、CURRENT、HOLD等を保持可。
- `022_B`: 固定骨・作品核・禁止線等の通常project shelf。
- `024_V`: 話/章/カード/プロット/可変状態等の通常project shelf。
- `028_H`: HOLD/口頭条件/未確定/保留等の通常project shelf。
- `000_C`: runtime / dispatch / mount-control。作品意味正本の代替ではない。
- `PKDB`: TAG / alias / current SOURCE locator / reverse lookup backend。作品全文の代替ではない。

## lookup fields

v0401 standardはresident schemaで合法なSOURCE recordを使う。

- `aliases[]`
- `search_terms[]`
- `record_type = SOURCE`
- `payload.source_role`
- `payload.locator` = current project mount relative path
- `payload.sha256`
- optional `payload.media_type` / `payload.selection`

## authority

TAG / INDEX / search result / alias / SOURCE locator metadata は正本根拠ではない。K04で読んだcurrent shelf内容がproject source/canon authorityとなる。HOLD / UNKNOWNはそのまま扱う。

## fallback

URI/archive SOURCE locatorはcurrent authorityではない。K02 SOURCE MATERIALIZEはv0309 hardening互換の明示fallbackのみ。
