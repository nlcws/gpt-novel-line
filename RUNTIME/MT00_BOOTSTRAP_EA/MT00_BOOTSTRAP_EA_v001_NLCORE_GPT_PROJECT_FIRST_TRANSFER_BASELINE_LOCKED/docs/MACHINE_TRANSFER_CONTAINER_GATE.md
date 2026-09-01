# MACHINE TRANSFER CONTAINER GATE

MT00は、移管完了を自然文では判定しない。提出ZIPの実体を検査し、PASSしないものは次環境へ渡さない。

## Validator

```bash
node tools/validate_transfer_container.js <TRANSFER_CONTAINER.zip>
```

## Required

- 外側提出ZIPは1つだけ。
- 外側ZIP直下は棚ZIPファイルだけ。
- 外側ZIP直下にREADME、report、manifest、diff、log、フォルダを置かない。
- `000_C.zip` を必ず含める。
- 制御棚内に `00_READ_FIRST/TRANSFER_CONTAINER_MANIFEST.json` を置く。
- 制御棚内に `01_VALIDATION/VALIDATION_REPORT.json` を置く。
- 各棚ZIP直下はフォルダだけ。
- 全ファイルは棚フォルダ配下。
- manifestは全棚ZIPと全ファイルを列挙し、sha256を実体と一致させる。
- 未分類物、未解決STOP、再開不能が残る場合はPASS不可。

## Principle

AIの「完了しました」は証拠ではない。  
validatorのPASSと、実体ZIPの構造・hash一致だけを移管完了の根拠にする。
