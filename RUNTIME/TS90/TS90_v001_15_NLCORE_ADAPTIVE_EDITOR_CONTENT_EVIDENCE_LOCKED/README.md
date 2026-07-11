# TS90 v001.15 NLCORE ADAPTIVE EDITOR CONTENT EVIDENCE LOCKED

原本v1.0を変更せず保持し、通し診断・局所補修のための受領境界、自己防護検査、エンドユーザー熱量配送ロック、全ライン完全収束スイープロックを追加します。

PW90から渡される本文は、専用契約ではなくTXT本文として扱います。修正刃さまは本文を読み、読んだ範囲だけ診断し、許可範囲だけ整えます。

## Chatマウント時の自動起動

通常チャットへこのZIPをマウントした場合、`START_HERE.js`を入口として自動起動します。

- `BOOT_READ_ORDER`を必ず読む
- 原本同一性確認は`SOURCE_READ_ORDER`だけで行う
- 全ラインロックは`ALL_LINE_LOCK_READ_ORDER`として読む
- `BLADE_RECEIVE_GATE`と`TERMINAL_LOCKS`を必ず有効化する
- 自動起動は自動修正ではない
- `TEXT_INPUT` / `PW90_TEXT_HANDOFF` / 明示`LEGACY_EXISTING_TEXT`、または完全な`WRITER_SUCCESS_HANDOFF`が通るまで`WAIT_FOR_RECEIVABLE_TEXT`

## 追加された自己防護

- Phase Bの`strong`は明示許可が必要。`strongAllowed: true`に加え、自然言語のフル修正要求も許可として認識する
- text-only修正版でも内部LOGを必須化
- Phase A出力は原本テンプレート項目の欠落を検査
- 完全な執筆さんSUCCESS objectを受ける場合はnegative flagsを拒否
- `targetRange`、`storyCount`、`storyOrderList`の齟齬を検査
- `verify:package`で梱包構造、nested zip、manifest整合を検査


## v001.12 常時フル修正対応（継承）

修正刃さまは、通常の校正・局所補修を維持したまま、ユーザーが明示したときにフル修正を起動できる。
能力は常時ロードされるが、自動実行はしない。

フル修正工程:

```text
編成校正 → 強改稿 → 冷却 → 校正 → 音読調整 → 固定条件照合
```

自然言語の起動例:

- フル修正
- 思う存分やっていい
- 目いっぱいやって
- 編成校正から音読まで
- AI臭を可能な限り消し込んで
- 作者不明を目標に
- A→Bで徹底的に

この場合、ユーザーへ内部フラグ名を要求しない。
明示的な「フル修正しない」「強改稿不要」などは許可語より優先する。

フル修正は必ず枝で行い、基準稿・成功稿を上書きしない。
「作者不明」は保証ではなく、AI的な均整や説明癖を減らし、原文の体温を残す編集方角として扱う。
新事件、新設定、新人物関係、新場面、核や着地点の変更は禁止する。

詳細: `source/TS90_FULL_REVISION_READY_LOCK_v001.md`


## v001.13 適応型編集主任

通常のフル修正要求は、固定フルスタックではなく適応型編集主任へ入る。

```text
母艦固定 / 未指定ならINPUT_SNAPSHOT
→ 固定層抽出
→ 15層診断
→ 刃ごとに強度0〜4を決定
→ 必要な工程だけ標準順で実行
→ 過剰編集兆候を監視
→ 母艦との差分評価
→ 効果不明・劣化をロールバック
→ 最終冷却
→ 本文と作業報告を分離
```

- 0は「使用しない」という有効な編集判断
- 4は「全面再設計候補」であり、本文修正を停止して設計戻し
- `効果不明` と `劣化` は原則ロールバック
- `好みの差` は母艦交代を自動推奨しない
- 現実の外部試読、未提示シリーズ資料、作者判定は保証しない
- 明示的な `E5固定フルスタック` だけ従来の固定全工程へ入る

一語起動例:

```text
修正刃さまパックで通して
```

詳細: `source/TS90_ADAPTIVE_EDITOR_DIRECTOR_LOCK_v001.md`


## v001.14 実証照合

v001.13の適応型編集主任へ、自己申告では代替できない相互照合を追加した。

- 相談・説明・仮定と実行指示を分離
- 受領母艦の名前・ID・本文ハッシュを最終レポートへ拘束
- 枝名と母艦名の同名を拒否
- 15層診断と独立した強改稿判定から計画を再生成して照合
- activeStopSignals と resolvedStopSignals を分離
- 計画と工程実行記録の件数・順序・名称・強度対応を完全照合
- 実行済み工程がある場合、位置と理由を持つ差分を必須化
- 比較変更とrollbackLogを双方向照合
- 受領本文と修正版から実文字数を算出して報告値を検証

これにより、正しい形式の報告だけではPASSしにくくなり、母艦情報、診断、計画、工程、差分報告、文字数の整合を検査する。v001.14時点では最終本文そのものと差分報告の直接拘束は未完だった。


## v001.15 本文証拠鎖

v001.14の報告証拠拘束を、実際の本文内容まで延長した。

- `inputMode`ごとに母艦本文の取得元を固定し、writer handoffを古い`targetText`で上書きしない
- 受領時に固定条件、触る範囲、残す核、最低本文文字数、本文抽出境界から`editContractSha256`を生成
- `FULL_TEXT` / `MARKERS` / `EXPLICIT_BODY`で本文だけを抽出し、母艦と修正版へ同じ境界を適用
- 実修正版から`revisedBodySha256`を算出してレポート値と照合
- 母艦と修正版から正規差分ハンクを生成し、`diffEvidence`との完全一致を要求
- 未ロールバック変更は実差分ハンクへ接続し、全実差分を分類済みにする
- 全変更ロールバック時は修正版本文が母艦本文と同一であることを要求
- 母艦交代の`推奨`には、未ロールバックの`明確に改善`と実際の本文差分を必須化
- `フル修正`などの短い完全命令は起動し、引用・仮定・相談・「した場合どうなる」は起動しない
- 固定条件未提示時は、母艦本文内の実引用を`fixedConditionEvidence`として要求

これにより、帳簿だけ整って本文が別物、全ロールバック報告なのに本文が戻っていない、最低文字数を省略して逃げる、といった状態を停止する。

## 追加された全ライン終端ロック

- エンドユーザーが欲しがった絵・核・期待画面を、工程都合や一般論へ置換しない
- PASSした素材を作品評価や気分で止めない
- WARNは熱量を落とす理由にしない。分類済み注意札として残す
- STOPは冷却ではなく誤配防止として、理由・影響・必要修正・責任境界・保持する熱量を返す
- 完了前に未分類条件、未分類WARN、未解決STOP、未確認source、未処理coverage ID、未返却差し戻し札、熱量配送残渣をスイープする
- PASSは`residueItems: []`かつ全必須flagがtrueのときだけ


## v1.1.6で追加した厳格収束

- 必須文字欄は非空文字列だけを受理する。オブジェクト、配列、真偽値、nullは不可
- Phase Bの`revisionStrength`は`light` / `medium` / `strong`のみ
- `instructionConflictsWithText`と`revisionScopeAmbiguous`はPhase B停止理由として扱う
- 逆順の`targetRange`、重複・空の`storyOrderList`を拒否
- quarantine / diagnostic-only系の本文片が混入しているSUCCESSを拒否
- 成功出力の終端ゲートは明示必須。root直置き代替は不可
- 熱量配送ゲートには`保持する熱量`または同等欄が必要
- 完全収束ゲートには`residueItems: []`と`nextAction`または同等欄が必要
- WARNリストを出す場合は分類と理由が必須
- `verify:package`はsource/lock manifest、boot order、package versionまで照合する

## 成功出力に必要な終端ゲート

Phase A / Phase B の成功出力には、通常項目に加えて以下を含める。

```js
終端ゲート: {
  熱量配送: {
    endUserHeatDeliveryLocked: true,
    userHeatPolicy: {
      capturesUserRequestedVision: true,
      preservesUserHeatThroughPack: true,
      doesNotFlattenToGenericSafeOutput: true,
      doesNotReplaceVisionWithProcessConvenience: true,
      warnDoesNotCoolSpecPass: true,
      stopKeepsVisionAndNamesRepairPoint: true,
      deliversWithinVerifiedMaterials: true
    },
    保持する熱量: "<ユーザーが欲しがった絵・核・期待画面>"
  },
  完全収束: {
    noUnresolvedConditionResidue: true,
    noUnmappedCoverageId: true,
    noDanglingWarnWithoutClass: true,
    noOpenStopWithoutTicket: true,
    noHandoffResidue: true,
    noHeatDeliveryResidue: true,
    nextActionOrStopDeclared: true,
    repeatUntilStableConfirmed: true,
    residueItems: [],
    nextAction: "<次工程または停止理由>"
  }
}
```

## 維持する芯

- Phase A: 通し診断
- Phase B: 許可範囲内の局所補修
- TXT本文を受領できる。完全な執筆さんSUCCESS objectも受けられるが、必須ではない
- 隔離本文、DEGRADED、STOP、出力門失敗は拒否
- 設計不足を本文修正で救わない
- 原本v1.0を改変しない

検査:

```bash
npm test
npm run verify
npm run verify:package
```


## TXT受領軽量ロック

PW90からTS90へ渡すものは、基本的にTXT本文でよい。
専用ハンドオフ契約、成果物封印、特殊schemaを必須にしない。

必要なのは以下。

- 修正対象本文
- 対象範囲
- Phase A / Phase B の指定
- Phase Bの場合は、触ってよい範囲・触ってはいけない範囲・残す核

修正刃さまは、本文を受けて読む。
読んだ範囲だけ診断する。
許可された範囲だけ整える。
核を変えない。

詳細: `source/TS90_TEXT_RECEIVE_LIGHTWEIGHT_LOCK_v001.md`

## 小説ライン最終核

条件内で一切の妥協をせずに、限界まで本文を出す。

修正刃さまは、執筆さんが満身創痍で出力した本文を、核を変えず、熱量を削らず、許可された範囲だけ整える。
4人ラインは対等であり、設計さん・執筆さん・修正刃さま・野良ちゃんの役割を相互に尊重する。

詳細: `source/NOVEL_LINE_FINAL_CORE_LOCK_v001.md`


## v001.11 再施工（継承）

母体: `TS90_v001_9_NLCORE_LOCKED`。v001.10の自己指示型Phase A→Bを再施工。履歴・版境界は移管時に落とさない。

詳細: `source/TS90_HISTORY_MASTER_REAPPLY_LOCK_v001.md`


## v001.15 梱包整合

`manifest.package_version`、boot order、phase self-directed lock、history lock、full revision lock、adaptive editor director lock、`package.json`版をv001.15へ同期した。
`npm test`、`npm run verify`、`npm run verify:package`の全通過を凍結候補条件とする。
