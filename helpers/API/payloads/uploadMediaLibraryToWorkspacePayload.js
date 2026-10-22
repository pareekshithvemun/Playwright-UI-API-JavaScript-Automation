export function uploadMediaLibraryToWorkspacePayload(
  documents,
  workspaceId,
  projectId = null,
) {
  const variables = {
    documents: documents,
    workspaceId: workspaceId,
  };
  if (projectId) {
    variables.projectId = projectId;
  }
  return {
    operationName: "UploadMediaLibraryFiles",
    variables,
    query:
      "mutation UploadMediaLibraryFiles($documents: [UploadMediaLibraryInput!]!, $workspaceId: ID!, $projectId: ID) {\n  uploadMediaLibraryFiles(\n    documents: $documents\n    workspaceId: $workspaceId\n    projectId: $projectId\n  ) {\n    documentId\n    signedUploadUrl\n    inputDocumentName\n    __typename\n  }\n}",
  };
}
