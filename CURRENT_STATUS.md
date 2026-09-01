# CURRENT STATUS

GPT小説執筆ライン公開棚の現在状況です。

このファイルは、GitHub公開棚の現在の顔を示すためのものです。Runtime本体の正本はGitHub内の古いZIPではなく、オンラインのRuntime Public Shelfを優先します。

## 現在確認できた公開導線

| 対象 | 状態 | URL | 確認範囲 |
| --- | --- | --- | --- |
| Portal | active / public / Sites v57 | https://gpt-novel-line-portal.harmoniets.chatgpt.site/ | Sites状態確認 |
| Runtime Public Shelf | active / public / Sites v19 | https://runtime-public-archive.harmoniets.chatgpt.site/ | Sites状態確認と公開ページ実読 |
| Public Release Policy | Portal配下 | https://gpt-novel-line-portal.harmoniets.chatgpt.site/public-release-policy | URL導線として確認。本文の法的解釈は追加しない |
| note | 公開ページあり | https://note.com/gpt_novel_line | 公開ページ到達確認 |
| GitHub公開棚 | public repository | https://github.com/nlcws/gpt-novel-line | GitHub APIで現行main確認 |

## 現行Runtimeの扱い

2026-09-01時点で、オンラインのRuntime Public Shelf上に以下を確認しています。

- `ACTIVE_LAYER_DEFAULT: 400番台`
- `RUNTIME_LAYERS: 400番台 / 300番台`
- `CANONICAL_ENTRY: /START_HERE_ONLINE_RUNTIME.txt`
- Runtime lines: DS90 / PW90 / TS90 / NW22
- Infra lines: MT00 / SP00 / MT00_BOOTSTRAP_EA
- 021_G / 022_B / 024_V / 028_H は初期GPT Project配置棚であり、Runtime canon replacementではない

GitHub README、INDEX、CURRENT_STATUS、RUNTIME_ZIP READMEでは、オンラインRuntime Public Shelfを現在の正本導線として案内します。

## GitHub公開棚の役割

このリポジトリは、以下を置く公開棚です。

- 外部検索から来た人向けの玄関
- Portal / Runtime Public Shelf / Public Release Policy / note への導線
- 過去のGitHub配布ZIP記録
- Runtime関連の参照用資料
- 公開方針と更新履歴

GitHubをRuntime本体の新しい正本へ昇格しません。GitHub上に残っているZIPは、オンラインRuntime Public Shelfより古い可能性があります。

## GitHub上のRuntime ZIP記録

`RUNTIME_ZIP/` には、GitHub上で過去に配布したZIPが残っています。これは現在のRuntime Public Shelf v19 / 400番台と同一であるとは確認していません。

| GitHub path | 扱い |
| --- | --- |
| `RUNTIME_ZIP/DS90_v0300_CLEAN_BASELINE_FINALIZED_v002.zip` | GitHub旧配布記録 |
| `RUNTIME_ZIP/PW90_v004_21c_NLCORE_STABLE_LOCKED.zip` | GitHub旧配布記録 |
| `RUNTIME_ZIP/TS90_v001_15_NLCORE_STABLE_LOCKED.zip` | GitHub旧配布記録 |
| `RUNTIME_ZIP/NW22_v002_5_NLCORE_STABLE_LOCKED.zip` | GitHub旧配布記録 |
| `RUNTIME_ZIP/MT00_BOOTSTRAP_EA_v001_GPT_PROJECT_FIRST_TRANSFER_BASELINE_FINALIZED_v001.zip` | GitHub旧配布記録 |
| `RUNTIME_ZIP/MT00_v002_CLEAN_BASELINE_TRANSFER_FINALIZED_v002.zip` | GitHub旧配布記録 |
| `RUNTIME_ZIP/SP00_v002_CLEAN_BASELINE_STORY_PACK_FINALIZED_v001.zip` | GitHub旧配布記録 |

最新版を読む場合は [Runtime Public Shelf](https://runtime-public-archive.harmoniets.chatgpt.site/) の400番台を確認してください。

## Runtime関連ディレクトリ

GitHub APIで、以下のRuntime関連ディレクトリが存在することを確認しています。

- `RUNTIME/DS90`
- `RUNTIME/PW90`
- `RUNTIME/TS90`
- `RUNTIME/NW22`
- `RUNTIME_ZIP/`
- `RUNTIME_PDF/`

これらはGitHub公開棚の参照資料です。オンラインRuntime Public Shelfの現行正本より優先しません。

## 公開方針

現在の公開方針は以下を維持します。

**Free Runtime. Free Use. No Attribution Required. Use at Your Own Responsibility.**

改変、再配布、商用利用、再構成、再公開、派生物公開を妨げない方針です。ただし、利用、保守、法令順守、公開判断、サポート等は利用者側の責任です。

このファイルでは新しいライセンス解釈や法的保証を追加しません。

## 非公式プロジェクト

GPT小説執筆ラインはOpenAI公式のプロジェクトではありません。OpenAI、ChatGPT、GPT各モデルの提供元による承認、監修、保証を受けたものではありません。

## 未確認事項

- GitHub上の旧ZIPとRuntime Public Shelf v19 / 400番台の全ファイル同一性は、この更新では確認していません。
- Public Release Policy本文の法的保証やライセンス解釈は、このGitHub更新では拡張していません。
- Sites本体の編集・deployは、このGitHub更新とは別工程です。
