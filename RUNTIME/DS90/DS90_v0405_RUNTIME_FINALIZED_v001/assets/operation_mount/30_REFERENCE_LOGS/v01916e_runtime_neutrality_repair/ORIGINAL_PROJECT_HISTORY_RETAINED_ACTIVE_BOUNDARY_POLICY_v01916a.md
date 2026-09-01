# PROJECT_HISTORY_RETAINED_ACTIVE_BOUNDARY_POLICY v019.16a

STATUS: CURRENT_SPEC
APPLIES_TO_RUNTIME: v019.16a-NLCORE-HISTORY-RETAINED-ACTIVE-ROUTE-LOCKED
SUPERSEDES_ACTIVE: PROJECT_HISTORY_SHELF_POLICY_v01915.md

この版では、`DS90_SOURCE_RUNTIME_v019_13b_SELF_CONTAINED_PROCESS_LOCKED` を履歴保持マスターとして扱う。
履歴棚を削って軽量化する方向は、設計思想・禁止線・判断理由ごと落ちるため採用しない。

## 方針

- 履歴・思想・判断理由・事故ログ・版境界は保持する。
- 正規active routeは現行一本道に保つ。
- `PROJECT_HISTORY_SHELF` は保持し、`PROJECT_CONTEXT_SHELF` へ置換しない。
- 通常実行では履歴で動かない。
- MOUNT_TRANSFER、棚更新、版上げ、差し替え判断、別個体引継ぎ、再施工監査では履歴棚を参照する。
- 履歴棚を本文材料・話材・設定補完の源にしてはならない。

## 保持するもの

```text
なぜその思想になったか
何を捨てたか
何を禁止にしたか
どの判断が固定されたか
次の版上げで参照する思想ログ
修理経緯
事故ログ
旧source floor
reference logs
change logs
file lists
```

## active routeへ混ぜないもの

```text
過去版実装そのもの
旧ランタイム一式の実行導線
旧pathをcurrent path扱いすること
旧STOPを現行STOPへ無検証に復活させること
比較治具
NOM / MPN / comparison
```

## v019.16a master reapply rule

v019.16aでは、v019.13bを履歴保持マスターとして扱い、v019.14/v019.15で必要になった後施工を再施工する。
14g/15系で得た着地点は参照するが、履歴削除・思想削除を母体にはしない。

## 固定

コード、棚構造、ファイル名、検査実装、テンプレ実体は可変。
思想、禁止線、責任境界、判断基準、工程目的は不変。

版上げ時は旧実装を無条件移植しない。
旧実装が守っていた思想を読み、現行構造で再実装する。
履歴を消して身軽になることより、次個体が思想を捨てないことを優先する。
