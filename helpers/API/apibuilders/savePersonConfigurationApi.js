import {
  urlData,
  headerData,
  savePersonConfigurationPayload,
  logger,
  expect,
} from "../../../path.js";

export async function savePersonConfigurationApi(
  request,
  jwt,
  conversationId,
  peopleGroups,
  shouldIncrementVersion = false
) {
  try {
    const url = urlData.caisyPresentationsGraphqlUrl;
    const headers = headerData.caisyPresentationsGraphqlHeaders(
      jwt,
      "application/json"
    );
    const payload = savePersonConfigurationPayload(
      conversationId,
      peopleGroups,
      shouldIncrementVersion
    );

    const response = await request.post(url, {
      headers: headers,
      data: payload,
    });

    expect(response.status()).toBe(200);
    logger.info(
      `Save person configuration API called successfully for conversation: ${conversationId}`
    );
    const resp = await response.json();

    return resp;
  } catch (error) {
    logger.error(`Error in savePersonConfigurationApi: ${error.message}`);
    throw error;
  }
}
