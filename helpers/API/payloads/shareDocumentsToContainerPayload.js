export function shareDocumentsToContainerPayload(documentIds, containerId) {
  return {
    operationName: "shareDocumentsToContainer",
    variables: {
      input: {
        documentIds: documentIds,
        containerId: containerId,
      },
    },
    query: `mutation shareDocumentsToContainer($input: ShareDocumentsToContainerInput!) {
  shareDocumentsToContainer(input: $input) {
    success
    message
    __typename
  }
}`,
  };
}
