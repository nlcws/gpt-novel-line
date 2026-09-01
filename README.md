# GPT小説執筆ライン

**AIエージェント運用 / マルチエージェント / AI Runtime Overlay の公開実装・運用記録です。**

GPT小説執筆ラインは、小説制作から生まれた公開プロジェクトです。ただし目的は「小説をAIへ丸投げする」ことではありません。

一つのAIへ全部を任せるのではなく、役割、資料、判断境界、受け渡し、検査、監査、更新、移管を分けて、長期に作業を続けるための仕組みを実際に運用しています。

- 役割を分ける
- 読む資料と正本を分ける
- 担当外へ勝手に越境させない
- STOP / PASS 条件を持たせる
- 次の担当へ handoff する
- 検査・監査の証跡を残す
- Runtime単位で更新、移管、再開する

これはモデル性能競争ではありません。汎用チャットAIの上に、役割・資料・手順・判断境界・検査条件を重ねて運用する **AI Runtime Overlay / チャットAIマウント型ランタイム** の公開例です。

## まずここ

| 目的 | 入口 |
| --- | --- |
| 全体を人間向けに見る | [GPT小説執筆ライン ポータル](https://gpt-novel-line-portal.harmoniets.chatgpt.site/) |
| Runtime本体を読む・使う | [Runtime Public Shelf](https://runtime-public-archive.harmoniets.chatgpt.site/) |
| 自由利用・改変・再配布の方針を見る | [Public Release Policy](https://gpt-novel-line-portal.harmoniets.chatgpt.site/public-release-policy) |
| 運用メモや記事を読む | [note](https://note.com/gpt_novel_line) |
| GitHub上の公開資料を見る | このリポジトリ |

**Free Runtime. Free Use. No Attribution Required. Use at Your Own Responsibility.**

公開方針上、改変・再配布・商用利用・再構成・再公開・派生物の公開を妨げません。利用・保守・法令順守・公開判断・サポートは利用者自身の責任で行ってください。

## 現在のRuntime導線

Runtime本体の現在の正本導線は、オンラインの [Runtime Public Shelf](https://runtime-public-archive.harmoniets.chatgpt.site/) を優先します。GitHub側にも現行Runtime束をミラーとして置き、内容を参照できるようにしています。

2026-09-01時点でオンライン棚では、`ACTIVE_LAYER_DEFAULT: 400番台`、`RUNTIME_LAYERS: 400番台 / 300番台` が確認できます。

- **400番台**: 現行のコピー更新層。新しく読む場合はこちらを優先します。
- **300番台**: 既存ランタイム置き場の保存層。過去状態の比較や旧導線確認に使います。

GitHub内では、ZIP本体を [`RUNTIME_ZIP/`](RUNTIME_ZIP/) に、展開済み資料を [`RUNTIME/`](RUNTIME/) に置いています。古いGitHub ZIP名や過去の版番号を現在版として扱わないでください。

## 何を解決したくて作ったか

長くAIを使うと、モデルの賢さだけでは解決しない問題が出ます。

### 一つのAIが何でもやり始める

設計中の仮案を本文へ持ち込み、本文担当が設定を確定し、修正担当が作品そのものを作り替える。能力が高くても、担当境界が曖昧なら仕事は混ざります。

→ **役割と権限を分離します。**

### チャットが変わると前提が薄れる

長期作業では「前に決めたはず」が事故源になります。

→ **正本、読む順番、CURRENT、HOLD、handoff、移管を明示します。**

### AI同士をつないでも、誰が何をしたか分からない

接続できるだけでは運用になりません。

→ **入力・出力・STOP / PASS・validation・auditを工程へ持たせます。**

### 更新すると全部壊れる

一つの巨大な人格やプロンプトへ全部を詰めると、一部変更が全体へ波及します。

→ **Runtimeを役割ごとに分け、交換・更新・移管できるようにします。**

## Runtimeの役割

Runtime群はキャラクター紹介ではなく、責務分離のために分かれています。現行正本と版は [Runtime Public Shelf](https://runtime-public-archive.harmoniets.chatgpt.site/) を優先してください。

| Runtime | 役割 |
| --- | --- |
| DS90 / 設計さん | 設計・条件整理・境界・受け渡し |
| PW90 / 執筆さん | 確定済み条件から本文へ変換 |
| TS90 / 修正刃さま | 修正・検査・本文の整合 |
| NW22 / 野良ちゃん | 正規ライン外の自由度が高い作業 |
| MT00 / ヌル | マウント移管・状態の引き継ぎ |
| SP00 / ナル | 話パックの切り出し・梱包 |
| MT00_BOOTSTRAP_EA / エーア | 新規Projectの初期配置 |

## AIエージェント運用として見る場合

GPT小説執筆ラインは小説制作を主な実験場にしていますが、構造として扱っているのは次のような一般的な問題です。

- AIエージェント運用
- マルチエージェント / multi-agent system
- agentic workflow
- AI runtime / runtime overlay
- handoff / 引き継ぎ
- source of truth / 正本管理
- 権限分離
- validation / STOP / PASS
- audit / 監査
- runtime lifecycle
- 長期コンテキスト運用
- AI governance

「これが唯一の正解」「業界標準」という主張ではありません。長期運用されている公開実装・運用記録として読んでください。

## 読み方

**初見の人間**はポータルから入るのが最短です。

**Runtimeを使いたい人・AI**は Runtime Public Shelf の `START_HERE_ONLINE_RUNTIME.txt` を優先してください。

**GitHub上の公開ミラー・更新記録**を確認する場合は以下を参照してください。

- [INDEX.md](INDEX.md)
- [CURRENT_STATUS.md](CURRENT_STATUS.md)
- [CHANGELOG.md](CHANGELOG.md)
- [RUNTIME_ZIP/](RUNTIME_ZIP/)
- [RUNTIME/](RUNTIME/)

## 公開サイト

- Portal: https://gpt-novel-line-portal.harmoniets.chatgpt.site/
- Runtime Public Shelf: https://runtime-public-archive.harmoniets.chatgpt.site/
- Public Release Policy: https://gpt-novel-line-portal.harmoniets.chatgpt.site/public-release-policy
- note: https://note.com/gpt_novel_line

## 非公式プロジェクト

GPT小説執筆ラインはOpenAI公式のプロジェクトではありません。OpenAI、ChatGPT、GPT各モデルの提供元による承認、監修、保証を受けたものではありません。

確認していないものを確認済みとして扱いません。正本Runtime、解説、作品本文、運用メモ、過去の公開記録は分離して扱います。
