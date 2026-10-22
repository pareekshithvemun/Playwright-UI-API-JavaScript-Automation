import { headerData, expect, logger, urlData } from "../../../path.js";

export async function archiveLearningProgramApi(
  request,
  jwt,
  learningProgramId
) {
  try {
    let archiveLearningProgramHeader =
      headerData.archiveLearningProgramHeader(jwt);
    let res = await request.patch(
      urlData.archiveLearningProgramUrl(learningProgramId),
      {
        headers: archiveLearningProgramHeader,
      }
    );
    expect(res.status()).toBe(200);
    logger.info(`Learning Programs : ${learningProgramId} has been archived`);
  } catch (e) {
    logger.error(
      `Failed to archieve Learning Programs : ${learningProgramId} due to error ${e}`
    );
  }
}
