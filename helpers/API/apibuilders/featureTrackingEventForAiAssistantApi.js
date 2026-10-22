import {
  headerData,
  expect,
  logger,
  urlData,
  aiAssistantPayload,
} from "../../../path.js";

export async function featureTrackingEventForAiAssistantApi(
  request,
  learnerToken,
  tokenForAi,
  userUUId,
  chatMessages
) {
  try {
    let aiAssistantHeaders = headerData.aiAssistantHeaders(
      learnerToken,
      "application/json",
      tokenForAi
    );
    let respOfaiAssistant = await request.post(urlData.aiAssistantUrl, {
      data: aiAssistantPayload(userUUId, chatMessages, learnerToken),
      headers: aiAssistantHeaders,
    });
    expect(respOfaiAssistant.status()).toBe(200);
    // Try to parse JSON safely, fallback to text
    let body = await respOfaiAssistant
      .json()
      .catch(async () => await respOfaiAssistant.text());
    return body;
  } catch (error) {
    logger.error(
      `Failed to make conversation with user ${userUUId} due to error : ${error}`
    );
  }
}
