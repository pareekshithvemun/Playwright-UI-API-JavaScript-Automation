/**
 * Payload for EditAssessment mutation. Pass only assessmentContainerId; response includes assessment id and details.
 */
export function editAssessmentPayload(assessmentContainerId) {
  return {
    operationName: "EditAssessment",
    variables: {
      input: {
        assessmentContainerId,
      },
    },
    query: `mutation EditAssessment($input: EditAssessmentInput!) {
  editAssessment(input: $input) {
    response {
      id
      assessmentContainerId
      version
      assessmentType
      title
      description
      orgId
      affiliateId
      status
      createdAt
      dateModified
      modifiedBy
      image
      duration
      technologyType
      expertiseLevel
      technologyVersion
      altText
      configuration
      skills
      contentSource
      designBriefSessionId
      locale
      __typename
    }
    __typename
  }
}`,
  };
}
