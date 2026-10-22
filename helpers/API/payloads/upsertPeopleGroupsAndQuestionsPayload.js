export function upsertPeopleGroupsAndQuestionsPayload(
  conversationId,
  peopleGroups,
  slideQuestions,
  shouldIncrementVersion = true
) {
  return {
    operationName: "upsertPeopleGroupsAndQuestions",
    variables: {
      conversationId: conversationId,
      peopleGroups: peopleGroups,
      slideQuestions: slideQuestions,
      shouldIncrementVersion: shouldIncrementVersion,
    },
    query: `mutation upsertPeopleGroupsAndQuestions($conversationId: ID!, $peopleGroups: [PeopleGroups], $slideQuestions: [SlideDetailQuestion!], $shouldIncrementVersion: Boolean) {
  upsertPeopleGroupsAndQuestions(
    conversationId: $conversationId
    peopleGroups: $peopleGroups
    slideQuestions: $slideQuestions
    shouldIncrementVersion: $shouldIncrementVersion
  )
}`,
  };
}
