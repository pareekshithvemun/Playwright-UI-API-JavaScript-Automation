import { headerData } from "../headers/allHeaders.js";
import { urlData } from "../url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";
import {addAudienceToDCBody} from "../../API/payloads/addAudienceToDCPayload.js";


export async function addAudienceToDynamicContentApi(
  request,
  jwt,audid,dynamicContentID
) {
  try {
    let headersofaddAudienceToDynamicContentApi = headerData.addAudienceToDynamicContentHeaders(
      jwt,
      "application/json"
    );
    let res = await request.put(urlData.addAudienceToDynamicContentUrl(dynamicContentID), {
      headers: headersofaddAudienceToDynamicContentApi,
      data: addAudienceToDCBody(audid),
    });
    expect(res.status()).toBe(200);
    const resp = await res.json();
    logger.info(`Audience has been added to dynamicContentID id:${dynamicContentID}`);
    return resp;
  } catch (error) {
    logger.info(`Failed to add audience to dynamicContentID due to error: ${error}`);
  }
}
