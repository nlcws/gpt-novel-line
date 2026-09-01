# CHANGELOG

## 2026-09-01 / GitHub Runtime bundle replacement

- GitHub側の `RUNTIME/` と `RUNTIME_ZIP/` を現行Runtime束へ差し替え。
- `DS90 v0405`、`PW90 v004.28`、`TS90 v001.25`、`NW22 v002.5`、`MT00 v002`、`SP00 v002`、`MT00_BOOTSTRAP_EA v001`、`DB_PROJECT_ZERO_START_MOUNT v001`、画像Runtime、堅牢性監査Runtimeを収録。
- `RUNTIME_ZIP/CHECKSUMS.sha256` を追加。
- README / INDEX / CURRENT_STATUS / RUNTIME_ZIP READMEを、GitHub側にも現行Runtimeミラーを置く説明へ更新。
- オンラインのRuntime Public Shelfを優先導線とする方針は維持。

## 2026-09-01 / Runtime Public Shelf v19導線整理

- GitHub公開棚のREADME / INDEX / CURRENT_STATUS / RUNTIME_ZIP READMEを、現在のオンラインRuntime Public Shelf優先へ整理。
- Runtime Public Shelfで確認できる `ACTIVE_LAYER_DEFAULT: 400番台` と `RUNTIME_LAYERS: 400番台 / 300番台` をGitHub側にも反映。
- GitHub上の `RUNTIME_ZIP/` を、現行正本ではなく過去配布記録として明示。
- Portal / Runtime Public Shelf / Public Release Policy / note / GitHub公開棚の主要導線をREADMEとINDEXで再整理。
- 旧Sites version 44や旧GitHub配布ZIPを、CURRENTの顔として誤読しないよう `CURRENT_STATUS.md` を更新。
- この更新ではSites本体の編集・deployは行っていない。GitHub公開棚の文書整理のみ。

## 2026-09-01

- GitHub公開棚の玄関を、既存利用者向けの内部索引中心から、初見の人間がAIエージェント運用・マルチエージェント・AI Runtimeとして発見できる構成へ改修。
- `README.md` を全面更新。
  - AIエージェント運用 / マルチエージェント / AI Runtime Overlay を冒頭で明示。
  - 役割分離、handoff、正本、STOP / PASS、監査、Runtime lifecycleの説明を追加。
  - Portal / Runtime Public Shelf / Public Release Policy / noteへの入口を上部へ移動。
  - GitHub上の旧配布記録と現行Runtime棚を分離して案内。
- `INDEX.md` を全面更新。
  - 外部検索語から来た人向けの入口を追加。
  - 内部棚コードを初見向け導線から後退。
- `PUBLIC_FRONTDOOR_REDESIGN_v001.md` を追加。
  - GPT小説執筆ライン ポータル本体の全面改修仕様。
  - TOP構成、Runtime案内、公開方針、SEO、JSON-LD、sitemap、新設推奨 `/ai-agent-runtime` ページを定義。
- `NOTE_PUBLIC_FRONTDOOR_DRAFT_v001.md` を追加。
  - note玄関記事「AIエージェント、そろそろ『一人に全部やらせる』のをやめませんか」の公開用原稿。
- `harmoniets.chatgpt.site` の公開Sites本体は、この更新では未変更。現在利用可能な接続にSites編集・公開操作が無いため、更新済みとは扱わない。
- note本体も、この更新では未投稿。公開原稿のみ作成。

## 2026-08-07

- ランタイムZIP本体をDS90 v0300基準へ更新。
- `RUNTIME_ZIP/DS90_v020_NLCORE_STABLE_LOCKED.zip` を外し、`DS90_v0300_CLEAN_BASELINE_FINALIZED_v002.zip` を配置。
- `RUNTIME_ZIP/TS90_v001_15_NLCORE_STABLE_LOCKED.zip` を実読済みZIPへ差し替え。
- `RUNTIME_ZIP/MT00_BOOTSTRAP_EA_v001_GPT_PROJECT_FIRST_TRANSFER_BASELINE_FINALIZED_v001.zip` を追加。
- `RUNTIME_ZIP/MT00_v002_CLEAN_BASELINE_TRANSFER_FINALIZED_v002.zip` を追加。
- `RUNTIME_ZIP/SP00_v002_CLEAN_BASELINE_STORY_PACK_FINALIZED_v001.zip` を追加。
- `PW90_v004_21c_NLCORE_STABLE_LOCKED.zip` と `NW22_v002_5_NLCORE_STABLE_LOCKED.zip` は、今回添付ZIPと既存GitHub配布ZIPのsha256一致を確認し、既存配布を継続。
- `README.md` / `INDEX.md` / `CURRENT_STATUS.md` / `RUNTIME_ZIP/README.md` を、ランタイム7本主語の説明へ更新。

## 2026-08-07 以前の文書同期

- 実読済み公開棚5本 v003 の状態を説明文書へ反映。
- `README.md` / `INDEX.md` / `CURRENT_STATUS.md` / `RUNTIME_ZIP/README.md` を更新。
- `000_C` 制御棚の `VALIDATION_REPORT` が `PASS` であることを記録。
- `000_C` の `READ_ORDER` を公開棚の再起動順として反映。
- `024_V_v003` の公開サイト状態を反映。
  - Sites project_id: `appgprj_6a594acab6ec81918f9f48171e813997`
  - live_url: `https://gpt-novel-line-portal.harmoniets.chatgpt.site`
  - latest_version_number: `44`
  - status: `active / public`
- `024_V_v003` の注意として、同梱サイトソースは v032 であり、Sites version 44 のソース実体ではないことを明記。
- `024_V_v003` 内のCP932テキスト2本を文字コード注意として記録。
- この更新は説明文書の同期であり、ランタイムZIP本体差し替え、棚ZIPバイナリ配置、Sites version 44 ソース取得は完了済みとして扱わない。

## 2026-07-11

- GitHub公開棚を作成。
- `README.md` を追加。
- 公開情報のみを扱う方針を記載。
