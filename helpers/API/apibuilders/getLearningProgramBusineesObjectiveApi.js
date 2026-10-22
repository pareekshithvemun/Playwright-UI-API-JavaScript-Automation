import { headerData, expect, logger, urlData } from "../../../path.js";

export async function getLearningProgramBusineesObjectiveApi(request, jwt) {
  try {
    let getLProgramBusineesObjectiveHeaders =
      headerData.getLearningProgramBusineesObjectiveHeaders(jwt);
    let res = await request.get(
      urlData.getLearningProgramBusineesObjectiveUrl,
      {
        headers: getLProgramBusineesObjectiveHeaders,
      }
    );
    expect(res.status()).toBe(200);
    logger.info(
      `Businees Objectives of Learning Program feature has been extracted`
    );
    return await res.json();
  } catch (e) {
    logger.error(
      `Failed to extract Learning Program Businees Objective due to error ${e}`
    );
  }
}
