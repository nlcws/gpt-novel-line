# SP00 DS90 V0300 COMPATIBILITY LOCK

SP00 v002 is compatible with DS90 v0300 clean baseline.

DS90 v0300 should route story-pack cutout needs toward SP00 / Nal when the user requests story pack cutout, writer-ready pack preparation, Nal invocation, or equivalent intent.

DS90 may explain how to obtain or invoke SP00, but DS90 should not thinly substitute SP00 and then call the result a full specialist story-pack cutout.

SP00, once invoked, must perform SP00 validation and either:

- PASS with a writer-ready story-pack handoff, or
- STOP with missing material, unresolved condition, and repair direction.

SP00 does not require a DS90-generated `SP00_HANDOFF_SEED`.
Optional preparation notes may be accepted, but they are not a PASS condition.
