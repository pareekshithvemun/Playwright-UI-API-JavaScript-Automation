export function listContentContainersPayload(
  workspaceId,
  page = 1,
  limit = 100,
  moduleType = null,
  createdByMe = false,
  projectId = null
) {
  // Build filters: always include createdByMe; add appType only when moduleType is passed
  const filters = {
    createdByMe: createdByMe,
  };
  if (moduleType !== null && moduleType !== undefined) {
    filters.appType = moduleType;
  }

  // Build variables: workspace, pagination, filters; add projectId only when passed
  const variables = {
    workspaceId: workspaceId,
    page: page,
    limit: limit,
    filters: filters,
  };
  if (projectId !== null && projectId !== undefined) {
    variables.projectId = projectId;
  }

  return {
    operationName: "ListContentContainers",
    variables,
    query: `query ListContentContainers($workspaceId: ID!, $filters: ContentListingFilters, $page: Int, $limit: Int, $projectId: ID) {
  listContentContainers(
    workspaceId: $workspaceId
    filters: $filters
    page: $page
    limit: $limit
    projectId: $projectId
  ) {
    items {
      id
      name
      modifiedAt
      modifiedBy
      status
      moduleType
      modifiedByDisplayName
      createdByDisplayName
      publishStage
      moduleDataPresentInApp
      ownerProjectId
      ownerProjectName
      isPreviewAvailable
      permissions {
        effectiveUserPermissionLevel
        userPermissions
        __typename
      }
      isProcessing
      locale
      appType
      __typename
    }
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
      currentPage
      totalPages
      __typename
    }
    __typename
  }
}`,
  };
}
