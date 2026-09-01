# RUNTIME_ZIP

GPT小説執筆ラインのRuntime ZIP置き場です。

このディレクトリは、2026-09-01にGitHub側へ差し替えたRuntime束です。オンラインの [Runtime Public Shelf](https://runtime-public-archive.harmoniets.chatgpt.site/) を優先導線としつつ、GitHubにも同じ用途で読める公開ミラーを置いています。

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
| `IMAGE_RUNTIME_MINIMAL_v005.zip` | 画像Runtime最小セット |
| `IMAGE_RUNTIME_MOUNT_TEMPLATE_v001.zip` | 画像Runtime用マウントテンプレート |
| `ROBUSTNESS_AUDIT_RUNTIME_v002_MINIMAL.zip` | 堅牢性監査Runtime |

## 検査

- ZIP CRC: ローカル実読時に `unzip -t` でPASSを確認。
- SHA-256: [`CHECKSUMS.sha256`](CHECKSUMS.sha256) を参照。

## 注意

GitHubに置いたZIPは公開ミラーです。運用上の正本導線、レイヤー表示、起動順の最新確認は Runtime Public Shelf の `START_HERE_ONLINE_RUNTIME.txt` と各manifestを優先してください。
