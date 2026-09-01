# CURRENT STATUS

GPT小説執筆ライン公開棚の現在状況です。

このファイルは、GitHub公開棚の現在の顔を示すためのものです。Runtime本体の正本導線はオンラインのRuntime Public Shelfを優先し、GitHub側には現行Runtime束の公開ミラーを置きます。

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
- GitHub側のRuntime ZIP公開ミラー
- Runtime関連の参照用資料
- 公開方針と更新履歴

GitHubをRuntime本体の最優先正本へは昇格しません。オンラインRuntime Public Shelfを優先導線とし、GitHubは公開ミラー兼参照棚として扱います。

## GitHub上のRuntime ZIP

`RUNTIME_ZIP/` は、2026-09-01に現行Runtime束へ差し替え済みです。ZIP CRCはローカル実読でPASSを確認し、SHA-256は `RUNTIME_ZIP/CHECKSUMS.sha256` に記録しています。

| GitHub path | 扱い |
| --- | --- |
| `RUNTIME_ZIP/DS90_v0405_RUNTIME_FINALIZED_v001.zip` | DS90 / 設計さん |
| `RUNTIME_ZIP/PW90_v004_28_NLCORE_STORY_LAYER_V28_BOUND_FINALIZED_v004.zip` | PW90 / 執筆さん |
| `RUNTIME_ZIP/TS90_v001_25_NLCORE_JSON_ROUNDTRIP_BOUNDARY_FINALIZED_v001.zip` | TS90 / 修正刃さま |
| `RUNTIME_ZIP/NW22_v002_5_NLCORE_STABLE_LOCKED.zip` | NW22 / 野良ちゃん |
| `RUNTIME_ZIP/MT00_BOOTSTRAP_EA_v001_GPT_PROJECT_FIRST_TRANSFER_BASELINE_FINALIZED_v001.zip` | MT00_BOOTSTRAP_EA / エーア |
| `RUNTIME_ZIP/MT00_v002_CLEAN_BASELINE_TRANSFER_FINALIZED_v002.zip` | MT00 / ヌル |
| `RUNTIME_ZIP/SP00_v002_CLEAN_BASELINE_STORY_PACK_FINALIZED_v001.zip` | SP00 / ナル |
| `RUNTIME_ZIP/DB_PROJECT_ZERO_START_MOUNT_v001.zip` | 初期Project配置用マウント束 |
| `RUNTIME_ZIP/IMAGE_RUNTIME_MINIMAL_v005.zip` | 画像Runtime最小セット |
| `RUNTIME_ZIP/IMAGE_RUNTIME_MOUNT_TEMPLATE_v001.zip` | 画像Runtime用マウントテンプレート |
| `RUNTIME_ZIP/ROBUSTNESS_AUDIT_RUNTIME_v002_MINIMAL.zip` | 堅牢性監査Runtime |

最新版を読む場合は [Runtime Public Shelf](https://runtime-public-archive.harmoniets.chatgpt.site/) の400番台を確認してください。

## Runtime関連ディレクトリ

GitHub側では、以下のRuntime関連ディレクトリへ展開済みです。

- `RUNTIME/DS90`
- `RUNTIME/PW90`
- `RUNTIME/TS90`
- `RUNTIME/NW22`
- `RUNTIME/MT00`
- `RUNTIME/SP00`
- `RUNTIME/MT00_BOOTSTRAP_EA`
- `RUNTIME/IMAGE_RUNTIME_MINIMAL`
- `RUNTIME/IMAGE_RUNTIME_MOUNT_TEMPLATE`
- `RUNTIME/ROBUSTNESS_AUDIT`
- `RUNTIME_ZIP/`
- `RUNTIME_PDF/`

これらはGitHub公開棚の参照資料です。オンラインRuntime Public Shelfの正本導線を優先します。

## 公開方針

現在の公開方針は以下を維持します。

**Free Runtime. Free Use. No Attribution Required. Use at Your Own Responsibility.**

改変、再配布、商用利用、再構成、再公開、派生物公開を妨げない方針です。ただし、利用、保守、法令順守、公開判断、サポート等は利用者側の責任です。

このファイルでは新しいライセンス解釈や法的保証を追加しません。

## 非公式プロジェクト

GPT小説執筆ラインはOpenAI公式のプロジェクトではありません。OpenAI、ChatGPT、GPT各モデルの提供元による承認、監修、保証を受けたものではありません。

## 未確認事項

- GitHub上のRuntime ZIPとRuntime Public Shelf v19 / 400番台の公開ファイル全体の完全同一性は、この更新では確認していません。
- Public Release Policy本文の法的保証やライセンス解釈は、このGitHub更新では拡張していません。
- Sites本体の編集・deployは、このGitHub更新とは別工程です。
