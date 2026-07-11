function validRef(ref) {
  return typeof ref?.sourcePath === "string" && ref.sourcePath.length > 0 &&
    typeof ref?.section === "string" && ref.section.length > 0;
}

export function applyUserOverrides(issues, overrides = [], operation) {
  const validOverrides = Array.isArray(overrides) ? overrides : [];
  const consumed = [];
  const remaining = issues.filter((current) => {
    const match = validOverrides.find((override) =>
      override.ruleId === (current.ruleId ?? current.code) &&
      override.operation === operation &&
      override.decision === "ALLOW" &&
      ["ONCE", "PERSISTENT"].includes(override.persistence) &&
      validRef(override.userDecisionRef) &&
      (override.scope === current.field || override.scope === current.path || override.scope === "*")
    );
    if (match) consumed.push(match);
    return !match;
  });
  return { remaining, consumed };
}
