import {
  urlData,
  headerData,
  getStockPeoplePayload,
  logger,
  expect,
} from "../../../path.js";

export async function getStockPeopleApi(request, jwt, conversationId) {
  try {
    const url = urlData.caisyPresentationsGraphqlUrl;
    const headers = headerData.caisyPresentationsGraphqlHeaders(
      jwt,
      "application/json"
    );
    const payload = getStockPeoplePayload(conversationId);

    const response = await request.post(url, {
      headers: headers,
      data: payload,
    });

    expect(response.status()).toBe(200);
    logger.info(`Get people API called successfully`);
    const resp = await response.json();

    return resp;
  } catch (error) {
    logger.error(`Error in getStockPeopleApi: ${error.message}`);
    throw error;
  }
}
