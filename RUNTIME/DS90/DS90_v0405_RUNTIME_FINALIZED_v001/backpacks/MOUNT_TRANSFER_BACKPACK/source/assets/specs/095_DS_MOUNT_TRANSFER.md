# 095_DS_MOUNT_TRANSFER.md

区分: v0400 shelf-restored specialist handoff / exception-only fallback
版: v0400_shelf_pkdb_tag_runtime

## 0. 役割

MOUNT_TRANSFERの通常所有者は、現行 `000_C/00_READ_FIRST/RUNTIME_DIRECT_DISPATCH.json` の `routes.MOUNT_TRANSFER` から解決した MT00 / Nul / ヌルである。DS90は移管要求を検知し、dispatch path/SHAを検証してMT00へ渡す。DS90内蔵MOUNT_TRANSFERはMT00不在またはユーザー明示時だけの例外fallbackである。

## 1. 再開入口

移管後の必須再開入口は `00_READ_FIRST/DS90_START_GATE.md`。続いて `DS90_START_GATE.json` と `RUNTIME_DIRECT_DISPATCH.json` を読む。物理021は必須入口ではない。

`resultControlHandoff` 必須欄:

- `entrypoint`
- `readOrder`
- `currentLocation`
- `unresolvedStops`
- `nextWork`

`entrypoint` は `00_READ_FIRST/DS90_START_GATE.md` 固定。`readOrder` は同ファイルを先頭にし、machine gateとdispatchを含む。必読参照は実在確認だけでなく実読済みでなければならない。

## 1.1 v0306 fallback boundary (v0304 cleanup inherited)

DS90 exception-only fallback does not rebuild a heavy project ENTITY/RELATION graph. v0400 restores the existing project shelf system; 021_G / 022_B / 024_V / 028_H remain normal shelves, while transfer structure/catalog checks remain logistics integrity checks.

## 2. PKDB境界

作品知識の通常正本はcurrent project shelf。PKDBはTAG / alias / pointer backendであり、棚を置換しない。DS90が成立させた新しいTAG・alias・pointer等のDB反映候補はproposalとして準備し、MT00がDB_COMMITTERとしてresident PKDB COREを用いてcommitする。MT00は作品意味を作らない。

SOURCE-only snapshotでは、SOURCE metadataは証拠選択にのみ使う。作品意味へ使う内容はSOURCE MATERIALIZE後の実バイトを読んでから判断する。

## 3. 旧棚境界

`021_G / 022_B / 024_V / 028_H` はv0400で通常のproject semantic shelfへ復帰する。棚番号だけで内容を推測せず、DS90 INDEX/SEARCH -> PKDB pointer -> current shelf実読で必要棚へ到達する。

## 4. 移管保持

- `000_C.zip` のSTART GATE / dispatch / resident runtime lanesを保持する。
- PKDB volumesはdeltaなしならbyte保持、deltaありならatomic commit後のsame-spec volumesを出す。
- unresolved STOPは0でなければPASS不可。
- 次個体へ導線推測を要求しない。
- 外側container、manifest、SHA、resident lane、restart handoffはMT00 machine validatorをsource of truthとする。

## 5. 禁止

- 物理021を再開必須条件へ戻す。
- 旧棚横断を通常知識取得へ戻す。
- SOURCE filename / locatorだけで意味を確定する。
- DS90またはMT00が未成立の意味を推測してDBへcommitする。
- validator STOP中に移管完了を名乗る。
- summary/restart memoだけを移管成果物にする。

## 6. 完了条件

通常routeではMT00自身の契約とmachine validatorがPASSし、C start gate/dispatch確認後、DS90 INDEX/SEARCH -> PKDB TAG backend -> current shelf routeへ再開できること。例外fallbackでは同じcontrol handoffを満たし、MT00-completeではないことを明示する。

## 7. 補助テンプレート境界

再開メモが必要な場合の形式参照は `assets/templates/RESTART_MEMO_TEMPLATE.txt`。再開メモ自体を起動入口・正本・移管完了根拠にはしない。
