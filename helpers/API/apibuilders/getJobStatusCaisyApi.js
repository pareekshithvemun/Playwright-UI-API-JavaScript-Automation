import {
  urlData,
  headerData,
  getJobStatusCaisyPayload,
  logger,
  expect,
} from "../../../path.js";

export async function getJobStatusCaisyApi(request, jwt, jobId) {
  try {
    const url = urlData.aiSimulatorGraphqlUrl;
    const headers = headerData.aiSimulatorGraphqlHeaders(
      jwt,
      "application/json"
    );
    const payload = getJobStatusCaisyPayload(jobId);

    const response = await request.post(url, {
      headers: headers,
      data: payload,
    });

    expect(response.status()).toBe(200);
    logger.info(`Job status retrieved successfully for job ID: ${jobId}`);
    const resp = await response.json();

    return resp;
  } catch (error) {
    logger.error(`Error in getJobStatusCaisyApi: ${error.message}`);
    throw error;
  }
}
