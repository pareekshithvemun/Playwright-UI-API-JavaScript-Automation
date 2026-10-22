export function getStudyGroupshareLinkPayload(studyGroupId) {
  return [
    {
      operationName: "shareLinkByUrl",
      variables: {
        path: `profile/learn-with-others/${studyGroupId}`,
      },
      query: `query shareLinkByUrl($path: String!, $uuid: String, $sourceClient: String) {
        shareLinkByUrl(path: $path, uuid: $uuid, sourceClient: $sourceClient) {
          shareLinkByUrl
          publicLinkByUrl
          __typename
        }
      }`,
    },
  ];
}
