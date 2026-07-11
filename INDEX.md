# INDEX

GPT小説執筆ライン公開棚の索引です。

このリポジトリは、チャットAIマウント型ランタイムの公開可能資料、現行安定版ZIP、役割説明、更新履歴を置くための公開棚です。

## 入口

- [README.md](README.md)  
  このリポジトリ全体の説明。

- [CURRENT_STATUS.md](CURRENT_STATUS.md)  
  現在の公開状態、現行安定版、読む順番。

- [CHANGELOG.md](CHANGELOG.md)  
  公開棚の更新履歴。

## ランタイム本体

現行安定版ランタイムZIPは、以下に置く。

- [RUNTIME_ZIP/](RUNTIME_ZIP/)

現在の構成は以下の4系統。

- DS90 v020 NLCORE STABLE LOCKED  
  設計さん。素材、条件、話パック、棚、移管を扱う設計担当。

- PW90 v004.21c NLCORE STABLE LOCKED  
  執筆さん。話パックを小説本文へ完全燃焼させる正規執筆担当。

- TS90 v001.15 NLCORE STABLE LOCKED  
  修正刃さま。既存本文を診断し、必要な箇所だけを補修する後工程担当。

- NW22 v002.5 NLCORE STABLE LOCKED  
  野良ちゃん。正規ライン外で自由執筆、試作、発想展開を行う独立炉。

## 分解棚

分解済みまたは参照用の棚は以下に置く。

- [RUNTIME/](RUNTIME/)

ここには、各ランタイムごとの参照用フォルダを置く。

- [RUNTIME/DS90/](RUNTIME/DS90/)
- [RUNTIME/PW90/](RUNTIME/PW90/)
- [RUNTIME/TS90/](RUNTIME/TS90/)
- [RUNTIME/NW22/](RUNTIME/NW22/)

## 読む順番

初見または再起動時は、以下の順で確認する。

1. [README.md](README.md)
2. [CURRENT_STATUS.md](CURRENT_STATUS.md)
3. [RUNTIME_ZIP/README.md](RUNTIME_ZIP/README.md)
4. 必要なランタイムZIP
5. 必要に応じて [RUNTIME/](RUNTIME/) 側の分解棚

## 注意

このリポジトリは公開情報のみを扱う。

非公開資料、制作途中資料、未整理の作業母艦は含めない。

この棚は公式仕様や唯一の正本ではなく、公開可能なランタイム置き場と索引である。  
実際の起動、精査、改修、移管は、各チャットまたは作業環境で行う。
