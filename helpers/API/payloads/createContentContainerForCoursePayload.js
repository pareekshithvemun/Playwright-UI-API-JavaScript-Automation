export function createContentContainerForCoursePayload(
  projectId,
  workspaceId,
  locale = "en-US"
) {
  return {
    operationName: "CreateContentContainer",
    variables: {
      input: {
        projectId: projectId,
        workspaceId: workspaceId,
        containerType: "course",
        moduleType: null,
        locale: locale,
        appType: "courseDesigner",
        ownedDocumentIds: [],
        skillIds: [],
      },
    },
    query:
      "mutation CreateContentContainer($input: CreateContentContainerInput!) {\n  createContentContainer(input: $input) {\n    id\n    __typename\n  }\n}",
  };
}
