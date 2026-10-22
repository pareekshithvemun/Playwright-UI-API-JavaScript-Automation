import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";
import { createLiveCoursePayload } from "../payloads/createLiveCoursePayload.js";

export async function createLiveCourse(request,token,title,description,additionalNotes,locationUuid,classroomUuid,imageUrl){
  let resp;
    try {
        let headersOfcreateLiveCourse = headerData.createLiveCourseHeaders(token,"application/json");
        let payload = await createLiveCoursePayload(title, description,additionalNotes,locationUuid,classroomUuid,imageUrl);
        let respOfcreateLiveCourse  = await request.post(urlData.createLiveCourseUrl, {
          data:payload,
          headers: headersOfcreateLiveCourse,
        });
        resp = await respOfcreateLiveCourse.json();
        expect(respOfcreateLiveCourse.status()).toBe(200);
        logger.info(`ILT Course has been created with title ${title}`);
        let liveCourseUUID= resp.liveCourseUuid;
        return liveCourseUUID;
      } catch (error) {
        logger.error(resp);
        logger.error(`Failed to create course ${title} due to error : ${JSON.stringify(error)}`);
      }
}