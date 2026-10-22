export function lxAssessmentCreatePayload(assessmentData) {
  return {
    operationName: "CreateAssessment",
    variables: {
      input: {
        assessmentContainerId: assessmentData.assessmentContainerId,
        title: assessmentData.title,
        description: assessmentData.description,
        assessmentType: assessmentData.assessmentType,
        expertiseLevel: assessmentData.expertiseLevel,
        duration: assessmentData.duration,
        altText: assessmentData.altText || "",
        technologyType: assessmentData.technologyType || "",
        technologyVersion: assessmentData.technologyVersion || "",
        skills: assessmentData.skills,
        skillname: assessmentData.skillname,
        proficiencyLevel: assessmentData.proficiencyLevel,
        modifiedBy: assessmentData.modifiedBy,
        status: "Draft",
        configuration: assessmentData.configuration,
        selectedQuestionType: assessmentData.selectedQuestionType,
        numberOfQuestions: assessmentData.numberOfQuestions,
        additionalInformation: assessmentData.additionalInformation || "",
        contentSource: assessmentData.contentSource,
        difficultyLevel: assessmentData.difficultyLevel,
      },
    },
    query: `mutation CreateAssessment($input: CreateAssessmentInput!) {
  createAssessment(input: $input) {
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
      skillname
      proficiencyLevel
      selectedQuestionType
      numberOfQuestions
      additionalInformation
      contentSource
      designBriefSessionId
      locale
      difficultyLevel
      __typename
    }
    __typename
  }
}`,
  };
}
