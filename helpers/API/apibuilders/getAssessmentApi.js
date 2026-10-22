import {
  headerData,
  urlData,
  expect,
  logger,
  getAssessmentPayload,
} from "../../../path.js";

export async function getAssessmentApi(
  request,
  token,
  assessmentId,
  assessmentContainerId,
) {
  try {
    const headers = headerData.lxAssessmentCreateHeaders(
      token,
      "application/json",
    );
    const payload = getAssessmentPayload(assessmentId, assessmentContainerId);
    const resp = await request.post(urlData.lxAssessmentCreateUrl, {
      data: payload,
      headers,
    });
    const response = await resp.json();
    if (resp.status() !== 200) {
      logger.error(
        `getAssessment failed status=${resp.status()} body=${JSON.stringify(response)}`,
      );
    }
    expect(resp.status()).toBe(200);
    const assessment = response.data?.getAssessment;
    if (!assessment) {
      throw new Error(
        `Invalid getAssessment response: ${JSON.stringify(response)}`,
      );
    }
    logger.info(
      `Get assessment: ${assessment.id}, container ${assessmentContainerId}`,
    );
    return response;
  } catch (error) {
    logger.error(`Failed to get assessment: ${error.message}`);
    throw error;
  }
}
