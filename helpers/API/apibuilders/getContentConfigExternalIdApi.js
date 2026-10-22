import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";

export async function getContentConfigExternalIdApi(request, token, contentConfigId){

    try {
        let headersOfgetContentConfigExternalIdApi = headerData.getContentConfigExternalIdHeaders(token, "application/json");
        let respOfgetContentConfigExternalIdApi = await request.get(urlData.getContentConfigExternalIdUrl(contentConfigId), {
          headers: headersOfgetContentConfigExternalIdApi
        });
        expect(respOfgetContentConfigExternalIdApi.status()).toBe(200);
        const resp = await respOfgetContentConfigExternalIdApi.json();
        return resp;
      } catch (error) {
        logger.info(`Failed to get external id due to error : ${error}`);
      }

}
