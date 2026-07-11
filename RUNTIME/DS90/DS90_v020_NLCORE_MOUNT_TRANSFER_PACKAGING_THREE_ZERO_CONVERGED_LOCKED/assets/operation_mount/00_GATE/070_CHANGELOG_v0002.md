# 070_CHANGELOG_v0002｜v0001 からの改修点
状態：CURRENT / CANON GATE

## v0002 で入れた修正

### 1. 正本の一本化
v0001 では、同じ意味の文書が複数箇所に散っていた。  
v0002 では、**`10_CANON/` のみを正本**とし、appendix / raw / archive を明示的に降格した。

### 2. 必読ゲートの一本化
v0001 では gate index と mount order の最低読了線が二重化していた。  
v0002 では `00_GATE/010_REQUIRED_READING.md` のみを必読ゲートとした。

### 3. 参照優先順位の固定
v0001 では、共通ZIP、作品ZIP、appendix、チャット指示の優先順位が読み手の善意に残っていた。  
v0002 では `00_GATE/020_REFERENCE_PRIORITY.md` で、工程支配と本文条件支配を分離して固定した。

### 4. 改版運用の固定
v0001 では、今後版が進んだ時の current / superseded / archive の扱いが曖昧だった。  
v0002 では `00_GATE/030_VERSION_STATUS.md` と `00_GATE/060_REVISION_POLICY.md` を新設した。

### 5. 標準カード規格の見通し改善
v0001 では、規格本文とテンプレ本体が同一ファイル内で混線しやすかった。  
v0002 では、規格本文を `150_STANDARD_CARD_SPEC.md`、テンプレ本体を `151_STANDARD_CARD_TEMPLATE.md` に分離した。

### 6. manifest 再生成
v0001 の manifest は件数と実ファイル一覧にズレがあった。  
v0002 では manifest を実ファイルから再生成し、ハッシュ付きで固定した。

### 7. archive の立場整理
旧版ZIPと原本ZIPを、現行運用の支配源ではなく、archive / raw として整理した。

---

## 執筆側評価

v0002 は、思想だけでなく管理骨まで通した。  
**執筆側から見て、実運用で崩れやすい箇所はこの版でかなり潰している。**  
ここから先は、設計側レビューでさらに締める余地はあるが、  
少なくとも「熱はあるが管理で崩れる」状態ではない。
