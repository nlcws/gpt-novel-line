# GPT小説執筆ライン

GPT小説執筆ラインの公開棚です。

このリポジトリでは、チャットAIマウント型ランタイムの公開可能資料、公開棚の入口、現行状態、更新履歴を扱います。

## 現在の同期状態

2026-08-07時点で、この説明文書は実読済みの公開棚移管セット v003 に合わせて更新しています。

根拠にした移管コンテナは `GPT_NOVEL_LINE_MT00_MOUNT_TRANSFER_v003_20260731.zip` です。制御棚 `000_C` の検査結果は `PASS`、`unresolvedStopCount` は `0`、`nextAgentRestartReady` は `true` です。

## 実読済み公開棚セット

| 棚 | ZIP | 扱い | sha256 |
| --- | --- | --- | --- |
| `000_C` | `000_C.zip` | 制御棚 | `925a8f2c5509188966f1c9827729caf7298b1e7571aa6e21cf2df62bd9121713` |
| `021_G` | `021_G_v002.zip` | 入口・タグ索引 | `a3b66140ecdc009aebb1dcee2202c5d95da4c1010b9f5a9156b523cd2fa1fca1` |
| `022_B` | `022_B_v002.zip` | 固定骨 | `0719cd3f750fdd1c2d6abe4d2603a7a4a1415c50ee788b378bbe945a60dd7f15` |
| `024_V` | `024_V_v003.zip` | 可変運用・サイト状態 | `efa895a6982f23b74ddec4446c327bb0ea9b872b4510f404dab4a2cdb6113980` |
| `028_H` | `028_H_v002.zip` | 保留・却下済み | `40615e571d4723905e6145d87e6fc600c0184e06bcb7e5cf80d89f72821b1e4e` |

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

## 読む順番

再起動時は `000_C/02_RESTART/RESTART_HANDOFF.md` のREAD_ORDERを優先します。

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

この更新は、実読済み5本の公開棚移管状態を説明文書へ反映するものです。ランタイムZIP本体の差し替えや、GitHub上への棚ZIPバイナリ配置を完了済みとは扱いません。

非公開資料、制作途中資料、未整理の作業母艦は含めません。
