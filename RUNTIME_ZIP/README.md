# RUNTIME_ZIP

`RUNTIME_ZIP/` は、GitHub上に残しているRuntime ZIPの公開配布記録です。

**現在のRuntime正本導線は、このディレクトリではなく [Runtime Public Shelf](https://runtime-public-archive.harmoniets.chatgpt.site/) です。**

2026-09-01時点で、オンラインRuntime Public Shelfには以下の層が確認できます。

- `ACTIVE_LAYER_DEFAULT: 400番台`
- `RUNTIME_LAYERS: 400番台 / 300番台`
- `CANONICAL_ENTRY: /START_HERE_ONLINE_RUNTIME.txt`

新しくRuntimeを読む場合は、Runtime Public Shelfの400番台を優先してください。300番台は保存層です。

## GitHub上のZIP一覧

以下はGitHub上の配布記録です。現在のRuntime Public Shelf v19 / 400番台と同一であるとは、このファイルでは断定しません。

| ZIP | 以前の担当表示 | 現在の扱い |
| --- | --- | --- |
| `DS90_v0300_CLEAN_BASELINE_FINALIZED_v002.zip` | 設計さん | GitHub旧配布記録 |
| `PW90_v004_21c_NLCORE_STABLE_LOCKED.zip` | 執筆さん | GitHub旧配布記録 |
| `TS90_v001_15_NLCORE_STABLE_LOCKED.zip` | 修正刃さま | GitHub旧配布記録 |
| `NW22_v002_5_NLCORE_STABLE_LOCKED.zip` | 野良ちゃん | GitHub旧配布記録 |
| `MT00_BOOTSTRAP_EA_v001_GPT_PROJECT_FIRST_TRANSFER_BASELINE_FINALIZED_v001.zip` | エーア / 初回移管 | GitHub旧配布記録 |
| `MT00_v002_CLEAN_BASELINE_TRANSFER_FINALIZED_v002.zip` | ヌル / 通常移管 | GitHub旧配布記録 |
| `SP00_v002_CLEAN_BASELINE_STORY_PACK_FINALIZED_v001.zip` | ナル / 話パック | GitHub旧配布記録 |

## Runtime Public Shelfを優先する理由

Runtimeは更新、移管、再開、退役を前提にしています。GitHubに残るZIP名は、ある時点の公開記録として有用ですが、現在のAIランタイム正本、manifest、checksum、読み順を示すものではありません。

現在のRuntime利用者とAIは、次の順で確認してください。

1. [Runtime Public Shelf](https://runtime-public-archive.harmoniets.chatgpt.site/)
2. `START_HERE_ONLINE_RUNTIME.txt`
3. `online-runtime-manifest.txt`
4. `runtime-index.json`
5. `runtime-checksum.json`

## 役割の読み方

Runtime群は、キャラクター紹介ではなく責務分離として読んでください。

| Runtime | 主担当 |
| --- | --- |
| DS90 / 設計さん | 設計、条件整理、判断境界、受け渡し |
| PW90 / 執筆さん | 確定条件から本文生成 |
| TS90 / 修正刃さま | 修正、検査、整合 |
| NW22 / 野良ちゃん | 正規ライン外の自由度が高い作業 |
| MT00 / ヌル | マウント移管、状態引き継ぎ |
| SP00 / ナル | 話パック切り出し・梱包 |
| MT00_BOOTSTRAP_EA / エーア | 新規Project初期配置 |

## 注意

- GitHub上の古いZIPを、現在のRuntime正本と誤認しないでください。
- このディレクトリは過去配布記録です。
- 最新版、現行層、checksum、AI向け読み順はRuntime Public Shelfを優先してください。
- 021_G / 022_B / 024_V / 028_H は初期GPT Project配置棚であり、Runtime本体の置き換えではありません。
- このリポジトリはOpenAI公式プロジェクトではありません。

## 公開方針

**Free Runtime. Free Use. No Attribution Required. Use at Your Own Responsibility.**

利用、改変、再配布、商用利用、再構成、再公開、派生物公開を妨げない方針です。利用・保守・法令順守・公開判断・サポートは利用者側の責任です。
