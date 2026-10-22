import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";
import { publishContainerBody } from "../payloads/publishContainerpayload.js";

export async function publishContainerApi(
  request,
  token,
  containerId,
  orgId,
  adminId
) {
  try {
    let headersOfpublishContainerApi = headerData.publishContainerHeaders(
      token,
      "application/json"
    );
    let respOfpublishContainerApi = await request.post(
      urlData.publishContainerUrl,
      {
        data: publishContainerBody(containerId, orgId, adminId),
        headers: headersOfpublishContainerApi,
      }
    );
    expect(respOfpublishContainerApi.status()).toBe(200);
    const resp = await respOfpublishContainerApi.json();
    logger.info(`Container has been published and its id ${containerId}`)
    return resp;
  } catch (error) {
    logger.error(
      `Failed to publish container ${containerId}  due to error : ${error}`
    );
  }
}
