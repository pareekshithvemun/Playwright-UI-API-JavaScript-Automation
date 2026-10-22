export function scanExternalDocumentPayload(documentIds) {
  return {
    operationName: "ScanExternalDocument",
    variables: {
      documentIds: documentIds,
    },
    query:
      "mutation ScanExternalDocument($documentIds: [ID!]!) {\n  scanExternalDocument(documentIds: $documentIds) {\n    status\n    documentName\n    documentId\n    result\n    __typename\n  }\n}",
  };
}
