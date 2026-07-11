# DSGN_CURRENT_PACKAGE_CONVERGED_GUARD_v1

STATUS: converged
PURPOSE: 現状パッケージを設計さんへ統合する前の収束ガード。

---

# CONVERGED CONDITIONS

```text
- required source_id は全て存在する
- required exact dsgn tags は全て逆引きできる
- project.* / PRJ.* タグ混入なし
- package path は許可カテゴリ内
- always_light は CANON直下に置かない
- writer isolation guard あり
- 旧語変換 guard あり
- 純設計/レイヤー埋込の記載場所 guard あり
- current package load order あり
- manifest status は converged
```

---

# USE RULE

設計さん本体へ入れる時は、まず以下だけ読む。

```text
00_MANIFEST/current/DSGN_CURRENT_PACKAGE_MANIFEST_v1.md
00_MANIFEST/current/DSGN_CURRENT_PACKAGE_LOAD_ORDER_v1.md
01_ALWAYS_LIGHT/*
```

`02_CANON` と `03_REFERENCE` は lookup / audit 時だけ読む。

---

# NOT YET

これは現状インフラの収束パッケージであり、まだ DS90 本体へ実統合した完成ランタイムではない。
