import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";
import { addContentToDCBody } from "../../API/payloads/addContentToDCPayload.js";

export async function addContentToDynamicConApi(
  request,
  jwt,
  containerId,
  orgId,
  adminId,
  contentMap
) {
  try {
    let headersofaddContentToDynamicConApi = headerData.addContentToDCHeaders(
      jwt,
      "application/json"
    );
    let res = await request.post(urlData.addContentToDynamicConUrl, {
      headers: headersofaddContentToDynamicConApi,
      data: addContentToDCBody(
        containerId,
        orgId,
        adminId,
        contentMap
      ),
    });
    expect(res.status()).toBe(200);
    const resp = await res.json();
    logger.info(`Content has been saved to container id:${containerId}`);
    return resp;
  } catch (error) {
    logger.info(`Failed to save content due to error: ${error}`);
  }
}
