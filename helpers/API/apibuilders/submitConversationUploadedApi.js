import { headerData, urlData, expect, submitConversationUploadedPayload, logger } from "../../../path.js";

export async function submitConversationUploadedApi(request, jwt, conversationId, contentType) {
  try {
    let headers = headerData.caisyPresentationsGraphqlHeaders(jwt, "application/json");
    let payload = submitConversationUploadedPayload(conversationId, contentType);
    
    let res = await request.post(urlData.caisyPresentationsGraphqlUrl, {
      data: payload,
      headers: headers,
    });
    
    expect(res.status()).toBe(200);
    const resp = await res.json();
    logger.info(`Successfully submitted conversation upload for conversation ${conversationId}`);
    return resp;
  } catch (error) {
    logger.error(`Failed to submit conversation uploaded for conversation ${conversationId} due to ${error}`);
    throw error;
  }
}
