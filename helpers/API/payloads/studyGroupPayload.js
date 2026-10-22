export function createStudyGroupPayload(title, assetId, assetType) {
  // Get today's date
  const today = new Date();
  const startTs = today.toISOString().split("T")[0]; // yyyy-mm-dd

  // Get date + 10 days
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 10);
  const endTs = endDate.toISOString().split("T")[0]; // yyyy-mm-dd

  return {
    operationName: "createGroupChallenge",
    variables: {
      input: {
        name: title,
        description: "This is a study group created to complete this course together as a team",
        type: "Open",
        startTs: startTs,
        endTs: endTs,
        assetId: assetId,
        assetType: assetType,
        locale: "en-US",
        cohort: {
          slackRedirectionUrls: [],
          msTeamsRedirectionUrls: []
        }
      }
    },
    query: `mutation createGroupChallenge($input: challengeInput!) {
      lgcCreateChallenge(input: $input) {
        id
        name
        description
        createdBy
        startTs
        endTs
        type
        createdAt
        updatedAt
        assetId
        assetType
        __typename
      }
    }`
  };
}
