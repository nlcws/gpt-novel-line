export const OPERATIONS = Object.freeze({
  BOOT: {
    triggers: ["boot", "起動"],
    required: [],
    tool: "CORE"
  },
  CHECK: {
    triggers: ["check", "検査", "検収", "完了確認", "stop判定"],
    required: ["project"],
    tool: "CHECK"
  },
  TAG_SEARCH: {
    triggers: ["tag_search", "タグ検索", "まとめ検索", "索引"],
    required: ["project", "query"],
    tool: "TAG_SEARCH"
  },
  CARD: {
    triggers: ["card", "話カード", "v2", "work_unit_card"],
    required: ["project", "sources"],
    tool: "CARD"
  },
  CARD_TEST: {
    triggers: ["card_test", "カード検査", "比較検証"],
    required: ["project", "card"],
    tool: "CARD_TEST"
  },
  LOG: {
    triggers: ["log", "ログ", "シミュレーション"],
    required: ["project", "sources"],
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
      "重いから",
      "restart handoff",
      "current mount transfer",
      "runtime handoff packaging"
    ],
    required: ["project", "currentMount", "sources"],
    tool: "MOUNT_TRANSFER"
  },
  ARCHIVE: {
    triggers: ["archive", "退避", "削除候補"],
    required: ["project", "sources"],
    tool: "ARCHIVE"
  },
  SINGLE_EPISODE_PROFILE_GATE: {
    triggers: ["single_episode_profile_gate", "単話プロファイル作成可否", "単話プロファイル作成"],
    required: ["project", "episodeProfile"],
    tool: "SINGLE_EPISODE_PROFILE_GATE"
  },
  EPISODE_PACK: {
    triggers: ["episode_pack_legacy", "旧話パック検査", "単話束検査"],
    required: ["project", "episodePack"],
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
      "WRITE投入候補"
    ],
    required: ["project", "packCutout", "dsgn"],
    tool: "PACK_CUTOUT"
  }
});

export const SOURCE_POLICY = Object.freeze({
  END_LOG: "NON_CANONICAL",
  RESTART_MEMO: "NON_CANONICAL",
  TAG_INDEX: "NON_CANONICAL",
  STOP_TAG_INDEX: "NON_CANONICAL",
  SAMPLE: "ISOLATED",
  REPORT: "AUDIT_ONLY",
  MANIFEST: "META_ONLY",
  PROJECT_SOURCE: "SOURCE",
  PROJECT_CANON: "CANONICAL"
});
