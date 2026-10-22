export function completionCriteriaBasicDefaultsPayload(settings = {}) {
  return {
    value: settings.value ?? "NO",
    minimumTestScore: settings.minimumTestScore ?? 70,
    minimumTestValue: settings.minimumTestValue ?? "OVERALL",
  };
}
