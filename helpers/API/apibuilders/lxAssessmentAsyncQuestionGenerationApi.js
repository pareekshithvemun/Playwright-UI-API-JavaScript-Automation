import {
  headerData,
  urlData,
  expect,
  logger,
  lxAssessmentAsyncQuestionGenerationPayload,
} from "../../../path.js";

export async function lxAssessmentAsyncQuestionGenerationApi(
  request,
  token,
  internalAssessmentId,
  assessmentContainerId,
  learningObjectiveUuids,
  questionType,
  numQuestions,
  documentIds,
  workspaceId,
  difficultyLevel
) {
  try {
    let headers = headerData.lxAssessmentAsyncQuestionGenerationHeaders(
      token,
      "application/json"
    );
    let payload = lxAssessmentAsyncQuestionGenerationPayload(
      internalAssessmentId,
      assessmentContainerId,
      learningObjectiveUuids,
      questionType,
      numQuestions,
      documentIds,
      workspaceId,
      difficultyLevel
    );

    let resp = await request.post(
      urlData.lxAssessmentAsyncQuestionGenerationUrl,
      {
        data: payload,
        headers: headers,
      }
    );

    expect(resp.status()).toBe(202);
    let response = await resp.json();
    logger.info(
      `Async question generation started for assessment: ${internalAssessmentId}, jobId: ${response.jobId}, jobStatus: ${response.jobStatus}`
    );
    return response;
  } catch (error) {
    logger.error(
      `Failed to start async question generation due to error: ${error}`
    );
    throw error;
  }
}
