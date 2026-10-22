import {
  urlData,
  headerData,
  editConversationPayload,
  logger,
  expect,
} from "../../../path.js";

export async function editConversationApi(
  request,
  jwt,
  conversationId,
  name,
  description,
  shouldIncrementVersion = false
) {
  try {
    const url = urlData.caisyPresentationsGraphqlUrl;
    const headers = headerData.caisyPresentationsGraphqlHeaders(
      jwt,
      "application/json"
    );
    const payload = editConversationPayload(
      conversationId,
      name,
      description,
      shouldIncrementVersion
    );

    const response = await request.post(url, {
      headers: headers,
      data: payload,
    });

    expect(response.status()).toBe(200);
    logger.info(
      `Edit conversation API called successfully for conversation: ${conversationId}`
    );
    const resp = await response.json();

    return resp;
  } catch (error) {
    logger.error(`Error in editConversationApi: ${error.message}`);
    throw error;
  }
}
