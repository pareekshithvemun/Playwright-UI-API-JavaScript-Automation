export function lxAssessmentSaveRecommendationsPayload(
  recommendations,
  internalAssessmentId
) {
  return {
    recommendations: recommendations.map((rec, index) => ({
      contentId: rec.contentId,
      contentType: rec.contentType,
      order: index,
    })),
    internalAssessmentId: internalAssessmentId,
  };
}
