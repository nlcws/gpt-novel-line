# GPT小説執筆ライン

**AIエージェント運用 / マルチエージェント / AI Runtime Overlay の公開実装・運用記録です。**

小説制作から始まった仕組みですが、やっていることは「一つのAIへ全部を任せる」ことではありません。

- 役割を分ける
- 読む資料と正本を分ける
- 担当外へ勝手に越境させない
- STOP / PASS 条件を持たせる
- 次の担当へ handoff する
- 検査・監査の証跡を残す
- 更新、移管、再開を前提にする

つまり、**AIを一人の万能社員として扱うのではなく、仕事が続く組織・工程として運用する**ための公開ラインです。

モデルの性能比較をする場所ではありません。汎用チャットAIの上に、役割・資料・手順・判断境界・検査条件を重ねて運用する **AI Runtime Overlay / チャットAIマウント型ランタイム** を実際に使いながら更新しています。

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

→ **入力・出力・STOP / PASS・監査・検査を工程へ持たせます。**

### 更新すると全部壊れる

一つの巨大な人格やプロンプトへ全部を詰めると、一部変更が全体へ波及します。

→ **Runtimeを役割ごとに分け、交換・更新・移管できるようにします。**

## Runtimeの役割

現在の公開Runtime群は、役割ごとに分離されています。正本と現行版は [Runtime Public Shelf](https://runtime-public-archive.harmoniets.chatgpt.site/) を優先してください。

| Runtime | 役割 |
| --- | --- |
| DS90 / 設計さん | 設計・条件整理・境界・受け渡し |
| PW90 / 執筆さん | 確定済み条件から本文へ変換 |
| TS90 / 修正刃さま | 修正・検査・本文の整合 |
| NW22 / 野良ちゃん | 外部入力・自由度の高い作業 |
| MT00 / ヌル | マウント移管・状態の引き継ぎ |
| SP00 / ナル | 話パックの切り出し・梱包 |
| MT00_BOOTSTRAP_EA / エーア | 新規Projectの初期配置 |

これはキャラクター設定を分けるためではなく、**責務を分けるため**です。

## AIエージェント運用として見る場合

GPT小説執筆ラインは小説制作を主な実験場にしていますが、構造として扱っているのは次のような一般的な問題です。

- AIエージェントの役割分担
- マルチエージェントのhandoff
- AIワークフローの境界管理
- 正本 / source of truth 管理
- 権限分離と越境防止
- STOP / PASS / validation
- 監査可能な実行記録
- Runtimeの更新・退役・移管
- 長期コンテキストの再現
- 人間による最終採用と公開責任

AIエージェント、agentic workflow、multi-agent system、AI governance、runtime lifecycle など別の名前で探している場合でも、同じ種類の問題をかなり扱っています。

## 読み方

**初見の人間**はポータルから入るのが最短です。

**Runtimeを使いたい人・AI**は Runtime Public Shelf の `START_HERE_ONLINE_RUNTIME.txt` を優先してください。

**過去の公開状態・GitHub配布記録**を確認する場合は以下を参照してください。

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

確認していないものを確認済みとして扱いません。正本Runtimeと解説、作品本文、運用メモ、過去の公開記録は分離して扱います。
