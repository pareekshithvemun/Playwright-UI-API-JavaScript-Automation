import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";
import { createLiveClassPayload } from "../payloads/createLiveClassPayload.js";

export async function createLiveClass(
  request,
  token,
  title,
  liveCourseUUID,
  classType,
  meetingUrl,
  imageUrl,
  instructorUuid,
  locationUuid,
  classroomUuid,
  randomUUID
) {
  try {
    let headersOfcreateLiveClass = headerData.createLiveClassHeaders(
      token,
      "application/json"
    );
    let payload = await createLiveClassPayload(
      title,
      liveCourseUUID,
      classType,
      meetingUrl,
      imageUrl,
      instructorUuid,
      locationUuid,
      classroomUuid,
      randomUUID
    );
    let respOfcreateLiveClass = await request.post(urlData.createLiveClassUrl, {
      data: payload,
      headers: headersOfcreateLiveClass,
    });
    expect(respOfcreateLiveClass.status()).toBe(200);

    await respOfcreateLiveClass.json();
    logger.info(`Class ${title} has been added to ILT ${liveCourseUUID}`);
  } catch (error) {
    logger.error(`Failed to create class ${title} due to error : ${error}`);
  }
}
