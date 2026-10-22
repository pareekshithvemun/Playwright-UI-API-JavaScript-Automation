import {
  urlData,
  headerData,
  publishScenarioCaisyPayload,
  logger,
  expect,
} from "../../../path.js";

export async function publishScenarioCaisyApi(
  request,
  jwt,
  scenarioId,
  shouldCreateNew = false,
  locale = "en-US"
) {
  try {
    const url = urlData.aiSimulatorGraphqlUrl;
    const headers = headerData.aiSimulatorGraphqlHeaders(
      jwt,
      "application/json"
    );
    const payload = publishScenarioCaisyPayload(
      scenarioId,
      shouldCreateNew,
      locale
    );

    const response = await request.post(url, {
      headers,
      data: payload,
    });

    expect(response.status()).toBe(200);
    const resp = await response.json();

    if (!resp.data?.publishScenario?.id) {
      throw new Error(
        `Invalid publishScenario response: ${JSON.stringify(resp)}`
      );
    }

    logger.info(`Scenario published: ${resp.data.publishScenario.id}`);
    return resp;
  } catch (error) {
    logger.error(`Error in publishScenarioCaisyApi: ${error.message}`);
    throw error;
  }
}
