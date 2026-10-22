import { headerData, expect, logger, urlData } from "../../../path.js";

export async function deleteLearningProgramApi(
  request,
  jwt,
  learningProgramId
) {
  try {
    let deleteLearningProgramHeader =
      headerData.deleteLearningProgramHeader(jwt);
    let res = await request.delete(
      urlData.delLearningProgramUrl(learningProgramId),
      {
        headers: deleteLearningProgramHeader,
      }
    );
    expect(res.status()).toBe(200);
    logger.info(`Learning Programs : ${learningProgramId} has been deleted`);
  } catch (e) {
    logger.error(
      `Failed to delete Learning Programs : ${learningProgramId} due to error ${e}`
    );
  }
}
