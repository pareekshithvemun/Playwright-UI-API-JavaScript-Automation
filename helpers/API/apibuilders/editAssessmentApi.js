import {
  headerData,
  urlData,
  expect,
  logger,
  editAssessmentPayload,
} from "../../../path.js";

/**
 * EditAssessment: pass container id only; returns assessment id and details (same endpoint as GetAssessment).
 * Use this to resolve assessment id from container id.
 */
export async function editAssessmentApi(
  request,
  token,
  assessmentContainerId,
) {
  try {
    const headers = headerData.lxAssessmentCreateHeaders(
      token,
      "application/json",
    );
    const payload = editAssessmentPayload(assessmentContainerId);
    const resp = await request.post(urlData.lxAssessmentCreateUrl, {
      data: payload,
      headers,
    });
    expect(resp.status()).toBe(200);
    const response = await resp.json();
    const result = response?.data?.editAssessment?.response;
    if (!result) {
      throw new Error(
        `Invalid editAssessment response: ${JSON.stringify(response)}`,
      );
    }
    logger.info(
      `EditAssessment: id ${result.id}, container ${assessmentContainerId}`,
    );
    return response;
  } catch (error) {
    logger.error(`Failed to editAssessment: ${error.message}`);
    throw error;
  }
}
