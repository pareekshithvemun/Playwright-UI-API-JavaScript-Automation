import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";

export async function getAllContentItemsApi(request, jwt) {

  try {
    let headersOfgetAllContentItemsApi = headerData.getAllContentItemsHeaders(jwt, "application/json");
    let respOfgetAllContentItemsApi = await request.get(urlData.getAllContentItemsUrl, {
      headers: headersOfgetAllContentItemsApi
    });
    expect(respOfgetAllContentItemsApi.status()).toBe(200);
    let resp = await respOfgetAllContentItemsApi.json();
    return resp;
  } catch (error) {
    logger.info(`Failed to get content Items due to error: ${error}`);
  }

}
