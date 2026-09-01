export const specialistDispatchModule = Object.freeze({
  id: "SPECIALIST_DISPATCH",
  rules: [],
  validate() {
    return {
      issues: [],
      output: {
        executionBoundary: "HOST_SPECIALIST_RUNTIME_REQUIRED",
        completionClaim: "NOT_COMPLETED_BY_METADATA"
      }
    };
  }
});
