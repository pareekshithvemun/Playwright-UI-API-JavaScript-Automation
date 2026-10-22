import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { videoConsumptionPayLoad } from "../payloads/videoconsumptionpayload.js";
import { logger } from "../../../logger.js";

export async function videoConsumptionApi(
  request,
  token,
  courseUUID,
  videoUUID,
  content_type
) {
  try {
    let headersOfvideoConsumptionn = headerData.contentConsumptionHeaders(
      token,
      "application/json"
    );
    let respOfvideoConsumptionn = await request.post(
      urlData.contentConsumptionBaseUrl,
      {
        data: videoConsumptionPayLoad(
          courseUUID,
          videoUUID,
          content_type
        ),
        headers: headersOfvideoConsumptionn,
      }
    );
    expect(respOfvideoConsumptionn.status()).toBe(200);
    const resp = await respOfvideoConsumptionn.json();
    expect(resp[0].data.enrichmentConsumptionEvent.success).toBe(true);
    return resp;
    
  } catch (error) {
    logger.error(`Failed to consume Video due to: ${JSON.stringify(error)}`);
  }
}
