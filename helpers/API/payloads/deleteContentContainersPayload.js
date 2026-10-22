export function deleteContentContainersPayload(containerId, workspaceId) {
  return {
    operationName: "DeleteContentContainers",
    variables: {
      input: {
        containerId: containerId,
        workspaceId: workspaceId,
      },
    },
    query: `mutation DeleteContentContainers($input: DeleteContentContainersInput!) {
  deleteContentContainers(input: $input) {
    containerId
    message
    success
    __typename
  }
}`,
  };
}
