# CURRENT STATUS

GPT小説執筆ライン公開棚の現在状況です。

## 現在の公開状態

- 公開棚：作成済み
- ランタイムZIP：DS90 v0300基準へ更新
- DS90：v020からv0300へ差し替え
- MT00_BOOTSTRAP_EA：新規追加
- MT00 v002：追加
- SP00 v002：追加
- TS90：実読済みZIPへ差し替え
- PW90 / NW22：既存GitHub配布ZIPと今回添付ZIPのsha一致を確認済み
- 公開棚5本：v003 実読済み / 補足扱い
- 制御棚 `000_C`：PASS
- `unresolvedStopCount`：0
- `nextAgentRestartReady`：true
- 公開サイト：active / public
- GitHub Pages：未設定

## 現行ランタイムZIP

| ZIP | sha256 | CRC | unsafe path | JSON | 文字コード | 状態 |
| --- | --- | --- | --- | --- | --- | --- |
| `DS90_v0300_CLEAN_BASELINE_FINALIZED_v002.zip` | `b0aba518496e3d3f20f599cfab3cbd4e8ce432493e82fa743ede290f30c19281` | OK | なし | OK | UTF-8 OK | v020から差し替え |
| `PW90_v004_21c_NLCORE_STABLE_LOCKED.zip` | `c75da89a98870edbea9c843db039c2f8ffa94488c9f92448fbe9dbe4734f4e7c` | OK | なし | OK | UTF-8 OK | 既存配布継続 |
| `TS90_v001_15_NLCORE_STABLE_LOCKED.zip` | `272f8265320ed1c1406a78e47b6267d8d7208453ee75841b25a59ae31172ca63` | OK | なし | OK | UTF-8不可1本あり | 差し替え |
| `NW22_v002_5_NLCORE_STABLE_LOCKED.zip` | `8a0845840aa6bfcb60107fc9ca415c30005c542b9ef4a7568895c66527dd2996` | OK | なし | OK | UTF-8 OK | 既存配布継続 |
| `MT00_BOOTSTRAP_EA_v001_GPT_PROJECT_FIRST_TRANSFER_BASELINE_FINALIZED_v001.zip` | `f45e41113f27b65e5a24465b351f0a79370f2aea593c8da6e393808889a5e537` | OK | なし | OK | UTF-8不可4本あり | 新規追加 |
| `MT00_v002_CLEAN_BASELINE_TRANSFER_FINALIZED_v002.zip` | `05f35e613f0e0451c649a3a5ed7984f6a0dd6bf7901ec7b4b40b1efa8f273d80` | OK | なし | OK | UTF-8 OK | 追加 |
| `SP00_v002_CLEAN_BASELINE_STORY_PACK_FINALIZED_v001.zip` | `95081b42cf95a48e679d7e7648d74b83a2b2e8d5c539753e6336f68c8462eecf` | OK | なし | OK | UTF-8 OK | 追加 |

TS90は2root構成です。これは今回添付されたZIP現物の状態として記録します。

## 実読済み公開棚セット

| ZIP | sha256 | CRC | unsafe path | JSON | 文字コード |
| --- | --- | --- | --- | --- | --- |
| `000_C.zip` | `925a8f2c5509188966f1c9827729caf7298b1e7571aa6e21cf2df62bd9121713` | OK | なし | OK | UTF-8 OK |
| `021_G_v002.zip` | `a3b66140ecdc009aebb1dcee2202c5d95da4c1010b9f5a9156b523cd2fa1fca1` | OK | なし | OK | UTF-8 OK |
| `022_B_v002.zip` | `0719cd3f750fdd1c2d6abe4d2603a7a4a1415c50ee788b378bbe945a60dd7f15` | OK | なし | OK | UTF-8 OK |
| `024_V_v003.zip` | `efa895a6982f23b74ddec4446c327bb0ea9b872b4510f404dab4a2cdb6113980` | OK | なし | OK | CP932テキスト2本あり |
| `028_H_v002.zip` | `40615e571d4723905e6145d87e6fc600c0184e06bcb7e5cf80d89f72821b1e4e` | OK | なし | OK | UTF-8 OK |

## `000_C` 検査

`000_C/01_VALIDATION/VALIDATION_REPORT.json` の検査結果です。

- validator: `generated_MT00_contract_check`
- validatedAt: `2026-07-31`
- result: `PASS`
- errors: `[]`
- outerRootShelfZipOnly: `true`
- controlShelfPresent: `true`
- allOuterShelfZipsListed: `true`
- allFilesListed: `true`
- unresolvedStopCount: `0`
- nextAgentRestartReady: `true`
- unclassifiedItems: `0`

## 公開サイト状態

`024_V_v003/10_VARIABLE/SITE_PUBLICATION_STATUS_v003.md` の記録です。

- title: `GPT小説執筆ライン ポータル`
- project_id: `appgprj_6a594acab6ec81918f9f48171e813997`
- live_url: `https://gpt-novel-line-portal.harmoniets.chatgpt.site`
- latest_version_number: `44`
- status: `active`
- access_mode: `public`

version 44では、`/public-release-policy`、TOP公開方針一文、sitemap、portal-manifest、metadata、JSON-LD、英日併記の公開方針本文が反映済みとして記録されています。

## `024_V_v003` の主な同梱内容

- `10_VARIABLE/CURRENT_OPERATION.md`
- `10_VARIABLE/SITE_PUBLICATION_STATUS_v003.md`
- `20_TRANSFER_REPORT/MOUNT_TRANSFER_COMPLETION_REPORT.md`
- `30_SITE_SOURCE/GPT_NOVEL_LINE_PORTAL_SITE_SOURCE_v032_20260719.zip`
- `31_WORK_TEXTS/WORKS_STATUS_INDEX.md`
- `31_WORK_TEXTS/WORK_TEXTS_INVENTORY.tsv`
- `32_VERIFICATION_MATERIALS/VERIFICATION_MATERIALS_INVENTORY.tsv`
- `33_LINK_AUDIT/LINK_PLACEMENT_AUDIT.md`
- `34_ENCODING_AUDIT/UTF8_TEXT_AUDIT.md`

注意：同梱サイトソーススナップショットは v032 です。Sites公開版 version 44 のソース実体を同梱済みとは扱いません。

## 残作業

以下はエラーではなく、次工程の作業として扱います。

- 検証素材を `SOURCE_BODY` / `GPT_COMMENT` / `GPT_INSTRUCTION` / `CODEX_COMMENT` / `ACTION` に分解する。
- 分解後、GPTに再判定させる。
- Codex視点で構造、再現性、リンク、分類、実装上の意見を追加する。
- 作品ごとの正式名称、通称、シリーズ内訳をサイト本文へさらに寄せる。
- 風待町シリーズの寺 / 猫 / 雪の粒度を整理する。

## 未反映境界

この状態更新は、ランタイムZIP本体の更新を主作業とします。

公開棚5本は補足根拠であり、GitHub上へ棚ZIP本体を配置済みとは扱いません。Sites version 44 のソース実体取得も、この更新では完了済みとして扱いません。
