import { headerData, urlData, expect, logger } from "../../../path.js";

// Delete custom landing page (draft or published)
export async function deleteCustomLandingPageApi(request, jwt, parentPageUuid) {
  try {
    const headers = headerData.deleteCustomLandingPageHeaders(jwt);
    const res = await request.delete(
      urlData.deleteCustomLandingPageUrl(parentPageUuid),
      {
        headers: headers,
      }
    );
    expect(res.status()).toBe(200);
    const resp = await res.json();
    logger.info(`Deleted custom landing page: ${parentPageUuid}`);
    return resp;
  } catch (error) {
    logger.info(
      `Failed to delete custom landing page ${parentPageUuid}: ${error}`
    );
  }
}
