# PW90_AUTO_MOUNT_BOOT_HARD_LOCK_v001

STATUS: beta_runtime_core
APPLIES_TO_RUNTIME: pw90-v004.17-beta-nlcore-nora-guarded-fullburn

## 核

```text
マウント済みは読了ではない。
読了は起動完了ではない。
起動完了は執筆可能ではない。
執筆可能は成功ではない。
成功にはゲート証拠が必要。
```

## 目的

ランタイムZIPがマウントされた時点で、GPT側が通常応答へ流れず、必ず起動検査へ入る状態を作る。
これはZIP内コードの物理自動実行ではなく、GPT応答契約としての強制起動である。

## 状態

```text
MOUNT_SEEN:
  ZIPが見えているだけ。読了・起動・WRITE可能ではない。

BOOT_INSPECTING:
  START_HERE、READ_ORDER、manifest、必須ファイル、ゲートを読んでいる状態。

BOOT_READY:
  ランタイム起動契約は成立。ただし本文はまだ書けない。

WRITE_READY:
  writer_pack_or_handoff / target_story_number / output_format / layer_ON_OFF と対象話パック読了が揃った状態。
```

## 初回マウント時に必須の確認

```text
archive readability
zip integrity
unsafe paths absent
nested zip policy
START_HERE read
READ_ORDER completed
manifest checked
ACTIVE_RUNTIME_CONTRACT constructed
success output contract resolved
write_allowed=false at BOOT_READY
```

## BOOT_READY の制限

BOOT_READY は WRITE_READY ではない。
BOOT_READY後に許可されるのは、INSPECT / REPAIR / WRITE入力待ちである。

## WRITE 禁止条件

以下が一つでもあれば本文生成禁止。

```text
runtime entry unread
READ_ORDER unread
target story pack unread
writer_pack_or_handoff missing
target_story_number missing
output_format missing
layer_ON_OFF missing
character_used unread
frozen unread
execution_queue unread
forbidden lines unread
STOP unresolved
physical missing file
manifest contradiction
```

## 読了の定義

読了扱いにできるのは、ファイルを開き、内容を確認し、役割を分類し、runtime contractへ反映した場合のみ。

読了扱いにできないもの:

```text
ファイル名を見た
manifestに載っていた
ZIP内に存在した
以前似たものを読んだ
ユーザーが差し替えたと言った
```

## 差し替え

同名ZIPでも差し替えられたら旧読了は無効。

```text
OLD_BOOT_READY -> NEW_MOUNT_SEEN -> BOOT_INSPECTING -> BOOT_READY / STOP_AT_INITIAL_MOUNT
```

## 成功顔禁止

ゲート表なしで以下を言わない。

```text
起動しました
読めたので進めます
問題なさそうです
SUCCESS_CANDIDATE
条件は拾えています
```

