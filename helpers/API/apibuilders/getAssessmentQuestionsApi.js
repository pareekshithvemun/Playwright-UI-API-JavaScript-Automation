import {
  headerData,
  urlData,
  expect,
  logger,
} from "../../../path.js";

export async function getAssessmentQuestionsApi(
  request,
  token,
  assessmentContainerId,
  assessmentId,
) {
  try {
    const headers = headerData.lxAssessmentSaveLearningObjectiveHeaders(
      token,
      "application/json",
    );
    const url = urlData.lxAssessmentGetQuestionsUrl(
      assessmentContainerId,
      assessmentId,
    );
    const resp = await request.get(url, { headers });
    expect(resp.status()).toBe(200);
    const response = await resp.json();
    logger.info(
      `Get assessment questions: container ${assessmentContainerId}, assessment ${assessmentId}`,
    );
    return response;
  } catch (error) {
    logger.error(`Failed to get assessment questions: ${error.message}`);
    throw error;
  }
}
