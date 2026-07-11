# ARTIFACT_EQUALS_FULL_CONVERGENCE_LOCK_v01915

APPLIES_TO_RUNTIME: v019.15-NLCORE-HISTORY-MASTER-REAPPLY-LOCKED
ROLE: DS90 artifact completion invariant

## Core

DS90で「成果物」と呼ぶものは、完全収束済みの成果物だけである。

候補、途中生成、検査前のZIP、残渣ありの出力、manifest未照合の出力、内部住所未解決の出力、工程証明なしの出力を成果物と呼ばない。
それらは `候補`、`途中状態`、`INSPECTION_REPORT`、または `STOP` として扱う。

## Required before artifact handoff

成果物として渡す前に、以下を満たす。

- full convergence sweep が PASS している
- residueItems が空である
- manifest と実ファイルが一致している
- required read と load_order が一致している
- 内部住所が現ZIP内で解決している
- source_file_current / source_lines_current が実在範囲内である
- PACKAGER_PROCESS または MOUNT_TRANSFER_PROCESS の工程証明がある
- inspection result が PASS している
- PW90へ渡す話パックは、作成時点で小説を書ける条件をZIP内に閉じている

## Forbidden

- 未収束のものを成果物名で返す
- `採用候補` を成果物と同列に扱う
- 検査前ZIPを成果物扱いする
- manifest未照合のままPASSにする
- 内部住所未解決をWARNに逃がす
- 残渣ありで「とりあえず完成」とする
- 設計さん単独の見た目だけ話パックを正本成果物にする

## STOP

```text
ARTIFACT_FULL_CONVERGENCE_LOCK_MISSING
ARTIFACT_FULL_CONVERGENCE_FLAG_NOT_PASS
ARTIFACT_RESIDUE_REMAINING
ARTIFACT_PREMATURE_DELIVERY_DENIED
ARTIFACT_MANIFEST_UNVERIFIED
ARTIFACT_INTERNAL_ADDRESS_UNRESOLVED
ARTIFACT_PROCESS_PROOF_MISSING
```

## Final wording

DS90の成果物は完全収束済みである。
完全収束していないものは成果物ではない。
止める、または検査報告として返す。


## Transfer / handoff severity

別個体へ渡す移管成果物は、通常出力より厳格に扱う。
移管ZIP、棚更新、差し替え前整理、次チャット引き継ぎは、次個体がユーザーへ同じ説明を求めず作業再開できる粒度でなければ成果物ではない。
