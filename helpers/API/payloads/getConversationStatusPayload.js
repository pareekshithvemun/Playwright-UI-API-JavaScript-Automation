export function getConversationStatusPayload(ConversationUuid) {
  return {
    operationName: "getConversationStatus",
    variables: { uuid: ConversationUuid },
    query:
      "query getConversationStatus($uuid: ID!) {\n  getConversationStatus(uuid: $uuid) {\n    status\n    aiGenRunId\n    aiGenStatus\n    aiGenSteps {\n      stepName\n      status\n      updatedAt\n      __typename\n    }\n    __typename\n  }\n}",
  };
}
