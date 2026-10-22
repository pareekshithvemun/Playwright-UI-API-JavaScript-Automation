export function upsertRubricConfigurationPayload(
  conversationId,
  sectionRubrics,
  shouldIncrementVersion = false
) {
  return {
    operationName: "upsertRubricConfiguration",
    variables: {
      shouldIncrementVersion: shouldIncrementVersion,
      conversationId: conversationId,
      sectionRubrics: sectionRubrics,
    },
    query: `mutation upsertRubricConfiguration($conversationId: ID!, $sectionRubrics: [ConvSectionRubricInput!]!, $shouldIncrementVersion: Boolean) {
  upsertRubricConfiguration(
    conversationId: $conversationId
    sectionRubrics: $sectionRubrics
    shouldIncrementVersion: $shouldIncrementVersion
  )
}`,
  };
}
