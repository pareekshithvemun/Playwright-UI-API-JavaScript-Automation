import {
  headerData,
  urlData,
  expect,
  logger,
  lxAssessmentCreatePayload,
} from "../../../path.js";

export async function lxAssessmentCreateApi(request, token, assessmentData) {
  try {
    let headers = headerData.lxAssessmentCreateHeaders(token, "application/json");
    let payload = lxAssessmentCreatePayload(assessmentData);

    let resp = await request.post(urlData.lxAssessmentCreateUrl, {
      data: payload,
      headers: headers,
    });

    expect(resp.status()).toBe(200);
    let response = await resp.json();
    let internalAssessmentId = response.data?.createAssessment?.response?.id;
    logger.info(`Assessment created successfully: ${internalAssessmentId || "ID not found"}`);
    return internalAssessmentId;
  } catch (error) {
    logger.error(`Failed to create LX Assessment due to error: ${error}`);
    throw error;
  }
}

