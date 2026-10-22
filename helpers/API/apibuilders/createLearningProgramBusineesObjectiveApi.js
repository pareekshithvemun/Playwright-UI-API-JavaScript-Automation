import {
  headerData,
  expect,
  logger,
  urlData,
  createLearningProgramBusineesObjBody,
} from "../../../path.js";

export async function createLearningProgramBusineesObjectiveApi(
  request,
  jwt,
  Objname
) {
  try {
    let LearningProgramBusineesObjectiveHeaders =
      headerData.createLearningProgramBusineesObjectiveHeaders(
        jwt,
        "application/json"
      );
    let res = await request.post(
      urlData.createLearningProgramBusineesObjectiveUrl,
      {
        data: createLearningProgramBusineesObjBody(Objname),
        headers: LearningProgramBusineesObjectiveHeaders,
      }
    );
    expect(res.status()).toBe(200);
    logger.info(
      `Learning Program Businees Objective has been created with name ${Objname}`
    );
    return await res.json();
  } catch (e) {
    logger.error(
      `Failed to create Learning Program Businees Objective due to error ${e}`
    );
  }
}
