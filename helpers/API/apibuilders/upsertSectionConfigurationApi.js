import {
  urlData,
  headerData,
  upsertSectionConfigurationPayload,
  logger,
  expect,
} from "../../../path.js";

export async function upsertSectionConfigurationApi(
  request,
  jwt,
  conversationId,
  sectionsConfig,
  shouldIncrementVersion = false
) {
  try {
    const url = urlData.caisyPresentationsGraphqlUrl;
    const headers = headerData.caisyPresentationsGraphqlHeaders(
      jwt,
      "application/json"
    );
    const payload = upsertSectionConfigurationPayload(
      conversationId,
      sectionsConfig,
      shouldIncrementVersion
    );

    const response = await request.post(url, {
      headers: headers,
      data: payload,
    });

    expect(response.status()).toBe(200);
    logger.info(
      `Upsert section configuration API called successfully for conversation: ${conversationId}`
    );
    const resp = await response.json();

    return resp;
  } catch (error) {
    logger.error(`Error in upsertSectionConfigurationApi: ${error.message}`);
    throw error;
  }
}
