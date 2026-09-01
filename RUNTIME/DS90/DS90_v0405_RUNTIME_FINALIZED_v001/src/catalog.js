export const OPERATIONS = Object.freeze({
  BOOT: {
    triggers: ["boot", "起動"],
    required: [],
    tool: "CORE"
  },
  CHECK: {
    triggers: ["check", "検査", "検収", "完了確認", "stop判定"],
    required: ["externalContext"],
    tool: "CHECK"
  },
  TAG_SEARCH: {
    triggers: ["tag_search", "タグ検索", "まとめ検索", "索引", "検索"],
    required: ["externalContext", "search"],
    tool: "TAG_SEARCH"
  },
  CARD: {
    triggers: ["card", "話カード", "v2", "work_unit_card"],
    required: ["externalContext", "sources"],
    tool: "CARD"
  },
  CARD_TEST: {
    triggers: ["card_test", "カード検査", "比較検証"],
    required: ["externalContext", "card"],
    tool: "CARD_TEST"
  },
  LOG: {
    triggers: ["log", "ログ", "シミュレーション"],
    required: ["externalContext", "sources"],
    tool: "LOG"
  },
  MOUNT_TRANSFER: {
    triggers: [
      "mount_transfer",
      "マウント移管",
      "現行マウント移管",
      "移管",
      "反映引継ぎ",
      "引継ぎ",
      "棚掃除",
      "棚更新",
      "マウント更新",
      "差し替え前",
      "差し替え前整理",
      "別個体",
      "次チャット",
      "チャットを跨ぎたい",
      "チャットを跨ぐ",
      "スレッドを跨ぎたい",
      "跨ぎたい",
      "重いから",
      "上限対策",
      "コンテキスト上限",
      "スレッド上限",
      "ヌル",
      "ヌル投入",
      "MT00",
      "MT00 / ヌル",
      "restart handoff",
      "current mount transfer",
      "runtime handoff packaging"
    ],
    required: [],
    tool: "SPECIALIST_DISPATCH",
    fallbackTool: "MOUNT_TRANSFER",
    specialistTarget: "MT00"
  },
  MOUNT_ZIP_BOOTSTRAP: {
    triggers: [
      "mount_zip_bootstrap",
      "mount zip bootstrap",
      "マウントZIP構築",
      "マウントzip構築",
      "マウントZIPを構築",
      "マウントzipを構築",
      "マウントZIP作成",
      "マウントzip作成",
      "初回Project",
      "初回プロジェクト",
      "初回棚立て",
      "初回棚生成",
      "新規Project棚",
      "新規プロジェクト棚",
      "エーア",
      "エーア投入",
      "MT00_BOOTSTRAP",
      "MT00_BOOTSTRAP_EA"
    ],
    required: [],
    tool: "SPECIALIST_DISPATCH",
    specialistTarget: "MT00_BOOTSTRAP_EA"
  },
  SPECIALIST_HANDOFF: {
    triggers: [
      "specialist_handoff",
      "専門ランタイム",
      "専門子",
      "GPT内完結",
      "GPTサイト",
      "プロジェクト内完結",
      "執筆さん",
      "執筆さん投入",
      "執筆さん受領チェッカー",
      "受領チェック",
      "受領確定",
      "story_pack_receiver_check",
      "PW90_STORY_PACK_RECEIVER_CHECKER",
      "PW90",
      "PW90投入",
      "本文出力",
      "本文生成",
      "修正刃",
      "修正刃さま",
      "修正刃さま投入",
      "本文修正",
      "修正指示",
      "TS90",
      "TS90投入",
      "runtime line handoff"
    ],
    required: [],
    tool: "SPECIALIST_DISPATCH"
  },
  ARCHIVE: {
    triggers: ["archive", "退避", "削除候補"],
    required: ["externalContext", "sources"],
    tool: "ARCHIVE"
  },
  SINGLE_EPISODE_PROFILE_GATE: {
    triggers: ["single_episode_profile_gate", "単話プロファイル作成可否", "単話プロファイル作成"],
    required: ["externalContext", "episodeProfile"],
    tool: "SINGLE_EPISODE_PROFILE_GATE"
  },
  EPISODE_PACK: {
    triggers: ["episode_pack_legacy", "旧話パック検査", "単話束検査"],
    required: ["externalContext", "episodePack"],
    tool: "EPISODE_PACK"
  },
  PACK_CUTOUT: {
    triggers: [
      "pack_cutout",
      "梱包さん",
      "梱包さんを起動",
      "梱包作業",
      "荷造り",
      "話パック",
      "話パック生成",
      "話パック検査",
      "話パック正本候補",
      "writer package",
      "pack writer handoff",
      "WRITE投入候補",
      "ナル",
      "ナル投入",
      "SP00",
      "SP00 / ナル",
      "story pack cutout"
    ],
    required: [],
    tool: "SPECIALIST_DISPATCH",
    fallbackTool: "PACK_CUTOUT",
    specialistTarget: "SP00"
  }
});

export const SOURCE_POLICY = Object.freeze({
  END_LOG: "NON_CANONICAL",
  RESTART_MEMO: "NON_CANONICAL",
  SAMPLE: "ISOLATED",
  REPORT: "AUDIT_ONLY",
  MANIFEST: "META_ONLY",
  TAG_INDEX: "NON_CANONICAL",
  STOP_TAG_INDEX: "NON_CANONICAL",
  PROJECT_SOURCE: "SOURCE",
  PROJECT_CANON: "CANONICAL"
});

export const CONSULT_ONLY_PHRASES = Object.freeze([
  "相談",
  "説明",
  "方針だけ",
  "実行不要",
  "まだ作業しない",
  "どうなる",
  "とは",
  "って何",
  "意味",
  "教えて",
  "確認だけ",
  "相談したいだけ"
]);

export const EXECUTION_DIRECTIVE_PHRASES = Object.freeze([
  "作成",
  "生成",
  "投入",
  "進めて",
  "実行",
  "確定したので",
  "やって",
  "移管しよう",
  "起動"
]);

export const ROLE_ALIAS_BOUNDARY = Object.freeze({
  MOUNT_TRANSFER: {
    preferred: "MT00 / Nul / ヌル",
    not: ["SP00 / Nal / ナル"]
  },
  MOUNT_ZIP_BOOTSTRAP: {
    preferred: "MT00_BOOTSTRAP / Ea / エーア",
    not: ["MT00 / Nul / ヌル", "SP00 / Nal / ナル"]
  },
  PACK_CUTOUT: {
    preferred: "SP00 / Nal / ナル / 話パックさん",
    legacyAliases: ["梱包さん"],
    not: ["MT00 / Nul / ヌル"]
  }
});
