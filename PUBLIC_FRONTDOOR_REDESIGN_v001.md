# GPT小説執筆ライン ポータル 全面改修仕様 v001

目的は一つです。

**検索で見つけた人が、専門用語や内部棚構造を知らなくても「何があるか」「何に使えるか」「どこから使うか」を30秒以内に理解できるようにする。**

既存の作品棚・公開方針・Runtime棚は壊しません。玄関を作り直し、内部構造は奥へ下げます。

---

## 1. TOPの役割

TOPは既存利用者向けの索引ではなく、初見の人間向けの説明ページに変更します。

### Hero

#### H1

GPT小説執筆ライン

#### Subhead

AIを一人の万能社員として使わず、役割・引き継ぎ・検査・監査を分けて長期運用するための、AI Runtime / マルチエージェント実験・公開ライン。

#### Short copy

小説制作から始まりましたが、扱っている問題は小説だけではありません。

- AIエージェントの役割分担
- 担当外への越境防止
- handoff / 引き継ぎ
- source of truth / 正本管理
- STOP / PASS / validation
- audit / 監査
- Runtimeの更新・移管・再開

モデル性能ではなく、**人間が使い続けられる運用**を作っています。

#### Primary CTA

`Runtimeを見て使う`
→ Runtime Public Shelf

#### Secondary CTA

`どういう仕組みか読む`
→ TOP内「AIエージェント運用として見る」

#### Tertiary CTA

`自由利用の方針を見る`
→ Public Release Policy

---

## 2. TOP直下「これは何？」

### H2

一つのAIに全部やらせない

本文：

一つのAIへ設計、執筆、修正、記録、移管まで全部を任せると、能力が高くても仕事の境界が混ざります。

人間の組織なら、営業・経理・法務・監査を一人へまとめません。

このラインも同じ考え方で、AIの役割を分け、読む資料、判断できる範囲、次へ渡す条件を分離しています。

難しい仕組みを作ることが目的ではありません。

**使っている人間が一番楽に、壊れた場所を見つけやすく、直しやすく、続きから再開しやすい形にした結果です。**

---

## 3. 「何が困るの？」セクション

カード4枚。

### 役割が混ざる

設計中の仮案を本文担当が確定したり、修正担当が作品そのものを作り替えたりする。

→ 役割と判断境界を分ける。

### 長期作業で前提が消える

「前に決めたはず」を会話記憶だけへ置くと、再開時に復元事故が起きる。

→ 正本、CURRENT、HOLD、handoffを外へ出す。

### AI同士をつないだだけでは追えない

接続できても、誰が何を受け取り、何を確定し、なぜ止まったか分からない。

→ input / output / STOP / PASS / auditを工程へ持たせる。

### 更新すると全体が壊れる

巨大な一体型プロンプトでは、一箇所の変更が全体へ波及する。

→ Runtimeを役割単位に分け、交換・更新・移管する。

---

## 4. 「Runtime」セクション

初見向けなのでZIP名・版番号をTOPへ並べない。

| 名前 | 何をする |
| --- | --- |
| 設計さん / DS90 | 条件を整理し、何を確定してよいかを決める |
| 執筆さん / PW90 | 確定した材料を本文へ変換する |
| 修正刃さま / TS90 | 本文を検査し、必要な範囲だけ修正する |
| 野良ちゃん / NW22 | 外から来た題材や自由度の高い仕事を扱う |
| ヌル / MT00 | 状態と棚を次の環境へ移管する |
| ナル / SP00 | 話単位の材料を切り出して渡す |
| エーア / EA | 新しいProjectへ初期状態を配置する |

CTA:

`現行Runtimeを開く`
→ Runtime Public Shelf

補足：

キャラクター名はUIです。分けている本体は**責務・権限・入出力**です。

---

## 5. 「AIエージェント運用として見る」セクション

### H2

小説用の変な仕組み、ではありません

検索で次の語から来た人へ明示する。

- AIエージェント
- multi-agent / マルチエージェント
- agentic workflow
- AI orchestration
- AI governance
- AI runtime
- handoff
- audit
- source of truth
- permission / role separation
- lifecycle management

本文：

GPT小説執筆ラインは小説制作を主な実験場にしています。

ただし、小説だから必要になった仕組みではありません。

長期タスクでAIへ仕事を任せると、分野に関係なく「誰が決めるか」「何を読ませるか」「どこで止めるか」「誰へ渡すか」「何を記録するか」「どう更新するか」が必要になります。

この公開ラインは、その問題を実際の長期運用で踏みながら直してきた実装例です。

---

## 6. 「自由に持っていってください」セクション

### H2

使う、改造する、別の名前で育てる

強調表示：

**Free Runtime. Free Use. No Attribution Required. Use at Your Own Responsibility.**

本文：

利用、改変、再配布、商用利用、再構成、再公開、派生物の公開を妨げません。

作者名を前へ出すことも目的にしていません。

自分の用途へ作り替え、別の名前で育てても構いません。

ただし、利用・保守・法令順守・第三者権利・公開判断・サポートは利用者自身で引き受けてください。

CTA:

`公開方針を全文読む`
→ /public-release-policy

---

## 7. 「どこから入る？」セクション

4択だけにする。

### Runtimeを使いたい
→ Runtime Public Shelf

### 仕組みを知りたい
→ AI運用解説 / note玄関記事

### 小説や作品を見たい
→ 作品棚

### 公開資料・履歴を確認したい
→ GitHub公開棚

内部棚の `021_G / 022_B / 024_V / 028_H / 000_C` はこの下、Advanced / Archiveへ移動。

---

## 8. Advanced / Archive

既存利用者、監査、再現用。

ここで初めて以下を出す。

- 正本
- READ_ORDER
- manifest
- shelf
- 000_C
- 021_G / 022_B / 024_V / 028_H
- SHA-256
- version history
- validation report

TOPでこれを先に見せない。

---

## 9. SEO

### title

GPT小説執筆ライン | AIエージェント運用・マルチエージェント・AI Runtime公開実装

### meta description

AIエージェントを役割・権限・引き継ぎ・検査・監査に分けて長期運用するAI Runtime Overlayの公開実装。マルチエージェント、handoff、source of truth、validation、lifecycle管理を実運用ベースで公開。Runtimeは自由利用・改変・再配布可。

### H1

GPT小説執筆ライン

### visible keywords

本文へ自然に以下を含める。

AIエージェント / マルチエージェント / AI Runtime / Runtime Overlay / agentic workflow / handoff / AI governance / audit / source of truth / validation / lifecycle / 権限分離 / 長期コンテキスト

### JSON-LD

SoftwareSourceCode または WebSite + CreativeWork を使用。

name: GPT小説執筆ライン
alternateName: GPT Novel Line
keywords: 上記検索語
license: public release policy URL
codeRepository: GitHub URL
sameAs: note / Runtime Public Shelf

「OpenAI公式」「業界標準」「標準規格」等とは書かない。

---

## 10. sitemap優先順位

1. `/`
2. `/runtime` または Runtime Public Shelfへの案内ページ
3. `/ai-agent-runtime` 新設推奨
4. `/public-release-policy`
5. `/works`
6. `/verification`
7. `/archive`

新設推奨 `/ai-agent-runtime` は、検索着地専用の長文ページ。

---

## 11. `/ai-agent-runtime` 新設ページ

H1:

AIエージェントを「会社」として運用する

導入：

AIモデルが賢くなるほど、一つのAIへ仕事を集めるより、役割・権限・受け渡し・監査を設計する問題が大きくなる。

構成：

1. 一人の万能社員に全部の権限を渡しますか
2. AIでも役割分離が必要になる
3. 接続だけでは運用にならない
4. handoffと正本が必要になる
5. 更新・移管・退役が二周目で必要になる
6. GPT小説執筆ラインで実際にどう分けているか
7. Runtimeを自由に持っていく

このページをnote玄関記事からリンクする。

---

## 12. UI

- TOPは白地または現行デザインを保持してよい
- 内部コード名をファーストビューへ並べない
- CTAは最大3個
- 初見向け文章は1段落3〜5行以内
- 表はRuntime役割表のみ
- 「Free Runtime」は必ずファーストビューまたは直下へ表示
- 作品サイトの雰囲気は残す
- 企業製品サイト化しない

狙いは営業ではありません。

**見つけた人が、自分で価値を判断して、自分で持っていける玄関を作ること。**
