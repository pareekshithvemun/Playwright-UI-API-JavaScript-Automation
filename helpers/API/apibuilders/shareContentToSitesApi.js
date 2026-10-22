import {
  headerData,
  urlData,
  shareContentToSitesPayload,
  expect,
  logger,
} from "../../../path.js";

// PUT replaces sharedTo. Callers must pass every child org that should keep the share.
export async function shareContentToSitesApi(
  request,
  jwt,
  createdBy,
  sharedFrom,
  contentItemUuid,
  sharedToArray
) {
  try {
    const payload = shareContentToSitesPayload(
      createdBy,
      sharedFrom,
      contentItemUuid,
      sharedToArray
    );
    const response = await request.put(
      urlData.shareContentToSitesUrl(contentItemUuid),
      {
        data: payload,
        headers: headerData.getAllContentItemsHeaders(jwt, "application/json"),
      }
    );
    expect(response.status()).toBe(200);
    const responseData = await response.json();
    logger.info(
      `Shared content to ${sharedToArray.length} sites - ${responseData.message}`
    );
    return { success: true, ...responseData };
  } catch (error) {
    logger.error(`Failed to share content: ${error.message}`);
    throw error;
  }
}
