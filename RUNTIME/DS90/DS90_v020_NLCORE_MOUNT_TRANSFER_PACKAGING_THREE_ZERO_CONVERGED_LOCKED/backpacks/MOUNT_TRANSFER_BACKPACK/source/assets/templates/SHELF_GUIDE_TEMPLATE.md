# SHELF_GUIDE_TEMPLATE.md
# 既存再開メモ軽量化 / 棚行先案内テンプレート

区分: OSテンプレート
状態: 候補
注意: これは作品棚ではない。具体作品名、日付つき作業ログ、LOCK本文を入れない。

---

## 方針

再開メモは補助メモである。
再開メモは棚本文を保持しない。
再開メモは必要時のみ、読む順、最重要STOP、次作業、棚リンク、STOP_TAG所在だけを短く表示する。通常の現在地共有はEND_LOGで行う。

作品固有の本文、LOCK、作業台、制度設計、移管履歴は、対象プロジェクト側の棚へ置く。
090_DS内には、作品固有棚を入れない。

---

## 棚リンクの書き方

再開メモには、本文ではなく参照先だけを書く。

```text
TAG_INDEX: <project-root>/TAG_INDEX.txt
LOCK_INDEX: <project-root>/<LOCK_INDEX or relevant shelf file>
WORKBENCH_LOG: <project-root>/<WORKBENCH_LOG or relevant shelf file>
DESIGN_LOG: <project-root>/<DESIGN_LOG or relevant shelf file>
TRANSFER_RULE: 090_EXTERNAL_TOOLS/095_DS_MOUNT_TRANSFER.md
TRANSFER_MANIFEST: <project-root>/<latest transfer manifest>
```

---


## INDEX_MAP / STOP_TAGリンクの書き方

再開メモには、必要時のみ最上位索引とSTOP_TAG辞書への参照先を置いてよい。

```text
INDEX_MAP: <project-root>/000_INDEX_MAP.md
STOP_TAG_INDEX: <project-root>/STOP_TAG_INDEX.md
```

再開メモにSTOP_TAGの意味本文を貼らない。

STOP_TAGの意味本文は `STOP_TAG_INDEX.md` へ置く。

作品固有STOP_TAG辞書を090_DSへ入れない。


## 再開メモ上限

- 現在地: 3行以内
- 読む順: 5件以内
- STOP: 7件以内
- 次作業: 3件以内
- 棚リンク: 7件以内
- STOP_TAG所在: 3件以内
- 60行超え = 棚掃除対象
- 80行超え = 作業前に棚掃除優先
- 120行超え = 作業停止して退避優先

---

## 棚未整備時

棚が未整備でも、再開メモやEND_LOGへ全文を溜めない。
棚がない場合は「仮参照先未整備」と明記し、今回読む資料だけを並べる。
必要になった時点で仮LOG名を立てて、次回マウント移管候補へ送る。

---

## 禁止

- 090_DSへ作品固有のLOCK本文を入れない。
- 090_DSへ現行プロジェクトの作業台を入れない。
- 090_DSへ制度設計ログを入れない。
- 090_DSへ日付つき移管manifestを入れない。
- 再開メモやEND_LOGへ長文履歴を戻さない。

- 既存再開メモへSTOP_TAGの意味本文を貼らない。
- 090_DSへ作品固有STOP_TAG辞書を入れない。
