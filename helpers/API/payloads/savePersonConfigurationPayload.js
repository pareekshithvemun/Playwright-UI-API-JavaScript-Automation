export function savePersonConfigurationPayload(
  conversationId,
  peopleGroups,
  shouldIncrementVersion = false
) {
  return {
    operationName: "savePersonConfiguration",
    variables: {
      shouldIncrementVersion: shouldIncrementVersion,
      conversationId: conversationId,
      peopleGroups: peopleGroups,
    },
    query: `mutation savePersonConfiguration($conversationId: ID!, $peopleGroups: [PeopleGroups], $shouldIncrementVersion: Boolean) {
  savePersonConfiguration(
    conversationId: $conversationId
    peopleGroups: $peopleGroups
    shouldIncrementVersion: $shouldIncrementVersion
  )
}`,
  };
}
