import {
  headerData,
  expect,
  logger,
  urlData,
  getAllLearningProgramBody,
} from "../../../path.js";

export async function getAllLearningProgramsApi(request, jwt) {
  try {
    let getAllLearingProgramHeaders = headerData.getAllLearingProgramHeaders(
      jwt,
      "application/json"
    );
    let res = await request.post(urlData.getAllLearningProgramsUrl, {
      data: getAllLearningProgramBody(),
      headers: getAllLearingProgramHeaders,
    });
    expect(res.status()).toBe(200);
    let resp = await res.json();
    logger.info(`All Learning Programs has been extracted`);
    return resp;
  } catch (e) {
    logger.error(`Failed to extract all Learning Programs`);
  }
}
