# Runtime Family Catalog

GPT小説執筆ライン公開棚から参照する、用途別Runtimeの現行導線です。

GitHubは公開資料とRuntime ZIPミラーを置く場所です。絵師さん / IM80、司書さん / BL90、Vault Runtime / 豆金庫の現行配布も、GitHubミラーと公開ポータルURLの両方から参照できます。

## Families

| Family | Runtime | Purpose | Current distribution |
| --- | --- | --- | --- |
| Novel production | GPT小説執筆ライン | 長編小説制作の設計、執筆、修正、状態移管 | https://gpt-novel-line-portal.harmoniets.chatgpt.site/ |
| Image production | 絵師さん / IM80 | 画像生成・画像編集の制作Runtime | https://ai-image-runtime.harmoniets.chatgpt.site/ |
| Business operations | 司書さん / BL90 | 業務向けに、既存情報を探し、正式な参照元を確認し、状態を分け、目的に合う形へ整理する非創作Runtime | https://business-librarian-runtime.harmoniets.chatgpt.site/ |
| Shared protection | Vault Runtime / 豆金庫 | 重要な一部を保護し、整合性確認と復旧に使う独立Runtime | https://business-librarian-runtime.harmoniets.chatgpt.site/downloads/VAULT_RUNTIME_v002.zip |

## Portal Downloads

| Artifact | URL | SHA-256 |
| --- | --- | --- |
| IM80 v007 | https://ai-image-runtime.harmoniets.chatgpt.site/downloads/IM80_v007_IMAGE_RUNTIME.zip / `RUNTIME_ZIP/IM80_v007_IMAGE_RUNTIME.zip` | `270b22d203f53d83574d3e003c734d2a882a9c21120c59b5ef73812f557c3261` |
| 000_IC | https://ai-image-runtime.harmoniets.chatgpt.site/downloads/000_IC.zip / `RUNTIME_ZIP/000_IC.zip` | `419541c42bd88c0c5ec9001ca4c90716827ece7660086deca95b3c2d84d4cb8b` |
| IMT00 v003 | https://ai-image-runtime.harmoniets.chatgpt.site/downloads/IMT00_IMAGE_TRANSFER_RUNTIME_v003.zip / `RUNTIME_ZIP/IMT00_IMAGE_TRANSFER_RUNTIME_v003.zip` | `9a09b57bc01fdb6cbfdea753c2320382db5591dff12fbfd22e5a4d600b17c194` |
| BL90 Zero Start v004 | https://business-librarian-runtime.harmoniets.chatgpt.site/downloads/BL90_ZERO_START_MOUNT_v004_CANDIDATE.zip / `RUNTIME_ZIP/BL90_ZERO_START_MOUNT_v004_CANDIDATE.zip` | `c5a0577867c8e06f9f97aaf3e532beb5b056185a8c9270adebbec17e784ad08f` |
| BL90 v004 | https://business-librarian-runtime.harmoniets.chatgpt.site/downloads/BL90_v004_BUSINESS_LIBRARIAN_RUNTIME_CANDIDATE.zip / `RUNTIME_ZIP/BL90_v004_BUSINESS_LIBRARIAN_RUNTIME_CANDIDATE.zip` | `539da6f2a637f26797b06402a79042ef4eca6803ce9cb4c9f8ddeb4b4d08a945` |
| BL90 Reference Demo v002 | https://business-librarian-runtime.harmoniets.chatgpt.site/downloads/BL90_REFERENCE_DEMO_COMPLETE_MOUNT_v002_CANDIDATE.zip / `RUNTIME_ZIP/BL90_REFERENCE_DEMO_COMPLETE_MOUNT_v002_CANDIDATE.zip` | `8dec90dbef480f0d249156a9c90af08c17558f344785fad725943761df1d7c3f` |
| 000_BC | https://business-librarian-runtime.harmoniets.chatgpt.site/downloads/000_BC.zip / `RUNTIME_ZIP/000_BC.zip` | `69d515e65892fba7b18cb8fe4e195bb27c90a6234d312ba2e433cb99189ab55a` |
| MT00 v001 for BC transfer | https://business-librarian-runtime.harmoniets.chatgpt.site/downloads/MT00_v001_BC_TRANSFER_RUNTIME_CANDIDATE.zip / `RUNTIME_ZIP/MT00_v001_BC_TRANSFER_RUNTIME_CANDIDATE.zip` | `51005d372b00a913ab3967e26ac1e0482b1e674fe455821c536b922417436193` |
| PROJECT_MAINTENANCE_AUTHORITY_PROFILE_v003 | https://business-librarian-runtime.harmoniets.chatgpt.site/downloads/PROJECT_MAINTENANCE_AUTHORITY_PROFILE_v003.json / `RUNTIME_ZIP/PROJECT_MAINTENANCE_AUTHORITY_PROFILE_v003.json` | `4621777013f97a26130f8873d9882dad9b2c8ce558e4ca058ce6614957513688` |
| Vault Runtime v002 | https://business-librarian-runtime.harmoniets.chatgpt.site/downloads/VAULT_RUNTIME_v002.zip / `RUNTIME_ZIP/VAULT_RUNTIME_v002.zip` | `8ca75055bd321986161a4a8cfbca256d007fcb23d4e63ea936629546de60046b` |

## Boundaries

- BL90 is not a successor to GPT小説執筆ライン.
- BL90 is not a universal automation system.
- BL90 is for non-creative business operations: search, verify, separate states, apply templates, update under explicit authority, and support complete Project transfer.
- 000_BC is the standard control shelf for BL90 Project operation and transfer.
- MT00 / ヌル is required when BL90 Project state must move as a complete mount, not as patch-only or diff-only output.
- Vault Runtime / 豆金庫 is independent. It can protect selected important data, but it is not standard-installed into BL90.
- Vault plus packager-style transport is an extension pattern, not an integrated verified flow unless a future package explicitly proves it.
- Do not treat other project-specific control shelves as 000_BC.
- Do not describe unverified artifacts as verified.