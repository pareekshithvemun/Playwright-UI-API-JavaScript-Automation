import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";
import { draftContentConfigBody } from "../payloads/draftContentConfigPayload.js";

export async function draftContentConfigApi(
  request,
  token,
  courseId,
  duration,
  topics
) {
  try {
    let headersOfdraftContentConfigApi = headerData.draftContentConfigHeaders(
      token,
      "application/json"
    );
    let respOfdraftContentConfigApi = await request.post(
      urlData.draftContentConfigUrl,
      {
        data: draftContentConfigBody(courseId, duration, topics),
        headers: headersOfdraftContentConfigApi,
      }
    );
    expect(respOfdraftContentConfigApi.status()).toBe(201);
    const resp = await respOfdraftContentConfigApi.text();
    return resp;
  } catch (error) {
    logger.info(`Failed to draft the content config due to error:${error}`);
  }
}
