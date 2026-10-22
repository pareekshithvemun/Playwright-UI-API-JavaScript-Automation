export function uploadExternalDocumentsPayload(
  documents,
  workspaceId,
  projectId,
  contentContainerId
) {
  return {
    operationName: "UploadExternalDocuments",
    variables: {
      documents: documents,
      workspaceId: workspaceId,
      projectId: projectId,
      contentContainerId: contentContainerId,
    },
    query:
      "mutation UploadExternalDocuments($workspaceId: ID!, $documents: [UploadDocumentInput!]!, $projectId: ID, $contentContainerId: ID, $taggedForContentUpload: Boolean, $uploadToProject: Boolean, $uploadToWorkspace: Boolean) {\n  uploadExternalDocuments(\n    workspaceId: $workspaceId\n    documents: $documents\n    projectId: $projectId\n    contentContainerId: $contentContainerId\n    taggedForContentUpload: $taggedForContentUpload\n    uploadToProject: $uploadToProject\n    uploadToWorkspace: $uploadToWorkspace\n  ) {\n    signedUploadUrl\n    inputDocumentName\n    documentId\n    __typename\n  }\n}",
  };
}
