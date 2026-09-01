# 030_VERSION_STATUS｜現行版・旧版・保管物の定義
状態：CURRENT / CANON GATE

---

## 1. 現行正本

- 現行パッケージ名：`NOVEL_OPERATION_MOUNT_V1_20260424`
- 現行状態：`CURRENT`
- 正本ディレクトリ：`10_CANON/`
- ゲートディレクトリ：`00_GATE/`
- 補助ディレクトリ：`20_ROLE_APPENDICES/`
- 非正本ディレクトリ：`30_REFERENCE_LOGS/`
- 外部/旧standalone archive：旧filelist/changelogに名前だけ保持。現行DS90同梱物には含めない。

---

## 2. 旧版の扱い

- `NOVEL_OPERATION_MOUNT_v0001_20260424.zip` は `SUPERSEDED`
- `NOVEL_OPERATION_MOUNT_v0002_20260424.zip` は `SUPERSEDED`
- `NOVEL_OPERATION_MOUNT_v0003_20260424_USER_RESPONSIBILITY.zip` は `SUPERSEDED`
- `NOVEL_OPERATION_MOUNT_v0004_20260424_USER_RESP_VERIFICATION_LANE.zip` は `SUPERSEDED`
- `NOVEL_OPERATION_MOUNT_v0005_20260424.zip` は `SUPERSEDED`
- `shared_operation_mount_20260424.zip` は `ARCHIVE`
- `writer_operation_bone_20260424.zip` は `ARCHIVE`
- `STANDARD_CARD_MOUNT_v0001_20260424.zip` は `ARCHIVE`
- `小説制作【絶対指針】.zip` は `ARCHIVE`

旧版の名称・当時のsize/hashは旧filelist/changelogへ参照記録として残す。  
旧ZIP実体は現行DS90同梱物に含めず、その不在を起動STOPにしない。  
ただし、**現行運用を支配しない**。  
旧版を根拠に current を黙って巻き戻さない。

---

## 3. 状態語の意味

- `CURRENT`：現行正本。運用を支配する。
- `SUPERSEDED`：かつての正本。参照用。現行を支配しない。
- `ARCHIVE`：保管物。経緯確認用。運用を支配しない。
- `RAW`：生LOG / 原文。熱量保持のために残すが、現行運用は支配しない。

---

## 4. 改版時の原則

現行を上書きしたい場合、チャット断片で済ませない。  
**新しい版番号を持つZIPを起こす**。  
その際、設計側確認、執筆側確認、必要改修、双方受領、双方最終確定宣言を必ず通す。  
「口頭では変わっている」は採らない。

---
