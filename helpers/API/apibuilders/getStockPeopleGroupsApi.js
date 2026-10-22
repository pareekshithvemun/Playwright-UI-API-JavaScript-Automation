import {
  urlData,
  headerData,
  getStockPeopleGroupsPayload,
  logger,
  expect,
} from "../../../path.js";

export async function getStockPeopleGroupsApi(request, jwt, locale = "en-US") {
  try {
    const url = urlData.caisyPresentationsGraphqlUrl;
    const headers = headerData.caisyPresentationsGraphqlHeaders(
      jwt,
      "application/json"
    );
    const payload = getStockPeopleGroupsPayload(locale);

    const response = await request.post(url, {
      headers: headers,
      data: payload,
    });

    expect(response.status()).toBe(200);
    logger.info(`Get stock people groups API called successfully`);
    const resp = await response.json();

    return resp;
  } catch (error) {
    logger.error(`Error in getStockPeopleGroupsApi: ${error.message}`);
    throw error;
  }
}
