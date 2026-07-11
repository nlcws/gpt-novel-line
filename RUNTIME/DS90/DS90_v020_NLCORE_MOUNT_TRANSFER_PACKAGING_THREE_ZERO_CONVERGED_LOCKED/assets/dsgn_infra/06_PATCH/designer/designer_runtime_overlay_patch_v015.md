# DESIGNER_RUNTIME_OVERLAY_PATCH_v015

STATUS: overlay_patch
TARGET: designer_core_runtime
PURPOSE: add callable pack cutout module and replace layer definition with AI-readable v23.

---

## 1. APPLY_ORDER

1. Load designer core current version.
2. Apply this overlay patch.
3. Replace all previous layer definitions with `layer_v23_ai_readable_runtime.md`.
4. Keep NOM as `nom_gate_insert_min_v3.md`, not full NOM source.
5. Keep pack cutout as callable `pack_cutout_module_v1.md`.

---

## 2. NON_NEGOTIABLE_REPLACEMENT

`layer_v23_ai_readable_runtime.md` replaces older layer text.

Do not merge old wording where:

- 副 is helper
- 副 is optional
- 副 is reaction axis
- 主 is camera position only
- 主の近さ is used as the primary explanation
- layer is treated as style flavor

Use:

- 主 = 客観視
- 副 = 本来主
- layer = observation/route/pressure-source control

---

## 3. DESIGNER_CORE_SCOPE

Designer core keeps:

- work bone
- world axis
- character profiles
- band profiles
- global layer version
- backlog decision authority

Designer core does not always expand:

- pack cutout details
- 1 episode folder construction
- execution queue construction

These are loaded only when requested.

---

## 4. NOM_POLICY

NOM is not stored as a full active source in normal generation.

Use `nom_gate_insert_min_v3.md` as a gate.

NOM is:

- validation gate
- read/stop/frozen check
- not story source
- not prose source
- not theme source

---

## 5. PACK_CUTOUT_CONNECTION

When user requests story pack creation or writer pack export, run:

MODE: pack_cutout
MODULE: pack_cutout_module_v1.md
LAYER: layer_v23_ai_readable_runtime.md
NOM_GATE: nom_gate_insert_min_v3.md

Output target:

```text
episode_XXX/
  00_README.md
  01_ready.md
  02_v2.md
  03_layer.md
  04_crosscheck.md
  05_frozen.md
  06_execution_queue.md   # optional, only if needed
  07_sources.md           # optional, only if needed
```

---

## 6. BEGINNER_UI_POLICY

Do not expose internal names to beginner-facing output by default.

Hide by default:

- ready
- V2
- layer
- NOM
- crosscheck
- frozen
- execution_queue
- backlog

Show as simple terms only when needed:

- 今回守ること
- 実際に起きること
- 書かないこと
- 最後に残すもの
- 書く前の確認

---

## 7. STOP_POLICY

Stop instead of filling holes when:

- source not actually read
- layer sub missing
- ready and V2 unmapped
- layer route missing
- NOM gate fails
- pack cutout would need global layer overwrite
- writer would need to infer missing conditions

No provisional prose draft after STOP.

---

## 8. VERSION_NOTE

v015 only changes layer packaging and designer connection rules.
It does not rewrite NOM core.
It does not rewrite pack_cutout_module_v1.
It does not add story examples to runtime core.
