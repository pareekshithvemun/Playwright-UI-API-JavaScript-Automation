export function listMediaDocumentsPayload(
  contentContainerId,
  page = 1,
  limit = 50
) {
  return {
    operationName: "ListMediaDocuments",
    query: `query ListMediaDocuments($input: ListMediaDocumentsInput!) {
      listMediaDocuments(input: $input) {
        mediaDocuments {
          id
          title
          description
          fileNameWithExtension
          contentType
          mediaType
          scanStatus
          s3SignedUrlForPreview
          createdAt
          updatedAt
          deletedAt
          createdByUser {
            id
            displayName
          }
          ownerEntity {
            entityId
            entityType
            entityName
            userPermissions
            parentEntityId
          }
        }
        totalCount
        pageInfo {
          hasNextPage
          hasPreviousPage
          currentPage
          totalPages
        }
      }
    }`,
    variables: {
      input: {
        pagination: { page, limit },
        scopeFilters: {
          includeOwnerEntities: true,
          contentContainerIds: [contentContainerId],
        },
        documentFilters: { mediaTypes: ["generic_image"] },
        sort: { order: "desc", by: "updated_at" },
      },
    },
  };
}
