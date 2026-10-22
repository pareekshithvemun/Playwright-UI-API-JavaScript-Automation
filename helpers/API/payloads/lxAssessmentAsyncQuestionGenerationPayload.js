export function lxAssessmentAsyncQuestionGenerationPayload(
  internalAssessmentId,
  assessmentContainerId,
  learningObjectiveUuids,
  questionType,
  numQuestions,
  documentIds,
  workspaceId,
  difficultyLevel
) {
  return {
    internalAssessmentId,
    assessmentContainerId,
    learningObjectiveUuids,
    questionType,
    numQuestions,
    documentIds,
    workspaceId,
    difficultyLevel,
  };
}
