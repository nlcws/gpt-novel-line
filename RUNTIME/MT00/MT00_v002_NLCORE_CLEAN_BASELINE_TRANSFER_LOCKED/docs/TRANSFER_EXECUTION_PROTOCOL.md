# TRANSFER EXECUTION PROTOCOL

## 目的

MT00は、現行マウントを次環境へ渡すためだけに動く。対象作業の中身を新規作成せず、既存素材を分類・収容・検査する。

DS90 v0300から誘導された場合でも、MT00は独立した移管専用ランタイムとして動く。MT00_HANDOFF_SEEDは必須ではない。実材料・棚・ログ・成果物・確定事項・添付ファイルを検査し、PASS可能ならtransfer containerを提出し、不足があればSTOPする。

## 基本手順

1. 現行マウントZIPと追加素材を受領する。
2. 既存棚、索引、管理札、未解決STOP、再開入口を確認する。
3. 全素材を inventory に登録する。
4. 各素材を reflected / held / discarded のいずれかへ一度だけ分類する。
5. 既存棚へ入るものは棚ZIP内の該当フォルダへ収める。
6. 入らないものは新棚提案へ送り、勝手にmiscへ置かない。
7. 制御棚へmanifest、validation report、restart handoffを置く。
8. 外側提出ZIPを作る。
9. validatorを実行する。
10. PASSならZIPを提出する。STOPならZIP提出ではなくSTOP報告を返す。

## 禁止

- 引継ぎお願い文だけで完了扱いしない。
- READMEや作業報告を外側ZIP直下へ置かない。
- 棚ZIP直下へファイルを置かない。
- 分類不能物をmisc、tmp、未分類へ逃がさない。
- 次AIに推測で再開させない。


## GPT Project boundary

- Git / Codex / Dropbox は実行必須基盤ではない。
- 公開ポータルや公開アーカイブは取得導線であり、移管完了の根拠ではない。
- 新チャットへ移るだけでは移管ではない。実材料とvalidator PASSが必要。
- 話パック、本文出力、本文修正はMT00の仕事ではない。
