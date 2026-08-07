# INDEX

GPT小説執筆ライン公開棚の索引です。

このリポジトリは、チャットAIマウント型ランタイムの公開可能資料、公開棚の入口、現行状態、更新履歴を置くための公開棚です。

## 入口

- [README.md](README.md)  
  このリポジトリ全体の説明。

- [CURRENT_STATUS.md](CURRENT_STATUS.md)  
  現在の公開状態、検査済み公開棚、読む順番。

- [CHANGELOG.md](CHANGELOG.md)  
  公開棚の更新履歴。

- [RUNTIME_ZIP/README.md](RUNTIME_ZIP/README.md)  
  ランタイムZIP置き場の説明と、今回の公開棚移管との境界。

## 実読済み公開棚移管セット

2026-08-07時点の文書更新根拠は、以下の5本です。

| 棚 | ZIP | 役割 | 状態 |
| --- | --- | --- | --- |
| `000_C` | `000_C.zip` | 制御棚 / manifest / validation / restart handoff | PASS |
| `021_G` | `021_G_v002.zip` | 初回入口 / TAG_INDEX | REFLECTED |
| `022_B` | `022_B_v002.zip` | 固定骨 | REFLECTED |
| `024_V` | `024_V_v003.zip` | 可変運用 / サイト状態 / 作品本文索引 / 検証素材 | REFLECTED |
| `028_H` | `028_H_v002.zip` | 却下済み・判定待ち | HELD |

`000_C/01_VALIDATION/VALIDATION_REPORT.json` の結果は `PASS` です。

## `000_C` READ_ORDER

初見または再起動時は、以下の順で確認します。

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

## ランタイム本体

ランタイムZIP本体は以下に置きます。

- [RUNTIME_ZIP/](RUNTIME_ZIP/)

今回の更新は、実読済み5本の公開棚移管状態を説明文書へ反映するものです。ランタイムZIP本体の差し替え完了とは扱いません。

## 分解棚

分解済みまたは参照用の棚は以下に置きます。

- [RUNTIME/](RUNTIME/)

既存の参照用フォルダは以下です。

- [RUNTIME/DS90/](RUNTIME/DS90/)
- [RUNTIME/PW90/](RUNTIME/PW90/)
- [RUNTIME/TS90/](RUNTIME/TS90/)
- [RUNTIME/NW22/](RUNTIME/NW22/)

## 公開サイト

`024_V_v003/10_VARIABLE/SITE_PUBLICATION_STATUS_v003.md` による公開状態です。

- title: `GPT小説執筆ライン ポータル`
- live_url: `https://gpt-novel-line-portal.harmoniets.chatgpt.site`
- latest_version_number: `44`
- status: `active`
- access_mode: `public`

## 注意

このリポジトリは公開情報のみを扱います。

非公開資料、制作途中資料、未整理の作業母艦は含めません。

確認していないZIP、未配置のZIP、未取得のSitesソースを確認済みとして扱いません。
