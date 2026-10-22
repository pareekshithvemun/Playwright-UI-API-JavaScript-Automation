import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";
import { createContentConfigPayload } from "../payloads/createContentConfigPayload.js";

export async function createContentConfigApi(
  request,
  token,
  title,
  externalCourseId
) {
  try {
    let headersOfcreateContentConfigApi = headerData.createContentConfigHeaders(
      token,
      "application/json"
    );
    let respOfcreateContentConfigApi = await request.post(
      urlData.createContentConfigUrl,
      {
        data: createContentConfigPayload(title, externalCourseId),
        headers: headersOfcreateContentConfigApi,
      }
    );
    expect(respOfcreateContentConfigApi.status()).toBe(201);
    const resp = await respOfcreateContentConfigApi.text();
    return resp;
  } catch (error) {
    logger.info(`Failed to create content config due to error : ${error}`);
  }
}
