import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import {bookConsumptioPayLoad} from "../payloads/bookconsumptionpayload.js";
import { logger } from "../../../logger.js";


export async function bookConsumptioApi(request, token,contentUUID, content_type) {
  try {
    let headersOfBookConsumption= headerData.contentConsumptionHeaders(token,"application/json");
    let respOfBookConsumption= await request.post(urlData.contentConsumptionBaseUrl, {
      data: bookConsumptioPayLoad(contentUUID,content_type),
      headers: headersOfBookConsumption,
    });
    expect(respOfBookConsumption.status()).toBe(200);
    const resp = await respOfBookConsumption.json();
    expect(resp[0].data.enrichmentConsumptionEvent.success).toBe(true);
    return resp;
  } catch (error) {
    logger.error(`Failed to consume Book due to: ${error}`);
  }
}
