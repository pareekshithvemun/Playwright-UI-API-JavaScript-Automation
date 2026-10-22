import {
  headerData,
  urlData,
  expect,
  logger,
  reusableFunctions,
} from "../../../path.js";

export async function lxAssessmentAsyncQuestionGenerationStatusApi(
  request,
  token,
  jobId,
  maxPolls = 70,
  pollIntervalMs = 10000,
) {
  try {
    let headers =
      headerData.lxAssessmentAsyncQuestionGenerationStatusHeaders(token);

    for (let attempt = 1; attempt <= maxPolls; attempt++) {
      let url = urlData.lxAssessmentAsyncQuestionGenerationStatusUrl(jobId);
      let resp = await request.get(url, { headers: headers });

      let statusCode = resp.status();
      expect([200, 202]).toContain(statusCode);
      let response = await resp.json();

      logger.info(
        `Poll ${attempt}/${maxPolls} - jobId: ${jobId}, jobStatus: ${response.jobStatus}, statusCode: ${statusCode}`,
      );

      if (response.jobStatus === "COMPLETED") {
        logger.info(
          `Question generation completed for jobId: ${jobId} after ${attempt} poll(s)`,
        );
        return response;
      }

      if (attempt < maxPolls) {
        await reusableFunctions.setTimer(pollIntervalMs);
      }
    }

    throw new Error(
      `Question generation did not complete after ${maxPolls} polls for jobId: ${jobId}`,
    );
  } catch (error) {
    logger.error(
      `Failed to poll question generation status for jobId: ${jobId} due to error: ${error}`,
    );
    throw error;
  }
}
