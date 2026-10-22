export function upsertSectionAndRubricConfigurationPayload(
  conversationId,
  sectionsConfig,
  sectionRubrics,
  shouldIncrementVersion = true
) {
  return {
    operationName: "upsertSectionAndRubricConfiguration",
    variables: {
      conversationId: conversationId,
      sectionsConfig: sectionsConfig,
      sectionRubrics: sectionRubrics,
      shouldIncrementVersion: shouldIncrementVersion,
    },
    query: `mutation upsertSectionAndRubricConfiguration($conversationId: ID!, $sectionsConfig: ConvSectionConfigurationInput, $sectionRubrics: [ConvSectionRubricInput!]!, $shouldIncrementVersion: Boolean) {
  upsertSectionAndRubricConfiguration(
    conversationId: $conversationId
    sectionsConfig: $sectionsConfig
    sectionRubrics: $sectionRubrics
    shouldIncrementVersion: $shouldIncrementVersion
  )
}`,
  };
}
