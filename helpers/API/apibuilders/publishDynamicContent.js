import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";

export async function publishDynamicContentApi(request, jwt, assetid,title) {
  try {
    let headerofpublishDynamicContent =
      headerData.publishDynamicContentHeaders(jwt);
    let resofpublishDynamicContent = await request.post(
      urlData.publishDynamicContentUrl(assetid),
      {
        headers: headerofpublishDynamicContent,
      }
    );
    expect(resofpublishDynamicContent.status()).toBe(200);
    const resp = await resofpublishDynamicContent.json();
    logger.info(`DynamicContent with title ${title} has been published, its id ${assetid}`)
    return resp;
  } catch (error) {
    logger.error(
      `Failed to publish dynamic content  ${assetid} due to ${JSON.stringify(
        error
      )}`
    );
  }
}
