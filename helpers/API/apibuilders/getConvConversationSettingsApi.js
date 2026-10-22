import {
  urlData,
  headerData,
  getConvConversationSettingsPayload,
  logger,
  expect,
} from "../../../path.js";

export async function getConvConversationSettingsApi(
  request,
  jwt,
  conversationId
) {
  try {
    const url = urlData.caisyPresentationsGraphqlUrl;
    const headers = headerData.caisyPresentationsGraphqlHeaders(
      jwt,
      "application/json"
    );
    const payload = getConvConversationSettingsPayload(conversationId);

    const response = await request.post(url, {
      headers: headers,
      data: payload,
    });

    expect(response.status()).toBe(200);
    logger.info(
      "Successfully retrieved conversation settings including people groups."
    );
    return await response.json();
  } catch (error) {
    logger.error(`Error in getConvConversationSettingsApi: ${error.message}`);
    throw error;
  }
}
