export function listKnowledgeSourceDocumentsPayload(
  workspaceId,
  page = 1,
  limit = 100
) {
  return {
    operationName: "ListKnowledgeSourceDocuments",
    variables: {
      input: {
        pagination: {
          page: page,
          limit: limit,
        },
        scopeFilters: {
          workspaceIds: [workspaceId],
          includeOwnerEntities: false,
        },
        sort: {
          order: "desc",
          by: "updated_at",
        },
      },
    },
    query: `query ListKnowledgeSourceDocuments($input: ListKnowledgeSourceDocumentsInput) {
  listKnowledgeSourceDocuments(input: $input) {
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
      currentPage
      totalPages
      __typename
    }
    knowledgeSourceDocuments {
      id
      title
      description
      fileNameWithExtension
      contentType
      scanStatus
      createdAt
      updatedAt
      createdByUser {
        id
        displayName
        __typename
      }
      ownerEntity {
        entityId
        entityType
        userPermissions
        entityName
        parentEntityId
        __typename
      }
      contentContainersCount
      workspacesCount
      projectsCount
      projectSpecificContentContainersCount
      isDirectlyRelated
      isPreviewAvailable
      isHidden
      __typename
    }
    __typename
  }
}`,
  };
}
