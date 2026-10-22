export function upsertSectionConfigurationPayload(
  conversationId,
  sectionsConfig,
  shouldIncrementVersion = false
) {
  return {
    operationName: "upsertSectionConfiguration",
    variables: {
      shouldIncrementVersion: shouldIncrementVersion,
      conversationId: conversationId,
      sectionsConfig: sectionsConfig,
    },
    query: `mutation upsertSectionConfiguration($conversationId: ID!, $sectionsConfig: ConvSectionConfigurationInput, $shouldIncrementVersion: Boolean) {
  upsertSectionConfiguration(
    conversationId: $conversationId
    sectionsConfig: $sectionsConfig
    shouldIncrementVersion: $shouldIncrementVersion
  )
}`,
  };
}
