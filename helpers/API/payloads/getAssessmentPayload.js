export function getAssessmentPayload(assessmentId, assessmentContainerId) {
  return {
    operationName: "GetAssessment",
    variables: {
      assessmentId,
      assessmentContainerId,
    },
    query: `query GetAssessment($assessmentId: UUID!, $assessmentContainerId: UUID!) {
  getAssessment(
    assessmentId: $assessmentId
    assessmentContainerId: $assessmentContainerId
  ) {
    id
    assessmentContainerId
    assessmentType
    title
    description
    orgId
    affiliateId
    status
    image
    duration
    technologyType
    expertiseLevel
    technologyVersion
    altText
    configuration
    skills
    skillname
    proficiencyLevel
    selectedQuestionType
    numberOfQuestions
    additionalInformation
    contentSource
    learningObjectives {
      id
      description
      learningObjectiveOrder
      __typename
    }
    learningObjectivesGenerated
    recommendations {
      contentId
      contentType
      order
      __typename
    }
    designBriefSessionId
    locale
    difficultyLevel
    __typename
  }
}`,
  };
}
