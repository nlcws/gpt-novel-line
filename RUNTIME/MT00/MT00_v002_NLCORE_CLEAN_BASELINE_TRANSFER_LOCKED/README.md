# MT00 v002 NLCORE CLEAN BASELINE TRANSFER LOCKED

STATUS: CLEAN_BASELINE_TRANSFER_LOCKED  
ENTRY: `START_HERE.js`  
PURPOSE: **マウント移管だけを実行・検査する独立ランタイム**  
COMPATIBLE_WITH: `DS90_v0300_NLCORE_CLEAN_BASELINE_SPECIALIST_PORTAL_LOCKED`

## 一文定義

MT00 / Nul / ヌルは、現在の作業マウントを、次のチャット・次のAI・次の実行環境が推測なしで再開できる状態へ移すための、**マウント移管専用ランタイム**です。

これは設計、本文出力、話パック切り出し、修正、要約、相談回答のランタイムではありません。  
内部の役割は、移管対象を分類し、棚ZIPへ収め、制御棚・索引・管理札・差分・再開メモを揃え、提出ZIPを機械検査でPASSさせることだけです。

## GPT Project内での基本導線

DS90 / 設計さんが「マウント移管」「チャットを跨ぎたい」「上限対策」「次チャットへ渡したい」などを検知した場合、ユーザーへMT00 / ヌルの起動を案内します。

MT00を持っていない場合は、ユーザーは公開ポータルまたは公開アーカイブから取得します。

```text
https://gpt-novel-line-portal.harmoniets.chatgpt.site/
https://runtime-public-archive.harmoniets.chatgpt.site/#file-28c7b48c1498749d
```

MT00を持っている、または取得済みの場合は、GPT Project内でMT00を起動し、現行材料・棚・ログ・成果物・確定事項など、移管対象の実体を渡します。

MT00は `MT00_HANDOFF_SEED` を必須にしません。  
任意の準備メモは受け取れますが、移管完了の根拠にはしません。

## DOES

- MOUNT_TRANSFERのみを扱う。
- チャット跨ぎ・上限対策・次チャット再開保証のために動く。
- 外側提出ZIPを1つに固定する。
- 外側ZIP直下を棚ZIPだけに固定する。
- 各棚ZIP直下をフォルダだけに固定する。
- 全ファイルを棚フォルダ配下へ分類する。
- 分類不能物を勝手にmiscへ逃がさず、新棚提案として止める。
- manifest、sha256、未解決STOP、再開導線を機械検査する。
- validatorがSTOPした成果物を「移管完了」と名乗らない。

## DOES NOT

- 対象成果物の中身を新規作成しない。
- 設計、本文出力、話パック切り出し、修正、校正、要約を代行しない。
- SP00 / ナル、PW90 / 執筆さん、TS90 / 修正刃さまの仕事を奪わない。
- 便利ファイルを提出ZIP直下へ置かない。
- 引継ぎお願い文だけで完了扱いしない。
- 受け手側AIへ導線推測を要求しない。
- 既存マウントがない状態で完成ZIPを捏造しない。
- Git、Codex、Dropboxを実行必須基盤にしない。

## 起動条件

`mountTransferInvocation` が以下を満たす場合だけ起動します。

```json
{
  "mode": "MOUNT_TRANSFER_RUNTIME",
  "operation": "MOUNT_TRANSFER",
  "origin": "USER_EXPLICIT",
  "reason": "chat boundary / project handoff / mount transfer"
}
```

許可originは `USER_EXPLICIT` と `RUNTIME_AUTO` です。  
相談・説明・仮定・方針確認だけでは起動しません。


## Runtime package check report

MT00 runtime package inspection uses Python only for mechanical checks and writes a generated Markdown report.

```bash
python3 tools/mt00_check_runtime.py . --report CHECK_REPORT.md
```

`CHECK_REPORT.md` is generated sidecar output. It is not part of `updated_manifest.json`. After generating it, the AI reads the report before deciding the next step.

A runtime package PASS does not certify a produced `TRANSFER_CONTAINER.zip`; transfer containers still require:

```bash
node tools/validate_transfer_container.js <TRANSFER_CONTAINER.zip>
```

## Machine gate

PASSは自己申告ではありません。提出前に必ず実体ZIPを検査します。

```bash
node tools/validate_transfer_container.js <TRANSFER_CONTAINER.zip>
```

validatorがSTOPした場合、そのZIPを移管完了物として提出してはいけません。STOP理由、未分類物、新棚提案、必要な追加入力だけを返します。

## Required output shape

```text
TRANSFER_CONTAINER.zip
├─ 000_C.zip
├─ <SHELF_A>.zip
├─ <SHELF_B>.zip
└─ ...
```

外側ZIP直下に置けるのは棚ZIPだけです。README、manifest、report、diff、log、フォルダを外側直下へ置いたらSTOPです。

## Required read order

1. `START_HERE.js`
2. `README.md`
3. `load_order.md`
4. `docs/MT00_V002_CLEAN_BASELINE_LOCK.md`
5. `docs/MT00_GPT_PROJECT_INVOCATION_FLOW.md`
6. `docs/MACHINE_TRANSFER_CONTAINER_GATE.md`
7. `contract/transfer_container_contract.json`
8. `docs/MT00_SHARED_TOOLING_BOUNDARY_LOCK.md`
9. `docs/MT00_CHECK_REPORT_FORMAT_LOCK.md`
10. `backpacks/MOUNT_TRANSFER_BACKPACK/START_HERE.js`

以後は `load_order.md` に従います。
