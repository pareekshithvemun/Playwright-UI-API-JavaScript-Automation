export function submitConversationUploadedPayload(conversationId, contentType) {
  return {
    operationName: "submitConversationUploaded",
    variables: {
      conversationId: conversationId,
      contentType: contentType,
    },
    query:
      "mutation submitConversationUploaded($conversationId: ID!, $contentType: String!) {\n  submitConversationUploaded(\n    conversationId: $conversationId\n    contentType: $contentType\n  )\n}",
  };
}
