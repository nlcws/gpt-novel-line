# DESIGNER_LOOKUP_PROTOCOL_V1

STATUS: complete_candidate
PURPOSE: 梱包さんが設計さん/正本辞書から必要箇所だけ引くためのプロトコル。

---

# 1. PRINCIPLE

全部を持つ。  
でも全部は読まない。  
必要箇所だけタグで引く。

設計さん本体は正本・辞書・プリセットを保持してよい。  
梱包さんは通常 light core だけを常設し、曖昧・変更・事故時に lookup を投げる。  
執筆さんへは lookup 結果をそのまま渡さず、frozen 最小値だけ渡す。

---

# 2. LOOKUP_REQUEST

```yaml
LOOKUP_REQUEST:
  requester: packager
  episode_id:
  purpose:
  symptom_or_question:
  current_tag_guess:
  ready_condition:
  v2_action:
  current_layer_guess:
  failure_risk:
  desired_output:
    - item_meaning
    - candidate_values
    - choose_when
    - expected_text_effect
    - risk
    - recommended_preset
    - frozen_minimum
    - backlog_needed
```

---

# 3. LOOKUP_RESPONSE

```yaml
LOOKUP_RESPONSE:
  selected_tags:
  source_refs:
  item_meaning:
  candidate_values:
  choose_when:
  expected_text_effect:
    increases_in_text:
    decreases_or_forbids_in_text:
    closing_destination:
  risk:
  recommended_preset:
  frozen_minimum:
  backlog_needed:
  STOP_if:
```

---

# 4. WHEN_TO_LOOKUP

梱包さんは以下の場合に lookup する。

```text
- layer値を新規に決める時
- readyとV2の対応が曖昧な時
- どのpresetを使うか迷う時
- 本文にAI臭が出た時
- 12k級の高密度回を作る時
- キャラ設計や世界軸へ埋めるべき項目が見えた時
- 既存レイヤー値を変更したい時
- STOP条件に触れた時
```

---

# 5. DO_NOT

```text
- 全辞書を返さない
- 正本全文を梱包さんに毎回展開しない
- lookup結果を本文素材にしない
- 執筆さんに全タグ辞書を渡さない
- タグだけで判断しない
- ready/V2根拠なしにpresetを選ばない
```

---

# 6. EXAMPLE

```yaml
LOOKUP_REQUEST:
  requester: packager
  episode_id: episode_049
  purpose: 単話layer設定
  symptom_or_question: 締めが「十分だった」へ行きそう
  current_tag_guess:
    - layer.closing.unresolved_residue
    - layer.preset.residue_close
  ready_condition: 白い毛が帳面に残る
  v2_action: 閉店後、帳面を閉じる前に毛が残っている
  current_layer_guess: residue_close
  failure_risk: 残留物を象徴化しそう
  desired_output:
    - candidate_values
    - expected_text_effect
    - frozen_minimum
```

```yaml
LOOKUP_RESPONSE:
  selected_tags:
    - layer.closing.unresolved_residue
    - layer.scene.residue
    - layer.preset.residue_close
  source_refs:
    - layer_full_preset_library_v1.md
    - layer_all_items_meaning_reference_v1.md
  item_meaning: 意味ではなく残留物で閉じる。
  candidate_values:
    closing_vector: unresolved_residue
    scene_vector: residue_vector
    subject_visibility_mode: object_as_front
  expected_text_effect:
    increases_in_text:
      - 帳面
      - 白い毛
      - 払われない動作
    decreases_or_forbids_in_text:
      - 十分だった
      - 分かった
      - 優しさが残った
    closing_destination:
      - 帳面に残る白い毛
  risk:
    - 白い毛を象徴として説明する
  recommended_preset: RESIDUE_CLOSE_ANTI_CLEAN
  frozen_minimum:
    closing_vector: unresolved_residue
    forbidden_group:
      - clean_close
      - theme_summary
    STOP_if:
      - 残留後に意味説明を書く
  backlog_needed: false
```
