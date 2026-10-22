import {
  headerData,
  urlData,
  expect,
  logger,
  lxAssessmentGenerateDescriptionPayload,
} from "../../../path.js";

export async function lxAssessmentGenerateDescriptionApi(
  request,
  token,
  internalAssessmentId,
  assessmentContainerId
) {
  try {
    let headers = headerData.lxAssessmentGenerateDescriptionHeaders(
      token,
      "application/json"
    );
    let payload = lxAssessmentGenerateDescriptionPayload(
      internalAssessmentId,
      assessmentContainerId
    );

    let resp = await request.post(urlData.lxAssessmentGenerateDescriptionUrl, {
      data: payload,
      headers: headers,
    });

    expect(resp.status()).toBe(200);
    let response = await resp.json();
    logger.info(
      `Description generated for assessment: ${internalAssessmentId}`
    );
    return response;
  } catch (error) {
    logger.error(`Failed to generate description due to error: ${error}`);
    throw error;
  }
}
