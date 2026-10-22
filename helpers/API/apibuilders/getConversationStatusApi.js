import {
  headerData,
  urlData,
  expect,
  getConversationStatusPayload,
  logger,
} from "../../../path.js";

export async function getConversationStatusApi(request, jwt, uuid) {
  try {
    let headers = headerData.caisyPresentationsGraphqlHeaders(
      jwt,
      "application/json"
    );

    let res = await request.post(urlData.caisyPresentationsGraphqlUrl, {
      data: getConversationStatusPayload(uuid),
      headers: headers,
    });

    expect(res.status()).toBe(200);
    const resp = await res.json();
    return resp;
  } catch (error) {
    logger.error(
      `Failed to get conversation status for UUID ${uuid} due to ${error}`
    );
  }
}
