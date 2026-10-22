export function getDocumentScanAndRagStatusPayload(documentIds) {
  return {
    operationName: "GetDocStatus",
    variables: {
      documentIds: documentIds,
    },
    query:
      "query GetDocStatus($documentIds: [ID!]!) {\n  getDocumentScanAndRagStatus(documentIds: $documentIds) {\n    documentId\n    scanStatus\n    scanResult\n    ragStatus\n    ragError\n    previewStatus\n    __typename\n  }\n}",
  };
}
