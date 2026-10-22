import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";

export async function publishContentConfigApi(
  request,
  token,
  contentConfigUUID,
  contentConfigName
) {
  try {
    let headersOfPublishContentConfigApi =
      headerData.publishContentConfigHeaders(token);
    let respOfpublishContentConfigApi = await request.post(
      urlData.publishContentConfigUrl(contentConfigUUID),
      {
        headers: headersOfPublishContentConfigApi,
      }
    );
    expect(respOfpublishContentConfigApi.status()).toBe(201);
    logger.info(`Published content config succesfully ${contentConfigName}`);
    return respOfpublishContentConfigApi;
  } catch (error) {
    logger.error(
      `Failed to publish content config with name ${contentConfigName} due to error : ${error}`
    );
  }
}
