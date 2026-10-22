const CAISY_DEFAULT_IMAGE =
  "https://cdn2.percipio.com/public/c/public/caisy-for-you/img-caisy.jpg";

export function publishContentCaisyPayload(contentContainerId, contentDetails) {
  // Content metadata (from test data / caller)
  const title = contentDetails.title;
  const description = contentDetails.description;
  const invokerUuid = contentDetails.invokerUuid;
  const organizationUuid = contentDetails.organizationUuid;
  const contentSource = contentDetails.contentSource;
  const locale = contentDetails.locale ?? "en-US";
  const durationInSeconds = contentDetails.durationInSeconds ?? 480;
  const expertiseLevel = contentDetails.expertiseLevel ?? "Beginner";
  const imageUrl = contentDetails.imageUrl ?? CAISY_DEFAULT_IMAGE;

  // Publish flags (fixed for now)
  const autoPublish = true;
  const quickPublish = true;
  const audienceGroupIds = [];

  // Build the content object required by the API
  const content = {
    assetId: contentContainerId,
    authoringSystemRef: "CAISY_FOR_YOU",
    contentSource,
    contentType: "AI Simulator",
    description,
    durationInSeconds,
    expertiseLevel,
    imageUrl,
    invokerUuid,
    linkedContentUuid: contentContainerId,
    locale,
    organizationUuid,
    ownerUuid: organizationUuid,
    ownerType: "ORGANIZATION",
    provider: "SKILLSOFT_AI_COACH",
    title,
  };

  return {
    operationName: "publishContent",
    variables: {
      contentContainerId,
      contentPublishDetails: { content },
      autoPublish,
      quickPublish,
      audienceGroupIds,
    },
    query: `mutation publishContent($contentContainerId: ID!, $contentPublishDetails: LinkedContentInput!, $autoPublish: Boolean, $quickPublish: Boolean, $audienceGroupIds: [ID!]) {
  publishContent(
    contentContainerId: $contentContainerId
    contentPublishDetails: $contentPublishDetails
    autoPublish: $autoPublish
    quickPublish: $quickPublish
    audienceGroupIds: $audienceGroupIds
  ) {
    success
    data
    error
    __typename
  }
}`,
  };
}
