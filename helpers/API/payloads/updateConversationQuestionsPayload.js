export function updateConversationQuestionsPayload(
  conversationId,
  slideQuestions,
  shouldIncrementVersion = false
) {
  return {
    operationName: "UpdateConversationQuestions",
    variables: {
      shouldIncrementVersion: shouldIncrementVersion,
      conversationId: conversationId,
      slideQuestions: slideQuestions,
    },
    query: `mutation UpdateConversationQuestions($conversationId: ID!, $slideQuestions: [SlideDetailQuestion!]!, $shouldIncrementVersion: Boolean) {
  updateConversationQuestions(
    conversationId: $conversationId
    slideQuestions: $slideQuestions
    shouldIncrementVersion: $shouldIncrementVersion
  )
}`,
  };
}
