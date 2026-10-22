import {
  headerData,
  urlData,
  expect,
  logger,
  startConvProcessingPayload,
} from "../../../path.js";

export async function startConvProcessingApi(
  request,
  jwt,
  conversationId,
  triggerAiGen = true
) {
  try {
    let headers = headerData.lxStudioGraphqlHeaders(jwt, "application/json");
    let payload = startConvProcessingPayload(conversationId, triggerAiGen);

    let res = await request.post(urlData.caisyPresentationsGraphqlUrl, {
      data: payload,
      headers: headers,
    });

    expect(res.status()).toBe(200);
    const resp = await res.json();

    if (!resp.data || resp.data.startConvProcessing === undefined) {
      throw new Error("Invalid response from startConvProcessing");
    }

    logger.info(
      `Processing started for conversation ${conversationId} with AI Gen: ${triggerAiGen}`
    );
    return resp;
  } catch (error) {
    logger.error(
      `Failed to start processing for conversation ${conversationId} due to ${error}`
    );
    throw error;
  }
}
