export function initializeConversationUploadPayload(
  contentType,
  fileName,
  uuid,
  source = "lx-studio"
) {
  return {
    operationName: "initializeConversationUpload",
    variables: {
      contentType: contentType,
      fileName: fileName,
      uuid: uuid,
      source: source,
      affiliateContentId: uuid,
    },
    query:
      "mutation initializeConversationUpload($contentType: String!, $fileName: String!, $uuid: String, $source: String, $affiliateContentId: String) {\n  initializeConversationUpload(\n    contentType: $contentType\n    fileName: $fileName\n    uuid: $uuid\n    source: $source\n    affiliateContentId: $affiliateContentId\n  ) {\n    url\n    conversationId\n    fields\n    __typename\n  }\n}",
  };
}
