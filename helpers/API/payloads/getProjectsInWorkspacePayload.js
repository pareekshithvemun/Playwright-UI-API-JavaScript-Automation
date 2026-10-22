export function getProjectsInWorkspacePayload(workspaceId, page = 1, limit = 10, onlyEditPlusAccess = null) {
    return {
        operationName: "GetProjectsInWorkspace",
        variables: {
            workspaceId: workspaceId,
            page: page,
            limit: limit,
            onlyEditPlusAccess: onlyEditPlusAccess
        },
        query: "query GetProjectsInWorkspace($workspaceId: ID!, $page: Int, $limit: Int, $onlyEditPlusAccess: Boolean) {\n  getProjectsInWorkspace(\n    workspaceId: $workspaceId\n    page: $page\n    limit: $limit\n    onlyEditPlusAccess: $onlyEditPlusAccess\n  ) {\n    projects {\n      id\n      name\n      description\n      createdAt\n      updatedAt\n      modifiedAt\n      createdBy\n      permissions {\n        effectiveUserPermissionLevel\n        userPermissions\n        __typename\n      }\n      collaborator {\n        count\n        __typename\n      }\n      isShared\n      __typename\n    }\n    pageInfo {\n      hasNextPage\n      hasPreviousPage\n      currentPage\n      totalPages\n      __typename\n    }\n    totalCount\n    __typename\n  }\n}"
    };
}