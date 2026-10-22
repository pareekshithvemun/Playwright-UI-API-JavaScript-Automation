import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { courseConsumptionPayLoad } from "../payloads/courseConsumptionpayload.js";
import { logger } from "../../../logger.js";

export async function courseConsumptionApi(
  request,
  token,
  courseUUID,
  videoUUID,
  content_type
) {
  try {
    let headersOfCourseConsumption = headerData.contentConsumptionHeaders(
      token,
      "application/json"
    );
    let respOfCourseConsumptionn = await request.post(
      urlData.courseConsumptionUrl,
      {
        data: courseConsumptionPayLoad(
          courseUUID,
          videoUUID,
          content_type
        ),
        headers: headersOfCourseConsumption,
      }
    );
    expect(respOfCourseConsumptionn.status()).toBe(200);
    const resp = await respOfCourseConsumptionn.json();
    expect(resp[0].data.enrichmentLaunchEvent.success).toBe(true);
    expect(resp[1].data.enrichmentLaunchEvent.success).toBe(true);
    return resp;
    
  } catch (error) {
    logger.error(`Failed to consume Course due to error: ${JSON.stringify(error)}`);
  }
}
