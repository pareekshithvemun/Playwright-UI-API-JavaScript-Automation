import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";
import {publishLiveCoursePayload} from "../payloads/publishLiveCoursePayload.js"

export async function publishLiveCourse(request,token,liveCourseUuid){
    try {
        let headersOfPublishLiveCourse = headerData.publishLiveCourseHeaders(token,"application/json");
        let payload = await publishLiveCoursePayload();
        let respOfPublishLiveCourse  = await request.put(urlData.publishLiveCourseUrl(liveCourseUuid), {
          data:payload,
          headers: headersOfPublishLiveCourse,
        });
        expect(respOfPublishLiveCourse.status()).toBe(200);
        let resp = await respOfPublishLiveCourse.json();
        let liveCourseUUID= resp.liveCourseUuid;
        return liveCourseUUID;
      } catch (error) {
        logger.error(`Failed to publish course ${liveCourseUuid} due to error : ${error}`);
      }
}