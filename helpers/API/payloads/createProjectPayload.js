export function createProjectPayload(workspaceId, projectName) {
  return {
    operationName: "CreateProject",
    variables: {
      workspaceId: workspaceId,
      name: projectName,
    },
    query:
      "mutation CreateProject($workspaceId: ID!, $name: String!) {\n  createProject(workspaceId: $workspaceId, name: $name) {\n    id\n    name\n    description\n    createdAt\n    updatedAt\n    createdBy\n    __typename\n  }\n}",
  };
}
