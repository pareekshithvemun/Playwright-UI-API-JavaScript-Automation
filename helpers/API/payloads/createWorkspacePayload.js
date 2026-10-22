export function createWorkspacePayload(workspaceName) {
  return {
    operationName: "CreateWorkspace",
    variables: {
      args: {
        name: workspaceName,
      },
    },
    query:
      "mutation CreateWorkspace($args: CreateWorkspaceInput) {\n  createWorkspace(args: $args) {\n    id\n    name\n    __typename\n  }\n}",
  };
}
