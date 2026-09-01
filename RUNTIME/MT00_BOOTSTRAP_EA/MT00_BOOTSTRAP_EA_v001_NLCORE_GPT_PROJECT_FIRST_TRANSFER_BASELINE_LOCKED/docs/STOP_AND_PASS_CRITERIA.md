# STOP AND PASS CRITERIA

## PASS

- 現行マウントが提示されている。
- 既存棚と索引を確認済み。
- 全素材が inventory に載っている。
- 全素材が reflected / held / discarded のいずれかへ一度だけ分類されている。
- 外側提出ZIPが1つだけ。
- 外側ZIP直下が棚ZIPだけ。
- 棚ZIP直下がフォルダだけ。
- 制御棚manifestとvalidation reportがある。
- validatorがPASSする。
- 次環境が推測なしで再開できる。

## STOP

- 現行マウントがない。
- 直下ファイル・直下フォルダ・loose fileがある。
- 未分類物がある。
- 新棚提案なしに分類不能物を置いた。
- manifestが実体と一致しない。
- sha256不一致がある。
- 再開入口・read orderがない。
- 未解決STOPがある。
- 説明、要約、お願い文だけで完了を名乗っている。
