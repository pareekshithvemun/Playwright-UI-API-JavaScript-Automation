import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import {audioBookConsumptioPayLoad} from "../payloads/audioBookconsumptionpayload.js";
import { logger } from "../../../logger.js";


export async function audioBookConsumptioApi(request, token,contentUUID, content_type) {
  try {
    let headersOfaudioBookConsumption= headerData.contentConsumptionHeaders(token,"application/json");
    let respOfaudioBookConsumption= await request.post(urlData.contentConsumptionBaseUrl, {
      data: audioBookConsumptioPayLoad(contentUUID,content_type),
      headers: headersOfaudioBookConsumption,
    });
    expect(respOfaudioBookConsumption.status()).toBe(200);
    const resp = await respOfaudioBookConsumption.json();
    expect(resp[0].data.enrichmentConsumptionEvent.success).toBe(true);
    return resp;
  } catch (error) {
    logger.info(`Failed to consume Audio Book due to: ${error}`);
  }
}
