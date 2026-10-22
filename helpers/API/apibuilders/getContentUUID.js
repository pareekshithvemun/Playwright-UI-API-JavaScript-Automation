import {
  headerData,
  urlData,
  expect,
  getContentUUIdpayload,
  logger,
  reusableFunctions,
} from "../../../path.js";

export async function getContentUUIdsApi(
  request,
  jwt,
  orgid,
  adminUserId,
  contentsize,
  maxRetries = 10,
  retryDelayMs = 20000,
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      let headersOfgetcontentUUIDs = headerData.getcontentUUIDsHeader(
        jwt,
        "application/json",
      );
      let responseOfgetcontentUUIDs = await request.post(
        urlData.getcontentUUIDsUrl,
        {
          data: getContentUUIdpayload(orgid, adminUserId, contentsize),
          headers: headersOfgetcontentUUIDs,
        },
      );
      expect(responseOfgetcontentUUIDs.status()).toBe(200);
      const resp = await responseOfgetcontentUUIDs.json();
      const entries = Array.isArray(resp) ? resp : [resp];
      const errorEntry = entries.find((e) => e.errors && e.data === null);
      if (errorEntry) {
        logger.error(
          `API returned error body: ${JSON.stringify(errorEntry, null, 2)}`,
        );
        throw new Error(errorEntry.errors.map((e) => e.message).join("; "));
      }
      logger.info(
        `*************Successfully fetched content UUIDs in attempt ${attempt}****************`,
      );
      return resp;
    } catch (error) {
      if (attempt < maxRetries) {
        logger.warn(
          `Attempt ${attempt}/${maxRetries} failed to get content UUID's: ${error.message}. Retrying in ${retryDelayMs}ms...`,
        );
        await reusableFunctions.setTimer(retryDelayMs);
      } else {
        logger.error(
          `Failed to get content UUID's after ${maxRetries} attempts: ${error}`,
        );
      }
    }
  }
}
