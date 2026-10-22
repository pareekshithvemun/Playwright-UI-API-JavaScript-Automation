import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";

export async function getQAforUuidApi(request,uuid,token){

    try {
        let headersOfgetQAforUuidApi = headerData.extractQAapiHeaders(token);
        let respOfgetQAforUuidApi = await request.get(urlData.extractQAapiUrl(uuid), {
          headers: headersOfgetQAforUuidApi
        });
        expect(respOfgetQAforUuidApi.status()).toBe(200);
        const resp = await respOfgetQAforUuidApi.json();
        return resp;
      } catch (error) {
        logger.info(`Failed to get QA from uuid due to error : ${error}`);
      }
}