export function publishPresentationCaisyPayload(conversationId) {
  return {
    operationName: "publishConversation",
    variables: {
      conversationId,
      status: "Published",
      quickPublish: true,
    },
    query: `mutation publishConversation($conversationId: ID!, $status: ConversationStatus, $quickPublish: Boolean) {
  publishConversation(
    conversationId: $conversationId
    status: $status
    quickPublish: $quickPublish
  )
}`,
  };
}
