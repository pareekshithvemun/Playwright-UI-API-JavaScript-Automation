export function publishAssessmentPayload(
  contentContainerId,
  contentPublishDetails,
) {
  return {
    operationName: "Mutation",
    variables: {
      contentContainerId,
      contentPublishDetails,
      autoPublish: true,
      quickPublish: true,
    },
    query: `mutation Mutation($contentContainerId: ID!, $contentPublishDetails: LinkedContentInput!, $autoPublish: Boolean, $quickPublish: Boolean) {
  publishContent(
    contentContainerId: $contentContainerId
    contentPublishDetails: $contentPublishDetails
    autoPublish: $autoPublish
    quickPublish: $quickPublish
  ) {
    data
    error
    success
    __typename
  }
}`,
  };
}
