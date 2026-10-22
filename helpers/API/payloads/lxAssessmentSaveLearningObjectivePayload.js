export function lxAssessmentSaveLearningObjectivePayload(
  description,
  internalAssessmentId,
  assessmentContainerId
) {
  return {
    description,
    internalAssessmentId,
    assessmentContainerId,
  };
}
