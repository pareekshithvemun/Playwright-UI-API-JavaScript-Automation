import { headerData, urlData, expect, logger } from "../../../path.js";

export async function fetchAllSitesApi(request, jwt) {
  try {
    const response = await request.get(urlData.fetchAllSitesUrl, {
      headers: headerData.getAllContentItemsHeaders(jwt, "application/json"),
    });
    expect(response.status()).toBe(200);
    const responseData = await response.json();
    logger.info(`Fetched ${responseData.length} sites`);
    return responseData;
  } catch (error) {
    logger.error(`Failed to fetch all sites: ${error.message}`);
    throw error;
  }
}
