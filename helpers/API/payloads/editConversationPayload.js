export function editConversationPayload(
  conversationId,
  name,
  description,
  shouldIncrementVersion = false
) {
  return {
    operationName: "editConversation",
    variables: {
      conversationId: conversationId,
      shouldIncrementVersion: shouldIncrementVersion,
      input: {
        name: name,
        description: description,
      },
    },
    query: `mutation editConversation($conversationId: ID!, $input: EditConversationInput!, $shouldIncrementVersion: Boolean) {
  editConversation(
    conversationId: $conversationId
    input: $input
    shouldIncrementVersion: $shouldIncrementVersion
  )
}`,
  };
}
