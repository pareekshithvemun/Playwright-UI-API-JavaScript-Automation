import {
  urlData,
  headerData,
  updateConversationQuestionsPayload,
  logger,
  expect,
} from "../../../path.js";

export async function updateConversationQuestionsApi(
  request,
  jwt,
  conversationId,
  slideQuestions,
  shouldIncrementVersion = false
) {
  try {
    const url = urlData.caisyPresentationsGraphqlUrl;
    const headers = headerData.caisyPresentationsGraphqlHeaders(
      jwt,
      "application/json"
    );
    const payload = updateConversationQuestionsPayload(
      conversationId,
      slideQuestions,
      shouldIncrementVersion
    );

    const response = await request.post(url, {
      headers: headers,
      data: payload,
    });

    expect(response.status()).toBe(200);
    logger.info(
      `Update conversation questions API called successfully for conversation: ${conversationId}`
    );
    const resp = await response.json();

    return resp;
  } catch (error) {
    logger.error(`Error in updateConversationQuestionsApi: ${error.message}`);
    throw error;
  }
}
