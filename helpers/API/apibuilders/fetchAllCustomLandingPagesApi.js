import { headerData, urlData, expect, logger } from "../../../path.js";

// Fetch all custom landing pages templates
export async function fetchAllCustomLandingPagesApi(request, jwt) {
  try {
    const headers = headerData.fetchAllCustomLandingPagesHeaders(jwt);
    const res = await request.get(urlData.fetchAllCustomLandingPagesUrl, {
      headers: headers,
    });
    expect(res.status()).toBe(200);
    const resp = await res.json();
    logger.info(`Fetched ${resp.totalItems || 0} custom landing pages`);
    return resp.metadata || [];
  } catch (error) {
    logger.info(`Failed to fetch custom landing pages: ${error}`);
    throw error;
  }
}
