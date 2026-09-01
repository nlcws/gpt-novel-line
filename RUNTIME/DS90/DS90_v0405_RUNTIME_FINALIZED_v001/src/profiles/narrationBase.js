export const narrationBaseProfile = Object.freeze({
  id: "NARRATION_BASE_V1",
  role: "ALWAYS_ON_BASE",
  sourceOfTruth: "DS90_OPERATION_PROFILE",

  primary: Object.freeze({
    viewpoint: "OBJECTIVE",
    narrationObservation: "OBJECTIVE",
    direction: "SENSORY_FIRST_VARIATION",
    syntaxVariation: true,
    focusMovement: true,
    explanationAmount: "LOW",
    metaphorBoundary: "ASSIGNED_CHARACTER_SENSORY_RANGE"
  }),

  secondary: Object.freeze({
    bandFixed: false,
    selection: "SELECT_PER_EPISODE_FROM_ACTUAL_MAIN_CHARACTER",
    optional: true
  }),

  psychology: Object.freeze({
    owner: "CHARACTER_DESIGN",
    episodeUsage: "REFERENCE_ONLY_REQUIRED_LEAKAGE",
    forbiddenAsNarrationLayerAuthority: true
  }),

  background: Object.freeze({
    presence: "ALWAYS_PRESENT",
    intensity: "VARIABLE_BY_EPISODE_PURPOSE",
    weakDoesNotMeanZero: true,
    strongDoesNotMeanLong: true
  }),

  optionalLayers: Object.freeze({
    alwaysOnAtBandLevel: false,
    allowed: [
      "PLEASURE_DESIGN",
      "IMMERSION",
      "THIN_EPISODE_REINFORCEMENT"
    ],
    activation: "LOCAL_EPISODE_REFERENCE_ONLY"
  })
});

export const narrationBaseDeny = Object.freeze([
  "FIX_SECONDARY_FOR_BAND",
  "REQUIRE_SECONDARY_EVERY_EPISODE",
  "MOVE_PSYCHOLOGY_AUTHORITY_TO_NARRATION_LAYER",
  "TREAT_WEAK_BACKGROUND_AS_NO_BACKGROUND",
  "TREAT_STRONG_BACKGROUND_AS_LONG_EXPOSITION",
  "ENABLE_OPTIONAL_LAYERS_FOR_ENTIRE_BAND"
]);
