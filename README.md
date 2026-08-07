# GPT小説執筆ライン

GPT小説執筆ラインの公開棚です。

このリポジトリでは、チャットAIマウント型ランタイムの公開可能資料、公開棚の入口、現行状態、更新履歴を扱います。

## 現在のランタイム配布状態

2026-08-07時点で、`RUNTIME_ZIP/` の現行配布ZIPをDS90 v0300基準へ更新しています。

| ZIP | 扱い | sha256 |
| --- | --- | --- |
| `DS90_v0300_CLEAN_BASELINE_FINALIZED_v002.zip` | 設計さん / 現行DS90正本 | `b0aba518496e3d3f20f599cfab3cbd4e8ce432493e82fa743ede290f30c19281` |
| `PW90_v004_21c_NLCORE_STABLE_LOCKED.zip` | 執筆さん / 既存配布継続 | `c75da89a98870edbea9c843db039c2f8ffa94488c9f92448fbe9dbe4734f4e7c` |
| `TS90_v001_15_NLCORE_STABLE_LOCKED.zip` | 修正刃さま / 実読済みZIPへ差し替え | `272f8265320ed1c1406a78e47b6267d8d7208453ee75841b25a59ae31172ca63` |
| `NW22_v002_5_NLCORE_STABLE_LOCKED.zip` | 野良ちゃん / 既存配布継続 | `8a0845840aa6bfcb60107fc9ca415c30005c542b9ef4a7568895c66527dd2996` |
| `MT00_BOOTSTRAP_EA_v001_GPT_PROJECT_FIRST_TRANSFER_BASELINE_FINALIZED_v001.zip` | ヌル / GPTプロジェクト初回移管 | `f45e41113f27b65e5a24465b351f0a79370f2aea593c8da6e393808889a5e537` |
| `MT00_v002_CLEAN_BASELINE_TRANSFER_FINALIZED_v002.zip` | ヌル / 通常マウント移管 | `05f35e613f0e0451c649a3a5ed7984f6a0dd6bf7901ec7b4b40b1efa8f273d80` |
| `SP00_v002_CLEAN_BASELINE_STORY_PACK_FINALIZED_v001.zip` | ナル / 話パック専用 | `95081b42cf95a48e679d7e7648d74b83a2b2e8d5c539753e6336f68c8462eecf` |

## 主要リンク

- [INDEX.md](INDEX.md)
- [CURRENT_STATUS.md](CURRENT_STATUS.md)
- [CHANGELOG.md](CHANGELOG.md)
- [RUNTIME_ZIP/](RUNTIME_ZIP/)
- [RUNTIME/](RUNTIME/)

## 公開サイト状態

`024_V_v003` の記録では、公開サイトは以下の状態です。

- title: `GPT小説執筆ライン ポータル`
- public URL: `https://gpt-novel-line-portal.harmoniets.chatgpt.site`
- Sites project_id: `appgprj_6a594acab6ec81918f9f48171e813997`
- latest version: `44`
- status: `active / public`

## 公開棚補足

以下の5本は、公開棚 / サイト状態の確認用として実読済みです。ランタイム本体の代替ではありません。

| 棚 | ZIP | 扱い | sha256 |
| --- | --- | --- | --- |
| `000_C` | `000_C.zip` | 制御棚 | `925a8f2c5509188966f1c9827729caf7298b1e7571aa6e21cf2df62bd9121713` |
| `021_G` | `021_G_v002.zip` | 入口・タグ索引 | `a3b66140ecdc009aebb1dcee2202c5d95da4c1010b9f5a9156b523cd2fa1fca1` |
| `022_B` | `022_B_v002.zip` | 固定骨 | `0719cd3f750fdd1c2d6abe4d2603a7a4a1415c50ee788b378bbe945a60dd7f15` |
| `024_V` | `024_V_v003.zip` | 可変運用・サイト状態 | `efa895a6982f23b74ddec4446c327bb0ea9b872b4510f404dab4a2cdb6113980` |
| `028_H` | `028_H_v002.zip` | 保留・却下済み | `40615e571d4723905e6145d87e6fc600c0184e06bcb7e5cf80d89f72821b1e4e` |

`000_C` の検査結果は `PASS`、`unresolvedStopCount` は `0`、`nextAgentRestartReady` は `true` です。

## 公開棚の読む順番

公開棚確認時は `000_C/02_RESTART/RESTART_HANDOFF.md` のREAD_ORDERを優先します。

1. `021_G_v002/00_START/00_疑似GPTs設計さんへ_最初に読む.md`
2. `021_G_v002/TAG_INDEX.txt`
3. `022_B_v002/10_BONE/GPT_NOVEL_LINE_PUBLIC_SHELF_BONE.md`
4. `024_V_v003/10_VARIABLE/CURRENT_OPERATION.md`
5. `024_V_v003/10_VARIABLE/SITE_PUBLICATION_STATUS_v003.md`
6. `024_V_v003/20_TRANSFER_REPORT/MOUNT_TRANSFER_COMPLETION_REPORT.md`
7. `024_V_v003/31_WORK_TEXTS/WORKS_STATUS_INDEX.md`
8. `024_V_v003/31_WORK_TEXTS/WORK_TEXTS_INVENTORY.tsv`
9. `024_V_v003/32_VERIFICATION_MATERIALS/VERIFICATION_MATERIALS_INVENTORY.tsv`
10. `024_V_v003/33_LINK_AUDIT/LINK_PLACEMENT_AUDIT.md`
11. `024_V_v003/34_ENCODING_AUDIT/UTF8_TEXT_AUDIT.md`
12. `028_H_v002/10_HOLD/REJECTED_AND_PENDING_DECISIONS.md`

## 注意

ランタイム本体は `RUNTIME_ZIP/` の7本を正とします。公開棚5本は公開サイト状態と再起動順の補足です。

非公開資料、制作途中資料、未整理の作業母艦は含めません。
