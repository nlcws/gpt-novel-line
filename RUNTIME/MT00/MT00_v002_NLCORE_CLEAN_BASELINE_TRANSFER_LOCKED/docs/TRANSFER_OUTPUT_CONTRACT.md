# TRANSFER OUTPUT CONTRACT

## PASS output

PASS提出は、validatorで検査可能な1つの `TRANSFER_CONTAINER.zip` のみ。

## 外側ZIP

許可: 棚ZIPファイル  
禁止: loose file、フォルダ、README、report、manifest、diff、log

## 制御棚

`000_C.zip` は必須。

必須ファイル:

- `00_READ_FIRST/TRANSFER_CONTAINER_MANIFEST.json`
- `01_VALIDATION/VALIDATION_REPORT.json`

## 棚ZIP

各棚ZIP直下はフォルダのみ。全ファイルはフォルダ配下に置く。

## PASS claim

manifestの `transferComplete` がtrueの場合、以下が必要。

- `unclassifiedItems` が空
- `unresolvedStopCount` が0
- `restartHandoff.nextAgentRestartReady` がtrue
- `restartHandoff.entrypoint` がある
- `restartHandoff.readOrder` が空でない
- manifest上の全sha256が実体ファイルと一致
