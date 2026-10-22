import { headerData, urlData, expect, logger } from "../../../path.js";


export async function questionBankUuidMappingApi(
  request,
  token,
  learningObjectiveUUIDs,
  assessmentId,
) {
  const url = urlData.lxAssessmentQuestionBankUuidMappingUrl;
  const headers = headerData.lxAssessmentSaveLearningObjectiveHeaders(
    token,
    "application/json",
  );
  const body = {
    learningObjectiveUUIDs,
    assessmentId,
  };
  const resp = await request.post(url, { headers, data: body });
  expect(resp.status()).toBe(200);
  const response = await resp.json();
  logger.info(
    `Question bank UUID mapping done for assessment ${assessmentId}, learningObjectivesCount: ${learningObjectiveUUIDs.length}`,
  );
  return response;
}
