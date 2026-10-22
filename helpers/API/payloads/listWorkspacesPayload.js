export function listWorkspacesPayload() {
  return {
    operationName: "ListWorkspaces",
    variables: {},
    query: "query ListWorkspaces {\n  listWorkspaces {\n    updatedAt\n    permissions {\n      userPermissions\n      effectiveUserPermissionLevel\n      __typename\n    }\n    name\n    id\n    description\n    createdBy\n    createdAt\n    isFavourite\n    isShared\n    __typename\n  }\n}"
  };
}