import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { bookSummaryConsumptioPayLoad } from "../payloads/bookSummaryconsumptionpayload.js";
import { logger } from "../../../logger.js";

export async function bookSummaryConsumptionApi(
  request,
  token,
  contentUUID,
  content_type
) {
  try {
    let headersOfbookSummaryConsumptionApi =headerData.contentConsumptionHeaders(token, "application/json");
    let respOfbookSummaryConsumption= await request.post(
      urlData.contentConsumptionBaseUrl,
      {
        data: bookSummaryConsumptioPayLoad(contentUUID, content_type),
        headers: headersOfbookSummaryConsumptionApi,
      }
    );
    expect(respOfbookSummaryConsumption.status()).toBe(200);
    const resp = await respOfbookSummaryConsumption.json();
    expect(resp[0].data.enrichmentConsumptionEvent.success).toBe(true);
    return resp;
  } catch (error) {
    logger.info(`Failed to consume bookSummaries due to: ${error}`);
  }
}
