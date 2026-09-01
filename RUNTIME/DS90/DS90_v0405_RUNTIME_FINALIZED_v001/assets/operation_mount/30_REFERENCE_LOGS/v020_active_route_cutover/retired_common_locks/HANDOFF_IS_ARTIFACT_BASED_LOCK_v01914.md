# HANDOFF_IS_ARTIFACT_BASED_LOCK v019.14a

STATUS: CURRENT_SPEC
APPLIES_TO_RUNTIME: v019.15-NLCORE-HISTORY-MASTER-REAPPLY-LOCKED

ハンドオフはコード依存ではない。成果物依存である。

渡す側がどのコードで作ったかではなく、受け取る側が成果物を検査して受け取れるかを見る。

## 受け取り判定

```text
成果物ZIPがある
manifestが一致している
required readが解決する
内部住所が現ZIP内で解ける
工程証明がある
検査結果がPASSしている
STOP条件が現行思想に合っている
受け取り側の契約形式に合っている
```

## 禁止

```text
前版コードに依存して受け取る
生成手段を成果物契約より優先する
旧実装を正本根拠にする
コードが残っているだけで成果物PASS扱いする
```
