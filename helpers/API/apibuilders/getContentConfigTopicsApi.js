import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";

export async function getContentConfigTopicsApi(request, token, externalId) {
  try {
    let headersOfgetContentConfigTopicsApi =
      headerData.getContentConfigTopicsHeaders(token, "application/json");
    let respOfgetContentConfigTopicsApi = await request.get(
      urlData.getContentConfigTopicsUrl(externalId),
      {
        headers: headersOfgetContentConfigTopicsApi,
      }
    );
    expect(respOfgetContentConfigTopicsApi.status()).toBe(200);
    const resp = await respOfgetContentConfigTopicsApi.json();
    return resp;
  } catch (error) {
    logger.info(`Failed to get content config topics due to error : ${error}`);
  }
}
