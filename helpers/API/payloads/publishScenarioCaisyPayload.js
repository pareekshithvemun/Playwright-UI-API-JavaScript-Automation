export function publishScenarioCaisyPayload(
  scenarioId,
  shouldCreateNew = false,
  locale = "en-US"
) {
  return {
    operationName: "publishScenario",
    variables: {
      scenarioId,
      shouldCreateNew,
      locale,
    },
    query: `mutation publishScenario($scenarioId: String!, $shouldCreateNew: Boolean!, $locale: String) {
  publishScenario(
    scenarioId: $scenarioId
    shouldCreateNew: $shouldCreateNew
    locale: $locale
  ) {
    id
    __typename
  }
}`,
  };
}
