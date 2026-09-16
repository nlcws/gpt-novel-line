# RUNTIME_ZIP

GPT小説執筆ラインのRuntime ZIP置き場です。

このディレクトリは、2026-09-01にGitHub側へ差し替えた小説制作ラインのRuntime束です。オンラインの [Runtime Public Shelf](https://runtime-public-archive.harmoniets.chatgpt.site/) を優先導線としつつ、GitHubにも同じ用途で読める公開ミラーを置いています。

絵師さん / IM80、司書さん / BL90、Vault Runtime / 豆金庫の現行配布も、このディレクトリと各公開ポータルの両方から参照できます。GitHub側の入口は [RUNTIME_FAMILY_CATALOG.md](../RUNTIME_FAMILY_CATALOG.md) です。

## 収録ZIP

| ZIP | 扱い |
| --- | --- |
| `DS90_v0405_RUNTIME_FINALIZED_v001.zip` | DS90 / 設計さん |
| `PW90_v004_28_NLCORE_STORY_LAYER_V28_BOUND_FINALIZED_v004.zip` | PW90 / 執筆さん |
| `TS90_v001_25_NLCORE_JSON_ROUNDTRIP_BOUNDARY_FINALIZED_v001.zip` | TS90 / 修正刃さま |
| `NW22_v002_5_NLCORE_STABLE_LOCKED.zip` | NW22 / 野良ちゃん |
| `MT00_v002_CLEAN_BASELINE_TRANSFER_FINALIZED_v002.zip` | MT00 / ヌル |
| `SP00_v002_CLEAN_BASELINE_STORY_PACK_FINALIZED_v001.zip` | SP00 / ナル |
| `MT00_BOOTSTRAP_EA_v001_GPT_PROJECT_FIRST_TRANSFER_BASELINE_FINALIZED_v001.zip` | MT00_BOOTSTRAP_EA / エーア |
| `DB_PROJECT_ZERO_START_MOUNT_v001.zip` | 初期Project配置用マウント束 |
| `IMAGE_RUNTIME_MINIMAL_v005.zip` | 旧画像Runtime最小セット。現行IM80配布はAI Image Runtime portalを優先 |
| `IMAGE_RUNTIME_MOUNT_TEMPLATE_v001.zip` | 旧画像Runtime用マウントテンプレート。現行000_IC配布はAI Image Runtime portalを優先 |
| `IM80_v007_IMAGE_RUNTIME.zip` | 絵師さん / IM80 v007 |
| `000_IC.zip` | 画像Runtime用制御マウント |
| `IMT00_IMAGE_TRANSFER_RUNTIME_v003.zip` | 画像状態移管Runtime |
| `IM80_MINI_TOYGOODS_RUNTIME_v003.zip` | おもちゃ用途向け小型Runtime。PLUSH / PACKAGEの2枝のみ。IM80本体の置換ではない |
| `BL90_ZERO_START_MOUNT_v004_CANDIDATE.zip` | 司書さん / BL90 Zero Start v004 |
| `BL90_v004_BUSINESS_LIBRARIAN_RUNTIME_CANDIDATE.zip` | 司書さん / BL90 v004 |
| `BL90_REFERENCE_DEMO_COMPLETE_MOUNT_v002_CANDIDATE.zip` | BL90 Reference Demo v002 |
| `000_BC.zip` | BL90 Project制御棚 |
| `MT00_v001_BC_TRANSFER_RUNTIME_CANDIDATE.zip` | BL90 Project完全移管Runtime |
| `PROJECT_MAINTENANCE_AUTHORITY_PROFILE_v003.json` | Project保守権限プロファイル |
| `VAULT_RUNTIME_v002.zip` | Vault Runtime / 豆金庫 v002 |
| `ROBUSTNESS_AUDIT_RUNTIME_v002_MINIMAL.zip` | 堅牢性監査Runtime |

## 現行ポータル配布

| Runtime | Download |
| --- | --- |
| 絵師さん / IM80 v007 | https://ai-image-runtime.harmoniets.chatgpt.site/downloads/IM80_v007_IMAGE_RUNTIME.zip |
| 000_IC | https://ai-image-runtime.harmoniets.chatgpt.site/downloads/000_IC.zip |
| IMT00 v003 | https://ai-image-runtime.harmoniets.chatgpt.site/downloads/IMT00_IMAGE_TRANSFER_RUNTIME_v003.zip |
| 司書さん / BL90 v004 | https://business-librarian-runtime.harmoniets.chatgpt.site/downloads/BL90_v004_BUSINESS_LIBRARIAN_RUNTIME_CANDIDATE.zip |
| BL90 Zero Start v004 | https://business-librarian-runtime.harmoniets.chatgpt.site/downloads/BL90_ZERO_START_MOUNT_v004_CANDIDATE.zip |
| 000_BC | https://business-librarian-runtime.harmoniets.chatgpt.site/downloads/000_BC.zip |
| MT00 v001 for BC | https://business-librarian-runtime.harmoniets.chatgpt.site/downloads/MT00_v001_BC_TRANSFER_RUNTIME_CANDIDATE.zip |
| PROJECT_MAINTENANCE_AUTHORITY_PROFILE_v003 | https://business-librarian-runtime.harmoniets.chatgpt.site/downloads/PROJECT_MAINTENANCE_AUTHORITY_PROFILE_v003.json |
| Vault Runtime / 豆金庫 v002 | https://business-librarian-runtime.harmoniets.chatgpt.site/downloads/VAULT_RUNTIME_v002.zip |

## 検査

- ZIP CRC: ローカル実読時に `unzip -t` でPASSを確認。
- SHA-256: [`CHECKSUMS.sha256`](CHECKSUMS.sha256) と [RUNTIME_FAMILY_CATALOG.md](../RUNTIME_FAMILY_CATALOG.md) を参照。

## 注意

GitHubに置いたZIPは公開ミラーです。運用上の正本導線、レイヤー表示、起動順の最新確認は Runtime Public Shelf の `START_HERE_ONLINE_RUNTIME.txt` と各manifestを優先してください。

GitHubミラーと公開ポータル配布に差が出た場合は、各ポータルの最新案内とchecksumを優先してください。