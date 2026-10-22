import {
  urlData,
  headerData,
  publishPresentationCaisyPayload,
  logger,
  expect,
} from "../../../path.js";

export async function publishPresentationCaisyApi(request, jwt, conversationId) {
  try {
    const url = urlData.caisyPresentationsGraphqlUrl;
    const headers = {
      ...headerData.caisyPresentationsGraphqlHeaders(jwt, "application/json"),
      locale: "en-US",
    };
    const payload = publishPresentationCaisyPayload(conversationId);

    const response = await request.post(url, {
      headers,
      data: payload,
    });

    expect(response.status()).toBe(200);
    const resp = await response.json();

    if (resp.errors && resp.errors.length > 0) {
      throw new Error(
        `publishPresentation (PPT) errors: ${JSON.stringify(resp.errors)}`,
      );
    }

    const publishConversationId = resp.data?.publishConversation;
    if (!publishConversationId) {
      throw new Error(
        `Invalid publish PPT response: publishConversation missing - ${JSON.stringify(resp)}`,
      );
    }
    logger.info(
      `PPT published successfully: conversation ${conversationId}, publishConversation ${publishConversationId}`,
    );
    return resp;
  } catch (error) {
    logger.error(`Error in publishPresentationCaisyApi: ${error.message}`);
    throw error;
  }
}
