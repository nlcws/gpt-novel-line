# INDEX

GPT小説執筆ライン公開棚の索引です。

この公開棚は、小説制作を実験場として運用している **AIエージェント / マルチエージェント / AI Runtime Overlay** の公開資料置き場です。

## 初めて来た方

- [README.md](README.md)  
  人間向けの玄関。何を作っているのか、何に使えるのかを最初に説明します。

- [GPT小説執筆ライン ポータル](https://gpt-novel-line-portal.harmoniets.chatgpt.site/)  
  作品、記事、公開方針、各棚への総合入口。

- [Runtime Public Shelf](https://runtime-public-archive.harmoniets.chatgpt.site/)  
  現行Runtimeを使うための公開棚。`START_HERE_ONLINE_RUNTIME.txt` から開始します。

- [Public Release Policy](https://gpt-novel-line-portal.harmoniets.chatgpt.site/public-release-policy)  
  利用・改変・再配布・商用利用・作者表記などの公開方針。

- [note](https://note.com/gpt_novel_line)  
  開発・運用・検証の記事。

## 外部の言葉から来た方へ

この棚では、次のようなテーマを実運用ベースで扱っています。

- AIエージェント運用
- マルチエージェント
- agentic workflow
- AI Runtime / Runtime Overlay
- AIガバナンス
- handoff / 引き継ぎ
- 権限分離
- source of truth / 正本管理
- validation / STOP / PASS
- audit / 監査
- lifecycle / 更新・移管・退役
- 長期コンテキスト管理

用語を標準化すること自体が目的ではありません。人間が長期運用しやすいように、役割・資料・判断境界・受け渡し・検査を分けた結果として、この構造になっています。

## Runtimeの役割

| Runtime | 主担当 |
| --- | --- |
| DS90 / 設計さん | 設計、条件整理、判断境界、受け渡し |
| PW90 / 執筆さん | 確定条件から本文生成 |
| TS90 / 修正刃さま | 修正、検査、整合 |
| NW22 / 野良ちゃん | 外部入力、自由度の高い作業 |
| MT00 / ヌル | マウント移管、状態引き継ぎ |
| SP00 / ナル | 話パック切り出し・梱包 |
| MT00_BOOTSTRAP_EA / エーア | 新規Project初期配置 |

現行正本は [Runtime Public Shelf](https://runtime-public-archive.harmoniets.chatgpt.site/) を優先してください。

## GitHub上の記録

- [CURRENT_STATUS.md](CURRENT_STATUS.md)  
  GitHub配布状態・過去の公開棚状態。

- [CHANGELOG.md](CHANGELOG.md)  
  GitHub公開棚の更新履歴。

- [RUNTIME_ZIP/README.md](RUNTIME_ZIP/README.md)  
  GitHubに置かれたRuntime ZIPの説明。

- [RUNTIME/](RUNTIME/)  
  分解済み・参照用のRuntime資料。

## GitHub上の旧配布記録

このGitHubリポジトリには過去時点の配布状態も残っています。最新版を探す場合、GitHub上の旧ZIP名を現在の正本と誤認せず、Runtime Public Shelfを確認してください。

## 公開方針

**Free Runtime. Free Use. No Attribution Required. Use at Your Own Responsibility.**

公開方針の詳細は [Public Release Policy](https://gpt-novel-line-portal.harmoniets.chatgpt.site/public-release-policy) を参照してください。

## 注意

このリポジトリは公開情報のみを扱います。

非公開資料、制作途中資料、未整理の作業母艦は含めません。

確認していないZIP、未配置のZIP、未取得のSitesソースを確認済みとして扱いません。
