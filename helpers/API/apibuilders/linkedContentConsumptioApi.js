import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { linkedContentConsumptioBody } from "../payloads/linkedContentConsumptionpayload.js";
import { logger } from "../../../logger.js";

export async function linkedContentConsumptioApi(
  request,
  token,
  contentUUID, content_type
) {
  try {
    let headersOflinkedContentConsumption = headerData.contentConsumptionHeaders(
      token,
      "application/json"
    );
    let respOflinkedContentConsumption = await request.post(
      urlData.contentConsumptionBaseUrl,
      {
        data: linkedContentConsumptioBody(contentUUID, content_type),
        headers: headersOflinkedContentConsumption,
      }
    );
    expect(respOflinkedContentConsumption.status()).toBe(200);
    const resp = await respOflinkedContentConsumption.json();
    expect(resp[1].data.enrichmentConsumptionEvent.success).toBe(true);
    return resp;
    
  } catch (error) {
    logger.error(`Failed to consume Linked Content due to: ${JSON.stringify(error)}`);
  }
}
