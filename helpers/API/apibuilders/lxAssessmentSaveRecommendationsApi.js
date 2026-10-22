import {
  headerData,
  urlData,
  expect,
  logger,
  lxAssessmentSaveRecommendationsPayload,
} from "../../../path.js";

export async function lxAssessmentSaveRecommendationsApi(
  request,
  token,
  recommendations,
  internalAssessmentId
) {
  try {
    let headers = headerData.lxAssessmentSaveRecommendationsHeaders(token, "application/json");
    let payload = lxAssessmentSaveRecommendationsPayload(
      recommendations,
      internalAssessmentId
    );

    let resp = await request.post(urlData.lxAssessmentSaveRecommendationsUrl, {
      data: payload,
      headers: headers,
    });

    expect(resp.status()).toBe(200);
    let response = await resp.json();
    logger.info(`Recommendations saved successfully for assessment: ${internalAssessmentId}`);
    return response;
  } catch (error) {
    logger.error(`Failed to save recommendations due to error: ${error}`);
    throw error;
  }
}
