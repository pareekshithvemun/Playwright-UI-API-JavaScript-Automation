export function createContentContainerPayload(
  projectId,
  workspaceId,
  moduleType,
  locale = "en-US"
) {
  return {
    operationName: "CreateContentContainer",
    variables: {
      input: {
        projectId: projectId,
        workspaceId: workspaceId,
        containerType: "module",
        moduleType: moduleType,
        locale: locale,
        appType: moduleType,
      },
    },
    query:
      "mutation CreateContentContainer($input: CreateContentContainerInput!) {\n  createContentContainer(input: $input) {\n    id\n    __typename\n  }\n}",
  };
}
