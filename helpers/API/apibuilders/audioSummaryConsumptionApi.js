import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import {audioSummaryConsumptioPayLoad} from "../payloads/audioSummaryConsumptionpayload.js";
import { logger } from "../../../logger.js";


export async function audioSummaryConsumptionApi(request, token,contentUUID, content_type) {
  try {
    let headersOfaudioSummaryConsumption= headerData.contentConsumptionHeaders(token,"application/json");
    let response= await request.post(urlData.contentConsumptionBaseUrl, {
      data: audioSummaryConsumptioPayLoad(contentUUID,content_type),
      headers: headersOfaudioSummaryConsumption,
    });
    expect(response.status()).toBe(200);
    const resp =  await response.json();
    expect(resp[0].data.enrichmentConsumptionEvent.success).toBe(true);
    return resp;
  } catch (error) {
    logger.info(`Failed to consume Audio Summary  due to: ${JSON.stringify(error)}`);
  }
}
